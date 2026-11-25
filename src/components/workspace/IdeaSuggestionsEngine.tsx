import React from 'react';
import {
  Lightbulb,
  Check,
  ShieldCheck,
  Cpu,
  Target,
} from 'lucide-react';
import { Opportunity, ResearchedIdea } from '../../types';
import { useWorkspaceStore } from '../../store/useWorkspaceStore';
import { toast } from 'sonner';

interface IdeaSuggestionsEngineProps {
  opportunity: Opportunity;
  workspaceId: string;
}

export const IdeaSuggestionsEngine: React.FC<IdeaSuggestionsEngineProps> = ({
  opportunity,
  workspaceId,
}) => {
  const workspace = useWorkspaceStore((state) => state.getWorkspace(workspaceId));
  const selectWorkspaceIdea = useWorkspaceStore((state) => state.selectWorkspaceIdea);

  const selectedIdeaId = workspace?.selectedIdeaId;
  const ideas: ResearchedIdea[] = opportunity.researchedIdeas || [];

  const handleSelectIdea = (idea: ResearchedIdea) => {
    selectWorkspaceIdea(workspaceId, idea.id);
    toast.success('Selected active workspace concept', {
      description: idea.title,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="surface-card p-6 sm:p-8 rounded-2xl space-y-3">
        <div className="flex items-start gap-3">
          <div
            aria-hidden="true"
            className="w-10 h-10 rounded-xl bg-[#FEF3C7] text-[#92400E] flex items-center justify-center flex-shrink-0"
          >
            <Lightbulb className="w-5 h-5 stroke-[1.75]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#18181B] tracking-tight">
              Project Concept Directions
            </h2>
            <p className="text-xs sm:text-sm text-[#52525B] mt-0.5 max-w-[65ch]">
              Evaluated technical directions calibrated against {opportunity.sponsors.length} sponsor track{opportunity.sponsors.length === 1 ? '' : 's'} and real field friction.
            </p>
          </div>
        </div>
      </div>

      {/* Idea Cards */}
      <div className="space-y-5">
        {ideas.map((idea, idx) => {
          const isSelected = selectedIdeaId === idea.id;

          return (
            <article
              key={idea.id}
              className={`p-6 sm:p-8 rounded-2xl space-y-5 transition-colors duration-150 ${
                isSelected ? 'bg-[#F4EEFF]' : 'surface-card surface-card-interactive'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-md bg-[#F4F4F6] text-[#18181B]">
                      Concept #{idx + 1}
                    </span>
                    <span className="text-xs font-semibold text-[#92400E] bg-[#FEF3C7] px-2.5 py-0.5 rounded-md">
                      {idea.targetSponsorBounty}
                    </span>
                    <span className="text-xs text-[#52525B] font-medium">
                      Difficulty: {idea.difficulty}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-[#18181B]">
                    {idea.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#52525B]">
                    {idea.tagline}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleSelectIdea(idea)}
                  aria-pressed={isSelected}
                  className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 w-full sm:w-auto flex-shrink-0 min-h-[40px] ${
                    isSelected ? 'btn-tactile-primary' : 'btn-tactile-secondary'
                  }`}
                >
                  {isSelected ? (
                    <>
                      <Check aria-hidden="true" className="w-4 h-4 stroke-[2.5]" />
                      <span>Active workspace concept</span>
                    </>
                  ) : (
                    <span>Adopt this concept</span>
                  )}
                </button>
              </div>

              {/* Problem & Solution Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                <div className="p-4 rounded-xl bg-[#F4F4F6] space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-rose-800">
                    <Target aria-hidden="true" className="w-3.5 h-3.5 stroke-[2]" />
                    <span>Real-World Bottleneck Solved</span>
                  </div>
                  <p className="text-xs text-[#52525B] leading-relaxed">
                    {idea.problemStatement}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#F4F4F6] space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#065F46]">
                    <Cpu aria-hidden="true" className="w-3.5 h-3.5 stroke-[2]" />
                    <span>Engineered Solution</span>
                  </div>
                  <p className="text-xs text-[#52525B] leading-relaxed">
                    {idea.solution}
                  </p>
                </div>
              </div>

              {/* Differentiation Note */}
              <div className="p-4 rounded-xl bg-[#F4F4F6] flex items-start gap-3">
                <div
                  aria-hidden="true"
                  className="w-7 h-7 rounded-lg bg-[#ECFDF5] flex items-center justify-center text-[#065F46] flex-shrink-0 mt-0.5"
                >
                  <ShieldCheck className="w-4 h-4 stroke-[2]" />
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-[#18181B] block">
                    Why This Stands Out
                  </span>
                  <p className="text-xs text-[#52525B] leading-relaxed">
                    {idea.whyNotCliche}
                  </p>
                </div>
              </div>

              {/* Recommended Stack */}
              <div className="flex items-center gap-2 flex-wrap pt-1">
                <span className="text-xs font-medium text-[#52525B]">Target stack:</span>
                {idea.recommendedStack.map((tech) => (
                  <span
                    key={tech}
                    className="text-xs font-mono font-medium px-2.5 py-1 rounded-lg bg-[#F4F4F6] text-[#18181B]"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};
