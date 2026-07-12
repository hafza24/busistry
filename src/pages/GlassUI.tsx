import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import SEO from "@/components/SEO";

const GlassUI = () => (
  <div className="container py-16 md:py-24">
    <SEO title="Glass UI — Busistree" description="Glassmorphism buttons and cards in the Busistree theme." path="/glass-ui" />

    <header className="max-w-2xl mb-12">
      <p className="text-xs uppercase tracking-[0.2em] text-primary font-semibold mb-3">Component library</p>
      <h1 className="text-4xl md:text-5xl font-bold font-display text-foreground tracking-tight">
        Glass buttons & cards
      </h1>
      <p className="text-muted-foreground mt-3">
        Frosted, glossy surfaces tinted with the Busistree palette — including status tones.
      </p>
    </header>

    {/* Pill buttons */}
    <section className="mb-16">
      <h2 className="text-sm uppercase tracking-wider text-muted-foreground mb-6">Pill buttons</h2>
      <div className="glass-frame inline-flex flex-wrap gap-3 rounded-full !p-3">
        <Button variant="glass" size="lg" className="rounded-full">Primary</Button>
        <Button variant="glass-accent" size="lg" className="rounded-full">Accent</Button>
        <Button variant="glass-brand" size="lg" className="rounded-full">Brand</Button>
      </div>

      <div className="mt-4 glass-frame inline-flex flex-wrap gap-3 rounded-full !p-3">
        <Button variant="glass-success" size="lg" className="rounded-full">Success</Button>
        <Button variant="glass-warning" size="lg" className="rounded-full">Warning</Button>
        <Button variant="glass-info" size="lg" className="rounded-full">Info</Button>
        <Button variant="glass-danger" size="lg" className="rounded-full">Danger</Button>
      </div>
    </section>

    {/* Square glass cards */}
    <section>
      <h2 className="text-sm uppercase tracking-wider text-muted-foreground mb-6">Glass cards</h2>
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <GlassCard tone="primary" className="aspect-square">
          <div className="text-xs uppercase tracking-[0.25em] opacity-90">Tone</div>
          <div className="text-2xl font-display font-bold mt-1">Primary</div>
        </GlassCard>
        <GlassCard tone="accent" className="aspect-square">
          <div className="text-xs uppercase tracking-[0.25em] opacity-90">Tone</div>
          <div className="text-2xl font-display font-bold mt-1">Accent</div>
        </GlassCard>
        <GlassCard tone="brand" className="aspect-square">
          <div className="text-xs uppercase tracking-[0.25em] opacity-90">Tone</div>
          <div className="text-2xl font-display font-bold mt-1">Brand</div>
        </GlassCard>
        <GlassCard tone="glow" className="aspect-square">
          <div className="text-xs uppercase tracking-[0.25em] opacity-90">Tone</div>
          <div className="text-2xl font-display font-bold mt-1">Glow</div>
        </GlassCard>
        <GlassCard tone="success" className="aspect-square">
          <div className="text-xs uppercase tracking-[0.25em] opacity-90">Status</div>
          <div className="text-2xl font-display font-bold mt-1">Success</div>
        </GlassCard>
        <GlassCard tone="warning" className="aspect-square">
          <div className="text-xs uppercase tracking-[0.25em] opacity-90">Status</div>
          <div className="text-2xl font-display font-bold mt-1">Warning</div>
        </GlassCard>
        <GlassCard tone="info" className="aspect-square">
          <div className="text-xs uppercase tracking-[0.25em] opacity-90">Status</div>
          <div className="text-2xl font-display font-bold mt-1">Info</div>
        </GlassCard>
        <GlassCard tone="danger" className="aspect-square">
          <div className="text-xs uppercase tracking-[0.25em] opacity-90">Status</div>
          <div className="text-2xl font-display font-bold mt-1">Danger</div>
        </GlassCard>
      </div>
    </section>
  </div>
);

export default GlassUI;
