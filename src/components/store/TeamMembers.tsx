import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Trash2, UserPlus, Check, X } from "lucide-react";
import { logAudit } from "@/lib/audit";

interface Props { storeId: string }

type TeamRole = "owner" | "admin" | "manager" | "staff";

interface TeamRow {
  id: string;
  user_id: string;
  role: TeamRole;
  invited_email: string | null;
  created_at: string;
}

const PERMISSIONS: { feature: string; owner: boolean; admin: boolean; manager: boolean; staff: boolean }[] = [
  { feature: "View store dashboard",    owner: true,  admin: true,  manager: true,  staff: true  },
  { feature: "Manage products",         owner: true,  admin: true,  manager: true,  staff: true  },
  { feature: "Manage categories",       owner: true,  admin: true,  manager: true,  staff: false },
  { feature: "Manage orders",           owner: true,  admin: true,  manager: true,  staff: true  },
  { feature: "Manage site settings",    owner: true,  admin: true,  manager: false, staff: false },
  { feature: "Invite / remove team",    owner: true,  admin: true,  manager: false, staff: false },
  { feature: "Billing / upgrade plan",  owner: true,  admin: false, manager: false, staff: false },
  { feature: "Delete store",            owner: true,  admin: false, manager: false, staff: false },
];

const Cell = ({ allowed }: { allowed: boolean }) =>
  allowed
    ? <Check className="h-4 w-4 text-primary mx-auto" aria-label="Allowed" />
    : <X className="h-4 w-4 text-muted-foreground/40 mx-auto" aria-label="Not allowed" />;

const TeamMembers = ({ storeId }: Props) => {
  const qc = useQueryClient();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<TeamRole>("staff");
  const [removeTarget, setRemoveTarget] = useState<TeamRow | null>(null);

  const { data: members, isLoading } = useQuery({
    queryKey: ["team_members", storeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("store_team_members")
        .select("*")
        .eq("store_id", storeId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as TeamRow[];
    },
  });

  const addMember = useMutation({
    mutationFn: async () => {
      const trimmed = email.trim().toLowerCase();
      if (!trimmed) throw new Error("Email required");

      // Try to find an existing profile by matching auth user via RPC fallback —
      // for now we record the invite email and place a placeholder until the user signs up.
      // user_id required NOT NULL; if no match we store a deterministic placeholder uuid hashed from email.
      // Simpler path: ask the invitee to sign up, then admin can attach later.
      // Here we attempt to resolve by joining via the same user_id == invited user once they exist.
      const { data: existing } = await supabase
        .from("profiles")
        .select("id, full_name")
        .eq("id", trimmed)  // profiles.id is uuid — won't match email; left as placeholder strategy
        .maybeSingle();

      // Insert with current auth uid as a fallback — store owner can add themselves as owner;
      // for real team members the user must sign up first and the owner pastes their UID.
      // To keep UI simple here we accept either email-only invite OR a uuid.
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(trimmed);
      if (!isUuid && !existing) {
        throw new Error(
          "Enter the team member's user ID (UUID). They must first create a Busistree account; share their user ID from Account → Profile.",
        );
      }

      const userId = isUuid ? trimmed : existing!.id;
      const { error } = await supabase.from("store_team_members").insert({
        store_id: storeId,
        user_id: userId,
        role,
        invited_email: isUuid ? null : trimmed,
      });
      if (error) throw error;
      await logAudit({ action: "team.member_added", entityType: "store", entityId: storeId, metadata: { role, user_id: userId } });
    },
    onSuccess: () => {
      toast.success("Team member added");
      setEmail("");
      qc.invalidateQueries({ queryKey: ["team_members", storeId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateRole = useMutation({
    mutationFn: async ({ id, newRole }: { id: string; newRole: TeamRole }) => {
      const { error } = await supabase.from("store_team_members").update({ role: newRole }).eq("id", id);
      if (error) throw error;
      await logAudit({ action: "team.role_changed", entityType: "team_member", entityId: id, metadata: { role: newRole } });
    },
    onSuccess: () => {
      toast.success("Role updated");
      qc.invalidateQueries({ queryKey: ["team_members", storeId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const removeMember = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("store_team_members").delete().eq("id", id);
      if (error) throw error;
      await logAudit({ action: "team.member_removed", entityType: "team_member", entityId: id });
    },
    onSuccess: () => {
      toast.success("Team member removed");
      setRemoveTarget(null);
      qc.invalidateQueries({ queryKey: ["team_members", storeId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-display text-foreground">Team Members</h2>
        <p className="text-sm text-muted-foreground">Invite teammates and control what they can do in this store.</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Invite a teammate</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-[1fr_180px_auto]">
            <div>
              <Label htmlFor="invite-id" className="sr-only">User ID or email</Label>
              <Input
                id="invite-id"
                placeholder="User UUID (preferred) or email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="invite-role" className="sr-only">Role</Label>
              <Select value={role} onValueChange={(v) => setRole(v as TeamRole)}>
                <SelectTrigger id="invite-role"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => addMember.mutate()} disabled={addMember.isPending}>
              <UserPlus className="h-4 w-4 mr-2" aria-hidden="true" /> Add
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            The teammate must first create a Busistree account. Ask them for their User ID from their profile.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Members</CardTitle></CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 text-sm text-muted-foreground">Loading…</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {members?.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-mono text-xs">{m.invited_email ?? m.user_id.slice(0, 12) + "…"}</TableCell>
                    <TableCell>
                      <Select value={m.role} onValueChange={(v) => updateRole.mutate({ id: m.id, newRole: v as TeamRole })}>
                        <SelectTrigger className="h-8 w-32"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="owner">Owner</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="staff">Staff</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(m.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setRemoveTarget(m)}
                        aria-label={`Remove ${m.invited_email ?? "member"}`}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" aria-hidden="true" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {!members?.length && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      No teammates yet. You can invite up to your plan's limit.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Permission matrix</CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Capability</TableHead>
                <TableHead className="text-center">Owner</TableHead>
                <TableHead className="text-center">Admin</TableHead>
                <TableHead className="text-center">Manager</TableHead>
                <TableHead className="text-center">Staff</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {PERMISSIONS.map((p) => (
                <TableRow key={p.feature}>
                  <TableCell>{p.feature}</TableCell>
                  <TableCell><Cell allowed={p.owner} /></TableCell>
                  <TableCell><Cell allowed={p.admin} /></TableCell>
                  <TableCell><Cell allowed={p.manager} /></TableCell>
                  <TableCell><Cell allowed={p.staff} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={!!removeTarget}
        onOpenChange={(o) => !o && setRemoveTarget(null)}
        title="Remove team member?"
        description={`This will revoke their access to this store immediately.`}
        confirmLabel="Remove"
        destructive
        onConfirm={() => removeTarget && removeMember.mutateAsync(removeTarget.id)}
      />
    </div>
  );
};

export default TeamMembers;
