import React, { useState } from 'react';
import { Calendar, Check, Copy, RefreshCw, ExternalLink, Smartphone } from 'lucide-react';
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
    toast.info('Generated new private calendar link');
  };

  return (
    <AccessibleModal
      isOpen={isOpen}
      onClose={onClose}
      titleId="calendar-sync-title"
      descriptionId="calendar-sync-desc"
      maxWidthClass="max-w-lg"
      title="Calendar sync"
      description="Keep submission deadlines synced across all of your devices."
      icon={<Calendar className="w-4 h-4 stroke-[1.75]" />}
      closeLabel="Close calendar sync dialog"
      footer={
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="btn-tactile-primary px-5 py-2.5 rounded-xl text-xs font-semibold w-full sm:w-auto min-h-[40px]"
          >
            Done
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        {opportunityTitle && (
          <div className="px-3.5 py-2.5 rounded-xl bg-[#F4F4F6] text-xs text-[#52525B]">
            <span>Configuring deadlines for</span>{' '}
            <strong className="text-[#18181B] font-semibold">{opportunityTitle}</strong>
          </div>
        )}

        {/* Google Calendar Section */}
        <div className="p-4 rounded-2xl bg-[#F4F4F6] space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div
                aria-hidden="true"
                className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-rose-700 font-bold text-xs flex-shrink-0"
              >
                G
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-[#18181B]">Google Calendar</h3>
                <p className="text-xs text-[#52525B] truncate">
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
                  toast.success(next ? 'Synced deadline to Google Calendar' : 'Removed from Google Calendar');
                }}
                aria-pressed={isGoogleSynced}
                className={`px-4 py-2 rounded-xl text-xs font-semibold w-full sm:w-auto text-center justify-center transition-[transform,background-color,color] duration-150 active:scale-[0.96] min-h-[38px] flex-shrink-0 ${
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
                className="btn-tactile-primary px-4 py-2 rounded-xl text-xs font-semibold w-full sm:w-auto text-center justify-center min-h-[38px] flex-shrink-0"
              >
                Connect account
              </button>
            )}
          </div>
          <p className="text-xs text-[#52525B] leading-relaxed text-pretty">
            Creates a calendar block ending at submission cutoff with a direct link back to your workspace.
          </p>
        </div>

        {/* Apple Calendar Section */}
        <div className="p-4 rounded-2xl bg-[#F4F4F6] space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div
                aria-hidden="true"
                className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[#18181B] flex-shrink-0"
              >
                <Smartphone className="w-4 h-4 stroke-[1.75]" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-[#18181B]">Apple Calendar (iOS & macOS)</h3>
                <p className="text-xs text-[#52525B]">Subscribed calendar feed</p>
              </div>
            </div>
            <a
              href={webcalUrl}
              className="btn-tactile-secondary bg-white inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium w-full sm:w-auto min-h-[38px] flex-shrink-0"
            >
              <span>Subscribe</span>
              <ExternalLink aria-hidden="true" className="w-3.5 h-3.5 text-[#52525B] stroke-[1.75]" />
            </a>
          </div>
          <p className="text-xs text-[#52525B] leading-relaxed text-pretty">
            Subscribes Apple Calendar via WebCal and updates automatically when dates change.
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
              className="field-surface flex-1 min-w-0 rounded-xl px-3.5 py-2.5 text-base sm:text-xs text-[#52525B] font-mono truncate select-all"
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
    </AccessibleModal>
  );
};
