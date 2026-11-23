import React, { useState } from 'react';
import { 
  Github, 
  ExternalLink, 
  Video, 
  Layers, 
  Check, 
  Play
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
      <div className="p-6 sm:p-8 rounded-2xl bg-[#FDFDFD] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-lg sm:text-xl font-bold text-neutral-900 tracking-tight">
              Build & Technical Development
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed" style={{ textWrap: 'pretty' }}>
              Connect your codebase repository, define your technology stack, and record your walkthrough demo.
            </p>
          </div>

          <button
            onClick={() => setShowVideoStudio(!showVideoStudio)}
            className="btn-tactile-primary px-3.5 py-2 rounded-lg text-xs font-semibold gap-1.5 self-start sm:self-auto"
          >
            <Video className="w-3.5 h-3.5 stroke-[2]" />
            <span>{showVideoStudio ? 'Hide Studio' : 'Demo Video Studio'}</span>
          </button>
        </div>
      </div>

      {/* GITHUB REPO INTEGRATION CARD */}
      <div className="p-6 rounded-2xl bg-[#FDFDFD] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Github className="w-4 h-4 text-neutral-900 stroke-[1.75]" />
            <h3 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider">
              Connected Source Repository
            </h3>
          </div>
          {repoUrl && (
            <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Linked</span>
            </span>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-xs text-neutral-500">Public Git Repository Link</label>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <input
              type="url"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              onBlur={handleRepoBlur}
              placeholder="https://github.com/organization/project-name"
              className="flex-1 bg-[#F5F5F5] rounded-xl px-4 py-2.5 text-sm text-neutral-900 font-mono border-0 focus:outline-none focus:ring-1 focus:ring-neutral-900/10"
            />
            {repoUrl && (
              <a
                href={repoUrl}
                target="_blank"
                rel="noreferrer"
                className="btn-tactile-secondary px-4 py-2.5 rounded-xl text-xs font-medium gap-1.5 justify-center"
              >
                <span>View on GitHub</span>
                <ExternalLink className="w-3.5 h-3.5 stroke-[1.75]" />
              </a>
            )}
          </div>
          <p className="text-[11px] text-neutral-400">
            Judges and reviewers evaluate repository structure, clean commits, comprehensive README documentation, and open-source licenses.
          </p>
        </div>
      </div>

      {/* TECH STACK SELECTOR */}
      <div className="p-6 rounded-2xl bg-[#FDFDFD] space-y-4">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-neutral-900 stroke-[1.75]" />
          <h3 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider">
            Architecture & Tech Stack
          </h3>
        </div>

        <div className="space-y-3">
          <p className="text-xs text-neutral-500">
            Select the technologies powering this build. These are referenced during slide generation and proposal drafting.
          </p>

          <div className="flex flex-wrap gap-2">
            {COMMON_TECH_STACK.map((tech) => {
              const isSelected = selectedStack.includes(tech);
              return (
                <button
                  key={tech}
                  onClick={() => toggleTech(tech)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors active:scale-[0.97] flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-neutral-900 text-white font-semibold'
                      : 'bg-[#F5F5F5] text-neutral-600 hover:text-neutral-900 hover:bg-[#EBEBEB]'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                  <span>{tech}</span>
                </button>
              );
            })}
          </div>

          <form onSubmit={handleAddCustomTech} className="flex items-center gap-2 max-w-sm pt-2">
            <input
              type="text"
              value={customTech}
              onChange={(e) => setCustomTech(e.target.value)}
              placeholder="Add other library / protocol..."
              className="flex-1 bg-[#F5F5F5] rounded-lg px-3 py-1.5 text-xs text-neutral-900 border-0 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!customTech.trim()}
              className="btn-tactile-secondary px-3 py-1.5 rounded-lg text-xs font-medium disabled:opacity-40"
            >
              Add
            </button>
          </form>
        </div>
      </div>

      {/* DEMO VIDEO CALLOUT & STUDIO EMBED */}
      <div className="p-6 rounded-2xl bg-[#FDFDFD] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-neutral-950 flex items-center gap-2">
              <Play className="w-4 h-4 text-neutral-600 stroke-[1.75]" />
              <span>Walkthrough Video Studio</span>
            </h4>
            <p className="text-xs text-neutral-500">
              Record or upload an uncut walkthrough video showing live transaction processing.
            </p>
          </div>

          <button
            onClick={() => setShowVideoStudio(!showVideoStudio)}
            className="btn-tactile-secondary px-4 py-2 rounded-lg text-xs font-medium gap-1.5 self-start sm:self-auto"
          >
            <span>{showVideoStudio ? 'Collapse Studio' : 'Open Video Studio'}</span>
          </button>
        </div>

        {showVideoStudio && (
          <div className="pt-4 border-t border-neutral-100">
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
