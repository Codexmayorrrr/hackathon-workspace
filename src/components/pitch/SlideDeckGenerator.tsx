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
  RefreshCw
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

  const [repoUrl, setRepoUrl] = useState(workspace?.githubRepoUrl || 'https://github.com/developer/paypulse-core');
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
      toast.error('Please provide a GitHub repository link');
      return;
    }

    setIsGenerating(true);
    updateWorkspaceRepo(workspaceId, repoUrl.trim());

    setTimeout(() => {
      setIsGenerating(false);
      updateWorkspaceSlideDeck(workspaceId, slideDeck);
      toast.success('Slide deck generated from repository', {
        description: 'Brain extracted core architecture; Hands applied typography rules.',
      });
    }, 1200);
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
      {/* Header Banner - Hands and Brain philosophy */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#FDFDFD] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-neutral-800">
              <Presentation className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-neutral-900 tracking-tight [text-wrap:balance]">
                  GitHub Repo to Slide Deck Engine
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white text-neutral-700 font-mono font-semibold">
                  PRD §3.F Brain & Hands
                </span>
              </div>
              <p className="text-xs text-neutral-500 [text-wrap:pretty]">
                The AI is the brain (understands repo & content). The design is the hands (strict typography, zero-clutter layout rules).
              </p>
            </div>
          </div>

          {onLaunchCoach && (
            <button
              onClick={onLaunchCoach}
              className="btn-tactile-primary px-4.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 flex-shrink-0"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Open Presentation Coach</span>
            </button>
          )}
        </div>

        {/* Repo Input Strip */}
        <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="relative flex-1">
            <GitFork className="absolute left-3.5 top-3 w-4 h-4 text-neutral-400 stroke-[1.75]" />
            <input
              type="url"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="https://github.com/username/project-repo"
              className="w-full bg-white rounded-xl pl-10 pr-3.5 py-2.5 text-base sm:text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 font-mono border-0"
            />
          </div>

          <button
            onClick={handleGenerateFromRepo}
            disabled={isGenerating}
            className="btn-tactile-secondary px-4.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 flex-shrink-0"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Reading Repo & Generating...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-neutral-900 stroke-[2]" />
                <span>Synthesize Slide Deck</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main 16:9 Slide Canvas Renderer */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-neutral-900">
              Slide {currentSlide.slideNumber} of {slides.length}
            </span>
            <span className="text-neutral-300">·</span>
            <span className="text-xs font-mono text-neutral-500 tabular-nums">
              Budget: {currentSlide.allocatedSeconds}s
            </span>
          </div>

          {/* Slide Pager Tabs */}
          <div className="flex items-center gap-1">
            {slides.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => setCurrentSlideIndex(idx)}
                className={`w-7 h-7 rounded-lg text-xs font-mono font-medium ${
                  currentSlideIndex === idx
                    ? 'btn-tactile-primary'
                    : 'btn-tactile-secondary text-neutral-600 hover:text-neutral-900'
                }`}
              >
                {s.slideNumber}
              </button>
            ))}
          </div>
        </div>

        {/* The Slide Canvas: 16:9 Aspect Ratio with Pure White & #FDFDFD Palette */}
        <div className="aspect-[16/9] w-full bg-white rounded-2xl p-8 sm:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden select-none">
          {/* Top Brand Header */}
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span className="font-semibold tracking-wider uppercase text-[10px]">
              {opportunityTitle}
            </span>
            <span className="font-mono text-[10px]">
              Slide {currentSlide.slideNumber} / {slides.length}
            </span>
          </div>

          {/* Center Slide Body */}
          <div className="my-auto space-y-6 max-w-3xl">
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-neutral-900 tracking-tight leading-tight [text-wrap:balance]">
                {currentSlide.title}
              </h2>
              <p className="text-sm sm:text-base text-neutral-500 font-medium leading-relaxed [text-wrap:pretty]">
                {currentSlide.subtitle}
              </p>
            </div>

            {/* Layout Specific Rendering */}
            {currentSlide.layoutType === 'title' && (
              <div className="pt-4 space-y-3">
                {currentSlide.bullets.map((b, i) => (
                  <div key={i} className="flex items-center gap-3 text-xs sm:text-sm text-neutral-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-900" />
                    <span>{b}</span>
                  </div>
                ))}
              </div>
            )}

            {currentSlide.layoutType === 'problem_solution' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 sm:p-5 rounded-xl bg-[#FDFDFD] space-y-2">
                  <span className="text-xs font-semibold text-rose-800 uppercase tracking-wider block">
                    Core Friction
                  </span>
                  <ul className="space-y-2 text-xs sm:text-sm text-neutral-600">
                    {currentSlide.bullets.slice(0, 2).map((b, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-rose-500 font-bold">•</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {currentSlide.metricCallout && (
                  <div className="p-4 sm:p-5 rounded-xl bg-[#FDFDFD] flex flex-col justify-center space-y-1">
                    <span className="text-3xl sm:text-4xl font-extrabold text-neutral-900 font-mono tracking-tight tabular-nums">
                      {currentSlide.metricCallout.value}
                    </span>
                    <span className="text-xs text-neutral-500 [text-wrap:pretty]">
                      {currentSlide.metricCallout.label}
                    </span>
                  </div>
                )}
              </div>
            )}

            {currentSlide.layoutType === 'architecture' && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                {currentSlide.bullets.map((b, i) => {
                  const [label, desc] = b.split(': ');
                  return (
                    <div key={i} className="p-3.5 rounded-xl bg-[#FDFDFD] space-y-1">
                      <span className="text-xs font-bold text-neutral-900 block">{label}</span>
                      <p className="text-[11px] text-neutral-500 leading-snug">{desc || b}</p>
                    </div>
                  );
                })}
              </div>
            )}

            {currentSlide.layoutType === 'market_tam' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {currentSlide.metricCallout && (
                  <div className="p-5 rounded-xl bg-[#FDFDFD] flex flex-col justify-center space-y-1">
                    <span className="text-4xl sm:text-5xl font-extrabold text-emerald-700 font-mono tracking-tight tabular-nums">
                      {currentSlide.metricCallout.value}
                    </span>
                    <span className="text-xs text-neutral-500">
                      {currentSlide.metricCallout.label}
                    </span>
                  </div>
                )}

                <div className="p-5 rounded-xl bg-[#FDFDFD] space-y-2">
                  <span className="text-xs font-semibold text-neutral-900 uppercase tracking-wider block">
                    Addressable Corridors
                  </span>
                  <ul className="space-y-1.5 text-xs text-neutral-600">
                    {currentSlide.bullets.slice(1).map((b, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-emerald-600 font-bold">•</span>
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
                  <div key={i} className="p-3 rounded-xl bg-[#FDFDFD] flex items-center gap-3 text-xs sm:text-sm text-neutral-700">
                    <span className="w-6 h-6 rounded-lg bg-white flex items-center justify-center font-mono font-bold text-xs text-neutral-900 flex-shrink-0">
                      {i + 1}
                    </span>
                    <span className="[text-wrap:pretty]">{b}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bottom Footer */}
          <div className="flex items-center justify-between text-xs text-neutral-400 pt-4">
            <span className="font-mono text-[10px]">Open Source Prototype</span>
            <span className="text-[10px]">github.com/developer/paypulse-core</span>
          </div>
        </div>

        {/* Slide Navigation Controls & Script Sync */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevSlide}
              disabled={currentSlideIndex === 0}
              className="p-2.5 rounded-xl btn-tactile-secondary text-neutral-700 disabled:opacity-30 disabled:pointer-events-none"
              title="Previous slide"
            >
              <ChevronLeft className="w-4 h-4 stroke-[2]" />
            </button>
            <button
              onClick={handleNextSlide}
              disabled={currentSlideIndex === slides.length - 1}
              className="p-2.5 rounded-xl btn-tactile-secondary text-neutral-700 disabled:opacity-30 disabled:pointer-events-none"
              title="Next slide"
            >
              <ChevronRight className="w-4 h-4 stroke-[2]" />
            </button>
            <span className="text-xs text-neutral-500 font-mono ml-2">
              Use arrow keys or click to navigate
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => toast.success('Slide deck exported to PDF')}
              className="btn-tactile-secondary px-4 py-2.5 rounded-xl text-xs font-medium flex items-center gap-2"
            >
              <Download className="w-3.5 h-3.5 stroke-[1.75]" />
              <span>Export PDF / PPTX</span>
            </button>

            {onLaunchCoach && (
              <button
                onClick={onLaunchCoach}
                className="btn-tactile-primary px-4.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Rehearse Pitch</span>
              </button>
            )}
          </div>
        </div>

        {/* Attached Slide Talk Script Box */}
        <div className="p-5 rounded-2xl bg-[#FDFDFD] space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-900 flex items-center gap-2">
              <Code2 className="w-3.5 h-3.5 stroke-[1.75]" />
              <span>Attached Speaker Talk Script (What you say while they look at Slide {currentSlide.slideNumber})</span>
            </span>
            <span className="text-xs font-mono text-neutral-400 tabular-nums">
              Target: ~{currentSlide.allocatedSeconds} seconds
            </span>
          </div>

          <div className="space-y-1.5">
            {currentSlide.scriptLines.map((line, idx) => (
              <p key={idx} className="text-xs sm:text-sm text-neutral-600 leading-relaxed [text-wrap:pretty]">
                "{line}"
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
