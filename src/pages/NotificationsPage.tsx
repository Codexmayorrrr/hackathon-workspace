import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Bell, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight
} from 'lucide-react';
import { useWorkspaceStore } from '../store/useWorkspaceStore';
import { MOCK_OPPORTUNITIES } from '../data/mockOpportunities';
import { getRelativeDeadline, formatEventDate } from '../utils/dateUtils';

export const NotificationsPage: React.FC = () => {
  const savedWorkspaces = useWorkspaceStore((state) => state.savedWorkspaces);

  const notifications = Object.values(savedWorkspaces).map((ws) => {
    const opp = MOCK_OPPORTUNITIES.find((o) => o.id === ws.opportunityId);
    if (!opp) return null;

    const deadline = getRelativeDeadline(opp.applicationDeadline);
    const mandatoryReqs = opp.requirements.filter((r) => r.mandatory);
    const incompleteMandatory = mandatoryReqs.filter((r) => !ws.items[r.id]?.completed);

    const isApplied = ws.stage === 'applied' || ws.stage === 'results';

    return {
      workspace: ws,
      opportunity: opp,
      deadline,
      mandatoryReqs,
      incompleteMandatory,
      isApplied,
    };
  }).filter(Boolean);

  return (
    <div className="space-y-10 sm:space-y-12 pb-16 bg-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-900 tracking-tight [text-wrap:balance] flex items-center gap-3">
            <span>Reminder & Notification Center</span>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#FDFDFD] text-neutral-700 font-semibold font-mono">
              Checklist-Aware
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 [text-wrap:pretty] max-w-2xl">
            Dynamic alerts that inspect your incomplete deliverables instead of sending generic countdown emails.
          </p>
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="p-12 sm:p-16 rounded-2xl bg-[#FDFDFD] text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-neutral-400 mx-auto">
            <Bell className="w-5 h-5 stroke-[1.75]" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-neutral-900 [text-wrap:balance]">No active alerts</h3>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-sm mx-auto [text-wrap:pretty]">
              Save opportunities from Discovery to activate escalating reminders and checklist tracking.
            </p>
          </div>
          <Link
            to="/discover"
            className="btn-tactile-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white active:scale-[0.97]"
          >
            <span>Browse Opportunities</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {notifications.map((item) => {
            if (!item) return null;
            const { workspace, opportunity: opp, deadline, incompleteMandatory, isApplied } = item;

            if (isApplied) {
              return (
                <div
                  key={workspace.id}
                  className="p-5 sm:p-6 rounded-2xl bg-[#FDFDFD] flex flex-col sm:flex-row sm:items-center justify-between gap-4 opacity-80"
                >
                  <div className="flex items-center gap-3.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 stroke-[2]" />
                    <div>
                      <h4 className="text-xs sm:text-sm font-semibold text-neutral-900 [text-wrap:balance]">
                        {opp.title} — Application Submitted
                      </h4>
                      <p className="text-xs text-neutral-400 [text-wrap:pretty]">
                        All remaining reminders have been automatically cancelled.
                      </p>
                    </div>
                  </div>

                  <Link
                    to={`/workspaces/${opp.id}`}
                    className="bg-white hover:bg-neutral-50 px-4 py-2 rounded-xl text-xs font-medium self-start sm:self-auto active:scale-[0.97] text-neutral-700 transition-colors"
                  >
                    View Workspace
                  </Link>
                </div>
              );
            }

            const hasMissing = incompleteMandatory.length > 0;

            return (
              <div
                key={workspace.id}
                className="p-6 sm:p-8 rounded-2xl bg-[#FDFDFD] hover:bg-[#f9f9fa] transition-colors space-y-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="p-2.5 rounded-xl bg-white text-amber-700 mt-0.5 flex-shrink-0">
                      <AlertTriangle className="w-4 h-4 stroke-[1.75]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold text-amber-800 font-mono bg-white px-2.5 py-0.5 rounded-full tabular-nums">
                          {deadline.label}
                        </span>
                        <span className="text-neutral-300">·</span>
                        <span className="text-xs text-neutral-500 tabular-nums font-mono">
                          Cutoff: {formatEventDate(opp.applicationDeadline)}
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-neutral-900 mt-1.5 [text-wrap:balance]">
                        {opp.title}
                      </h3>
                    </div>
                  </div>

                  <Link
                    to={`/workspaces/${opp.id}?tab=checklist`}
                    className="btn-tactile-primary inline-flex items-center justify-center gap-1.5 px-4.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold w-full sm:w-auto text-center active:scale-[0.97] text-white"
                  >
                    <span>Open Checklist</span>
                    <ArrowRight className="w-3.5 h-3.5 stroke-[1.75]" />
                  </Link>
                </div>

                <div className="p-4 sm:p-5 rounded-xl bg-white text-xs sm:text-sm">
                  {hasMissing ? (
                    <div className="space-y-2.5">
                      <p className="text-neutral-900 [text-wrap:pretty]">
                        You still have <strong className="text-amber-800 font-semibold tabular-nums">{incompleteMandatory.length} required deliverable{incompleteMandatory.length > 1 ? 's' : ''}</strong> unchecked:
                      </p>
                      <ul className="list-disc list-inside space-y-1.5 text-neutral-600 pl-1">
                        {incompleteMandatory.map((m) => (
                          <li key={m.id} className="truncate">
                            <span className="font-medium text-neutral-900">{m.title}</span>{' '}
                            <span className="text-neutral-400">({m.step})</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2.5 text-emerald-700 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 stroke-[2] flex-shrink-0" />
                      <span className="[text-wrap:pretty]">All mandatory deliverables checked! Ready for final submission before cutoff.</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
