import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import SEO from "@/components/SEO";
import { Search, LifeBuoy, MessageSquarePlus, BookOpen, ChevronRight, Sparkles } from "lucide-react";

interface HelpCategory {
  id: string; name: string; slug: string; description: string | null; icon: string | null;
}
interface HelpArticle {
  id: string; category_id: string | null; title: string; slug: string;
  excerpt: string | null; tags: string[]; is_featured: boolean; views: number;
}
interface Ticket {
  id: string; subject: string; message: string; status: string; category: string;
  priority: string; admin_response: string | null; created_at: string; responded_at: string | null;
}

const statusVariant: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  open: "default", pending: "secondary", resolved: "outline", closed: "outline",
};

const Help = () => {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const [categories, setCategories] = useState<HelpCategory[]>([]);
  const [articles, setArticles] = useState<HelpArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState<string>("all");
  const tab = params.get("tab") || "browse";

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [{ data: cats }, { data: arts }] = await Promise.all([
        supabase.from("help_categories").select("*").eq("is_active", true).order("sort_order"),
        supabase.from("help_articles").select("*").eq("is_published", true).order("is_featured", { ascending: false }).order("sort_order"),
      ]);
      setCategories(cats || []);
      setArticles(arts || []);
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return articles.filter((a) => {
      if (activeCat !== "all" && a.category_id !== activeCat) return false;
      if (!q) return true;
      return a.title.toLowerCase().includes(q)
        || (a.excerpt || "").toLowerCase().includes(q)
        || a.tags.some((t) => t.toLowerCase().includes(q));
    });
  }, [articles, search, activeCat]);

  const featured = articles.filter((a) => a.is_featured).slice(0, 3);

  return (
    <>
      <SEO title="Help Center — Busistree" description="Guides, FAQs and support for Busistree." path="/help" />
      <div className="container max-w-6xl py-10 md:py-14">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <LifeBuoy className="h-4 w-4" /> Help Center
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-3">How can we help?</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">Search our guides or get in touch with our team.</p>
          <div className="relative max-w-xl mx-auto mt-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search articles, guides, FAQs..." className="pl-10 h-12" />
          </div>
        </div>

        <Tabs value={tab} onValueChange={(v) => setParams({ tab: v }, { replace: true })}>
          <TabsList className="mb-6">
            <TabsTrigger value="browse">Browse</TabsTrigger>
            <TabsTrigger value="contact">Contact Support</TabsTrigger>
            {user && <TabsTrigger value="tickets">My Tickets</TabsTrigger>}
          </TabsList>

          <TabsContent value="browse" className="space-y-8">
            {!search && featured.length > 0 && (
              <div>
                <h2 className="font-display text-xl font-semibold mb-3 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" /> Featured
                </h2>
                <div className="grid md:grid-cols-3 gap-4">
                  {featured.map((a) => <ArticleCard key={a.id} article={a} />)}
                </div>
              </div>
            )}

            {!search && (
              <div className="flex flex-wrap gap-2">
                <Button variant={activeCat === "all" ? "default" : "outline"} size="sm" onClick={() => setActiveCat("all")}>All</Button>
                {categories.map((c) => (
                  <Button key={c.id} variant={activeCat === c.id ? "default" : "outline"} size="sm" onClick={() => setActiveCat(c.id)}>
                    {c.name}
                  </Button>
                ))}
              </div>
            )}

            {loading ? (
              <div className="grid md:grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32" />)}
              </div>
            ) : filtered.length === 0 ? (
              <EmptyState icon={BookOpen} title="No articles found" description="Try a different search or category." />
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {filtered.map((a) => <ArticleCard key={a.id} article={a} />)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="contact">
            <ContactForm user={user} onSubmitted={() => setParams({ tab: "tickets" }, { replace: true })} />
          </TabsContent>

          {user && (
            <TabsContent value="tickets">
              <MyTickets userId={user.id} />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </>
  );
};

const ArticleCard = ({ article }: { article: HelpArticle }) => (
  <Link to={`/help/${article.slug}`} className="group">
    <Card className="h-full transition-all hover:shadow-md hover:border-primary/50">
      <CardHeader>
        <CardTitle className="text-base flex items-start justify-between gap-2">
          <span className="group-hover:text-primary transition-colors">{article.title}</span>
          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary shrink-0 mt-0.5" />
        </CardTitle>
        {article.excerpt && <CardDescription className="line-clamp-2">{article.excerpt}</CardDescription>}
      </CardHeader>
      {article.tags.length > 0 && (
        <CardContent>
          <div className="flex flex-wrap gap-1">
            {article.tags.slice(0, 3).map((t) => <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>)}
          </div>
        </CardContent>
      )}
    </Card>
  </Link>
);

const ContactForm = ({ user, onSubmitted }: { user: any; onSubmitted: () => void }) => {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState("general");
  const [priority, setPriority] = useState("normal");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!user) { toast.error("Please sign in to contact support."); return; }
    const s = subject.trim(), m = message.trim();
    if (s.length < 3 || s.length > 200) { toast.error("Subject must be 3-200 characters."); return; }
    if (m.length < 10 || m.length > 2000) { toast.error("Message must be 10-2000 characters."); return; }
    setSubmitting(true);
    const { error } = await supabase.from("support_tickets").insert({
      user_id: user.id, subject: s, message: m, category, priority,
    });
    setSubmitting(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Ticket submitted. We'll get back to you soon.");
    setSubject(""); setMessage(""); setCategory("general"); setPriority("normal");
    onSubmitted();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><MessageSquarePlus className="h-5 w-5" /> Contact Support</CardTitle>
        <CardDescription>{user ? "We usually respond within 1 business day." : "Please sign in to open a support ticket."}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="billing">Billing & Payments</SelectItem>
                <SelectItem value="technical">Technical Issue</SelectItem>
                <SelectItem value="account">Account</SelectItem>
                <SelectItem value="feature">Feature Request</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Priority</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <Label>Subject</Label>
          <Input value={subject} onChange={(e) => setSubject(e.target.value)} maxLength={200} placeholder="Briefly describe your issue" />
        </div>
        <div>
          <Label>Message</Label>
          <Textarea value={message} onChange={(e) => setMessage(e.target.value)} maxLength={2000} rows={6} placeholder="Provide as much detail as possible..." />
          <p className="text-xs text-muted-foreground mt-1">{message.length}/2000</p>
        </div>
        <Button onClick={submit} disabled={submitting || !user} className="w-full">
          {submitting ? "Submitting..." : "Submit Ticket"}
        </Button>
      </CardContent>
    </Card>
  );
};

const MyTickets = ({ userId }: { userId: string }) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("support_tickets").select("*").eq("user_id", userId).order("created_at", { ascending: false });
      setTickets(data || []); setLoading(false);
    })();
  }, [userId]);

  if (loading) return <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div>;
  if (tickets.length === 0) return <EmptyState icon={LifeBuoy} title="No tickets yet" description="Submit a ticket from the Contact Support tab." />;

  return (
    <div className="space-y-3">
      {tickets.map((t) => (
        <Card key={t.id}>
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle className="text-base">{t.subject}</CardTitle>
                <CardDescription>{new Date(t.created_at).toLocaleString()} · {t.category} · {t.priority}</CardDescription>
              </div>
              <Badge variant={statusVariant[t.status] || "outline"}>{t.status}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm whitespace-pre-wrap text-muted-foreground">{t.message}</p>
            {t.admin_response && (
              <div className="rounded-md border border-primary/30 bg-primary/5 p-3">
                <p className="text-xs font-semibold text-primary mb-1">Support response</p>
                <p className="text-sm whitespace-pre-wrap">{t.admin_response}</p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default Help;
