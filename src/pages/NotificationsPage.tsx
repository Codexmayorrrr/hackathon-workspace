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
import { getRelativeDeadline } from '../utils/dateUtils';

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
    <div className="space-y-8 sm:space-y-10 pb-16 bg-white">
      {/* Header */}
      <div className="space-y-2 pb-1">
        <h1 className="text-2xl sm:text-3xl font-semibold text-neutral-950 tracking-tight flex items-center gap-3" style={{ textWrap: 'balance' }}>
          <span>Reminders</span>
          <span className="text-xs font-normal text-neutral-400 font-mono tabular-nums">
            ({notifications.length})
          </span>
        </h1>
        <p className="text-sm text-neutral-500 leading-relaxed max-w-xl" style={{ textWrap: 'pretty' }}>
          Escalating notifications that inspect your incomplete deliverables instead of generic countdown emails.
        </p>
      </div>

      {notifications.length === 0 ? (
        <div className="p-12 sm:p-16 rounded-2xl bg-[#FDFDFD] text-center space-y-4">
          <div className="w-10 h-10 rounded-xl bg-[#F5F5F5] flex items-center justify-center text-neutral-400 mx-auto">
            <Bell className="w-5 h-5 stroke-[1.75]" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-neutral-900">No active alerts</h3>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto" style={{ textWrap: 'pretty' }}>
              Save opportunities from Discovery to activate escalating reminders and checklist tracking.
            </p>
          </div>
          <Link
            to="/discover"
            className="btn-tactile-primary inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium text-white active:scale-[0.97]"
          >
            <span>Browse Opportunities</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
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
                    <div className="space-y-0.5">
                      <h4 className="text-sm font-semibold text-neutral-900">
                        {opp.title} — Application Submitted
                      </h4>
                      <p className="text-xs text-neutral-400">
                        All remaining reminders have been automatically cancelled.
                      </p>
                    </div>
                  </div>

                  <Link
                    to={`/workspaces/${opp.id}`}
                    className="bg-[#F5F5F5] hover:bg-[#EBEBEB] px-3.5 py-1.5 rounded-lg text-xs font-medium self-start sm:self-auto active:scale-[0.97] text-neutral-700 transition-colors"
                  >
                    View Workspace
                  </Link>
                </div>
              );
            }

            const isUrgent = deadline.urgency === 'critical' || deadline.urgency === 'warning';

            return (
              <div
                key={workspace.id}
                className="p-5 sm:p-6 rounded-2xl bg-[#FDFDFD] hover:bg-[#F8F8FA] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5">
                  <div className={`p-2 rounded-lg mt-0.5 flex-shrink-0 ${
                    isUrgent ? 'bg-amber-100/60 text-amber-800' : 'bg-[#F5F5F5] text-neutral-600'
                  }`}>
                    {isUrgent ? (
                      <AlertTriangle className="w-4 h-4 stroke-[2]" />
                    ) : (
                      <Bell className="w-4 h-4 stroke-[1.75]" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-semibold text-neutral-950">
                        {opp.title}
                      </h4>
                      <span className="text-xs font-mono tabular-nums text-neutral-500">
                        · {deadline.label}
                      </span>
                    </div>

                    <p className="text-xs text-neutral-500">
                      {incompleteMandatory.length > 0 ? (
                        <span>
                          <strong className="font-semibold text-neutral-800 font-mono tabular-nums">{incompleteMandatory.length}</strong> mandatory deliverable{incompleteMandatory.length > 1 ? 's' : ''} still missing before deadline: <span className="text-neutral-700">{incompleteMandatory.map((r) => r.title).slice(0, 2).join(', ')}{incompleteMandatory.length > 2 ? '…' : ''}</span>
                        </span>
                      ) : (
                        <span className="text-emerald-700 font-medium">All mandatory checklist items are marked complete. Ready to submit!</span>
                      )}
                    </p>
                  </div>
                </div>

                <Link
                  to={`/workspaces/${opp.id}?tab=checklist`}
                  className="btn-tactile-primary inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold self-start md:self-center active:scale-[0.97] text-white flex-shrink-0"
                >
                  <span>Open Checklist</span>
                  <ArrowRight className="w-3.5 h-3.5 stroke-[2]" />
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
