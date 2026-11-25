import { DeckTemplateId, Opportunity, OpportunityType, SlideDeck, SlideItem } from '../types';

export interface DeckTemplateMeta {
  id: DeckTemplateId;
  name: string;
  description: string;
  durationMinutes: number;
  audienceLabel: string;
  targetAudience: SlideDeck['targetAudience'];
  slideCount: number;
}

export const DECK_TEMPLATES: DeckTemplateMeta[] = [
  {
    id: 'hackathon_demo',
    name: 'Hackathon Demo Pitch',
    description: 'Problem hook, system architecture, live demo flow, and track fit.',
    durationMinutes: 3,
    audienceLabel: 'Judges',
    targetAudience: 'judges',
    slideCount: 6,
  },
  {
    id: 'grant_proposal',
    name: 'Grant Impact & Milestones',
    description: 'Public-good impact, technical milestones, budget clarity, and team depth.',
    durationMinutes: 5,
    audienceLabel: 'Grant panel',
    targetAudience: 'grant_panel',
    slideCount: 5,
  },
  {
    id: 'accelerator_investor',
    name: 'Accelerator & Seed Pitch',
    description: 'Founder narrative, market TAM/SAM/SOM, traction metrics, and GTM plan.',
    durationMinutes: 3,
    audienceLabel: 'Investors',
    targetAudience: 'investors',
    slideCount: 6,
  },
  {
    id: 'event_spotlight',
    name: 'Demo Day Lightning Pitch',
    description: 'Tight 60-second showcase built for fast stage transitions.',
    durationMinutes: 1,
    audienceLabel: 'Audience & jury',
    targetAudience: 'judges',
    slideCount: 4,
  },
];

export function getDefaultTemplateIdForOpportunity(type?: OpportunityType): DeckTemplateId {
  switch (type) {
    case 'grant':
      return 'grant_proposal';
    case 'venture_hub':
      return 'accelerator_investor';
    case 'event':
      return 'event_spotlight';
    case 'hackathon':
    default:
      return 'hackathon_demo';
  }
}

interface BuildDeckOptions {
  workspaceId: string;
  opportunityTitle: string;
  opportunity?: Opportunity;
  repoUrl?: string;
}

function getRepoSlug(repoUrl: string): string {
  return repoUrl.replace(/^https?:\/\//, '').replace(/\/$/, '') || 'github.com/team/project';
}

function createTemplateSlides(templateId: DeckTemplateId, opts: BuildDeckOptions): SlideItem[] {
  const opp = opts.opportunity;
  const repoDisplay = getRepoSlug(opts.repoUrl || 'https://github.com/developer/paypulse-core');
  const sponsorBounty = opp?.sponsors[0]?.bountyTitle || 'Core Innovation Track';
  const primaryProblems = opp?.themeContext?.problemStatements?.length
    ? opp.themeContext.problemStatements.slice(0, 3)
    : [
        'Fragmented manual workflows delay execution by 48–72 hours across stakeholders.',
        'Legacy rails charge 8% to 14% overhead with zero programmable auditability.',
        'Critical users lack offline-resilient, low-friction mobile onboarding.',
      ];

  switch (templateId) {
    case 'grant_proposal':
      return [
        {
          id: 'grant-s1',
          slideNumber: 1,
          title: `${opts.opportunityTitle} — Grant Proposal`,
          subtitle: opp?.summary || 'Open-source infrastructure delivering measurable public-good ecosystem impact.',
          layoutType: 'title',
          bullets: [
            `Program Alignment: ${opp?.prizePool || 'Dedicated Milestone Funding'}`,
            `Open Source Repo: ${repoDisplay}`,
            'License: MIT / Apache-2.0 permissive public goods release',
          ],
          scriptLines: [
            `Hello grant committee. Today we are presenting our technical proposal for ${opts.opportunityTitle}.`,
            'Everything we propose ships as MIT-licensed open-source infrastructure built directly for ecosystem developers.',
          ],
          allocatedSeconds: 45,
        },
        {
          id: 'grant-s2',
          slideNumber: 2,
          title: 'Ecosystem Bottleneck & Need',
          subtitle: 'Verifiable gap blocking developer velocity and open adoption',
          layoutType: 'problem_solution',
          bullets: primaryProblems,
          metricCallout: {
            value: '84%',
            label: 'Ecosystem builders citing fragmented tooling as their primary launch blocker',
          },
          scriptLines: [
            'Across contributor interviews, the same bottleneck surfaced repeatedly.',
            'Without reliable open tooling here, smaller teams rebuild brittle plumbing from scratch on every launch.',
          ],
          allocatedSeconds: 60,
        },
        {
          id: 'grant-s3',
          slideNumber: 3,
          title: 'Open Technical Specification',
          subtitle: 'Modular, verifiable architecture designed for independent maintainers',
          layoutType: 'architecture',
          bullets: [
            'Core Protocol: Deterministic state engine with full test coverage.',
            'Developer SDK: Zero-config TypeScript & CLI primitives.',
            'Auditability: Reproducible builds and public telemetry exports.',
            'Composability: Standard webhooks and documented open APIs.',
          ],
          scriptLines: [
            'Our architecture prioritizes auditability and low maintenance burden from day one.',
            'Every core module ships with reproducible CI verification so any ecosystem team can self-host or fork safely.',
          ],
          allocatedSeconds: 70,
        },
        {
          id: 'grant-s4',
          slideNumber: 4,
          title: 'Impact Targets & Funding Allocation',
          subtitle: 'Transparent milestone-gated budget tied to public deliverables',
          layoutType: 'market_tam',
          bullets: [
            '45% Core Engineering: Protocol security, automated benchmarks, and SDK releases.',
            '25% Security & Audits: Independent threat modeling and fuzzing harness.',
            '20% Documentation & Starter Kits: Reference templates for 20+ partner teams.',
            '10% Community Workshops: Open office hours and maintainer onboarding.',
          ],
          metricCallout: {
            value: opp?.prizePool?.split('+')[0]?.trim() || '100% Open',
            label: 'Milestone-verified funding tied to public GitHub releases & docs',
          },
          scriptLines: [
            'Every tranche of funding maps directly to verifiable public deliverables.',
            'We allocate seventy percent directly to core engineering and security hardening, with clear documentation benchmarks.',
          ],
          allocatedSeconds: 65,
        },
        {
          id: 'grant-s5',
          slideNumber: 5,
          title: '12-Week Delivery Milestones & Team',
          subtitle: 'Bi-weekly public demos and transparent progress reporting',
          layoutType: 'team_roadmap',
          bullets: [
            'Weeks 1–4: Alpha release, CLI specification, and public test suite.',
            'Weeks 5–8: External security review, partner pilot integrations, and docs.',
            'Weeks 9–12: Mainnet/production v1.0 release and handoff workshop.',
          ],
          scriptLines: [
            'Over twelve weeks, we publish fortnightly release checkpoints in our public repository.',
            'Thank you to the committee—we welcome technical questions on our milestone breakdown.',
          ],
          allocatedSeconds: 60,
        },
      ];

    case 'accelerator_investor':
      return [
        {
          id: 'acc-s1',
          slideNumber: 1,
          title: 'PayPulse Core',
          subtitle: `Built for ${opts.opportunityTitle} — Sub-Second Commercial Settlement Rails`,
          layoutType: 'title',
          bullets: [
            `Stage: Pilot Live · ${opp?.format || 'Hybrid'} Cohort`,
            `Core Metric: 5.8s settlement finality at 0.35% routing cost`,
            `Source & Telemetry: ${repoDisplay}`,
          ],
          scriptLines: [
            'Good afternoon partners. I am building PayPulse Core.',
            'We eliminate the three-day bank wire delay costing emerging-market B2B suppliers billions in trapped working capital.',
          ],
          allocatedSeconds: 25,
        },
        {
          id: 'acc-s2',
          slideNumber: 2,
          title: 'Why Legacy Rails Break Merchants',
          subtitle: '72-hour clearing lags & 14% FX spreads choke inventory growth',
          layoutType: 'problem_solution',
          bullets: primaryProblems,
          metricCallout: {
            value: '72 Hours',
            label: 'Capital locked per cross-border supplier invoice on legacy bank wires',
          },
          scriptLines: [
            'Importers routinely wait three days just for supplier transfers to confirm.',
            'By the time funds clear, currency spreads erase their entire margin.',
          ],
          allocatedSeconds: 30,
        },
        {
          id: 'acc-s3',
          slideNumber: 3,
          title: 'Product Moat & Infrastructure',
          subtitle: 'Embedded virtual bank accounts paired with programmable stablecoin finality',
          layoutType: 'architecture',
          bullets: [
            'Local Fiat Ingest: Virtual bank accounts settle customer transfers instantly.',
            'Risk Engine: Automated velocity limits and KYB compliance screening.',
            'Deterministic Routing: Sub-10ms Rust engine locks FX quotes cleanly.',
            'Merchant UX: Zero wallets or gas fees exposed to finance teams.',
          ],
          scriptLines: [
            'Merchants never see wallets or gas fees.',
            'Customers pay via standard local bank transfers while suppliers receive verified dollar liquidity in six seconds.',
          ],
          allocatedSeconds: 35,
        },
        {
          id: 'acc-s4',
          slideNumber: 4,
          title: 'Market Size & Unit Economics',
          subtitle: '$115B Regional B2B Trade Corridor with 70% Cheaper Take-Rate',
          layoutType: 'market_tam',
          bullets: [
            'TAM: $115B annual cross-border SME trade across West Africa.',
            'SAM: $18B digitized commercial supplier settlements.',
            'SOM (12 Months): $240M annualized throughput via 14,000 active merchants.',
            'Take Rate: 35 bps blended routing fee · payback under 6 weeks.',
          ],
          metricCallout: {
            value: '$115B',
            label: 'Annual B2B trade volume in our beachhead payment corridors',
          },
          scriptLines: [
            'Our beachhead corridor moves over one hundred billion dollars a year.',
            'At thirty-five basis points, we beat traditional banking fees by seventy percent while keeping strong unit profitability.',
          ],
          allocatedSeconds: 35,
        },
        {
          id: 'acc-s5',
          slideNumber: 5,
          title: 'Early Traction & Go-To-Market',
          subtitle: 'Distribution through electronics & wholesale merchant associations',
          layoutType: 'demo_flow',
          bullets: [
            'Pilot Readiness: 15 wholesale importers committed in Balogun Market.',
            'Channel Distribution: Direct association onboarding drops CAC below $18.',
            'Cohort Goal: Scale to $2.5M monthly settled volume in 90 days.',
          ],
          scriptLines: [
            'Instead of paying high consumer ads, we onboard tightly clustered merchant associations.',
            'Fifteen electronics wholesalers are already signed up for next month’s launch.',
          ],
          allocatedSeconds: 30,
        },
        {
          id: 'acc-s6',
          slideNumber: 6,
          title: 'Founding Team & Cohort Ask',
          subtitle: 'Builders who scaled $4M+/month production payment rails',
          layoutType: 'team_roadmap',
          bullets: [
            'Founders: 4+ years shipping production settlement APIs & Rust cores.',
            'Cohort Focus: Cross-border liquidity partners + regulatory sandbox.',
            'Next Milestone: General availability across Nigeria, Ghana, and Côte d’Ivoire.',
          ],
          scriptLines: [
            'Our engineering team has already scaled high-volume payments across West Africa.',
            'Through this cohort, we are expanding liquidity corridors across three countries. Thank you.',
          ],
          allocatedSeconds: 25,
        },
      ];

    case 'event_spotlight':
      return [
        {
          id: 'evt-s1',
          slideNumber: 1,
          title: 'PayPulse Core — Demo Day Spotlight',
          subtitle: `${opts.opportunityTitle} · Instant Cross-Border Merchant Clearing`,
          layoutType: 'title',
          bullets: [
            '6-Second Settlement · 70% Lower FX Fees · Live Testnet Sandbox',
            `Codebase: ${repoDisplay}`,
          ],
          scriptLines: [
            'Hi everyone! We turn three-day international bank wires into six-second local settlements.',
          ],
          allocatedSeconds: 12,
        },
        {
          id: 'evt-s2',
          slideNumber: 2,
          title: 'The Costly Bottleneck',
          subtitle: 'Trapped inventory and 14% currency spreads',
          layoutType: 'problem_solution',
          bullets: primaryProblems.slice(0, 2),
          metricCallout: {
            value: '72 Hours → 6s',
            label: 'Settlement time reduction verified on testnet demo',
          },
          scriptLines: [
            'Importers wait seventy-two hours and lose fourteen percent to FX spreads—we compress that down to six seconds.',
          ],
          allocatedSeconds: 16,
        },
        {
          id: 'evt-s3',
          slideNumber: 3,
          title: '60-Second Walkthrough',
          subtitle: 'Zero wallets, zero gas prompts, instant receipt',
          layoutType: 'demo_flow',
          bullets: [
            'Merchant shares dynamic local checkout invoice.',
            'Buyer pays with a standard bank transfer.',
            'Supplier receives verified stablecoin escrow in 6 seconds.',
          ],
          scriptLines: [
            'The customer transfers local currency normally, and six seconds later the supplier gets settled in verified escrow.',
          ],
          allocatedSeconds: 18,
        },
        {
          id: 'evt-s4',
          slideNumber: 4,
          title: 'Pilot Now & Let’s Connect',
          subtitle: 'Launching with 15 merchants · Open SDK for developers',
          layoutType: 'team_roadmap',
          bullets: [
            '15 wholesale importers committed for Q1 pilot.',
            `Check out our live sandbox & architecture: ${repoDisplay}`,
          ],
          scriptLines: [
            'We are onboarding pilot partners this week—grab us right after this session to try the live sandbox. Thank you!',
          ],
          allocatedSeconds: 14,
        },
      ];

    case 'hackathon_demo':
    default:
      return [
        {
          id: 'hack-s1',
          slideNumber: 1,
          title: 'PayPulse Core',
          subtitle: `Built for ${opts.opportunityTitle}`,
          layoutType: 'title',
          bullets: [
            `Track Focus: ${sponsorBounty}`,
            `Reward Pool: ${opp?.prizePool || '$45,000 USD'}`,
            `Open Source: ${repoDisplay}`,
          ],
          scriptLines: [
            `Good afternoon judges. This is PayPulse Core for ${opts.opportunityTitle}.`,
            'We are solving the 72-hour settlement bottleneck costing emerging-market merchants billions in lost inventory velocity.',
            'Here is how we turn a 3-day wire into a 6-second verified transfer.',
          ],
          allocatedSeconds: 25,
        },
        {
          id: 'hack-s2',
          slideNumber: 2,
          title: 'The Real Bottleneck',
          subtitle: '72-Hour Bank Clearing Lags & 14% Parallel FX Spreads Stagnate Trade',
          layoutType: 'problem_solution',
          bullets: primaryProblems,
          metricCallout: {
            value: '72 Hours',
            label: 'Average merchant wait time for international bank transfer clearing',
          },
          scriptLines: [
            'If you run a cross-border business today, banking wires move too slowly to keep stock alive.',
            'Traders lose up to 14% on currency spreads and wait three days just to clear supplier invoices.',
          ],
          allocatedSeconds: 35,
        },
        {
          id: 'hack-s3',
          slideNumber: 3,
          title: 'Engineered Solution & Architecture',
          subtitle: 'Decoupled Rust Ingestion Core with Local Bank Rails & Finality',
          layoutType: 'architecture',
          bullets: [
            'Client Layer: Zero-gas embedded checkout SDK for merchant kiosks.',
            'Ingestion Core: Sub-10ms Rust engine validating signed webhooks.',
            'Payment Routing: Dedicated virtual accounts trigger instant USDC minting.',
            'Resilience: Idempotent replay queues with real-time reconciliation.',
          ],
          scriptLines: [
            'To eliminate user friction, we decoupled the settlement pipeline.',
            'A sub-10ms Rust engine bridges local bank webhooks to on-chain finality in six seconds.',
          ],
          allocatedSeconds: 45,
        },
        {
          id: 'hack-s4',
          slideNumber: 4,
          title: 'Market Size & Unit Economics',
          subtitle: '$115 Billion Addressable Regional B2B Trade Corridor',
          layoutType: 'market_tam',
          bullets: [
            'TAM: $115B annual informal merchant transactions across ECOWAS corridors.',
            'SAM: $18B tech-enabled commercial trade across West Africa.',
            'SOM (Year 1): $240M processed across 14,000 active merchants.',
            'Fee Model: 0.35% routing fee — 70% cheaper than legacy wires.',
          ],
          metricCallout: {
            value: '$115B',
            label: 'Annual addressable cross-border B2B volume in regional corridors',
          },
          scriptLines: [
            'Regional cross-border trade moves over one hundred billion dollars every year.',
            'At just thirty-five basis points, merchants save seventy percent while sustaining strong unit economics.',
          ],
          allocatedSeconds: 35,
        },
        {
          id: 'hack-s5',
          slideNumber: 5,
          title: 'Live Product Demonstration',
          subtitle: 'End-to-End Testnet Execution: Checkout to Escrow in 5.8 Seconds',
          layoutType: 'demo_flow',
          bullets: [
            'Step 1: Merchant creates dynamic local invoice with guaranteed FX quote.',
            'Step 2: Buyer pays via standard local bank transfer.',
            'Step 3: Signed webhook triggers atomic cross-chain settlement.',
            'Step 4: Supplier receives verified funds in multi-sig escrow.',
          ],
          scriptLines: [
            'Let us walk through the live testnet execution.',
            'By second six, funds settle with zero manual intervention and a complete audit log.',
          ],
          allocatedSeconds: 40,
        },
        {
          id: 'hack-s6',
          slideNumber: 6,
          title: 'Execution Team & Pilot Roadmap',
          subtitle: 'Proven Production Builders & Immediate Merchant Pilot Schedule',
          layoutType: 'team_roadmap',
          bullets: [
            'Engineering Team: 4+ years shipping $4M+/mo production payments rails.',
            'Month 1: Sandbox rollout with 15 pilot wholesale electronics importers.',
            'Month 2: Multi-currency liquidity expansion across Ghana and Côte d’Ivoire.',
          ],
          scriptLines: [
            'Our team has shipped production payment infrastructure at scale.',
            'Fifteen pilot merchants are committed for next month. Thank you—happy to take questions.',
          ],
          allocatedSeconds: 20,
        },
      ];
  }
}

export function buildDeckFromTemplate(
  templateId: DeckTemplateId,
  opts: BuildDeckOptions
): SlideDeck {
  const meta = DECK_TEMPLATES.find((t) => t.id === templateId) || DECK_TEMPLATES[0];
  const slides = createTemplateSlides(meta.id, opts);

  return {
    id: `deck-${opts.workspaceId}-${meta.id}`,
    templateId: meta.id,
    title: `${opts.opportunityTitle} — ${meta.name}`,
    repoUrl: opts.repoUrl,
    targetTimeMinutes: meta.durationMinutes,
    targetAudience: meta.targetAudience,
    slides,
  };
}
