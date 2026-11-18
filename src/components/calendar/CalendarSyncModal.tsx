import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Check, Copy, RefreshCw, ExternalLink } from 'lucide-react';
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

  if (!isOpen) return null;

  const webcalUrl = `webcal://hackathon-workspace.dev/api/calendar/subscribe?token=${calendarToken}`;
  const icsUrl = `https://hackathon-workspace.dev/api/calendar/feed.ics?token=${calendarToken}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(icsUrl);
    setIsCopied(true);
    toast.success('Calendar feed URL copied to clipboard');
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleRegenerateToken = () => {
    const newToken = 'feed-' + Math.random().toString(36).substring(2, 10);
    setCalendarToken(newToken);
    toast.info('New private calendar link generated');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-neutral-900/25 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            style={{ transformOrigin: 'center' }}
            className="w-full max-w-lg bg-white rounded-2xl p-6 sm:p-7 relative overflow-hidden max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#FDFDFD] flex items-center justify-center text-neutral-800">
                  <Calendar className="w-4 h-4 stroke-[1.75]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-neutral-900 tracking-tight [text-wrap:balance]">Calendar Integration</h3>
                  <p className="text-xs text-neutral-500 [text-wrap:pretty]">Keep application deadlines synced across devices</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-neutral-400 hover:text-neutral-700 hover:bg-[#FDFDFD] transition-[transform,background-color,color] duration-150 active:scale-[0.97]"
                aria-label="Close modal"
              >
                <X className="w-4 h-4 stroke-[1.75]" />
              </button>
            </div>

            {opportunityTitle && (
              <div className="mt-2 px-3.5 py-2.5 rounded-xl bg-[#FDFDFD] text-xs text-neutral-700">
                <span className="text-neutral-400">Configuring for:</span> <strong className="text-neutral-900 ml-1">{opportunityTitle}</strong>
              </div>
            )}

            <div className="mt-6 space-y-5">
              {/* Google Calendar Section */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#FDFDFD] space-y-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-red-600 font-bold text-xs">
                      G
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-neutral-900 [text-wrap:balance]">Google Calendar</h4>
                      <p className="text-xs text-neutral-500 [text-wrap:pretty]">
                        {googleConnected ? 'Connected as builder@gmail.com' : 'Not connected'}
                      </p>
                    </div>
                  </div>
                  {googleConnected ? (
                    <button
                      onClick={() => {
                        const next = !isGoogleSynced;
                        onToggleGoogleSync?.(next);
                        toast.success(next ? 'Deadline synced to Google Calendar' : 'Removed from Google Calendar');
                      }}
                      className={`px-4 py-2.5 rounded-xl text-xs font-medium transition-[transform,background-color,color] duration-150 w-full sm:w-auto text-center justify-center active:scale-[0.97] ${
                        isGoogleSynced
                          ? 'bg-emerald-600 text-white font-semibold'
                          : 'bg-white hover:bg-neutral-50 text-neutral-800'
                      }`}
                    >
                      {isGoogleSynced ? '✓ Synced' : 'Sync Deadline'}
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setGoogleConnected(true);
                        toast.success('Connected Google Calendar');
                      }}
                      className="btn-tactile-primary px-4 py-2.5 rounded-xl text-xs font-medium w-full sm:w-auto text-center justify-center active:scale-[0.97] text-white"
                    >
                      Connect
                    </button>
                  )}
                </div>
                <p className="text-xs text-neutral-500 leading-relaxed [text-wrap:pretty]">
                  Creates a dedicated submission calendar block ending at the deadline with a deep link to your checklist and drafts.
                </p>
              </div>

              {/* Apple Calendar Section */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#FDFDFD] space-y-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-neutral-900 font-semibold text-xs">
                      
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-neutral-900 [text-wrap:balance]">Apple Calendar (iOS / macOS)</h4>
                      <p className="text-xs text-neutral-500 [text-wrap:pretty]">Subscribed calendar feed</p>
                    </div>
                  </div>
                  <a
                    href={webcalUrl}
                    className="bg-white hover:bg-neutral-50 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-medium w-full sm:w-auto text-center active:scale-[0.97] text-neutral-800 transition-[transform,background-color] duration-150"
                  >
                    <span>Subscribe</span>
                    <ExternalLink className="w-3 h-3 text-neutral-400 stroke-[1.75]" />
                  </a>
                </div>
                <p className="text-xs text-neutral-500 leading-relaxed [text-wrap:pretty]">
                  Subscribes your Apple Calendar app via WebCal. Updates automatically as deadlines shift or new hackathons are saved.
                </p>
              </div>

              {/* Manual Feed Link Section */}
              <div className="space-y-2.5 pt-1">
                <label className="text-xs font-medium text-neutral-600 block [text-wrap:balance]">
                  Direct iCal Feed Link (Outlook, Thunderbird, Fastmail)
                </label>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                  <input
                    type="text"
                    readOnly
                    value={icsUrl}
                    className="flex-1 min-w-0 bg-[#FDFDFD] rounded-xl px-3.5 py-2.5 text-xs text-neutral-600 font-mono truncate select-all focus:outline-none focus:ring-2 focus:ring-neutral-900/10 border-0"
                  />
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={handleCopy}
                      className="bg-[#FDFDFD] hover:bg-[#f4f4f6] flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-medium active:scale-[0.97] text-neutral-800 transition-[transform,background-color] duration-150"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" /> : <Copy className="w-3.5 h-3.5 text-neutral-500 stroke-[1.75]" />}
                      <span>{isCopied ? 'Copied' : 'Copy'}</span>
                    </button>
                    <button
                      onClick={handleRegenerateToken}
                      title="Generate new private link"
                      className="p-2.5 rounded-xl bg-[#FDFDFD] hover:bg-[#f4f4f6] text-neutral-500 hover:text-neutral-900 active:scale-[0.97] transition-[transform,background-color,color] duration-150"
                    >
                      <RefreshCw className="w-3.5 h-3.5 stroke-[1.75]" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-2 flex justify-end">
              <button
                onClick={onClose}
                className="btn-tactile-primary px-5 py-2.5 rounded-xl text-xs font-semibold active:scale-[0.97] text-white w-full sm:w-auto"
              >
                Done
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
