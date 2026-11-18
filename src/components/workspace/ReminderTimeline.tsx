import React from 'react';
import { Bell, BellOff, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { ReminderCheckpoint } from '../../types';
import { formatEventDate } from '../../utils/dateUtils';

interface ReminderTimelineProps {
  checkpoints: ReminderCheckpoint[];
  remindersEnabled: boolean;
  onToggleReminders: () => void;
  isApplied: boolean;
}

export const ReminderTimeline: React.FC<ReminderTimelineProps> = ({
  checkpoints,
  remindersEnabled,
  onToggleReminders,
  isApplied,
}) => {
  return (
    <div className="p-6 sm:p-8 rounded-2xl bg-[#FDFDFD] space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-neutral-800">
            <Bell className="w-4 h-4 stroke-[1.75]" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-neutral-900 tracking-tight [text-wrap:balance]">
              Escalating Reminder Schedule
            </h3>
            <p className="text-xs text-neutral-500 [text-wrap:pretty]">
              Checklist-aware alerts timed to incomplete mandatory deliverables
            </p>
          </div>
        </div>

        <button
          onClick={onToggleReminders}
          className={`w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-medium transition-[transform,background-color,color] duration-150 active:scale-[0.97] ${
            remindersEnabled
              ? 'btn-tactile-primary text-white'
              : 'bg-white hover:bg-neutral-50 text-neutral-700'
          }`}
        >
          {remindersEnabled ? (
            <>
              <Bell className="w-3.5 h-3.5 stroke-[1.75]" />
              <span>Reminders: Enabled</span>
            </>
          ) : (
            <>
              <BellOff className="w-3.5 h-3.5 stroke-[1.75]" />
              <span>Reminders: Muted</span>
            </>
          )}
        </button>
      </div>

      {isApplied && (
        <div className="p-4 rounded-xl bg-white text-xs text-emerald-800 flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 stroke-[2]" />
          <span className="[text-wrap:pretty]">Application Submitted — all upcoming deadline reminders are cancelled.</span>
        </div>
      )}

      {/* 5-Checkpoint Vertical Timeline */}
      <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-neutral-200">
        {checkpoints.map((cp) => {
          let badge = null;
          let nodeIcon = null;

          if (isApplied || cp.status === 'cancelled') {
            nodeIcon = <XCircle className="w-4 h-4 text-neutral-400 stroke-[1.75]" />;
            badge = (
              <span className="text-[11px] font-medium text-neutral-400 bg-white px-2.5 py-1 rounded-md">
                Cancelled
              </span>
            );
          } else if (cp.status === 'passed_before_save') {
            nodeIcon = <Clock className="w-4 h-4 text-neutral-400 stroke-[1.75]" />;
            badge = (
              <span className="text-[11px] font-medium text-neutral-400 bg-white px-2.5 py-1 rounded-md">
                Passed before save
              </span>
            );
          } else if (cp.status === 'sent') {
            nodeIcon = <CheckCircle2 className="w-4 h-4 text-emerald-600 stroke-[2]" />;
            badge = (
              <span className="text-[11px] font-medium text-emerald-700 bg-white px-2.5 py-1 rounded-md">
                Fired
              </span>
            );
          } else {
            nodeIcon = <Clock className="w-4 h-4 text-neutral-700 stroke-[1.75]" />;
            badge = (
              <span className="text-[11px] font-medium text-neutral-700 bg-white px-2.5 py-1 rounded-md tabular-nums font-mono">
                Scheduled · {formatEventDate(cp.targetDate)}
              </span>
            );
          }

          const isDimmed = cp.status === 'passed_before_save' || isApplied;

          return (
            <div key={cp.id} className="relative group">
              <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-white flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 group-hover:bg-neutral-900 transition-colors" />
              </div>

              <div className={`space-y-1.5 ${isDimmed ? 'opacity-50' : 'opacity-100'}`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {nodeIcon}
                    <h4 className="text-xs sm:text-sm font-semibold text-neutral-900 [text-wrap:balance]">
                      {cp.label}
                    </h4>
                  </div>
                  {badge}
                </div>

                <p className="text-xs text-neutral-500 tabular-nums font-mono">
                  Target: {formatEventDate(cp.targetDate)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
