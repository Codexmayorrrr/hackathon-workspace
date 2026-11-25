# Design System & Aesthetic Taste Guidelines

> **Before building or changing UI in this codebase, read this document.**
> These rules reflect Mayowa's design engineering taste ([ayooluwabamidele.vercel.app](https://ayooluwabamidele.vercel.app/)) refined through accessibility, contrast, and interaction-craft audits.

---

## Surfaces & Subtle Depth

- **Flat borderless, shadowless canvas (`#F3F3F6`) paired with crisp white cards (`#FFFFFF`).**
  Why: Soft cool-neutral ground and pure white card planes establish clear visual hierarchy purely through surface luminance, with zero borders, dividers, outlines, or box shadows.
- **Zero drop shadows or perimeter strokes across UI components.**
  Why: Pure flat planes reduce visual clutter and foreground data scarcity cleanly.
- **Nested secondary wells and controls use `#EFEFF2` (hover `#E5E5EA`, active `#DCDCE2`); sidebar uses `#EAEAEF`.**

---

## Color & Accessible Contrast

- **Text ink hierarchy (`>= 4.5:1` WCAG 2 AA & APCA `Lc 75` body / `Lc 60` UI floors):**
  - Primary text / headings: `#18181B` (Obsidian — never pure `#000000`)
  - Secondary copy: `#52525B` (`~7.7:1` on white)
  - Muted metadata / labels: `#63636B` (`~5.95:1` on white, `~5.42:1` on `#F4F4F6`) — never use `#A3A3A3` for readable copy or nav icons.
- **Semantic Category & Brand Accents:**
  - Signature brand accent / Hackathon: Lavender (`#DECAFF` buttons with `#18181B` ink, `#EFE6FF` tags with `#3B0764` ink)
  - Grant: Emerald mist (`#ECFDF5` tags with `#065F46` ink; solid `#047857` for white text)
  - Tech Event: Warm amber (`#FEF3C7` tags with `#92400E` ink; solid `#92400E` for white text)
  - Venture Hub / Accelerator: Indigo wash (`#EEF2FF` tags with `#3730A3` ink)
- **Global text selection uses `selection:bg-orange-100 selection:text-orange-950`.**

---

## Typography

- **Single unified font family:** `Instrument Sans` (`400`, `500`, `600`, `700`) loaded via `index.html` and mapped across both `font-sans` and numeric `font-mono` (`tabular-nums`) tokens.
- **Optical negative letter-spacing:** headings `-0.025em` with `text-wrap: balance`, body `leading-relaxed` (`1.55`) with `text-wrap: pretty`, numeric metrics `tabular-nums`.
- **Minimum floor:** navigation/sidebar labels `>= 13px`; metadata/chips `>= 11px`; heading sizes descend monotonically with semantic rank (`h1` > `h2` > `h3`).

---

## Interaction, Accessibility & Motion

- **Visible keyboard focus rings (`:focus-visible`):** `2px solid #18181B` with `2px` offset (preserving `Highlight` in `forced-colors: active`). Never strip focus outlines without an equally legible replacement.
- **Native elements & accessible names:** `<button>` for actions, `<a href>` for links, native `<dialog>` / `role="dialog"` with `inert` background and `Escape` close for overlays, descriptive `aria-label` on all icon-only controls, explicit `<label htmlFor>` on all form controls, and ≥ `24×24px` (ideally `36–40px`) hit targets.
- **Destructive action safety:** Delete controls preserve undo/confirmation safety and carry distinct visual treatment.
- **Tactile press & motion discipline:** `active:scale-[0.96]` at `160ms var(--ease-out)`. Never use `transition: all`. Wrap Framer Motion in `<MotionConfig reducedMotion="user">` and provide `@media (prefers-reduced-motion: reduce)` fallbacks.
