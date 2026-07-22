import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";

interface Body {
  screenshot_url?: string;
  storage_path?: string;
  expected_amount?: number;
  expected_recipient?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) {
      return json({ error: "Missing auth" }, 401);
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) return json({ error: "AI gateway not configured" }, 500);

    const anon = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await anon.auth.getUser();
    if (userErr || !userData.user) return json({ error: "Unauthorized" }, 401);

    const body: Body = await req.json();
    if (!body.screenshot_url && !body.storage_path) {
      return json({ error: "screenshot_url or storage_path required" }, 400);
    }

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    // Resolve file bytes → base64
    let mime = "image/jpeg";
    let base64 = "";

    let path = body.storage_path;
    if (!path && body.screenshot_url) {
      // extract path after `/payment-screenshots/`
      const m = body.screenshot_url.match(/payment-screenshots\/(.+)$/);
      if (m) path = decodeURIComponent(m[1]);
    }

    if (path) {
      const { data: file, error: dlErr } = await admin.storage
        .from("payment-screenshots")
        .download(path);
      if (dlErr || !file) return json({ error: "Cannot read receipt file" }, 400);
      mime = file.type || mime;
      const buf = new Uint8Array(await file.arrayBuffer());
      base64 = base64Encode(buf);
    } else if (body.screenshot_url) {
      const r = await fetch(body.screenshot_url);
      if (!r.ok) return json({ error: "Cannot fetch receipt URL" }, 400);
      mime = r.headers.get("content-type") || mime;
      base64 = base64Encode(new Uint8Array(await r.arrayBuffer()));
    }

    if (mime === "application/pdf") {
      // Skip OCR on PDFs — admin will verify manually
      return json({
        status: "pending",
        amount: null,
        transaction_id: null,
        notes: "PDF receipts are reviewed manually by our team.",
      });
    }

    const expected = body.expected_amount ?? null;
    const recipient = body.expected_recipient ?? "Busistree";

    const prompt = `You are a receipt OCR agent for Pakistani mobile-wallet payments (JazzCash, Easypaisa, bank transfer).
Extract from the receipt image and reply with ONLY JSON matching this schema:
{
  "amount": number | null,           // PKR amount actually transferred
  "transaction_id": string | null,   // TID / TRX ID / reference number
  "sender_name": string | null,
  "recipient_name": string | null,
  "payment_method": string | null,   // e.g. "JazzCash", "Easypaisa", "Bank Transfer"
  "date": string | null,             // ISO date if visible
  "confidence": number,              // 0..1
  "readable": boolean                // false if image is blurry/not a receipt
}
Do NOT include any prose, markdown, or code fences.`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": LOVABLE_API_KEY,
      },
      body: JSON.stringify({
        model: "google/gemini-3.6-flash",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: `data:${mime};base64,${base64}` } },
            ],
          },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      console.error("AI gateway error", aiRes.status, errText);
      return json({ error: "OCR failed", status: aiRes.status, details: errText }, aiRes.status);
    }

    const aiJson = await aiRes.json();
    const content = aiJson.choices?.[0]?.message?.content ?? "{}";
    let parsed: any = {};
    try {
      parsed = JSON.parse(content);
    } catch {
      const m = content.match(/\{[\s\S]*\}/);
      if (m) { try { parsed = JSON.parse(m[0]); } catch {} }
    }

    const amount = typeof parsed.amount === "number" ? parsed.amount : null;
    const tid = typeof parsed.transaction_id === "string" ? parsed.transaction_id.trim() : null;

    // Decide verdict
    let status: "match" | "mismatch" | "unreadable" | "pending" = "pending";
    const notes: string[] = [];

    if (parsed.readable === false) {
      status = "unreadable";
      notes.push("Image was not clearly readable — please upload a sharper screenshot.");
    } else {
      const amountOk =
        expected != null && amount != null && Math.abs(amount - expected) < 1;
      const tidOk = !!tid && tid.length >= 4;
      const recipientOk =
        !parsed.recipient_name ||
        parsed.recipient_name.toLowerCase().includes(recipient.toLowerCase().slice(0, 5));

      if (amountOk && tidOk && recipientOk) {
        status = "match";
      } else {
        status = "mismatch";
        if (expected != null && amount != null && !amountOk) {
          notes.push(`Amount on receipt (PKR ${amount.toLocaleString()}) does not match expected PKR ${expected.toLocaleString()}.`);
        }
        if (expected != null && amount == null) notes.push("Could not detect the amount on the receipt.");
        if (!tidOk) notes.push("Transaction ID was not detected or looks too short.");
        if (!recipientOk) notes.push(`Recipient does not appear to be “${recipient}”.`);
      }
    }

    return json({
      status,
      amount,
      transaction_id: tid,
      payment_method: parsed.payment_method ?? null,
      sender_name: parsed.sender_name ?? null,
      recipient_name: parsed.recipient_name ?? null,
      date: parsed.date ?? null,
      confidence: parsed.confidence ?? null,
      notes: notes.join(" ") || null,
      raw: parsed,
    });
  } catch (err: any) {
    console.error("parse-receipt error", err);
    return json({ error: err?.message ?? "Unexpected error" }, 500);
  }
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function base64Encode(bytes: Uint8Array): string {
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}
