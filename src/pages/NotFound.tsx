import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, LifeBuoy } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-secondary/30 px-4">
      <SEO
        title="Page not found — Busistree"
        description="The page you're looking for doesn't exist. Head back to the Busistree homepage."
        path={location.pathname}
        noindex
      />
      <div className="max-w-lg w-full text-center">
        <div className="mx-auto mb-8 w-48 h-48 relative" aria-hidden="true">
          <svg viewBox="0 0 200 200" className="w-full h-full">
            <circle cx="100" cy="100" r="92" fill="hsl(var(--primary) / 0.08)" />
            <circle cx="100" cy="100" r="70" fill="hsl(var(--primary) / 0.12)" />
            <text x="100" y="118" textAnchor="middle" fontSize="56" fontWeight="800" fill="hsl(var(--primary))" fontFamily="'Space Grotesk', sans-serif">404</text>
            <circle cx="68" cy="78" r="6" fill="hsl(var(--primary))" />
            <circle cx="132" cy="78" r="6" fill="hsl(var(--primary))" />
            <path d="M70 140 Q100 120 130 140" stroke="hsl(var(--primary))" strokeWidth="4" fill="none" strokeLinecap="round" />
          </svg>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold font-display text-foreground mb-3">
          This page wandered off
        </h1>
        <p className="text-muted-foreground mb-8">
          We couldn't find <span className="font-mono text-foreground">{location.pathname}</span>. It may have moved, or the link could be broken.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Button asChild>
            <Link to="/"><Home className="h-4 w-4 mr-2" aria-hidden="true" /> Go home</Link>
          </Button>
          <Button variant="outline" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" aria-hidden="true" /> Go back
          </Button>
          <Button variant="ghost" asChild>
            <Link to="/contact"><LifeBuoy className="h-4 w-4 mr-2" aria-hidden="true" /> Contact support</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
