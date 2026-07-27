# Marketplace Page — Design Audit & Change Plan

## Audit findings

**1. Competing visual languages**
The page runs four distinct art directions in one scroll:
- Hero banner: emerald + wave SVG + glow (on-brand)
- Templates tile: full-black photo card
- Catalog tile: solid primary with radial glow
- Biztyle card in sister-services: dark violet/fuchsia neo-brutalist grid
Each is fine in isolation; stacked, they read like four different sites.

**2. Hero right column duplicates the page**
The 3 tiles (Plans / Templates / Catalog) jump to the exact three sections that follow immediately below. Redundant scroll + wasted above-the-fold real estate.

**3. Section rhythm is monotone**
Every section uses the same `SectionHeader` (eyebrow + h2 + description + outline CTA) followed by a flat card grid. No hierarchy, no editorial break, no scannable difference between Plans, Templates, Catalog, Sister services.

**4. Card treatments are inconsistent**
- Plan cards: plain bordered `Card`, tiny features list
- Template cards: image + badge, minimal metadata
- Catalog cards: separate component styling
- Sister-service cards: heavy gradient panels with icons
No shared card grammar.

**5. Spacing is heavy**
`space-y-20` between every section on a page with 5 sections = lots of empty scroll, especially between Plans → Templates → Catalog which are conceptually related.

**6. CTA styling was just unified** (hero-style buttons) — good baseline to build on.

**7. Biztyle violet card breaks the design system**
Hardcoded hex (`#0b0616`), `rgba(139,92,246,...)`, `text-primary/70/70` (typo), `text-white` — violates the semantic token rule and the emerald palette.

---

## Change plan (phased, low-risk first)

### Phase 1 — System hygiene (no layout change)
1. Fix the Biztyle card: replace hardcoded violet/hex + `text-white` + `text-primary/70/70` typo with semantic tokens. Keep it visually distinct via a `sister-biztyle` token variant defined in `index.css`, not inline hex.
2. Normalize section spacing: `space-y-20` → `space-y-16` (desktop) / `space-y-12` (mobile).
3. Unify eyebrow + heading typography across `SectionHeader` and the hero's inline headings.

### Phase 2 — Kill the redundancy
4. Remove the 3-tile right column from the hero (Plans/Templates/Catalog shortcuts). Reshape hero into a single wide editorial banner with the emerald art + headline + two CTAs.
5. Add a compact "jump-to" strip under the hero (small pill chips: Plans · Templates · Catalog · Sister services) — same navigation intent, one row instead of a duplicate column.

### Phase 3 — Card grammar
6. Define one shared card shell (radius, border, hover, shadow) and apply it to Plan, Template, Catalog, and Sister-service cards. Only the *content* differs; the frame is identical.
7. Plan cards: promote price, add a single-line "best for" tagline, drop the 4-cell limits grid into a compact inline row.
8. Template cards: keep image, drop the redundant category text under the name, move the price badge to a bottom-left chip so the title has room.

### Phase 4 — Editorial rhythm
9. Break the "grid-after-header" monotony with one asymmetric moment — Templates as a 1-featured + 3-small mosaic instead of a flat 4-col grid.
10. Sister-services: shrink to a 3-up strip with a shared card shell (see step 6), so it reads as "also from us" not "third product tier".

### Phase 5 — Motion & polish
11. Consistent hover: 200ms border + shadow lift on every card. No card should hover differently from its neighbor.
12. Lazy-load section imagery below the fold (Templates hero image is already `fetchPriority=high`; the rest should be `loading=lazy`).

---

## Technical notes
- Files touched: `src/pages/Marketplace.tsx`, `src/index.css` (biztyle token), possibly a new `src/components/marketplace/JumpStrip.tsx`.
- No DB, no route, no data-fetching changes.
- Each phase is independently shippable and reviewable.

---

Reply with which phases to execute (e.g. "do 1 and 2" or "all of it") and I'll implement.
