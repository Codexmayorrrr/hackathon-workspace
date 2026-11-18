import React from 'react';
import { 
  Lightbulb, 
  Check, 
  ShieldCheck, 
  Cpu, 
  Target
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
    toast.success('Idea selected for workspace', {
      description: idea.title,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#FDFDFD] space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-amber-600">
            <Lightbulb className="w-5 h-5 stroke-[1.75]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-neutral-900 tracking-tight [text-wrap:balance]">
                Curated Idea Suggestions & R&D
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white text-neutral-700 font-mono font-semibold">
                PRD §3.E Anti-Cliché
              </span>
            </div>
            <p className="text-xs text-neutral-500 [text-wrap:pretty]">
              Avoid overused concepts. Well-researched project architectures specifically tuned to {opportunity.sponsors.length} sponsor bounty tracks.
            </p>
          </div>
        </div>
      </div>

      {/* Idea Cards */}
      <div className="space-y-5">
        {ideas.map((idea, idx) => {
          const isSelected = selectedIdeaId === idea.id;

          return (
            <div
              key={idea.id}
              className={`p-6 sm:p-8 rounded-2xl transition-[transform,background-color] duration-150 space-y-5 ${
                isSelected
                  ? 'bg-[#FDFDFD] ring-2 ring-neutral-900'
                  : 'bg-[#FDFDFD] hover:bg-[#f9f9fa]'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-white text-neutral-800">
                      Concept #{idx + 1}
                    </span>
                    <span className="text-neutral-300">·</span>
                    <span className="text-xs font-medium text-amber-800 bg-amber-50/80 px-2.5 py-0.5 rounded-full">
                      {idea.targetSponsorBounty}
                    </span>
                    <span className="text-neutral-300">·</span>
                    <span className="text-xs text-neutral-500">
                      Difficulty: {idea.difficulty}
                    </span>
                  </div>

                  <h4 className="text-base sm:text-lg font-bold text-neutral-900 [text-wrap:balance]">
                    {idea.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-neutral-600 [text-wrap:pretty]">
                    {idea.tagline}
                  </p>
                </div>

                <button
                  onClick={() => handleSelectIdea(idea)}
                  className={`px-4.5 py-2.5 rounded-xl text-xs font-semibold transition-[transform,background-color,color] duration-150 active:scale-[0.97] flex items-center justify-center gap-1.5 w-full sm:w-auto text-center flex-shrink-0 ${
                    isSelected
                      ? 'btn-tactile-primary text-white'
                      : 'bg-white hover:bg-neutral-50 text-neutral-800'
                  }`}
                >
                  {isSelected ? (
                    <>
                      <Check className="w-4 h-4 stroke-[2.5]" />
                      <span>Active Workspace Idea</span>
                    </>
                  ) : (
                    <span>Adopt This Idea</span>
                  )}
                </button>
              </div>

              {/* Problem & Solution Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                <div className="p-4 rounded-xl bg-white space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-rose-800">
                    <Target className="w-3.5 h-3.5 stroke-[2]" />
                    <span>Real-World Bottleneck Solved</span>
                  </div>
                  <p className="text-xs text-neutral-600 leading-relaxed [text-wrap:pretty]">
                    {idea.problemStatement}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800">
                    <Cpu className="w-3.5 h-3.5 stroke-[2]" />
                    <span>Engineered Solution</span>
                  </div>
                  <p className="text-xs text-neutral-600 leading-relaxed [text-wrap:pretty]">
                    {idea.solution}
                  </p>
                </div>
              </div>

              {/* Anti-Cliché Guarantee (Abimbola's core demand) */}
              <div className="p-4 rounded-xl bg-white flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-[#FDFDFD] flex items-center justify-center text-emerald-700 flex-shrink-0 mt-0.5">
                  <ShieldCheck className="w-4 h-4 stroke-[2]" />
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-neutral-900 block">
                    Why This Beats Generic Hackathon Submissions
                  </span>
                  <p className="text-xs text-neutral-500 leading-relaxed [text-wrap:pretty]">
                    {idea.whyNotCliche}
                  </p>
                </div>
              </div>

              {/* Recommended Stack */}
              <div className="flex items-center gap-2 flex-wrap pt-1">
                <span className="text-xs font-medium text-neutral-400">Target Stack:</span>
                {idea.recommendedStack.map((tech) => (
                  <span
                    key={tech}
                    className="text-xs font-mono font-medium px-2.5 py-1 rounded-lg bg-white text-neutral-700"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
