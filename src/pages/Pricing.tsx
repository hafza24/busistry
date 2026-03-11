import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const freePlan = {
  name: "Free",
  price: "0",
  features: ["5 Products", "2 Categories", "Basic Template", "Busistree Subdomain", "Community Support"],
};

const rentPlans = [
  { name: "Starter", price: "500", duration: "/month", features: ["20 Products", "5 Categories", "All Templates", "Custom Domain", "Email Support"], popular: false },
  { name: "Business", price: "1,000", duration: "/month", features: ["100 Products", "15 Categories", "All Templates", "Custom Domain", "Priority Support", "Analytics"], popular: true },
  { name: "Pro", price: "2,000", duration: "/month", features: ["Unlimited Products", "Unlimited Categories", "Premium Templates", "Custom Domain", "24/7 Support", "Advanced Analytics", "Product Packs"], popular: false },
];

const buyPlans = [
  { name: "Basic", price: "5,000", features: ["50 Products", "10 Categories", "Basic Templates", "Custom Domain", "3 Months Support"] },
  { name: "Advanced", price: "15,000", features: ["200 Products", "30 Categories", "All Templates", "Custom Domain", "6 Months Support", "Analytics"] },
  { name: "Premium", price: "30,000", features: ["Unlimited Products", "Unlimited Categories", "Premium Templates", "Custom Domain", "1 Year Support", "Advanced Analytics", "Product Packs", "Setup Assistance"] },
];

const PriceCard = ({ name, price, duration, features, popular, type }: any) => (
  <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
    <Card className={`h-full flex flex-col ${popular ? "border-primary shadow-lg ring-2 ring-primary/20" : "border-border/50"}`}>
      <CardHeader className="pb-4">
        {popular && <Badge className="w-fit mb-2">Most Popular</Badge>}
        <CardTitle className="font-display text-xl">{name}</CardTitle>
        <div className="mt-2">
          <span className="text-3xl font-bold font-display text-foreground">PKR {price}</span>
          {duration && <span className="text-muted-foreground text-sm">{duration}</span>}
          {type === "buy" && <span className="text-muted-foreground text-sm"> one-time</span>}
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <ul className="space-y-2.5 flex-1 mb-6">
          {features.map((f: string) => (
            <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              {f}
            </li>
          ))}
        </ul>
        <Button className="w-full" variant={popular ? "default" : "outline"} asChild>
          <Link to="/auth">
            Get Started <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  </motion.div>
);

const Pricing = () => (
  <div className="py-16">
    <div className="container">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold font-display text-foreground mb-4">Simple, Transparent Pricing</h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">All prices in PKR. No hidden fees.</p>
      </div>

      {/* Free */}
      <div className="max-w-sm mx-auto mb-16">
        <h2 className="text-2xl font-bold font-display text-center mb-6 text-foreground">Free Plan</h2>
        <PriceCard {...freePlan} price="0" type="free" />
      </div>

      {/* Rent */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold font-display text-center mb-6 text-foreground">Rent Plans</h2>
        <p className="text-center text-muted-foreground mb-8">Pay monthly, cancel anytime</p>
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {rentPlans.map((p) => <PriceCard key={p.name} {...p} type="rent" />)}
        </div>
      </div>

      {/* Buy */}
      <div>
        <h2 className="text-2xl font-bold font-display text-center mb-6 text-foreground">Buy Plans</h2>
        <p className="text-center text-muted-foreground mb-8">One-time payment, own it forever</p>
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {buyPlans.map((p) => <PriceCard key={p.name} {...p} type="buy" />)}
        </div>
      </div>
    </div>
  </div>
);

export default Pricing;
