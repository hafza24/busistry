import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Store, Palette, Rocket, Shield, TrendingUp, Zap, ArrowRight, CheckCircle } from "lucide-react";

const features = [
  { icon: Palette, title: "Beautiful Templates", desc: "Choose from stunning, niche-specific store designs" },
  { icon: Rocket, title: "Launch in Minutes", desc: "No coding — just pick, pay, and go live" },
  { icon: Shield, title: "Fully Managed", desc: "We handle hosting, security, and updates" },
  { icon: TrendingUp, title: "Grow Your Business", desc: "Built-in tools to scale your online presence" },
];

const niches = ["Clothing", "Perfume", "Jewelry", "Electronics", "Bakery", "Cosmetics", "Digital Products"];

const steps = [
  { num: "01", title: "Choose a Template", desc: "Browse our collection by niche" },
  { num: "02", title: "Pick a Plan", desc: "Free, rent, or buy — your choice" },
  { num: "03", title: "Make Payment", desc: "Pay via Easypaisa, JazzCash, or bank" },
  { num: "04", title: "Go Live!", desc: "Your store is activated within hours" },
];

const Index = () => {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="container relative py-20 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-3xl mx-auto text-center"
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              🇵🇰 Made for Pakistani Entrepreneurs
            </span>
            <h1 className="text-4xl md:text-6xl font-bold font-display tracking-tight text-foreground leading-tight">
              Launch Your Online Store{" "}
              <span className="text-primary">in Minutes</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Pick a template, choose a plan, and start selling. No coding required. 
              Affordable plans starting from <strong className="text-foreground">FREE</strong>.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" className="h-12 px-8 text-base" asChild>
                <Link to="/templates">
                  Browse Templates <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-12 px-8 text-base" asChild>
                <Link to="/pricing">View Pricing</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Niches */}
      <section className="py-12 bg-secondary/30">
        <div className="container">
          <div className="flex flex-wrap justify-center gap-3">
            {niches.map((n) => (
              <span key={n} className="px-4 py-2 rounded-full bg-card border border-border text-sm font-medium text-foreground shadow-sm">
                {n}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container">
          <h2 className="text-3xl font-bold font-display text-center mb-12 text-foreground">
            Everything You Need to Sell Online
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full border-border/50 hover:shadow-lg hover:border-primary/20 transition-all">
                  <CardContent className="p-6">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <f.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold font-display text-lg mb-2 text-foreground">{f.title}</h3>
                    <p className="text-sm text-muted-foreground">{f.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-secondary/30">
        <div className="container">
          <h2 className="text-3xl font-bold font-display text-center mb-12 text-foreground">
            How It Works
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            {steps.map((s, i) => (
              <motion.div
                key={s.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="text-center"
              >
                <div className="text-4xl font-bold font-display text-primary/20 mb-2">{s.num}</div>
                <h3 className="font-semibold font-display text-lg mb-1 text-foreground">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center bg-primary rounded-2xl p-10 text-primary-foreground">
            <Store className="h-10 w-10 mx-auto mb-4 opacity-90" />
            <h2 className="text-3xl font-bold font-display mb-4">Ready to Start Selling?</h2>
            <p className="mb-6 opacity-90">Join hundreds of Pakistani entrepreneurs who launched their stores with Busistree.</p>
            <Button size="lg" variant="secondary" className="h-12 px-8" asChild>
              <Link to="/auth">Create Free Account <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
