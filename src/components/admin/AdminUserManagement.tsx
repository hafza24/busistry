import { useState } from "react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { useAllProfiles } from "@/hooks/useAdmin";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Eye, ShieldOff, Ban, ShieldCheck } from "lucide-react";
import { TableSkeleton } from "@/components/ui/loading-skeletons";
import { ErrorState } from "@/components/ui/error-state";
import UserModerationDialog from "./UserModerationDialog";
import ModerationLogsDialog from "./ModerationLogsDialog";


type Status = "active" | "suspended" | "blacklisted";

const statusBadge = (s: Status) => {
  if (s === "suspended") return <Badge className="bg-amber-500/15 text-amber-700 hover:bg-amber-500/15"><ShieldOff className="h-3 w-3 mr-1" />Suspended</Badge>;
  if (s === "blacklisted") return <Badge variant="destructive"><Ban className="h-3 w-3 mr-1" />Blacklisted</Badge>;
  return <Badge variant="secondary"><ShieldCheck className="h-3 w-3 mr-1" />Active</Badge>;
};

const AdminUserManagement = () => {
  const { data: profiles, isLoading, isError, refetch } = useAllProfiles();
  const [target, setTarget] = useState<{ id: string; name: string; status: Status; reason?: string | null } | null>(null);
  const [logsOpen, setLogsOpen] = useState(false);


  if (isLoading) return <TableSkeleton columns={3} rows={6} />;
  if (isError) return <ErrorState message="We couldn't load users." onRetry={() => refetch()} />;

  const restrictedCount = (profiles ?? []).filter((p: any) => p.status && p.status !== "active").length;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={() => setLogsOpen(true)}>
          View delivery log
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            <div>
              <div className="text-2xl font-bold font-display">{profiles?.length ?? 0}</div>
              <div className="text-sm text-muted-foreground">Registered Users</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <ShieldOff className="h-8 w-8 text-amber-600" />
            <div>
              <div className="text-2xl font-bold font-display">{restrictedCount}</div>
              <div className="text-sm text-muted-foreground">Suspended / Blacklisted</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="w-40 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profiles?.map((profile: any) => {
                const status: Status = (profile.status as Status) ?? "active";
                return (
                  <TableRow key={profile.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={profile.avatar_url ?? ""} />
                          <AvatarFallback className="text-xs bg-primary/10 text-primary">
                            {(profile.full_name ?? "U").charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{profile.full_name || "Unnamed"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{profile.phone || "—"}</TableCell>
                    <TableCell>{statusBadge(status)}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {format(new Date(profile.created_at), "dd MMM yyyy")}
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button asChild variant="ghost" size="sm">
                        <Link to={`/profile/${profile.id}`} aria-label={`View profile of ${profile.full_name || "user"}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setTarget({
                          id: profile.id,
                          name: profile.full_name || "user",
                          status,
                          reason: profile.moderation_reason,
                        })}
                      >
                        Moderate
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {(!profiles || profiles.length === 0) && (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No users</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {target && (
        <UserModerationDialog
          open={!!target}
          onOpenChange={(v) => !v && setTarget(null)}
          userId={target.id}
          userName={target.name}
          currentStatus={target.status}
          currentReason={target.reason}
        />
      )}

      <ModerationLogsDialog open={logsOpen} onOpenChange={setLogsOpen} />
    </div>

  );
};

export default AdminUserManagement;

