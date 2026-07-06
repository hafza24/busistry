## Goal

Replace the current "Plan first" flow with a template-led flow where users pick a Site (template) first, then a plan, then add-ons and theme-relevant integrations, then fill onboarding, then pay a single combined one-time total.

## New Flow

```text
1. Templates page        → pick a Site (free or paid one-time)
2. Plan step             → pick subscription plan (Free plan still available)
3. Addons step           → optional one-time add-ons (existing marketplace addons)
4. Integrations step     → one-time integrations filtered by template category
5. Onboarding steps      → business, branding, team, store, contact
6. Payment step          → shows combined total, one-time price = template + plan + addons + integrations
```

Everything (template price, plan price, addons, integrations) is treated as a one-time charge combined at checkout. Free plan + free template = no charge, submit directly.

## Changes

### Data
- `templates` already has `price_pkr` — use it as the one-time template cost (0 = free).
- `plans` already has `price_pkr` — treated as one-time here (no recurring billing change).
- `integrations` table already exists — add a `price_pkr` column (default 0) and use `category` to filter by template category.
- `onboarding_submissions` — add `selected_integration_ids uuid[]` and `integrations_total_pkr int` to persist the picks. Addon selection persists in existing `onboarding_addons`.
- No changes to `subscriptions` semantics for now (Free plan continues to be free).

### Routing & entry points
- `/templates` becomes the primary entry point. Selecting a template routes to `/onboarding?template=<id>` (no plan yet).
- `/pricing` remains reachable but no longer the required start. The "Start" CTA on a plan card routes to `/templates?plan=<id>` (so users can still start from a plan; template step just becomes step 1).
- Landing page hero CTA points to `/templates`.

### Onboarding restructure (`src/pages/Onboarding.tsx`)
Rebuild `STEP_LABELS` to:
```text
["Site", "Plan", "Add-ons", "Integrations", "Business", "Branding", "Team", "Store", "Contact", "Payment"]
```
- Step 1 "Site": new `StepTemplate` component — grid of templates with price badge; sets `template_id`. Skips step if `template` present in URL and user confirms.
- Step 2 "Plan": new `StepPlan` component — plan cards (reuses `PricingSlider` styling); sets `plan_id`.
- Step 3 "Add-ons": existing `StepAddons` unchanged.
- Step 4 "Integrations": new `StepIntegrations` — lists integrations where `category` matches the selected template's category (fallback: show all `is_active`); multi-select with prices; persists ids to `selected_integration_ids`.
- Steps 5–9: existing Business/Branding/Team/Store/Contact (drop the current Step 2 "Project Details" which was template-picking — now redundant).
- Step 10 "Payment": existing `Step9Payment`, updated to show line-item totals:
  ```text
  Template  PKR x
  Plan      PKR y
  Add-ons   PKR z
  Integrations PKR w
  ─────────
  Total     PKR (x+y+z+w)   (one-time)
  ```
- Skip payment UI entirely when total = 0; submit directly with `payment_method = "none"`.

### Summary cards
- `PlanSummaryCard` and `TemplateSummaryCard` stay at the top of onboarding. `TemplateSummaryCard` shows template price when > 0.

### Admin
- `AdminIntegrations` gets a `price_pkr` field on the integration form.
- No new admin screens.

### Files

New:
- `src/components/onboarding/StepTemplate.tsx`
- `src/components/onboarding/StepPlan.tsx`
- `src/components/onboarding/StepIntegrations.tsx`
- `src/hooks/useIntegrations.ts` (list active integrations, optional category filter)

Edited:
- `src/pages/Onboarding.tsx` — new step order, wiring, validation.
- `src/components/onboarding/Step6Payment.tsx` (currently Step9) — combined totals, zero-total path.
- `src/hooks/useOnboarding.ts` — persist `selected_integration_ids`, `integrations_total_pkr`.
- `src/pages/Templates.tsx` — CTA → `/onboarding?template=<id>`.
- `src/pages/Pricing.tsx` — CTA → `/templates?plan=<id>`.
- `src/pages/Index.tsx` — hero CTA → `/templates`.
- `src/components/admin/AdminIntegrations.tsx` — add price field.

Migration:
- `ALTER TABLE integrations ADD COLUMN price_pkr integer NOT NULL DEFAULT 0;`
- `ALTER TABLE onboarding_submissions ADD COLUMN selected_integration_ids uuid[] DEFAULT '{}', ADD COLUMN integrations_total_pkr integer DEFAULT 0;`

### Out of scope
- Recurring billing / actual subscription cycles.
- Refactoring the existing `UpgradePlan` marketplace flow.
- Reworking the manual payment approval pipeline (unchanged, just receives a bigger combined amount).
