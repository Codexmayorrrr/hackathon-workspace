# Agent Guidelines

Before building or changing UI, read `DESIGN.md`.

## Core Philosophy
- Warm paper canvas (`#FAFAFB`), crisp elevated cards (`#FFFFFF`) with translucent hairline `.surface-card` depth (`var(--shadow-border)`).
- Recessed secondary wells and controls use `#F4F4F6`.
- Primary ink uses Obsidian `#18181B`; muted metadata uses `#63636B` (`>= 5.4:1` contrast). Never use `#A3A3A3` for readable copy.
- Visible `:focus-visible` indicator required on all interactive controls; `MotionConfig reducedMotion="user"` required.
- Native elements first, `active:scale-[0.96]` press feedback, and explicit CSS transition property lists (no `transition: all`).
