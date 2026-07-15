import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Menu, X, ArrowRight, Rocket, LogIn, LayoutTemplate, Sparkles, Tag, CreditCard, Info, Users, ChevronDown } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import logo from "@/assets/logo.png";

type NavLink = { to: string; label: string; showAt?: "md" | "lg" | "xl" };

const leftLinks: NavLink[] = [
  { to: "/", label: "Home", showAt: "md" },
  { to: "/how-it-works", label: "How it works", showAt: "lg" },
  { to: "/contact", label: "Contact", showAt: "xl" },
];

const marketplaceItems = [
  { to: "/templates", label: "Templates", desc: "Ready-made websites, launched in 24–48h.", icon: LayoutTemplate },
  { to: "/marketplace", label: "Addons", desc: "Extend your store with paid add-ons.", icon: Sparkles },
  { to: "/templates-on-sale", label: "Sale", desc: "Discounted templates, limited time.", icon: Tag },
  { to: "/pricing", label: "Pricing", desc: "Plans and one-time template pricing.", icon: CreditCard },
];

const aboutItems = [
  { to: "/about", label: "About us", desc: "Our story, mission, and values.", icon: Info },
  { to: "/team", label: "Team", desc: "Meet the people behind Busistree.", icon: Users },
];

const mobileLinks: NavLink[] = [
  { to: "/", label: "Home" },
  { to: "/templates", label: "Templates" },
  { to: "/marketplace", label: "Addons" },
  { to: "/templates-on-sale", label: "Sale" },
  { to: "/pricing", label: "Pricing" },
  { to: "/how-it-works", label: "How it works" },
  { to: "/about", label: "About us" },
  { to: "/team", label: "Team" },
  { to: "/contact", label: "Contact" },
];

const rightLinks: NavLink[] = [];
const allLinks = mobileLinks;

const Navbar = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileRender, setMobileRender] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openMenu, setOpenMenu] = useState<"marketplace" | "about" | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // ── DEBUG OVERLAY ─────────────────────────────────────────────
  const marketplaceBtnRef = useRef<HTMLButtonElement | null>(null);
  const aboutBtnRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  type Rect = { x: number; y: number; w: number; h: number };
  const [debugRects, setDebugRects] = useState<{
    marketplace: Rect | null;
    about: Rect | null;
    panel: Rect | null;
  }>({ marketplace: null, about: null, panel: null });

  useEffect(() => {
    const measure = () => {
      const toRect = (el: Element | null): Rect | null => {
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return { x: r.x, y: r.y, w: r.width, h: r.height };
      };
      setDebugRects({
        marketplace: toRect(marketplaceBtnRef.current),
        about: toRect(aboutBtnRef.current),
        panel: toRect(panelRef.current),
      });
    };
    measure();
    const id = window.setInterval(measure, 250);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [openMenu]);

  const cancelClose = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpenMenu(null), 150);
  };
  const openWith = (key: "marketplace" | "about") => {
    cancelClose();
    setOpenMenu(key);
  };

  // Close mega menu on route change
  useEffect(() => {
    setOpenMenu(null);
  }, [location.pathname]);

  // Close on Escape + outside click
  useEffect(() => {
    if (!openMenu) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenMenu(null);
    };
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [openMenu]);

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
    <header
      className={`sticky top-0 z-50 px-3 md:px-6 transition-all duration-300 ease-out ${
        scrolled ? "pt-2 pb-2" : "pt-4 pb-3"
      }`}
    >
      {/* Sticky backdrop — appears only after scroll */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 transition-opacity duration-300 ease-out ${
          scrolled ? "opacity-100" : "opacity-0"
        }`}
        style={{
          background:
            "linear-gradient(180deg, hsl(var(--background) / 0.85) 0%, hsl(var(--background) / 0.65) 100%)",
          backdropFilter: "blur(14px) saturate(140%)",
          WebkitBackdropFilter: "blur(14px) saturate(140%)",
          boxShadow: scrolled ? "0 10px 30px -12px hsl(var(--foreground) / 0.18)" : "none",
          borderBottom: "1px solid hsl(var(--border) / 0.6)",
        }}
      />


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
              scrolled ? "h-16" : "h-28"
            }`}
          />
        </Link>

        {/* Main glass nav bar */}
        <nav
          className={`relative flex items-center w-full px-4 md:px-8 bg-transparent transition-all duration-300 ${
            scrolled ? "h-14" : "h-20"
          }`}
        >
          {/* Mobile logo (left) */}
          <Link to="/" className="md:hidden flex items-center gap-2">
            <img src={logo} alt="Busistree" className="h-8 w-auto object-contain" />
          </Link>

          {/* Left links + mega menus */}
          <div className="hidden md:flex items-center flex-1 min-w-0">
            <div className="inline-flex items-center gap-1 px-1.5 py-1 max-w-full overflow-visible">
              {/* Home */}
              <Link to="/" className={linkClass(location.pathname === "/")}>
                <span className="relative z-10">Home</span>
              </Link>

              {/* Mega menus (custom hover/click dropdown) */}
              <div
                ref={menuRef}
                className="relative flex items-center gap-1"
                onMouseLeave={scheduleClose}
              >
                {/* Marketplace */}
                <button
                  ref={marketplaceBtnRef}
                  type="button"
                  aria-haspopup="true"
                  aria-expanded={openMenu === "marketplace"}
                  onMouseEnter={() => openWith("marketplace")}
                  onFocus={() => openWith("marketplace")}
                  onClick={() =>
                    setOpenMenu((cur) => (cur === "marketplace" ? null : "marketplace"))
                  }
                  className={`inline-flex items-center gap-1 h-9 px-4 text-sm font-bold rounded-xl transition-all duration-300 ease-out bg-transparent hover:bg-primary/10 ${
                    openMenu === "marketplace" || marketplaceItems.some((i) => location.pathname === i.to)
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-primary"
                  }`}
                >
                  Marketplace
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform duration-300 ${
                      openMenu === "marketplace" ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* How it works */}
                <Link
                  to="/how-it-works"
                  onMouseEnter={scheduleClose}
                  className={`hidden lg:inline-flex ${linkClass(location.pathname === "/how-it-works")}`}
                >
                  <span className="relative z-10">How it works</span>
                </Link>

                {/* About */}
                <button
                  ref={aboutBtnRef}
                  type="button"
                  aria-haspopup="true"
                  aria-expanded={openMenu === "about"}
                  onMouseEnter={() => openWith("about")}
                  onFocus={() => openWith("about")}
                  onClick={() =>
                    setOpenMenu((cur) => (cur === "about" ? null : "about"))
                  }
                  className={`inline-flex items-center gap-1 h-9 px-4 text-sm font-bold rounded-xl transition-all duration-300 ease-out bg-transparent hover:bg-primary/10 ${
                    openMenu === "about" || aboutItems.some((i) => location.pathname === i.to)
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-primary"
                  }`}
                >
                  About
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform duration-300 ${
                      openMenu === "about" ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Dropdown panel */}
                {openMenu && (
                  <div
                    onMouseEnter={cancelClose}
                    onMouseLeave={scheduleClose}
                    className={`absolute top-full ${
                      openMenu === "marketplace" ? "left-0" : "left-auto right-0"
                    } mt-2 z-50 animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-200`}
                  >
                    <div className="rounded-2xl border border-border/60 bg-popover shadow-[0_20px_60px_-20px_hsl(var(--foreground)/0.25)] ring-1 ring-foreground/5 overflow-hidden">
                      {openMenu === "marketplace" ? (
                        <div className="p-4 w-[520px] grid grid-cols-2 gap-2">
                          {marketplaceItems.map((it) => (
                            <Link
                              key={it.to}
                              to={it.to}
                              onClick={() => setOpenMenu(null)}
                              className="group flex items-start gap-3 rounded-xl p-3 hover:bg-primary/5 transition-colors"
                            >
                              <div className="h-9 w-9 shrink-0 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                <it.icon className="h-4 w-4" />
                              </div>
                              <div className="min-w-0">
                                <div className="text-sm font-semibold text-foreground">{it.label}</div>
                                <div className="text-xs text-muted-foreground mt-0.5">{it.desc}</div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 w-[360px] grid gap-2">
                          {aboutItems.map((it) => (
                            <Link
                              key={it.to}
                              to={it.to}
                              onClick={() => setOpenMenu(null)}
                              className="group flex items-start gap-3 rounded-xl p-3 hover:bg-primary/5 transition-colors"
                            >
                              <div className="h-9 w-9 shrink-0 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                <it.icon className="h-4 w-4" />
                              </div>
                              <div className="min-w-0">
                                <div className="text-sm font-semibold text-foreground">{it.label}</div>
                                <div className="text-xs text-muted-foreground mt-0.5">{it.desc}</div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>


              {/* Contact */}
              <Link
                to="/contact"
                className={`hidden xl:inline-flex ${linkClass(location.pathname === "/contact")}`}
              >
                <span className="relative z-10">Contact</span>
              </Link>
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
