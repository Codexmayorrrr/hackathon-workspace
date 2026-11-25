import React, { useState } from 'react';
import {
  Trophy,
  Check,
  Clock,
  Award,
  FileCheck,
  XCircle,
  Sparkles,
  DollarSign,
  MessageSquare,
} from 'lucide-react';
import { Opportunity, ResultOutcome } from '../../types';
import { useWorkspaceStore } from '../../store/useWorkspaceStore';
import { toast } from 'sonner';

interface ResultsSectionProps {
  opportunity: Opportunity;
}

const OUTCOME_OPTIONS: { id: ResultOutcome; label: string; icon: any; color: string }[] = [
  { id: 'pending_review', label: 'Under Evaluation', icon: Clock, color: 'text-[#92400E] bg-[#FEF3C7]' },
  { id: 'shortlisted', label: 'Shortlisted / Interview', icon: FileCheck, color: 'text-[#3730A3] bg-[#EEF2FF]' },
  { id: 'finalist', label: 'Selected as Finalist', icon: Sparkles, color: 'text-[#3B0764] bg-[#EFE6FF]' },
  { id: 'winner', label: 'Won Hackathon Bounty / Prize', icon: Trophy, color: 'text-[#065F46] bg-[#ECFDF5]' },
  { id: 'grant_awarded', label: 'Grant Funding Approved', icon: Award, color: 'text-[#065F46] bg-[#ECFDF5]' },
  { id: 'not_selected', label: 'Not Selected', icon: XCircle, color: 'text-[#52525B] bg-white' },
];

export const ResultsSection: React.FC<ResultsSectionProps> = ({ opportunity }) => {
  const workspace = useWorkspaceStore((state) => state.getWorkspace(opportunity.id));
  const updateWorkspaceResults = useWorkspaceStore((state) => state.updateWorkspaceResults);

  const initialOutcome = workspace?.results?.outcome || 'pending_review';
  const [outcome, setOutcome] = useState<ResultOutcome>(initialOutcome);
  const [prizeWon, setPrizeWon] = useState(workspace?.results?.prizeWon || '');
  const [feedback, setFeedback] = useState(workspace?.results?.feedbackNotes || '');
  const [retrospective, setRetrospective] = useState(workspace?.results?.retrospective || '');

  const handleOutcomeChange = (newOutcome: ResultOutcome) => {
    setOutcome(newOutcome);
    updateWorkspaceResults(opportunity.id, { outcome: newOutcome });
    toast.success('Result status updated');
  };

  const handlePrizeBlur = () => {
    if (prizeWon !== workspace?.results?.prizeWon) {
      updateWorkspaceResults(opportunity.id, { prizeWon });
      toast.success('Award details saved');
    }
  };

  const handleFeedbackBlur = () => {
    if (feedback !== workspace?.results?.feedbackNotes) {
      updateWorkspaceResults(opportunity.id, { feedbackNotes: feedback });
      toast.success('Evaluator feedback saved');
    }
  };

  const handleRetrospectiveBlur = () => {
    if (retrospective !== workspace?.results?.retrospective) {
      updateWorkspaceResults(opportunity.id, { retrospective });
      toast.success('Retrospective notes saved');
    }
  };

  const isPositiveOutcome =
    outcome === 'winner' || outcome === 'grant_awarded' || outcome === 'finalist';

  return (
    <div className="space-y-6 sm:space-y-8 pb-10">
      {/* Header Card */}
      <div className="surface-card p-6 sm:p-8 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-lg sm:text-xl font-bold text-[#18181B] tracking-tight">
              Results & Outcomes
            </h2>
            <p className="text-xs sm:text-sm text-[#52525B] leading-relaxed">
              Log your final decision status, evaluator critique, and confirmed prizes or grant capital.
            </p>
          </div>

          <div className="flex items-center self-start sm:self-auto flex-shrink-0">
            <span className="text-xs font-mono font-semibold text-[#18181B] tabular-nums px-3.5 py-2 rounded-xl bg-[#F4F4F6] whitespace-nowrap">
              Prize pool: {opportunity.prizePool}
            </span>
          </div>
        </div>
      </div>

      {/* OUTCOME STATUS PICKER */}
      <div className="surface-card p-6 rounded-2xl space-y-4">
        <h3 className="text-base font-semibold text-[#18181B]">
          Current Decision Status
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3" role="group" aria-label="Decision status">
          {OUTCOME_OPTIONS.map((opt) => {
            const isSelected = outcome === opt.id;
            const Icon = opt.icon;

            return (
              <button
                type="button"
                key={opt.id}
                onClick={() => handleOutcomeChange(opt.id)}
                aria-pressed={isSelected}
                className={`p-4 rounded-xl flex items-center gap-3 transition-[transform,background-color,color] duration-150 text-start active:scale-[0.97] ${
                  isSelected
                    ? 'bg-[#18181B] text-white font-semibold'
                    : 'bg-[#F4F4F6] hover:bg-[#EBECEF] text-[#18181B]'
                }`}
              >
                <div
                  aria-hidden="true"
                  className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    isSelected ? 'bg-white/20 text-white' : opt.color
                  }`}
                >
                  <Icon className="w-4 h-4 stroke-[2]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold truncate">{opt.label}</p>
                </div>
                {isSelected && <Check aria-hidden="true" className="w-4 h-4 text-white stroke-[2.5] flex-shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* PRIZE OR CAPITAL WON */}
      <div
        className={`surface-card p-6 rounded-2xl space-y-3 ${
          isPositiveOutcome ? 'ring-2 ring-emerald-700/25' : ''
        }`}
      >
        <label
          htmlFor="results-prize-input"
          className="text-base font-semibold text-[#18181B] flex items-center gap-1.5"
        >
          <DollarSign aria-hidden="true" className="w-4 h-4 text-[#52525B] stroke-[1.75]" />
          <span>Award & Prize Details</span>
        </label>

        <div className="space-y-2">
          <input
            id="results-prize-input"
            type="text"
            value={prizeWon}
            onChange={(e) => setPrizeWon(e.target.value)}
            onBlur={handlePrizeBlur}
            placeholder="e.g. $15,000 USD 1st Place + Paystack Dedicated Bounty Track"
            className="field-surface w-full rounded-xl px-4 py-2.5 text-base sm:text-sm font-medium"
          />
          <p className="text-xs text-[#52525B]">
            Recorded outcomes are saved locally to this opportunity workspace.
          </p>
        </div>
      </div>

      {/* EVALUATOR FEEDBACK & RETROSPECTIVE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="surface-card p-6 rounded-2xl space-y-3">
          <label
            htmlFor="results-feedback-textarea"
            className="text-sm font-semibold text-[#18181B] flex items-center gap-1.5"
          >
            <MessageSquare aria-hidden="true" className="w-4 h-4 text-[#52525B] stroke-[1.75]" />
            <span>Judge & Evaluator Feedback</span>
          </label>
          <textarea
            id="results-feedback-textarea"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            onBlur={handleFeedbackBlur}
            rows={5}
            placeholder="Log specific feedback received during Q&A, review scoring, or email responses..."
            className="field-surface w-full rounded-xl p-3.5 text-base sm:text-xs leading-relaxed"
          />
        </div>

        <div className="surface-card p-6 rounded-2xl space-y-3">
          <label
            htmlFor="results-retrospective-textarea"
            className="text-sm font-semibold text-[#18181B] flex items-center gap-1.5"
          >
            <Sparkles aria-hidden="true" className="w-4 h-4 text-[#52525B] stroke-[1.75]" />
            <span>Team Retrospective & Learnings</span>
          </label>
          <textarea
            id="results-retrospective-textarea"
            value={retrospective}
            onChange={(e) => setRetrospective(e.target.value)}
            onBlur={handleRetrospectiveBlur}
            rows={5}
            placeholder="What worked well? What technical bottlenecks slowed delivery?"
            className="field-surface w-full rounded-xl p-3.5 text-base sm:text-xs leading-relaxed"
          />
        </div>
      </div>
    </div>
  );
};
