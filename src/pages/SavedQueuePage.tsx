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
  const toggleGoogleCalendar = useWorkspaceStore((state) => state.toggleGoogleCalendar);

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
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-2">
        <div className="space-y-1.5">
          <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 tracking-tight flex items-center gap-2.5" style={{ textWrap: 'balance' }}>
            <span>Saved Queue</span>
            <span className="text-xs font-normal text-neutral-400 font-mono tabular-nums">
              · {activeItems.length} active
            </span>
          </h1>
          <p className="text-sm text-neutral-500 leading-relaxed max-w-xl" style={{ textWrap: 'pretty' }}>
            Sorted strictly by closest deadline so no mandatory cutoff is missed.
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedOppForCalendar(null);
            setCalendarModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium self-start sm:self-auto active:scale-[0.97] bg-[#FDFDFD] hover:bg-[#f2f2f4] text-neutral-800 transition-[transform,background-color] duration-150"
        >
          <CalendarSync className="w-3.5 h-3.5 text-neutral-500 stroke-[1.75]" />
          <span>Sync to Calendar</span>
        </button>
      </div>

      {/* Active Closest-Deadline Queue */}
      {activeItems.length === 0 ? (
        <div className="p-12 sm:p-16 rounded-2xl bg-[#FDFDFD] text-center space-y-4">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-neutral-400 mx-auto">
            <BookmarkCheck className="w-5 h-5 stroke-[1.75]" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-neutral-900">Your queue is empty</h3>
            <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto" style={{ textWrap: 'pretty' }}>
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
                  className="p-6 rounded-2xl bg-[#FDFDFD] hover:bg-[#f7f7f9] transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-5 group"
                >
                  {/* Left: Urgency Pill & Stage */}
                  <div className="flex items-center gap-2.5 lg:w-44 flex-shrink-0">
                    <span className="inline-flex items-center gap-1.5 text-xs font-mono tabular-nums text-neutral-600 bg-white px-3 py-1 rounded-full">
                      <span className={`w-1.5 h-1.5 rounded-full ${urgencyDot}`} />
                      <span>{deadline.label}</span>
                    </span>

                    <span className="text-[10px] px-2.5 py-1 rounded-md uppercase tracking-wider font-semibold text-neutral-500 bg-white">
                      {workspace.stage}
                    </span>
                  </div>

                  {/* Center: Title, Progress & Next Missing */}
                  <div className="flex-1 space-y-2.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        to={`/workspaces/${opp.id}`}
                        className="text-base font-semibold text-neutral-900 hover:text-blue-600 transition-colors tracking-tight truncate max-w-lg"
                      >
                        {opp.title}
                      </Link>
                    </div>

                    {/* Progress Bar */}
                    <div className="flex items-center gap-3 max-w-md">
                      <div className="flex-1 h-2 bg-neutral-100 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-neutral-900 rounded-full"
                          initial={false}
                          animate={{ width: `${progressPercent}%` }}
                          transition={{ type: 'spring', duration: 0.3, bounce: 0 }}
                        />
                      </div>
                      <span className="text-xs font-mono text-neutral-400 tabular-nums whitespace-nowrap text-[11px]">
                        {completedCount}/{totalCount} ready ({progressPercent}%)
                      </span>
                    </div>

                    {/* Next missing callout */}
                    {nextMissing ? (
                      <div className="flex items-center gap-2 text-xs text-amber-700 pt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        <span className="truncate">Next deliverable: <strong className="font-semibold text-neutral-900">{nextMissing.title}</strong></span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-xs text-emerald-700 pt-0.5 font-medium">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600 stroke-[2]" />
                        <span>All deliverables checked! Ready to submit.</span>
                      </div>
                    )}
                  </div>

                  {/* Right Actions - Responsive Layout on Mobile & Desktop */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-shrink-0 pt-3 lg:pt-0 w-full lg:w-auto">
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => handleOpenCalendarModal(opp.id)}
                        title="Calendar Integration"
                        className={`p-2.5 rounded-xl text-xs transition-[transform,background-color,color] duration-150 flex items-center justify-center flex-shrink-0 active:scale-[0.97] ${
                          workspace.googleCalendarSynced || workspace.appleCalendarSynced
                            ? 'bg-blue-600 text-white font-semibold'
                            : 'bg-white text-neutral-700 hover:bg-neutral-50'
                        }`}
                      >
                        <Calendar className="w-4 h-4 stroke-[1.75]" />
                      </button>

                      <button
                        onClick={() => handleMarkApplied(workspace.id, opp.title)}
                        className="bg-white hover:bg-neutral-50 text-neutral-800 px-4 py-2.5 rounded-xl text-xs font-medium flex-1 sm:flex-none text-center active:scale-[0.97] transition-[transform,background-color] duration-150"
                      >
                        Mark Applied
                      </button>
                    </div>

                    <button
                      onClick={() => navigate(`/workspaces/${opp.id}`)}
                      className="btn-tactile-primary inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold w-full sm:w-auto text-center active:scale-[0.97] text-white"
                    >
                      <span>Open Workspace</span>
                      <ArrowRight className="w-3.5 h-3.5 stroke-[1.75]" />
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
            className="flex items-center justify-between w-full p-4 sm:p-5 rounded-2xl bg-[#FDFDFD] text-left hover:bg-[#f7f7f9] transition-colors active:scale-[0.98]"
          >
            <div className="flex items-center gap-2.5">
              <CheckCircle className="w-4 h-4 text-emerald-600 stroke-[2]" />
              <h3 className="text-sm font-semibold text-neutral-900">
                Submitted & Past Opportunities ({submittedItems.length})
              </h3>
            </div>
            {pastSectionOpen ? (
              <ChevronUp className="w-4 h-4 text-neutral-400 stroke-[1.75]" />
            ) : (
              <ChevronDown className="w-4 h-4 text-neutral-400 stroke-[1.75]" />
            )}
          </button>

          {pastSectionOpen && (
            <div className="space-y-3 pl-2 sm:pl-4">
              {submittedItems.map(({ workspace, opportunity }) => {
                const opp = opportunity!;
                return (
                  <div
                    key={workspace.id}
                    className="p-4 rounded-xl bg-[#FDFDFD] flex items-center justify-between gap-4"
                  >
                    <div>
                      <h4 className="text-sm font-medium text-neutral-900">
                        {opp.title}
                      </h4>
                      <p className="text-xs text-neutral-400 mt-0.5 tabular-nums">
                        Status: <span className="text-emerald-700 uppercase font-semibold text-[10px]">{workspace.stage}</span> · All deadlines passed
                      </p>
                    </div>

                    <Link
                      to={`/workspaces/${opp.id}`}
                      className="bg-white hover:bg-neutral-50 px-3.5 py-1.5 rounded-lg text-xs font-medium text-neutral-700 active:scale-[0.97] transition-[transform,background-color] duration-150"
                    >
                      Archive →
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <CalendarSyncModal
        isOpen={calendarModalOpen}
        onClose={() => setCalendarModalOpen(false)}
        opportunityTitle={
          selectedOppForCalendar
            ? MOCK_OPPORTUNITIES.find((o) => o.id === selectedOppForCalendar)?.title
            : undefined
        }
        isGoogleSynced={
          selectedOppForCalendar
            ? savedWorkspaces[selectedOppForCalendar]?.googleCalendarSynced
            : false
        }
        onToggleGoogleSync={(synced) => {
          if (selectedOppForCalendar) {
            toggleGoogleCalendar(selectedOppForCalendar, synced);
          }
        }}
      />
    </div>
  );
};
