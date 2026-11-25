import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Check,
  Copy,
  ShieldAlert,
  FolderArchive,
  Lightbulb,
  Sliders,
  CheckCircle2,
} from 'lucide-react';
import { ApplicationRequirement, Opportunity, Judge } from '../../types';
import { AccessibleModal } from '../ui/AccessibleModal';
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

  const isProblemStatement =
    requirement.title.toLowerCase().includes('problem') ||
    requirement.title.toLowerCase().includes('market');
  const isArchitecture =
    requirement.title.toLowerCase().includes('architecture') ||
    requirement.title.toLowerCase().includes('technical');

  const getPrecalibratedAnswers = () => {
    if (isProblemStatement) {
      return {
        full: {
          label: 'Comprehensive Draft',
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
          label: 'Concise Summary',
          targetWords: Math.min(88, maxWords),
          text: `Built on a Rust ingestion engine for high-throughput transaction sequencing with PostgreSQL and Redis caching. Payment integration utilizes Paystack Webhooks with SQS dead-letter queues. On-chain stablecoin settlement executes over Circle CCTP smart contracts with account abstraction, achieving sub-second finality with zero gas friction.`,
        },
        elevator: {
          label: '40-Word Stack',
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
    <AccessibleModal
      isOpen={isOpen}
      onClose={onClose}
      titleId="app-helper-title"
      descriptionId="app-helper-desc"
      maxWidthClass="max-w-2xl"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 pb-4 border-b border-neutral-200/70">
        <div className="flex items-center gap-3">
          <div
            aria-hidden="true"
            className="w-10 h-10 rounded-xl bg-[#EFE6FF] text-[#3B0764] flex items-center justify-center flex-shrink-0"
          >
            <Sparkles className="w-5 h-5 stroke-[1.75]" />
          </div>
          <div>
            <h2 id="app-helper-title" className="text-lg font-bold text-[#18181B] tracking-tight">
              Draft Assistant
            </h2>
            <p id="app-helper-desc" className="text-xs text-[#52525B]">
              Pre-sized answer templates calibrated to the {maxWords}-word limit and evaluator priorities.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-9 h-9 rounded-xl btn-tactile-ghost flex items-center justify-center flex-shrink-0"
          aria-label="Close Draft Assistant dialog"
        >
          <X aria-hidden="true" className="w-4 h-4 stroke-[1.75]" />
        </button>
      </div>

      <div className="space-y-5 pt-4">
        {/* Question Context Banner */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#F4F4F6] space-y-2">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="text-xs font-medium text-[#63636B]">
              Target Question
            </span>
            <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-md bg-white shadow-[0_0_0_1px_oklch(0_0_0/0.05)] text-[#18181B] tabular-nums">
              Max {maxWords} words
            </span>
          </div>
          <h3 className="text-sm font-semibold text-[#18181B]">
            {requirement.title}
          </h3>
          {requirement.description && (
            <p className="text-xs text-[#52525B] leading-relaxed">
              {requirement.description}
            </p>
          )}
        </div>

        {/* Judge Intel Hint */}
        {primaryJudge && (
          <div className="p-4 rounded-xl bg-[#FEF3C7]/60 flex items-start gap-3">
            <div
              aria-hidden="true"
              className="w-8 h-8 rounded-lg bg-[#FEF3C7] flex items-center justify-center text-[#92400E] flex-shrink-0"
            >
              <Lightbulb className="w-4 h-4 stroke-[2]" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold text-[#18181B] flex items-center gap-1.5 flex-wrap">
                <span>Evaluator note:</span>
                <span className="text-[#52525B] font-normal">
                  {primaryJudge.name} ({primaryJudge.role} at {primaryJudge.company})
                </span>
              </p>
              <p className="text-xs text-[#52525B] leading-relaxed">
                Infrastructure evaluators favor specific latency, fee, or customer validation metrics over broad claims.
              </p>
            </div>
          </div>
        )}

        {/* Preset Length Selector */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="text-xs font-semibold text-[#18181B] flex items-center gap-2">
              <Sliders aria-hidden="true" className="w-3.5 h-3.5 stroke-[1.75]" />
              <span>Calibrated presets (under {maxWords} words)</span>
            </span>
            <button
              type="button"
              onClick={onOpenVault}
              className="text-xs font-medium text-[#18181B] hover:underline flex items-center gap-1.5 py-1"
            >
              <FolderArchive aria-hidden="true" className="w-3.5 h-3.5 stroke-[1.75]" />
              <span>Insert from Vault</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {(['full', 'concise', 'elevator'] as const).map((key) => {
              const preset = presets[key];
              const isSelected = selectedPreset === key;
              return (
                <button
                  type="button"
                  key={key}
                  onClick={() => handleApplyPreset(key)}
                  aria-pressed={isSelected}
                  className={`p-3.5 rounded-xl text-start transition-[transform,background-color,color] duration-150 active:scale-[0.96] ${
                    isSelected ? 'btn-tactile-primary' : 'btn-tactile-secondary'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold">{preset.label}</span>
                    {isSelected && <Check aria-hidden="true" className="w-3.5 h-3.5 stroke-[2.5]" />}
                  </div>
                  <p className={`text-[11px] font-mono tabular-nums ${isSelected ? 'text-neutral-200' : 'text-[#52525B]'}`}>
                    {preset.targetWords} words
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Draft & Word Counter */}
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <label htmlFor="helper-draft-editor" className="text-xs font-medium text-[#52525B]">
              Draft editor
            </label>
            <div className="flex items-center gap-2 font-mono text-xs tabular-nums">
              <span className={`font-semibold ${isOver ? 'text-rose-700' : 'text-[#18181B]'}`}>
                {currentCount}
              </span>
              <span className="text-[#63636B]">/</span>
              <span className="text-[#52525B]">{maxWords} words</span>
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                  isOver ? 'bg-rose-100 text-rose-800' : 'bg-[#ECFDF5] text-[#065F46]'
                }`}
              >
                {isOver ? `${Math.abs(remaining)} words over limit` : `${remaining} remaining`}
              </span>
            </div>
          </div>

          <textarea
            id="helper-draft-editor"
            rows={6}
            value={workingText}
            onChange={(e) => setWorkingText(e.target.value)}
            className="field-surface w-full rounded-xl p-4 text-base sm:text-sm leading-relaxed"
            placeholder="Edit or refine your answer..."
          />

          {isOver && (
            <p role="alert" className="text-xs text-rose-700 font-medium flex items-center gap-1.5">
              <ShieldAlert aria-hidden="true" className="w-4 h-4 flex-shrink-0 stroke-[2]" />
              <span>
                External portal forms truncate text beyond {maxWords} words. Trim before applying.
              </span>
            </p>
          )}
        </div>

        {/* Action Footer */}
        <div className="pt-3 border-t border-neutral-200/70 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(workingText);
                toast.success('Copied draft');
              }}
              className="btn-tactile-secondary px-4 py-2 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 min-h-[38px]"
            >
              <Copy aria-hidden="true" className="w-3.5 h-3.5 stroke-[1.75]" />
              <span>Copy</span>
            </button>
            {onSaveToVault && workingText.trim().length > 10 && (
              <button
                type="button"
                onClick={() => onSaveToVault(workingText.trim())}
                className="btn-tactile-secondary px-4 py-2 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 min-h-[38px]"
              >
                <FolderArchive aria-hidden="true" className="w-3.5 h-3.5 stroke-[1.75]" />
                <span>Save to Vault</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="btn-tactile-secondary px-4 py-2 rounded-xl text-xs font-medium flex-1 sm:flex-none min-h-[40px]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveToDraft}
              disabled={isOver}
              className="btn-tactile-primary px-5 py-2 rounded-xl text-xs font-semibold disabled:opacity-50 flex-1 sm:flex-none flex items-center justify-center gap-2 min-h-[40px]"
            >
              <CheckCircle2 aria-hidden="true" className="w-4 h-4 stroke-[2]" />
              <span>Apply draft</span>
            </button>
          </div>
        </div>
      </div>
    </AccessibleModal>
  );
};
