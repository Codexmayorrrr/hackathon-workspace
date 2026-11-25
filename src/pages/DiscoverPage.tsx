import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, LayoutGroup } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { MOCK_OPPORTUNITIES } from '../data/mockOpportunities';
import { Opportunity, OpportunityType } from '../types';
import { CATEGORY_THEMES } from '../utils/categoryTheme';
import { InterestBoostBar } from '../components/discovery/InterestBoostBar';
import { OpportunityCard } from '../components/discovery/OpportunityCard';
import { useWorkspaceStore } from '../store/useWorkspaceStore';

interface SectionConfig {
  type: OpportunityType;
  title: string;
  description: string;
}

const SECTIONS: SectionConfig[] = [
  {
    type: 'hackathon',
    title: 'Tech Hackathons',
    description: 'Sprint-based engineering competitions, prototype buildathons, and protocol bounties.',
  },
  {
    type: 'event',
    title: 'Tech Events & Conferences',
    description: 'Demo days, open source summits, and developer conferences with pitch competitions.',
  },
  {
    type: 'grant',
    title: 'Tech Grants & Ecosystem Funds',
    description: 'Non-dilutive micro-grants, public goods funding, and open-source project bounties.',
  },
  {
    type: 'venture_hub',
    title: 'Venture Hub Applications',
    description: 'Tier-1 accelerator cohorts, venture studios, and early-stage startup fellowships.',
  },
];

export const DiscoverPage: React.FC = () => {
  const selectedInterests = useWorkspaceStore((state) => state.selectedInterests);

  const sortSectionOpportunities = (items: Opportunity[]) => {
    return [...items].sort((a, b) => {
      if (selectedInterests.length > 0) {
        const aMatches = a.tags.some((tag) => selectedInterests.includes(tag));
        const bMatches = b.tags.some((tag) => selectedInterests.includes(tag));

        if (aMatches && !bMatches) return -1;
        if (!aMatches && bMatches) return 1;
      }
      return new Date(a.applicationDeadline).getTime() - new Date(b.applicationDeadline).getTime();
    });
  };

  const opportunitiesByType = useMemo(() => {
    const grouped: Record<OpportunityType, Opportunity[]> = {
      hackathon: [],
      event: [],
      grant: [],
      venture_hub: [],
    };

    MOCK_OPPORTUNITIES.forEach((opp) => {
      if (grouped[opp.type]) {
        grouped[opp.type].push(opp);
      }
    });

    return grouped;
  }, []);

  return (
    <div className="space-y-10 sm:space-y-14 min-w-0">
      {/* Page Header */}
      <div className="space-y-4">
        <div className="space-y-2.5">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#18181B] tracking-tight">
            Discover Opportunities
          </h1>
          <p className="text-sm text-[#52525B] max-w-[65ch] leading-relaxed">
            Inspect application questions upfront, verify sponsor judging criteria, and organize your preparation inside a persistent workspace.
          </p>
        </div>

        {/* Filter Strip */}
        <div className="pt-1">
          <InterestBoostBar />
        </div>
      </div>

      {/* Discovery Rails */}
      <LayoutGroup>
        <div className="space-y-12 sm:space-y-14">
          {SECTIONS.map((section) => {
            const rawItems = opportunitiesByType[section.type] || [];
            const sortedItems = sortSectionOpportunities(rawItems);
            const displayItems = sortedItems.slice(0, 3);
            const theme = CATEGORY_THEMES[section.type];
            const SectionIcon = theme.icon;

            return (
              <section key={section.type} className="space-y-5 min-w-0">
                {/* Rail Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      aria-hidden="true"
                      className={`w-9 h-9 rounded-xl ${theme.badgeClasses} flex items-center justify-center flex-shrink-0 mt-0.5`}
                    >
                      <SectionIcon className="w-4 h-4 stroke-[2]" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-lg font-semibold tracking-tight text-[#18181B] flex items-center gap-2 flex-wrap">
                        <span>{section.title}</span>
                        <span className="text-xs font-medium text-[#63636B] font-mono tabular-nums">
                          ({rawItems.length})
                        </span>
                      </h2>
                      <p className="text-[13px] text-[#52525B] mt-0.5 max-w-[65ch]">
                        {section.description}
                      </p>
                    </div>
                  </div>

                  <Link
                    to={`/discover/${section.type}`}
                    className="btn-tactile-secondary inline-flex items-center gap-1.5 ps-3.5 pe-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap self-start sm:self-auto min-h-[36px] group/rail"
                  >
                    <span>View all {section.title.split(' ')[1] || ''}</span>
                    <ArrowRight aria-hidden="true" className="w-3.5 h-3.5 text-[#52525B] stroke-[1.75] rtl:-scale-x-100 transition-transform duration-150 group-hover/rail:translate-x-0.5" />
                  </Link>
                </div>

                {/* 3-Column Grid Cards */}
                <motion.div layout className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">
                  {displayItems.map((opportunity) => {
                    const isMatched =
                      selectedInterests.length > 0 &&
                      opportunity.tags.some((tag) => selectedInterests.includes(tag));

                    return (
                      <OpportunityCard
                        key={opportunity.id}
                        opportunity={opportunity}
                        isMatched={isMatched}
                      />
                    );
                  })}
                </motion.div>
              </section>
            );
          })}
        </div>
      </LayoutGroup>
    </div>
  );
};
