import React, { useState } from 'react';
import {
  Share2,
  CheckCircle2,
  ExternalLink,
  Check,
  AlertTriangle,
  Radio,
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
    const text = `We just submitted our project for ${opportunity.title}. Check it out: ${opportunity.externalPortalUrl}`;
    navigator.clipboard.writeText(text);
    setCopiedShare(true);
    toast.success('Share text copied');
    setTimeout(() => setCopiedShare(false), 2000);
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-10">
      {/* Header Card */}
      <div className="surface-card p-6 sm:p-8 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-lg sm:text-xl font-bold text-[#18181B] tracking-tight">
              Showcase & Public Submissions
            </h2>
            <p className="text-xs sm:text-sm text-[#52525B] leading-relaxed">
              Pre-flight verification, submission links, and community voting announcements.
            </p>
          </div>

          <a
            href={opportunity.externalPortalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-tactile-primary px-4 py-2.5 rounded-xl text-xs font-semibold gap-1.5 self-start sm:self-auto min-h-[40px]"
          >
            <span>Open portal submission</span>
            <ExternalLink aria-hidden="true" className="w-3.5 h-3.5 stroke-[2]" />
          </a>
        </div>
      </div>

      {/* PRE-FLIGHT VERIFICATION CHECKLIST */}
      <div className="surface-card p-6 rounded-2xl space-y-4">
        <h3 className="text-base font-semibold text-[#18181B] flex items-center gap-2">
          <CheckCircle2 aria-hidden="true" className="w-4 h-4 text-[#18181B] stroke-[1.75]" />
          <span>Pre-Flight Readiness</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="p-4 rounded-xl bg-[#F4F4F6] flex items-start gap-3">
            <div
              aria-hidden="true"
              className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 ${
                workspace?.githubRepoUrl ? 'bg-[#18181B] text-white' : 'bg-[#FEF3C7] text-[#92400E]'
              }`}
            >
              {workspace?.githubRepoUrl ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : <AlertTriangle className="w-3 h-3 stroke-[2]" />}
            </div>
            <div className="min-w-0 space-y-0.5">
              <p className="text-xs font-semibold text-[#18181B]">Source repository linked</p>
              <p className="text-xs text-[#52525B]">
                {workspace?.githubRepoUrl ? 'Public repository connected in Build tab' : 'No repo URL linked in Build tab yet'}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#F4F4F6] flex items-start gap-3">
            <div
              aria-hidden="true"
              className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 ${
                isSubmissionReady ? 'bg-[#18181B] text-white' : 'bg-[#FEF3C7] text-[#92400E]'
              }`}
            >
              {isSubmissionReady ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : <AlertTriangle className="w-3 h-3 stroke-[2]" />}
            </div>
            <div className="min-w-0 space-y-0.5">
              <p className="text-xs font-semibold text-[#18181B]">Mandatory requirements</p>
              <p className="text-xs text-[#52525B]">
                {completedCount} of {opportunity.requirements.length} deliverables marked ready
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#F4F4F6] flex items-start gap-3">
            <div aria-hidden="true" className="w-5 h-5 rounded-md bg-[#18181B] text-white flex items-center justify-center flex-shrink-0 mt-0.5">
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
            <div className="min-w-0 space-y-0.5">
              <p className="text-xs font-semibold text-[#18181B]">Presentation script ready</p>
              <p className="text-xs text-[#52525B]">
                3-minute countdown configured in Pitch & Docs
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#F4F4F6] flex items-start gap-3">
            <div aria-hidden="true" className="w-5 h-5 rounded-md bg-[#18181B] text-white flex items-center justify-center flex-shrink-0 mt-0.5">
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
            <div className="min-w-0 space-y-0.5">
              <p className="text-xs font-semibold text-[#18181B]">Team roster active</p>
              <p className="text-xs text-[#52525B]">
                {workspace?.teamMembers?.length || 1} collaborator profile{(workspace?.teamMembers?.length || 1) > 1 ? 's' : ''} listed
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* COMMUNITY VOTING & SHARE CARD */}
      <div className="surface-card p-6 rounded-2xl space-y-4">
        <div className="flex items-center gap-2">
          <Radio aria-hidden="true" className="w-4 h-4 text-[#18181B] stroke-[1.75]" />
          <h3 className="text-base font-semibold text-[#18181B]">
            Community Voting & Announcement
          </h3>
        </div>

        <div className="space-y-3">
          <p className="text-xs sm:text-[13px] text-[#52525B] leading-relaxed">
            Share your shipped submission to gather community votes, testnet testers, and feedback.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <button
              type="button"
              onClick={handleCopyShare}
              className="btn-tactile-secondary px-4 py-2.5 rounded-xl text-xs font-medium gap-1.5 justify-center min-h-[40px]"
            >
              {copiedShare ? (
                <Check aria-hidden="true" className="w-3.5 h-3.5 text-emerald-700 stroke-[2.25]" />
              ) : (
                <Share2 aria-hidden="true" className="w-3.5 h-3.5 stroke-[1.75]" />
              )}
              <span>{copiedShare ? 'Copied announcement' : 'Copy announcement'}</span>
            </button>

            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                `Shipping our project for ${opportunity.title}.`
              )}`}
              target="_blank"
              rel="noreferrer"
              className="btn-tactile-secondary px-4 py-2.5 rounded-xl text-xs font-medium gap-1.5 justify-center min-h-[40px]"
            >
              <span>Share on X</span>
              <ExternalLink aria-hidden="true" className="w-3.5 h-3.5 stroke-[1.75]" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
