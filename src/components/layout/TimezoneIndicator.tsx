import React from 'react';
import { Globe, Clock } from 'lucide-react';
import { getUserTimezone, getTimezoneAbbreviation } from '../../utils/dateUtils';

export const TimezoneIndicator: React.FC = () => {
  const tz = getUserTimezone();
  const abbr = getTimezoneAbbreviation();

  return (
    <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium bg-[#FDFDFD] text-neutral-600">
      <Clock className="w-3.5 h-3.5 text-neutral-400 stroke-[1.75]" />
      <span className="text-neutral-900 font-mono font-semibold text-[11px] tabular-nums">{abbr}</span>
      <span className="text-neutral-300">·</span>
      <span className="truncate max-w-[130px] text-neutral-500 flex items-center gap-1 font-mono text-[11px]">
        <Globe className="w-3 h-3 text-neutral-400 stroke-[1.75]" />
        {tz}
      </span>
    </div>
  );
};
