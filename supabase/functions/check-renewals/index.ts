import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const THRESHOLDS = [7, 3, 1, 0];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
  const now = new Date();

  const { data: subs, error } = await supabase
    .from("subscriptions")
    .select("id, user_id, label, current_period_end, last_reminder_day, status, amount_pkr")
    .eq("status", "active")
    .lte("current_period_end", new Date(now.getTime() + 8 * 86400000).toISOString());
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { data: adminRoles } = await supabase.from("user_roles").select("user_id").eq("role", "admin");
  const adminIds = (adminRoles ?? []).map((r) => r.user_id);

  let created = 0;
  for (const s of subs ?? []) {
    const daysLeft = Math.ceil((new Date(s.current_period_end).getTime() - now.getTime()) / 86400000);
    const bucket = THRESHOLDS.find((t) => daysLeft <= t);
    if (bucket === undefined) continue;
    if (s.last_reminder_day !== null && s.last_reminder_day <= bucket) continue;

    const title = bucket === 0
      ? `${s.label} has expired`
      : `${s.label} renews in ${bucket} day${bucket === 1 ? "" : "s"}`;
    const body = bucket === 0
      ? `Your subscription of PKR ${Number(s.amount_pkr).toLocaleString()} needs renewal to keep the service active.`
      : `Please renew before ${new Date(s.current_period_end).toLocaleDateString()} to avoid interruption. Amount: PKR ${Number(s.amount_pkr).toLocaleString()}.`;

    // user notification
    await supabase.from("notifications").insert({
      user_id: s.user_id,
      audience: "user",
      type: bucket === 0 ? "renewal.expired" : "renewal.reminder",
      title, body,
      link: "/dashboard?view=subscriptions",
      subscription_id: s.id,
      metadata: { days_left: bucket },
    });

    // admin notifications
    if (adminIds.length) {
      const rows = adminIds.map((uid) => ({
        user_id: uid,
        audience: "admin" as const,
        type: bucket === 0 ? "renewal.expired" : "renewal.reminder",
        title: `[Admin] ${title}`,
        body,
        link: "/admin?view=subscriptions",
        subscription_id: s.id,
        metadata: { days_left: bucket, user_id: s.user_id },
      }));
      await supabase.from("notifications").insert(rows);
    }

    await supabase.from("subscriptions").update({
      last_reminder_day: bucket,
      last_reminder_at: now.toISOString(),
      status: bucket === 0 ? "past_due" : s.status,
    }).eq("id", s.id);

    created++;
  }

  return new Response(JSON.stringify({ ok: true, processed: subs?.length ?? 0, reminders: created }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
