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
    <div className="p-6 sm:p-7 rounded-2xl bg-[#FDFDFD] space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#F5F5F5] flex items-center justify-center text-neutral-800">
            <Bell className="w-4 h-4 stroke-[1.75]" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-semibold text-neutral-950 tracking-tight" style={{ textWrap: 'balance' }}>
              Reminder Schedule
            </h3>
            <p className="text-xs text-neutral-500" style={{ textWrap: 'pretty' }}>
              Checklist-aware alerts timed to incomplete deliverables
            </p>
          </div>
        </div>

        <button
          onClick={onToggleReminders}
          className={`w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium transition-all duration-150 active:scale-[0.97] ${
            remindersEnabled
              ? 'btn-tactile-primary text-white'
              : 'bg-[#F5F5F5] hover:bg-[#EBEBEB] text-neutral-700'
          }`}
        >
          {remindersEnabled ? (
            <>
              <Bell className="w-3.5 h-3.5 stroke-[1.75]" />
              <span>Reminders: Active</span>
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
        <div className="p-3.5 rounded-xl bg-[#F5F5F5] text-xs text-neutral-700 flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 stroke-[2]" />
          <span style={{ textWrap: 'pretty' }}>Application submitted — upcoming deadline alerts cancelled.</span>
        </div>
      )}

      {/* 5-Checkpoint Vertical Timeline */}
      <div className="relative pl-6 space-y-5 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[1px] before:bg-neutral-200">
        {checkpoints.map((cp) => {
          let badge = null;
          let nodeIcon = null;

          if (isApplied || cp.status === 'cancelled') {
            nodeIcon = <XCircle className="w-3.5 h-3.5 text-neutral-400 stroke-[1.75]" />;
            badge = (
              <span className="text-[11px] font-medium text-neutral-400">
                Cancelled
              </span>
            );
          } else if (cp.status === 'passed_before_save') {
            nodeIcon = <Clock className="w-3.5 h-3.5 text-neutral-400 stroke-[1.75]" />;
            badge = (
              <span className="text-[11px] font-medium text-neutral-400">
                Passed before save
              </span>
            );
          } else if (cp.status === 'sent') {
            nodeIcon = <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 stroke-[2]" />;
            badge = (
              <span className="text-[11px] font-medium text-emerald-700 font-mono">
                Fired
              </span>
            );
          } else {
            nodeIcon = <Clock className="w-3.5 h-3.5 text-neutral-600 stroke-[1.75]" />;
            badge = (
              <span className="text-[11px] font-medium text-neutral-600 tabular-nums font-mono">
                {formatEventDate(cp.targetDate)}
              </span>
            );
          }

          return (
            <div key={cp.id} className="relative flex items-start justify-between gap-3 text-xs">
              <span className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-white flex items-center justify-center">
                {nodeIcon}
              </span>

              <div className="space-y-0.5 flex-1 min-w-0">
                <p className="font-semibold text-neutral-900 tracking-tight">
                  {cp.label}
                </p>
                <p className="text-[11px] text-neutral-500 leading-relaxed" style={{ textWrap: 'pretty' }}>
                  Alert scheduled {cp.interval} before submission cutoff
                </p>
              </div>

              <div className="flex-shrink-0 text-right">
                {badge}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
