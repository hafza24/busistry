
# Marketplace Restructure Plan

Goal: eliminate the four parallel systems (`addons`, `integrations`, `website_products`, `upgrade_orders` catalog) and replace them with **one unified catalog + one order table**, backed by a shared card, detail page, admin editor, and user history.

---

## 1. New database model

Two new tables replace the catalog side of all four systems.

### `catalog_items` — single source of truth for anything a user can buy/request

Fields:
- `id`, `slug` (unique), `name`, `short_description`, `long_description`
- `type` enum: `addon`, `integration`, `page`, `section`, `popup`, `plan_upgrade`, `product_limit`, `category_limit`, `extend_duration`, `content_tweak`
- `category` (freeform tag, e.g. "Marketing", "SEO", "Design")
- `price_pkr`, `pricing_type` (`one_time` | `monthly` | `per_unit`), `per_unit_label`
- `icon`, `cover_image`, `gallery` (jsonb array of urls)
- `features` (jsonb array of strings), `faq` (jsonb array of `{q, a}`)
- `applicable_plans` (text[]), `applicable_types` (text[] — which store types it fits)
- `meta_title`, `meta_description`, `og_image`
- `is_enabled`, `is_recommended`, `is_popular`, `sort_order`
- `related_item_ids` (uuid[])
- Standard timestamps

Access: public `SELECT` where `is_enabled = true`; full CRUD for admins.

### `catalog_orders` — single order log

Replaces `store_addons` and `upgrade_orders` at the app layer.

Fields:
- `id`, `user_id`, `store_id` (nullable — required only for store-scoped types)
- `item_id` → `catalog_items.id`, `item_type_snapshot`, `name_snapshot`
- `price_snapshot_pkr`, `pricing_type_snapshot`, `quantity`
- `config` (jsonb — free-form: notes, target plan id, days, etc.)
- `status`: `pending` | `approved` | `in_progress` | `active` | `completed` | `rejected`
- `transaction_id`, `payment_screenshot_url`, `admin_notes`
- Standard timestamps

Access: users see/insert their own; admins see all; edge functions via service role.

### Migration of existing data

- Copy `addons`, `integrations`, `website_products` rows into `catalog_items` with appropriate `type`.
- Copy `store_addons` and `upgrade_orders` rows into `catalog_orders`.
- Keep legacy tables in place (read-only) for one release so nothing breaks; new code writes only to the new tables.
- Rewrite `get_pending_review_prompts` and `can_review` to read `catalog_orders`.
- Rewrite `apply_upgrade_order` as `apply_catalog_order` operating on the new table.

---

## 2. Frontend consolidation

### Routes (before → after)

```text
/addons                 →  removed (redirect to /marketplace)
/marketplace            →  unified catalog grid, filter chips by type
/addons/:slug           →  removed
/marketplace/:slug      →  single detail page for every item type
```

### Components (before → after)

| Before | After |
| --- | --- |
| `MarketplaceGrid`, addons grid on `/marketplace`, `/addons` | `<CatalogGrid />` with type/category filter |
| `AddonDetail.tsx`, product detail bits | `<CatalogItemDetail />` (rich content + SEO + related) |
| `CheckoutDialog`, `WebsiteSelectionModal`, store `UpgradePlan` upgrade flow | `<CatalogCheckoutDialog />` — one flow: pick website (if store-scoped) → quantity/config → payment |
| `MyAddons`, `MyStoreAddons`, `MyWebsiteUpdates`, `MyOrders` (partial) | `<MyRequests />` — unified history, filterable by type & status |
| `AdminAddonManagement`, `AdminIntegrations`, `AdminWebsiteProducts`, `AdminAddonsHub` | `<AdminCatalog />` — one table + editor with all fields (rich content, SEO, gallery, related) |
| `AdminStoreAddons`, `AdminUpgradeOrders` | `<AdminCatalogOrders />` — one queue with type filter, approve/reject/complete |

### Unified card

`<CatalogCard item={...} />` — used on marketplace grid, related-items row, and store dashboard "recommended for you". Shows icon, name, short description, price badge, popular/recommended pills.

### Unified detail page

Sections in order:
1. Hero: cover, name, short description, price + CTA ("Add to my site" / "Request update")
2. Long description (markdown)
3. Features list
4. Gallery
5. FAQ (accordion)
6. Related items row
7. SEO tags rendered via `<SEO />`

---

## 3. Sidebars & entry points

- Dashboard sidebar: remove "My Add-ons" + "Website Updates", add single "My Requests".
- Store dashboard sidebar: keep "Addons" tab but point it at `<CatalogGrid storeId={...} />` filtered to store-scoped types.
- Admin sidebar: replace three catalog entries with "Catalog" and "Catalog Orders".

---

## 4. Rollout order

1. Migration: create `catalog_items` + `catalog_orders` + RLS + grants + backfill from legacy tables.
2. Build shared components: `CatalogCard`, `CatalogItemDetail`, `CatalogCheckoutDialog`, hooks (`useCatalog`, `useMyCatalogOrders`, `useAdminCatalog`).
3. Rewrite pages: `/marketplace`, `/marketplace/:slug`, `MyRequests`, `AdminCatalog`, `AdminCatalogOrders`.
4. Swap sidebar entries and route registrations; add `/addons` → `/marketplace` redirect.
5. Delete old components once nothing imports them; keep legacy DB tables read-only for one release, then drop in a follow-up.

---

## Technical notes

- `catalog_items.type` drives which fields the checkout dialog collects (e.g. `plan_upgrade` needs `target_plan_id` in `config`; `extend_duration` needs `days`; `product_limit`/`category_limit` need `quantity`; others just need optional notes).
- Store-scoped types (`plan_upgrade`, `product_limit`, `category_limit`, `extend_duration`, `content_tweak`, `page`, `section`, `popup`, `addon` when it modifies a site) require `store_id`; `integration`-only items that aren't tied to a store don't.
- `apply_catalog_order` security-definer RPC handles the same automations `apply_upgrade_order` did (bump limits, extend expiry, change plan) plus marking add-on installs `active`.
- Realtime: enable `catalog_orders` on `supabase_realtime` publication so admin queue and user history update live.
- No frontend hardcoded colors — all styling via existing tokens.

This is a large change. I'll ship it in the rollout order above so the app stays functional between steps.
