import React, { useState } from 'react';
import {
  GitFork,
  Presentation,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Download,
  Play,
  Code2,
  RefreshCw,
} from 'lucide-react';
import { SlideDeck, SlideItem } from '../../types';
import { useWorkspaceStore } from '../../store/useWorkspaceStore';
import { toast } from 'sonner';

interface SlideDeckGeneratorProps {
  workspaceId: string;
  opportunityTitle: string;
  onLaunchCoach?: () => void;
}

const DEFAULT_SLIDES: SlideItem[] = [
  {
    id: 's1',
    slideNumber: 1,
    title: 'PayPulse Core',
    subtitle: 'Sub-Cent Stablecoin Settlement SDK for West African Cross-Border Merchants',
    layoutType: 'title',
    bullets: [
      'Built for the Lagos FinTech & Stablecoin Buildathon 2026',
      'Track Focus: Paystack Dedicated Virtual Accounts + Circle CCTP Protocol',
      'Open Source: github.com/developer/paypulse-core',
    ],
    scriptLines: [
      'Good afternoon judges. This is PayPulse Core.',
      'We are solving the 72-hour settlement bottleneck that costs African cross-border merchants billions in lost inventory velocity.',
      'Here is how we turn a 3-day bank wire into a 6-second sub-cent digital transfer.',
    ],
    allocatedSeconds: 25,
  },
  {
    id: 's2',
    slideNumber: 2,
    title: 'The Real Bottleneck',
    subtitle: '72-Hour Bank Clearing Lags & 14% Parallel FX Spreads Stagnate Informal Trade',
    layoutType: 'problem_solution',
    bullets: [
      'Over 88% of informal cross-border traders rely on unregulated cash couriers because SWIFT wires take 3–5 days.',
      'Merchants lose 8% to 14% on arbitrary exchange rate markups between local currencies.',
      'Delayed vendor payments halt supply chains, leaving shelves empty during peak cycles.',
    ],
    metricCallout: {
      value: '72 Hours',
      label: 'Average merchant wait time for international bank transfer clearing',
    },
    scriptLines: [
      'If you run an import business in Lagos or Accra, banking wires are too slow to keep your business alive.',
      'Traders lose up to 14% on currency spreads, waiting three full days for vendor funds to clear.',
      'They are forced into cash black markets just to pay suppliers on time.',
    ],
    allocatedSeconds: 35,
  },
  {
    id: 's3',
    slideNumber: 3,
    title: 'Engineered Solution & Architecture',
    subtitle: 'Decoupled Rust Ingestion Core with Paystack Rails & Circle CCTP Finality',
    layoutType: 'architecture',
    bullets: [
      'Client Layer: Zero-gas embedded mobile SDK for merchant checkout kiosks.',
      'Ingestion Core: High-throughput Rust engine processing signature validation in sub-10ms.',
      'Payment Routing: Paystack Virtual Accounts trigger automated on-chain USDC minting via Circle CCTP.',
      'Resilience: SQS event queuing with automated idempotent replay protection.',
    ],
    scriptLines: [
      'To solve this without adding user friction, we decoupled the architecture.',
      'A sub-10ms Rust engine handles transaction verification, triggering Paystack local accounts on one end and Circle CCTP on the other.',
      'The merchant never touches a seed phrase or pays gas fees. Settlement finality lands in 6 seconds.',
    ],
    allocatedSeconds: 45,
  },
  {
    id: 's4',
    slideNumber: 4,
    title: 'Market Size & Unit Economics',
    subtitle: '$115 Billion Addressable Regional B2B Trade Corridor',
    layoutType: 'market_tam',
    bullets: [
      'TAM: $115B annual informal merchant transactions across ECOWAS trade corridors.',
      'SAM: $18B tech-enabled merchant trade across Nigeria, Ghana, and Côte d’Ivoire.',
      'SOM (Year 1): $240M processed across 14,000 active cross-border merchants.',
      'Revenue Model: 0.35% transaction routing fee (70% cheaper than traditional bank fees).',
    ],
    metricCallout: {
      value: '$115B',
      label: 'Annual addressable informal B2B trade volume in West Africa',
    },
    scriptLines: [
      'This is not a niche product. West African informal cross-border trade moves $115B annually.',
      'By charging just 35 basis points—which is seventy percent cheaper than banks—we unlock rapid merchant adoption with healthy unit economics.',
    ],
    allocatedSeconds: 35,
  },
  {
    id: 's5',
    slideNumber: 5,
    title: 'Live Product Demonstration',
    subtitle: 'End-to-End Testnet Execution: Checkout to On-Chain Escrow in 5.8 Seconds',
    layoutType: 'demo_flow',
    bullets: [
      'Step 1: Merchant generates dynamic Paystack invoice link with guaranteed FX lock.',
      'Step 2: Customer pays via local bank transfer to virtual account.',
      'Step 3: Webhook event triggers Circle CCTP cross-chain bridge contract.',
      'Step 4: Supplier receives verified dollar stablecoins in verified multi-sig escrow.',
    ],
    scriptLines: [
      'Now let us watch the live testnet run.',
      'The customer pays in local Naira via Paystack. Within four seconds, the webhook fires our smart contract.',
      'By second six, dollar stablecoins are settled in the supplier’s wallet. Zero slippage, complete audit trail.',
    ],
    allocatedSeconds: 40,
  },
  {
    id: 's6',
    slideNumber: 6,
    title: 'Execution Team & Pilot Roadmap',
    subtitle: 'Proven Production Deployments & Q1 2027 Commercial Pilot Schedule',
    layoutType: 'team_roadmap',
    bullets: [
      'Engineering Team: 4+ years shipping production payments infrastructure handling $4M+ monthly volume.',
      'Month 1: Sandbox integration with 15 pilot electronics importers in Balogun Market.',
      'Month 2: Multi-currency corridor expansion into Ghana Cedi and CFA franc.',
      'Month 3: Regulatory sandbox submission with the Central Bank of Nigeria (CBN).',
    ],
    scriptLines: [
      'Our team has previously scaled payment systems handling millions of dollars.',
      'We already have letters of intent from fifteen Balogun electronics merchants ready to pilot next month.',
      'Thank you. We welcome your questions.',
    ],
    allocatedSeconds: 20,
  },
];

export const SlideDeckGenerator: React.FC<SlideDeckGeneratorProps> = ({
  workspaceId,
  opportunityTitle,
  onLaunchCoach,
}) => {
  const workspace = useWorkspaceStore((state) => state.getWorkspace(workspaceId));
  const updateWorkspaceRepo = useWorkspaceStore((state) => state.updateWorkspaceRepo);
  const updateWorkspaceSlideDeck = useWorkspaceStore((state) => state.updateWorkspaceSlideDeck);

  const [repoUrl, setRepoUrl] = useState(
    workspace?.githubRepoUrl || 'https://github.com/developer/paypulse-core'
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const slideDeck: SlideDeck = workspace?.slideDeck || {
    id: `deck-${workspaceId}`,
    title: `${opportunityTitle} — Pitch Deck`,
    repoUrl,
    targetTimeMinutes: 3,
    targetAudience: 'judges',
    slides: DEFAULT_SLIDES,
  };

  const slides = slideDeck.slides;
  const currentSlide = slides[currentSlideIndex] || slides[0];

  const handleGenerateFromRepo = () => {
    if (!repoUrl.trim()) {
      toast.error('Enter a GitHub repository URL');
      return;
    }

    setIsGenerating(true);
    updateWorkspaceRepo(workspaceId, repoUrl.trim());

    setTimeout(() => {
      setIsGenerating(false);
      updateWorkspaceSlideDeck(workspaceId, slideDeck);
      toast.success('Slide deck synced from repository');
    }, 1000);
  };

  const handleNextSlide = () => {
    if (currentSlideIndex < slides.length - 1) {
      setCurrentSlideIndex((prev) => prev + 1);
    }
  };

  const handlePrevSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex((prev) => prev - 1);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="surface-card p-6 sm:p-8 rounded-2xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div
              aria-hidden="true"
              className="w-10 h-10 rounded-xl bg-[#EFE6FF] text-[#3B0764] flex items-center justify-center flex-shrink-0"
            >
              <Presentation className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[#18181B] tracking-tight">
                Repository to Pitch Deck
              </h3>
              <p className="text-xs text-[#52525B] mt-0.5 max-w-[60ch]">
                Synthesize a crisp 6-slide narrative with timed speaker notes directly from your codebase.
              </p>
            </div>
          </div>

          {onLaunchCoach && (
            <button
              type="button"
              onClick={onLaunchCoach}
              className="btn-tactile-primary px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 flex-shrink-0 min-h-[40px]"
            >
              <Play aria-hidden="true" className="w-3.5 h-3.5 fill-white" />
              <span>Open presentation coach</span>
            </button>
          )}
        </div>

        {/* Repo Input Strip */}
        <div className="pt-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="relative flex-1">
            <label htmlFor="repo-slide-url" className="sr-only">
              GitHub repository URL for slide generation
            </label>
            <GitFork aria-hidden="true" className="absolute start-3.5 top-3 w-4 h-4 text-[#63636B] stroke-[1.75] pointer-events-none" />
            <input
              id="repo-slide-url"
              type="url"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="https://github.com/username/project-repo"
              className="field-surface w-full rounded-xl ps-10 pe-3.5 py-2.5 text-base sm:text-sm font-mono"
            />
          </div>

          <button
            type="button"
            onClick={handleGenerateFromRepo}
            disabled={isGenerating}
            className="btn-tactile-secondary px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 flex-shrink-0 min-h-[42px]"
          >
            {isGenerating ? (
              <>
                <RefreshCw aria-hidden="true" className="w-3.5 h-3.5 motion-safe:animate-spin" />
                <span>Generating…</span>
              </>
            ) : (
              <>
                <Sparkles aria-hidden="true" className="w-3.5 h-3.5 text-[#18181B] stroke-[2]" />
                <span>Synthesize deck</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main 16:9 Slide Canvas Renderer */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap px-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#18181B]">
              Slide {currentSlide.slideNumber} of {slides.length}
            </span>
            <span aria-hidden="true" className="text-[#63636B]">·</span>
            <span className="text-xs font-mono text-[#52525B] tabular-nums">
              Budget: {currentSlide.allocatedSeconds}s
            </span>
          </div>

          {/* Slide Pager Tabs */}
          <div className="flex items-center gap-1" role="group" aria-label="Slide jump buttons">
            {slides.map((s, idx) => (
              <button
                type="button"
                key={s.id}
                onClick={() => setCurrentSlideIndex(idx)}
                aria-label={`Jump to slide ${s.slideNumber}`}
                aria-current={currentSlideIndex === idx ? 'step' : undefined}
                className={`w-8 h-8 rounded-lg text-xs font-mono font-medium ${
                  currentSlideIndex === idx ? 'btn-tactile-primary font-semibold' : 'btn-tactile-secondary'
                }`}
              >
                {s.slideNumber}
              </button>
            ))}
          </div>
        </div>

        {/* Slide Canvas */}
        <div className="surface-card min-h-[340px] sm:aspect-[16/9] w-full rounded-2xl p-6 sm:p-10 lg:p-14 flex flex-col justify-between relative">
          <div className="flex items-center justify-between text-xs text-[#63636B]">
            <span className="font-semibold tracking-wider uppercase text-[11px]">
              {opportunityTitle}
            </span>
            <span className="font-mono text-[11px] tabular-nums">
              Slide {currentSlide.slideNumber} / {slides.length}
            </span>
          </div>

          {/* Center Slide Body */}
          <div className="my-auto py-4 space-y-5 max-w-3xl">
            <div className="space-y-2">
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#18181B] tracking-tight leading-tight">
                {currentSlide.title}
              </h3>
              <p className="text-sm sm:text-base text-[#52525B] font-medium leading-relaxed">
                {currentSlide.subtitle}
              </p>
            </div>

            {currentSlide.layoutType === 'title' && (
              <div className="pt-2 space-y-2.5">
                {currentSlide.bullets.map((b, i) => (
                  <div key={i} className="flex items-center gap-3 text-xs sm:text-sm text-[#18181B]">
                    <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full bg-[#18181B] flex-shrink-0" />
                    <span>{b}</span>
                  </div>
                ))}
              </div>
            )}

            {currentSlide.layoutType === 'problem_solution' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 sm:p-5 rounded-xl bg-[#F4F4F6] space-y-2">
                  <span className="text-xs font-semibold text-rose-800 uppercase tracking-wider block">
                    Core Friction
                  </span>
                  <ul className="space-y-2 text-xs sm:text-sm text-[#52525B]">
                    {currentSlide.bullets.slice(0, 2).map((b, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span aria-hidden="true" className="text-rose-700 font-bold">•</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {currentSlide.metricCallout && (
                  <div className="p-4 sm:p-5 rounded-xl bg-[#F4F4F6] flex flex-col justify-center space-y-1">
                    <span className="text-3xl sm:text-4xl font-bold text-[#18181B] font-mono tracking-tight tabular-nums">
                      {currentSlide.metricCallout.value}
                    </span>
                    <span className="text-xs text-[#52525B]">
                      {currentSlide.metricCallout.label}
                    </span>
                  </div>
                )}
              </div>
            )}

            {currentSlide.layoutType === 'architecture' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
                {currentSlide.bullets.map((b, i) => {
                  const [label, desc] = b.split(': ');
                  return (
                    <div key={i} className="p-4 rounded-xl bg-[#F4F4F6] space-y-1">
                      <span className="text-xs font-bold text-[#18181B] block">{label}</span>
                      <p className="text-xs text-[#52525B] leading-snug">{desc || b}</p>
                    </div>
                  );
                })}
              </div>
            )}

            {currentSlide.layoutType === 'market_tam' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {currentSlide.metricCallout && (
                  <div className="p-5 rounded-xl bg-[#ECFDF5] flex flex-col justify-center space-y-1">
                    <span className="text-4xl sm:text-5xl font-bold text-[#065F46] font-mono tracking-tight tabular-nums">
                      {currentSlide.metricCallout.value}
                    </span>
                    <span className="text-xs text-[#065F46] font-medium">
                      {currentSlide.metricCallout.label}
                    </span>
                  </div>
                )}

                <div className="p-5 rounded-xl bg-[#F4F4F6] space-y-2">
                  <span className="text-xs font-semibold text-[#18181B] uppercase tracking-wider block">
                    Addressable Corridors
                  </span>
                  <ul className="space-y-1.5 text-xs text-[#52525B]">
                    {currentSlide.bullets.slice(1).map((b, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span aria-hidden="true" className="text-emerald-700 font-bold">•</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {(currentSlide.layoutType === 'demo_flow' || currentSlide.layoutType === 'team_roadmap') && (
              <div className="space-y-2.5 pt-2">
                {currentSlide.bullets.map((b, i) => (
                  <div key={i} className="p-3 rounded-xl bg-[#F4F4F6] flex items-center gap-3 text-xs sm:text-sm text-[#18181B]">
                    <span className="w-6 h-6 rounded-lg bg-white shadow-border flex items-center justify-center font-mono font-bold text-xs text-[#18181B] flex-shrink-0">
                      {i + 1}
                    </span>
                    <span>{b}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-[11px] text-[#63636B] pt-4">
            <span className="font-mono">Open Source Prototype</span>
            <span className="font-mono">github.com/developer/paypulse-core</span>
          </div>
        </div>

        {/* Slide Navigation Controls & Script Sync */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrevSlide}
              disabled={currentSlideIndex === 0}
              className="w-10 h-10 rounded-xl btn-tactile-secondary flex items-center justify-center disabled:opacity-35 disabled:pointer-events-none"
              title="Previous slide"
              aria-label="Previous slide"
            >
              <ChevronLeft aria-hidden="true" className="w-4 h-4 stroke-[2] rtl:-scale-x-100" />
            </button>
            <button
              type="button"
              onClick={handleNextSlide}
              disabled={currentSlideIndex === slides.length - 1}
              className="w-10 h-10 rounded-xl btn-tactile-secondary flex items-center justify-center disabled:opacity-35 disabled:pointer-events-none"
              title="Next slide"
              aria-label="Next slide"
            >
              <ChevronRight aria-hidden="true" className="w-4 h-4 stroke-[2] rtl:-scale-x-100" />
            </button>
            <span className="text-xs text-[#52525B] font-mono ms-2">
              Slide {currentSlide.slideNumber} of {slides.length}
            </span>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={() => toast.success('Prepared PDF / PPTX deck export')}
              className="btn-tactile-secondary px-4 py-2.5 rounded-xl text-xs font-medium flex items-center gap-2 min-h-[40px]"
            >
              <Download aria-hidden="true" className="w-3.5 h-3.5 stroke-[1.75]" />
              <span>Export PDF / PPTX</span>
            </button>

            {onLaunchCoach && (
              <button
                type="button"
                onClick={onLaunchCoach}
                className="btn-tactile-primary px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 min-h-[40px]"
              >
                <Play aria-hidden="true" className="w-3.5 h-3.5 fill-white" />
                <span>Rehearse pitch</span>
              </button>
            )}
          </div>
        </div>

        {/* Attached Slide Talk Script Box */}
        <div className="surface-card p-5 rounded-2xl space-y-2.5">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="text-xs font-semibold text-[#18181B] flex items-center gap-2">
              <Code2 aria-hidden="true" className="w-3.5 h-3.5 stroke-[1.75]" />
              <span>Speaker Script (Slide {currentSlide.slideNumber})</span>
            </span>
            <span className="text-xs font-mono text-[#52525B] tabular-nums">
              Target: ~{currentSlide.allocatedSeconds}s
            </span>
          </div>

          <div className="space-y-1.5">
            {currentSlide.scriptLines.map((line, idx) => (
              <p key={idx} className="text-xs sm:text-sm text-[#52525B] leading-relaxed">
                “{line}”
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
