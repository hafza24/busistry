import SEO from "@/components/SEO";
import { motion } from "framer-motion";
import { Search, CreditCard, CheckCircle, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const steps = [
  { icon: Search, title: "1. The brief", desc: "You tell us the business, the audience, the ambition. We turn it into a positioning line, a page plan and a written direction — before anyone opens Figma." },
  { icon: CreditCard, title: "2. The free 48-hour build", desc: "Designers, writers and engineers ship your website inside two working days. Real copy, real images, real production hosting — at no cost." },
  { icon: CheckCircle, title: "3. The brand, dressed properly", desc: "Once the site is live, we layer in identity, product and packaging design at BizStyle — so the physical and digital tell one story." },
  { icon: Rocket, title: "4. The marketing, always on", desc: "Launch campaigns, monthly promos, content and paid — engineered to keep customers arriving long after the launch email fades." },
];

const HowItWorks = () => (
  <div className="py-16">
    <SEO
      title="How It Works — A free website in 48 hours | Busistree"
      description="Four stages: the brief, the free 48-hour build, the brand, and the marketing that keeps working. This is how Busistree ships a business."
      path="/how-it-works"
    />
    <div className="container max-w-3xl">
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 text-[11px] font-medium tracking-[0.18em] uppercase text-primary mb-6">
          <span className="h-px w-6 bg-primary" />
          The process
        </div>
        <h1 className="text-4xl md:text-5xl font-bold font-display text-foreground mb-4 tracking-tight">A website in 48 hours. A business, over time.</h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          The first two days are on us. Everything after — brand, packaging, marketing — is optional, modular, and only if the free work has earned it.
        </p>
      </div>

      <div className="relative">
        {/* Vertical connector rail */}
        <div className="absolute left-[31px] top-8 bottom-8 w-0.5 bg-gradient-to-b from-primary/20 via-primary/50 to-primary/20 hidden md:block" aria-hidden="true" />

        {steps.map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            className={`relative flex gap-6 md:gap-8 group ${i === steps.length - 1 ? "mb-0" : "mb-12"}`}
          >
            <div className="relative z-10 flex-shrink-0">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/15 shadow-sm group-hover:shadow-md group-hover:-translate-y-1 transition-all duration-300">
                <s.icon className="h-7 w-7 text-primary" strokeWidth={1.75} />
              </div>
              <div className="absolute -right-2 -top-2 w-7 h-7 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold border-4 border-background shadow-sm font-display">
                {i + 1}
              </div>
            </div>
            <div className="pt-1">
              <span className="text-xs font-bold tracking-widest text-primary uppercase mb-1 block font-display">
                Step {i + 1}
              </span>
              <h3 className="text-2xl font-bold font-display text-foreground mb-2">{s.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{s.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="text-center mt-16">
        <Button size="lg" asChild className="shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.02] transition-all duration-300">
          <Link to="/onboarding">Claim my free website</Link>
        </Button>
      </div>
    </div>
  </div>
);

export default HowItWorks;
