## Goal

Expand Busistry's catalog from a single "Website" product into **three distinct product types**, gate add-ons behind owning a website, and add an **Upgrade / Limit Increase** order flow.

---

## 1. Three product types

### A. Website (main product) — already exists
- Bought via Templates → Onboarding → Plan + Add-ons.
- Prerequisite for everything else. User must own at least one **active website** before they can buy B or C.

### B. Page / Section / Popup add-ons (per-website)
A new catalog of installable building blocks the user attaches to an existing website:
- **Pages** — e.g. About, Services, Pricing, Blog, Portfolio
- **Sections** — e.g. Testimonials, FAQ, Hero variants, Pricing table, Stats counter
- **Popups** — e.g. Newsletter signup, Exit-intent discount, Cookie consent, Promo banner

Each item has: name, type (page/section/popup), description, **preview image + live demo URL**, price (PKR, one-time), category, applicable templates, enabled flag.

Browsing UX: marketplace grid filterable by type with preview modal (image + iframe demo + "Add to my website" CTA → checkout).

### C. Integrations (per-website)
Plug-ins the team configures on the user's WordPress site:
- WhatsApp chat button
- Mailbox / contact form to inbox
- Google Analytics, Meta Pixel, Mailchimp, Instagram feed, Live chat, etc.

Each integration has: name, description, icon, price (one-time setup or monthly), required credentials schema (jsonb — e.g. WhatsApp number, SMTP host), enabled flag.

---

## 2. Upgrade / Limit Increase flow

A new **"Upgrade Plan"** section in the user dashboard (and per-store page) where the user can place an order to:
- **Upgrade plan tier** (Free → Rent → Buy, or higher tier)
- **Increase product limit** (+50, +100, +500 products)
- **Increase category limit** (+5, +10)
- **Extend hosting** (renew duration_days)

Each option has a price. Submitting creates an `upgrade_order` (manual payment via JazzCash/Easypaisa screenshot, same flow as website orders). Admin approves → store limits/plan/expiry updated.

---

## 3. Database changes (new migration)

```text
website_products            -- catalog for B (pages/sections/popups)
  id, type ('page'|'section'|'popup'), name, slug, description,
  price_pkr, preview_image_url, demo_url, category, 
  applicable_templates jsonb, is_enabled, sort_order

integrations                -- catalog for C
  id, name, slug, description, icon, price_pkr,
  pricing_type ('one_time'|'monthly'), credential_schema jsonb,
  is_enabled, sort_order

store_addons                -- junction: which B/C items a store has
  id, store_id, item_type ('product'|'integration'),
  item_id, status ('pending'|'active'), 
  price_snapshot_pkr, config jsonb, created_at

upgrade_orders              -- C: upgrade/limit orders
  id, user_id, store_id, upgrade_type
  ('plan_change'|'product_limit'|'category_limit'|'extend_duration'),
  details jsonb (target_plan_id, qty, etc.),
  amount, payment_method, transaction_id, screenshot_url,
  status ('pending'|'approved'|'rejected'), admin_notes,
  created_at, updated_at
```

RLS: public SELECT on enabled catalog rows; users manage their own `store_addons` / `upgrade_orders` via store ownership; admins full access.

---

## 4. UI work

**User-facing (Store Dashboard `/store/:id`)** — new sidebar items:
- **Marketplace → Pages / Sections / Popups** (browse + preview + buy)
- **Marketplace → Integrations** (browse + buy + provide credentials)
- **My Add-ons** (list of installed B/C items + status)
- **Upgrade Plan** (4 cards: change plan, +products, +categories, +duration → checkout form)

Public **Marketplace page** `/marketplace` for browsing pages/sections/popups/integrations (gated CTA: "Sign in & select a store to install").

**Admin (`/admin`)** — new sidebar items:
- **Website Products** (CRUD pages/sections/popups + upload preview images)
- **Integrations** (CRUD + credential schema editor)
- **Upgrade Orders** (approve/reject, on approve auto-update store plan/limits/expiry)
- **Store Add-ons** (mark `pending` → `active` after install)

---

## 5. Files to create / edit

**New**
- `supabase/migrations/<ts>_marketplace_and_upgrades.sql`
- `src/hooks/useWebsiteProducts.ts`, `useIntegrations.ts`, `useStoreAddons.ts`, `useUpgradeOrders.ts`
- `src/pages/Marketplace.tsx` (public)
- `src/components/store/MarketplaceBrowser.tsx` (in store dashboard)
- `src/components/store/MyAddons.tsx`
- `src/components/store/UpgradePlan.tsx`
- `src/components/admin/AdminWebsiteProducts.tsx`
- `src/components/admin/AdminIntegrations.tsx`
- `src/components/admin/AdminUpgradeOrders.tsx`
- `src/components/marketplace/PreviewModal.tsx`

**Edit**
- `src/App.tsx` — add `/marketplace` route
- `src/pages/StoreDashboard.tsx` + `StoreDashboardSidebar.tsx` — new tabs
- `src/pages/AdminDashboard.tsx` + `AdminSidebar.tsx` — new tabs
- `src/components/Navbar.tsx` — add Marketplace link

---

## 6. Out of scope (clarify later if needed)
- Auto-installation of pages/integrations onto WordPress (manual fulfillment by admin team for now — same 24–48h promise).
- Per-integration recurring billing automation (recurring shown but charged manually each cycle).
- Refunds / partial cancellations of add-ons.

---

## Open questions

1. **Preview demo URL** for pages/sections/popups — should I allow both an iframe demo URL **and** a static image, or image only for v1? (iframe gives "real" preview but needs CORS-friendly hosts).
2. **Upgrade pricing** — should the price be a fixed per-unit value the admin sets (e.g. "+50 products = PKR 1500"), or computed from a formula? Recommend admin-managed fixed tiers in a `upgrade_options` table.
3. **Marketplace gating** — public browse + login-to-buy, or fully behind auth? Recommend public browse for SEO/conversion.

I'll proceed with the recommendations above unless you say otherwise.