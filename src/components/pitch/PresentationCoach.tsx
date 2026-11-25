import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Mic,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Clock,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { SlideDeck } from '../../types';
import { AccessibleModal } from '../ui/AccessibleModal';
import { toast } from 'sonner';

interface PresentationCoachProps {
  isOpen: boolean;
  onClose: () => void;
  slideDeck: SlideDeck;
  opportunityTitle?: string;
}

interface FlattenedScriptLine {
  id: string;
  slideIndex: number;
  slideNumber: number;
  lineIndex: number;
  text: string;
  allocatedSeconds: number;
}

export const PresentationCoach: React.FC<PresentationCoachProps> = ({
  isOpen,
  onClose,
  slideDeck,
  opportunityTitle,
}) => {
  const slides = slideDeck.slides;
  const targetTimeSeconds = (slideDeck.targetTimeMinutes || 3) * 60;

  const flattenedLines: FlattenedScriptLine[] = useMemo(
    () =>
      slides.flatMap((slide, sIdx) =>
        slide.scriptLines.map((line, lIdx) => ({
          id: `line-${sIdx}-${lIdx}`,
          slideIndex: sIdx,
          slideNumber: slide.slideNumber,
          lineIndex: lIdx,
          text: line,
          allocatedSeconds: Math.max(
            2,
            Math.round(slide.allocatedSeconds / Math.max(1, slide.scriptLines.length))
          ),
        }))
      ),
    [slides]
  );

  const [mode, setMode] = useState<'rehearsal' | 'live'>('rehearsal');
  const [isRunning, setIsRunning] = useState(false);
  const [activeLineIndex, setActiveLineIndex] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isPausedForQA, setIsPausedForQA] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [slideElapsedTimes, setSlideElapsedTimes] = useState<number[]>(new Array(slides.length).fill(0));

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const activeLineRef = useRef<HTMLButtonElement | null>(null);

  const currentLine = flattenedLines[activeLineIndex] || flattenedLines[0];
  const currentSlideIndex = currentLine.slideIndex;
  const currentSlide = slides[currentSlideIndex] || slides[0];
  const nextSlide = slides[currentSlideIndex + 1];

  const cumulativeBudgetSeconds = slides
    .slice(0, currentSlideIndex + 1)
    .reduce((acc, s) => acc + s.allocatedSeconds, 0);

  const deltaSeconds = elapsedSeconds - cumulativeBudgetSeconds;
  const paceLabel =
    deltaSeconds <= -5
      ? `${Math.abs(deltaSeconds)}s Ahead`
      : deltaSeconds >= 5
      ? `${deltaSeconds}s Behind`
      : 'On Pace';

  const paceColor =
    deltaSeconds <= -5
      ? 'text-[#065F46] bg-[#ECFDF5]'
      : deltaSeconds >= 5
      ? 'text-[#92400E] bg-[#FEF3C7]'
      : 'text-[#18181B] bg-[#F4F4F6]';

  useEffect(() => {
    if (isRunning && !isPausedForQA && !isFinished) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
        setSlideElapsedTimes((prev) => {
          const next = [...prev];
          next[currentSlideIndex] = (next[currentSlideIndex] || 0) + 1;
          return next;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, isPausedForQA, isFinished, currentSlideIndex]);

  useEffect(() => {
    if (activeLineRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [activeLineIndex]);

  useEffect(() => {
    if (!isRunning || isPausedForQA || isFinished) return;

    const lineAdvanceTimeout = setTimeout(() => {
      handleAdvanceLine();
    }, (currentLine.allocatedSeconds || 5) * 1000);

    return () => clearTimeout(lineAdvanceTimeout);
  }, [isRunning, isPausedForQA, activeLineIndex, isFinished]);

  const handleStartRehearsal = () => {
    setIsRunning(true);
    setIsFinished(false);
    toast.success('Teleprompter started', {
      description: 'Speak at your natural cadence.',
    });
  };

  const handlePauseToggle = () => {
    setIsRunning((prev) => !prev);
  };

  const handleReset = () => {
    setIsRunning(false);
    setActiveLineIndex(0);
    setElapsedSeconds(0);
    setIsFinished(false);
    setIsPausedForQA(false);
    setSlideElapsedTimes(new Array(slides.length).fill(0));
  };

  const handleAdvanceLine = () => {
    if (activeLineIndex < flattenedLines.length - 1) {
      setActiveLineIndex((prev) => prev + 1);
    } else {
      setIsRunning(false);
      setIsFinished(true);
      toast.success('Pitch rehearsal complete');
    }
  };

  const handlePrevLine = () => {
    if (activeLineIndex > 0) {
      setActiveLineIndex((prev) => prev - 1);
    }
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  return (
    <AccessibleModal
      isOpen={isOpen}
      onClose={onClose}
      titleId="coach-modal-title"
      descriptionId="coach-modal-desc"
      maxWidthClass="max-w-5xl"
      title="Presentation coach"
      description={`${opportunityTitle ? `${opportunityTitle} · ` : ''}${
        mode === 'rehearsal'
          ? 'Synced teleprompter timed to each slide budget.'
          : 'Live countdown with Q&A pause and manual slide cues.'
      }`}
      icon={<Mic className="w-4 h-4 stroke-[1.75]" />}
      iconToneClass="bg-[#EFE6FF] text-[#3B0764]"
      closeLabel="Close presentation coach dialog"
      footer={
        isFinished ? (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleReset}
              className="btn-tactile-primary px-6 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 min-h-[40px]"
            >
              <RotateCcw aria-hidden="true" className="w-3.5 h-3.5 stroke-[2]" />
              <span>Rehearse again</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2.5">
              {!isRunning ? (
                <button
                  type="button"
                  onClick={handleStartRehearsal}
                  className="btn-tactile-primary px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 min-h-[40px]"
                >
                  <Play aria-hidden="true" className="w-3.5 h-3.5 fill-white stroke-[2]" />
                  <span>Start rehearsal</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handlePauseToggle}
                  className="btn-tactile-secondary px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 min-h-[40px]"
                >
                  <Pause aria-hidden="true" className="w-3.5 h-3.5 stroke-[2]" />
                  <span>Pause</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleReset}
                className="btn-tactile-secondary w-10 h-10 rounded-xl flex items-center justify-center"
                title="Reset rehearsal session"
                aria-label="Reset rehearsal session"
              >
                <RotateCcw aria-hidden="true" className="w-4 h-4 stroke-[1.75]" />
              </button>
            </div>

            <div className="text-xs text-[#52525B] font-mono flex items-center gap-2 tabular-nums">
              <Clock aria-hidden="true" className="w-3.5 h-3.5 stroke-[1.75]" />
              <span>Target: {slideDeck.targetTimeMinutes}m 00s</span>
            </div>
          </div>
        )
      }
    >
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="inline-flex items-center bg-[#F4F4F6] rounded-xl p-1 text-xs" role="group" aria-label="Coach mode">
            <button
              type="button"
              onClick={() => setMode('rehearsal')}
              aria-pressed={mode === 'rehearsal'}
              className={`px-3 py-1.5 rounded-lg font-medium transition-[transform,background-color,color] duration-150 active:scale-[0.96] min-h-[34px] ${
                mode === 'rehearsal'
                  ? 'bg-white text-[#18181B] font-semibold'
                  : 'text-[#52525B] hover:text-[#18181B]'
              }`}
            >
              Rehearsal
            </button>
            <button
              type="button"
              onClick={() => setMode('live')}
              aria-pressed={mode === 'live'}
              className={`px-3 py-1.5 rounded-lg font-medium transition-[transform,background-color,color] duration-150 active:scale-[0.96] min-h-[34px] ${
                mode === 'live'
                  ? 'bg-white text-[#18181B] font-semibold'
                  : 'text-[#52525B] hover:text-[#18181B]'
              }`}
            >
              Live stage
            </button>
          </div>
          <span className="text-xs text-[#63636B] font-mono tabular-nums">
            Slide {currentSlide.slideNumber} of {slides.length}
          </span>
        </div>

        {/* REHEARSAL SUMMARY VIEW */}
        {isFinished ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            className="p-6 sm:p-8 rounded-2xl bg-[#F4F4F6] text-center space-y-6"
          >
            <div
              aria-hidden="true"
              className="w-12 h-12 rounded-2xl bg-[#ECFDF5] flex items-center justify-center text-[#065F46] mx-auto"
            >
              <CheckCircle2 className="w-6 h-6 stroke-[2]" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl sm:text-2xl font-bold text-[#18181B] tracking-tight">
                Rehearsal complete
              </h3>
              <p className="text-xs sm:text-sm text-[#52525B]">
                Compare your pacing against your {slideDeck.targetTimeMinutes}-minute presentation target.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-xl mx-auto">
              <div className="surface-card p-4 rounded-xl space-y-1">
                <span className="text-xs text-[#63636B] font-medium">Total duration</span>
                <p className="text-2xl font-bold font-mono text-[#18181B] tabular-nums">
                  {formatTime(elapsedSeconds)}
                </p>
                <span className="text-xs text-[#52525B] tabular-nums">
                  Target: {formatTime(targetTimeSeconds)}
                </span>
              </div>

              <div className="surface-card p-4 rounded-xl space-y-1">
                <span className="text-xs text-[#63636B] font-medium">Pacing variance</span>
                <p
                  className={`text-2xl font-bold font-mono tabular-nums ${
                    Math.abs(deltaSeconds) <= 10 ? 'text-emerald-700' : 'text-amber-800'
                  }`}
                >
                  {deltaSeconds > 0 ? `+${deltaSeconds}s` : `${deltaSeconds}s`}
                </p>
                <span className="text-xs text-[#52525B]">
                  {Math.abs(deltaSeconds) <= 10 ? 'Within target window' : 'Adjust slide pace'}
                </span>
              </div>

              <div className="surface-card p-4 rounded-xl space-y-1">
                <span className="text-xs text-[#63636B] font-medium">Slides covered</span>
                <p className="text-2xl font-bold font-mono text-[#18181B] tabular-nums">
                  {slides.length} / {slides.length}
                </p>
                <span className="text-xs text-emerald-700 font-semibold">
                  100% covered
                </span>
              </div>
            </div>

            <div className="max-w-xl mx-auto space-y-2 text-start">
              <span className="text-xs font-semibold text-[#63636B] block">
                Per-slide pacing audit
              </span>
              <div className="space-y-1.5">
                {slides.map((s, idx) => {
                  const actual = slideElapsedTimes[idx] || s.allocatedSeconds;
                  const diff = actual - s.allocatedSeconds;
                  return (
                    <div key={s.id} className="surface-card p-3 rounded-xl flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-mono font-bold text-[#63636B]">Slide {s.slideNumber}:</span>
                        <span className="font-semibold text-[#18181B] truncate">{s.title}</span>
                      </div>
                      <div className="flex items-center gap-2 font-mono tabular-nums flex-shrink-0">
                        <span className="text-[#52525B]">{actual}s</span>
                        <span
                          className={`text-[11px] font-semibold px-1.5 py-0.5 rounded ${
                            diff <= -2
                              ? 'bg-[#ECFDF5] text-[#065F46]'
                              : diff >= 4
                              ? 'bg-[#FEF3C7] text-[#92400E]'
                              : 'text-[#52525B]'
                          }`}
                        >
                          {diff > 0 ? `+${diff}s` : `${diff}s`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        ) : (
          /* ACTIVE TELEPROMPTER & SLIDE SYNCHRONIZATION VIEW */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[420px]">
            {/* Left Column: Lyrics Teleprompter */}
            <div className="lg:col-span-7 flex flex-col justify-between bg-[#F4F4F6] rounded-2xl p-5 sm:p-6 overflow-hidden">
              <div className="flex items-center justify-between gap-2 pb-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className={`w-2.5 h-2.5 rounded-full ${
                      isRunning && !isPausedForQA ? 'bg-emerald-600 motion-safe:animate-pulse' : 'bg-neutral-400'
                    }`}
                  />
                  <span className="text-xs font-semibold text-[#18181B]">
                    {isRunning && !isPausedForQA ? 'Listening…' : isPausedForQA ? 'Paused for Q&A' : 'Ready'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-xs font-mono font-semibold px-2.5 py-0.5 rounded-md tabular-nums ${paceColor}`}>
                    {paceLabel}
                  </span>
                  <span className="text-xs font-mono font-bold text-[#18181B] bg-white px-3 py-1 rounded-lg tabular-nums">
                    {formatTime(elapsedSeconds)} / {formatTime(targetTimeSeconds)}
                  </span>
                </div>
              </div>

              {/* Scrolling Lines Container */}
              <div className="flex-1 overflow-y-auto max-h-[300px] py-4 space-y-2.5 pe-1">
                {flattenedLines.map((line, idx) => {
                  const isPast = idx < activeLineIndex;
                  const isCurrent = idx === activeLineIndex;

                  return (
                    <button
                      type="button"
                      key={line.id}
                      ref={isCurrent ? activeLineRef : null}
                      onClick={() => setActiveLineIndex(idx)}
                      aria-current={isCurrent ? 'step' : undefined}
                      className={`w-full rounded-xl px-4 py-3 text-start transition-[transform,background-color,color] duration-150 ${
                        isCurrent
                          ? 'bg-white text-[#18181B] font-semibold text-base'
                          : isPast
                          ? 'text-[#63636B] text-xs line-through opacity-75 hover:opacity-100'
                          : 'text-[#52525B] text-xs sm:text-[13px] hover:bg-white/60 hover:text-[#18181B]'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`text-[11px] font-mono px-2 py-0.5 rounded ${
                            isCurrent
                              ? 'bg-[#18181B] text-white font-semibold'
                              : 'bg-white text-[#52525B]'
                          }`}
                        >
                          Slide {line.slideNumber}
                        </span>
                      </div>
                      <p className="leading-relaxed">“{line.text}”</p>
                    </button>
                  );
                })}
              </div>

              {/* Teleprompter Footer Overrides */}
              <div className="flex items-center justify-between pt-3 text-xs text-[#52525B]">
                <span>Select any line or step manually</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePrevLine}
                    disabled={activeLineIndex === 0}
                    aria-label="Previous script line"
                    className="w-9 h-9 rounded-xl btn-tactile-secondary bg-white flex items-center justify-center disabled:opacity-35 disabled:pointer-events-none"
                  >
                    <ChevronLeft aria-hidden="true" className="w-4 h-4 stroke-[2] rtl:-scale-x-100" />
                  </button>
                  <button
                    type="button"
                    onClick={handleAdvanceLine}
                    aria-label="Next script line"
                    className="w-9 h-9 rounded-xl btn-tactile-secondary bg-white flex items-center justify-center"
                  >
                    <ChevronRight aria-hidden="true" className="w-4 h-4 stroke-[2] rtl:-scale-x-100" />
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Synchronized Mini Slide & Next Slide Preview */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
              <div className="bg-[#EFEFF2] aspect-[16/9] w-full rounded-2xl p-5 flex flex-col justify-between">
                <div className="flex items-center justify-between text-[11px] text-[#63636B]">
                  <span className="font-semibold">
                    {mode === 'live' ? 'Audience View' : 'Active Slide'}
                  </span>
                  <span className="font-mono font-medium">
                    {currentSlide.slideNumber} / {slides.length}
                  </span>
                </div>

                <div className="my-auto space-y-2">
                  <h3 className="text-base sm:text-lg font-bold text-[#18181B] leading-snug">
                    {currentSlide.title}
                  </h3>
                  <p className="text-xs text-[#52525B] line-clamp-2 leading-relaxed">
                    {currentSlide.subtitle}
                  </p>
                  {currentSlide.metricCallout && (
                    <div className="pt-1">
                      <span className="text-xl font-bold font-mono text-[#18181B] tabular-nums">
                        {currentSlide.metricCallout.value}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#52525B] pt-2">
                  <span>Synced to script</span>
                  <span className="font-mono">~{currentSlide.allocatedSeconds}s</span>
                </div>
              </div>

              {nextSlide ? (
                <div className="p-4 rounded-xl bg-[#F4F4F6] space-y-1">
                  <div className="flex items-center justify-between text-xs text-[#63636B]">
                    <span className="font-semibold">Up next</span>
                    <span className="font-mono tabular-nums">Slide {nextSlide.slideNumber}</span>
                  </div>
                  <h4 className="text-xs font-bold text-[#18181B] truncate">
                    {nextSlide.title}
                  </h4>
                  <p className="text-xs text-[#52525B] truncate">
                    “{nextSlide.scriptLines[0]}”
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-[#F4F4F6] text-xs text-[#52525B] text-center">
                  Final slide (Conclusion & Q&A)
                </div>
              )}

              <div className="p-4 rounded-xl bg-[#F4F4F6] space-y-2.5">
                <span className="text-xs font-semibold text-[#18181B] block">
                  Stage controls
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setIsPausedForQA((prev) => !prev);
                      toast.info(isPausedForQA ? 'Resuming script sync' : 'Paused for Q&A');
                    }}
                    aria-pressed={isPausedForQA}
                    className={`p-2.5 rounded-xl font-semibold text-center transition-[transform,background-color,color] duration-150 active:scale-[0.96] min-h-[38px] ${
                      isPausedForQA
                        ? 'bg-[#92400E] text-white'
                        : 'btn-tactile-secondary bg-white'
                    }`}
                  >
                    {isPausedForQA ? 'Resume script' : 'Pause for Q&A'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      handleAdvanceLine();
                      toast('Advanced slide');
                    }}
                    className="btn-tactile-secondary bg-white p-2.5 rounded-xl font-medium text-center min-h-[38px]"
                  >
                    Next cue
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AccessibleModal>
  );
};
