import { Link } from "react-router-dom";
import { Mail, MapPin, ArrowUp } from "lucide-react";
import logo from "@/assets/logo.png";

const Footer = () => {
  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer className="relative border-t border-border/60 bg-background">
      <div className="container py-12 md:py-16">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr] md:gap-14">
          {/* Brand + contact */}
          <div>
            <Link to="/" className="inline-flex items-center gap-2 mb-5">
              <img src={logo} alt="Busistree" className="h-10 w-auto object-contain" />
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mb-6">
              A small studio helping founders launch — planning, websites, brand,
              and the first marketing push. One service at a time, no lock-in.
            </p>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a
                  href="mailto:hafza@busistree.com"
                  className="inline-flex items-center gap-2 text-foreground hover:text-primary transition-colors"
                >
                  <Mail className="h-4 w-4 text-primary" />
                  hafza@busistree.com
                </a>
              </li>
              <li className="inline-flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary" />
                Islamabad, Pakistan
              </li>
            </ul>
          </div>

          {/* Real pages only */}
          <div>
            <h4 className="font-display font-medium mb-4 text-foreground text-xs uppercase tracking-[0.2em]">
              Explore
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/pricing" className="text-muted-foreground hover:text-primary transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/templates" className="text-muted-foreground hover:text-primary transition-colors">
                  Templates
                </Link>
              </li>
              <li>
                <Link to="/marketplace" className="text-muted-foreground hover:text-primary transition-colors">
                  Marketplace
                </Link>
              </li>
              <li>
                <Link to="/reviews" className="text-muted-foreground hover:text-primary transition-colors">
                  Reviews
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-medium mb-4 text-foreground text-xs uppercase tracking-[0.2em]">
              The small print
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/legal/privacy" className="text-muted-foreground hover:text-primary transition-colors">
                  Privacy
                </Link>
              </li>
              <li>
                <Link to="/legal/terms" className="text-muted-foreground hover:text-primary transition-colors">
                  Terms
                </Link>
              </li>
              <li>
                <Link to="/legal/refund" className="text-muted-foreground hover:text-primary transition-colors">
                  Refunds
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border/60 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Busistree. Built in Islamabad.</p>
          <button
            type="button"
            onClick={scrollTop}
            aria-label="Back to top"
            className="inline-flex h-8 items-center gap-1.5 rounded-full border border-border/60 px-3 text-foreground hover:border-primary hover:text-primary transition-colors"
          >
            Back to top
            <ArrowUp className="h-3 w-3" />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
