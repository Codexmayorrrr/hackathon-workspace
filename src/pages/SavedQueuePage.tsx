import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookmarkCheck,
  Calendar,
  CheckCircle,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  CalendarSync,
  Compass,
} from 'lucide-react';
import { useWorkspaceStore } from '../store/useWorkspaceStore';
import { MOCK_OPPORTUNITIES } from '../data/mockOpportunities';
import { getRelativeDeadline } from '../utils/dateUtils';
import { CATEGORY_THEMES } from '../utils/categoryTheme';
import { CalendarSyncModal } from '../components/calendar/CalendarSyncModal';
import { toast } from 'sonner';

export const SavedQueuePage: React.FC = () => {
  const navigate = useNavigate();
  const savedWorkspaces = useWorkspaceStore((state) => state.savedWorkspaces);
  const setWorkspaceStage = useWorkspaceStore((state) => state.setWorkspaceStage);

  const [pastSectionOpen, setPastSectionOpen] = useState(false);
  const [calendarModalOpen, setCalendarModalOpen] = useState(false);
  const [selectedOppForCalendar, setSelectedOppForCalendar] = useState<string | null>(null);

  const savedList = Object.values(savedWorkspaces)
    .map((ws) => {
      const opp = MOCK_OPPORTUNITIES.find((o) => o.id === ws.opportunityId);
      return { workspace: ws, opportunity: opp };
    })
    .filter((item) => item.opportunity !== undefined);

  const activeItems = savedList.filter(
    (item) => item.workspace.stage === 'saved' || item.workspace.stage === 'preparing'
  );

  const submittedItems = savedList.filter(
    (item) => item.workspace.stage === 'applied' || item.workspace.stage === 'results'
  );

  activeItems.sort((a, b) => {
    const timeA = new Date(a.opportunity!.applicationDeadline).getTime();
    const timeB = new Date(b.opportunity!.applicationDeadline).getTime();
    return timeA - timeB;
  });

  const handleMarkApplied = (workspaceId: string, title: string, prevStage: any) => {
    setWorkspaceStage(workspaceId, 'applied');
    toast.success('Marked as applied', {
      description: `Moved "${title}" to Submitted & Completed. Alerts paused.`,
      action: {
        label: 'Undo',
        onClick: () => setWorkspaceStage(workspaceId, prevStage),
      },
    });
  };

  const handleOpenCalendarModal = (oppId: string) => {
    setSelectedOppForCalendar(oppId);
    setCalendarModalOpen(true);
  };

  return (
    <div className="space-y-8 sm:space-y-10 pb-16 min-w-0">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#18181B] tracking-tight flex items-center gap-2.5 flex-wrap">
            <span>Saved Queue</span>
            <span className="text-sm font-medium text-[#63636B] font-mono tabular-nums">
              ({activeItems.length})
            </span>
          </h1>
          <p className="text-sm text-[#52525B] leading-relaxed max-w-[65ch]">
            Sorted strictly by closest deadline so no mandatory submission cutoff is missed.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setSelectedOppForCalendar(null);
            setCalendarModalOpen(true);
          }}
          className="btn-tactile-secondary px-4 py-2.5 rounded-xl text-xs font-medium self-start sm:self-auto gap-2 min-h-[38px]"
        >
          <CalendarSync aria-hidden="true" className="w-4 h-4 text-[#52525B] stroke-[1.75]" />
          <span>Sync deadlines</span>
        </button>
      </div>

      {/* Active Closest-Deadline Queue */}
      {activeItems.length === 0 ? (
        <div className="surface-card p-10 sm:p-16 rounded-2xl text-center space-y-4">
          <div className="w-11 h-11 rounded-xl bg-[#F4F4F6] flex items-center justify-center text-[#52525B] mx-auto">
            <BookmarkCheck aria-hidden="true" className="w-5 h-5 stroke-[1.75]" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-base font-semibold text-[#18181B]">Your queue is empty</h2>
            <p className="text-sm text-[#52525B] max-w-sm mx-auto">
              Save opportunities from Discover to track mandatory requirements, deadlines, and drafts.
            </p>
          </div>
          <Link
            to="/discover"
            className="btn-tactile-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold min-h-[40px]"
          >
            <Compass aria-hidden="true" className="w-4 h-4 stroke-[2]" />
            <span>Explore opportunities</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {activeItems.map(({ workspace, opportunity }) => {
              const opp = opportunity!;
              const deadline = getRelativeDeadline(opp.applicationDeadline);
              const theme = CATEGORY_THEMES[opp.type] || CATEGORY_THEMES.hackathon;
              const mandatoryReqs = opp.requirements.filter((r) => r.mandatory);

              const completedCount = opp.requirements.filter(
                (r) => workspace.items[r.id]?.completed
              ).length;
              const totalCount = opp.requirements.length;
              const progressPercent = Math.round((completedCount / totalCount) * 100);

              const nextMissing = mandatoryReqs.find(
                (r) => !workspace.items[r.id]?.completed
              );

              const urgencyDot = {
                critical: 'bg-rose-600 motion-safe:animate-pulse',
                warning: 'bg-amber-600',
                normal: 'bg-[#63636B]',
                past: 'bg-neutral-400',
              }[deadline.urgency];

              return (
                <motion.div
                  key={workspace.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ type: 'spring', duration: 0.3, bounce: 0 }}
                  className="surface-card surface-card-interactive p-5 sm:p-6 rounded-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-5 min-w-0"
                >
                  {/* Left Column: Info & Progress */}
                  <div className="flex-1 space-y-3 min-w-0">
                    {/* Meta */}
                    <div className="flex items-center gap-2.5 flex-wrap text-xs">
                      <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold ${theme.badgeClasses}`}>
                        {theme.label}
                      </span>

                      <span className="inline-flex items-center gap-1.5 font-mono tabular-nums text-[#52525B] font-medium text-xs">
                        <span aria-hidden="true" className={`w-1.5 h-1.5 rounded-full ${urgencyDot}`} />
                        <span>{deadline.label}</span>
                      </span>

                      <span aria-hidden="true" className="text-[#63636B]">·</span>

                      <span className="text-[11px] uppercase tracking-wider font-semibold text-[#63636B]">
                        {workspace.stage}
                      </span>
                    </div>

                    {/* Title */}
                    <div className="min-w-0">
                      <Link
                        to={`/workspaces/${opp.id}`}
                        className="text-base sm:text-lg font-semibold text-[#18181B] hover:text-[#52525B] transition-colors tracking-tight block"
                      >
                        {opp.title}
                      </Link>
                    </div>

                    {/* Progress Bar & Status */}
                    <div className="flex items-center gap-3 max-w-md pt-0.5">
                      <div
                        role="progressbar"
                        aria-valuenow={progressPercent}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`${opp.title} completion progress`}
                        className="flex-1 h-2 bg-[#F4F4F6] rounded-full overflow-hidden"
                      >
                        <motion.div
                          className="h-full bg-[#18181B] rounded-full"
                          initial={false}
                          animate={{ width: `${progressPercent}%` }}
                          transition={{ type: 'spring', duration: 0.3, bounce: 0 }}
                        />
                      </div>
                      <span className="text-xs font-mono font-medium text-[#52525B] tabular-nums whitespace-nowrap">
                        {completedCount}/{totalCount} ({progressPercent}%)
                      </span>
                    </div>

                    {/* Next Missing Deliverable */}
                    {nextMissing ? (
                      <p className="text-[13px] text-[#52525B] truncate" title={nextMissing.title}>
                        Next deliverable: <span className="text-[#18181B] font-medium">{nextMissing.title}</span>
                      </p>
                    ) : (
                      <p className="text-[13px] text-emerald-700 pt-0.5 flex items-center gap-1.5 font-medium">
                        <CheckCircle aria-hidden="true" className="w-4 h-4 stroke-[2] flex-shrink-0" />
                        <span>All deliverables checked. Ready to submit.</span>
                      </p>
                    )}
                  </div>

                  {/* Right Column: Actions (wraps cleanly down to 320px) */}
                  <div className="flex items-center gap-2.5 flex-wrap flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => handleOpenCalendarModal(opp.id)}
                      title={`Sync ${opp.title} to calendar`}
                      aria-label={`Sync ${opp.title} to calendar`}
                      className={`w-10 h-10 rounded-xl text-xs flex items-center justify-center flex-shrink-0 active:scale-[0.96] transition-[transform,background-color,color] duration-150 ${
                        workspace.googleCalendarSynced || workspace.appleCalendarSynced
                          ? 'bg-[#18181B] text-white font-medium'
                          : 'btn-tactile-secondary'
                      }`}
                    >
                      <Calendar aria-hidden="true" className="w-4 h-4 stroke-[1.75]" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleMarkApplied(workspace.id, opp.title, workspace.stage)}
                      className="btn-tactile-secondary px-4 py-2.5 rounded-xl text-xs font-medium min-h-[40px]"
                    >
                      Mark applied
                    </button>

                    <button
                      type="button"
                      onClick={() => navigate(`/workspaces/${opp.id}`)}
                      className="btn-tactile-primary ps-4 pe-3.5 py-2.5 rounded-xl text-xs font-semibold inline-flex items-center gap-2 min-h-[40px] group/btn"
                    >
                      <span>Open Workspace</span>
                      <ArrowRight aria-hidden="true" className="w-3.5 h-3.5 stroke-[2] rtl:-scale-x-100 transition-transform duration-150 group-hover/btn:translate-x-0.5" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Collapsible Completed Section */}
      {submittedItems.length > 0 && (
        <div className="pt-4 space-y-4">
          <button
            type="button"
            onClick={() => setPastSectionOpen(!pastSectionOpen)}
            aria-expanded={pastSectionOpen}
            className="surface-card surface-card-interactive flex items-center justify-between w-full p-4 sm:p-5 rounded-2xl text-start active:scale-[0.99]"
          >
            <div className="flex items-center gap-3">
              <CheckCircle aria-hidden="true" className="w-4 h-4 text-emerald-700 stroke-[2]" />
              <span className="text-[13px] font-semibold text-[#18181B]">
                Submitted & Completed ({submittedItems.length})
              </span>
            </div>
            {pastSectionOpen ? (
              <ChevronUp aria-hidden="true" className="w-4 h-4 text-[#52525B]" />
            ) : (
              <ChevronDown aria-hidden="true" className="w-4 h-4 text-[#52525B]" />
            )}
          </button>

          {pastSectionOpen && (
            <div className="space-y-3">
              {submittedItems.map(({ workspace, opportunity }) => {
                const opp = opportunity!;
                return (
                  <div
                    key={workspace.id}
                    className="surface-card p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                  >
                    <div className="space-y-1">
                      <h3 className="text-sm font-semibold text-[#18181B]">{opp.title}</h3>
                      <p className="text-[#52525B] font-mono text-[11px] tabular-nums">
                        Submitted · Stage: {workspace.stage.toUpperCase()}
                      </p>
                    </div>

                    <Link
                      to={`/workspaces/${opp.id}`}
                      className="btn-tactile-secondary px-4 py-2 rounded-xl text-xs font-medium self-start sm:self-auto min-h-[36px]"
                    >
                      Open Workspace
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Calendar Sync Modal */}
      <CalendarSyncModal
        isOpen={calendarModalOpen}
        onClose={() => setCalendarModalOpen(false)}
        opportunityTitle={
          selectedOppForCalendar
            ? MOCK_OPPORTUNITIES.find((o) => o.id === selectedOppForCalendar)?.title
            : undefined
        }
      />
    </div>
  );
};
