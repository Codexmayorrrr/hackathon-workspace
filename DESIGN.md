# Design System & Aesthetic Taste Guidelines

> **Before building or changing UI in this codebase, read this document.**
> These rules reflect Mayowa's design engineering taste, learned from explicit project corrections, design audits, and portfolio craftsmanship ([ayooluwabamidele.vercel.app](https://ayooluwabamidele.vercel.app/)).

---

## Surfaces

- **Container cards, workspace panels, and primary content surfaces use `#FDFDFD`.**
  Why: It provides a warm, soft paper canvas that subtly separates content sections from the pure `#FFFFFF` page background without needing drop shadows or harsh bounding borders.
  <!-- 2026-11-18: "#FDFDFD this is the grey to use" -->

- **Zero drop shadows strictly enforced (`box-shadow: none`).**
  Why: Drop shadows introduce unnecessary visual clutter, heavy elevation layers, and "muddy" edges. Surfaces achieve depth and separation strictly through tonal steps: `#FFFFFF` (canvas) → `#FDFDFD` (primary cards) → `#F5F5F5` (nested items, secondary controls, sidebars).
  <!-- 2026-11-18: "/better-typography improve spacing and remove shadows" -->

- **Persistent sidebar uses `#F5F5F5` with zero borders.**
  Why: Following the Figma specification, the sidebar acts as a quiet structural anchor. It is 240px wide (collapsible to 64px), uses `#EAEAEA` on hover, `#EBEBEB` on active, and `#DECAFF` soft lavender for brand initials and notification chips.
  <!-- 2026-11-18: "https://www.figma.com/design/gJvc6koQMvqTlHFUGr8meV/Untitled?node-id=2-2 side bar styling" -->

---

## Color

- **Text hierarchy uses Obsidian `#181818` (or `#18181b`), never pure `#000000`.**
  Why: Pure `#000000` creates harsh optical vibration against white surfaces. `#181818` offers deep contrast while remaining soft and readable.
  - Primary text / titles: `#181818` (Obsidian)
  - Secondary text / descriptions: `#7B7B7B` (hovering to `#181818` on interactive links)
  - Tertiary text / meta / labels: `#A1A1AA`
  <!-- 2026-11-19: Extracted from ayooluwabamidele.vercel.app design tokens -->

- **Global text selection uses `selection:bg-orange-100 selection:text-orange-900`.**
  Why: A warm, tactile accent that distinguishes highlighted content without obscuring letterforms.
  <!-- 2026-11-19: Extracted from ayooluwabamidele.vercel.app body classes -->

- **Accent badges and branding use soft lavender `#DECAFF`.**
  Why: Serves as the primary brand differentiator across the logo badge, team avatars, and active saved queue chips, harmonizing cleanly with `#FDFDFD` and charcoal.
  <!-- 2026-11-18: Figma Frame 12 badge styling -->

---

## Typography

- **Font family is Inter with optical negative letter-spacing.**
  Why: Modern digital interfaces feel loose when letter-spacing defaults to 0. Negative tracking tightens word shapes, improves readability, and gives typography a deliberate, engineered feel.
  - Body text (`13px–16px`): `tracking-[-0.02em]` (or `tracking-[-0.42px]`)
  - Numbers, timestamps, meta tags: `tabular-nums tracking-[-0.03em]`
  - Headings: `tracking-tight` with `[text-wrap:balance]`
  - Paragraphs: `leading-relaxed` with `[text-wrap:pretty]`
  <!-- 2026-11-19: Extracted from ayooluwabamidele.vercel.app typography rules -->

---

## Spacing & Layout

- **Generous internal breathing room (`p-6` to `p-8` on cards).**
  Why: Clutter happens when elements fight for edge margins. Generous padding gives each module its own distinct space and eliminates dense "dashboard fatigue".
  <!-- 2026-11-18: "Work on the layout of the product, still feels cluttered, the typography and spacing" -->

- **Max content containers capped at sensible bounds.**
  Why: Prevents excessively long line lengths on ultrawide displays. Typical containers use `max-w-7xl` for multi-column grids and `max-w-[736px]` for single-column editorial reading.
  <!-- 2026-11-19: Extracted from ayooluwabamidele.vercel.app container specs -->

---

## Interaction & Buttons

- **Tactile depression on press: `active:scale-[0.96]` with `160ms var(--ease-out)`.**
  Why: Provides instantaneous, physical feedback on click or touch. Standardized across buttons, pills, cards, and modal triggers using `cubic-bezier(0.23, 1, 0.32, 1)`.
  <!-- 2026-11-18: "Work on buttons and CTAs" -->

- **Strict transition properties: Never use `transition: all`.**
  Why: `transition: all` triggers unnecessary layout reflows and jank. Explicitly declare only `transform, background-color, color, opacity`.
  <!-- 2026-11-18: Emil Kowalski design engineering audit -->

- **Secondary buttons inside `#FDFDFD` cards must use `#F5F5F5`, never `#FFFFFF`.**
  Why: Placing pure white buttons inside off-white `#FDFDFD` cards creates jarring "white hole" cutouts and disrupts the natural contrast hierarchy.
  - **Primary CTA (`.btn-tactile-primary`):** Charcoal `#18181b`, `#ffffff` text, `font-semibold`.
  - **Secondary CTA (`.btn-tactile-secondary`):** `#F5F5F5` neutral background (hover `#EBEBEB`, active `#E0E0E0`, `#18181b` text).
  - **Ghost / Tertiary (`.btn-tactile-ghost`):** Pure transparent background (hover `#F5F5F5`, active `#EBEBEB`).
  - **Accent CTA (`.btn-tactile-accent`):** Soft lavender `#DECAFF`.
  <!-- 2026-11-18: "Work on buttons and CTAs" -->

- **Optical button alignment & icon matching.**
  Why: Icon strokes must match font weights (`stroke-[2]` for semibold, `stroke-[1.75]` for regular). Navigation CTAs feature forward arrow micro-nudges (`group-hover/btn:translate-x-0.5`).
  <!-- 2026-11-18: Emil Kowalski button standardization -->

---

## Motion

- **Custom motion easing curves.**
  ```css
  --ease-out: cubic-bezier(0.23, 1, 0.32, 1);
  --ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);
  --ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);
  ```
  Why: Standard browser `ease` or `linear` transitions feel robotic. Natural deceleration curves mimic physical momentum.
  <!-- 2026-11-18: Animation system overhaul -->

---

## Copy & UX Philosophy

- **"Friction Killer" & "Usability beats ideology".**
  Why: Builders and users care about speed, clarity, guaranteed deadlines, and clear action states—not decorative UI flair or superfluous animations. Every screen must prioritize reducing cognitive load and practical utility.
  <!-- 2026-11-19: Extracted from ayooluwabamidele.vercel.app design approach -->
