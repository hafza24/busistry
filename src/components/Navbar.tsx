import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Menu, X, Home, LayoutTemplate, ShoppingBag, DollarSign, Rocket, LifeBuoy, Mail, LogIn } from "lucide-react";
import { useState, useEffect } from "react";
import logo from "@/assets/logo.png";


const navLinks = [
  { to: "/", label: "Home", icon: Home },
  { to: "/templates", label: "Templates", icon: LayoutTemplate },
  { to: "/marketplace", label: "Marketplace", icon: ShoppingBag },
  { to: "/pricing", label: "Pricing", icon: DollarSign },
  
  
  { to: "/contact", label: "Contact", icon: Mail },
];

const Navbar = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`sticky top-0 z-50 border-b transition-all duration-300 ${
        scrolled
          ? "border-border bg-background/85 backdrop-blur-xl shadow-soft"
          : "border-transparent bg-background/60 backdrop-blur-md"
      }`}
    >
      <div className={`container flex items-center justify-between transition-all duration-300 ${scrolled ? "h-14" : "h-16 md:h-20"}`}>
        <Link to="/" className="flex items-center gap-2 group">
          <img
            src={logo}
            alt="Busistree"
            className={`w-auto object-contain transition-all duration-300 group-hover:scale-110 group-hover:drop-shadow-[0_0_18px_hsl(var(--primary-glow)/0.5)] ${
              scrolled ? "h-8 md:h-9" : "h-9 md:h-12"
            }`}
          />
        </Link>


        {/* Desktop nav — pill style */}
        <div className="hidden md:flex items-center gap-1 rounded-full border border-border bg-card/70 backdrop-blur px-1.5 py-1 shadow-soft">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  active
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {link.label}
                {active && <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-primary" />}
              </Link>
            );
          })}
        </div>

        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <>
              <Button variant="outline" size="sm" className="rounded-full" asChild>
                <Link to="/dashboard">Dashboard</Link>
              </Button>
              <Button variant="outline" size="sm" className="rounded-full" onClick={signOut}>
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" className="rounded-full" asChild>
                <Link to="/auth"><LogIn className="h-3.5 w-3.5" />Sign In</Link>
              </Button>
              <Button size="sm" className="rounded-full bg-gradient-to-r from-primary to-primary-glow shadow-brand" asChild>
                <Link to="/auth"><Rocket className="h-3.5 w-3.5" />Get Started</Link>
              </Button>
            </>
          )}
        </div>


        {/* Mobile toggle */}
        <button
          type="button"
          className="md:hidden p-2 min-h-11 min-w-11 inline-flex items-center justify-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
        >
          {mobileOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div id="mobile-menu" className="md:hidden border-t border-border bg-background px-4 pb-4">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className="block py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-border mt-2 space-y-2">
            {user ? (
              <>
                <Button variant="ghost" size="sm" className="w-full justify-start" asChild>
                  <Link to="/dashboard" onClick={() => setMobileOpen(false)}>Dashboard</Link>
                </Button>
                <Button variant="outline" size="sm" className="w-full" onClick={() => { signOut(); setMobileOpen(false); }}>
                  Sign Out
                </Button>
              </>
            ) : (
              <Button size="sm" className="w-full" asChild>
                <Link to="/auth" onClick={() => setMobileOpen(false)}>Get Started</Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
