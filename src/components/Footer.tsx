import { Link } from "react-router-dom";
import { ShieldCheck, RefreshCw, Lock, Headphones } from "lucide-react";
import logo from "@/assets/logo.png";

const trustRow = [
  { icon: ShieldCheck, label: "Secure Payments" },
  { icon: RefreshCw, label: "7-Day Refund" },
  { icon: Lock, label: "Data Protected" },
  { icon: Headphones, label: "Human Support" },
];

const Footer = () => (
  <footer className="border-t border-border bg-secondary/30">
    <div className="container py-10">
      <ul className="grid grid-cols-2 md:grid-cols-4 gap-3 pb-8 mb-8 border-b border-border" aria-label="Trust signals">
        {trustRow.map(({ icon: Icon, label }) => (
          <li key={label} className="flex items-center gap-2 text-sm text-muted-foreground">
            <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
            <span>{label}</span>
          </li>
        ))}
      </ul>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <img src={logo} alt="Busistree" className="h-9 sm:h-10 md:h-12 w-auto object-contain transition-transform duration-300 hover:scale-105" />
          </div>
          <p className="text-sm text-muted-foreground">
            A digital studio building brands, websites, and growth systems for ambitious businesses.
          </p>
        </div>
        <div>
          <h4 className="font-semibold font-display mb-3 text-foreground">Platform</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/templates" className="hover:text-foreground transition-colors">Templates</Link></li>
            <li><Link to="/pricing" className="hover:text-foreground transition-colors">Pricing</Link></li>
            <li><Link to="/how-it-works" className="hover:text-foreground transition-colors">How It Works</Link></li>
            <li><Link to="/marketplace" className="hover:text-foreground transition-colors">Marketplace</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold font-display mb-3 text-foreground">Support</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/contact" className="hover:text-foreground transition-colors">Contact Us</Link></li>
            <li><a href="/sitemap.xml" className="hover:text-foreground transition-colors">Sitemap</a></li>
            <li><a href="/robots.txt" className="hover:text-foreground transition-colors">Robots</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold font-display mb-3 text-foreground">Payment Methods</h4>
          <p className="text-sm text-muted-foreground">Easypaisa • JazzCash • NayaPay • Raast • Bank Transfer</p>
        </div>
      </div>
      <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Busistree. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;
