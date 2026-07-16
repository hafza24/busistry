import { useParams, Link, Navigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useCaseStudyBySlug } from "@/hooks/useCaseStudies";
import { Skeleton } from "@/components/ui/skeleton";

const easeOut = [0.22, 1, 0.36, 1] as const;

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
  const canonicalUrl = `https://busistry.lovable.app/case-studies/${data.slug}`;

  return (
    <>
      <Helmet>
        <title>{seoTitle}</title>
        {seoDesc && <meta name="description" content={seoDesc} />}
        {data.seo_keywords?.length > 0 && <meta name="keywords" content={data.seo_keywords.join(", ")} />}
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={seoTitle} />
        {seoDesc && <meta property="og:description" content={seoDesc} />}
        <meta property="og:type" content="article" />
        <meta property="og:url" content={canonicalUrl} />
        {ogImage && <meta property="og:image" content={ogImage} />}
        <meta name="twitter:card" content={ogImage ? "summary_large_image" : "summary"} />
        <meta name="twitter:title" content={seoTitle} />
        {seoDesc && <meta name="twitter:description" content={seoDesc} />}
        {ogImage && <meta name="twitter:image" content={ogImage} />}
      </Helmet>

      <main className="container max-w-3xl py-12 md:py-16 relative">
        {/* Back link with spring hover */}
        <motion.div
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: easeOut }}
        >
          <Link
            to="/reviews"
            className="group inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary mb-8 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
            <span className="relative">
              Back to Reviews
              <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-gradient-to-r from-primary to-accent group-hover:w-full transition-all duration-500" />
            </span>
          </Link>
        </motion.div>

        {/* Header staggered reveal */}
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.55, ease: easeOut }}
          className="text-[11px] font-semibold uppercase tracking-[0.25em] text-primary mb-3"
        >
          <span className="inline-block relative">
            {data.tag}
            <span className="absolute -bottom-1 left-0 h-[2px] w-8 bg-gradient-to-r from-primary via-primary-glow to-accent" />
          </span>
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.6, ease: easeOut }}
          className="text-3xl md:text-5xl font-extrabold tracking-tight leading-[1.08] text-foreground mb-4"
        >
          {data.title}
        </motion.h1>

        {data.excerpt && (
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6, ease: easeOut }}
            className="text-lg text-muted-foreground mb-8 max-w-2xl"
          >
            {data.excerpt}
          </motion.p>
        )}

        {(data.customer_name || data.customer_role) && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.28, duration: 0.5 }}
            className="text-sm text-muted-foreground mb-8"
          >
            <span className="font-semibold text-foreground">{data.customer_name}</span>
            {data.customer_role && <span> • {data.customer_role}</span>}
          </motion.p>
        )}

        {data.cover_image_url && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.32, duration: 0.8, ease: easeOut }}
            className="relative mb-12 group"
          >
            {/* Aurora glow */}
            <div className="pointer-events-none absolute -inset-2 rounded-3xl bg-gradient-to-br from-primary/40 via-primary-glow/30 to-accent/40 opacity-40 blur-2xl group-hover:opacity-70 transition-opacity duration-700" />

            <div className="relative aspect-video rounded-2xl overflow-hidden bg-muted ring-1 ring-border/70 shadow-[0_20px_60px_-20px_hsl(var(--primary)/0.35)]">
              <img
                src={data.cover_image_url}
                alt={data.title}
                className="w-full h-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
              />
              {/* Shimmer sweep on load */}
              <motion.div
                aria-hidden
                initial={{ x: "-120%" }}
                animate={{ x: "220%" }}
                transition={{ duration: 2, ease: "easeInOut", delay: 0.6 }}
                className="pointer-events-none absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/50 to-transparent blur-2xl mix-blend-overlay"
              />
              {/* Gradient border sheen */}
              <div className="pointer-events-none absolute inset-0 rounded-2xl p-px bg-gradient-to-br from-white/60 via-transparent to-white/10 [mask:linear-gradient(#000_0_0)_content-box,linear-gradient(#000_0_0)] [mask-composite:exclude]" />
            </div>
          </motion.div>
        )}

        {data.content && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: easeOut }}
            className="prose prose-neutral dark:prose-invert max-w-none whitespace-pre-line text-foreground leading-relaxed"
          >
            {data.content}
          </motion.div>
        )}
      </main>
    </>
  );
};

export default CaseStudyDetail;
