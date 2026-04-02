import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, ArrowRight, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const PriceCard = ({ name, price_pkr, duration_days, features, type, popular }: any) => {
  const featureList = Array.isArray(features) ? (features as string[]) : [];
  const duration = type === "rent" && duration_days ? `/ ${duration_days} days` : type === "buy" ? "one-time" : null;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
      <Card className={`h-full flex flex-col ${popular ? "border-primary shadow-lg ring-2 ring-primary/20" : "border-border/50"}`}>
        <CardHeader className="pb-4">
          {popular && <Badge className="w-fit mb-2">Most Popular</Badge>}
          <CardTitle className="font-display text-xl">{name}</CardTitle>
          <div className="mt-2">
            <span className="text-3xl font-bold font-display text-foreground">
              {price_pkr === 0 ? "Free" : `PKR ${price_pkr.toLocaleString()}`}
            </span>
            {duration && <span className="text-muted-foreground text-sm ml-1">{duration}</span>}
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          <ul className="space-y-2.5 flex-1 mb-6">
            {featureList.map((f: string) => (
              <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                {f}
              </li>
            ))}
          </ul>
          <Button className="w-full" variant={popular ? "default" : "outline"} asChild>
            <Link to="/dashboard">
              Get Started <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const Pricing = () => {
  const { data: plans, isLoading } = useQuery({
    queryKey: ["public_plans"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("plans")
        .select("*")
        .eq("is_active", true)
        .order("price_pkr");
      if (error) throw error;
      return data;
    },
  });

  const freePlans = plans?.filter((p) => p.type === "free") ?? [];
  const rentPlans = plans?.filter((p) => p.type === "rent") ?? [];
  const buyPlans = plans?.filter((p) => p.type === "buy") ?? [];

  // Mark middle rent plan as popular if 3+
  const rentWithPopular = rentPlans.map((p, i) => ({
    ...p,
    popular: rentPlans.length >= 3 ? i === Math.floor(rentPlans.length / 2) : false,
  }));

  if (isLoading) {
    return (
      <div className="py-16 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="py-16">
      <div className="container">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold font-display text-foreground mb-4">Simple, Transparent Pricing</h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">All prices in PKR. No hidden fees.</p>
        </div>

        {freePlans.length > 0 && (
          <div className="max-w-sm mx-auto mb-16">
            <h2 className="text-2xl font-bold font-display text-center mb-6 text-foreground">Free Plan</h2>
            {freePlans.map((p) => <PriceCard key={p.id} {...p} />)}
          </div>
        )}

        {rentWithPopular.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold font-display text-center mb-6 text-foreground">Rent Plans</h2>
            <p className="text-center text-muted-foreground mb-8">Pay monthly, cancel anytime</p>
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {rentWithPopular.map((p) => <PriceCard key={p.id} {...p} />)}
            </div>
          </div>
        )}

        {buyPlans.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold font-display text-center mb-6 text-foreground">Buy Plans</h2>
            <p className="text-center text-muted-foreground mb-8">One-time payment, own it forever</p>
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {buyPlans.map((p) => <PriceCard key={p.id} {...p} />)}
            </div>
          </div>
        )}

        {!plans?.length && (
          <p className="text-center text-muted-foreground py-12">No plans available yet.</p>
        )}
      </div>
    </div>
  );
};

export default Pricing;
