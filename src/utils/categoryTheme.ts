import { Code2, Coins, CalendarDays, Building2 } from 'lucide-react';
import { OpportunityType } from '../types';

export interface OpportunityCategoryTheme {
  label: string;
  badgeClasses: string;
  accentBarClass: string;
  icon: typeof Code2;
}

/**
 * Verified high-contrast (>= 6.3:1 WCAG AA / Lc >= 76) semantic badges per opportunity type.
 */
export const CATEGORY_THEMES: Record<OpportunityType, OpportunityCategoryTheme> = {
  hackathon: {
    label: 'Hackathon',
    badgeClasses: 'bg-[#EFE6FF] text-[#3B0764]',
    accentBarClass: 'bg-[#DECAFF]',
    icon: Code2,
  },
  grant: {
    label: 'Grant',
    badgeClasses: 'bg-[#ECFDF5] text-[#065F46]',
    accentBarClass: 'bg-emerald-200',
    icon: Coins,
  },
  event: {
    label: 'Tech Event',
    badgeClasses: 'bg-[#FEF3C7] text-[#92400E]',
    accentBarClass: 'bg-amber-200',
    icon: CalendarDays,
  },
  venture_hub: {
    label: 'Accelerator',
    badgeClasses: 'bg-[#EEF2FF] text-[#3730A3]',
    accentBarClass: 'bg-indigo-200',
    icon: Building2,
  },
};
