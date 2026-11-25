import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  ExternalLink,
  FileText,
  Layers,
  Video,
  GitFork,
  Globe,
  UploadCloud,
  Bookmark,
  CheckCircle2,
} from 'lucide-react';
import { MOCK_OPPORTUNITIES } from '../data/mockOpportunities';
import { RequirementType } from '../types';
import { getRelativeDeadline, formatEventDate } from '../utils/dateUtils';
import { CATEGORY_THEMES } from '../utils/categoryTheme';
import { useWorkspaceStore } from '../store/useWorkspaceStore';
import { toast } from 'sonner';

export const OpportunityDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const opportunity = MOCK_OPPORTUNITIES.find((opp) => opp.slug === slug);
  const isSaved = useWorkspaceStore((state) =>
    opportunity ? state.isSaved(opportunity.id) : false
  );
  const saveOpportunity = useWorkspaceStore((state) => state.saveOpportunity);
  const unsaveOpportunity = useWorkspaceStore((state) => state.unsaveOpportunity);

  if (!opportunity) {
    return (
      <div className="surface-card py-20 px-6 rounded-2xl text-center space-y-4">
        <h1 className="text-xl font-bold text-[#18181B] tracking-tight">Opportunity not found</h1>
        <p className="text-sm text-[#52525B]">The opportunity you requested does not exist or has expired.</p>
        <Link
          to="/discover"
          className="btn-tactile-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold min-h-[40px]"
        >
          Return to Discover
        </Link>
      </div>
    );
  }

  const deadline = getRelativeDeadline(opportunity.applicationDeadline);
  const theme = CATEGORY_THEMES[opportunity.type] || CATEGORY_THEMES.hackathon;
  const CategoryIcon = theme.icon;

  const handleSaveToggle = () => {
    if (isSaved) {
      unsaveOpportunity(opportunity.id);
      toast('Removed from Saved Queue', {
        description: opportunity.title,
      });
    } else {
      saveOpportunity(opportunity.id);
      toast.success('Saved to workspace', {
        description: 'Interactive checklist and draft editors created.',
        action: {
          label: 'Open Workspace',
          onClick: () => navigate(`/workspaces/${opportunity.id}`),
        },
      });
    }
  };

  const getRequirementIcon = (type: RequirementType) => {
    switch (type) {
      case 'text_prompt':
        return <FileText aria-hidden="true" className="w-4 h-4 text-[#52525B] stroke-[1.75]" />;
      case 'pitch_deck':
        return <Layers aria-hidden="true" className="w-4 h-4 text-[#52525B] stroke-[1.75]" />;
      case 'demo_video':
        return <Video aria-hidden="true" className="w-4 h-4 text-[#52525B] stroke-[1.75]" />;
      case 'repo_link':
        return <GitFork aria-hidden="true" className="w-4 h-4 text-[#52525B] stroke-[1.75]" />;
      case 'live_url':
        return <Globe aria-hidden="true" className="w-4 h-4 text-[#52525B] stroke-[1.75]" />;
      default:
        return <UploadCloud aria-hidden="true" className="w-4 h-4 text-[#52525B] stroke-[1.75]" />;
    }
  };

  const stepGroups = opportunity.requirements.reduce((acc, req) => {
    if (!acc[req.step]) acc[req.step] = [];
    acc[req.step].push(req);
    return acc;
  }, {} as Record<string, typeof opportunity.requirements>);

  return (
    <div className="space-y-8 sm:space-y-12 pb-16 min-w-0">
      {/* Back Link */}
      <div>
        <Link
          to="/discover"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#52525B] hover:text-[#18181B] transition-colors group py-1"
        >
          <ArrowLeft aria-hidden="true" className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1 rtl:-scale-x-100 stroke-[1.75]" />
          <span>Back to Discover</span>
        </Link>
      </div>

      {/* Hero Overview Card */}
      <div className="surface-card p-6 sm:p-8 rounded-2xl space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="space-y-3 min-w-0">
            <div className="flex items-center gap-2 text-xs text-[#52525B] font-medium flex-wrap">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold ${theme.badgeClasses}`}>
                <CategoryIcon aria-hidden="true" className="w-3 h-3 stroke-[2]" />
                <span>{theme.label}</span>
              </span>
              <span className="capitalize">{opportunity.format}</span>
              <span aria-hidden="true" className="text-[#63636B]">·</span>
              <span className="inline-flex items-center gap-1.5 font-mono text-[#18181B] font-medium tabular-nums">
                <Clock aria-hidden="true" className="w-3.5 h-3.5 stroke-[1.75] text-[#63636B]" />
                <span>{deadline.label}</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-[#18181B] tracking-tight leading-snug">
              {opportunity.title}
            </h1>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2.5 flex-wrap flex-shrink-0">
            {isSaved ? (
              <Link
                to={`/workspaces/${opportunity.id}`}
                className="btn-tactile-primary px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold inline-flex items-center gap-2 min-h-[42px]"
              >
                <CheckCircle2 aria-hidden="true" className="w-4 h-4 text-emerald-300 stroke-[2]" />
                <span>Open Workspace</span>
              </Link>
            ) : (
              <button
                type="button"
                onClick={handleSaveToggle}
                className="btn-tactile-primary px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold inline-flex items-center gap-2 min-h-[42px]"
              >
                <Bookmark aria-hidden="true" className="w-4 h-4 stroke-[2]" />
                <span>Save to Workspace</span>
              </button>
            )}

            <a
              href={opportunity.externalPortalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-tactile-secondary px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium inline-flex items-center gap-1.5 min-h-[42px]"
            >
              <span>Portal</span>
              <ExternalLink aria-hidden="true" className="w-3.5 h-3.5 text-[#52525B] stroke-[1.75]" />
            </a>
          </div>
        </div>

        <p className="text-sm text-[#52525B] leading-relaxed max-w-[65ch]">
          {opportunity.summary}
        </p>

        {/* Metadata stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-4 rounded-xl bg-[#F4F4F6] space-y-1">
            <p className="text-[11px] uppercase font-semibold text-[#63636B] tracking-wider">Prize Pool</p>
            <p className="text-base font-semibold text-[#18181B] font-mono tabular-nums">{opportunity.prizePool}</p>
          </div>

          <div className="p-4 rounded-xl bg-[#F4F4F6] space-y-1">
            <p className="text-[11px] uppercase font-semibold text-[#63636B] tracking-wider">Deadline</p>
            <p className="text-[13px] font-semibold text-[#18181B] font-mono tabular-nums">
              {formatEventDate(opportunity.applicationDeadline)}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#F4F4F6] space-y-1">
            <p className="text-[11px] uppercase font-semibold text-[#63636B] tracking-wider">Format & Location</p>
            <p className="text-[13px] font-semibold text-[#18181B] truncate" title={opportunity.location || opportunity.format}>
              {opportunity.location || opportunity.format}
            </p>
          </div>
        </div>
      </div>

      {/* Upfront Application Preview */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-[#18181B] tracking-tight flex items-center gap-2 flex-wrap">
              <span>Application Requirements</span>
              <span className="text-xs font-medium text-[#63636B] font-mono tabular-nums">
                ({opportunity.requirements.length})
              </span>
            </h2>
            <p className="text-[13px] text-[#52525B] mt-0.5 max-w-[65ch]">
              Every question, word limit, and deliverable required before registration.
            </p>
          </div>

          {isSaved && (
            <Link
              to={`/workspaces/${opportunity.id}?tab=application`}
              className="btn-tactile-secondary ps-3.5 pe-3 py-2 rounded-xl inline-flex items-center gap-1.5 text-xs font-medium self-start sm:self-auto"
            >
              <span>Go to checklist</span>
              <ArrowRight aria-hidden="true" className="w-3.5 h-3.5 stroke-[1.75] rtl:-scale-x-100" />
            </Link>
          )}
        </div>

        {/* Step-Grouped Requirements */}
        <div className="space-y-6">
          {Object.entries(stepGroups).map(([stepName, reqs]) => (
            <div key={stepName} className="space-y-3">
              <h3 className="text-[13px] font-semibold text-[#52525B] uppercase tracking-wider px-1">
                {stepName} ({reqs.length})
              </h3>

              <div className="space-y-3">
                {reqs.map((req) => (
                  <div
                    key={req.id}
                    className="surface-card p-5 rounded-2xl flex flex-col sm:flex-row sm:items-start justify-between gap-4"
                  >
                    <div className="flex items-start gap-3.5 min-w-0">
                      <div className="p-2.5 rounded-xl bg-[#F4F4F6] mt-0.5 flex-shrink-0">
                        {getRequirementIcon(req.type)}
                      </div>
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-semibold text-[#18181B]">
                            {req.title}
                          </h4>
                          <span
                            className={`text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                              req.mandatory
                                ? 'bg-[#18181B] text-white'
                                : 'bg-[#F4F4F6] text-[#52525B]'
                            }`}
                          >
                            {req.mandatory ? 'Required' : 'Optional'}
                          </span>
                        </div>
                        {req.description && (
                          <p className="text-[13px] text-[#52525B] leading-relaxed max-w-[65ch]">
                            {req.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap flex-shrink-0 self-start sm:self-center text-xs font-mono text-[#52525B]">
                      {req.maxWords && <span>Max {req.maxWords} words</span>}
                      {req.acceptedFormats && <span>· {req.acceptedFormats}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Conversion Footer */}
        <div className="surface-card p-6 sm:p-8 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-[#18181B]">
              {isSaved ? 'Workspace active' : 'Start preparing now'}
            </h3>
            <p className="text-[13px] text-[#52525B] max-w-[60ch]">
              {isSaved
                ? 'Your interactive draft checklist, deliverable links, and countdown timers are ready.'
                : 'Save this opportunity to unlock the interactive draft editor with live word counters.'}
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {isSaved ? (
              <Link
                to={`/workspaces/${opportunity.id}`}
                className="btn-tactile-primary ps-5 pe-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold w-full sm:w-auto inline-flex items-center justify-center gap-2 min-h-[42px] group/btn"
              >
                <span>Open Workspace</span>
                <ArrowRight aria-hidden="true" className="w-4 h-4 stroke-[2] rtl:-scale-x-100 transition-transform duration-150 group-hover/btn:translate-x-0.5" />
              </Link>
            ) : (
              <button
                type="button"
                onClick={handleSaveToggle}
                className="btn-tactile-primary px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-2 w-full sm:w-auto min-h-[42px]"
              >
                <Bookmark aria-hidden="true" className="w-4 h-4 stroke-[2]" />
                <span>Save to Workspace</span>
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
