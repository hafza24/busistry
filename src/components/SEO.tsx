import { Helmet } from "react-helmet-async";

const SITE_URL = "https://busistry.lovable.app";

interface SEOProps {
  title: string;
  description: string;
  path: string;
  noindex?: boolean;
  jsonLd?: Record<string, unknown>;
  image?: string | null;
  imageAlt?: string | null;
  keywords?: string[] | null;
  type?: "website" | "article" | "product";
}

/**
 * Per-route head: title, description, canonical, og:*, optional JSON-LD.
 * Static og:* in index.html remain as fallback for non-JS crawlers.
 */
const SEO = ({
  title,
  description,
  path,
  noindex,
  jsonLd,
  image,
  imageAlt,
  keywords,
  type = "website",
}: SEOProps) => {
  const url = `${SITE_URL}${path}`;
  const absImage = image
    ? image.startsWith("http")
      ? image
      : `${SITE_URL}${image.startsWith("/") ? image : `/${image}`}`
    : null;
  const kw = keywords?.filter(Boolean).join(", ");
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      {kw && <meta name="keywords" content={kw} />}
      <link rel="canonical" href={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      {absImage && <meta property="og:image" content={absImage} />}
      {absImage && imageAlt && <meta property="og:image:alt" content={imageAlt} />}
      <meta name="twitter:card" content={absImage ? "summary_large_image" : "summary"} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {absImage && <meta name="twitter:image" content={absImage} />}
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      {jsonLd && (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      )}
    </Helmet>
  );
};

export default SEO;
