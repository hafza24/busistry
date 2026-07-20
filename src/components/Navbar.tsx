import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Menu, X, ArrowRight, Rocket, LogIn, LogOut, LayoutTemplate, Sparkles, Tag, CreditCard, Info, Users, ChevronDown, Star, ShoppingBag, Repeat, Flame } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo.png";
import ThemeToggle from "@/components/ThemeToggle";
import { TEMPLATE_CATEGORIES } from "@/lib/templateCategories";

type NavLink = { to: string; label: string; showAt?: "md" | "lg" | "xl" };
type MegaKey = "marketplace" | "about";

const leftLinks: NavLink[] = [
  { to: "/", label: "Home", showAt: "md" },
  { to: "/how-it-works", label: "How it works", showAt: "lg" },
  { to: "/contact", label: "Contact", showAt: "xl" },
];

const marketplaceItems = [
  { to: "/templates", label: "Templates", desc: "Ready-made websites, launched in 24–48h.", icon: LayoutTemplate },
  { to: "/addons", label: "Addons", desc: "Extend your store with paid add-ons.", icon: Sparkles },
  { to: "/templates-on-sale", label: "Sale", desc: "Discounted templates, limited time.", icon: Tag },
  { to: "/pricing", label: "Pricing", desc: "Plans and one-time template pricing.", icon: CreditCard },
];

const aboutItems = [
  { to: "/about", label: "About us", desc: "Our story, mission, and values.", icon: Info },
  
  { to: "/reviews", label: "Reviews", desc: "Customer stories, ratings, and case studies.", icon: Star },
];

const mobileLinks: NavLink[] = [
  { to: "/", label: "Home" },
  { to: "/marketplace", label: "Marketplace" },
  { to: "/templates", label: "Templates" },
  { to: "/addons", label: "Addons" },
  { to: "/templates-on-sale", label: "Sale" },
  { to: "/pricing", label: "Pricing" },
  { to: "/how-it-works", label: "How it works" },
  { to: "/about", label: "About us" },
  
  { to: "/reviews", label: "Reviews" },
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
  const [openMenu, setOpenMenu] = useState<MegaKey | null>(null);
  const [openMobileGroup, setOpenMobileGroup] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Fetch plans for the Plans mega (Buy vs Rent)
  const { data: plans = [] } = useQuery({
    queryKey: ["nav_plans"],
    queryFn: async () => {
      const { data } = await supabase
        .from("plans")
        .select("id,name,price_pkr,type,duration_days")
        .eq("is_active", true)
        .order("price_pkr");
      return data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });

  // Fetch sale templates for the Sale mega
  const { data: saleTemplates = [] } = useQuery({
    queryKey: ["nav_sale_templates"],
    queryFn: async () => {
      const { data } = await supabase
        .from("templates")
        .select("id,name,price_pkr,sale_price_pkr,preview_image_url,category")
        .eq("is_active", true)
        .not("sale_price_pkr", "is", null)
        .order("sale_price_pkr")
        .limit(6);
      return data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });


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
  const openWith = (key: MegaKey) => {
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
        : "text-muted-foreground hover:text-neutral hover:-translate-y-0.5"
    }`;

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ease-out ${
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
          className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30 items-center justify-center pointer-events-auto transition-transform duration-500 group-hover:scale-105"
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
          className={`relative flex items-center w-full bg-transparent transition-all duration-300 px-4 md:px-6 lg:px-8 ${
            scrolled ? "h-14" : "h-20"
          }`}
        >
          {/* Mobile logo (left) */}
          <Link to="/" className="lg:hidden flex items-center gap-2">
            <img src={logo} alt="Busistree" className="h-16 md:h-20 w-auto object-contain" />
          </Link>

          {/* Left links + mega menus */}
          <div className="hidden lg:flex items-center flex-1 min-w-0">
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
                  type="button"
                  aria-haspopup="true"
                  aria-expanded={openMenu === "marketplace"}
                  onMouseEnter={() => openWith("marketplace")}
                  onFocus={() => openWith("marketplace")}
                  onClick={() => setOpenMenu((cur) => (cur === "marketplace" ? null : "marketplace"))}
                  className={`inline-flex items-center gap-1 h-9 px-4 text-sm font-bold rounded-xl transition-all duration-300 ease-out bg-transparent hover:bg-neutral/10 ${
                    openMenu === "marketplace" ||
                    location.pathname.startsWith("/templates") ||
                    location.pathname === "/pricing" ||
                    location.pathname === "/templates-on-sale" ||
                    location.pathname === "/addons" ||
                    location.pathname === "/marketplace"
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-neutral"
                  }`}
                >
                  Marketplace
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-300 ${openMenu === "marketplace" ? "rotate-180" : ""}`} />
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
                  type="button"
                  aria-haspopup="true"
                  aria-expanded={openMenu === "about"}
                  onMouseEnter={() => openWith("about")}
                  onFocus={() => openWith("about")}
                  onClick={() => setOpenMenu((cur) => (cur === "about" ? null : "about"))}
                  className={`inline-flex items-center gap-1 h-9 px-4 text-sm font-bold rounded-xl transition-all duration-300 ease-out bg-transparent hover:bg-neutral/10 ${
                    openMenu === "about" || aboutItems.some((i) => location.pathname === i.to)
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-neutral"
                  }`}
                >
                  About
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-300 ${openMenu === "about" ? "rotate-180" : ""}`} />
                </button>

                {/* Dropdown panel */}
                {openMenu && (
                  <div
                    onMouseEnter={cancelClose}
                    onMouseLeave={scheduleClose}
                    className={`absolute top-full ${openMenu === "about" ? "right-0" : "left-0"} mt-2 z-50 animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-200`}
                  >
                    <div className="rounded-2xl border border-border/60 bg-popover shadow-[0_20px_60px_-20px_hsl(var(--foreground)/0.25)] ring-1 ring-foreground/5 overflow-hidden">
                      {openMenu === "templates" && (
                        <div className="p-5 w-[720px] grid grid-cols-3 gap-x-6 gap-y-1 max-h-[70vh] overflow-y-auto">
                          <div className="col-span-3 flex items-center justify-between pb-3 mb-2 border-b border-border/50">
                            <div>
                              <div className="text-xs uppercase tracking-wider text-muted-foreground">Browse by category</div>
                              <div className="text-sm font-semibold text-foreground">Templates for every kind of website</div>
                            </div>
                            <Link to="/templates" onClick={() => setOpenMenu(null)} className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1">
                              All templates <ArrowRight className="h-3 w-3" />
                            </Link>
                          </div>
                          {Object.entries(TEMPLATE_CATEGORIES).map(([cat, subs]) => (
                            <div key={cat} className="min-w-0">
                              <Link
                                to={`/templates?category=${encodeURIComponent(cat)}`}
                                onClick={() => setOpenMenu(null)}
                                className="block text-sm font-semibold text-foreground hover:text-primary transition-colors mb-1.5"
                              >
                                {cat}
                              </Link>
                              <ul className="space-y-1 mb-3">
                                {subs.slice(0, 5).map((s) => (
                                  <li key={s}>
                                    <Link
                                      to={`/templates?category=${encodeURIComponent(cat)}&subcategory=${encodeURIComponent(s)}`}
                                      onClick={() => setOpenMenu(null)}
                                      className="text-xs text-muted-foreground hover:text-neutral transition-colors"
                                    >
                                      {s}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      )}

                      {openMenu === "plans" && (
                        <div className="p-5 w-[560px] grid grid-cols-2 gap-4">
                          <div className="col-span-2 flex items-center justify-between pb-3 border-b border-border/50">
                            <div className="text-sm font-semibold text-foreground">Choose how you want to pay</div>
                            <Link to="/pricing" onClick={() => setOpenMenu(null)} className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1">
                              Compare plans <ArrowRight className="h-3 w-3" />
                            </Link>
                          </div>
                          {[
                            { key: "buy", to: "/pricing?type=buy", label: "Buy", icon: ShoppingBag, desc: "One-time payment, own it for life. No renewals.", filter: (p: any) => p.type === "buy" || p.type === "lifetime" || !p.duration_days },
                            { key: "rent", to: "/pricing?type=rent", label: "Rent", icon: Repeat, desc: "Pay monthly or yearly. Cancel anytime.", filter: (p: any) => p.type === "rent" || (p.duration_days && p.duration_days > 0) },
                          ].map((group) => {
                            const list = plans.filter(group.filter).slice(0, 4);
                            return (
                              <Link
                                key={group.key}
                                to={group.to}
                                onClick={() => setOpenMenu(null)}
                                className="group rounded-xl border border-border/60 p-4 hover:border-primary/50 hover:bg-primary/5 transition-all"
                              >
                                <div className="flex items-center gap-2 mb-1.5">
                                  <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                    <group.icon className="h-4 w-4" />
                                  </div>
                                  <div className="text-sm font-bold text-foreground">{group.label}</div>
                                </div>
                                <p className="text-xs text-muted-foreground mb-3">{group.desc}</p>
                                <ul className="space-y-1">
                                  {(list.length ? list : [{ id: "x", name: "See plans", price_pkr: 0 }]).map((p: any) => (
                                    <li key={p.id} className="flex items-center justify-between text-xs">
                                      <span className="text-foreground/80 truncate">{p.name}</span>
                                      {p.price_pkr > 0 && (
                                        <span className="text-primary font-semibold shrink-0 ml-2">PKR {p.price_pkr.toLocaleString()}</span>
                                      )}
                                    </li>
                                  ))}
                                </ul>
                              </Link>
                            );
                          })}
                        </div>
                      )}

                      {openMenu === "sale" && (
                        <div className="p-5 w-[640px]">
                          <div className="flex items-center justify-between pb-3 mb-3 border-b border-border/50">
                            <div className="flex items-center gap-2">
                              <Flame className="h-4 w-4 text-primary" />
                              <div className="text-sm font-semibold text-foreground">On sale right now</div>
                            </div>
                            <Link to="/templates-on-sale" onClick={() => setOpenMenu(null)} className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1">
                              View all deals <ArrowRight className="h-3 w-3" />
                            </Link>
                          </div>
                          {saleTemplates.length === 0 ? (
                            <p className="text-sm text-muted-foreground py-6 text-center">No active sales — check back soon.</p>
                          ) : (
                            <div className="grid grid-cols-3 gap-3">
                              {saleTemplates.map((t: any) => (
                                <Link
                                  key={t.id}
                                  to={`/templates/${t.id}`}
                                  onClick={() => setOpenMenu(null)}
                                  className="group rounded-xl overflow-hidden border border-border/60 hover:border-primary/50 hover:shadow-md transition-all"
                                >
                                  <div className="aspect-video bg-gradient-to-br from-primary/10 to-accent/10 overflow-hidden">
                                    {t.preview_image_url && (
                                      <img src={t.preview_image_url} alt={t.name} loading="lazy" className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    )}
                                  </div>
                                  <div className="p-2.5">
                                    <div className="text-xs font-semibold text-foreground truncate">{t.name}</div>
                                    <div className="flex items-baseline gap-1.5 mt-0.5">
                                      <span className="text-xs font-bold text-primary">PKR {(t.sale_price_pkr ?? t.price_pkr).toLocaleString()}</span>
                                      {t.sale_price_pkr && t.price_pkr > t.sale_price_pkr && (
                                        <span className="text-[10px] text-muted-foreground line-through">PKR {t.price_pkr.toLocaleString()}</span>
                                      )}
                                    </div>
                                  </div>
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {openMenu === "about" && (
                        <div className="p-4 w-[360px] grid gap-2">
                          {aboutItems.map((it) => (
                            <Link
                              key={it.to}
                              to={it.to}
                              onClick={() => setOpenMenu(null)}
                              className="group flex items-start gap-3 rounded-xl p-3 hover:bg-neutral/10 transition-colors"
                            >
                              <div className="h-9 w-9 shrink-0 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:bg-neutral group-hover:text-neutral-foreground transition-colors">
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
          <div className="hidden lg:block w-32 lg:w-40 xl:w-48 shrink-0" aria-hidden="true" />

          {/* Right links + auth */}
          <div className="hidden lg:flex items-center gap-1 flex-1 justify-end">
            {rightLinks.map((link) => (
              <Link key={link.to} to={link.to} className={linkClass(location.pathname === link.to)}>
                {link.label}
              </Link>
            ))}
            <ThemeToggle className="mr-1" />

            {user ? (
              <div className="flex items-center gap-2 ml-3">
                <Button asChild variant="glass-brand" size="sm" className="rounded-full gap-2">
                  <Link to="/dashboard">
                    Dashboard
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" className="rounded-full gap-1.5 text-muted-foreground hover:text-foreground hover:bg-destructive/10 hover:text-destructive transition-colors" onClick={signOut}>
                  <LogOut className="h-4 w-4" />
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
          {/* Mobile: theme toggle + hamburger */}
          <div className="lg:hidden ml-auto flex items-center gap-1">
            <ThemeToggle />
          <button
            type="button"
            className="p-2 min-h-11 min-w-11 inline-flex items-center justify-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
          </div>
        </nav>
      </div>

      {/* Mobile menu — aligned under navbar */}
      {mobileRender && (
        <div
          id="mobile-menu"
          className={`lg:hidden mt-3 w-full grid transition-[grid-template-rows,opacity,transform] duration-[400ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
            mobileOpen
              ? "grid-rows-[1fr] opacity-100 translate-y-0"
              : "grid-rows-[0fr] opacity-0 -translate-y-2"
          }`}
        >
          <div className="min-h-0 overflow-hidden rounded-3xl border border-border/60 bg-background/95 backdrop-blur-xl shadow-[0_20px_60px_-20px_hsl(var(--foreground)/0.15)] ring-1 ring-foreground/5">
            <nav className="flex flex-col p-2">
              {(() => {
                const sections: Array<
                  | { kind: "link"; to: string; label: string }
                  | { kind: "group"; to: string; label: string; items: typeof marketplaceItems }
                > = [
                  { kind: "link", to: "/", label: "Home" },
                  { kind: "group", to: "/marketplace", label: "Marketplace", items: marketplaceItems },
                  { kind: "link", to: "/how-it-works", label: "How it works" },
                  { kind: "group", to: "/about", label: "About", items: aboutItems },
                  { kind: "link", to: "/contact", label: "Contact" },
                ];
                let i = 0;
                const renderLink = (to: string, label: string, opts?: { sub?: boolean; icon?: any }) => {
                  const active = location.pathname === to;
                  const idx = i++;
                  const Icon = opts?.icon;
                  return (
                    <Link
                      key={to}
                      to={to}
                      onClick={() => setMobileOpen(false)}
                      style={{ transitionDelay: mobileOpen ? `${80 + idx * 30}ms` : "0ms" }}
                      className={`group/mlink relative flex items-center gap-3 h-12 rounded-2xl text-sm overflow-hidden transition-all duration-300 ease-out ${
                        opts?.sub ? "pl-10 pr-4 font-medium" : "px-4 font-semibold"
                      } ${
                        mobileOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-3"
                      } ${
                        active
                          ? "text-primary bg-primary/10"
                          : "text-foreground/80 hover:text-neutral hover:bg-secondary hover:translate-x-1"
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className={`absolute ${opts?.sub ? "left-6" : "left-2"} top-1/2 -translate-y-1/2 w-1 rounded-full bg-gradient-brand transition-all duration-300 ease-out ${
                          active ? "h-6 opacity-100" : "h-0 opacity-0 group-hover/mlink:h-4 group-hover/mlink:opacity-70"
                        }`}
                      />
                      {Icon && (
                        <span className="relative z-10 h-7 w-7 shrink-0 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                          <Icon className="h-3.5 w-3.5" />
                        </span>
                      )}
                      <span className="relative z-10 ml-2">{label}</span>
                    </Link>
                  );
                };
                return sections.map((s) => {
                  if (s.kind === "link") return renderLink(s.to, s.label);
                  const isOpen = openMobileGroup === s.to;
                  return (
                    <div key={s.to} className="flex flex-col">
                      <div className="relative flex items-center">
                        <div className="flex-1">{renderLink(s.to, s.label)}</div>
                        <button
                          type="button"
                          aria-label={`Toggle ${s.label} submenu`}
                          aria-expanded={isOpen}
                          onClick={() => setOpenMobileGroup(isOpen ? null : s.to)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 inline-flex items-center justify-center rounded-xl text-muted-foreground hover:text-neutral hover:bg-neutral/10 transition-colors"
                        >
                          <ChevronDown
                            className={`h-4 w-4 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${isOpen ? "rotate-180 scale-110 text-primary" : "rotate-0 scale-100"}`}
                          />
                        </button>
                      </div>
                      <div
                        className={`grid transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                        }`}
                      >
                        <div className="min-h-0 overflow-hidden">
                          <div className="ml-2 my-1 border-l border-border/60 pl-1 flex flex-col rounded-xl">
                            {s.items.map((it, subIdx) => (
                              <div
                                key={it.to}
                                style={{
                                  transitionDelay: isOpen ? `${80 + subIdx * 50}ms` : "0ms",
                                }}
                                className={`transition-all duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                                  isOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1"
                                }`}
                              >
                                {renderLink(it.to, it.label, { sub: true, icon: it.icon })}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                    </div>
                  );
                });
              })()}
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
