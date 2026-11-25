import React, { useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Layers } from 'lucide-react';
import { Opportunity, OpportunityType } from '../../types';
import { CATEGORY_THEMES } from '../../utils/categoryTheme';

export type OpportunityGroupTab = 'all' | OpportunityType;

export function computeOpportunityGroupCounts(
  opportunities: Opportunity[]
): Record<OpportunityGroupTab, number> {
  const counts: Record<OpportunityGroupTab, number> = {
    all: opportunities.length,
    hackathon: 0,
    event: 0,
    grant: 0,
    venture_hub: 0,
  };
  opportunities.forEach((opp) => {
    if (counts[opp.type] !== undefined) {
      counts[opp.type] += 1;
    }
  });
  return counts;
}

export interface GroupTabMeta {
  id: OpportunityGroupTab;
  label: string;
}

export const OPPORTUNITY_GROUP_TABS: GroupTabMeta[] = [
  { id: 'all', label: 'All Groups' },
  { id: 'hackathon', label: 'Hackathons' },
  { id: 'event', label: 'Tech Events' },
  { id: 'grant', label: 'Grants' },
  { id: 'venture_hub', label: 'Venture Hubs' },
];

interface OpportunityGroupTabsProps {
  activeGroup: OpportunityGroupTab;
  onSelectGroup: (group: OpportunityGroupTab) => void;
  counts: Record<OpportunityGroupTab, number>;
  idPrefix?: string;
  layoutId?: string;
}

/**
 * Accessible APG tablist for switching between opportunity groups
 * with animated flat surface selection and keyboard navigation.
 */
export const OpportunityGroupTabs: React.FC<OpportunityGroupTabsProps> = ({
  activeGroup,
  onSelectGroup,
  counts,
  idPrefix = 'group',
  layoutId = 'opportunity-group-active-pill',
}) => {
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const shouldReduceMotion = useReducedMotion();

  const handleKeyDown = (e: React.KeyboardEvent, idx: number) => {
    const isRtl =
      typeof document !== 'undefined' &&
      (document.dir === 'rtl' || getComputedStyle(document.documentElement).direction === 'rtl');
    const nextKey = isRtl ? 'ArrowLeft' : 'ArrowRight';
    const prevKey = isRtl ? 'ArrowRight' : 'ArrowLeft';

    let targetIndex: number | null = null;
    if (e.key === nextKey) {
      targetIndex = (idx + 1) % OPPORTUNITY_GROUP_TABS.length;
    } else if (e.key === prevKey) {
      targetIndex = (idx - 1 + OPPORTUNITY_GROUP_TABS.length) % OPPORTUNITY_GROUP_TABS.length;
    } else if (e.key === 'Home') {
      targetIndex = 0;
    } else if (e.key === 'End') {
      targetIndex = OPPORTUNITY_GROUP_TABS.length - 1;
    }

    if (targetIndex === null) return;
    e.preventDefault();
    const targetTab = OPPORTUNITY_GROUP_TABS[targetIndex];
    onSelectGroup(targetTab.id);
    requestAnimationFrame(() => tabRefs.current[targetTab.id]?.focus());
  };

  return (
    <div className="bg-[#EAEAEF] p-1.5 rounded-2xl max-w-full min-w-0">
      <div
        role="tablist"
        aria-label="Opportunity groups"
        className="flex items-center gap-1.5 overflow-x-auto overscroll-x-contain snap-x snap-proximity md:snap-none md:overflow-visible md:flex-wrap no-scrollbar"
      >
        {OPPORTUNITY_GROUP_TABS.map((tab, idx) => {
          const isActive = activeGroup === tab.id;
          const Icon = tab.id === 'all' ? Layers : CATEGORY_THEMES[tab.id].icon;
          const count = counts[tab.id] ?? 0;

          return (
            <button
              key={tab.id}
              ref={(el) => {
                tabRefs.current[tab.id] = el;
              }}
              type="button"
              role="tab"
              id={`${idPrefix}-tab-${tab.id}`}
              aria-selected={isActive}
              aria-controls={`${idPrefix}-panel`}
              tabIndex={isActive ? 0 : -1}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              onClick={() => onSelectGroup(tab.id)}
              className={`relative inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-[13px] whitespace-nowrap snap-start min-h-[38px] flex-shrink-0 transition-colors duration-150 active:scale-[0.96] ${
                isActive
                  ? 'text-[#18181B] font-semibold'
                  : 'text-[#52525B] font-medium hover:text-[#18181B]'
              }`}
            >
              {isActive && (
                <motion.span
                  layoutId={layoutId}
                  transition={
                    shouldReduceMotion
                      ? { duration: 0 }
                      : { type: 'spring', stiffness: 460, damping: 34 }
                  }
                  aria-hidden="true"
                  className="absolute inset-0 bg-[#FFFFFF] rounded-xl"
                />
              )}
              <Icon
                aria-hidden="true"
                className={`relative z-10 w-3.5 h-3.5 flex-shrink-0 ${
                  isActive ? 'text-[#18181B] stroke-[2]' : 'text-[#52525B] stroke-[1.75]'
                }`}
              />
              <span className="relative z-10">{tab.label}</span>
              <span
                className={`relative z-10 px-1.5 py-0.5 rounded-md text-[11px] font-mono tabular-nums ${
                  isActive
                    ? 'bg-[#EFE6FF] text-[#3B0764] font-semibold'
                    : 'bg-[#DFDFE6] text-[#52525B]'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
