import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, FolderPlus, MessageSquare, BookOpen } from "lucide-react";

interface Category { id: string; name: string; slug: string; description: string | null; sort_order: number; is_active: boolean; }
interface Article {
  id: string; category_id: string | null; title: string; slug: string; excerpt: string | null;
  content: string; tags: string[]; is_published: boolean; is_featured: boolean; sort_order: number; views: number;
}
interface Ticket {
  id: string; user_id: string; subject: string; message: string; status: string;
  category: string; priority: string; admin_response: string | null; created_at: string;
}

const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const AdminHelpCenter = () => {
  return (
    <Tabs defaultValue="articles">
      <TabsList>
        <TabsTrigger value="articles"><BookOpen className="h-4 w-4 mr-1" /> Articles</TabsTrigger>
        <TabsTrigger value="categories"><FolderPlus className="h-4 w-4 mr-1" /> Categories</TabsTrigger>
        <TabsTrigger value="tickets"><MessageSquare className="h-4 w-4 mr-1" /> Support Tickets</TabsTrigger>
      </TabsList>
      <TabsContent value="articles" className="mt-4"><ArticlesPanel /></TabsContent>
      <TabsContent value="categories" className="mt-4"><CategoriesPanel /></TabsContent>
      <TabsContent value="tickets" className="mt-4"><TicketsPanel /></TabsContent>
    </Tabs>
  );
};

// ============ CATEGORIES ============
const CategoriesPanel = () => {
  const [items, setItems] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: "", slug: "", description: "", sort_order: 0, is_active: true });

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("help_categories").select("*").order("sort_order");
    setItems(data || []); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(null); setForm({ name: "", slug: "", description: "", sort_order: 0, is_active: true }); setOpen(true); };
  const openEdit = (c: Category) => { setEditing(c); setForm({ name: c.name, slug: c.slug, description: c.description || "", sort_order: c.sort_order, is_active: c.is_active }); setOpen(true); };

  const save = async () => {
    const payload = { ...form, slug: form.slug || slugify(form.name) };
    if (!payload.name.trim() || !payload.slug) { toast.error("Name required"); return; }
    const { error } = editing
      ? await supabase.from("help_categories").update(payload).eq("id", editing.id)
      : await supabase.from("help_categories").insert(payload);
    if (error) return toast.error(error.message);
    toast.success("Saved"); setOpen(false); load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this category?")) return;
    const { error } = await supabase.from("help_categories").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted"); load();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-display font-semibold">Categories</h3>
        <Button size="sm" onClick={openNew}><Plus className="h-4 w-4 mr-1" /> New</Button>
      </div>
      {loading ? <Skeleton className="h-40" /> : items.length === 0 ? (
        <EmptyState icon={FolderPlus} title="No categories" />
      ) : (
        <div className="grid gap-3">
          {items.map((c) => (
            <Card key={c.id}>
              <CardHeader className="flex flex-row items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">{c.name} {!c.is_active && <Badge variant="outline">Hidden</Badge>}</CardTitle>
                  <CardDescription>/{c.slug} · order {c.sort_order}</CardDescription>
                  {c.description && <p className="text-sm text-muted-foreground mt-1">{c.description}</p>}
                </div>
                <div className="flex gap-2">
                  <Button size="icon" variant="ghost" onClick={() => openEdit(c)}><Pencil className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => remove(c.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit" : "New"} Category</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: form.slug || slugify(e.target.value) })} /></div>
            <div><Label>Slug</Label><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })} /></div>
            <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Sort order</Label><Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} /></div>
              <div className="flex items-center gap-2 pt-6"><Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} /><Label>Active</Label></div>
            </div>
          </div>
          <DialogFooter><Button onClick={save}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ============ ARTICLES ============
const ArticlesPanel = () => {
  const [items, setItems] = useState<Article[]>([]);
  const [cats, setCats] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Article | null>(null);
  const [form, setForm] = useState({
    category_id: "" as string, title: "", slug: "", excerpt: "", content: "",
    tags: "" as string, is_published: false, is_featured: false, sort_order: 0,
  });

  const load = async () => {
    setLoading(true);
    const [{ data: a }, { data: c }] = await Promise.all([
      supabase.from("help_articles").select("*").order("sort_order"),
      supabase.from("help_categories").select("*").order("sort_order"),
    ]);
    setItems(a || []); setCats(c || []); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const openNew = () => {
    setEditing(null);
    setForm({ category_id: "", title: "", slug: "", excerpt: "", content: "", tags: "", is_published: false, is_featured: false, sort_order: 0 });
    setOpen(true);
  };
  const openEdit = (a: Article) => {
    setEditing(a);
    setForm({
      category_id: a.category_id || "", title: a.title, slug: a.slug, excerpt: a.excerpt || "",
      content: a.content, tags: a.tags.join(", "), is_published: a.is_published, is_featured: a.is_featured, sort_order: a.sort_order,
    });
    setOpen(true);
  };

  const save = async () => {
    const payload = {
      category_id: form.category_id || null,
      title: form.title.trim(),
      slug: (form.slug || slugify(form.title)),
      excerpt: form.excerpt.trim() || null,
      content: form.content,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      is_published: form.is_published,
      is_featured: form.is_featured,
      sort_order: form.sort_order,
    };
    if (!payload.title || !payload.slug) { toast.error("Title required"); return; }
    const { error } = editing
      ? await supabase.from("help_articles").update(payload).eq("id", editing.id)
      : await supabase.from("help_articles").insert(payload);
    if (error) return toast.error(error.message);
    toast.success("Saved"); setOpen(false); load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this article?")) return;
    const { error } = await supabase.from("help_articles").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted"); load();
  };

  const catName = (id: string | null) => cats.find((c) => c.id === id)?.name || "—";

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-display font-semibold">Articles</h3>
        <Button size="sm" onClick={openNew}><Plus className="h-4 w-4 mr-1" /> New Article</Button>
      </div>
      {loading ? <Skeleton className="h-40" /> : items.length === 0 ? (
        <EmptyState icon={BookOpen} title="No articles" description="Create your first help article." />
      ) : (
        <div className="grid gap-3">
          {items.map((a) => (
            <Card key={a.id}>
              <CardHeader className="flex flex-row items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-base flex items-center gap-2 flex-wrap">
                    {a.title}
                    {a.is_published ? <Badge variant="default">Published</Badge> : <Badge variant="outline">Draft</Badge>}
                    {a.is_featured && <Badge className="bg-primary/20 text-primary">Featured</Badge>}
                  </CardTitle>
                  <CardDescription>{catName(a.category_id)} · /{a.slug} · {a.views} views</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button size="icon" variant="ghost" onClick={() => openEdit(a)}><Pencil className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => remove(a.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit" : "New"} Article</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value, slug: form.slug || slugify(e.target.value) })} /></div>
            <div><Label>Slug</Label><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })} /></div>
            <div>
              <Label>Category</Label>
              <Select value={form.category_id || "none"} onValueChange={(v) => setForm({ ...form, category_id: v === "none" ? "" : v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Uncategorized</SelectItem>
                  {cats.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Excerpt</Label><Textarea rows={2} value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} /></div>
            <div><Label>Content (plain text / markdown-style)</Label><Textarea rows={10} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} /></div>
            <div><Label>Tags (comma-separated)</Label><Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} /></div>
            <div className="grid grid-cols-3 gap-3">
              <div><Label>Sort order</Label><Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} /></div>
              <div className="flex items-center gap-2 pt-6"><Switch checked={form.is_published} onCheckedChange={(v) => setForm({ ...form, is_published: v })} /><Label>Published</Label></div>
              <div className="flex items-center gap-2 pt-6"><Switch checked={form.is_featured} onCheckedChange={(v) => setForm({ ...form, is_featured: v })} /><Label>Featured</Label></div>
            </div>
          </div>
          <DialogFooter><Button onClick={save}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ============ TICKETS ============
const TicketsPanel = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [respondOpen, setRespondOpen] = useState<Ticket | null>(null);
  const [response, setResponse] = useState("");
  const [newStatus, setNewStatus] = useState("resolved");

  const load = async () => {
    setLoading(true);
    let q = supabase.from("support_tickets").select("*").order("created_at", { ascending: false });
    if (filter !== "all") q = q.eq("status", filter);
    const { data } = await q;
    setItems(data || []); setLoading(false);
  };
  useEffect(() => { load(); }, [filter]);

  const openRespond = (t: Ticket) => { setRespondOpen(t); setResponse(t.admin_response || ""); setNewStatus(t.status === "open" ? "resolved" : t.status); };

  const saveResponse = async () => {
    if (!respondOpen || !user) return;
    const { error } = await supabase.from("support_tickets").update({
      admin_response: response.trim() || null,
      status: newStatus,
      responded_at: new Date().toISOString(),
      responded_by: user.id,
    }).eq("id", respondOpen.id);
    if (error) return toast.error(error.message);
    toast.success("Response saved"); setRespondOpen(null); load();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-display font-semibold">Support Tickets</h3>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {loading ? <Skeleton className="h-40" /> : items.length === 0 ? (
        <EmptyState icon={MessageSquare} title="No tickets" />
      ) : (
        <div className="space-y-3">
          {items.map((t) => (
            <Card key={t.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-base">{t.subject}</CardTitle>
                    <CardDescription>
                      {new Date(t.created_at).toLocaleString()} · {t.category} · priority: {t.priority}
                    </CardDescription>
                  </div>
                  <Badge variant={t.status === "open" ? "default" : "outline"}>{t.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm whitespace-pre-wrap text-muted-foreground">{t.message}</p>
                {t.admin_response && (
                  <div className="rounded-md border border-primary/30 bg-primary/5 p-3">
                    <p className="text-xs font-semibold text-primary mb-1">Your response</p>
                    <p className="text-sm whitespace-pre-wrap">{t.admin_response}</p>
                  </div>
                )}
                <Button size="sm" variant="outline" onClick={() => openRespond(t)}>
                  {t.admin_response ? "Update Response" : "Respond"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <Dialog open={!!respondOpen} onOpenChange={(o) => !o && setRespondOpen(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Respond to Ticket</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="text-sm p-3 rounded bg-muted"><strong>{respondOpen?.subject}</strong><p className="mt-1 text-muted-foreground whitespace-pre-wrap">{respondOpen?.message}</p></div>
            <div><Label>Response</Label><Textarea rows={6} value={response} onChange={(e) => setResponse(e.target.value)} /></div>
            <div>
              <Label>Status</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter><Button onClick={saveResponse}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminHelpCenter;
