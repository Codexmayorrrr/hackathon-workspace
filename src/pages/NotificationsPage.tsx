import React from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Compass,
} from 'lucide-react';
import { useWorkspaceStore } from '../store/useWorkspaceStore';
import { MOCK_OPPORTUNITIES } from '../data/mockOpportunities';
import { getRelativeDeadline } from '../utils/dateUtils';

export const NotificationsPage: React.FC = () => {
  const savedWorkspaces = useWorkspaceStore((state) => state.savedWorkspaces);

  const notifications = Object.values(savedWorkspaces)
    .map((ws) => {
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
    })
    .filter(Boolean);

  return (
    <div className="space-y-8 sm:space-y-10 pb-16 min-w-0">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#18181B] tracking-tight flex items-center gap-2.5 flex-wrap">
          <span>Reminders</span>
          <span className="text-sm font-medium text-[#63636B] font-mono tabular-nums">
            ({notifications.length})
          </span>
        </h1>
        <p className="text-sm text-[#52525B] leading-relaxed max-w-[65ch]">
          Checklist-aware reminders that highlight incomplete mandatory deliverables ahead of each cutoff.
        </p>
      </div>

      {notifications.length === 0 ? (
        <div className="surface-card p-10 sm:p-16 rounded-2xl text-center space-y-4">
          <div className="w-11 h-11 rounded-xl bg-[#F4F4F6] flex items-center justify-center text-[#52525B] mx-auto">
            <Bell aria-hidden="true" className="w-5 h-5 stroke-[1.75]" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-base font-semibold text-[#18181B]">No active reminders</h2>
            <p className="text-sm text-[#52525B] max-w-sm mx-auto">
              Save opportunities from Discover to activate escalating reminders and checklist tracking.
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
          {notifications.map((item) => {
            if (!item) return null;
            const { workspace, opportunity: opp, deadline, incompleteMandatory, isApplied } = item;

            if (isApplied) {
              return (
                <div
                  key={workspace.id}
                  className="surface-card p-5 sm:p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5">
                    <CheckCircle2 aria-hidden="true" className="w-5 h-5 text-emerald-700 flex-shrink-0 stroke-[2] mt-0.5" />
                    <div className="space-y-1">
                      <h2 className="text-sm font-semibold text-[#18181B]">
                        {opp.title} — Application Submitted
                      </h2>
                      <p className="text-[13px] text-[#52525B]">
                        All remaining deadline alerts have been cancelled.
                      </p>
                    </div>
                  </div>

                  <Link
                    to={`/workspaces/${opp.id}`}
                    className="btn-tactile-secondary px-4 py-2 rounded-xl text-xs font-medium self-start sm:self-auto min-h-[36px]"
                  >
                    Open Workspace
                  </Link>
                </div>
              );
            }

            const isUrgent = deadline.urgency === 'critical' || deadline.urgency === 'warning';

            return (
              <div
                key={workspace.id}
                className="surface-card surface-card-interactive p-5 sm:p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <div
                    aria-hidden="true"
                    className={`p-2.5 rounded-xl mt-0.5 flex-shrink-0 ${
                      isUrgent ? 'bg-amber-100 text-amber-900' : 'bg-[#F4F4F6] text-[#18181B]'
                    }`}
                  >
                    {isUrgent ? (
                      <AlertTriangle className="w-4 h-4 stroke-[2]" />
                    ) : (
                      <Bell className="w-4 h-4 stroke-[1.75]" />
                    )}
                  </div>

                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-sm sm:text-base font-semibold text-[#18181B]">
                        {opp.title}
                      </h2>
                      <span className="text-xs font-mono font-medium tabular-nums text-[#52525B]">
                        · {deadline.label}
                      </span>
                    </div>

                    <p className="text-[13px] text-[#52525B]">
                      {incompleteMandatory.length > 0 ? (
                        <span>
                          <strong className="font-semibold text-[#18181B] font-mono tabular-nums">
                            {incompleteMandatory.length}
                          </strong>{' '}
                          mandatory deliverable{incompleteMandatory.length > 1 ? 's' : ''} remaining:{' '}
                          <span className="text-[#18181B] font-medium">
                            {incompleteMandatory.map((r) => r.title).slice(0, 2).join(', ')}
                            {incompleteMandatory.length > 2 ? '…' : ''}
                          </span>
                        </span>
                      ) : (
                        <span className="text-emerald-700 font-medium">
                          All mandatory checklist items complete. Ready to submit.
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <Link
                  to={`/workspaces/${opp.id}?tab=application`}
                  className="btn-tactile-primary inline-flex items-center justify-center gap-1.5 ps-4 pe-3.5 py-2.5 rounded-xl text-xs font-semibold self-start md:self-center flex-shrink-0 min-h-[38px] group/btn"
                >
                  <span>Open checklist</span>
                  <ArrowRight aria-hidden="true" className="w-3.5 h-3.5 stroke-[2] rtl:-scale-x-100 transition-transform duration-150 group-hover/btn:translate-x-0.5" />
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
