import { format } from "date-fns";
import { Link } from "react-router-dom";
import { useAllProfiles } from "@/hooks/useAdmin";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Users, Eye } from "lucide-react";
import { TableSkeleton } from "@/components/ui/loading-skeletons";
import { ErrorState } from "@/components/ui/error-state";

const AdminUserManagement = () => {
  const { data: profiles, isLoading, isError, refetch } = useAllProfiles();

  if (isLoading) return <TableSkeleton columns={3} rows={6} />;
  if (isError) return <ErrorState message="We couldn't load users." onRetry={() => refetch()} />;

  return (
    <div className="space-y-4">
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
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="w-24 text-right">Profile</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profiles?.map((profile) => (
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
                  <TableCell className="text-xs text-muted-foreground">
                    {format(new Date(profile.created_at), "dd MMM yyyy")}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="ghost" size="sm">
                      <Link to={`/profile/${profile.id}`} aria-label={`View profile of ${profile.full_name || "user"}`}>
                        <Eye className="h-4 w-4 mr-1" /> View
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {(!profiles || profiles.length === 0) && (
                <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">No users</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUserManagement;
