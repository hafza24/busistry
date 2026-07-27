// WhatsApp Cloud API webhook: verification (GET) + inbound events (POST)
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const VERIFY_TOKEN = Deno.env.get("WHATSAPP_VERIFY_TOKEN") ?? "";
const APP_SECRET = Deno.env.get("WHATSAPP_APP_SECRET") ?? "";

async function verifySignature(rawBody: string, signature: string | null) {
  if (!APP_SECRET || !signature) return true; // allow if not configured yet
  const sig = signature.replace(/^sha256=/, "");
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(APP_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(rawBody));
  const hex = Array.from(new Uint8Array(mac))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hex === sig;
}

async function upsertContact(waId: string, profileName?: string) {
  const { data } = await supabase
    .from("crm_contacts")
    .select("id")
    .eq("wa_id", waId)
    .maybeSingle();
  if (data) return data.id as string;
  const { data: created, error } = await supabase
    .from("crm_contacts")
    .insert({ wa_id: waId, profile_name: profileName ?? null, name: profileName ?? null })
    .select("id")
    .single();
  if (error) throw error;
  return created.id as string;
}

async function getOrCreateOpenConversation(contactId: string, now: string) {
  const { data } = await supabase
    .from("crm_conversations")
    .select("id, status")
    .eq("contact_id", contactId)
    .neq("status", "closed")
    .order("last_message_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (data) return data.id as string;
  const { data: created, error } = await supabase
    .from("crm_conversations")
    .insert({
      contact_id: contactId,
      status: "open",
      last_message_at: now,
      window_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    })
    .select("id")
    .single();
  if (error) throw error;
  return created.id as string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const url = new URL(req.url);

  // Meta verification handshake
  if (req.method === "GET") {
    const mode = url.searchParams.get("hub.mode");
    const token = url.searchParams.get("hub.verify_token");
    const challenge = url.searchParams.get("hub.challenge");
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      return new Response(challenge ?? "", { status: 200 });
    }
    return new Response("Forbidden", { status: 403 });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const rawBody = await req.text();
  const sig = req.headers.get("x-hub-signature-256");
  const valid = await verifySignature(rawBody, sig);
  if (!valid) {
    console.error("Invalid webhook signature");
    return new Response("Invalid signature", { status: 401 });
  }

  let payload: any;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return new Response("Bad JSON", { status: 400 });
  }

  try {
    const entries = payload?.entry ?? [];
    for (const entry of entries) {
      for (const change of entry.changes ?? []) {
        const value = change.value ?? {};
        const now = new Date().toISOString();

        // Inbound messages
        for (const msg of value.messages ?? []) {
          const waId = msg.from as string;
          const profileName = value.contacts?.[0]?.profile?.name;
          const contactId = await upsertContact(waId, profileName);
          const conversationId = await getOrCreateOpenConversation(contactId, now);

          const type = msg.type ?? "text";
          const content: Record<string, unknown> = { raw: msg };
          if (type === "text") content.text = msg.text?.body;

          const { data: insertedMsg } = await supabase
            .from("crm_messages")
            .insert({
              conversation_id: conversationId,
              contact_id: contactId,
              wa_message_id: msg.id,
              direction: "in",
              type,
              content,
              status: "delivered",
            })
            .select("id")
            .single();

          await supabase
            .from("crm_conversations")
            .update({
              last_message_at: now,
              window_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
              status: "open",
            })
            .eq("id", conversationId);

          await supabase.rpc; // no-op reference to avoid unused warnings
          await supabase
            .from("crm_contacts")
            .update({
              last_message_at: now,
              last_inbound_at: now,
              unread_count: 1, // will be reset when opened; keep simple for phase 1
              profile_name: profileName ?? null,
            })
            .eq("id", contactId);

          console.log("Inbound message stored", insertedMsg?.id);
        }

        // Status updates for outbound messages
        for (const st of value.statuses ?? []) {
          const patch: Record<string, unknown> = { status: st.status };
          if (st.errors?.[0]?.title) patch.error = st.errors[0].title;
          await supabase
            .from("crm_messages")
            .update(patch)
            .eq("wa_message_id", st.id);
          await supabase
            .from("crm_broadcast_recipients")
            .update(patch)
            .eq("wa_message_id", st.id);
        }
      }
    }
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("webhook error", err);
    // Ack anyway so Meta doesn't retry storm; log for triage
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
