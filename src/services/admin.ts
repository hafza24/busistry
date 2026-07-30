import { supabase } from "@/integrations/supabase/client";
import { callApi, unwrap, validate } from "./core/api";
import { AdminStatusSchema, type AdminStatusInput } from "./schemas";

type AdminTable = "catalog_orders" | "store_addons" | "upgrade_orders";

const ACTION_BY_TABLE: Record<AdminTable, string> = {
  catalog_orders: "admin.catalog_orders.set_status",
  store_addons: "admin.store_addons.set_status",
  upgrade_orders: "admin.upgrade_orders.set_status",
};

/**
 * Admin status transitions. The server verifies the admin role in TypeScript
 * before touching the row; the fallback relies on the admin RLS policies.
 */
export async function setAdminStatus(table: AdminTable, input: AdminStatusInput) {
  const data = validate(AdminStatusSchema, input);

  return callApi(ACTION_BY_TABLE[table], data, {
    fallback: async () => {
      const patch: Record<string, string> = { status: data.status };
      if (data.admin_notes !== undefined) patch.admin_notes = data.admin_notes;
      unwrap(await supabase.from(table).update(patch as never).eq("id", data.id).select("id").single());
      return { id: data.id, status: data.status };
    },
  });
}

/** True when the signed-in user holds the admin role (server-verified function). */
export async function isCurrentUserAdmin(): Promise<boolean> {
  const { data, error } = await supabase.rpc("is_admin");
  if (error) return false;
  return !!data;
}

/** Read: aggregated dashboard stats via a security-definer function. */
export async function getDashboardStats() {
  const rows = unwrap(await supabase.rpc("admin_dashboard_stats"));
  return Array.isArray(rows) ? rows[0] : rows;
}
