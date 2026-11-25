import React, { useState } from 'react';
import { X, Calendar, Check, Copy, RefreshCw, ExternalLink } from 'lucide-react';
import { AccessibleModal } from '../ui/AccessibleModal';
import { toast } from 'sonner';

interface CalendarSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  opportunityTitle?: string;
  isGoogleSynced?: boolean;
  onToggleGoogleSync?: (synced: boolean) => void;
}

export const CalendarSyncModal: React.FC<CalendarSyncModalProps> = ({
  isOpen,
  onClose,
  opportunityTitle,
  isGoogleSynced = false,
  onToggleGoogleSync,
}) => {
  const [googleConnected, setGoogleConnected] = useState(true);
  const [calendarToken, setCalendarToken] = useState('feed-789a-4c2b-9bf1');
  const [isCopied, setIsCopied] = useState(false);

  const webcalUrl = `webcal://hackathon-workspace.dev/api/calendar/subscribe?token=${calendarToken}`;
  const icsUrl = `https://hackathon-workspace.dev/api/calendar/feed.ics?token=${calendarToken}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(icsUrl);
    setIsCopied(true);
    toast.success('Calendar feed URL copied');
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleRegenerateToken = () => {
    const newToken = 'feed-' + Math.random().toString(36).substring(2, 10);
    setCalendarToken(newToken);
    toast.info('New private calendar link generated');
  };

  return (
    <AccessibleModal
      isOpen={isOpen}
      onClose={onClose}
      titleId="calendar-sync-title"
      descriptionId="calendar-sync-desc"
      maxWidthClass="max-w-lg"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 pb-3">
        <div className="flex items-center gap-3">
          <div
            aria-hidden="true"
            className="w-10 h-10 rounded-xl bg-[#F4F4F6] flex items-center justify-center text-[#18181B]"
          >
            <Calendar className="w-4 h-4 stroke-[1.75]" />
          </div>
          <div>
            <h2 id="calendar-sync-title" className="text-base font-bold text-[#18181B] tracking-tight">
              Calendar sync
            </h2>
            <p id="calendar-sync-desc" className="text-xs text-[#52525B]">
              Keep submission deadlines synced across your devices
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-9 h-9 btn-tactile-ghost rounded-xl flex items-center justify-center flex-shrink-0"
          aria-label="Close calendar sync dialog"
        >
          <X aria-hidden="true" className="w-4 h-4 stroke-[1.75]" />
        </button>
      </div>

      {opportunityTitle && (
        <div className="mt-4 px-3.5 py-2.5 rounded-xl bg-[#F4F4F6] text-xs text-[#52525B]">
          <span>Configuring for:</span>{' '}
          <strong className="text-[#18181B] font-semibold ms-1">{opportunityTitle}</strong>
        </div>
      )}

      <div className="mt-5 space-y-4">
        {/* Google Calendar Section */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#F4F4F6] space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                aria-hidden="true"
                className="w-8 h-8 rounded-lg bg-white shadow-border flex items-center justify-center text-rose-700 font-bold text-xs"
              >
                G
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#18181B]">Google Calendar</h3>
                <p className="text-xs text-[#52525B]">
                  {googleConnected ? 'Connected as builder@gmail.com' : 'Not connected'}
                </p>
              </div>
            </div>
            {googleConnected ? (
              <button
                type="button"
                onClick={() => {
                  const next = !isGoogleSynced;
                  onToggleGoogleSync?.(next);
                  toast.success(next ? 'Deadline synced to Google Calendar' : 'Removed from Google Calendar');
                }}
                aria-pressed={isGoogleSynced}
                className={`px-4 py-2 rounded-xl text-xs font-semibold w-full sm:w-auto text-center justify-center transition-[transform,background-color,color] duration-150 active:scale-[0.96] min-h-[38px] ${
                  isGoogleSynced
                    ? 'bg-[#047857] hover:bg-emerald-800 text-white'
                    : 'btn-tactile-secondary bg-white'
                }`}
              >
                {isGoogleSynced ? 'Synced' : 'Sync deadline'}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setGoogleConnected(true);
                  toast.success('Connected Google Calendar');
                }}
                className="btn-tactile-primary px-4 py-2 rounded-xl text-xs font-semibold w-full sm:w-auto text-center justify-center min-h-[38px]"
              >
                Connect
              </button>
            )}
          </div>
          <p className="text-xs text-[#52525B] leading-relaxed">
            Creates a submission block ending at the deadline with a direct link to your checklist and drafts.
          </p>
        </div>

        {/* Apple Calendar Section */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#F4F4F6] space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                aria-hidden="true"
                className="w-8 h-8 rounded-lg bg-white shadow-border flex items-center justify-center text-[#18181B] font-semibold text-xs"
              >
                
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#18181B]">Apple Calendar (iOS & macOS)</h3>
                <p className="text-xs text-[#52525B]">Subscribed calendar feed</p>
              </div>
            </div>
            <a
              href={webcalUrl}
              className="btn-tactile-secondary bg-white inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium w-full sm:w-auto min-h-[38px]"
            >
              <span>Subscribe</span>
              <ExternalLink aria-hidden="true" className="w-3.5 h-3.5 text-[#52525B] stroke-[1.75]" />
            </a>
          </div>
          <p className="text-xs text-[#52525B] leading-relaxed">
            Subscribes Apple Calendar via WebCal and updates automatically when deadlines change.
          </p>
        </div>

        {/* Manual Feed Link Section */}
        <div className="space-y-2 pt-1">
          <label htmlFor="ical-feed-url" className="text-xs font-medium text-[#52525B] block">
            Direct iCal feed URL (Outlook, Thunderbird, Fastmail)
          </label>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <input
              id="ical-feed-url"
              type="text"
              readOnly
              value={icsUrl}
              className="field-surface flex-1 min-w-0 rounded-xl px-3.5 py-2.5 text-xs text-[#52525B] font-mono truncate select-all"
            />
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={handleCopy}
                className="btn-tactile-secondary flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-medium min-h-[38px]"
              >
                {isCopied ? (
                  <Check aria-hidden="true" className="w-3.5 h-3.5 text-emerald-700 stroke-[2.25]" />
                ) : (
                  <Copy aria-hidden="true" className="w-3.5 h-3.5 text-[#52525B] stroke-[1.75]" />
                )}
                <span>{isCopied ? 'Copied' : 'Copy'}</span>
              </button>
              <button
                type="button"
                onClick={handleRegenerateToken}
                title="Generate new private calendar link"
                aria-label="Generate new private calendar link"
                className="btn-tactile-secondary w-10 h-10 rounded-xl flex items-center justify-center text-[#52525B] hover:text-[#18181B]"
              >
                <RefreshCw aria-hidden="true" className="w-3.5 h-3.5 stroke-[1.75]" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 pt-2 flex justify-end">
        <button
          type="button"
          onClick={onClose}
          className="btn-tactile-primary px-5 py-2.5 rounded-xl text-xs font-semibold w-full sm:w-auto min-h-[40px]"
        >
          Done
        </button>
      </div>
    </AccessibleModal>
  );
};
