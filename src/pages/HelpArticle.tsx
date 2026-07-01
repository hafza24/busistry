import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Eye } from "lucide-react";
import SEO from "@/components/SEO";
import { EmptyState } from "@/components/ui/empty-state";
import { BookOpen } from "lucide-react";

interface Article {
  id: string; title: string; slug: string; excerpt: string | null; content: string;
  tags: string[]; views: number; updated_at: string; category_id: string | null;
}

const HelpArticle = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [categoryName, setCategoryName] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("help_articles")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle();
      setArticle(data as Article | null);
      if (data?.category_id) {
        const { data: cat } = await supabase.from("help_categories").select("name").eq("id", data.category_id).maybeSingle();
        setCategoryName(cat?.name || null);
      }
      if (data) {
        await supabase.from("help_articles").update({ views: (data.views || 0) + 1 }).eq("id", data.id);
      }
      setLoading(false);
    })();
  }, [slug]);

  if (loading) {
    return <div className="container max-w-3xl py-12 space-y-4"><Skeleton className="h-8 w-3/4" /><Skeleton className="h-4 w-1/3" /><Skeleton className="h-64" /></div>;
  }
  if (!article) {
    return (
      <div className="container max-w-3xl py-12">
        <EmptyState icon={BookOpen} title="Article not found" description="This article may have been moved or unpublished."
          action={<Button onClick={() => navigate("/help")}>Back to Help Center</Button>} />
      </div>
    );
  }

  return (
    <>
      <SEO title={`${article.title} — Help`} description={article.excerpt || `Help article: ${article.title}`} path={`/help/${article.slug}`} />
      <div className="container max-w-3xl py-10">
        <Button variant="ghost" size="sm" asChild className="mb-6">
          <Link to="/help"><ArrowLeft className="h-4 w-4 mr-1" /> Back to Help Center</Link>
        </Button>
        <div className="mb-6">
          {categoryName && <Badge variant="secondary" className="mb-3">{categoryName}</Badge>}
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-3">{article.title}</h1>
          {article.excerpt && <p className="text-lg text-muted-foreground">{article.excerpt}</p>}
          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-4">
            <span>Updated {new Date(article.updated_at).toLocaleDateString()}</span>
            <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {article.views + 1} views</span>
          </div>
        </div>
        <div className="prose prose-neutral dark:prose-invert max-w-none whitespace-pre-wrap text-foreground/90 leading-relaxed">
          {article.content || <p className="text-muted-foreground italic">No content yet.</p>}
        </div>
        {article.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-border">
            {article.tags.map((t) => <Badge key={t} variant="outline">{t}</Badge>)}
          </div>
        )}
        <div className="mt-10 p-5 rounded-lg border border-border bg-muted/30">
          <p className="text-sm font-medium mb-1">Still need help?</p>
          <p className="text-sm text-muted-foreground mb-3">Reach out to our support team and we'll help you out.</p>
          <Button size="sm" asChild><Link to="/help?tab=contact">Contact Support</Link></Button>
        </div>
      </div>
    </>
  );
};

export default HelpArticle;
