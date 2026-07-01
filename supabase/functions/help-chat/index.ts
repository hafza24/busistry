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
    const openrouterKey = Deno.env.get("OPENROUTER_API_KEY");
    if (!openrouterKey) return json({ error: "AI not configured (missing OPENROUTER_API_KEY)" }, 500);

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

    // Call OpenRouter directly (free model)
    const aiRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openrouterKey}`,
        "HTTP-Referer": "https://busistry.lovable.app",
        "X-Title": "Busistree Help Center",
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-exp:free",
        messages,
        stream: true,
      }),
    });

    if (!aiRes.ok) {
      const text = await aiRes.text();
      if (aiRes.status === 429) return json({ error: "Rate limited, try again shortly" }, 429);
      if (aiRes.status === 402) return json({ error: "AI credits exhausted" }, 402);
      return json({ error: `AI error: ${text.slice(0, 200)}` }, 500);
    }

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
