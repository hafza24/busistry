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
    <div className="container max-w-3xl">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold font-display text-foreground mb-4">How It Works</h1>
        <p className="text-lg text-muted-foreground">Four simple steps to your online store</p>
      </div>

      <div className="space-y-12">
        {steps.map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex gap-6 items-start"
          >
            <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <s.icon className="h-7 w-7 text-primary" />
            </div>
            <div>
              <div className="text-xs font-bold text-primary mb-1">STEP {i + 1}</div>
              <h3 className="text-xl font-semibold font-display text-foreground mb-2">{s.title}</h3>
              <p className="text-muted-foreground">{s.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="text-center mt-16">
        <Button size="lg" asChild>
          <Link to="/templates">Browse Templates</Link>
        </Button>
      </div>
    </div>
  </div>
);

export default HowItWorks;
