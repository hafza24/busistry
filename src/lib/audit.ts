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
  | "team.role_changed";

interface LogInput {
  action: AuditAction;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  actorEmail?: string;
}

/**
 * Best-effort audit logger. Never throws — failures are swallowed
 * so they don't disrupt the user flow.
 */
export async function logAudit({ action, entityType, entityId, metadata, actorEmail }: LogInput) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("audit_logs").insert({
      user_id: user?.id ?? null,
      actor_email: actorEmail ?? user?.email ?? null,
      action,
      entity_type: entityType ?? null,
      entity_id: entityId ?? null,
      metadata: (metadata ?? {}) as never,
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 500) : null,
    });
  } catch {
    /* swallow */
  }
}
