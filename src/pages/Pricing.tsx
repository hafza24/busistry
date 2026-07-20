import { Fragment, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
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
  ChevronDown,
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

/* ------------------------------- Pricing card ------------------------------ */
const PriceCard = ({
  id,
  name,
  price_pkr,
  duration_days,
  features,
  type,
  popular,
  onCompare,
  isComparing,
  compareDisabled,
}: any) => {
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
          <div className="flex flex-col sm:flex-row gap-2">
            <Button className="flex-1 min-w-0" variant={popular ? "default" : "outline"} asChild onClick={handleSelect}>
              <Link to={`/templates?plan=${id}`}>
                Choose <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            {onCompare && (
              <Button
                type="button"
                variant={isComparing ? "default" : "outline"}
                onClick={() => onCompare(id)}
                aria-pressed={isComparing}
                disabled={!isComparing && compareDisabled}
                title={!isComparing && compareDisabled ? "You can compare up to 3 plans" : undefined}
                className="sm:shrink-0"
              >
                {isComparing ? (
                  <>
                    <Check className="h-4 w-4 mr-1" /> Added
                  </>
                ) : (
                  "Compare"
                )}
              </Button>
            )}
          </div>
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
type Cell = boolean | string | number;

const fmtLimit = (n: number | null | undefined) => {
  if (n === null || n === undefined) return "—";
  if (n === 0) return "Unlimited";
  return n.toLocaleString();
};

const fmtDomain = (v: string | null | undefined) => {
  if (!v) return "—";
  if (v === "subdomain") return "Subdomain";
  if (v === "custom") return "Custom domain";
  if (v === "own") return "Own domain";
  return v.charAt(0).toUpperCase() + v.slice(1);
};

const fmtDuration = (p: any) => {
  if (p.type === "buy") return "Lifetime";
  if (p.type === "free" && p.duration_days) return `${p.duration_days} days`;
  if (p.duration_days) return `${p.duration_days} days`;
  return "—";
};

const fmtPrice = (p: any) => {
  if (p.price_pkr === 0) return "Free";
  const base = `PKR ${Number(p.price_pkr).toLocaleString()}`;
  if (p.type === "rent" && p.duration_days) return `${base} / ${p.duration_days}d`;
  if (p.type === "buy") return `${base} one-time`;
  return base;
};

const buildMatrix = (plans: any[]) => [
  {
    group: "Pricing",
    rows: [
      { label: "Price", values: plans.map((p) => fmtPrice(p)) as Cell[] },
      { label: "Duration", values: plans.map((p) => fmtDuration(p)) as Cell[] },
    ],
  },
  {
    group: "Store limits",
    rows: [
      { label: "Products", values: plans.map((p) => fmtLimit(p.max_products)) as Cell[] },
      { label: "Categories", values: plans.map((p) => fmtLimit(p.max_categories)) as Cell[] },
      { label: "Pages", values: plans.map((p) => fmtLimit(p.max_pages)) as Cell[] },
    ],
  },
  {
    group: "Team & communication",
    rows: [
      { label: "Team seats", values: plans.map((p) => fmtLimit(p.team_users)) as Cell[] },
      { label: "Email accounts", values: plans.map((p) => fmtLimit(p.email_accounts)) as Cell[] },
    ],
  },
  {
    group: "Platform",
    rows: [
      { label: "Domain", values: plans.map((p) => fmtDomain(p.domain_type)) as Cell[] },
      {
        label: "Platform",
        values: plans.map((p) => (p.platform_type ? p.platform_type.charAt(0).toUpperCase() + p.platform_type.slice(1) : "—")) as Cell[],
      },
    ],
  },
];

const renderCell = (value: Cell) => {
  if (value === true)
    return <Check className="h-4 w-4 text-primary mx-auto" aria-label="Included" />;
  if (value === false)
    return <Minus className="h-4 w-4 text-muted-foreground mx-auto" aria-label="Not included" />;
  return <span className="text-xs md:text-sm text-foreground">{value}</span>;
};

const ComparisonMatrix = ({ plans, onClear, max = 3 }: { plans: any[]; onClear: () => void; max?: number }) => {
  const visiblePlans = plans;
  const emptySlots = Math.max(0, max - visiblePlans.length);
  const matrix = buildMatrix(visiblePlans);
  const colCount = visiblePlans.length + emptySlots + 1;

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(matrix.map((g) => [g.group, true]))
  );
  const toggle = (g: string) => setOpenGroups((s) => ({ ...s, [g]: !s[g] }));
  const allOpen = matrix.every((g) => openGroups[g.group]);
  const setAll = (v: boolean) =>
    setOpenGroups(Object.fromEntries(matrix.map((g) => [g.group, v])));

  if (!plans?.length) return null;

  return (
    <section id="compare" className="py-16 scroll-mt-24" aria-labelledby="comparison-heading">
      <div className="container">
        <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
          <div>
            <h2 id="comparison-heading" className="text-3xl font-bold font-display text-foreground">
              Compare selected plans
            </h2>
            <p className="text-muted-foreground mt-2 text-sm">
              {plans.length} plan{plans.length === 1 ? "" : "s"} in comparison. Add or remove from the cards above.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={onClear}>
            Clear comparison
          </Button>
        </div>



        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="sticky top-0 bg-card z-10">
              <tr className="border-b border-border">
                <th className="text-left font-semibold text-foreground px-4 py-3 w-[24%]">
                  Feature
                </th>

                {visiblePlans.map((p, idx) => (
                  <th
                    key={p.id}
                    className="px-4 py-3 text-center font-semibold text-foreground whitespace-nowrap relative"
                  >
                    {idx === 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute left-2 top-1/2 -translate-y-1/2 h-7 px-2 text-xs"
                        onClick={() => setAll(!allOpen)}
                      >
                        {allOpen ? "Collapse all" : "Expand all"}
                      </Button>
                    )}
                    <div>{p.name}</div>
                    <div className="text-[10px] font-normal text-muted-foreground uppercase tracking-wider mt-0.5">
                      {p.type}
                    </div>
                  </th>
                ))}
                {Array.from({ length: emptySlots }).map((_, i) => (
                  <th key={`empty-${i}`} className="px-4 py-3 text-center whitespace-nowrap">
                    <a
                      href="#plans"
                      className="inline-flex flex-col items-center gap-1 text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
                    >
                      <span className="h-7 w-7 rounded-full border border-dashed border-border flex items-center justify-center text-base leading-none">+</span>
                      Add a plan
                    </a>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrix.map((group) => {
                const isOpen = openGroups[group.group];
                return (
                  <Fragment key={group.group}>
                    <tr
                      className="bg-muted/40 hover:bg-muted/60 cursor-pointer transition-colors"
                      onClick={() => toggle(group.group)}
                    >
                      <td
                        colSpan={colCount}
                        className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                      >
                        <button
                          type="button"
                          className="flex items-center gap-2 w-full text-left"
                          aria-expanded={isOpen}
                          aria-controls={`grp-${group.group}`}
                        >
                          <ChevronDown
                            className={`h-3.5 w-3.5 transition-transform duration-200 ${
                              isOpen ? "rotate-0" : "-rotate-90"
                            }`}
                          />
                          <span>{group.group}</span>
                        </button>
                      </td>
                    </tr>
                    {isOpen &&
                      group.rows.map((row) => (
                        <tr
                          key={row.label}
                          id={`grp-${group.group}`}
                          className="border-b border-border last:border-b-0"
                        >
                          <td className="px-4 py-3 text-foreground">{row.label}</td>
                          {row.values.map((v, i) => (
                            <td key={i} className="px-4 py-3 text-center">
                              {renderCell(v)}
                            </td>
                          ))}
                          {Array.from({ length: emptySlots }).map((_, i) => (
                            <td key={`empty-cell-${i}`} className="px-4 py-3 text-center text-muted-foreground/50">
                              —
                            </td>
                          ))}
                        </tr>
                      ))}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};



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

  const [searchParams, setSearchParams] = useSearchParams();
  const rawType = searchParams.get("type");
  const activeType: "buy" | "rent" | "all" = rawType === "buy" ? "buy" : rawType === "all" ? "all" : "rent";

  const freePlans = plans?.filter((p) => p.type === "free") ?? [];
  const rentPlans = plans?.filter((p) => p.type === "rent") ?? [];
  const buyPlans = plans?.filter((p) => p.type === "buy") ?? [];

  const rentWithPopular = rentPlans.map((p, i) => ({
    ...p,
    popular: rentPlans.length >= 3 ? i === Math.floor(rentPlans.length / 2) : false,
  }));
  const buyWithPopular = buyPlans.map((p, i) => ({
    ...p,
    popular: buyPlans.length >= 3 ? i === Math.floor(buyPlans.length / 2) : false,
  }));

  const setType = (t: "buy" | "rent" | "all") => {
    const next = new URLSearchParams(searchParams);
    next.set("type", t);
    setSearchParams(next, { replace: true });
  };

  const MAX_COMPARE = 3;
  const [compareIds, setCompareIds] = useState<Set<string>>(new Set());
  const toggleCompare = (id: string) =>
    setCompareIds((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else if (next.size < MAX_COMPARE) next.add(id);
      return next;
    });
  const clearCompare = () => setCompareIds(new Set());
  const comparePlans = (plans ?? []).filter((p) => compareIds.has(p.id));
  const compareDisabled = comparePlans.length >= MAX_COMPARE;

  return (
    <div className="pb-24 md:pb-0">
      <SEO
        title="Pricing — Busistry website & store plans in PKR"
        description="Transparent PKR pricing with a 7-day money-back guarantee. Compare Basic, Professional, Business and Enterprise. Pay via JazzCash, Easypaisa, NayaPay, Raast, or bank transfer."
        path="/pricing"
      />

      {/* Hero */}
      <section className="pt-16 pb-10">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-10 items-center max-w-6xl mx-auto">
            <div className="text-center lg:text-left max-w-2xl">
              <Badge variant="outline" className="mb-4">7-day money-back guarantee</Badge>
              <h1 className="text-4xl md:text-5xl font-bold font-display text-foreground mb-4">
                Simple, transparent pricing
              </h1>
              <p className="text-lg text-muted-foreground">
                All prices in PKR. No hidden fees. Pay after we verify your details.
              </p>
            </div>
            {freePlans.length > 0 && (
              <div className="max-w-sm w-full mx-auto lg:mx-0 lg:ml-auto">
                <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-3 text-center lg:text-left">
                  Start free
                </p>
                {freePlans.map((p) => (
                  <PriceCard key={p.id} {...p} onCompare={toggleCompare} isComparing={compareIds.has(p.id)} compareDisabled={compareDisabled} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Plan cards */}
      <section id="plans" className="py-16 scroll-mt-24">
        <div className="container">

          {isLoading ? (
            <div className="py-16 flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>


              <div className="flex justify-center mb-10">
                <div className="inline-flex rounded-full border border-border bg-card p-1">
                  <button
                    type="button"
                    onClick={() => setType("all")}
                    className={`px-5 py-2 text-sm font-medium rounded-full transition-colors ${
                      activeType === "all"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    aria-pressed={activeType === "all"}
                  >
                    All
                  </button>
                  <button
                    type="button"
                    onClick={() => setType("rent")}
                    className={`px-5 py-2 text-sm font-medium rounded-full transition-colors ${
                      activeType === "rent"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    aria-pressed={activeType === "rent"}
                  >
                    Rent
                  </button>
                  <button
                    type="button"
                    onClick={() => setType("buy")}
                    className={`px-5 py-2 text-sm font-medium rounded-full transition-colors ${
                      activeType === "buy"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    aria-pressed={activeType === "buy"}
                  >
                    Buy
                  </button>
                </div>
              </div>

              {(activeType === "rent" || activeType === "all") && rentWithPopular.length > 0 && (
                <div className="mb-16">
                  <h2 className="text-2xl font-bold font-display text-center mb-2 text-foreground">Rent Plans</h2>
                  <p className="text-center text-muted-foreground mb-8 text-sm">
                    Pay monthly, cancel anytime
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto">
                    {rentWithPopular.map((p) => (
                      <PriceCard key={p.id} {...p} onCompare={toggleCompare} isComparing={compareIds.has(p.id)} compareDisabled={compareDisabled} />
                    ))}
                  </div>
                </div>
              )}

              {(activeType === "buy" || activeType === "all") && buyWithPopular.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold font-display text-center mb-2 text-foreground">Buy Plans</h2>
                  <p className="text-center text-muted-foreground mb-8 text-sm">
                    One-time payment, own it forever
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto">
                    {buyWithPopular.map((p) => (
                      <PriceCard key={p.id} {...p} onCompare={toggleCompare} isComparing={compareIds.has(p.id)} compareDisabled={compareDisabled} />
                    ))}
                  </div>
                </div>
              )}

              {activeType === "rent" && rentWithPopular.length === 0 && (
                <p className="text-center text-muted-foreground py-12">No rent plans available yet.</p>
              )}
              {activeType === "buy" && buyWithPopular.length === 0 && (
                <p className="text-center text-muted-foreground py-12">No buy plans available yet.</p>
              )}

              {!plans?.length && (
                <p className="text-center text-muted-foreground py-12">No plans available yet.</p>
              )}
            </>
          )}
        </div>
      </section>

      {/* Reassurance */}
      <ReassuranceRow />


      {/* Comparison matrix */}
      {comparePlans.length > 0 && (
        <ComparisonMatrix plans={comparePlans} onClear={clearCompare} />
      )}

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

      {comparePlans.length > 0 && (
        <div className="fixed bottom-20 md:bottom-6 right-4 z-40">
          <a
            href="#compare"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById("compare")?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-4 py-2.5 text-sm font-medium shadow-lg hover:opacity-90 transition"
          >
            Compare ({comparePlans.length}/{3}) <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      )}

      <StickyCta />
    </div>
  );
};

export default Pricing;
