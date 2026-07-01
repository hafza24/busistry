import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { User, Building2, MapPin, Share2, Camera, Loader2 } from "lucide-react";

type ProfileState = {
  full_name: string;
  phone: string;
  whatsapp: string;
  bio: string;
  gender: string;
  date_of_birth: string;
  business_name: string;
  website_url: string;
  address_line: string;
  city: string;
  province: string;
  postal_code: string;
  country: string;
  facebook_url: string;
  instagram_url: string;
  twitter_url: string;
  linkedin_url: string;
  avatar_url: string;
};

const EMPTY: ProfileState = {
  full_name: "", phone: "", whatsapp: "", bio: "", gender: "", date_of_birth: "",
  business_name: "", website_url: "",
  address_line: "", city: "", province: "", postal_code: "", country: "Pakistan",
  facebook_url: "", instagram_url: "", twitter_url: "", linkedin_url: "",
  avatar_url: "",
};

const PROVINCES = ["Punjab", "Sindh", "Khyber Pakhtunkhwa", "Balochistan", "Islamabad Capital Territory", "Gilgit-Baltistan", "Azad Jammu & Kashmir"];

const UserProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [p, setP] = useState<ProfileState>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const set = <K extends keyof ProfileState>(k: K, v: ProfileState[K]) => setP((prev) => ({ ...prev, [k]: v }));

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle().then(({ data }) => {
      if (data) {
        setP({
          full_name: data.full_name ?? "",
          phone: data.phone ?? "",
          whatsapp: (data as any).whatsapp ?? "",
          bio: (data as any).bio ?? "",
          gender: (data as any).gender ?? "",
          date_of_birth: (data as any).date_of_birth ?? "",
          business_name: (data as any).business_name ?? "",
          website_url: (data as any).website_url ?? "",
          address_line: (data as any).address_line ?? "",
          city: (data as any).city ?? "",
          province: (data as any).province ?? "",
          postal_code: (data as any).postal_code ?? "",
          country: (data as any).country ?? "Pakistan",
          facebook_url: (data as any).facebook_url ?? "",
          instagram_url: (data as any).instagram_url ?? "",
          twitter_url: (data as any).twitter_url ?? "",
          linkedin_url: (data as any).linkedin_url ?? "",
          avatar_url: data.avatar_url ?? "",
        });
      }
      setLoading(false);
    });
  }, [user]);

  const extractStoragePath = (publicUrl: string): string | null => {
    const marker = "/store-assets/";
    const idx = publicUrl.indexOf(marker);
    if (idx === -1) return null;
    return publicUrl.slice(idx + marker.length);
  };

  const handleAvatar = async (file: File) => {
    if (!user) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Unsupported file", description: "Please choose a JPG, PNG, or WebP image.", variant: "destructive" });
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      toast({ title: "Image too large", description: "Max 4 MB.", variant: "destructive" });
      return;
    }
    setUploading(true);
    const previousUrl = p.avatar_url;
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const path = `avatars/${user.id}/${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("store-assets").upload(path, file, { upsert: true, contentType: file.type });
    if (upErr) {
      toast({ title: "Upload failed", description: upErr.message, variant: "destructive" });
      setUploading(false);
      return;
    }
    const { data } = supabase.storage.from("store-assets").getPublicUrl(path);
    const url = data.publicUrl;
    const { error: dbErr } = await supabase.from("profiles").update({ avatar_url: url, updated_at: new Date().toISOString() }).eq("id", user.id);
    if (dbErr) {
      // Roll back the just-uploaded file so we don't leave orphans
      await supabase.storage.from("store-assets").remove([path]);
      toast({ title: "Save failed", description: dbErr.message, variant: "destructive" });
      setUploading(false);
      return;
    }
    set("avatar_url", url);
    // Best-effort cleanup of the previous avatar file
    const prevPath = previousUrl ? extractStoragePath(previousUrl) : null;
    if (prevPath && prevPath !== path && prevPath.startsWith(`avatars/${user.id}/`)) {
      await supabase.storage.from("store-assets").remove([prevPath]);
    }
    toast({ title: previousUrl ? "Avatar replaced" : "Avatar uploaded" });
    setUploading(false);
  };

  const handleRemoveAvatar = async () => {
    if (!user || !p.avatar_url) return;
    setUploading(true);
    const prevPath = extractStoragePath(p.avatar_url);
    const { error } = await supabase.from("profiles").update({ avatar_url: null, updated_at: new Date().toISOString() }).eq("id", user.id);
    if (error) {
      toast({ title: "Remove failed", description: error.message, variant: "destructive" });
      setUploading(false);
      return;
    }
    if (prevPath && prevPath.startsWith(`avatars/${user.id}/`)) {
      await supabase.storage.from("store-assets").remove([prevPath]);
    }
    set("avatar_url", "");
    toast({ title: "Avatar removed" });
    setUploading(false);
  };


  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const payload = {
      full_name: p.full_name.trim() || null,
      phone: p.phone.trim() || null,
      whatsapp: p.whatsapp.trim() || null,
      bio: p.bio.trim() || null,
      gender: p.gender || null,
      date_of_birth: p.date_of_birth || null,
      business_name: p.business_name.trim() || null,
      website_url: p.website_url.trim() || null,
      address_line: p.address_line.trim() || null,
      city: p.city.trim() || null,
      province: p.province || null,
      postal_code: p.postal_code.trim() || null,
      country: p.country.trim() || null,
      facebook_url: p.facebook_url.trim() || null,
      instagram_url: p.instagram_url.trim() || null,
      twitter_url: p.twitter_url.trim() || null,
      linkedin_url: p.linkedin_url.trim() || null,
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase.from("profiles").update(payload as never).eq("id", user.id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else toast({ title: "Profile saved" });
    setSaving(false);
  };

  const completion = (() => {
    const fields = [p.full_name, p.phone, p.whatsapp, p.bio, p.gender, p.date_of_birth, p.business_name, p.website_url, p.address_line, p.city, p.province, p.postal_code, p.avatar_url];
    const filled = fields.filter((f) => (f ?? "").toString().trim().length > 0).length;
    return Math.round((filled / fields.length) * 100);
  })();

  if (loading) return <div className="text-muted-foreground py-12 text-center">Loading profile...</div>;

  const initial = (p.full_name || user?.email || "U").charAt(0).toUpperCase();

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold font-display text-foreground">Your Profile</h2>
          <p className="text-sm text-muted-foreground">Keep your details up to date so we can serve you better.</p>
        </div>
        <div className="text-right">
          <div className="text-xs text-muted-foreground">Profile completion</div>
          <div className="text-xl font-semibold text-primary font-display">{completion}%</div>
        </div>
      </div>

      {/* Avatar + identity */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display flex items-center gap-2"><User className="h-5 w-5 text-primary" /> Personal Information</CardTitle>
          <CardDescription>Basic details about you.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-5 flex-wrap">
            <Avatar className="h-24 w-24 border border-border">
              <AvatarImage src={p.avatar_url || ""} alt="Your avatar" />
              <AvatarFallback className="text-2xl bg-primary/10 text-primary">{initial}</AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-[240px] space-y-2">
              <div className="text-sm font-medium text-foreground">Profile photo</div>
              <p className="text-xs text-muted-foreground">Square JPG, PNG or WebP — up to 4 MB.</p>
              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  type="button"
                  variant={p.avatar_url ? "outline" : "default"}
                  size="sm"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Uploading...</>
                  ) : (
                    <><Camera className="h-4 w-4 mr-2" /> {p.avatar_url ? "Replace avatar" : "Upload avatar"}</>
                  )}
                </Button>
                {p.avatar_url && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveAvatar}
                    disabled={uploading}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" /> Remove
                  </Button>
                )}
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleAvatar(f); e.target.value = ""; }}
              />
            </div>
          </div>


          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={user?.email || ""} disabled className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" value={p.full_name} onChange={(e) => set("full_name", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={p.phone} onChange={(e) => set("phone", e.target.value)} placeholder="03XX XXXXXXX" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp</Label>
              <Input id="whatsapp" value={p.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} placeholder="03XX XXXXXXX" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select value={p.gender} onValueChange={(v) => set("gender", v)}>
                <SelectTrigger id="gender"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                  <SelectItem value="prefer_not">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dob">Date of Birth</Label>
              <Input id="dob" type="date" value={p.date_of_birth} onChange={(e) => set("date_of_birth", e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Short Bio</Label>
            <Textarea id="bio" rows={3} value={p.bio} onChange={(e) => set("bio", e.target.value)} placeholder="Tell us a bit about yourself or your business..." />
          </div>
        </CardContent>
      </Card>

      {/* Business */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display flex items-center gap-2"><Building2 className="h-5 w-5 text-primary" /> Business Details</CardTitle>
          <CardDescription>Optional — helpful when we build your website.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="business">Business Name</Label>
            <Input id="business" value={p.business_name} onChange={(e) => set("business_name", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input id="website" type="url" value={p.website_url} onChange={(e) => set("website_url", e.target.value)} placeholder="https://" />
          </div>
        </CardContent>
      </Card>

      {/* Address */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display flex items-center gap-2"><MapPin className="h-5 w-5 text-primary" /> Address</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="addr">Address</Label>
            <Input id="addr" value={p.address_line} onChange={(e) => set("address_line", e.target.value)} placeholder="House / Street" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input id="city" value={p.city} onChange={(e) => set("city", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="province">Province</Label>
            <Select value={p.province} onValueChange={(v) => set("province", v)}>
              <SelectTrigger id="province"><SelectValue placeholder="Select province" /></SelectTrigger>
              <SelectContent>
                {PROVINCES.map((pr) => <SelectItem key={pr} value={pr}>{pr}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="postal">Postal Code</Label>
            <Input id="postal" value={p.postal_code} onChange={(e) => set("postal_code", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Input id="country" value={p.country} onChange={(e) => set("country", e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {/* Social */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display flex items-center gap-2"><Share2 className="h-5 w-5 text-primary" /> Social Links</CardTitle>
          <CardDescription>Optional — used for your storefront if you request it.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="fb">Facebook</Label>
            <Input id="fb" type="url" value={p.facebook_url} onChange={(e) => set("facebook_url", e.target.value)} placeholder="https://facebook.com/..." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ig">Instagram</Label>
            <Input id="ig" type="url" value={p.instagram_url} onChange={(e) => set("instagram_url", e.target.value)} placeholder="https://instagram.com/..." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tw">Twitter / X</Label>
            <Input id="tw" type="url" value={p.twitter_url} onChange={(e) => set("twitter_url", e.target.value)} placeholder="https://x.com/..." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="li">LinkedIn</Label>
            <Input id="li" type="url" value={p.linkedin_url} onChange={(e) => set("linkedin_url", e.target.value)} placeholder="https://linkedin.com/in/..." />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} size="lg">
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
};

export default UserProfile;
