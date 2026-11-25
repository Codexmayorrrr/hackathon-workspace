import React, { useState } from 'react';
import {
  animate,
  motion,
  PanInfo,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from 'framer-motion';
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
  Check,
  LayoutTemplate,
} from 'lucide-react';
import { DeckTemplateId, Opportunity, SlideDeck } from '../../types';
import { useWorkspaceStore } from '../../store/useWorkspaceStore';
import {
  buildDeckFromTemplate,
  DECK_TEMPLATES,
  getDefaultTemplateIdForOpportunity,
} from '../../utils/deckTemplates';
import { toast } from 'sonner';

interface SlideDeckGeneratorProps {
  workspaceId: string;
  opportunityTitle: string;
  opportunity?: Opportunity;
  onLaunchCoach?: () => void;
}

export const SlideDeckGenerator: React.FC<SlideDeckGeneratorProps> = ({
  workspaceId,
  opportunityTitle,
  opportunity,
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

  const defaultTemplateId = getDefaultTemplateIdForOpportunity(opportunity?.type);
  const activeTemplateId: DeckTemplateId =
    workspace?.slideDeck?.templateId || defaultTemplateId;

  const shouldReduceMotion = useReducedMotion();
  const slideDragX = useMotionValue(0);
  const slideDragOpacity = useTransform(slideDragX, [-180, 0, 180], [0.75, 1, 0.75]);

  const slideDeck: SlideDeck =
    workspace?.slideDeck ||
    buildDeckFromTemplate(defaultTemplateId, {
      workspaceId,
      opportunityTitle,
      opportunity,
      repoUrl,
    });

  const slides = slideDeck.slides;
  const currentSlide = slides[currentSlideIndex] || slides[0];

  const handleSelectTemplate = (templateId: DeckTemplateId) => {
    const templateMeta = DECK_TEMPLATES.find((t) => t.id === templateId);
    const nextDeck = buildDeckFromTemplate(templateId, {
      workspaceId,
      opportunityTitle,
      opportunity,
      repoUrl: repoUrl.trim() || undefined,
    });
    updateWorkspaceSlideDeck(workspaceId, nextDeck);
    setCurrentSlideIndex(0);
    slideDragX.set(0);
    toast.success(`Loaded "${templateMeta?.name || 'Deck'}" template`, {
      description: `${nextDeck.slides.length} slides · ${nextDeck.targetTimeMinutes}m script timing`,
    });
  };

  const handleGenerateFromRepo = () => {
    if (!repoUrl.trim()) {
      toast.error('Enter a GitHub repository URL');
      return;
    }

    setIsGenerating(true);
    const cleanedRepo = repoUrl.trim();
    updateWorkspaceRepo(workspaceId, cleanedRepo);

    setTimeout(() => {
      const nextDeck = buildDeckFromTemplate(activeTemplateId, {
        workspaceId,
        opportunityTitle,
        opportunity,
        repoUrl: cleanedRepo,
      });
      setIsGenerating(false);
      updateWorkspaceSlideDeck(workspaceId, nextDeck);
      toast.success('Slide deck synced from repository');
    }, 800);
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

  const handleSlideDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const canGoNext = currentSlideIndex < slides.length - 1;
    const canGoPrev = currentSlideIndex > 0;
    const swipedLeft = info.offset.x < -70 || info.velocity.x < -420;
    const swipedRight = info.offset.x > 70 || info.velocity.x > 420;

    if (swipedLeft && canGoNext) {
      setCurrentSlideIndex((prev) => prev + 1);
      if (shouldReduceMotion) {
        slideDragX.set(0);
      } else {
        slideDragX.set(40);
        animate(slideDragX, 0, {
          type: 'spring',
          duration: 0.34,
          bounce: 0.14,
          velocity: info.velocity.x,
        });
      }
      return;
    }

    if (swipedRight && canGoPrev) {
      setCurrentSlideIndex((prev) => prev - 1);
      if (shouldReduceMotion) {
        slideDragX.set(0);
      } else {
        slideDragX.set(-40);
        animate(slideDragX, 0, {
          type: 'spring',
          duration: 0.34,
          bounce: 0.14,
          velocity: info.velocity.x,
        });
      }
      return;
    }

    if (shouldReduceMotion) {
      slideDragX.set(0);
    } else {
      animate(slideDragX, 0, {
        type: 'spring',
        duration: 0.36,
        bounce: 0.18,
        velocity: info.velocity.x,
      });
    }
  };

  const repoDisplay =
    (slideDeck.repoUrl || repoUrl).replace(/^https?:\/\//, '').replace(/\/$/, '') ||
    'github.com/developer/paypulse-core';

  return (
    <div className="space-y-6">
      {/* Header Banner & Ready-Made Templates */}
      <div className="surface-card p-6 sm:p-8 rounded-2xl space-y-6">
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
                Pitch Deck Builder & Templates
              </h3>
              <p className="text-xs text-[#52525B] mt-0.5 max-w-[60ch]">
                Start from a ready-made deck template or sync from your repository, complete with timed speaker scripts.
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

        {/* Ready-Made Template Selector Grid */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="text-xs font-semibold text-[#18181B] flex items-center gap-1.5">
              <LayoutTemplate aria-hidden="true" className="w-3.5 h-3.5 text-[#52525B] stroke-[1.75]" />
              <span>Ready-Made Templates</span>
            </span>
            <span className="text-[11px] font-mono text-[#63636B]">
              Target audience: {slideDeck.targetAudience.replace('_', ' ')}
            </span>
          </div>

          <div
            className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3"
            role="group"
            aria-label="Choose ready-made pitch deck template"
          >
            {DECK_TEMPLATES.map((tpl) => {
              const isSelected = activeTemplateId === tpl.id;
              return (
                <button
                  type="button"
                  key={tpl.id}
                  onClick={() => handleSelectTemplate(tpl.id)}
                  aria-pressed={isSelected}
                  className={`text-start p-4 rounded-xl transition-[transform,background-color,box-shadow] duration-150 active:scale-[0.97] space-y-2 min-w-0 ${
                    isSelected
                      ? 'bg-white ring-2 ring-[#18181B] shadow-border'
                      : 'bg-[#F4F4F6] hover:bg-[#EBECEF]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-semibold text-[#18181B] leading-snug">
                      {tpl.name}
                    </span>
                    {isSelected && (
                      <span
                        aria-hidden="true"
                        className="w-4 h-4 rounded-full bg-[#18181B] text-white flex items-center justify-center flex-shrink-0 mt-0.5"
                      >
                        <Check className="w-2.5 h-2.5 stroke-[2.5]" />
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-[#52525B] leading-snug line-clamp-2">
                    {tpl.description}
                  </p>

                  <div className="pt-0.5 flex items-center gap-1.5 text-[11px] font-mono text-[#63636B] flex-wrap">
                    <span className="px-1.5 py-0.5 rounded bg-white/80 text-[#18181B] font-medium">
                      {tpl.slideCount} slides
                    </span>
                    <span>·</span>
                    <span>{tpl.durationMinutes}m pitch</span>
                    <span>·</span>
                    <span>{tpl.audienceLabel}</span>
                  </div>
                </button>
              );
            })}
          </div>
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
              inputMode="url"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              enterKeyHint="go"
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
                <span>Sync repo details</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main 16:9 Slide Canvas Renderer */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap px-1">
          <div className="flex items-center gap-2 flex-wrap">
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
                className={`relative w-8 h-8 rounded-lg text-xs font-mono font-medium before:content-[''] before:absolute before:-inset-1.5 ${
                  currentSlideIndex === idx ? 'btn-tactile-primary font-semibold' : 'btn-tactile-secondary'
                }`}
              >
                {s.slideNumber}
              </button>
            ))}
          </div>
        </div>

        {/* Slide Canvas (1:1 horizontal swipe gesture with velocity release & edge rubber-banding) */}
        <div className="overflow-hidden rounded-2xl">
          <motion.div
            drag="x"
            dragDirectionLock
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={{
              left: currentSlideIndex === slides.length - 1 ? 0.12 : 0.24,
              right: currentSlideIndex === 0 ? 0.12 : 0.24,
            }}
            dragMomentum={false}
            onDragEnd={handleSlideDragEnd}
            style={{ x: slideDragX, opacity: slideDragOpacity }}
            className="surface-card min-h-[340px] sm:aspect-[16/9] w-full rounded-2xl p-6 sm:p-10 lg:p-14 flex flex-col justify-between relative touch-pan-y select-none sm:select-text cursor-grab active:cursor-grabbing"
          >
            <div className="flex items-start justify-between gap-4 text-xs text-[#63636B]">
              <span className="font-medium text-xs min-w-0">
                {opportunityTitle}
              </span>
              <span className="font-mono text-[11px] tabular-nums whitespace-nowrap flex-shrink-0">
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
                    <span className="text-xs font-semibold text-rose-800 block">
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
                    <span className="text-xs font-semibold text-[#18181B] block">
                      Key Breakdown
                    </span>
                    <ul className="space-y-1.5 text-xs text-[#52525B]">
                      {currentSlide.bullets.map((b, i) => (
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

            <div className="flex items-center justify-between gap-3 flex-wrap text-[11px] text-[#63636B] pt-4">
              <span className="font-mono">Open Source Prototype</span>
              <span className="font-mono">{repoDisplay}</span>
            </div>
          </motion.div>
        </div>

        {/* Slide Navigation Controls & Script Sync */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrevSlide}
              disabled={currentSlideIndex === 0}
              className="w-11 h-11 rounded-xl btn-tactile-secondary flex items-center justify-center disabled:opacity-35 disabled:pointer-events-none"
              title="Previous slide"
              aria-label="Previous slide"
            >
              <ChevronLeft aria-hidden="true" className="w-4 h-4 stroke-[2] rtl:-scale-x-100" />
            </button>
            <button
              type="button"
              onClick={handleNextSlide}
              disabled={currentSlideIndex === slides.length - 1}
              className="w-11 h-11 rounded-xl btn-tactile-secondary flex items-center justify-center disabled:opacity-35 disabled:pointer-events-none"
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
              onClick={() => toast.success(`Prepared PDF / PPTX export for "${slideDeck.title}"`)}
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
