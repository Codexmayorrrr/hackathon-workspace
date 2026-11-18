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
  Compass 
} from 'lucide-react';
import { useWorkspaceStore } from '../store/useWorkspaceStore';
import { MOCK_OPPORTUNITIES } from '../data/mockOpportunities';
import { getRelativeDeadline } from '../utils/dateUtils';
import { CalendarSyncModal } from '../components/calendar/CalendarSyncModal';
import { toast } from 'sonner';

export const SavedQueuePage: React.FC = () => {
  const navigate = useNavigate();
  const savedWorkspaces = useWorkspaceStore((state) => state.savedWorkspaces);
  const setWorkspaceStage = useWorkspaceStore((state) => state.setWorkspaceStage);

  const [pastSectionOpen, setPastSectionOpen] = useState(false);
  const [calendarModalOpen, setCalendarModalOpen] = useState(false);
  const [selectedOppForCalendar, setSelectedOppForCalendar] = useState<string | null>(null);

  const savedList = Object.values(savedWorkspaces).map((ws) => {
    const opp = MOCK_OPPORTUNITIES.find((o) => o.id === ws.opportunityId);
    return { workspace: ws, opportunity: opp };
  }).filter((item) => item.opportunity !== undefined);

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

  const handleMarkApplied = (workspaceId: string, title: string) => {
    setWorkspaceStage(workspaceId, 'applied');
    toast.success('Marked as Applied! 🎉', {
      description: `Moved "${title}" to Submitted & Past. Reminders cancelled.`,
    });
  };

  const handleOpenCalendarModal = (oppId: string) => {
    setSelectedOppForCalendar(oppId);
    setCalendarModalOpen(true);
  };

  return (
    <div className="space-y-8 sm:space-y-10 pb-16 bg-white">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-1">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-semibold text-neutral-950 tracking-tight flex items-center gap-2.5" style={{ textWrap: 'balance' }}>
            <span>Saved Queue</span>
            <span className="text-xs font-normal text-neutral-400 font-mono tabular-nums">
              ({activeItems.length})
            </span>
          </h1>
          <p className="text-sm text-neutral-500 leading-relaxed max-w-xl" style={{ textWrap: 'pretty' }}>
            Sorted strictly by closest deadline so no mandatory submission cutoff is missed.
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedOppForCalendar(null);
            setCalendarModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium self-start sm:self-auto active:scale-[0.97] bg-[#F5F5F5] hover:bg-[#EBEBEB] text-neutral-800 transition-colors"
        >
          <CalendarSync className="w-3.5 h-3.5 text-neutral-500 stroke-[1.75]" />
          <span>Sync All to Calendar</span>
        </button>
      </div>

      {/* Active Closest-Deadline Queue */}
      {activeItems.length === 0 ? (
        <div className="p-12 sm:p-16 rounded-2xl bg-[#FDFDFD] text-center space-y-4">
          <div className="w-10 h-10 rounded-xl bg-[#F5F5F5] flex items-center justify-center text-neutral-400 mx-auto">
            <BookmarkCheck className="w-5 h-5 stroke-[1.75]" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-neutral-900">Your queue is empty</h3>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto" style={{ textWrap: 'pretty' }}>
              Save opportunities from Discovery to track mandatory requirements, deadlines, and drafts.
            </p>
          </div>
          <Link
            to="/discover"
            className="btn-tactile-primary inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium text-white active:scale-[0.97]"
          >
            <Compass className="w-3.5 h-3.5 stroke-[1.75]" />
            <span>Explore Opportunities</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {activeItems.map(({ workspace, opportunity }) => {
              const opp = opportunity!;
              const deadline = getRelativeDeadline(opp.applicationDeadline);
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
                critical: 'bg-rose-500 animate-pulse',
                warning: 'bg-amber-500',
                normal: 'bg-neutral-400',
                past: 'bg-neutral-300',
              }[deadline.urgency];

              return (
                <motion.div
                  key={workspace.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ type: 'spring', duration: 0.35, bounce: 0 }}
                  className="p-6 rounded-2xl bg-[#FDFDFD] hover:bg-[#F8F8FA] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-6 group"
                >
                  {/* Left Column: Info & Progress */}
                  <div className="flex-1 space-y-3 min-w-0">
                    {/* Urgency & Stage Meta */}
                    <div className="flex items-center gap-2.5 text-xs">
                      <span className="inline-flex items-center gap-1.5 font-mono tabular-nums text-neutral-600 text-xs">
                        <span className={`w-1.5 h-1.5 rounded-full ${urgencyDot}`} />
                        <span>{deadline.label}</span>
                      </span>

                      <span className="text-neutral-300">·</span>

                      <span className="text-[10px] uppercase tracking-wider font-semibold text-neutral-400">
                        {workspace.stage}
                      </span>
                    </div>

                    {/* Title */}
                    <div>
                      <Link
                        to={`/workspaces/${opp.id}`}
                        className="text-base font-semibold text-neutral-950 hover:text-neutral-600 transition-colors tracking-tight line-clamp-1"
                      >
                        {opp.title}
                      </Link>
                    </div>

                    {/* Progress Bar & Status */}
                    <div className="flex items-center gap-3 max-w-md pt-0.5">
                      <div className="flex-1 h-1.5 bg-neutral-200/80 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-neutral-900 rounded-full"
                          initial={false}
                          animate={{ width: `${progressPercent}%` }}
                          transition={{ type: 'spring', duration: 0.3, bounce: 0 }}
                        />
                      </div>
                      <span className="text-[11px] font-mono text-neutral-400 tabular-nums whitespace-nowrap">
                        {completedCount}/{totalCount} ({progressPercent}%)
                      </span>
                    </div>

                    {/* Next Missing Alert */}
                    {nextMissing ? (
                      <p className="text-xs text-neutral-500 pt-0.5 truncate">
                        Next: <span className="text-neutral-900 font-medium">{nextMissing.title}</span>
                      </p>
                    ) : (
                      <p className="text-xs text-emerald-700 pt-0.5 flex items-center gap-1.5 font-medium">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600 stroke-[2]" />
                        <span>All deliverables checked. Ready to submit!</span>
                      </p>
                    )}
                  </div>

                  {/* Right Column: Actions */}
                  <div className="flex items-center gap-2.5 flex-shrink-0 self-start md:self-center">
                    <button
                      onClick={() => handleOpenCalendarModal(opp.id)}
                      title="Sync to Calendar"
                      className={`p-2.5 rounded-xl text-xs flex items-center justify-center flex-shrink-0 active:scale-[0.96] transition-all ${
                        workspace.googleCalendarSynced || workspace.appleCalendarSynced
                          ? 'bg-neutral-950 text-white font-medium'
                          : 'btn-tactile-secondary'
                      }`}
                    >
                      <Calendar className="w-4 h-4 stroke-[1.75]" />
                    </button>

                    <button
                      onClick={() => handleMarkApplied(workspace.id, opp.title)}
                      className="btn-tactile-secondary px-4 py-2.5 rounded-xl text-xs font-medium text-center"
                    >
                      Mark Applied
                    </button>

                    <button
                      onClick={() => navigate(`/workspaces/${opp.id}`)}
                      className="btn-tactile-primary px-4.5 py-2.5 rounded-xl text-xs font-semibold inline-flex items-center gap-2 group/btn"
                    >
                      <span>Open Workspace</span>
                      <ArrowRight className="w-3.5 h-3.5 stroke-[2] transition-transform duration-150 group-hover/btn:translate-x-0.5" />
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
        <div className="pt-6 space-y-4">
          <button
            onClick={() => setPastSectionOpen(!pastSectionOpen)}
            className="flex items-center justify-between w-full p-4 sm:p-5 rounded-2xl bg-[#FDFDFD] text-left hover:bg-[#F8F8FA] transition-colors active:scale-[0.98]"
          >
            <div className="flex items-center gap-3">
              <CheckCircle className="w-4 h-4 text-emerald-600 stroke-[2]" />
              <span className="text-xs font-semibold text-neutral-900">
                Submitted & Completed ({submittedItems.length})
              </span>
            </div>
            {pastSectionOpen ? (
              <ChevronUp className="w-4 h-4 text-neutral-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-neutral-400" />
            )}
          </button>

          {pastSectionOpen && (
            <div className="space-y-3">
              {submittedItems.map(({ workspace, opportunity }) => {
                const opp = opportunity!;
                return (
                  <div
                    key={workspace.id}
                    className="p-5 rounded-2xl bg-[#FDFDFD] flex items-center justify-between gap-4 text-xs opacity-80"
                  >
                    <div className="space-y-1">
                      <h4 className="font-semibold text-neutral-900">{opp.title}</h4>
                      <p className="text-neutral-400 font-mono text-[11px] tabular-nums">
                        Submitted · Stage: {workspace.stage.toUpperCase()}
                      </p>
                    </div>

                    <Link
                      to={`/workspaces/${opp.id}`}
                      className="px-3.5 py-1.5 rounded-lg bg-[#F5F5F5] hover:bg-[#EBEBEB] text-neutral-800 font-medium active:scale-[0.97] transition-colors"
                    >
                      View Workspace
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
