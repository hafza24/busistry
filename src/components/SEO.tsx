import { Helmet } from "react-helmet-async";

const SITE_URL = "https://busistry.lovable.app";

interface SEOProps {
  title: string;
  description: string;
  path: string;
  noindex?: boolean;
  jsonLd?: Record<string, unknown>;
}

/**
 * Per-route head: title, description, canonical, og:*, optional JSON-LD.
 * Static og:* in index.html remain as fallback for non-JS crawlers.
 */
const SEO = ({ title, description, path, noindex, jsonLd }: SEOProps) => {
  const url = `${SITE_URL}${path}`;
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      {jsonLd && (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      )}
    </Helmet>
  );
};

export default SEO;
