import { ReactNode } from "react";
import SEO from "@/components/SEO";

interface Props {
  title: string;
  description: string;
  path: string;
  updated: string;
  children: ReactNode;
}

const LegalLayout = ({ title, description, path, updated, children }: Props) => (
  <>
    <SEO title={`${title} — Busistree`} description={description} path={path} />
    <div className="container max-w-3xl py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold font-display text-foreground mb-2">{title}</h1>
        <p className="text-sm text-muted-foreground">Last updated: {updated}</p>
      </div>
      <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6 text-foreground/90 leading-relaxed [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-foreground [&_h2]:mt-8 [&_h2]:mb-3 [&_h3]:font-semibold [&_h3]:text-lg [&_h3]:mt-6 [&_h3]:mb-2 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1 [&_p]:text-muted-foreground [&_li]:text-muted-foreground">
        {children}
      </div>
      <div className="mt-12 p-4 rounded-lg border border-border bg-muted/30 text-sm text-muted-foreground">
        This document is a general template localized for Pakistan and is not legal advice.
        Please have it reviewed by a qualified lawyer before relying on it commercially.
      </div>
    </div>
  </>
);

export default LegalLayout;
