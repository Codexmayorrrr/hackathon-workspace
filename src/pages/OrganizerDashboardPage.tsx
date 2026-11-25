import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Inbox,
  CalendarDays,
  Users,
  Award,
  ArrowRight,
  Palette,
  ExternalLink,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { useAllOpportunities, useWorkspaceStore } from '../store/useWorkspaceStore';
import { EventBanner } from '../components/ui/EventBanner';
import { CATEGORY_THEMES } from '../utils/categoryTheme';
import { getRelativeDeadline } from '../utils/dateUtils';
import { CreateOpportunityModal } from '../components/organizer/CreateOpportunityModal';
import { BannerEditorModal } from '../components/organizer/BannerEditorModal';
import { Opportunity } from '../types';
import { toast } from 'sonner';

export const OrganizerDashboardPage: React.FC = () => {
  const allOpportunities = useAllOpportunities();
  const organizerSubmissions = useWorkspaceStore((state) => state.organizerSubmissions);
  const updateSubmissionStatus = useWorkspaceStore((state) => state.updateSubmissionStatus);
  const updateOpportunityBanner = useWorkspaceStore((state) => state.updateOpportunityBanner);

  const [createOpen, setCreateOpen] = useState(false);
  const [editingBannerOpp, setEditingBannerOpp] = useState<Opportunity | null>(null);

  const metrics = useMemo(() => {
    const totalApplicants = allOpportunities.reduce(
      (acc, opp) => acc + (opp.applicantCount || 0),
      0
    );
    const pendingReviews = organizerSubmissions.filter((s) => s.status === 'pending').length;
    const shortlistedOrWon = organizerSubmissions.filter(
      (s) => s.status === 'shortlisted' || s.status === 'winner'
    ).length;
    return {
      totalEvents: allOpportunities.length,
      totalApplicants,
      pendingReviews,
      shortlistedOrWon,
    };
  }, [allOpportunities, organizerSubmissions]);

  const featuredSubmissions = useMemo(() => {
    const pending = organizerSubmissions.filter((s) => s.status === 'pending');
    return (pending.length > 0 ? pending : organizerSubmissions).slice(0, 3);
  }, [organizerSubmissions]);

  const hostedEventsPreview = allOpportunities.slice(0, 4);

  const handleQuickShortlist = (submissionId: string, projectTitle: string, prevStatus: 'pending' | 'shortlisted' | 'winner' | 'declined') => {
    updateSubmissionStatus(submissionId, 'shortlisted');
    toast.success(`Shortlisted "${projectTitle}"`, {
      action: {
        label: 'Undo',
        onClick: () => updateSubmissionStatus(submissionId, prevStatus),
      },
    });
  };

  return (
    <div className="space-y-8 sm:space-y-10 min-w-0">
      {/* Header Intro */}
      <div className="surface-card rounded-2xl p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="space-y-2 min-w-0">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#EFE6FF] text-[#3B0764] text-xs font-semibold">
            <span>Organizer Studio</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#18181B] tracking-tight">
            Manage Hosted Events & Developer Submissions
          </h1>
          <p className="text-sm text-[#52525B] max-w-[65ch]">
            Publish new hackathons, conferences, or grants, customize event banners live, and review builder demos in one workspace.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap flex-shrink-0">
          <Link
            to="/organizer/submissions"
            className="btn-tactile-secondary px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium inline-flex items-center gap-2 min-h-[42px]"
          >
            <Inbox aria-hidden="true" className="w-4 h-4 stroke-[1.75]" />
            <span>Review Inbox ({metrics.pendingReviews})</span>
          </Link>
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="btn-tactile-primary px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold inline-flex items-center gap-2 min-h-[42px]"
          >
            <Plus aria-hidden="true" className="w-4 h-4 stroke-[2.2]" />
            <span>Publish Event</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics Row */}
      <section aria-label="Program metrics" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="surface-card rounded-2xl p-5 space-y-2 min-w-0">
          <div className="flex items-center justify-between text-[#52525B]">
            <span className="text-xs font-medium">Live Opportunities</span>
            <CalendarDays aria-hidden="true" className="w-4 h-4 text-[#63636B]" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-[#18181B] tabular-nums">
            {metrics.totalEvents}
          </p>
          <p className="text-xs text-[#63636B]">Hackathons, grants & events</p>
        </div>

        <div className="surface-card rounded-2xl p-5 space-y-2 min-w-0">
          <div className="flex items-center justify-between text-[#52525B]">
            <span className="text-xs font-medium">Registered Builders</span>
            <Users aria-hidden="true" className="w-4 h-4 text-[#63636B]" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-[#18181B] tabular-nums">
            {metrics.totalApplicants.toLocaleString()}
          </p>
          <p className="text-xs text-[#63636B]">Across open cohorts</p>
        </div>

        <div className="surface-card rounded-2xl p-5 space-y-2 min-w-0">
          <div className="flex items-center justify-between text-[#52525B]">
            <span className="text-xs font-medium">Pending Reviews</span>
            <Inbox aria-hidden="true" className="w-4 h-4 text-[#63636B]" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-[#18181B] tabular-nums">
            {metrics.pendingReviews}
          </p>
          <p className="text-xs text-[#63636B]">Awaiting judge triage</p>
        </div>

        <div className="surface-card rounded-2xl p-5 space-y-2 min-w-0">
          <div className="flex items-center justify-between text-[#52525B]">
            <span className="text-xs font-medium">Shortlisted & Winners</span>
            <Award aria-hidden="true" className="w-4 h-4 text-[#63636B]" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-[#18181B] tabular-nums">
            {metrics.shortlistedOrWon}
          </p>
          <p className="text-xs text-[#63636B]">Verified demo finalists</p>
        </div>
      </section>

      {/* Submissions Awaiting Review */}
      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-lg sm:text-xl font-semibold text-[#18181B] tracking-tight">
              Submissions Queue
            </h2>
            <p className="text-sm text-[#52525B] mt-0.5">
              Fast triage for incoming developer demos before judge lock-in.
            </p>
          </div>
          <Link
            to="/organizer/submissions"
            className="text-xs sm:text-sm font-medium text-[#52525B] hover:text-[#18181B] inline-flex items-center gap-1 flex-shrink-0 py-1 px-2 rounded-lg"
          >
            <span>Open full inbox</span>
            <ArrowRight aria-hidden="true" className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {featuredSubmissions.map((sub) => {
            const parentOpp = allOpportunities.find((o) => o.id === sub.opportunityId);
            return (
              <div
                key={sub.id}
                className="surface-card rounded-2xl p-5 flex flex-col justify-between gap-4 min-w-0"
              >
                <div className="space-y-2.5 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-lg bg-[#EFE6FF] text-[#3B0764] text-[11px] font-semibold truncate">
                      {sub.trackName}
                    </span>
                    <span className="text-[11px] font-medium text-[#63636B] capitalize flex-shrink-0">
                      {sub.status}
                    </span>
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-base font-semibold text-[#18181B] tracking-tight truncate">
                      {sub.projectTitle}
                    </h3>
                    <p className="text-xs text-[#63636B] truncate">
                      {sub.teamName} · {parentOpp?.title || sub.opportunityId}
                    </p>
                  </div>

                  <p className="text-xs text-[#52525B] leading-relaxed line-clamp-2">
                    {sub.tagline}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-2 pt-2">
                  <a
                    href={sub.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-tactile-secondary px-3 py-2 rounded-xl text-xs font-medium inline-flex items-center gap-1.5 min-h-[36px]"
                  >
                    <span>Repo</span>
                    <ExternalLink aria-hidden="true" className="w-3 h-3" />
                  </a>

                  {sub.status === 'pending' ? (
                    <button
                      type="button"
                      onClick={() => handleQuickShortlist(sub.id, sub.projectTitle, sub.status)}
                      className="btn-tactile-primary px-3.5 py-2 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 min-h-[36px]"
                    >
                      <CheckCircle2 aria-hidden="true" className="w-3.5 h-3.5" />
                      <span>Shortlist</span>
                    </button>
                  ) : (
                    <Link
                      to="/organizer/submissions"
                      className="btn-tactile-accent px-3.5 py-2 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 min-h-[36px]"
                    >
                      <span>Inspect</span>
                      <ArrowRight aria-hidden="true" className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Hosted Events & Live Banner Preview */}
      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-lg sm:text-xl font-semibold text-[#18181B] tracking-tight">
              Hosted Events & Banner Studio
            </h2>
            <p className="text-sm text-[#52525B] mt-0.5">
              Customize event headers across both organizer listings and developer discovery cards.
            </p>
          </div>
          <Link
            to="/organizer/events"
            className="text-xs sm:text-sm font-medium text-[#52525B] hover:text-[#18181B] inline-flex items-center gap-1 flex-shrink-0 py-1 px-2 rounded-lg"
          >
            <span>View all ({allOpportunities.length})</span>
            <ArrowRight aria-hidden="true" className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {hostedEventsPreview.map((opp) => {
            const theme = CATEGORY_THEMES[opp.type] || CATEGORY_THEMES.hackathon;
            const deadline = getRelativeDeadline(opp.applicationDeadline);
            return (
              <article
                key={opp.id}
                className="surface-card rounded-2xl overflow-hidden flex flex-col justify-between min-w-0"
              >
                <EventBanner
                  title={opp.title}
                  type={opp.type}
                  bannerUrl={opp.bannerUrl}
                  bannerTheme={opp.bannerTheme}
                  organizerName={opp.organizerName}
                  variant="card"
                />

                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between gap-4 min-w-0">
                  <div className="space-y-2.5 min-w-0">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold ${theme.badgeClasses}`}>
                        {theme.label}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[#52525B] font-mono tabular-nums">
                        <Clock aria-hidden="true" className="w-3 h-3 text-[#63636B]" />
                        <span>{deadline.label}</span>
                      </span>
                    </div>

                    <h3 className="text-base font-semibold text-[#18181B] tracking-tight line-clamp-1">
                      {opp.title}
                    </h3>

                    <div className="grid grid-cols-2 gap-2.5 pt-1">
                      <div className="bg-[#F4F4F6] rounded-xl p-3">
                        <p className="text-[11px] text-[#63636B]">Applicants</p>
                        <p className="text-sm font-semibold text-[#18181B] tabular-nums">
                          {opp.applicantCount ?? 1}
                        </p>
                      </div>
                      <div className="bg-[#F4F4F6] rounded-xl p-3">
                        <p className="text-[11px] text-[#63636B]">Submissions</p>
                        <p className="text-sm font-semibold text-[#18181B] tabular-nums">
                          {opp.submissionCount ?? 0}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setEditingBannerOpp(opp)}
                      className="btn-tactile-secondary px-3.5 py-2 rounded-xl text-xs font-medium inline-flex items-center gap-1.5 min-h-[36px]"
                    >
                      <Palette aria-hidden="true" className="w-3.5 h-3.5" />
                      <span>Edit Banner</span>
                    </button>

                    <Link
                      to={`/opportunities/${opp.slug}`}
                      className="btn-tactile-secondary px-3.5 py-2 rounded-xl text-xs font-medium inline-flex items-center gap-1.5 min-h-[36px]"
                    >
                      <span>Developer View</span>
                      <ArrowRight aria-hidden="true" className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <CreateOpportunityModal isOpen={createOpen} onClose={() => setCreateOpen(false)} />

      <BannerEditorModal
        isOpen={Boolean(editingBannerOpp)}
        opportunity={editingBannerOpp}
        onClose={() => setEditingBannerOpp(null)}
        onSave={(id, banner) => {
          updateOpportunityBanner(id, banner);
          toast.success('Event banner updated everywhere');
        }}
      />
    </div>
  );
};
