import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Menu, X, ArrowRight, Rocket, LogIn } from "lucide-react";
import { useState, useEffect } from "react";
import logo from "@/assets/logo.png";

const leftLinks: { to: string; label: string; showAt?: "md" | "lg" | "xl" }[] = [
  { to: "/", label: "Home", showAt: "md" },
  { to: "/templates", label: "Templates", showAt: "md" },
  { to: "/marketplace", label: "Addons", showAt: "lg" },
  { to: "/templates-on-sale", label: "Sale", showAt: "lg" },
  { to: "/pricing", label: "Pricing", showAt: "lg" },
  { to: "/contact", label: "Contact", showAt: "xl" },
];

const rightLinks: { to: string; label: string }[] = [];

const allLinks = [...leftLinks, ...rightLinks];

const Navbar = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileRender, setMobileRender] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Mount before opening, unmount after closing so we can animate both directions
  useEffect(() => {
    if (mobileOpen) {
      setMobileRender(true);
    } else if (mobileRender) {
      const t = setTimeout(() => setMobileRender(false), 400);
      return () => clearTimeout(t);
    }
  }, [mobileOpen, mobileRender]);

  // Close on route change with animation
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);


  const linkClass = (active: boolean) =>
    `group/nav relative px-4 py-2 text-sm font-bold rounded-xl transition-all duration-300 ease-out overflow-hidden ${
      active
        ? "text-primary"
        : "text-muted-foreground hover:text-primary hover:-translate-y-0.5"
    }`;

  return (
    <header className="sticky top-0 z-50 pt-4 pb-3 px-3 md:px-6">
      <div className="relative w-full flex items-center justify-center group">

        {/* Central Logo Hub overlay */}
        <Link
          to="/"
          className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30 items-center justify-center pointer-events-auto transition-transform duration-500 group-hover:scale-105"
          aria-label="Busistree home"
        >
          <img
            src={logo}
            alt="Busistree"
            className={`w-auto object-contain transition-all duration-300 drop-shadow-[0_10px_25px_hsl(var(--primary)/0.25)] ${
              scrolled ? "h-20" : "h-28"
            }`}
          />
        </Link>

        {/* Main glass nav bar */}
        <nav
          className={`relative flex items-center w-full px-4 md:px-8 bg-transparent transition-all duration-300 ${
            scrolled ? "h-16" : "h-20"
          }`}
        >
          {/* Mobile logo (left) */}
          <Link to="/" className="md:hidden flex items-center gap-2">
            <img src={logo} alt="Busistree" className="h-8 w-auto object-contain" />
          </Link>

          {/* Left links — grouped pill */}
          <div className="hidden md:flex items-center flex-1 min-w-0">
            <div className="inline-flex items-center gap-1 px-1.5 py-1 max-w-full overflow-hidden">
              {leftLinks.map((link) => {
                const visibility =
                  link.showAt === "xl"
                    ? "hidden xl:inline-flex"
                    : link.showAt === "lg"
                    ? "hidden lg:inline-flex"
                    : "inline-flex";
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`${visibility} ${linkClass(location.pathname === link.to)}`}
                  >
                    <span className="relative z-10">{link.label}</span>
                    {/* hover backdrop */}
                    <span
                      aria-hidden="true"
                      className="absolute inset-0 rounded-xl bg-primary/10 opacity-0 scale-90 transition-all duration-300 ease-out group-hover/nav:opacity-100 group-hover/nav:scale-100"
                    />
                    {/* active/hover underline */}
                    <span
                      aria-hidden="true"
                      className={`absolute left-1/2 -translate-x-1/2 bottom-1 h-0.5 rounded-full bg-gradient-brand transition-all duration-300 ease-out ${
                        location.pathname === link.to
                          ? "w-6 opacity-100"
                          : "w-0 opacity-0 group-hover/nav:w-6 group-hover/nav:opacity-100"
                      }`}
                    />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Spacer for logo hub */}
          <div className="hidden md:block w-32 lg:w-40 xl:w-48 shrink-0" aria-hidden="true" />

          {/* Right links + auth */}
          <div className="hidden md:flex items-center gap-1 flex-1 justify-end">
            {rightLinks.map((link) => (
              <Link key={link.to} to={link.to} className={linkClass(location.pathname === link.to)}>
                {link.label}
              </Link>
            ))}

            {user ? (
              <div className="flex items-center gap-2 ml-3">
                <Button asChild variant="glass-brand" size="sm" className="rounded-full gap-2">
                  <Link to="/dashboard">
                    Dashboard
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="glass-accent" size="sm" className="rounded-full" onClick={signOut}>
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2 ml-3">
                <Button asChild variant="glass-accent" size="sm" className="rounded-full gap-2">
                  <Link to="/auth"><LogIn className="h-4 w-4" />Sign In</Link>
                </Button>
                <Button asChild variant="glass-brand" size="sm" className="rounded-full gap-2">
                  <Link to="/auth">
                    Get Started
                    <Rocket className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            type="button"
            className="md:hidden ml-auto p-2 min-h-11 min-w-11 inline-flex items-center justify-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
          >
            <span className="relative h-5 w-5 block">
              <Menu
                className={`absolute inset-0 h-5 w-5 transition-all duration-300 ease-out ${
                  mobileOpen ? "opacity-0 rotate-90 scale-75" : "opacity-100 rotate-0 scale-100"
                }`}
              />
              <X
                className={`absolute inset-0 h-5 w-5 transition-all duration-300 ease-out ${
                  mobileOpen ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-75"
                }`}
              />
            </span>
          </button>
        </nav>
      </div>

      {/* Mobile menu — aligned under navbar */}
      {mobileRender && (
        <div
          id="mobile-menu"
          className={`md:hidden mt-3 w-full grid transition-[grid-template-rows,opacity,transform] duration-[400ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
            mobileOpen
              ? "grid-rows-[1fr] opacity-100 translate-y-0"
              : "grid-rows-[0fr] opacity-0 -translate-y-2"
          }`}
        >
          <div className="min-h-0 overflow-hidden rounded-3xl border border-border/60 bg-background/95 backdrop-blur-xl shadow-[0_20px_60px_-20px_hsl(var(--foreground)/0.15)] ring-1 ring-foreground/5">
            <nav className="flex flex-col p-2">
              {allLinks.map((link, i) => {
                const active = location.pathname === link.to;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileOpen(false)}
                    style={{
                      transitionDelay: mobileOpen ? `${80 + i * 40}ms` : "0ms",
                    }}
                    className={`group/mlink relative flex items-center h-12 px-4 rounded-2xl text-sm font-semibold overflow-hidden transition-all duration-300 ease-out ${
                      mobileOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-3"
                    } ${
                      active
                        ? "text-primary bg-primary/10"
                        : "text-foreground/80 hover:text-primary hover:bg-secondary hover:translate-x-1"
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`absolute left-2 top-1/2 -translate-y-1/2 w-1 rounded-full bg-gradient-brand transition-all duration-300 ease-out ${
                        active ? "h-6 opacity-100" : "h-0 opacity-0 group-hover/mlink:h-4 group-hover/mlink:opacity-70"
                      }`}
                    />
                    <span className="relative z-10 ml-2">{link.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div
              style={{ transitionDelay: mobileOpen ? `${80 + allLinks.length * 40}ms` : "0ms" }}
              className={`border-t border-border/60 p-3 flex flex-col gap-2 transition-all duration-300 ease-out ${
                mobileOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
              }`}
            >
              {user ? (
                <>
                  <Button className="w-full h-12 rounded-2xl bg-foreground text-background hover:bg-foreground/90 font-bold" asChild>
                    <Link to="/dashboard" onClick={() => setMobileOpen(false)}>Dashboard</Link>
                  </Button>
                  <Button variant="outline" className="w-full h-12 rounded-2xl font-bold" onClick={() => { signOut(); setMobileOpen(false); }}>
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" className="w-full h-12 rounded-2xl font-bold" asChild>
                    <Link to="/auth" onClick={() => setMobileOpen(false)}>Sign In</Link>
                  </Button>
                  <Button className="w-full h-12 rounded-2xl bg-foreground text-background hover:bg-foreground/90 font-bold" asChild>
                    <Link to="/auth" onClick={() => setMobileOpen(false)}>Get Started</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

    </header>
  );
};

export default Navbar;
