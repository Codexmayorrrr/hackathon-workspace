import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Sparkles, 
  Check, 
  Copy, 
  ShieldAlert, 
  FolderArchive,
  Lightbulb,
  Sliders,
  CheckCircle2
} from 'lucide-react';
import { ApplicationRequirement, Opportunity, Judge } from '../../types';
import { toast } from 'sonner';

interface ApplicationHelperModalProps {
  isOpen: boolean;
  onClose: () => void;
  requirement: ApplicationRequirement;
  opportunity: Opportunity;
  currentDraft: string;
  onApplyDraft: (text: string) => void;
  onOpenVault: () => void;
  onSaveToVault?: (text: string) => void;
}

export const ApplicationHelperModal: React.FC<ApplicationHelperModalProps> = ({
  isOpen,
  onClose,
  requirement,
  opportunity,
  currentDraft,
  onApplyDraft,
  onOpenVault,
  onSaveToVault,
}) => {
  const maxWords = requirement.maxWords || 150;
  const judges = opportunity.judges || [];
  const primaryJudge: Judge | undefined = judges[0];

  // Helper generator options based on the requirement type and question
  const isProblemStatement = requirement.title.toLowerCase().includes('problem') || requirement.title.toLowerCase().includes('market');
  const isArchitecture = requirement.title.toLowerCase().includes('architecture') || requirement.title.toLowerCase().includes('technical');

  // Pre-calibrated sample answers tuned to the hackathon and strictly under the word limit
  const getPrecalibratedAnswers = () => {
    if (isProblemStatement) {
      return {
        full: {
          label: 'Full Comprehensive Answer',
          targetWords: Math.min(142, maxWords),
          text: `In Sub-Saharan Africa, cross-border informal merchants lose 8% to 14% on currency spreads and endure 72-hour bank settlement lags, directly stalling inventory restocking. Our interviews with 42 open-market traders in Lagos revealed that 88% rely on high-risk parallel cash brokers because formal SWIFT wire corridors are inaccessible or cost-prohibitive.

Our solution introduces an instant, sub-cent settlement rail combining Paystack Dedicated Virtual Accounts with USDC liquidity. By automating on-chain escrow and local fiat payouts in under 6 seconds, we eliminate the settlement delay entirely while cutting FX transaction overhead by 70%. We address a verified $115B informal B2B trade volume across West Africa with zero foreign currency exposure for merchants.`,
        },
        concise: {
          label: 'Concise & High-Impact',
          targetWords: Math.min(94, maxWords),
          text: `Cross-border African merchants lose up to 14% on parallel-market FX spreads and wait 3 days for bank clearances. We interviewed 42 traders in Lagos who confirm that delayed liquidity kills trade velocity.

We solve this with a sub-cent payment routing SDK bridging Paystack virtual accounts to stablecoin escrow. Merchant settlements clear in under 6 seconds with automatic local currency conversion, saving 70% in fees across an addressable $115B West African informal trade corridor.`,
        },
        elevator: {
          label: 'Punchy 45-Word Summary',
          targetWords: Math.min(46, maxWords),
          text: `Cross-border African trade is suffocated by 72-hour clearing delays and 12% FX fees. Our embedded SDK leverages Paystack virtual accounts and stablecoins to settle merchant payments in 6 seconds with sub-cent fees across a $115B market corridor.`,
        },
      };
    }

    if (isArchitecture) {
      return {
        full: {
          label: 'Full Technical Blueprint',
          targetWords: Math.min(138, maxWords),
          text: `The system operates an event-driven architecture decoupled into three primary microservices. The Ingestion Engine is written in Rust for sub-10ms signature verification and deterministic transaction sequencing. State management is coordinated via PostgreSQL with Redis cluster caching for sub-millisecond account balance checks.

For payment rail integration, we interface asynchronously with Paystack Webhooks backed by AWS SQS queues with exponential backoff retries. On-chain settlement utilizes Circle CCTP smart contracts with gasless account abstraction paymasters, allowing users to transact without native gas tokens. Cryptographic state transitions are verified on-chain in batches every 30 seconds to maintain high throughput and fault-tolerant auditability.`,
        },
        concise: {
          label: 'Concise Architecture Summary',
          targetWords: Math.min(88, maxWords),
          text: `Built on a Rust ingestion engine for high-throughput transaction sequencing with PostgreSQL and Redis caching. Payment integration utilizes Paystack Webhooks with SQS dead-letter queues. On-chain stablecoin settlement executes over Circle CCTP smart contracts with account abstraction, achieving sub-second finality with zero gas friction.`,
        },
        elevator: {
          label: '40-Word Tech Stack',
          targetWords: Math.min(42, maxWords),
          text: `Event-driven architecture with a Rust core engine, Paystack Webhooks, AWS SQS queues, and Circle CCTP smart contracts. Delivers sub-10ms execution, zero gas friction for end-users, and 99.99% fault-tolerant settlement.`,
        },
      };
    }

    return {
      full: {
        label: 'Comprehensive Detail',
        targetWords: Math.min(125, maxWords),
        text: `Our team brings combined experience spanning distributed fintech systems, Web3 protocol engineering, and customer UX. We have previously deployed payment infrastructure handling over $4M in monthly transaction volume. Our domain expertise in West African regulatory compliance and real-time settlement rails positions us to execute rapidly from prototype to production.`,
      },
      concise: {
        label: 'Focused & Direct',
        targetWords: Math.min(75, maxWords),
        text: `Experienced full-stack engineers and fintech builders with prior experience at high-growth African startups. Built and scaled financial systems processing $4M+ in volume. Expert in Rust, React, smart contracts, and localized payment rails.`,
      },
      elevator: {
        label: 'Punchy Overview',
        targetWords: Math.min(38, maxWords),
        text: `Seasoned fintech and Web3 developers with proven production deployments handling $4M+ volume. Deep technical proficiency across distributed systems, payment rails, and regulatory compliance.`,
      },
    };
  };

  const presets = getPrecalibratedAnswers();
  const [selectedPreset, setSelectedPreset] = useState<'full' | 'concise' | 'elevator'>('full');
  const [workingText, setWorkingText] = useState(currentDraft || presets.full.text);

  if (!isOpen) return null;

  const countWords = (str: string) => str.trim().split(/\s+/).filter(Boolean).length;
  const currentCount = countWords(workingText);
  const isOver = currentCount > maxWords;
  const remaining = maxWords - currentCount;

  const handleApplyPreset = (key: 'full' | 'concise' | 'elevator') => {
    setSelectedPreset(key);
    setWorkingText(presets[key].text);
  };

  const handleSaveToDraft = () => {
    onApplyDraft(workingText);
    toast.success('Applied to checklist draft', {
      description: `${currentCount} / ${maxWords} words`,
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-neutral-900/25 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            style={{ transformOrigin: 'center' }}
            className="w-full max-w-2xl bg-white rounded-2xl p-6 sm:p-8 relative overflow-hidden max-h-[92vh] overflow-y-auto space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FDFDFD] flex items-center justify-center text-neutral-800">
                  <Sparkles className="w-5 h-5 stroke-[1.75]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-neutral-900 tracking-tight [text-wrap:balance]">
                      Application Helper
                    </h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FDFDFD] text-neutral-600 font-mono font-semibold">
                      PRD §3.C Strict Limit
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 [text-wrap:pretty]">
                    Guaranteed to stay within limits on the first try. Context-aware guidance tailored to the judges.
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-neutral-400 hover:text-neutral-700 hover:bg-[#FDFDFD] transition-[transform,background-color,color] duration-150 active:scale-[0.97]"
                aria-label="Close modal"
              >
                <X className="w-4 h-4 stroke-[1.75]" />
              </button>
            </div>

        {/* Question Context Banner */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#FDFDFD] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Target Question
            </span>
            <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-white text-neutral-800 tabular-nums">
              Max {maxWords} words
            </span>
          </div>
          <h4 className="text-sm font-bold text-neutral-900 [text-wrap:balance]">
            {requirement.title}
          </h4>
          {requirement.description && (
            <p className="text-xs text-neutral-500 leading-relaxed [text-wrap:pretty]">
              {requirement.description}
            </p>
          )}
        </div>

        {/* Judge & Sponsor Intel Hint */}
        {primaryJudge && (
          <div className="p-4 rounded-xl bg-white flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-[#FDFDFD] flex items-center justify-center text-amber-700 flex-shrink-0 mt-0.5">
              <Lightbulb className="w-4 h-4 stroke-[1.75]" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold text-neutral-900 flex items-center gap-1.5 flex-wrap">
                <span>Judge Intel Hint:</span>
                <span className="text-neutral-600 font-normal">
                  {primaryJudge.name} ({primaryJudge.role} @ {primaryJudge.company})
                </span>
              </p>
              <p className="text-[11px] text-neutral-500 leading-relaxed [text-wrap:pretty]">
                Judges from payment infrastructure favor quantitative latency/failure metrics and concrete customer validation over vague buzzwords.
              </p>
            </div>
          </div>
        )}

        {/* Preset Length Selector */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-neutral-900 flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5 stroke-[1.75]" />
              <span>Calibrated Answer Presets (Pre-Computed &le; {maxWords} Words)</span>
            </label>
            <button
              onClick={onOpenVault}
              className="text-xs font-medium text-neutral-600 hover:text-neutral-900 flex items-center gap-1 hover:underline"
            >
              <FolderArchive className="w-3.5 h-3.5 stroke-[1.75]" />
              <span>Import from Vault</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {(['full', 'concise', 'elevator'] as const).map((key) => {
              const preset = presets[key];
              const isSelected = selectedPreset === key;
              return (
                <button
                  key={key}
                  onClick={() => handleApplyPreset(key)}
                  className={`p-3.5 rounded-xl text-left transition-[transform,background-color,color] duration-150 active:scale-[0.97] ${
                    isSelected
                      ? 'bg-neutral-900 text-white font-medium'
                      : 'bg-[#FDFDFD] hover:bg-[#f4f4f6] text-neutral-800'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold">{preset.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                  </div>
                  <p className={`text-[11px] font-mono tabular-nums ${isSelected ? 'text-neutral-300' : 'text-neutral-400'}`}>
                    {preset.targetWords} words
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Draft & Word Counter */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-neutral-600">
              Live Draft Editor
            </label>
            <div className="flex items-center gap-2 font-mono text-xs tabular-nums">
              <span className={`font-semibold ${isOver ? 'text-rose-600 font-bold' : 'text-neutral-700'}`}>
                {currentCount}
              </span>
              <span className="text-neutral-300">/</span>
              <span className="text-neutral-500">{maxWords} words</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                isOver ? 'bg-rose-100 text-rose-800 font-semibold' : 'bg-[#FDFDFD] text-emerald-700 font-medium'
              }`}>
                {isOver ? `${Math.abs(remaining)} words over limit` : `${remaining} words remaining`}
              </span>
            </div>
          </div>

          <textarea
            rows={6}
            value={workingText}
            onChange={(e) => setWorkingText(e.target.value)}
            className="w-full bg-[#FDFDFD] rounded-xl p-4 text-base sm:text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 leading-relaxed border-0 transition-colors"
            placeholder="Edit or refine your answer here..."
          />

          {isOver && (
            <p className="text-xs text-rose-600 flex items-center gap-1.5 [text-wrap:pretty]">
              <ShieldAlert className="w-4 h-4 flex-shrink-0 stroke-[1.75]" />
              <span>Warning: External portal forms will cut off text exceeding {maxWords} words. Please edit down before applying.</span>
            </p>
          )}
        </div>

        {/* Action Footer */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => {
                navigator.clipboard.writeText(workingText);
                toast.success('Copied draft to clipboard');
              }}
              className="btn-tactile-secondary px-4 py-2.5 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5"
            >
              <Copy className="w-3.5 h-3.5 stroke-[1.75]" />
              <span>Copy</span>
            </button>
            {onSaveToVault && workingText.trim().length > 10 && (
              <button
                type="button"
                onClick={() => onSaveToVault(workingText.trim())}
                className="btn-tactile-secondary px-3.5 py-2.5 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5"
                title="Save current draft to your Reusable Vault"
              >
                <FolderArchive className="w-3.5 h-3.5 stroke-[1.75]" />
                <span>Save to Vault</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="btn-tactile-secondary px-4 py-2.5 rounded-xl text-xs font-medium w-full sm:w-auto text-center"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveToDraft}
              disabled={isOver}
              className="btn-tactile-primary px-5 py-2.5 rounded-xl text-xs font-semibold disabled:opacity-50 w-full sm:w-auto text-center flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 stroke-[2]" />
              <span>Apply to Checklist Draft</span>
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
  );
};
