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
    <div className="surface-card p-6 rounded-2xl space-y-5">
      {/* Header */}
      <div className="space-y-3.5 pb-1">
        <div className="flex items-start gap-3">
          <div
            aria-hidden="true"
            className="w-9 h-9 rounded-xl bg-[#F4F4F6] flex items-center justify-center text-[#18181B] flex-shrink-0"
          >
            <Bell className="w-4 h-4 stroke-[1.75]" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-[#18181B] tracking-tight">
              Reminder Schedule
            </h2>
            <p className="text-xs text-[#52525B] leading-relaxed mt-0.5">
              Checklist-aware alerts timed to incomplete deliverables.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onToggleReminders}
          aria-pressed={remindersEnabled}
          className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs transition-[transform,background-color,color] duration-150 active:scale-[0.96] min-h-[38px] ${
            remindersEnabled ? 'btn-tactile-primary' : 'btn-tactile-secondary'
          }`}
        >
          {remindersEnabled ? (
            <>
              <Bell aria-hidden="true" className="w-3.5 h-3.5 stroke-[2]" />
              <span>Reminders active</span>
            </>
          ) : (
            <>
              <BellOff aria-hidden="true" className="w-3.5 h-3.5 stroke-[1.75]" />
              <span>Reminders muted</span>
            </>
          )}
        </button>
      </div>

      {isApplied && (
        <div className="p-3.5 rounded-xl bg-[#ECFDF5] text-xs text-[#065F46] font-medium flex items-start gap-2.5">
          <CheckCircle2 aria-hidden="true" className="w-4 h-4 flex-shrink-0 stroke-[2] mt-0.5" />
          <span>Application submitted — upcoming deadline alerts cancelled.</span>
        </div>
      )}

      {/* 5-Checkpoint Vertical Timeline (Stacked card layout prevents column crushing) */}
      <div className="relative ps-6 space-y-4 before:content-[''] before:absolute before:start-[7px] before:top-2 before:bottom-2 before:w-[1px] before:bg-neutral-200">
        {checkpoints.map((cp) => {
          let badge = null;
          let nodeIcon = null;

          if (isApplied || cp.status === 'cancelled') {
            nodeIcon = <XCircle aria-hidden="true" className="w-3.5 h-3.5 text-[#63636B] stroke-[1.75]" />;
            badge = (
              <span className="inline-block text-[11px] font-medium text-[#63636B] bg-[#F4F4F6] px-2 py-0.5 rounded">
                Cancelled
              </span>
            );
          } else if (cp.status === 'passed_before_save') {
            nodeIcon = <Clock aria-hidden="true" className="w-3.5 h-3.5 text-[#63636B] stroke-[1.75]" />;
            badge = (
              <span className="inline-block text-[11px] font-medium text-[#63636B] bg-[#F4F4F6] px-2 py-0.5 rounded">
                Passed before save
              </span>
            );
          } else if (cp.status === 'sent') {
            nodeIcon = <CheckCircle2 aria-hidden="true" className="w-3.5 h-3.5 text-emerald-700 stroke-[2]" />;
            badge = (
              <span className="inline-block text-[11px] font-semibold text-[#065F46] bg-[#ECFDF5] px-2 py-0.5 rounded font-mono">
                Sent
              </span>
            );
          } else {
            nodeIcon = <Clock aria-hidden="true" className="w-3.5 h-3.5 text-[#18181B] stroke-[1.75]" />;
            badge = (
              <span className="inline-block text-[11px] font-medium text-[#18181B] bg-[#F4F4F6] px-2 py-0.5 rounded tabular-nums font-mono">
                {formatEventDate(cp.targetDate)}
              </span>
            );
          }

          return (
            <div key={cp.id} className="relative space-y-1.5 text-xs">
              <span
                aria-hidden="true"
                className="absolute -start-6 top-0.5 w-4 h-4 rounded-full bg-white flex items-center justify-center"
              >
                {nodeIcon}
              </span>

              <div className="space-y-1">
                <p className="font-semibold text-[#18181B] tracking-tight">
                  {cp.label}
                </p>
                <p className="text-[11px] text-[#52525B] leading-snug">
                  Scheduled {cp.interval} before cutoff
                </p>
                <div className="pt-0.5">{badge}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
