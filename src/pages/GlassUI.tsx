import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import SEO from "@/components/SEO";

const GlassUI = () => (
  <div className="container py-16 md:py-24">
    <SEO title="Glass UI — Busistree" description="Glassmorphism buttons and cards in the Busistree theme." />

    <header className="max-w-2xl mb-12">
      <p className="text-xs uppercase tracking-[0.2em] text-primary font-semibold mb-3">Component library</p>
      <h1 className="text-4xl md:text-5xl font-bold font-display text-foreground tracking-tight">
        Glass buttons & cards
      </h1>
      <p className="text-muted-foreground mt-3">
        Frosted, glossy surfaces tinted with the Busistree teal / blue / indigo palette.
      </p>
    </header>

    {/* Pill buttons */}
    <section className="mb-16">
      <h2 className="text-sm uppercase tracking-wider text-muted-foreground mb-6">Pill buttons</h2>
      <div className="glass-frame inline-flex flex-wrap gap-3 rounded-full !p-3">
        <Button variant="glass" size="lg" className="rounded-full">Vector</Button>
        <Button variant="glass-accent" size="lg" className="rounded-full">Buttons</Button>
        <Button variant="glass-brand" size="lg" className="rounded-full">Web</Button>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <Button variant="glass" className="rounded-full h-12 w-12 p-0" aria-label="Primary">A</Button>
        <Button variant="glass-accent" className="rounded-full h-12 w-12 p-0" aria-label="Accent">B</Button>
        <Button variant="glass-brand" className="rounded-full h-12 w-12 p-0" aria-label="Brand">C</Button>
      </div>
    </section>

    {/* Square glass cards */}
    <section>
      <h2 className="text-sm uppercase tracking-wider text-muted-foreground mb-6">Glass cards</h2>
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        <GlassCard tone="primary" className="aspect-square">
          <div className="text-xs uppercase tracking-[0.25em] opacity-90">Vector</div>
          <div className="text-2xl font-display font-bold mt-1">Buttons web</div>
        </GlassCard>
        <GlassCard tone="accent" className="aspect-square">
          <div className="text-xs uppercase tracking-[0.25em] opacity-90">Vector</div>
          <div className="text-2xl font-display font-bold mt-1">Buttons web</div>
        </GlassCard>
        <GlassCard tone="brand" className="aspect-square">
          <div className="text-xs uppercase tracking-[0.25em] opacity-90">Vector</div>
          <div className="text-2xl font-display font-bold mt-1">Buttons web</div>
        </GlassCard>
      </div>
    </section>
  </div>
);

export default GlassUI;
