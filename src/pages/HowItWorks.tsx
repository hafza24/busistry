import SEO from "@/components/SEO";
import { motion } from "framer-motion";
import { Search, CreditCard, CheckCircle, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const steps = [
  { icon: Search, title: "Browse Templates", desc: "Explore our collection of professionally designed store templates, organized by niche — clothing, perfume, jewelry, bakery, and more." },
  { icon: CreditCard, title: "Choose a Plan & Pay", desc: "Select a plan that fits your budget. Pay easily via Easypaisa, JazzCash, NayaPay, Raast, or bank transfer. All prices in PKR." },
  { icon: CheckCircle, title: "We Set Up Your Store", desc: "Our team reviews your request and activates your store. You'll get a unique subdomain or custom domain." },
  { icon: Rocket, title: "Start Selling!", desc: "Add your products, customize your store, and start taking orders. We handle hosting and security." },
];

const HowItWorks = () => (
  <div className="py-16">
    <SEO
      title="How It Works — Busistree"
      description="Four steps from template to live website: browse, choose a plan, we set it up, and you start selling. Delivered in 24–48 hours."
      path="/how-it-works"
    />
    <div className="container max-w-3xl">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold font-display text-foreground mb-4 tracking-tight">How It Works</h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          Launch your professional online store in four simple steps. We handle the technical heavy lifting while you focus on growth.
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
          <Link to="/templates">Browse Templates</Link>
        </Button>
      </div>
    </div>
  </div>
);

export default HowItWorks;
