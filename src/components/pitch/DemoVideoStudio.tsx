import React, { useState, useEffect, useRef } from 'react';
import { 
  Video, 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  Download
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
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
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
      {/* Header Banner - PRD §3.H All in one place */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#FDFDFD] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-neutral-800">
              <Video className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-neutral-900 tracking-tight [text-wrap:balance]">
                  Demo Video Studio (Script, Voice & Video)
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white text-neutral-700 font-mono font-semibold">
                  PRD §3.H Single Flow
                </span>
              </div>
              <p className="text-xs text-neutral-500 [text-wrap:pretty]">
                No more jumping between Remotion, ElevenLabs, and video editors. Synthesizes script, voiceover, and visual storyboard in one unified timeline.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => toast.success('Video exported as MP4 (1080p)')}
              className="btn-tactile-primary px-4.5 py-2.5 rounded-xl text-xs font-semibold active:scale-[0.97] text-white flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 stroke-[1.75]" />
              <span>Export Final Video</span>
            </button>
          </div>
        </div>

        {/* Voice Persona Selector */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-2 text-xs">
          <span className="text-neutral-400 font-medium text-[11px] flex-shrink-0">Voice Persona:</span>
          {[
            { id: 'kelechi', label: 'Kelechi — Confident African English' },
            { id: 'amara', label: 'Amara — Warm Tech Storyteller' },
            { id: 'marcus', label: 'Marcus — Fast-Paced Technical Explainer' },
          ].map((v) => (
            <button
              key={v.id}
              onClick={() => {
                setVoicePersona(v.id as any);
                toast.info(`Switched voice to ${v.label.split('—')[0].trim()}`);
              }}
              className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-colors active:scale-[0.97] ${
                voicePersona === v.id
                  ? 'bg-neutral-900 text-white font-semibold'
                  : 'bg-white hover:bg-neutral-100 text-neutral-700'
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Video Canvas & Timeline Player */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 16:9 Video Simulation Screen (7 cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
          <div className="aspect-[16/9] w-full bg-neutral-950 rounded-2xl p-6 sm:p-8 flex flex-col justify-between text-white relative overflow-hidden select-none">
            {/* Top Video Header */}
            <div className="flex items-center justify-between text-xs text-neutral-400">
              <span className="font-mono text-[10px] tracking-wider uppercase bg-white/10 px-2 py-0.5 rounded">
                1080p · 60fps Preview
              </span>
              <span className="font-mono text-xs tabular-nums text-white font-bold">
                {formatTime(currentSec)} / 1:30
              </span>
            </div>

            {/* Video Visual Stage Graphic Simulation */}
            <div className="my-auto space-y-3 max-w-lg">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-amber-400">
                {activeScene.title}
              </span>
              <h4 className="text-lg sm:text-xl font-bold tracking-tight leading-snug">
                {activeScene.visualCue}
              </h4>
            </div>

            {/* Bottom Subtitle / Voiceover Overlay */}
            <div className="bg-black/60 backdrop-blur-md p-3.5 rounded-xl space-y-1">
              <div className="flex items-center gap-2 text-[10px] text-amber-300 font-mono">
                <Volume2 className="w-3 h-3 stroke-[2]" />
                <span>Voiceover Stream:</span>
              </div>
              <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed [text-wrap:pretty]">
                "{activeScene.voiceoverText}"
              </p>
            </div>
          </div>

          {/* Scrubber & Controls */}
          <div className="p-4 rounded-2xl bg-[#FDFDFD] flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-10 h-10 rounded-xl bg-neutral-900 text-white flex items-center justify-center active:scale-[0.97] transition-transform"
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
              </button>
              <button
                onClick={() => {
                  setIsPlaying(false);
                  setCurrentSec(0);
                  setActiveSceneIndex(0);
                }}
                className="p-2 rounded-xl text-neutral-400 hover:text-neutral-700 active:scale-[0.97]"
                title="Restart playback"
              >
                <RotateCcw className="w-4 h-4 stroke-[1.75]" />
              </button>
              <span className="text-xs font-mono font-bold text-neutral-900 tabular-nums">
                {formatTime(currentSec)} / 1:30
              </span>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
              {scenes.map((s, idx) => (
                <button
                  key={s.id}
                  onClick={() => handleSeekScene(idx)}
                  className={`px-2.5 py-1 rounded-lg font-mono text-[11px] whitespace-nowrap active:scale-[0.97] ${
                    activeSceneIndex === idx
                      ? 'bg-neutral-900 text-white font-semibold'
                      : 'bg-white text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  Scene {idx + 1}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: 4-Scene Storyboard Editor (5 cols) */}
        <div className="lg:col-span-5 space-y-3.5">
          <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block px-1">
            4-Step Demo Storyboard
          </span>

          {scenes.map((scene, idx) => {
            const isActive = activeSceneIndex === idx;

            return (
              <div
                key={scene.id}
                onClick={() => handleSeekScene(idx)}
                className={`p-4 rounded-xl cursor-pointer transition-[transform,background-color] duration-150 active:scale-[0.98] space-y-2 ${
                  isActive
                    ? 'bg-[#FDFDFD] ring-2 ring-neutral-900'
                    : 'bg-[#FDFDFD] hover:bg-[#f9f9fa]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-900">
                    {scene.title}
                  </span>
                  <span className="text-[10px] font-mono text-neutral-400 tabular-nums">
                    {formatTime(scene.startSec)} – {formatTime(scene.endSec)}
                  </span>
                </div>

                <p className="text-[11px] text-neutral-500 line-clamp-2">
                  <strong className="text-neutral-700">Visual:</strong> {scene.visualCue}
                </p>

                <p className="text-xs text-neutral-700 italic line-clamp-2 [text-wrap:pretty]">
                  "{scene.voiceoverText}"
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
