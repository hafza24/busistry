import { useParams, Link, Navigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft } from "lucide-react";
import { useCaseStudyBySlug } from "@/hooks/useCaseStudies";
import { Skeleton } from "@/components/ui/skeleton";

const CaseStudyDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data, isLoading } = useCaseStudyBySlug(slug);

  if (isLoading) {
    return (
      <main className="container max-w-3xl py-16 space-y-6">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="aspect-video w-full rounded-lg" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </main>
    );
  }

  if (!data) return <Navigate to="/reviews" replace />;

  const seoTitle = data.seo_title || `${data.title} — Case Study`;
  const seoDesc = data.seo_description || data.excerpt || "";
  const ogImage = data.og_image_url || data.cover_image_url || undefined;

  return (
    <>
      <Helmet>
        <title>{seoTitle}</title>
        {seoDesc && <meta name="description" content={seoDesc} />}
        {data.seo_keywords?.length > 0 && <meta name="keywords" content={data.seo_keywords.join(", ")} />}
        <meta property="og:title" content={seoTitle} />
        {seoDesc && <meta property="og:description" content={seoDesc} />}
        <meta property="og:type" content="article" />
        {ogImage && <meta property="og:image" content={ogImage} />}
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href={`/case-studies/${data.slug}`} />
      </Helmet>

      <main className="container max-w-3xl py-12 md:py-16">
        <Link to="/reviews" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to Reviews
        </Link>

        <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-primary mb-3">{data.tag}</p>
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight text-foreground mb-4">
          {data.title}
        </h1>
        {data.excerpt && (
          <p className="text-lg text-muted-foreground mb-8">{data.excerpt}</p>
        )}
        {(data.customer_name || data.customer_role) && (
          <p className="text-sm text-muted-foreground mb-8">
            {data.customer_name}
            {data.customer_role && <span> • {data.customer_role}</span>}
          </p>
        )}

        {data.cover_image_url && (
          <div className="aspect-video rounded-lg overflow-hidden mb-10 bg-muted">
            <img src={data.cover_image_url} alt={data.title} className="w-full h-full object-cover" />
          </div>
        )}

        {data.content && (
          <div className="prose prose-neutral dark:prose-invert max-w-none whitespace-pre-line text-foreground leading-relaxed">
            {data.content}
          </div>
        )}
      </main>
    </>
  );
};

export default CaseStudyDetail;
