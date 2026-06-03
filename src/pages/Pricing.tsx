import { Fragment } from "react";
import { useQuery } from "@tanstack/react-query";
import SEO from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  CheckCircle,
  ArrowRight,
  Loader2,
  ShieldCheck,
  Clock3,
  Wallet,
  Sparkles,
  Check,
  Minus,
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

/* ------------------------------- Pricing card ------------------------------ */
const PriceCard = ({ id, name, price_pkr, duration_days, features, type, popular }: any) => {
  const featureList = Array.isArray(features) ? (features as string[]) : [];
  const duration =
    type === "rent" && duration_days
      ? `/ ${duration_days} days`
      : type === "buy"
      ? "one-time"
      : null;

  const handleSelect = () => {
    try {
      localStorage.setItem("busistry_onboarding_plan", id);
    } catch {}
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
      <Card
        className={`h-full flex flex-col ${
          popular ? "border-primary shadow-lg ring-2 ring-primary/20" : "border-border/50"
        }`}
      >
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
          <Button className="w-full" variant={popular ? "default" : "outline"} asChild onClick={handleSelect}>
            <Link to={`/onboarding?plan=${id}`}>
              Select plan <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

/* ---------------------------- Reassurance strip --------------------------- */
const REASSURE = [
  {
    icon: ShieldCheck,
    title: "7-day money-back",
    body: "Not happy with the build? Get a full refund within 7 days, no questions asked.",
  },
  {
    icon: Clock3,
    title: "Delivered in 3–7 days",
    body: "From verified payment to handoff. Faster on standard templates.",
  },
  {
    icon: Wallet,
    title: "Pay your way",
    body: "JazzCash, Easypaisa, NayaPay, Raast, or bank transfer — all in PKR.",
  },
  {
    icon: Sparkles,
    title: "Built by humans",
    body: "Real Pakistani developers — no AI-only template dumps.",
  },
];

/* ---------------------- Feature comparison matrix ------------------------- */
type Cell = boolean | string;
interface MatrixRow {
  group: string;
  rows: { label: string; values: Cell[] }[];
}

/** Tiers are ordered: Basic, Professional, Business, Enterprise */
const MATRIX: MatrixRow[] = [
  {
    group: "Core",
    rows: [
      { label: "Custom WordPress build", values: [true, true, true, true] },
      { label: "Mobile responsive", values: [true, true, true, true] },
      { label: "SSL / HTTPS", values: [true, true, true, true] },
      { label: "Pages included", values: ["3", "8", "15", "Unlimited"] },
      { label: "Products / catalog", values: ["10", "100", "500", "Unlimited"] },
    ],
  },
  {
    group: "Commerce",
    rows: [
      { label: "WooCommerce store", values: [false, true, true, true] },
      { label: "Pakistan payment gateways", values: [false, true, true, true] },
      { label: "Shipping & inventory", values: [false, true, true, true] },
      { label: "Abandoned-cart recovery", values: [false, false, true, true] },
    ],
  },
  {
    group: "Branding & content",
    rows: [
      { label: "Logo design", values: [false, "Basic", "Custom", "Premium"] },
      { label: "Copywriting", values: [false, false, true, true] },
      { label: "Product photography help", values: [false, false, false, true] },
    ],
  },
  {
    group: "Marketing & growth",
    rows: [
      { label: "SEO setup (on-page)", values: [false, true, true, true] },
      { label: "Google Analytics", values: [true, true, true, true] },
      { label: "Email capture / newsletter", values: [false, true, true, true] },
      { label: "Social media integration", values: [false, true, true, true] },
    ],
  },
  {
    group: "Support",
    rows: [
      { label: "WhatsApp support", values: ["Email only", "Business hrs", "Priority", "Dedicated"] },
      { label: "Revisions included", values: ["1", "3", "Unlimited", "Unlimited"] },
      { label: "Training session", values: [false, "30 min", "1 hr", "On-site"] },
      { label: "Maintenance (mo.)", values: [false, false, true, true] },
    ],
  },
];

const TIER_NAMES = ["Basic", "Professional", "Business", "Enterprise"];

const renderCell = (value: Cell) => {
  if (value === true)
    return <Check className="h-4 w-4 text-primary mx-auto" aria-label="Included" />;
  if (value === false)
    return <Minus className="h-4 w-4 text-muted-foreground/50 mx-auto" aria-label="Not included" />;
  return <span className="text-xs md:text-sm text-foreground">{value}</span>;
};

const ComparisonMatrix = () => (
  <section className="py-16" aria-labelledby="comparison-heading">
    <div className="container">
      <div className="text-center mb-10">
        <h2 id="comparison-heading" className="text-3xl font-bold font-display text-foreground">
          Compare every feature
        </h2>
        <p className="text-muted-foreground mt-2 text-sm">
          Everything that's included at each tier. No hidden upsells.
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="sticky top-0 bg-card z-10">
            <tr className="border-b border-border">
              <th className="text-left font-semibold text-foreground px-4 py-3 w-[34%]">Feature</th>
              {TIER_NAMES.map((t, i) => (
                <th
                  key={t}
                  className={`px-4 py-3 text-center font-semibold ${
                    i === 1 ? "text-primary" : "text-foreground"
                  }`}
                >
                  {t}
                  {i === 1 && (
                    <div className="text-[10px] font-normal text-primary mt-0.5">Most Popular</div>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MATRIX.map((group) => (
              <Fragment key={group.group}>
                <tr className="bg-muted/40">
                  <td colSpan={5} className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {group.group}
                  </td>
                </tr>
                {group.rows.map((row) => (
                  <tr key={row.label} className="border-b border-border last:border-b-0">
                    <td className="px-4 py-3 text-foreground">{row.label}</td>
                    {row.values.map((v, i) => (
                      <td key={i} className="px-4 py-3 text-center">
                        {renderCell(v)}
                      </td>
                    ))}
                  </tr>
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </section>
);

/* ----------------------------------- FAQ ---------------------------------- */
const FAQS = [
  {
    q: "How long does it take to build my website?",
    a: "Most websites are delivered within 3–7 business days from the moment your payment is verified. Larger Business / Enterprise builds can take 7–14 days depending on scope.",
  },
  {
    q: "What if I'm not happy with the result?",
    a: "We offer a 7-day money-back guarantee. If the delivered site doesn't match your brief, we'll either revise it until it does or refund you in full.",
  },
  {
    q: "Which payment methods do you accept?",
    a: "JazzCash, Easypaisa, NayaPay, Raast, and direct bank transfer — all in PKR. After paying, you upload a screenshot and our team verifies within 5–30 minutes.",
  },
  {
    q: "Do I own the website after you build it?",
    a: "Yes. On Buy plans you own the site, the domain, and the hosting account outright. On Rent plans we host and maintain it for you and you keep ownership of your content.",
  },
  {
    q: "Can I upgrade or change my plan later?",
    a: "Absolutely. You can upgrade at any time from your dashboard — we'll prorate and add only the new features and limits.",
  },
  {
    q: "Do you provide hosting and a domain?",
    a: "Free plan ships with a Busistry subdomain. Rent and Buy plans include a custom .pk or .com domain and managed hosting for the first year.",
  },
  {
    q: "Is there ongoing support after delivery?",
    a: "Yes — every tier includes support. Professional and above include WhatsApp support during business hours; Business/Enterprise include priority and maintenance.",
  },
];

const FaqSection = () => (
  <section className="py-16 bg-muted/30" aria-labelledby="faq-heading">
    <div className="container max-w-3xl">
      <div className="text-center mb-8">
        <h2 id="faq-heading" className="text-3xl font-bold font-display text-foreground">
          Frequently asked questions
        </h2>
        <p className="text-muted-foreground mt-2 text-sm">
          Still unsure? <Link to="/contact" className="text-primary underline-offset-4 hover:underline">Talk to us on WhatsApp</Link>.
        </p>
      </div>
      <Accordion type="single" collapsible className="bg-card rounded-xl border border-border">
        {FAQS.map((item, i) => (
          <AccordionItem key={i} value={`q-${i}`} className="px-4">
            <AccordionTrigger className="text-left text-foreground hover:no-underline">
              {item.q}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
              {item.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  </section>
);

/* ----------------------------- Reassurance row ----------------------------- */
const ReassuranceRow = () => (
  <section className="py-12 border-y border-border bg-card/40" aria-label="Why choose Busistry">
    <div className="container grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {REASSURE.map(({ icon: Icon, title, body }) => (
        <div key={title} className="flex gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">{title}</h3>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{body}</p>
          </div>
        </div>
      ))}
    </div>
  </section>
);

/* --------------------------------- Sticky CTA ------------------------------ */
const StickyCta = () => (
  <div
    className="fixed bottom-0 inset-x-0 z-40 border-t border-border bg-background/95 backdrop-blur px-4 py-3 shadow-lg md:hidden"
    role="region"
    aria-label="Get started"
  >
    <Button asChild className="w-full">
      <Link to="/onboarding">
        Start your build — pay later <ArrowRight className="ml-2 h-4 w-4" />
      </Link>
    </Button>
  </div>
);

/* ----------------------------------- Page --------------------------------- */
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

  const rentWithPopular = rentPlans.map((p, i) => ({
    ...p,
    popular: rentPlans.length >= 3 ? i === Math.floor(rentPlans.length / 2) : false,
  }));

  return (
    <div className="pb-24 md:pb-0">
      <SEO
        title="Pricing — Busistry website & store plans in PKR"
        description="Transparent PKR pricing with a 7-day money-back guarantee. Compare Basic, Professional, Business and Enterprise. Pay via JazzCash, Easypaisa, NayaPay, Raast, or bank transfer."
        path="/pricing"
      />

      {/* Hero */}
      <section className="pt-16 pb-10">
        <div className="container text-center max-w-2xl">
          <Badge variant="outline" className="mb-4">7-day money-back guarantee</Badge>
          <h1 className="text-4xl md:text-5xl font-bold font-display text-foreground mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-lg text-muted-foreground">
            All prices in PKR. No hidden fees. Pay after we verify your details.
          </p>
        </div>
      </section>

      {/* Reassurance */}
      <ReassuranceRow />

      {/* Plan cards */}
      <section className="py-16">
        <div className="container">
          {isLoading ? (
            <div className="py-16 flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {freePlans.length > 0 && (
                <div className="max-w-sm mx-auto mb-16">
                  <h2 className="text-2xl font-bold font-display text-center mb-6 text-foreground">Free Plan</h2>
                  {freePlans.map((p) => (
                    <PriceCard key={p.id} {...p} />
                  ))}
                </div>
              )}

              {rentWithPopular.length > 0 && (
                <div className="mb-16">
                  <h2 className="text-2xl font-bold font-display text-center mb-2 text-foreground">Rent Plans</h2>
                  <p className="text-center text-muted-foreground mb-8 text-sm">
                    Pay monthly, cancel anytime
                  </p>
                  <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                    {rentWithPopular.map((p) => (
                      <PriceCard key={p.id} {...p} />
                    ))}
                  </div>
                </div>
              )}

              {buyPlans.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold font-display text-center mb-2 text-foreground">Buy Plans</h2>
                  <p className="text-center text-muted-foreground mb-8 text-sm">
                    One-time payment, own it forever
                  </p>
                  <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                    {buyPlans.map((p) => (
                      <PriceCard key={p.id} {...p} />
                    ))}
                  </div>
                </div>
              )}

              {!plans?.length && (
                <p className="text-center text-muted-foreground py-12">No plans available yet.</p>
              )}
            </>
          )}
        </div>
      </section>

      {/* Comparison matrix */}
      <ComparisonMatrix />

      {/* FAQ */}
      <FaqSection />

      {/* Closing CTA */}
      <section className="py-16">
        <div className="container max-w-2xl text-center">
          <h2 className="text-3xl font-bold font-display text-foreground mb-3">
            Ready to launch?
          </h2>
          <p className="text-muted-foreground mb-6">
            Tell us about your business — we'll handle the rest. Verification typically takes 5–30 minutes.
          </p>
          <Button size="lg" asChild>
            <Link to="/onboarding">
              Start your build <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      <StickyCta />
    </div>
  );
};

export default Pricing;
