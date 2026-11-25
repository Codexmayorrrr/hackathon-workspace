import React, { useState } from 'react';
import {
  Github,
  ExternalLink,
  Video,
  Layers,
  Check,
  Play,
} from 'lucide-react';
import { Opportunity } from '../../types';
import { useWorkspaceStore } from '../../store/useWorkspaceStore';
import { DemoVideoStudio } from '../pitch/DemoVideoStudio';
import { toast } from 'sonner';

interface BuildSectionProps {
  opportunity: Opportunity;
}

const COMMON_TECH_STACK = [
  'TypeScript',
  'React',
  'Rust',
  'Node.js',
  'Python',
  'Solidity',
  'PostgreSQL',
  'Redis',
  'GraphQL',
  'Docker',
  'Tailwind CSS',
  'Next.js',
  'FastAPI',
  'Wasm',
];

export const BuildSection: React.FC<BuildSectionProps> = ({ opportunity }) => {
  const workspace = useWorkspaceStore((state) => state.getWorkspace(opportunity.id));
  const updateWorkspaceRepo = useWorkspaceStore((state) => state.updateWorkspaceRepo);
  const updateWorkspaceTechStack = useWorkspaceStore((state) => state.updateWorkspaceTechStack);

  const [repoUrl, setRepoUrl] = useState(workspace?.githubRepoUrl || '');
  const [selectedStack, setSelectedStack] = useState<string[]>(
    workspace?.techStack || ['TypeScript', 'React', 'Node.js']
  );
  const [customTech, setCustomTech] = useState('');
  const [showVideoStudio, setShowVideoStudio] = useState(false);

  const handleRepoBlur = () => {
    if (repoUrl !== workspace?.githubRepoUrl) {
      updateWorkspaceRepo(opportunity.id, repoUrl);
      toast.success('GitHub repository updated');
    }
  };

  const toggleTech = (tech: string) => {
    const next = selectedStack.includes(tech)
      ? selectedStack.filter((t) => t !== tech)
      : [...selectedStack, tech];
    setSelectedStack(next);
    updateWorkspaceTechStack(opportunity.id, next);
  };

  const handleAddCustomTech = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTech.trim()) return;
    const item = customTech.trim();
    if (!selectedStack.includes(item)) {
      const next = [...selectedStack, item];
      setSelectedStack(next);
      updateWorkspaceTechStack(opportunity.id, next);
      toast.success(`Added ${item} to tech stack`);
    }
    setCustomTech('');
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-10">
      {/* Header Card */}
      <div className="surface-card p-6 sm:p-8 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-lg sm:text-xl font-bold text-[#18181B] tracking-tight">
              Build & Technical Development
            </h2>
            <p className="text-xs sm:text-sm text-[#52525B] leading-relaxed">
              Connect your codebase repository, define your technology stack, and prepare your walkthrough demo.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowVideoStudio(!showVideoStudio)}
            aria-expanded={showVideoStudio}
            className="btn-tactile-primary px-4 py-2 rounded-xl text-xs font-semibold gap-1.5 self-start sm:self-auto min-h-[38px]"
          >
            <Video aria-hidden="true" className="w-4 h-4 stroke-[2]" />
            <span>{showVideoStudio ? 'Hide video studio' : 'Demo video studio'}</span>
          </button>
        </div>
      </div>

      {/* GITHUB REPO INTEGRATION CARD */}
      <div className="surface-card p-6 rounded-2xl space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Github aria-hidden="true" className="w-4 h-4 text-[#18181B] stroke-[1.75]" />
            <h3 className="text-base font-semibold text-[#18181B]">
              Connected Source Repository
            </h3>
          </div>
          {repoUrl && (
            <span className="inline-flex items-center gap-1.5 text-xs bg-[#ECFDF5] text-[#065F46] px-2.5 py-0.5 rounded-md font-semibold">
              <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full bg-emerald-700" />
              <span>Linked</span>
            </span>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="workspace-repo-url" className="text-xs font-medium text-[#52525B] block">
            Public Git repository URL
          </label>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <input
              id="workspace-repo-url"
              type="url"
              inputMode="url"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              enterKeyHint="done"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              onBlur={handleRepoBlur}
              placeholder="https://github.com/organization/project-name"
              className="field-surface flex-1 rounded-xl px-4 py-2.5 text-base sm:text-sm font-mono"
            />
            {repoUrl && (
              <a
                href={repoUrl}
                target="_blank"
                rel="noreferrer"
                className="btn-tactile-secondary px-4 py-2.5 rounded-xl text-xs font-medium gap-1.5 justify-center min-h-[40px]"
              >
                <span>View on GitHub</span>
                <ExternalLink aria-hidden="true" className="w-3.5 h-3.5 stroke-[1.75]" />
              </a>
            )}
          </div>
          <p className="text-xs text-[#52525B]">
            Evaluators check repository structure, commit history, setup README, and license clarity.
          </p>
        </div>
      </div>

      {/* TECH STACK SELECTOR */}
      <div className="surface-card p-6 rounded-2xl space-y-4">
        <div className="flex items-center gap-2">
          <Layers aria-hidden="true" className="w-4 h-4 text-[#18181B] stroke-[1.75]" />
          <h3 className="text-base font-semibold text-[#18181B]">
            Architecture & Tech Stack
          </h3>
        </div>

        <div className="space-y-3">
          <p className="text-xs text-[#52525B]">
            Select technologies powering this build to synchronize generated slides and proposals.
          </p>

          <div className="flex flex-wrap gap-2" role="group" aria-label="Select project technologies">
            {COMMON_TECH_STACK.map((tech) => {
              const isSelected = selectedStack.includes(tech);
              return (
                <button
                  type="button"
                  key={tech}
                  onClick={() => toggleTech(tech)}
                  aria-pressed={isSelected}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 min-h-[34px] ${
                    isSelected ? 'btn-tactile-primary font-semibold' : 'btn-tactile-secondary'
                  }`}
                >
                  {isSelected && <Check aria-hidden="true" className="w-3.5 h-3.5 stroke-[2.25]" />}
                  <span>{tech}</span>
                </button>
              );
            })}
          </div>

          <form onSubmit={handleAddCustomTech} className="flex items-center gap-2 max-w-sm pt-2">
            <label htmlFor="workspace-custom-tech" className="sr-only">
              Add another library or protocol
            </label>
            <input
              id="workspace-custom-tech"
              type="text"
              enterKeyHint="done"
              autoCapitalize="none"
              autoCorrect="off"
              value={customTech}
              onChange={(e) => setCustomTech(e.target.value)}
              placeholder="Add custom library or protocol..."
              className="field-surface flex-1 rounded-xl px-3.5 py-2 text-base sm:text-xs"
            />
            <button
              type="submit"
              disabled={!customTech.trim()}
              className="btn-tactile-secondary px-4 py-2 rounded-xl text-xs font-medium disabled:opacity-40 min-h-[36px]"
            >
              Add
            </button>
          </form>
        </div>
      </div>

      {/* DEMO VIDEO CALLOUT & STUDIO EMBED */}
      <div className="surface-card p-6 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-[#18181B] flex items-center gap-2">
              <Play aria-hidden="true" className="w-4 h-4 text-[#52525B] stroke-[1.75]" />
              <span>Walkthrough Video Studio</span>
            </h3>
            <p className="text-xs text-[#52525B]">
              Plan and storyboard an uncut product demo showing live system execution.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowVideoStudio(!showVideoStudio)}
            aria-expanded={showVideoStudio}
            className="btn-tactile-secondary px-4 py-2 rounded-xl text-xs font-medium gap-1.5 self-start sm:self-auto min-h-[38px]"
          >
            <span>{showVideoStudio ? 'Hide video studio' : 'Open video studio'}</span>
          </button>
        </div>

        {showVideoStudio && (
          <div className="pt-4 border-t border-neutral-200/70">
            <DemoVideoStudio
              workspaceId={opportunity.id}
              opportunity={opportunity}
            />
          </div>
        )}
      </div>
    </div>
  );
};
