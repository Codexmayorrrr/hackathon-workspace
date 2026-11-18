# Hackathon Workspace & Developer Toolkit

> High-velocity hackathon discovery, application builder, project workspace, and presentation coach designed for builders.

Built strictly with **Emil Kowalski's Design Engineering philosophy** — tactile feedback (`scale(0.97)` on `:active`), custom physics curves (`cubic-bezier(0.23, 1, 0.32, 1)`), zero borders, zero drop shadows, pure white canvas (`#FFFFFF`), and refined light-grey cards (`#FDFDFD`).

---

## ⚡ Core Features

### 1. Opportunities Discovery & Track Matcher
- **Live Filtering**: Filter by format (Online, In-Person, Hybrid), tracks (Web3, AI, Fintech, Mobile), and prize tiers.
- **Urgency Engine**: Color-coded relative deadline countdowns (critical, warning, normal) to prioritize submissions.

### 2. Dedicated Hackathon Workspaces
- **Multi-Clock Deadline Ticker**: Track application deadlines, build window countdowns, submission cutoffs, and pitch slots.
- **Stage Pipeline**: Interactive Apple-style segmented control tracking progress from `saved` → `drafting` → `building` → `review` → `applied` → `results`.

### 3. Strict Word-Limit Application Helper
- **Deterministic Word Counter**: Guarantees zero portal rejections by calibrating drafts to exact maximum word counts.
- **Judge & Sponsor Intel Lens**: Direct feedback tips aligned with judging criteria (e.g. latency metrics, market size).
- **Framework Archetypes**: 1-click generators for Full Pitch (145w), Concise Problem/Solution (90w), and Elevator Pitch (48w).

### 4. Reusable Application Vault
- **Global Asset Store**: Save bio, TAM calculations, problem statements, and personal stories once.
- **Cross-Workspace Injection**: Insert saved snippets directly into any hackathon workspace requirement.

### 5. Multi-Calendar Sync
- **WebCal & iCal Feed Generation**: Sync deadlines, milestones, and cutoffs directly to Google Calendar, Apple Calendar, and Outlook with private feed tokens.

### 6. Voice-Driven Presentation Coach & Slide Teleprompter
- **Spotify-Style Lyrics Teleprompter**: Automatic voice recognition tracking spoken words to keep slides in sync.
- **Stage Safety Nets**: Instant pause for judge Q&A and manual hotkey overrides without losing pace calculation.
- **Pacing Variance Audit**: Real-time pace breakdown (Too Fast, On Track, Too Slow) against the target pitch slot.

### 7. In-Person Logistics Planner & Teammate Finder
- **Offline Hackathon Pack**: Venue addresses, badge pickup checkpoints, dietary requirements, hardware bring-lists, and offline survival tips.
- **Role-Based Teammate Board**: Match with Frontend, Backend, AI/ML, and Product builders with verified GitHub/portfolio links.

### 8. AI Pitch Deck & 1-Minute Demo Video Studio
- **Curated Slide Deck Generator**: Generates 5 structured slides with talk tracks, metric callouts, and presentation timer budgets.
- **4-Scene Storyboard Simulator**: Script and storyboard for a 90-second demo video with selectable voiceover personas.

---

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Bundler**: [Vite 6](https://vite.dev/)
- **Styling**: [Tailwind CSS 3](https://tailwindcss.com/)
- **Motion & Transitions**: [Framer Motion](https://motion.dev/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Notifications**: [Sonner](https://sonner.emilkowal.ski/)
- **State Management**: [Zustand](https://zustand.docs.pmnd.rs/) with LocalStorage persistence

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm, pnpm, or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/Codexmayorrrr/hackathon-workspace.git
cd hackathon-workspace

# Install dependencies
npm install

# Start local development server
npm run dev
```

### Scripts

- `npm run dev`: Start Vite development server at `http://localhost:3000`
- `npm run build`: Compile TypeScript and build production bundle
- `npm run typecheck`: Run TypeScript verification with `tsc --noEmit`
- `npm run preview`: Preview the production build locally

---

## 🎨 Design Engineering Standard

- **Zero Borders**: Clean separation via surface contrast (`#FFFFFF` background vs `#FDFDFD` cards).
- **Zero Shadows**: Flat modern aesthetic without drop shadows.
- **Physics-Based Feedback**: Exact cubic-bezier transitions (`var(--ease-out)`), subtle `:active` press scaling (`scale(0.97)`), and touch-gated hover styles.

---

## 📄 License

MIT
