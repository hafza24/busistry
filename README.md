# Busistree

A SaaS portal that helps Pakistani businesses request, launch, and manage WordPress-powered storefronts — paired with a managed marketplace, growth add-ons, and a multi-tenant admin console.

> Localized for Pakistan: **PKR pricing** and manual mobile-wallet payments (JazzCash, Easypaisa, NayaPay, Raast, Bank Transfer).

---

## What's inside

- **Public site** — Marketing pages: Home, Templates, Pricing, How It Works, Marketplace, Contact.
- **Onboarding wizard** — Multi-step request flow: Project Type → Details → Branding → Team → Store Setup → Contact → Add-ons → Payment.
- **Customer dashboard** — Track requests/orders, manage activated stores, browse marketplace add-ons, upgrade plans.
- **Store dashboard** (per activated store) — Products, Categories, Orders, Settings, Add-ons, Plan upgrades.
- **Admin console** — Approve requests, manage stores, plans, templates, add-ons, integrations, website orders, users.

## Tech stack

| Layer | Choice |
|------|--------|
| Build | Vite 5 + React 18 + TypeScript 5 |
| Styling | Tailwind CSS v3 + shadcn/ui |
| State / data | TanStack Query, React Context |
| Routing | react-router-dom v6 (lazy-loaded routes) |
| Backend | Supabase (Auth, Postgres + RLS, Storage, Edge Functions) |
| Validation | Zod |
| Notifications | Sonner |
| Animation | Framer Motion (respects `prefers-reduced-motion`) |

## Getting started

```bash
# 1. Install
npm install

# 2. Run dev server
npm run dev    # http://localhost:8080
```

Supabase is wired in via `src/integrations/supabase/client.ts`. Lovable Cloud manages the project keys — no `.env` setup required in dev.

## Project structure

```
src/
├── App.tsx                  # Routes (lazy-loaded), QueryClient, ErrorBoundary
├── pages/                   # Route entry points
├── components/
│   ├── admin/               # Admin console panels
│   ├── dashboard/           # Customer dashboard sections
│   ├── onboarding/          # Wizard steps
│   ├── store/               # Per-store dashboard sections
│   ├── marketplace/         # Marketplace browsing + checkout
│   ├── orders/              # Order timeline + status mapping
│   └── ui/                  # shadcn primitives + project-wide UI
├── hooks/                   # Data hooks (useStores, useAdmin, …)
├── contexts/AuthContext.tsx # Supabase auth session
├── lib/validation.ts        # Zod schemas (auth, contact, onboarding)
└── integrations/supabase/   # Generated client + types
```

## Conventions

- **Design tokens only.** Never use raw color classes (`text-white`, `bg-black`) in components — use HSL semantic tokens defined in `src/index.css` and `tailwind.config.ts`.
- **Roles in a dedicated table.** Roles live in `public.user_roles`; check via the `has_role()` SECURITY DEFINER function. Never store roles on `profiles`.
- **Toasts via Sonner.** Use `toast` from `sonner` (or the `useToast()` shim in `src/hooks/use-toast.ts`).
- **Forms validated with Zod.** Centralize schemas in `src/lib/validation.ts`.
- **Images.** Prefer `<OptimizedImage />` from `src/components/ui/optimized-image.tsx` for lazy loading + CLS prevention.

## Security & compliance

- Row-Level Security is enabled on every public-schema table.
- Sensitive credentials (e.g. WordPress logins on `website_orders`) are handled through the `manage-credentials` Edge Function with `CREDENTIALS_ENCRYPTION_KEY`.
- Auth includes failed-login throttling (5 attempts → 60s cooldown) on the client.
- Admin destructive actions go through a typed-phrase `ConfirmDialog`.

## Deployment

Open the [Lovable project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click **Share → Publish**. Connect a custom domain under **Project → Settings → Domains**.

## License

Proprietary © Busistree. All rights reserved.
