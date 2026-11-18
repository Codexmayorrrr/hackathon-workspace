import React, { useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  CheckCircle2, 
  FileText, 
  Video, 
  GitFork, 
  Globe, 
  UploadCloud, 
  Bookmark, 
  ExternalLink, 
  Layers, 
  Clock 
} from 'lucide-react';
import { MOCK_OPPORTUNITIES } from '../data/mockOpportunities';
import { ApplicationRequirement, RequirementType } from '../types';
import { formatEventDate, getRelativeDeadline } from '../utils/dateUtils';
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

  const stepGroups = useMemo(() => {
    if (!opportunity) return {};
    const groups: Record<string, ApplicationRequirement[]> = {};
    opportunity.requirements.forEach((req) => {
      if (!groups[req.step]) {
        groups[req.step] = [];
      }
      groups[req.step].push(req);
    });
    return groups;
  }, [opportunity]);

  if (!opportunity) {
    return (
      <div className="py-20 text-center space-y-4 bg-white">
        <h2 className="text-xl font-bold text-neutral-900 [text-wrap:balance]">Opportunity not found</h2>
        <p className="text-sm text-neutral-500 [text-wrap:pretty]">The opportunity you are looking for does not exist or has expired.</p>
        <Link to="/discover" className="btn-tactile-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-xs sm:text-sm font-semibold active:scale-[0.97]">
          Return to Discover
        </Link>
      </div>
    );
  }

  const deadline = getRelativeDeadline(opportunity.applicationDeadline);
  const mandatoryCount = opportunity.requirements.filter((r) => r.mandatory).length;
  const optionalCount = opportunity.requirements.length - mandatoryCount;

  const promptsCount = opportunity.requirements.filter((r) => r.type === 'text_prompt').length;
  const decksCount = opportunity.requirements.filter((r) => r.type === 'pitch_deck').length;
  const videoCount = opportunity.requirements.filter((r) => r.type === 'demo_video').length;
  const repoCount = opportunity.requirements.filter((r) => r.type === 'repo_link').length;

  const prepWeightParts = [
    promptsCount > 0 ? `${promptsCount} written prompt${promptsCount > 1 ? 's' : ''}` : null,
    decksCount > 0 ? `${decksCount} pitch deck` : null,
    videoCount > 0 ? `${videoCount} demo video` : null,
    repoCount > 0 ? `${repoCount} code repo` : null,
  ].filter(Boolean);

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
        return <FileText className="w-4 h-4 text-neutral-700 stroke-[1.75]" />;
      case 'pitch_deck':
        return <Layers className="w-4 h-4 text-neutral-700 stroke-[1.75]" />;
      case 'demo_video':
        return <Video className="w-4 h-4 text-neutral-700 stroke-[1.75]" />;
      case 'repo_link':
        return <GitFork className="w-4 h-4 text-neutral-700 stroke-[1.75]" />;
      case 'live_url':
        return <Globe className="w-4 h-4 text-neutral-700 stroke-[1.75]" />;
      default:
        return <UploadCloud className="w-4 h-4 text-neutral-700 stroke-[1.75]" />;
    }
  };

  return (
    <div className="space-y-10 sm:space-y-12 pb-16 bg-white">
      {/* Back button */}
      <div>
        <Link
          to="/discover"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-900 transition-colors mb-2 group active:scale-[0.97]"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1 stroke-[1.75]" />
          <span>Back to Opportunities</span>
        </Link>
      </div>

      {/* Hero Header Card - Light Grey (#FDFDFD), Zero Border, Zero Shadow */}
      <div className="p-6 sm:p-8 lg:p-10 rounded-2xl bg-[#FDFDFD] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs text-neutral-500 font-medium flex-wrap">
              <span className="capitalize">{opportunity.format}</span>
              <span className="text-neutral-300">·</span>
              <span className="capitalize">{opportunity.type.replace('_', ' ')}</span>
              <span className="text-neutral-300">·</span>
              <span className="inline-flex items-center gap-1 font-mono text-neutral-700 bg-white px-2.5 py-0.5 rounded-full tabular-nums">
                <Clock className="w-3 h-3 stroke-[1.75] text-neutral-400" />
                <span>{deadline.label}</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-900 tracking-tight leading-tight [text-wrap:balance]">
              {opportunity.title}
            </h1>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 self-stretch sm:self-auto flex-shrink-0">
            {isSaved ? (
              <Link
                to={`/workspaces/${opportunity.id}`}
                className="btn-tactile-primary inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold active:scale-[0.97] text-white"
              >
                <span>Continue in Workspace</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400 stroke-[2]" />
              </Link>
            ) : (
              <button
                onClick={handleSaveToggle}
                className="btn-tactile-primary inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold active:scale-[0.97] text-white"
              >
                <Bookmark className="w-4 h-4 opacity-80 stroke-[1.75]" />
                <span>Save to Workspace</span>
              </button>
            )}

            <a
              href={opportunity.externalPortalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white hover:bg-neutral-50 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium active:scale-[0.97] text-neutral-800 transition-colors"
            >
              <span>Portal</span>
              <ExternalLink className="w-3.5 h-3.5 text-neutral-400 stroke-[1.75]" />
            </a>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed max-w-3xl [text-wrap:pretty]">
          {opportunity.summary}
        </p>

        {/* Metadata stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
          <div className="p-4 rounded-xl bg-white space-y-1">
            <p className="text-[11px] text-neutral-400 font-medium">Prize / Grant Pool</p>
            <p className="text-base font-semibold text-emerald-700 tabular-nums">{opportunity.prizePool}</p>
          </div>

          <div className="p-4 rounded-xl bg-white space-y-1">
            <p className="text-[11px] text-neutral-400 font-medium">Application Deadline</p>
            <p className="text-xs sm:text-sm font-semibold text-neutral-800 tabular-nums font-mono">
              {formatEventDate(opportunity.applicationDeadline)}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white space-y-1">
            <p className="text-[11px] text-neutral-400 font-medium">Format & Location</p>
            <p className="text-xs sm:text-sm font-semibold text-neutral-800 [text-wrap:balance]">
              {opportunity.location || opportunity.format}
            </p>
          </div>
        </div>
      </div>

      {/* UPFRONT APPLICATION PREVIEW */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-neutral-900 tracking-tight flex items-center gap-2.5 [text-wrap:balance]">
              <span>Upfront Application Preview</span>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#FDFDFD] text-neutral-700 font-semibold font-mono">
                No Gated Surprises
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1 [text-wrap:pretty]">
              Every deliverable, question, word limit, and upload required by the external portal before you start.
            </p>
          </div>

          {isSaved && (
            <Link
              to={`/workspaces/${opportunity.id}?tab=checklist`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 self-start sm:self-auto active:scale-[0.97]"
            >
              <span>Interactive Checklist Active →</span>
            </Link>
          )}
        </div>

        {/* Summary Strip - Light Grey (#FDFDFD), Zero Border, Zero Shadow */}
        <div className="p-4 sm:p-5 rounded-xl bg-[#FDFDFD] flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
            <span className="text-neutral-900 font-semibold tabular-nums">
              {opportunity.requirements.length} total requirements
            </span>
            <span className="text-neutral-300">·</span>
            <span className="text-emerald-700 font-medium tabular-nums">{mandatoryCount} mandatory</span>
            {optionalCount > 0 && (
              <>
                <span className="text-neutral-300">·</span>
                <span className="text-neutral-500 tabular-nums">{optionalCount} optional</span>
              </>
            )}
            <span className="text-neutral-300">·</span>
            <span className="text-neutral-600 font-mono">
              Weight: {prepWeightParts.join(' · ')}
            </span>
          </div>

          <div className="text-neutral-500 flex items-center gap-1.5 font-mono text-[11px] tabular-nums">
            <Clock className="w-3.5 h-3.5 text-neutral-400 stroke-[1.75]" />
            <span>Cutoff: {formatEventDate(opportunity.applicationDeadline)}</span>
          </div>
        </div>

        {/* Step-Grouped Requirements */}
        <div className="space-y-6">
          {Object.entries(stepGroups).map(([stepName, reqs]) => (
            <div key={stepName} className="space-y-3">
              <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider px-1 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-900" />
                <span className="[text-wrap:balance]">{stepName}</span>
                <span className="text-xs font-normal text-neutral-400 lowercase tabular-nums">
                  ({reqs.length} item{reqs.length > 1 ? 's' : ''})
                </span>
              </h3>

              <div className="space-y-3">
                {reqs.map((req) => (
                  <div
                    key={req.id}
                    className="p-4 sm:p-5 rounded-xl bg-[#FDFDFD] flex flex-col sm:flex-row sm:items-start justify-between gap-4"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="p-2.5 rounded-lg bg-white mt-0.5 flex-shrink-0">
                        {getRequirementIcon(req.type)}
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-xs sm:text-sm font-semibold text-neutral-900 [text-wrap:balance]">
                            {req.title}
                          </h4>
                          <span
                            className={`px-2 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wider ${
                              req.mandatory
                                ? 'bg-white text-rose-700'
                                : 'bg-white text-neutral-600'
                            }`}
                          >
                            {req.mandatory ? 'Required' : 'Optional'}
                          </span>
                        </div>
                        {req.description && (
                          <p className="text-xs text-neutral-500 leading-relaxed max-w-2xl [text-wrap:pretty]">
                            {req.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0 self-start sm:self-center">
                      {req.maxWords && (
                        <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-medium bg-white text-neutral-700 tabular-nums">
                          Max {req.maxWords} words
                        </span>
                      )}
                      {req.acceptedFormats && (
                        <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-medium bg-white text-neutral-700">
                          {req.acceptedFormats}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Conversion Footer - Light Grey Card (#FDFDFD), Zero Border, Zero Shadow */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#FDFDFD] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-sm sm:text-base font-semibold text-neutral-900 [text-wrap:balance]">
              {isSaved ? 'Workspace Active' : 'Start Preparing Now'}
            </h4>
            <p className="text-xs sm:text-sm text-neutral-500 [text-wrap:pretty] max-w-xl">
              {isSaved
                ? 'Your interactive draft checklist, deliverable links, and countdown timers are ready.'
                : 'Save this opportunity to unlock the interactive draft editor with live word counters.'}
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {isSaved ? (
              <Link
                to={`/workspaces/${opportunity.id}`}
                className="btn-tactile-primary px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold w-full sm:w-auto text-center active:scale-[0.97] text-white"
              >
                Go to Workspace →
              </Link>
            ) : (
              <button
                onClick={handleSaveToggle}
                className="btn-tactile-primary px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 w-full sm:w-auto text-center active:scale-[0.97] text-white"
              >
                <Bookmark className="w-3.5 h-3.5 opacity-80 stroke-[1.75]" />
                <span>Save to Workspace</span>
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
