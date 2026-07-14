import { useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useIsAdmin } from "@/hooks/useAdmin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Building2, MapPin, Share2, ArrowLeft, Pencil, Mail, Phone, Calendar } from "lucide-react";
import { format } from "date-fns";

const Row = ({ label, value }: { label: string; value?: string | null }) => (
  <div className="space-y-1">
    <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
    <div className="text-sm text-foreground break-words">{value?.trim() ? value : <span className="text-muted-foreground/60">—</span>}</div>
  </div>
);

const ProfileView = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user, loading: authLoading } = useAuth();
  const { data: isAdmin } = useIsAdmin();
  const navigate = useNavigate();

  const targetId = userId || user?.id;
  const isOwn = !!user && targetId === user.id;

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth", { replace: true });
  }, [user, authLoading, navigate]);

  const { data: profile, isLoading, isError } = useQuery({
    queryKey: ["profile-view", targetId],
    enabled: !!targetId,
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", targetId!).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: roles } = useQuery({
    queryKey: ["profile-view-roles", targetId],
    enabled: !!targetId,
    queryFn: async () => {
      const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", targetId!);
      if (error) throw error;
      return (data ?? []).map((r) => r.role as string);
    },
  });

  if (authLoading || isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading profile…</div>;
  }

  if (isError || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Profile not available.</p>
        <Button variant="outline" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4 mr-2" /> Back</Button>
      </div>
    );
  }

  const p = profile as any;
  const initial = (p.full_name || "U").charAt(0).toUpperCase();
  const isAdminUser = roles?.includes("admin");

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          {isOwn && (
            <Button asChild size="sm">
              <Link to="/dashboard?view=profile"><Pencil className="h-4 w-4 mr-2" /> Edit profile</Link>
            </Button>
          )}
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-5 flex-wrap">
              <Avatar className="h-24 w-24 border border-border">
                <AvatarImage src={p.avatar_url || ""} alt={p.full_name || "User"} />
                <AvatarFallback className="text-2xl bg-primary/10 text-primary">{initial}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-[220px]">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl font-bold font-display text-foreground">
                    {p.full_name || "Unnamed user"}
                  </h1>
                  {isAdminUser && <Badge className="bg-primary/10 text-primary hover:bg-primary/10">Admin</Badge>}
                  {!isAdminUser && <Badge variant="secondary">User</Badge>}
                </div>
                {p.business_name && (
                  <div className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5" /> {p.business_name}
                  </div>
                )}
                {p.bio && <p className="text-sm text-foreground mt-3 whitespace-pre-wrap">{p.bio}</p>}
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-xs text-muted-foreground">
                  {p.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{p.phone}</span>}
                  {p.created_at && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> Joined {format(new Date(p.created_at), "dd MMM yyyy")}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2 text-base"><User className="h-4 w-4 text-primary" /> Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <Row label="Full name" value={p.full_name} />
            <Row label="Phone" value={p.phone} />
            <Row label="WhatsApp" value={p.whatsapp} />
            <Row label="Gender" value={p.gender} />
            <Row label="Date of birth" value={p.date_of_birth} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2 text-base"><Building2 className="h-4 w-4 text-primary" /> Business</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <Row label="Business name" value={p.business_name} />
            <Row label="Website" value={p.website_url} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2 text-base"><MapPin className="h-4 w-4 text-primary" /> Address</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <Row label="Address" value={p.address_line} />
            <Row label="City" value={p.city} />
            <Row label="Province" value={p.province} />
            <Row label="Postal code" value={p.postal_code} />
            <Row label="Country" value={p.country} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2 text-base"><Share2 className="h-4 w-4 text-primary" /> Social</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <Row label="Facebook" value={p.facebook_url} />
            <Row label="Instagram" value={p.instagram_url} />
            <Row label="Twitter / X" value={p.twitter_url} />
            <Row label="LinkedIn" value={p.linkedin_url} />
          </CardContent>
        </Card>

        {isAdmin && !isOwn && (
          <p className="text-xs text-muted-foreground text-center">
            You are viewing this profile as an admin.
          </p>
        )}
      </div>
    </div>
  );
};

export default ProfileView;
