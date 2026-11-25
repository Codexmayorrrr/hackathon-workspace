# Agent Guidelines

Before building or changing UI, read `DESIGN.md`.

## Core Philosophy
- Borderless planar hierarchy: soft `#F5F5F7` canvas, elevated `#FFFFFF` cards via `.surface-card` (`var(--shadow-border)`), and zero UI borders, hairline dividers, or `1px` strokes.
- Recessed secondary wells, sidebar, and controls use `#EFEFF2`.
- Typography uses one font (`Instrument Sans`) in natural sentence/title case (zero ALL CAPS labels).
- Primary ink uses Obsidian `#18181B`; muted metadata uses `#63636B` (`>= 5.4:1` contrast). Never use `#A3A3A3` for readable copy.
- Visible `:focus-visible` indicator required on all interactive controls; `MotionConfig reducedMotion="user"` required.
- Native elements first, `active:scale-[0.96]` press feedback, and explicit CSS transition property lists (no `transition: all`).
