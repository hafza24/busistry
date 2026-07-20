import SEO from "@/components/SEO";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import step1 from "@/assets/how-step-1.jpg";
import step2 from "@/assets/how-step-2.jpg";
import step3 from "@/assets/how-step-3.jpg";
import step4 from "@/assets/how-step-4.jpg";

const steps = [
  {
    image: step1,
    title: "Share your brief",
    desc: "Tell us the business, the audience and the ambition through a short onboarding form. We turn it into a positioning line, a page plan and a written direction — before anyone opens Figma.",
  },
  {
    image: step2,
    title: "Pick a template & plan",
    desc: "Browse our catalog, choose a template that fits your industry and lock in a plan. Free-tier orders start immediately — no card, no commitment.",
  },
  {
    image: step3,
    title: "We build in 48 hours",
    desc: "Designers, writers and engineers ship your website inside two working days. Real copy, real images, production hosting — delivered to a preview link for your review.",
  },
  {
    image: step4,
    title: "Launch & grow",
    desc: "Approve, go live, and layer in brand, packaging and always-on marketing whenever you're ready. Every next step is optional, modular, and priced clearly.",
  },
];

const HowItWorks = () => (
  <div className="py-16">
    <SEO
      title="How It Works — Order your free website in 48 hours | Busistree"
      description="Four simple steps: share your brief, pick a template, we build in 48 hours, then launch and grow. This is how Busistree ships a business."
      path="/how-it-works"
    />
    <div className="container max-w-6xl">
      <div className="text-center mb-20">
        <div className="inline-flex items-center gap-2 text-[11px] font-medium tracking-[0.18em] uppercase text-primary mb-6">
          <span className="h-px w-6 bg-primary" />
          How it works
        </div>
        <h1 className="text-4xl md:text-5xl font-bold font-display text-foreground mb-4 tracking-tight">
          Order a website in four quiet steps.
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          It's about you and your business — a comfortable brief, a real team, and a site live in two working days.
        </p>
      </div>

      <div className="space-y-24 md:space-y-32">
        {steps.map((s, i) => {
          const reverse = i % 2 === 1;
          return (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6 }}
              className={`grid md:grid-cols-2 gap-10 md:gap-16 items-center ${reverse ? "md:[&>*:first-child]:order-2" : ""}`}
            >
              {/* Image side with big numeral */}
              <div className="relative">
                <span
                  aria-hidden="true"
                  className={`absolute -top-6 md:-top-10 ${reverse ? "right-2 md:right-6" : "left-2 md:left-6"} text-[8rem] md:text-[11rem] leading-none font-display font-bold text-primary/10 select-none`}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="relative z-10 rounded-3xl bg-primary/5 border border-primary/10 p-6 md:p-10 shadow-[0_20px_60px_-30px_hsl(var(--primary)/0.4)]">
                  <img
                    src={s.image}
                    alt={s.title}
                    loading="lazy"
                    width={1024}
                    height={1024}
                    className="w-full h-auto rounded-2xl"
                  />
                </div>
              </div>

              {/* Text side */}
              <div>
                <span className="text-xs font-bold tracking-[0.2em] text-primary uppercase mb-3 block font-display">
                  Step {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="text-3xl md:text-4xl font-bold font-display text-foreground mb-4 tracking-tight">
                  {s.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed text-lg">{s.desc}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="text-center mt-24">
        <Button size="lg" asChild className="shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.02] transition-all duration-300">
          <Link to="/onboarding">Place my order</Link>
        </Button>
        <p className="text-sm text-muted-foreground mt-4">Free tier available — no card required.</p>
      </div>
    </div>
  </div>
);

export default HowItWorks;
