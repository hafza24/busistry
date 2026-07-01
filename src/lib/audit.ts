import { supabase } from "@/integrations/supabase/client";

export type AuditAction =
  | "login.success"
  | "login.failed"
  | "signup.success"
  | "logout"
  | "payment.submitted"
  | "payment.verified"
  | "payment.rejected"
  | "role.changed"
  | "user.deleted"
  | "order.created"
  | "order.status_changed"
  | "store.activated"
  | "team.member_added"
  | "team.member_removed"
  | "team.role_changed"
  | "feedback.approved"
  | "feedback.rejected"
  | "feedback.featured"
  | "feedback.unfeatured";

interface LogInput {
  action: AuditAction;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  actorEmail?: string;
}

/**
 * Best-effort audit logger. Never throws — returns { ok, error } so callers
 * can surface a non-blocking warning when audit logging fails.
 */
export async function logAudit({ action, entityType, entityId, metadata, actorEmail }: LogInput):
  Promise<{ ok: boolean; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("audit_logs").insert({
      user_id: user?.id ?? null,
      actor_email: actorEmail ?? user?.email ?? null,
      action,
      entity_type: entityType ?? null,
      entity_id: entityId ?? null,
      metadata: (metadata ?? {}) as never,
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 500) : null,
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "Unknown audit error" };
  }
}
