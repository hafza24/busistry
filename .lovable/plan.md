## Scope

The category/subcategory filter on the public Templates page and the admin Template editor (with Category + Subcategory selects) are **already in place** from the previous turn. This plan focuses on the big ask: revamping onboarding into a premium, auto-configured experience driven by the chosen Plan + Template.

## What changes

### 1. Template-driven page/feature presets
New file `src/lib/templatePresets.ts` mapping the existing template **category** values (Ecommerce, Invite, Organization, News/Blog, Social, Portfolio, Business, Education, Management System, Forms, Wishes) to:
- `pages`: locked included pages (Shop, Product, Cart… / Event Details, RSVP, Countdown… / Articles, Categories…)
- `modules`: locked modules (Cart/Checkout, Wishlist, RSVP, Newsletter, etc.)
- `conditionalFields`: which extra questions to ask (shipping/payment/tax for ecommerce; menu/reservation for restaurant; event date/venue for invite; authors/newsletter for blog; departments/donation for organization)

A small `useTemplate(templateId)` hook (parallel to `usePlan`) fetches the chosen template so we can read its `category`/`subcategory`.

### 2. New TemplateSummaryCard (locked)
`src/components/onboarding/TemplateSummaryCard.tsx` — premium glassmorphism card showing the selected template's preview image, category/subcategory, and:
- Included Pages (locked chips with lock icon, "Configured by template")
- Included Modules (locked chips)
- "Change template" link back to /templates

### 3. Upgraded PlanSummaryCard
Extend the existing card to also surface the new plan fields already on the table: `max_pages`, `domain_type`, `platform_type`, `email_accounts`, `team_users`. Each rendered as a locked metric tile with a lock icon and "Included in plan".

### 4. Rebuilt Step2 — Auto-Configured Preview
Replace the current per-type `Step2ProjectDetails` with a section that:
- Pulls pages/modules from the template preset and renders them as **locked** cards.
- Pulls the conditional-fields list from the preset, and only shows those questions (e.g. ecommerce → shipping regions + payment gateway + tax; restaurant subcategory → dine-in/takeaway + reservation; invite → event date + venue + RSVP limit; blog → number of authors + newsletter).
- All values previously asked but already covered by plan/template are skipped (no more "number of pages" or "products included" duplicates).

### 5. Skip duplicate fields in later steps
- `Step4Store` (the store step): hide `product_count_estimate` field entirely when plan provides `max_products` — only show payment gateway + special features.
- `Step3Team`: cap team size at `plan.team_users`; if plan = 1, hide team-members entry and show a locked "1 admin (your plan)" tile with an upgrade hint.
- `Step1Business` (business basics): keep — these are genuine business inputs.
- `Step2Branding`: keep — branding is user input.

### 6. New "Auto-Configured Features" summary step
Insert a compact, animated **review tile** between Plan/Template summary and the user-input steps showing the merged locked configuration (Pages + Modules + Plan limits) at a glance, so users *see* what they're getting before answering anything.

### 7. UI polish (Apple/Stripe feel)
- Locked tiles use `bg-gradient-to-br from-primary/5`, subtle border, lock icon top-right, slight inner shadow — not greyed-out.
- Framer-motion fade/slide for step transitions (already present, retained).
- Floating-label inputs in the business-info section.
- Progress indicator unchanged but step labels updated.

## Files

**Create**
- `src/lib/templatePresets.ts`
- `src/hooks/useTemplate.ts`
- `src/components/onboarding/TemplateSummaryCard.tsx`
- `src/components/onboarding/LockedTile.tsx` (shared visual primitive)

**Edit**
- `src/components/onboarding/PlanSummaryCard.tsx` — add max_pages / domain / platform / email / team tiles
- `src/components/onboarding/Step2ProjectDetails.tsx` — auto-locked pages/modules + conditional-only fields
- `src/components/onboarding/Step4Store.tsx` — drop fields the plan already covers
- `src/components/onboarding/Step3Team.tsx` — cap by plan, lock when team_users=1
- `src/pages/Onboarding.tsx` — render TemplateSummaryCard next to PlanSummaryCard, adjust step validators

No database migrations and no changes to existing business logic / orders / marketplace.

## Out of scope (will not touch)
- Pricing page, Templates page filtering (already shipped).
- AI-generated suggestions / live website iframe preview / estimated launch time (mentioned by user but vague; would require separate scoping — happy to follow up).
