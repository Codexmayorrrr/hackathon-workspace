# Agent Guidelines

Before building or changing UI, read `DESIGN.md`.

## Core Philosophy
- Flat borderless & shadowless planar hierarchy: `#F3F3F6` canvas, `#FFFFFF` cards (`.surface-card`), `#EFEFF2` nested wells/controls, and `#EAEAEF` sidebar — zero UI borders, hairline dividers, or box shadows.
- Typography uses one font (`Instrument Sans`) in natural sentence/title case (zero ALL CAPS labels).
- Primary ink uses Obsidian `#18181B`; muted metadata uses `#63636B` (`>= 5.4:1` contrast). Never use `#A3A3A3` for readable copy.
- Visible `:focus-visible` indicator required on all interactive controls; `MotionConfig reducedMotion="user"` required.
- Native elements first, `active:scale-[0.96]` press feedback, and explicit CSS transition property lists (no `transition: all`).
