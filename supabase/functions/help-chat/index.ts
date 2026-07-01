// Streaming Help Center AI chat backed by Lovable AI Gateway
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface ChatMsg { role: "user" | "assistant" | "admin" | "system"; content: string }

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const jwt = authHeader.replace("Bearer ", "");
    if (!jwt) return json({ error: "Unauthorized" }, 401);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableKey = Deno.env.get("LOVABLE_API_KEY");
    const geminiKey = Deno.env.get("GEMINI_API_KEY");
    const groqKey = Deno.env.get("GROQ_API_KEY");
    const mistralKey = Deno.env.get("MISTRAL_API_KEY");
    const openrouterKey = Deno.env.get("OPENROUTER_API_KEY");

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: `Bearer ${jwt}` } },
    });
    const admin = createClient(supabaseUrl, serviceKey);

    const { data: userData } = await userClient.auth.getUser();
    const user = userData?.user;
    if (!user) return json({ error: "Unauthorized" }, 401);

    const { threadId, message } = await req.json();
    if (!threadId || !message || typeof message !== "string" || message.length > 4000) {
      return json({ error: "Invalid input" }, 400);
    }

    // Verify thread ownership + AI mode
    const { data: thread, error: tErr } = await admin
      .from("chat_threads").select("*").eq("id", threadId).maybeSingle();
    if (tErr || !thread) return json({ error: "Thread not found" }, 404);
    if (thread.user_id !== user.id) return json({ error: "Forbidden" }, 403);
    if (thread.mode !== "ai") return json({ error: "Thread is in human mode" }, 400);

    // Save user message
    await admin.from("chat_messages").insert({
      thread_id: threadId, role: "user", content: message, author_id: user.id,
    });

    // Auto-escalate: if the user asks for a human/admin/agent/support person,
    // switch the thread to human mode and stream a short confirmation instead
    // of calling the AI. Admins will see it in the support inbox.
    const escalateRegex = /\b(human|agent|admin|support\s*(agent|person|rep|representative)?|real\s*person|live\s*(chat|agent|person)|talk\s*to\s*(someone|a\s*human|a\s*person|support)|customer\s*(service|support|care)|contact\s*support|speak\s*to\s*(someone|human|agent))\b/i;
    if (escalateRegex.test(message)) {
      await admin.from("chat_threads").update({
        mode: "human",
        last_message_at: new Date().toISOString(),
        ...(thread.title === "New conversation" ? { title: message.slice(0, 60) } : {}),
      }).eq("id", threadId);

      await admin.from("chat_messages").insert({
        thread_id: threadId, role: "system",
        content: "Escalated to a human agent. An admin will reply here shortly.",
      });

      const reply = "I've forwarded your request to our human support team. An admin will reply here shortly — you'll see their messages appear in this same chat.";
      await admin.from("chat_messages").insert({
        thread_id: threadId, role: "assistant", content: reply,
      });

      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode(reply));
          controller.close();
        },
      });
      return new Response(stream, {
        headers: { ...corsHeaders, "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    // Load history
    const { data: history } = await admin
      .from("chat_messages").select("role, content")
      .eq("thread_id", threadId).order("created_at").limit(30);

    // Load help articles context
    const { data: articles } = await admin
      .from("help_articles").select("title, excerpt, content, tags")
      .eq("is_published", true).limit(40);

    const knowledge = (articles || []).map((a) =>
      `# ${a.title}\n${a.excerpt || ""}\n${(a.content || "").slice(0, 1500)}`
    ).join("\n\n---\n\n");

    const systemPrompt = `You are the Busistree Help Center assistant. Answer using the knowledge base below.
Be concise, friendly, and use markdown. If unsure, say so and suggest the user escalate to a human by clicking "Talk to a human" in the chat header.

KNOWLEDGE BASE:
${knowledge || "(No articles available yet.)"}`;

    const messages: ChatMsg[] = [
      { role: "system", content: systemPrompt },
      ...((history || []) as ChatMsg[]).map((m) => ({
        role: m.role === "admin" ? "assistant" as const : m.role,
        content: m.content,
      })),
    ];

    // Update thread activity
    await admin.from("chat_threads").update({ last_message_at: new Date().toISOString() }).eq("id", threadId);

    // Auto-title from first user message
    if (thread.title === "New conversation") {
      await admin.from("chat_threads").update({ title: message.slice(0, 60) }).eq("id", threadId);
    }

    // Ordered provider fallback chain. Tries each in order; on rate-limit,
    // quota, auth, or 5xx errors, moves to the next configured provider.
    type Provider = { name: string; url: string; key: string; model: string; extraHeaders?: Record<string, string> };
    const providers: Provider[] = [];
    if (lovableKey) providers.push({
      name: "lovable", model: "google/gemini-2.5-flash", key: lovableKey,
      url: "https://ai.gateway.lovable.dev/v1/chat/completions",
    });
    if (geminiKey) providers.push({
      name: "gemini", model: "gemini-2.0-flash", key: geminiKey,
      url: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
    });
    if (groqKey) providers.push({
      name: "groq", model: "llama-3.3-70b-versatile", key: groqKey,
      url: "https://api.groq.com/openai/v1/chat/completions",
    });
    if (mistralKey) providers.push({
      name: "mistral", model: "mistral-small-latest", key: mistralKey,
      url: "https://api.mistral.ai/v1/chat/completions",
    });
    if (openrouterKey) providers.push({
      name: "openrouter", model: "google/gemini-2.0-flash-exp:free", key: openrouterKey,
      url: "https://openrouter.ai/api/v1/chat/completions",
      extraHeaders: { "HTTP-Referer": "https://busistry.lovable.app", "X-Title": "Busistree Help Center" },
    });

    if (providers.length === 0) return json({ error: "No AI provider configured" }, 500);

    let aiRes: Response | null = null;
    let usedProvider = "";
    const failures: string[] = [];
    for (const p of providers) {
      try {
        const res = await fetch(p.url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${p.key}`,
            ...(p.extraHeaders || {}),
          },
          body: JSON.stringify({ model: p.model, messages, stream: true }),
        });
        // Retry on: 401/403 (bad/expired key), 402 (credits), 429 (rate),
        // 5xx (upstream). 400 = bad request, don't loop.
        if (res.ok) { aiRes = res; usedProvider = p.name; break; }
        const txt = await res.text().catch(() => "");
        failures.push(`${p.name}:${res.status}`);
        console.log(`[help-chat] ${p.name} failed ${res.status}: ${txt.slice(0, 200)}`);
        if (res.status === 400) { /* bad request — don't try others with same body unless auth */ }
      } catch (e) {
        failures.push(`${p.name}:network`);
        console.log(`[help-chat] ${p.name} network error: ${(e as Error).message}`);
      }
    }

    if (!aiRes) {
      return json({ error: `All AI providers failed: ${failures.join(", ")}` }, 502);
    }
    console.log(`[help-chat] using provider: ${usedProvider}`);

    let fullText = "";
    const stream = new ReadableStream({
      async start(controller) {
        const reader = aiRes.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";
            for (const line of lines) {
              if (!line.startsWith("data: ")) continue;
              const data = line.slice(6).trim();
              if (data === "[DONE]") continue;
              try {
                const j = JSON.parse(data);
                const delta = j.choices?.[0]?.delta?.content;
                if (delta) {
                  fullText += delta;
                  controller.enqueue(new TextEncoder().encode(delta));
                }
              } catch { /* ignore */ }
            }
          }
        } finally {
          // Persist assistant reply
          if (fullText) {
            await admin.from("chat_messages").insert({
              thread_id: threadId, role: "assistant", content: fullText,
            });
            await admin.from("chat_threads").update({ last_message_at: new Date().toISOString() }).eq("id", threadId);
          }
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: { ...corsHeaders, "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
