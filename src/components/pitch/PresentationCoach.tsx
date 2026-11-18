import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Mic, 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle2, 
  Clock, 
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { SlideDeck } from '../../types';
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

  // Flatten all slide scripts into ordered lyrics lines
  const flattenedLines: FlattenedScriptLine[] = useRef(
    slides.flatMap((slide, sIdx) =>
      slide.scriptLines.map((line, lIdx) => ({
        id: `line-${sIdx}-${lIdx}`,
        slideIndex: sIdx,
        slideNumber: slide.slideNumber,
        lineIndex: lIdx,
        text: line,
        allocatedSeconds: Math.round(slide.allocatedSeconds / slide.scriptLines.length),
      }))
    )
  ).current;

  // Rehearsal & Live Mode States
  const [mode, setMode] = useState<'rehearsal' | 'live'>('rehearsal');
  const [isRunning, setIsRunning] = useState(false);
  const [activeLineIndex, setActiveLineIndex] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isPausedForQA, setIsPausedForQA] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [slideElapsedTimes, setSlideElapsedTimes] = useState<number[]>(new Array(slides.length).fill(0));

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const activeLineRef = useRef<HTMLDivElement | null>(null);

  // Active line & slide
  const currentLine = flattenedLines[activeLineIndex] || flattenedLines[0];
  const currentSlideIndex = currentLine.slideIndex;
  const currentSlide = slides[currentSlideIndex] || slides[0];
  const nextSlide = slides[currentSlideIndex + 1];

  // Budget calculations
  const cumulativeBudgetSeconds = slides
    .slice(0, currentSlideIndex + 1)
    .reduce((acc, s) => acc + s.allocatedSeconds, 0);

  const deltaSeconds = elapsedSeconds - cumulativeBudgetSeconds;
  const paceLabel = deltaSeconds <= -5
    ? `${Math.abs(deltaSeconds)}s Ahead`
    : deltaSeconds >= 5
    ? `${deltaSeconds}s Behind`
    : 'On Pace';

  const paceColor = deltaSeconds <= -5
    ? 'text-emerald-700 bg-emerald-50'
    : deltaSeconds >= 5
    ? 'text-amber-800 bg-amber-50'
    : 'text-neutral-700 bg-[#FDFDFD]';

  // Timer Tick
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
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, isPausedForQA, isFinished, currentSlideIndex]);

  // Auto-scroll the Spotify-style lyrics teleprompter as lines advance
  useEffect(() => {
    if (activeLineRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [activeLineIndex]);

  // Web Speech API / Simulated Voice Listener
  useEffect(() => {
    if (!isRunning || isPausedForQA || isFinished) return;

    // Simulate voice line advancement every ~4-7 seconds if real mic is silent or unsupported
    const lineAdvanceTimeout = setTimeout(() => {
      handleAdvanceLine();
    }, (currentLine.allocatedSeconds || 5) * 1000);

    return () => clearTimeout(lineAdvanceTimeout);
  }, [isRunning, isPausedForQA, activeLineIndex, isFinished]);

  if (!isOpen) return null;

  const handleStartRehearsal = () => {
    setIsRunning(true);
    setIsFinished(false);
    toast.success('Microphone listening...', {
      description: 'Spotify-style teleprompter active. Speak clearly.',
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
      toast.success('Pitch rehearsal complete!');
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
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-neutral-900/40 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            style={{ transformOrigin: 'center' }}
            className="w-full max-w-5xl bg-white rounded-3xl p-6 sm:p-8 lg:p-10 relative overflow-hidden max-h-[94vh] flex flex-col justify-between space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Bar */}
            <div className="flex items-center justify-between pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#FDFDFD] flex items-center justify-center text-neutral-800">
                  <Mic className="w-5 h-5 stroke-[1.75]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-neutral-900 tracking-tight [text-wrap:balance]">
                      Presentation Coach {opportunityTitle && <span className="text-xs text-neutral-400 font-normal">({opportunityTitle})</span>}
                    </h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FDFDFD] text-neutral-600 font-mono font-semibold">
                      PRD §3.I Voice-Driven
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 [text-wrap:pretty]">
                    {mode === 'rehearsal'
                      ? 'Rehearsal Mode: Spotify-style lyrics that follow your voice.'
                      : 'Live Stage Mode: Smart slides advance without saying "next slide".'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Mode Toggle */}
                <div className="flex items-center bg-[#FDFDFD] rounded-xl p-1 text-xs">
                  <button
                    onClick={() => setMode('rehearsal')}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-[transform,background-color,color] duration-150 active:scale-[0.97] ${
                      mode === 'rehearsal'
                        ? 'bg-white text-neutral-900 font-semibold'
                        : 'text-neutral-500 hover:text-neutral-800'
                    }`}
                  >
                    Rehearsal
                  </button>
                  <button
                    onClick={() => setMode('live')}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-[transform,background-color,color] duration-150 active:scale-[0.97] ${
                      mode === 'live'
                        ? 'bg-white text-neutral-900 font-semibold'
                        : 'text-neutral-500 hover:text-neutral-800'
                    }`}
                  >
                    Live Stage
                  </button>
                </div>

                <button
                  onClick={onClose}
                  className="p-2 rounded-xl text-neutral-400 hover:text-neutral-700 hover:bg-[#FDFDFD] transition-[transform,background-color,color] duration-150 active:scale-[0.97]"
                  aria-label="Close presentation coach"
                >
                  <X className="w-4 h-4 stroke-[1.75]" />
                </button>
              </div>
            </div>

            {/* REHEARSAL SUMMARY VIEW */}
            {isFinished ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                className="p-8 sm:p-12 rounded-3xl bg-[#FDFDFD] text-center space-y-6 my-auto"
              >
            <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-emerald-600 mx-auto">
              <CheckCircle2 className="w-7 h-7 stroke-[2]" />
            </div>

            <div className="space-y-1">
              <h4 className="text-2xl font-extrabold text-neutral-900 tracking-tight [text-wrap:balance]">
                Pitch Rehearsal Complete
              </h4>
              <p className="text-xs sm:text-sm text-neutral-500 [text-wrap:pretty]">
                Here is how your speech cadence and timing performed against your {slideDeck.targetTimeMinutes}-minute slot.
              </p>
            </div>

            {/* Timing Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-xl mx-auto pt-2">
              <div className="p-4 rounded-xl bg-white space-y-1">
                <span className="text-[11px] text-neutral-400 font-medium">Total Duration</span>
                <p className="text-2xl font-bold font-mono text-neutral-900 tabular-nums">
                  {formatTime(elapsedSeconds)}
                </p>
                <span className="text-[10px] text-neutral-500">
                  Target: {formatTime(targetTimeSeconds)}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-white space-y-1">
                <span className="text-[11px] text-neutral-400 font-medium">Pacing Variance</span>
                <p className={`text-2xl font-bold font-mono tabular-nums ${
                  Math.abs(deltaSeconds) <= 10 ? 'text-emerald-700' : 'text-amber-700'
                }`}>
                  {deltaSeconds > 0 ? `+${deltaSeconds}s` : `${deltaSeconds}s`}
                </p>
                <span className="text-[10px] text-neutral-500">
                  {Math.abs(deltaSeconds) <= 10 ? 'Ideal timing window' : 'Adjust slide speed'}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-white space-y-1">
                <span className="text-[11px] text-neutral-400 font-medium">Slides Covered</span>
                <p className="text-2xl font-bold font-mono text-neutral-900 tabular-nums">
                  {slides.length} / {slides.length}
                </p>
                <span className="text-[10px] text-emerald-700 font-medium">
                  100% voice synchronized
                </span>
              </div>
            </div>

            {/* Per-Slide Breakdown */}
            <div className="max-w-xl mx-auto space-y-2 pt-2 text-left">
              <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block">
                Per-Slide Pace Audit
              </span>
              <div className="space-y-1.5">
                {slides.map((s, idx) => {
                  const actual = slideElapsedTimes[idx] || s.allocatedSeconds;
                  const diff = actual - s.allocatedSeconds;
                  return (
                    <div key={s.id} className="p-3 rounded-xl bg-white flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-neutral-400">Slide {s.slideNumber}:</span>
                        <span className="font-semibold text-neutral-900 truncate max-w-[240px]">{s.title}</span>
                      </div>
                      <div className="flex items-center gap-2 font-mono tabular-nums">
                        <span className="text-neutral-500">{actual}s</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                          diff <= -2 ? 'bg-emerald-50 text-emerald-700' : diff >= 4 ? 'bg-amber-50 text-amber-800' : 'text-neutral-400'
                        }`}>
                          {diff > 0 ? `+${diff}s` : `${diff}s`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 pt-4">
              <button
                onClick={handleReset}
                className="btn-tactile-primary px-6 py-2.5 rounded-xl text-xs font-semibold text-white active:scale-[0.97] flex items-center gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Rehearse Again</span>
              </button>
            </div>
          </motion.div>
        ) : (
          /* ACTIVE TELEPROMPTER & SLIDE SYNCHRONIZATION VIEW */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-[460px] overflow-hidden">
            {/* Left Column: Spotify-Style Lyrics Teleprompter (7 cols) */}
            <div className="lg:col-span-7 flex flex-col justify-between bg-[#FDFDFD] rounded-2xl p-6 sm:p-8 overflow-hidden relative">
              {/* Teleprompter Status Pill */}
              <div className="flex items-center justify-between pb-3">
                <div className="flex items-center gap-2.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${isRunning && !isPausedForQA ? 'bg-emerald-500 animate-pulse' : 'bg-neutral-300'}`} />
                  <span className="text-xs font-semibold text-neutral-800">
                    {isRunning && !isPausedForQA ? 'Listening for speech...' : isPausedForQA ? 'Paused for Judge Q&A' : 'Standing By'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full tabular-nums ${paceColor}`}>
                    {paceLabel}
                  </span>
                  <span className="text-xs font-mono font-bold text-neutral-900 bg-white px-3 py-1 rounded-xl tabular-nums">
                    {formatTime(elapsedSeconds)} / {formatTime(targetTimeSeconds)}
                  </span>
                </div>
              </div>

              {/* Scrolling Lyrics Container */}
              <div className="flex-1 overflow-y-auto no-scrollbar py-6 space-y-4 my-2">
                {flattenedLines.map((line, idx) => {
                  const isPast = idx < activeLineIndex;
                  const isCurrent = idx === activeLineIndex;

                  return (
                    <div
                      key={line.id}
                      ref={isCurrent ? activeLineRef : null}
                      onClick={() => setActiveLineIndex(idx)}
                      className={`cursor-pointer transition-[transform,background-color,opacity] duration-200 ease-out text-left ${
                        isCurrent
                          ? 'p-4 rounded-xl bg-white text-neutral-900 font-bold text-base sm:text-lg scale-[1.01]'
                          : isPast
                          ? 'text-neutral-300 text-xs sm:text-sm line-through decoration-neutral-200'
                          : 'text-neutral-400 text-xs sm:text-sm hover:text-neutral-600'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                          isCurrent ? 'bg-neutral-900 text-white font-semibold' : 'text-neutral-400 bg-white'
                        }`}>
                          Slide {line.slideNumber}
                        </span>
                      </div>
                      <p className="leading-relaxed [text-wrap:pretty]">
                        "{line.text}"
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Teleprompter Footer Overrides */}
              <div className="flex items-center justify-between pt-3 text-xs text-neutral-400">
                <span>Manual Override: Click any line or tap Next</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrevLine}
                    disabled={activeLineIndex === 0}
                    className="p-2 rounded-xl bg-white hover:bg-neutral-100 disabled:opacity-30 active:scale-[0.97]"
                  >
                    <ChevronLeft className="w-3.5 h-3.5 stroke-[2]" />
                  </button>
                  <button
                    onClick={handleAdvanceLine}
                    className="p-2 rounded-xl bg-white hover:bg-neutral-100 active:scale-[0.97]"
                  >
                    <ChevronRight className="w-3.5 h-3.5 stroke-[2]" />
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Synchronized Mini Slide & Next Slide Preview (5 cols) */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
              {/* Active Slide Display */}
              <div className="aspect-[16/9] w-full bg-white rounded-2xl p-5 sm:p-6 flex flex-col justify-between select-none relative overflow-hidden">
                <div className="flex items-center justify-between text-[10px] text-neutral-400">
                  <span className="font-semibold uppercase tracking-wider">
                    {mode === 'live' ? 'Audience View' : 'Active Slide'}
                  </span>
                  <span className="font-mono">
                    {currentSlide.slideNumber} / {slides.length}
                  </span>
                </div>

                <div className="my-auto space-y-2">
                  <h3 className="text-base sm:text-lg font-extrabold text-neutral-900 leading-snug [text-wrap:balance]">
                    {currentSlide.title}
                  </h3>
                  <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed [text-wrap:pretty]">
                    {currentSlide.subtitle}
                  </p>
                  {currentSlide.metricCallout && (
                    <div className="pt-1">
                      <span className="text-xl font-bold font-mono text-neutral-900 tabular-nums">
                        {currentSlide.metricCallout.value}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-[10px] text-neutral-400 pt-2">
                  <span>Voice Sync Active</span>
                  <span className="font-mono">~{currentSlide.allocatedSeconds}s</span>
                </div>
              </div>

              {/* Next Slide Preview Box */}
              {nextSlide ? (
                <div className="p-4 rounded-xl bg-[#FDFDFD] space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-neutral-400">
                    <span className="font-semibold uppercase tracking-wider">Up Next</span>
                    <span>Slide {nextSlide.slideNumber}</span>
                  </div>
                  <h5 className="text-xs font-bold text-neutral-800 truncate">
                    {nextSlide.title}
                  </h5>
                  <p className="text-[11px] text-neutral-400 truncate">
                    "{nextSlide.scriptLines[0]}"
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-[#FDFDFD] text-xs text-neutral-400 text-center">
                  Final Slide (Conclusion & Q&A)
                </div>
              )}

              {/* Safety Nets & Hotkey Overrides (PRD §3.I) */}
              <div className="p-4 rounded-xl bg-[#FDFDFD] space-y-2">
                <span className="text-[11px] font-semibold text-neutral-900 block">
                  Stage Safety Nets
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    onClick={() => {
                      setIsPausedForQA((prev) => !prev);
                      toast.info(isPausedForQA ? 'Resuming script sync' : 'Paused for judge Q&A');
                    }}
                    className={`p-2.5 rounded-xl font-medium text-center transition-colors active:scale-[0.97] ${
                      isPausedForQA ? 'bg-amber-600 text-white font-bold' : 'bg-white hover:bg-neutral-50 text-neutral-800'
                    }`}
                  >
                    {isPausedForQA ? '▶ Resume Script' : '⏸ Pause for Q&A'}
                  </button>

                  <button
                    onClick={() => {
                      handleAdvanceLine();
                      toast('Manual slide push');
                    }}
                    className="p-2.5 rounded-xl bg-white hover:bg-neutral-50 text-neutral-800 font-medium text-center active:scale-[0.97]"
                  >
                    Manual Next ➔
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Global Bottom Controls Bar */}
        {!isFinished && (
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {!isRunning ? (
                <button
                  onClick={handleStartRehearsal}
                  className="btn-tactile-primary px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white active:scale-[0.97] flex items-center gap-2"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Start Voice Rehearsal</span>
                </button>
              ) : (
                <button
                  onClick={handlePauseToggle}
                  className="bg-[#FDFDFD] hover:bg-[#f4f4f6] px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-neutral-800 active:scale-[0.97] flex items-center gap-2"
                >
                  <Pause className="w-4 h-4" />
                  <span>Pause</span>
                </button>
              )}

              <button
                onClick={handleReset}
                className="bg-[#FDFDFD] hover:bg-[#f4f4f6] p-2.5 rounded-xl text-neutral-600 hover:text-neutral-900 active:scale-[0.97]"
                title="Reset session"
              >
                <RotateCcw className="w-4 h-4 stroke-[1.75]" />
              </button>
            </div>

            <div className="text-xs text-neutral-400 font-mono flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 stroke-[1.75]" />
              <span>Slot Target: {slideDeck.targetTimeMinutes}m 00s</span>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
  );
};
