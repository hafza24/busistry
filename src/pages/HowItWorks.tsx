import SEO from "@/components/SEO";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import step1 from "@/assets/how-step-1.jpg";
import step2 from "@/assets/how-step-2.jpg";
import step3 from "@/assets/how-step-3.jpg";
import step4 from "@/assets/how-step-4.jpg";
import step5 from "@/assets/how-step-5.jpg";
import step6 from "@/assets/how-step-6.jpg";

const steps = [
  {
    image: step2,
    title: "Select a template",
    desc: "Browse our catalog and pick a template that fits your industry, audience and ambition. Every template is production-ready and fully customisable.",
  },
  {
    image: step5,
    title: "Choose your plan",
    desc: "Compare plans side by side and pick the one that matches your scale — Free, Rent or Buy. Clear pricing, no hidden fees, cancel or upgrade anytime.",
  },
  {
    image: step1,
    title: "Fill the brief form",
    desc: "Answer a short onboarding form about your business, audience, content and preferences. It's the only thing we need to start building.",
  },
  {
    image: step3,
    title: "Place your order",
    desc: "Review your template, plan and brief in one summary, then confirm. Free-tier orders start immediately — paid plans use manual mobile wallet checkout in PKR.",
  },
  {
    image: step6,
    title: "Get confirmation",
    desc: "You'll receive an instant order confirmation with your tracking ID, project timeline and a direct line to the team building your site.",
  },
  {
    image: step4,
    title: "Site delivered in 48 hours",
    desc: "Designers, writers and engineers ship your live site inside two working days. Real copy, real images, real production hosting — ready to launch.",
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
          Order a website in six quiet steps.
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">
          It's about you and your business — a comfortable brief, a real team, and a site live in two working days.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <Button size="lg" asChild className="shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.02] transition-all duration-300">
            <Link to="/onboarding">Place an order</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link to="/templates">Browse templates</Link>
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-3">Free tier available — no card required.</p>
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

      <div className="mt-24 rounded-3xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground p-10 md:p-16 shadow-[0_30px_80px_-30px_hsl(var(--primary)/0.6)] relative overflow-hidden">
        <div aria-hidden="true" className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-primary-foreground/10 blur-3xl" />
        <div aria-hidden="true" className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-primary-foreground/10 blur-3xl" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="max-w-xl">
            <h2 className="text-3xl md:text-4xl font-bold font-display tracking-tight mb-3">
              Ready to place your order?
            </h2>
            <p className="text-primary-foreground/85 text-lg leading-relaxed">
              Start the request flow now — share your brief, pick a template, and we'll have your site live in 48 hours.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Button size="lg" variant="secondary" asChild className="shadow-lg hover:scale-[1.02] transition-all duration-300">
              <Link to="/onboarding">Place an order</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="bg-transparent border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
              <Link to="/track">Track an order</Link>
            </Button>
          </div>
        </div>
      </div>

    </div>
  </div>
);

export default HowItWorks;
