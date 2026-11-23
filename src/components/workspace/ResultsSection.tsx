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
  MessageSquare
} from 'lucide-react';
import { Opportunity, ResultOutcome } from '../../types';
import { useWorkspaceStore } from '../../store/useWorkspaceStore';
import { toast } from 'sonner';

interface ResultsSectionProps {
  opportunity: Opportunity;
}

const OUTCOME_OPTIONS: { id: ResultOutcome; label: string; icon: any; color: string }[] = [
  { id: 'pending_review', label: 'Under Evaluation', icon: Clock, color: 'text-amber-700 bg-amber-50' },
  { id: 'shortlisted', label: 'Shortlisted / Interview', icon: FileCheck, color: 'text-blue-700 bg-blue-50' },
  { id: 'finalist', label: 'Selected as Finalist', icon: Sparkles, color: 'text-purple-700 bg-purple-50' },
  { id: 'winner', label: 'Won Hackathon Bounty / Prize', icon: Trophy, color: 'text-emerald-700 bg-emerald-50' },
  { id: 'grant_awarded', label: 'Grant Funding Approved', icon: Award, color: 'text-emerald-700 bg-emerald-50' },
  { id: 'not_selected', label: 'Not Selected', icon: XCircle, color: 'text-neutral-600 bg-neutral-100' },
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
    toast.success('Updated result status');
  };

  const handlePrizeBlur = () => {
    if (prizeWon !== workspace?.results?.prizeWon) {
      updateWorkspaceResults(opportunity.id, { prizeWon });
      toast.success('Saved prize details');
    }
  };

  const handleFeedbackBlur = () => {
    if (feedback !== workspace?.results?.feedbackNotes) {
      updateWorkspaceResults(opportunity.id, { feedbackNotes: feedback });
      toast.success('Saved judge feedback');
    }
  };

  const handleRetrospectiveBlur = () => {
    if (retrospective !== workspace?.results?.retrospective) {
      updateWorkspaceResults(opportunity.id, { retrospective });
      toast.success('Saved retrospective learnings');
    }
  };

  const isPositiveOutcome = outcome === 'winner' || outcome === 'grant_awarded' || outcome === 'finalist';

  return (
    <div className="space-y-6 sm:space-y-8 pb-10">
      {/* Header Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#FDFDFD] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-lg sm:text-xl font-bold text-neutral-900 tracking-tight">
              Results & Post-Participation Outcomes
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed" style={{ textWrap: 'pretty' }}>
              Track the outcome of your application, document evaluator critique, and log verified prizes or grant awards.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs font-mono font-bold text-neutral-950 tabular-nums px-3 py-1.5 rounded-lg bg-[#F5F5F5]">
              Prize Pool: {opportunity.prizePool}
            </span>
          </div>
        </div>
      </div>

      {/* OUTCOME STATUS PICKER */}
      <div className="p-6 rounded-2xl bg-[#FDFDFD] space-y-4">
        <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
          Current Decision Status
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {OUTCOME_OPTIONS.map((opt) => {
            const isSelected = outcome === opt.id;
            const Icon = opt.icon;

            return (
              <button
                key={opt.id}
                onClick={() => handleOutcomeChange(opt.id)}
                className={`p-4 rounded-xl flex items-center gap-3 transition-colors text-left active:scale-[0.97] ${
                  isSelected
                    ? 'bg-neutral-900 text-white font-semibold'
                    : 'bg-[#F5F5F5] hover:bg-[#EBEBEB] text-neutral-800'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  isSelected ? 'bg-white/20 text-white' : opt.color
                }`}>
                  <Icon className="w-4 h-4 stroke-[1.8]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold truncate">{opt.label}</p>
                </div>
                {isSelected && <Check className="w-4 h-4 text-white stroke-[2.5]" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* PRIZE OR CAPITAL WON (IF APPLICABLE) */}
      <div className={`p-6 rounded-2xl bg-[#FDFDFD] space-y-4 ${
        isPositiveOutcome ? 'ring-1 ring-emerald-500/20' : ''
      }`}>
        <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
          <DollarSign className="w-4 h-4 text-neutral-700 stroke-[1.75]" />
          <span>Award & Prize Allocation Details</span>
        </h3>

        <div className="space-y-2">
          <input
            type="text"
            value={prizeWon}
            onChange={(e) => setPrizeWon(e.target.value)}
            onBlur={handlePrizeBlur}
            placeholder="e.g. $15,000 USD 1st Place + Paystack Dedicated Bounty Track"
            className="w-full bg-[#F5F5F5] rounded-xl px-4 py-2.5 text-sm text-neutral-900 font-medium border-0 focus:outline-none focus:ring-1 focus:ring-neutral-900/10"
          />
          <p className="text-[11px] text-neutral-400">
            Recorded outcomes are saved locally and synced with your verified win statistics.
          </p>
        </div>
      </div>

      {/* EVALUATOR FEEDBACK & RETROSPECTIVE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-[#FDFDFD] space-y-3">
          <h4 className="text-xs font-semibold text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 stroke-[1.75]" />
            <span>Judge & Evaluator Feedback</span>
          </h4>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            onBlur={handleFeedbackBlur}
            rows={5}
            placeholder="Log specific feedback received during presentation, review scoring, or email responses..."
            className="w-full bg-[#F5F5F5] rounded-xl p-3.5 text-xs text-neutral-900 leading-relaxed border-0 focus:outline-none focus:ring-1 focus:ring-neutral-900/10"
          />
        </div>

        <div className="p-6 rounded-2xl bg-[#FDFDFD] space-y-3">
          <h4 className="text-xs font-semibold text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 stroke-[1.75]" />
            <span>Team Retrospective & Learnings</span>
          </h4>
          <textarea
            value={retrospective}
            onChange={(e) => setRetrospective(e.target.value)}
            onBlur={handleRetrospectiveBlur}
            rows={5}
            placeholder="What worked well? What technical bottlenecks slowed us down? What will we do differently next time?"
            className="w-full bg-[#F5F5F5] rounded-xl p-3.5 text-xs text-neutral-900 leading-relaxed border-0 focus:outline-none focus:ring-1 focus:ring-neutral-900/10"
          />
        </div>
      </div>
    </div>
  );
};
