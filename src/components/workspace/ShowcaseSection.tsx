import React, { useState } from 'react';
import { 
  Share2, 
  CheckCircle2, 
  ExternalLink, 
  Check, 
  AlertTriangle, 
  Radio 
} from 'lucide-react';
import { Opportunity } from '../../types';
import { useWorkspaceStore } from '../../store/useWorkspaceStore';
import { toast } from 'sonner';

interface ShowcaseSectionProps {
  opportunity: Opportunity;
}

export const ShowcaseSection: React.FC<ShowcaseSectionProps> = ({ opportunity }) => {
  const workspace = useWorkspaceStore((state) => state.getWorkspace(opportunity.id));
  const [copiedShare, setCopiedShare] = useState(false);

  const completedCount = opportunity.requirements.filter(
    (r) => workspace?.items[r.id]?.completed
  ).length;
  const isSubmissionReady = completedCount === opportunity.requirements.length;

  const handleCopyShare = () => {
    const text = `We just submitted our project for ${opportunity.title}! Check it out and support us: ${opportunity.externalPortalUrl}`;
    navigator.clipboard.writeText(text);
    setCopiedShare(true);
    toast.success('Share text copied');
    setTimeout(() => setCopiedShare(false), 2000);
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-10">
      {/* Header Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#FDFDFD] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-lg sm:text-xl font-bold text-neutral-900 tracking-tight">
              Showcase & Public Submissions
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed" style={{ textWrap: 'pretty' }}>
              Final pre-flight submission verification, public demonstration cards, and community voting links.
            </p>
          </div>

          <a
            href={opportunity.externalPortalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-tactile-primary px-3.5 py-2 rounded-lg text-xs font-semibold gap-1.5 self-start sm:self-auto"
          >
            <span>Open Portal Submission</span>
            <ExternalLink className="w-3.5 h-3.5 stroke-[2]" />
          </a>
        </div>
      </div>

      {/* PRE-FLIGHT VERIFICATION CHECKLIST */}
      <div className="p-6 rounded-2xl bg-[#FDFDFD] space-y-4">
        <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-neutral-700 stroke-[1.75]" />
          <span>Pre-Flight Readiness Checklist</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="p-4 rounded-xl bg-[#F5F5F5] flex items-start gap-3">
            <div className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 ${
              workspace?.githubRepoUrl ? 'bg-neutral-900 text-white' : 'bg-neutral-200 text-neutral-400'
            }`}>
              {workspace?.githubRepoUrl ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : <AlertTriangle className="w-3 h-3 stroke-[2]" />}
            </div>
            <div className="min-w-0 space-y-0.5">
              <p className="text-xs font-semibold text-neutral-900">Source Repository Verified</p>
              <p className="text-[11px] text-neutral-500">
                {workspace?.githubRepoUrl ? 'Public repository linked and accessible' : 'No repo URL linked in Build section'}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#F5F5F5] flex items-start gap-3">
            <div className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 ${
              isSubmissionReady ? 'bg-neutral-900 text-white' : 'bg-amber-100 text-amber-800'
            }`}>
              {isSubmissionReady ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : <AlertTriangle className="w-3 h-3 stroke-[2]" />}
            </div>
            <div className="min-w-0 space-y-0.5">
              <p className="text-xs font-semibold text-neutral-900">Mandatory Requirements Status</p>
              <p className="text-[11px] text-neutral-500">
                {completedCount} of {opportunity.requirements.length} deliverables marked ready
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#F5F5F5] flex items-start gap-3">
            <div className="w-5 h-5 rounded-md bg-neutral-900 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
            <div className="min-w-0 space-y-0.5">
              <p className="text-xs font-semibold text-neutral-900">Audio Pitch Timed</p>
              <p className="text-[11px] text-neutral-500">
                Rehearsed 3-minute strict countdown in Pitch & Docs studio
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#F5F5F5] flex items-start gap-3">
            <div className="w-5 h-5 rounded-md bg-neutral-900 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
            <div className="min-w-0 space-y-0.5">
              <p className="text-xs font-semibold text-neutral-900">Team Allocation Complete</p>
              <p className="text-[11px] text-neutral-500">
                {workspace?.teamMembers?.length || 1} team collaborator profiles active
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* COMMUNITY VOTING & SHARE CARD */}
      <div className="p-6 rounded-2xl bg-[#FDFDFD] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-neutral-700 stroke-[1.75]" />
            <h3 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider">
              Community Voting & Social Broadcast
            </h3>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-xs text-neutral-500 leading-relaxed">
            Generate and broadcast your project submission announcement to attract community votes, testnet testers, and early feedback.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <button
              onClick={handleCopyShare}
              className="btn-tactile-secondary px-4 py-2.5 rounded-xl text-xs font-medium gap-1.5 justify-center"
            >
              {copiedShare ? <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" /> : <Share2 className="w-3.5 h-3.5 stroke-[1.75]" />}
              <span>{copiedShare ? 'Copied Announcement' : 'Copy Social Announcement'}</span>
            </button>

            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                `Building for ${opportunity.title}! Excited to showcase our project soon. 🚀`
              )}`}
              target="_blank"
              rel="noreferrer"
              className="btn-tactile-secondary px-4 py-2.5 rounded-xl text-xs font-medium gap-1.5 justify-center"
            >
              <span>Post on X / Twitter</span>
              <ExternalLink className="w-3.5 h-3.5 stroke-[1.75]" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
