import { Link } from "react-router-dom";
import { useState } from "react";
import SEO from "@/components/SEO";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Rocket,
  ExternalLink,
  ArrowLeft,
  Package,
  CalendarCheck,
  FileText,
  ShieldAlert,
  Users,
  LineChart,
  Check,
} from "lucide-react";
import { setPendingTemplate } from "@/hooks/useOnboarding";

const TEMPLATE_ID = "a5a5cdd6-2035-43ba-92f6-58d0ff9ea942";
const DEMO_URL = "https://product.busistree.com";

const shot = (path = "") =>
  `https://image.thum.io/get/width/1600/crop/1000/${DEMO_URL}${path}`;

const gallery = [
  { src: shot(""), alt: "Booker dashboard overview" },
  { src: shot("/inventory"), alt: "Inventory management" },
  { src: shot("/bookings"), alt: "Bookings calendar" },
  { src: shot("/customers"), alt: "Customer directory" },
  { src: shot("/invoices"), alt: "Invoicing" },
  { src: shot("/finance"), alt: "Finance & reports" },
];

const highlights = [
  { icon: Package, title: "Inventory management", desc: "Track every unit, variant, and location with real-time stock levels and low-stock alerts." },
  { icon: CalendarCheck, title: "Date-aware bookings", desc: "Prevent double bookings with a calendar that understands availability windows and rental durations." },
  { icon: FileText, title: "Auto invoicing", desc: "Generate branded invoices the moment a booking is confirmed, with PDF export and payment tracking." },
  { icon: ShieldAlert, title: "Damage & deposits", desc: "Log damages against returns, hold security deposits, and settle balances on checkout." },
  { icon: Users, title: "Staff performance", desc: "Assign bookings to staff and measure throughput, refunds, and revenue per team member." },
  { icon: LineChart, title: "Real-time finance", desc: "Live P&L, cash flow, and outstanding receivables — no spreadsheets, no month-end scramble." },
];

const included = [
  "Point-of-sale checkout",
  "Multi-location support",
  "Customer profiles & history",
  "Booking reminders",
  "Role-based staff access",
  "Refunds & partial returns",
  "Export to CSV / PDF",
  "Mobile-ready UI",
];

const BookerTemplate = () => {
  const [activeImg, setActiveImg] = useState(gallery[0].src);

  return (
    <div className="py-10 md:py-14">
      <SEO
        title="Booker by Busistree — Rental Management Template"
        description="Complete point-of-sale and operations platform for rental businesses. Inventory, bookings, invoicing, damage tracking, staff performance and real-time finance."
        path="/templates/booker"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: "Booker by Busistree",
          description:
            "Complete point-of-sale and operations platform for rental businesses — inventory, bookings, customers, invoicing and real-time finance.",
          image: gallery[0].src,
          brand: { "@type": "Brand", name: "Busistree" },
          category: "Rental Management Software",
          url: "https://busistry.lovable.app/templates/booker",
        }}
      />
      <Helmet>
        <meta property="og:type" content="product" />
        <meta property="og:site_name" content="Busistree" />
        <meta property="og:image" content={gallery[0].src} />
        <meta property="og:image:width" content="1600" />
        <meta property="og:image:height" content="1000" />
        <meta property="og:image:alt" content="Booker by Busistree — rental management dashboard preview" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={gallery[0].src} />
        <meta name="twitter:image:alt" content="Booker by Busistree — rental management dashboard preview" />
        <meta name="keywords" content="rental management, booking software, POS for rentals, inventory, invoicing, Busistree, Booker" />
      </Helmet>
      <div className="container max-w-6xl">
        <Button variant="ghost" size="sm" asChild className="mb-6 -ml-2">
          <Link to="/templates">
            <ArrowLeft className="h-4 w-4 mr-1" /> All templates
          </Link>
        </Button>

        {/* Header */}
        <div className="grid lg:grid-cols-2 gap-10 items-start mb-16">
          <div>
            <div className="aspect-[16/10] rounded-xl overflow-hidden border border-border/60 bg-muted shadow-sm">
              <img
                src={activeImg}
                alt="Booker by Busistree preview"
                className="w-full h-full object-cover object-top"
                loading="eager"
              />
            </div>
            <div className="grid grid-cols-6 gap-2 mt-3">
              {gallery.map((g) => (
                <button
                  key={g.src}
                  onClick={() => setActiveImg(g.src)}
                  className={`aspect-square rounded-md overflow-hidden border transition ${
                    activeImg === g.src
                      ? "border-primary ring-2 ring-primary/30"
                      : "border-border/60 hover:border-primary/50"
                  }`}
                  aria-label={g.alt}
                >
                  <img src={g.src} alt={g.alt} className="w-full h-full object-cover object-top" loading="lazy" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge>Management System</Badge>
              <Badge variant="secondary">Booking</Badge>
              <Badge variant="outline">Rental</Badge>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold font-display text-foreground leading-tight">
              Booker by Busistree
            </h1>
            <p className="text-lg text-muted-foreground mt-4">
              A complete point-of-sale and operations platform for rental businesses — inventory,
              bookings, customers, invoicing, and finance in real time.
            </p>

            <div className="flex flex-wrap gap-3 mt-8">
              <Button size="lg" asChild onClick={() => setPendingTemplate(TEMPLATE_ID)}>
                <Link to={`/onboarding?template=${TEMPLATE_ID}`}>
                  <Rocket className="h-4 w-4 mr-1" /> Request this store
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href={DEMO_URL} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-1" /> Live demo
                </a>
              </Button>
            </div>

            <div className="mt-8 pt-6 border-t border-border/60 grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold font-display text-foreground">24–48h</div>
                <div className="text-xs text-muted-foreground mt-1">Setup time</div>
              </div>
              <div>
                <div className="text-2xl font-bold font-display text-foreground">100%</div>
                <div className="text-xs text-muted-foreground mt-1">Branded to you</div>
              </div>
              <div>
                <div className="text-2xl font-bold font-display text-foreground">PKR</div>
                <div className="text-xs text-muted-foreground mt-1">Localized pricing</div>
              </div>
            </div>
          </div>
        </div>

        {/* Highlights */}
        <section className="mb-16">
          <h2 className="text-2xl md:text-3xl font-bold font-display text-foreground mb-2">
            Everything a rental operation needs
          </h2>
          <p className="text-muted-foreground mb-8">
            Purpose-built for teams that rent physical inventory — from equipment and vehicles to event gear.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {highlights.map(({ icon: Icon, title, desc }) => (
              <Card key={title} className="border-border/60 hover:border-primary/30 transition-colors">
                <CardContent className="p-6">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold font-display text-foreground mb-1">{title}</h3>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Included */}
        <section className="mb-16">
          <div className="rounded-xl border border-border/60 bg-muted/30 p-6 md:p-8">
            <h2 className="text-xl md:text-2xl font-bold font-display text-foreground mb-5">
              What's included
            </h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
              {included.map((f) => (
                <div key={f} className="flex items-start gap-2 text-sm text-foreground">
                  <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center rounded-2xl border border-border/60 bg-gradient-to-br from-primary/5 to-accent/5 p-10 md:p-14">
          <h2 className="text-2xl md:text-4xl font-bold font-display text-foreground">
            Ready to launch your rental business?
          </h2>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
            We'll customize Booker with your brand, inventory, and pricing — live in 24 to 48 hours.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            <Button size="lg" asChild onClick={() => setPendingTemplate(TEMPLATE_ID)}>
              <Link to={`/onboarding?template=${TEMPLATE_ID}`}>
                <Rocket className="h-4 w-4 mr-1" /> Request this store
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href={DEMO_URL} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-1" /> Explore live demo
              </a>
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default BookerTemplate;
