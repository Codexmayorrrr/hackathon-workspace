import React, { useState, useEffect, useRef } from 'react';
import {
  Video,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  Download,
} from 'lucide-react';
import { Opportunity } from '../../types';
import { toast } from 'sonner';

interface DemoVideoStudioProps {
  workspaceId: string;
  opportunity?: Opportunity;
}

interface VideoScene {
  id: string;
  title: string;
  startSec: number;
  endSec: number;
  visualCue: string;
  voiceoverText: string;
}

const DEFAULT_SCENES: VideoScene[] = [
  {
    id: 'scene-1',
    title: 'Scene 1: Hook & The Problem',
    startSec: 0,
    endSec: 18,
    visualCue: 'Montage of bustling Balogun open market, showing merchants negotiating cross-border imports on smartphones.',
    voiceoverText: 'Across West Africa, cross-border informal traders move over one hundred billion dollars a year. But settling invoices through traditional banks takes up to five days with twelve percent in currency fees.',
  },
  {
    id: 'scene-2',
    title: 'Scene 2: Architecture & Live Checkout',
    startSec: 18,
    endSec: 50,
    visualCue: 'Screen capture of merchant interface generating a Paystack virtual account; customer initiates instant local bank transfer.',
    voiceoverText: 'PayPulse Core fixes this directly on the payment rail. The customer transfers local currency to a dedicated Paystack account. Within milliseconds, our Rust ingestion engine verifies the incoming webhook.',
  },
  {
    id: 'scene-3',
    title: 'Scene 3: On-Chain Finality in 6 Seconds',
    startSec: 50,
    endSec: 75,
    visualCue: 'Block explorer and terminal showing Circle CCTP cross-chain bridge contract minting USDC directly into supplier multi-sig escrow.',
    voiceoverText: 'Using Circle CCTP, the funds bridge into dollar stablecoins in five point eight seconds. Zero gas fees for the user, zero foreign exchange slippage for the merchant.',
  },
  {
    id: 'scene-4',
    title: 'Scene 4: Market Traction & Team',
    startSec: 75,
    endSec: 90,
    visualCue: 'Slide highlighting fifteen Balogun pilot merchant agreements and GitHub open-source repository credentials.',
    voiceoverText: 'We have fifteen importer pilot commitments in Lagos and a team with four years of production fintech experience. Thank you for your consideration.',
  },
];

export const DemoVideoStudio: React.FC<DemoVideoStudioProps> = () => {
  const [scenes] = useState<VideoScene[]>(DEFAULT_SCENES);
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSec, setCurrentSec] = useState(0);
  const [voicePersona, setVoicePersona] = useState<'kelechi' | 'amara' | 'marcus'>('kelechi');

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const activeScene = scenes[activeSceneIndex] || scenes[0];

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentSec((prev) => {
          if (prev >= 90) {
            setIsPlaying(false);
            return 0;
          }
          const next = prev + 1;
          const foundIdx = scenes.findIndex((s) => next >= s.startSec && next < s.endSec);
          if (foundIdx !== -1) setActiveSceneIndex(foundIdx);
          return next;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, scenes]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleSeekScene = (idx: number) => {
    setActiveSceneIndex(idx);
    setCurrentSec(scenes[idx].startSec);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#F4F4F6] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div
              aria-hidden="true"
              className="w-10 h-10 rounded-xl bg-white shadow-border flex items-center justify-center text-[#18181B] flex-shrink-0"
            >
              <Video className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div>
              <h4 className="text-base font-bold text-[#18181B] tracking-tight">
                Demo Video Studio
              </h4>
              <p className="text-xs text-[#52525B] mt-0.5 max-w-[60ch]">
                Coordinate scene visuals, script cadence, and voiceover timing on one storyboard.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => toast.success('Prepared MP4 (1080p) storyboard export')}
            className="btn-tactile-primary px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto min-h-[40px]"
          >
            <Download aria-hidden="true" className="w-3.5 h-3.5 stroke-[2]" />
            <span>Export video</span>
          </button>
        </div>

        {/* Voice Persona Selector */}
        <div className="flex items-center gap-2 flex-wrap pt-1 text-xs" role="group" aria-label="Voiceover persona">
          <span className="text-[#52525B] font-medium text-xs">Narrator:</span>
          {[
            { id: 'kelechi', label: 'Kelechi — Crisp Technical' },
            { id: 'amara', label: 'Amara — Storyteller' },
            { id: 'marcus', label: 'Marcus — Fast Walkthrough' },
          ].map((v) => (
            <button
              type="button"
              key={v.id}
              onClick={() => {
                setVoicePersona(v.id as any);
                toast.info(`Selected narrator: ${v.label.split('—')[0].trim()}`);
              }}
              aria-pressed={voicePersona === v.id}
              className={`px-3 py-1.5 rounded-xl font-medium min-h-[34px] ${
                voicePersona === v.id ? 'btn-tactile-primary font-semibold' : 'btn-tactile-secondary bg-white'
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Video Canvas & Timeline Player */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 16:9 Video Simulation Screen */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
          <div className="aspect-[16/9] w-full bg-[#18181B] rounded-2xl p-5 sm:p-8 flex flex-col justify-between text-white relative overflow-hidden">
            <div className="flex items-center justify-between text-xs text-neutral-300">
              <span className="font-mono text-[11px] tracking-wider uppercase bg-white/10 px-2.5 py-0.5 rounded">
                1080p · 60fps Preview
              </span>
              <span className="font-mono text-xs tabular-nums text-white font-bold">
                {formatTime(currentSec)} / 1:30
              </span>
            </div>

            <div className="my-auto py-3 space-y-2.5 max-w-lg">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-amber-300">
                {activeScene.title}
              </span>
              <h5 className="text-base sm:text-xl font-bold tracking-tight leading-snug text-white">
                {activeScene.visualCue}
              </h5>
            </div>

            <div className="bg-black/65 backdrop-blur-md p-3.5 rounded-xl space-y-1">
              <div className="flex items-center gap-2 text-[11px] text-amber-300 font-mono">
                <Volume2 aria-hidden="true" className="w-3.5 h-3.5 stroke-[2]" />
                <span>Voiceover stream:</span>
              </div>
              <p className="text-xs sm:text-sm text-neutral-100 leading-relaxed">
                “{activeScene.voiceoverText}”
              </p>
            </div>
          </div>

          {/* Scrubber & Controls */}
          <div className="p-4 rounded-2xl bg-[#F4F4F6] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setIsPlaying(!isPlaying)}
                aria-label={isPlaying ? 'Pause preview playback' : 'Play preview playback'}
                className="w-10 h-10 rounded-xl btn-tactile-primary flex items-center justify-center"
              >
                {isPlaying ? (
                  <Pause aria-hidden="true" className="w-4 h-4 fill-white" />
                ) : (
                  <Play aria-hidden="true" className="w-4 h-4 fill-white translate-x-[1px]" />
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsPlaying(false);
                  setCurrentSec(0);
                  setActiveSceneIndex(0);
                }}
                className="w-10 h-10 rounded-xl btn-tactile-secondary bg-white flex items-center justify-center"
                title="Restart playback"
                aria-label="Restart playback"
              >
                <RotateCcw aria-hidden="true" className="w-4 h-4 stroke-[1.75]" />
              </button>
              <span className="text-xs font-mono font-bold text-[#18181B] tabular-nums ms-1">
                {formatTime(currentSec)} / 1:30
              </span>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap text-xs" role="group" aria-label="Jump to scene">
              {scenes.map((s, idx) => (
                <button
                  type="button"
                  key={s.id}
                  onClick={() => handleSeekScene(idx)}
                  aria-current={activeSceneIndex === idx ? 'step' : undefined}
                  className={`px-2.5 py-1.5 rounded-lg font-mono text-xs min-h-[32px] ${
                    activeSceneIndex === idx ? 'btn-tactile-primary font-semibold' : 'btn-tactile-secondary bg-white'
                  }`}
                >
                  Scene {idx + 1}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: 4-Scene Storyboard Editor */}
        <div className="lg:col-span-5 space-y-3">
          <span className="text-xs font-semibold text-[#52525B] uppercase tracking-wider block px-1">
            4-Step Demo Storyboard
          </span>

          {scenes.map((scene, idx) => {
            const isActive = activeSceneIndex === idx;

            return (
              <button
                type="button"
                key={scene.id}
                onClick={() => handleSeekScene(idx)}
                aria-current={isActive ? 'step' : undefined}
                className={`w-full text-start p-4 rounded-xl transition-[transform,background-color,box-shadow] duration-150 active:scale-[0.98] space-y-2 ${
                  isActive
                    ? 'surface-card ring-2 ring-[#18181B]'
                    : 'bg-[#F4F4F6] hover:bg-[#EBECEF]'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-[#18181B]">
                    {scene.title}
                  </span>
                  <span className="text-[11px] font-mono text-[#52525B] tabular-nums flex-shrink-0">
                    {formatTime(scene.startSec)} – {formatTime(scene.endSec)}
                  </span>
                </div>

                <p className="text-xs text-[#52525B] line-clamp-2">
                  <strong className="text-[#18181B]">Visual:</strong> {scene.visualCue}
                </p>

                <p className="text-xs text-[#52525B] italic line-clamp-2">
                  “{scene.voiceoverText}”
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
