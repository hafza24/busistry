import { ShieldCheck, RefreshCw, Lock, Headphones, BadgeCheck } from "lucide-react";

const items = [
  { icon: ShieldCheck, label: "Secure Payments", sub: "JazzCash • Easypaisa • Bank" },
  { icon: RefreshCw, label: "7-Day Money Back", sub: "No questions asked" },
  { icon: Lock, label: "Data Protected", sub: "Encrypted credentials" },
  { icon: Headphones, label: "Real Human Support", sub: "WhatsApp + Email" },
  { icon: BadgeCheck, label: "Verified Reviews", sub: "Trusted by PK businesses" },
];

const TrustBadges = ({ compact = false }: { compact?: boolean }) => (
  <section aria-label="Trust and safety" className={compact ? "py-6" : "py-10 border-y border-border bg-secondary/30"}>
    <div className="container">
      <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {items.map(({ icon: Icon, label, sub }) => (
          <li key={label} className="flex items-start gap-3 rounded-lg bg-card border border-border p-3">
            <Icon className="h-5 w-5 text-primary shrink-0 mt-0.5" aria-hidden="true" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground leading-tight">{label}</p>
              <p className="text-xs text-muted-foreground leading-tight mt-0.5">{sub}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  </section>
);

export default TrustBadges;
