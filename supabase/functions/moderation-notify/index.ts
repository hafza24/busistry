import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

type Status = "active" | "suspended" | "blacklisted";

interface Body {
  userId: string;
  status: Status;
  reason?: string | null;
}

const label = (s: Status) =>
  s === "blacklisted" ? "blacklisted" : s === "suspended" ? "suspended" : "reinstated";

const renderEmail = (name: string, status: Status, reason: string | null) => {
  const action = label(status);
  const isRestricted = status !== "active";
  const heading = isRestricted
    ? `Your account has been ${action}`
    : "Your account has been reinstated";
  const intro = isRestricted
    ? `We're writing to let you know your Busistree account has been ${action} by our moderation team.`
    : "Good news — your Busistree account has been reinstated and you can sign in again.";
  const reasonBlock = isRestricted && reason
    ? `<p style="margin:16px 0;padding:12px 16px;background:#f8fafc;border-left:3px solid #0ea5a4;border-radius:4px;color:#0f172a;"><strong>Reason:</strong> ${reason.replace(/</g, "&lt;")}</p>`
    : "";
  const nextSteps = isRestricted
    ? `<p style="margin:16px 0;color:#475569;">If you believe this was a mistake, reply to this email or contact support.</p>`
    : "";
  return `<!DOCTYPE html><html><body style="font-family:system-ui,-apple-system,sans-serif;background:#ffffff;padding:24px;color:#0f172a;">
  <div style="max-width:560px;margin:0 auto;">
    <h1 style="font-size:20px;margin:0 0 8px;">${heading}</h1>
    <p style="margin:8px 0;color:#334155;">Hi ${name || "there"},</p>
    <p style="margin:8px 0;color:#334155;">${intro}</p>
    ${reasonBlock}
    ${nextSteps}
    <p style="margin:24px 0 0;color:#94a3b8;font-size:12px;">Busistree Moderation Team</p>
  </div></body></html>`;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
    const { data: userData, error: userErr } = await admin.auth.getUser(authHeader.replace("Bearer ", ""));
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: isAdmin } = await admin.rpc("has_role", { _user_id: userData.user.id, _role: "admin" });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = (await req.json()) as Body;
    if (!body.userId || !body.status) {
      return new Response(JSON.stringify({ error: "Missing fields" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const reason = (body.reason ?? "").toString().trim() || null;
    const action = label(body.status);
    const isRestricted = body.status !== "active";

    // Insert in-app notification (service role bypasses RLS)
    const title = isRestricted
      ? `Your account was ${action}`
      : "Your account has been reinstated";
    const notifBody = isRestricted
      ? (reason ? `Reason: ${reason}` : "Contact support if you believe this is a mistake.")
      : "You can sign in and use Busistree again.";

    // Create the delivery log row (queued state)
    const { data: logRow } = await admin
      .from("moderation_notification_logs")
      .insert({
        user_id: body.userId,
        moderator_id: userData.user.id,
        moderation_status: body.status,
        reason,
        in_app_status: "queued",
        email_status: "queued",
      })
      .select("id")
      .single();
    const logId = (logRow as any)?.id as string | undefined;

    // In-app notification
    let inAppStatus: "sent" | "failed" = "sent";
    let inAppError: string | null = null;
    const { error: notifErr } = await admin.from("notifications").insert({
      user_id: body.userId,
      audience: "user",
      type: "moderation",
      title,
      body: notifBody,
      metadata: { status: body.status, reason, log_id: logId },
    });
    if (notifErr) {
      inAppStatus = "failed";
      inAppError = notifErr.message;
      console.error("moderation-notify in-app failed:", notifErr);
    }

    // Fetch target user's email + name
    const { data: target } = await admin.auth.admin.getUserById(body.userId);
    const email = target?.user?.email ?? null;
    const { data: profile } = await admin.from("profiles").select("full_name").eq("id", body.userId).maybeSingle();
    const fullName = (profile as any)?.full_name ?? "";

    let emailStatus: "sent" | "failed" | "skipped" = "queued" as any;
    let emailError: string | null = null;

    if (!email) {
      emailStatus = "skipped";
      emailError = "no_email_on_file";
    } else if (!RESEND_API_KEY || !LOVABLE_API_KEY) {
      emailStatus = "skipped";
      emailError = "resend_not_configured";
    } else {
      const html = renderEmail(fullName, body.status, reason);
      const subject = isRestricted
        ? `Your Busistree account has been ${action}`
        : "Your Busistree account has been reinstated";

      try {
        const res = await fetch("https://connector-gateway.lovable.dev/resend/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${LOVABLE_API_KEY}`,
            "X-Connection-Api-Key": RESEND_API_KEY,
          },
          body: JSON.stringify({
            from: "Busistree <onboarding@resend.dev>",
            to: [email],
            subject,
            html,
          }),
        });
        if (res.ok) {
          emailStatus = "sent";
        } else {
          emailStatus = "failed";
          emailError = `Resend ${res.status}: ${(await res.text()).slice(0, 500)}`;
          console.error("moderation-notify email failed:", emailError);
        }
      } catch (e: any) {
        emailStatus = "failed";
        emailError = e?.message ?? "network_error";
        console.error("moderation-notify email exception:", emailError);
      }
    }

    // Finalize log row
    if (logId) {
      await admin
        .from("moderation_notification_logs")
        .update({
          email_to: email,
          in_app_status: inAppStatus,
          in_app_error: inAppError,
          email_status: emailStatus,
          email_error: emailError,
        })
        .eq("id", logId);
    }



    return new Response(
      JSON.stringify({ ok: true, logId, inAppStatus, emailStatus, emailError }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );

  } catch (e: any) {
    console.error("moderation-notify error:", e);
    return new Response(JSON.stringify({ error: e?.message ?? "Server error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
