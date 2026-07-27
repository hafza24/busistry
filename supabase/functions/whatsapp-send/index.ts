// Send a WhatsApp message via Meta Cloud API. Admin-only.
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3";

const PHONE_ID = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID")!;
const ACCESS_TOKEN = Deno.env.get("WHATSAPP_ACCESS_TOKEN")!;
const GRAPH_URL = `https://graph.facebook.com/v20.0/${PHONE_ID}/messages`;

const admin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const Body = z.object({
  contact_id: z.string().uuid(),
  text: z.string().min(1).max(4096),
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const userClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } },
  );
  const token = authHeader.replace("Bearer ", "");
  const { data: claims } = await userClient.auth.getClaims(token);
  const userId = claims?.claims?.sub as string | undefined;
  if (!userId) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const { data: isAdmin } = await admin.rpc("has_role", { _user_id: userId, _role: "admin" });
  if (!isAdmin) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: parsed.error.flatten() }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const { contact_id, text } = parsed.data;

  const { data: contact, error: cErr } = await admin
    .from("crm_contacts")
    .select("id, wa_id")
    .eq("id", contact_id)
    .single();
  if (cErr || !contact) {
    return new Response(JSON.stringify({ error: "Contact not found" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { data: convo } = await admin
    .from("crm_conversations")
    .select("id")
    .eq("contact_id", contact.id)
    .neq("status", "closed")
    .order("last_message_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  let conversationId = convo?.id as string | undefined;
  if (!conversationId) {
    const { data: created } = await admin
      .from("crm_conversations")
      .insert({ contact_id: contact.id, status: "open", last_message_at: new Date().toISOString() })
      .select("id")
      .single();
    conversationId = created!.id;
  }

  // Queued message row first
  const { data: msgRow, error: mErr } = await admin
    .from("crm_messages")
    .insert({
      conversation_id: conversationId,
      contact_id: contact.id,
      direction: "out",
      type: "text",
      content: { text },
      status: "queued",
      sent_by: userId,
    })
    .select("id")
    .single();
  if (mErr) {
    return new Response(JSON.stringify({ error: mErr.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Call Meta
  const res = await fetch(GRAPH_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: contact.wa_id,
      type: "text",
      text: { body: text },
    }),
  });
  const body = await res.text();
  if (!res.ok) {
    console.error(`WA send failed [${res.status}]: ${body}`);
    await admin.from("crm_messages").update({ status: "failed", error: body }).eq("id", msgRow.id);
    return new Response(JSON.stringify({ error: "Provider request failed", status: res.status, details: body }), {
      status: res.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const parsedBody = JSON.parse(body);
  const waId = parsedBody?.messages?.[0]?.id ?? null;
  await admin
    .from("crm_messages")
    .update({ status: "sent", wa_message_id: waId })
    .eq("id", msgRow.id);
  const now = new Date().toISOString();
  await admin
    .from("crm_conversations")
    .update({ last_message_at: now })
    .eq("id", conversationId);
  await admin
    .from("crm_contacts")
    .update({ last_message_at: now })
    .eq("id", contact.id);

  return new Response(JSON.stringify({ ok: true, wa_message_id: waId }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
