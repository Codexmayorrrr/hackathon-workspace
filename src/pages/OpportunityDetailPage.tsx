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
  CheckCircle2 
} from 'lucide-react';
import { MOCK_OPPORTUNITIES } from '../data/mockOpportunities';
import { RequirementType } from '../types';
import { getRelativeDeadline, formatEventDate } from '../utils/dateUtils';
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
      <div className="py-24 text-center space-y-4 bg-white">
        <h2 className="text-xl font-semibold text-neutral-950 tracking-tight">Opportunity not found</h2>
        <p className="text-sm text-neutral-500" style={{ textWrap: 'pretty' }}>The opportunity you are looking for does not exist or has expired.</p>
        <Link to="/discover" className="btn-tactile-primary inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white text-xs font-semibold active:scale-[0.97]">
          Return to Discover
        </Link>
      </div>
    );
  }

  const deadline = getRelativeDeadline(opportunity.applicationDeadline);

  const handleSaveToggle = () => {
    if (isSaved) {
      unsaveOpportunity(opportunity.id);
      toast('Removed from Saved Queue', {
        description: opportunity.title,
      });
    } else {
      saveOpportunity(opportunity.id);
      toast.success('Saved to Workspace', {
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
        return <FileText className="w-4 h-4 text-neutral-600 stroke-[1.75]" />;
      case 'pitch_deck':
        return <Layers className="w-4 h-4 text-neutral-600 stroke-[1.75]" />;
      case 'demo_video':
        return <Video className="w-4 h-4 text-neutral-600 stroke-[1.75]" />;
      case 'repo_link':
        return <GitFork className="w-4 h-4 text-neutral-600 stroke-[1.75]" />;
      case 'live_url':
        return <Globe className="w-4 h-4 text-neutral-600 stroke-[1.75]" />;
      default:
        return <UploadCloud className="w-4 h-4 text-neutral-600 stroke-[1.75]" />;
    }
  };

  const stepGroups = opportunity.requirements.reduce((acc, req) => {
    if (!acc[req.step]) acc[req.step] = [];
    acc[req.step].push(req);
    return acc;
  }, {} as Record<string, typeof opportunity.requirements>);

  return (
    <div className="space-y-10 sm:space-y-12 pb-16 bg-white">
      {/* Back Link */}
      <div>
        <Link
          to="/discover"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-900 transition-colors group active:scale-[0.97]"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1 stroke-[1.75]" />
          <span>Back to Opportunities</span>
        </Link>
      </div>

      {/* Hero Overview Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#FDFDFD] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-xs text-neutral-500 font-medium flex-wrap">
              <span className="capitalize">{opportunity.format}</span>
              <span className="text-neutral-300">·</span>
              <span className="capitalize">{opportunity.type.replace('_', ' ')}</span>
              <span className="text-neutral-300">·</span>
              <span className="inline-flex items-center gap-1 font-mono text-neutral-600 tabular-nums">
                <Clock className="w-3 h-3 stroke-[1.75] text-neutral-400" />
                <span>{deadline.label}</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-semibold text-neutral-950 tracking-tight leading-snug" style={{ textWrap: 'balance' }}>
              {opportunity.title}
            </h1>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2.5 self-start sm:self-auto flex-shrink-0">
            {isSaved ? (
              <Link
                to={`/workspaces/${opportunity.id}`}
                className="btn-tactile-primary px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold inline-flex items-center gap-2 group/cta"
              >
                <span>Continue in Workspace</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400 stroke-[2] transition-transform duration-150 group-hover/cta:scale-105" />
              </Link>
            ) : (
              <button
                onClick={handleSaveToggle}
                className="btn-tactile-primary px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold inline-flex items-center gap-2 group/cta"
              >
                <Bookmark className="w-4 h-4 opacity-80 stroke-[2] transition-transform duration-150 group-hover/cta:scale-105" />
                <span>Save to Workspace</span>
              </button>
            )}

            <a
              href={opportunity.externalPortalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-tactile-secondary px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium inline-flex items-center gap-1.5"
            >
              <span>Portal</span>
              <ExternalLink className="w-3.5 h-3.5 text-neutral-500 stroke-[1.75]" />
            </a>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed max-w-2xl" style={{ textWrap: 'pretty' }}>
          {opportunity.summary}
        </p>

        {/* Metadata stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-4 rounded-xl bg-[#F5F5F5] space-y-1">
            <p className="text-[10px] uppercase font-semibold text-neutral-400 tracking-wider">Prize Pool</p>
            <p className="text-base font-semibold text-neutral-950 font-mono tabular-nums">{opportunity.prizePool}</p>
          </div>

          <div className="p-4 rounded-xl bg-[#F5F5F5] space-y-1">
            <p className="text-[10px] uppercase font-semibold text-neutral-400 tracking-wider">Deadline</p>
            <p className="text-xs sm:text-sm font-semibold text-neutral-900 font-mono tabular-nums">
              {formatEventDate(opportunity.applicationDeadline)}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#F5F5F5] space-y-1">
            <p className="text-[10px] uppercase font-semibold text-neutral-400 tracking-wider">Format & Location</p>
            <p className="text-xs sm:text-sm font-semibold text-neutral-900 truncate">
              {opportunity.location || opportunity.format}
            </p>
          </div>
        </div>
      </div>

      {/* Upfront Application Preview */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-1">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-neutral-950 tracking-tight flex items-center gap-2" style={{ textWrap: 'balance' }}>
              <span>Application Requirements</span>
              <span className="text-xs font-normal text-neutral-400 font-mono">({opportunity.requirements.length})</span>
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5" style={{ textWrap: 'pretty' }}>
              Every deliverable, question, word limit, and upload required before registration.
            </p>
          </div>

          {isSaved && (
            <Link
              to={`/workspaces/${opportunity.id}?tab=checklist`}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-600 hover:text-neutral-950 active:scale-[0.97]"
            >
              <span>Go to checklist →</span>
            </Link>
          )}
        </div>

        {/* Step-Grouped Requirements */}
        <div className="space-y-6">
          {Object.entries(stepGroups).map(([stepName, reqs]) => (
            <div key={stepName} className="space-y-2.5">
              <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider px-1">
                {stepName} ({reqs.length})
              </h3>

              <div className="space-y-2.5">
                {reqs.map((req) => (
                  <div
                    key={req.id}
                    className="p-5 rounded-xl bg-[#FDFDFD] hover:bg-[#F8F8FA] transition-colors flex flex-col sm:flex-row sm:items-start justify-between gap-4"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="p-2 rounded-lg bg-[#F5F5F5] mt-0.5 flex-shrink-0">
                        {getRequirementIcon(req.type)}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-xs sm:text-sm font-semibold text-neutral-950" style={{ textWrap: 'balance' }}>
                            {req.title}
                          </h4>
                          <span className={`text-[10px] font-semibold uppercase tracking-wider ${
                            req.mandatory ? 'text-neutral-900' : 'text-neutral-400'
                          }`}>
                            {req.mandatory ? 'Required' : 'Optional'}
                          </span>
                        </div>
                        {req.description && (
                          <p className="text-xs text-neutral-500 leading-relaxed max-w-xl" style={{ textWrap: 'pretty' }}>
                            {req.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0 self-start sm:self-center text-[11px] font-mono text-neutral-500">
                      {req.maxWords && (
                        <span>Max {req.maxWords} words</span>
                      )}
                      {req.acceptedFormats && (
                        <span>· {req.acceptedFormats}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Conversion Footer */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#FDFDFD] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-neutral-950" style={{ textWrap: 'balance' }}>
              {isSaved ? 'Workspace Active' : 'Start Preparing Now'}
            </h4>
            <p className="text-xs text-neutral-500 max-w-lg" style={{ textWrap: 'pretty' }}>
              {isSaved
                ? 'Your interactive draft checklist, deliverable links, and countdown timers are ready.'
                : 'Save this opportunity to unlock the interactive draft editor with live word counters.'}
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {isSaved ? (
              <Link
                to={`/workspaces/${opportunity.id}`}
                className="btn-tactile-primary px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold w-full sm:w-auto text-center inline-flex items-center justify-center gap-2 group/btn"
              >
                <span>Go to Workspace</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[2] transition-transform duration-150 group-hover/btn:translate-x-0.5" />
              </Link>
            ) : (
              <button
                onClick={handleSaveToggle}
                className="btn-tactile-primary px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-2 w-full sm:w-auto text-center group/btn"
              >
                <Bookmark className="w-4 h-4 opacity-80 stroke-[2] transition-transform duration-150 group-hover/btn:scale-105" />
                <span>Save to Workspace</span>
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
