import SEO from "@/components/SEO";
import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
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


const StepRow = ({ s, i }: { s: typeof steps[number]; i: number }) => {
  const reverse = i % 2 === 1;
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [80, -80]);
  const imgY = useTransform(scrollYProgress, [0, 1], [40, -40]);
  const numY = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const opacity = useTransform(scrollYProgress, [0, 0.25, 0.75, 1], [0, 1, 1, 0.4]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.92, 1, 0.98]);

  return (
    <motion.div
      ref={ref}
      style={{ opacity }}
      className={`grid md:grid-cols-2 gap-10 md:gap-16 items-center ${reverse ? "md:[&>*:first-child]:order-2" : ""}`}
    >
      <div className="relative">
        <motion.span
          aria-hidden="true"
          style={{ y: numY }}
          className={`absolute -top-6 md:-top-10 ${reverse ? "right-2 md:right-6" : "left-2 md:left-6"} text-[8rem] md:text-[11rem] leading-none font-display font-bold text-primary/10 select-none`}
        >
          {String(i + 1).padStart(2, "0")}
        </motion.span>
        <motion.div
          style={{ y: imgY, scale }}
          className="relative z-10 rounded-3xl bg-primary/5 border border-primary/10 p-6 md:p-10 shadow-[0_20px_60px_-30px_hsl(var(--primary)/0.4)]"
        >
          <img
            src={s.image}
            alt={s.title}
            loading="lazy"
            width={1024}
            height={1024}
            className="w-full h-auto rounded-2xl"
          />
        </motion.div>
      </div>

      <motion.div style={{ y }}>
        <motion.span
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-xs font-bold tracking-[0.2em] text-primary uppercase mb-3 block font-display"
        >
          Step {String(i + 1).padStart(2, "0")}
        </motion.span>
        <motion.h3
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-3xl md:text-4xl font-bold font-display text-foreground mb-4 tracking-tight"
        >
          {s.title}
        </motion.h3>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-muted-foreground leading-relaxed text-lg"
        >
          {s.desc}
        </motion.p>
      </motion.div>
    </motion.div>
  );
};

const StepsWithConnector = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 70%", "end 60%"],
  });
  const pathLength = useTransform(scrollYProgress, [0, 1], [0, 1]);

  // Zig-zag path across a 100 x 1000 viewBox (preserveAspectRatio=none stretches to container)
  // Each step alternates image side; connector snakes between them.
  const pathD = `
    M 50 0
    C 50 80, 15 120, 15 200
    C 15 280, 85 320, 85 400
    C 85 480, 15 520, 15 600
    C 15 680, 85 720, 85 800
    C 85 880, 50 920, 50 1000
  `;

  return (
    <div ref={containerRef} className="relative">
      <svg
        aria-hidden="true"
        viewBox="0 0 100 1000"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-0 hidden md:block w-full h-full z-0"
      >
        {/* faint guide track */}
        <path
          d={pathD}
          fill="none"
          stroke="hsl(var(--primary) / 0.08)"
          strokeWidth="0.6"
          strokeLinecap="round"
          strokeDasharray="1.5 2"
          vectorEffect="non-scaling-stroke"
        />
        {/* animated drawn line */}
        <motion.path
          d={pathD}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="1.2"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          style={{ pathLength, opacity: pathLength }}
        />
      </svg>

      <div className="relative z-10 space-y-24 md:space-y-32">
        {steps.map((s, i) => (
          <StepRow key={s.title} s={s} i={i} />
        ))}
      </div>
    </div>
  );
};


const HowItWorks = () => {
  const { scrollYProgress } = useScroll();
  const progressScaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
  <div className="py-16">
    <motion.div
      style={{ scaleX: progressScaleX, transformOrigin: "0% 50%" }}
      className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-primary via-primary/70 to-primary z-50"
    />
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
        
      </div>


      <StepsWithConnector />



      {/* How to place your order — detailed */}
      <section className="mt-24 md:mt-32">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 text-[11px] font-medium tracking-[0.18em] uppercase text-primary mb-4">
            <span className="h-px w-6 bg-primary" />
            Placing your order
          </div>
          <h2 className="text-3xl md:text-4xl font-bold font-display text-foreground tracking-tight mb-3">
            How to place your order
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            A quiet, guided flow — here's exactly what you'll need before you start, and what happens the moment you hit submit.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          {/* Requirements */}
          <div className="rounded-3xl border border-border bg-card p-8 md:p-10 shadow-[0_20px_60px_-40px_hsl(var(--primary)/0.4)]">
            <div className="flex items-center gap-3 mb-6">
              <span className="h-9 w-9 rounded-xl bg-primary/10 text-primary grid place-items-center font-display font-bold">1</span>
              <h3 className="text-xl md:text-2xl font-bold font-display tracking-tight">Before you start — what to prepare</h3>
            </div>
            <ul className="space-y-4 text-muted-foreground">
              {[
                { t: "Business basics", d: "Business name, tagline, a short description and the industry you serve." },
                { t: "Contact & location", d: "Public email, phone, WhatsApp, city and service area." },
                { t: "Brand assets", d: "Logo (SVG or PNG), 1–2 brand colors, and any fonts you love. We'll fill the gaps." },
                { t: "Content & imagery", d: "Rough copy for About, Services and Contact — plus product photos if you sell online." },
                { t: "Preferred domain", d: "A domain you own, or a name you'd like us to register for you." },
                { t: "Payment details", d: "For paid plans: JazzCash or Easypaisa handy for manual PKR checkout." },
              ].map((r) => (
                <li key={r.t} className="flex gap-3">
                  <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  <span>
                    <span className="font-semibold text-foreground">{r.t}.</span>{" "}
                    {r.d}
                  </span>
                </li>
              ))}
            </ul>
            <p className="text-xs text-muted-foreground/80 mt-6 leading-relaxed">
              Missing something? Submit anyway — our team will follow up on the details after confirmation.
            </p>
          </div>

          {/* After submission */}
          <div className="rounded-3xl border border-primary/20 bg-primary/5 p-8 md:p-10 shadow-[0_20px_60px_-40px_hsl(var(--primary)/0.4)]">
            <div className="flex items-center gap-3 mb-6">
              <span className="h-9 w-9 rounded-xl bg-primary text-primary-foreground grid place-items-center font-display font-bold">2</span>
              <h3 className="text-xl md:text-2xl font-bold font-display tracking-tight">After you hit submit</h3>
            </div>
            <ol className="space-y-5">
              {[
                { t: "Instant confirmation", d: "You get an email with a tracking ID, your brief summary, and a link to the order dashboard.", time: "Within 1 minute" },
                { t: "Payment verification", d: "For paid plans, our team confirms your JazzCash/Easypaisa transfer manually.", time: "Within 2 hours" },
                { t: "Kickoff & brief review", d: "A project lead reviews your brief and reaches out on WhatsApp or email with any questions.", time: "Within 4 hours" },
                { t: "Design & build", d: "Designers, writers and engineers build your site on the chosen template — real content, real images.", time: "Hours 4 – 40" },
                { t: "Preview & feedback", d: "You get a staging link to review. One free revision round is included on every plan.", time: "Around hour 40" },
                { t: "Launch", d: "We connect your domain, enable SSL, and push your site live to production hosting.", time: "By hour 48" },
              ].map((s, idx) => (
                <li key={s.t} className="relative pl-8">
                  <span className="absolute left-0 top-0.5 h-6 w-6 rounded-full bg-primary/15 text-primary text-xs font-bold font-display grid place-items-center">
                    {idx + 1}
                  </span>
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-1">
                    <span className="font-semibold text-foreground">{s.t}</span>
                    <span className="text-[11px] font-medium tracking-wide uppercase text-primary/80">{s.time}</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.d}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Small print / policies */}
        <div className="grid sm:grid-cols-3 gap-4 mt-8">
          {[
            { t: "Free tier", d: "No card required. Start with a free starter site and upgrade whenever you're ready." },
            { t: "Refunds", d: "Full refund inside 24 hours if we haven't started building yet. Just reply to your confirmation email." },
            { t: "Ownership", d: "Buy plans transfer full ownership of code, content and domain to you on launch day." },
          ].map((p) => (
            <div key={p.t} className="rounded-2xl border border-border bg-card p-5">
              <div className="text-sm font-semibold text-foreground mb-1">{p.t}</div>
              <p className="text-sm text-muted-foreground leading-relaxed">{p.d}</p>
            </div>
          ))}
        </div>
      </section>



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
};

export default HowItWorks;
