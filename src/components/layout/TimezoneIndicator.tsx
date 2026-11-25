import React from 'react';
import { Globe, Clock } from 'lucide-react';
import { getUserTimezone, getTimezoneAbbreviation } from '../../utils/dateUtils';

interface TimezoneIndicatorProps {
  compact?: boolean;
}

export const TimezoneIndicator: React.FC<TimezoneIndicatorProps> = ({ compact = false }) => {
  const tz = getUserTimezone();
  const abbr = getTimezoneAbbreviation();

  return (
    <div
      title={`Local timezone: ${tz} (${abbr})`}
      className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-[#EFEFF2] text-[#52525B] flex-shrink-0"
    >
      <Clock aria-hidden="true" className="hidden min-[360px]:block w-3.5 h-3.5 text-[#63636B] stroke-[1.75] flex-shrink-0" />
      <span className="text-[#18181B] font-mono font-semibold text-[11px] tabular-nums">{abbr}</span>
      {!compact && (
        <>
          <span aria-hidden="true" className="text-[#63636B]">·</span>
          <span className="truncate max-w-[130px] text-[#52525B] inline-flex items-center gap-1 font-mono text-[11px]">
            <Globe aria-hidden="true" className="w-3 h-3 text-[#63636B] stroke-[1.75]" />
            <span>{tz}</span>
          </span>
        </>
      )}
    </div>
  );
};
