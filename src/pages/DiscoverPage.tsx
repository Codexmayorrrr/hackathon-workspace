import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, LayoutGroup } from 'framer-motion';
import { 
  Code2, 
  CalendarDays, 
  Coins, 
  Building2, 
  ArrowRight 
} from 'lucide-react';
import { MOCK_OPPORTUNITIES } from '../data/mockOpportunities';
import { Opportunity, OpportunityType } from '../types';
import { InterestBoostBar } from '../components/discovery/InterestBoostBar';
import { OpportunityCard } from '../components/discovery/OpportunityCard';
import { useWorkspaceStore } from '../store/useWorkspaceStore';

interface SectionConfig {
  type: OpportunityType;
  title: string;
  description: string;
  icon: React.ElementType;
}

const SECTIONS: SectionConfig[] = [
  {
    type: 'hackathon',
    title: 'Tech Hackathons',
    description: 'Sprint-based engineering competitions, prototype buildathons, and protocol bounties.',
    icon: Code2,
  },
  {
    type: 'event',
    title: 'Tech Events & Conferences',
    description: 'Demo days, open source summits, and developer conferences with pitch competitions.',
    icon: CalendarDays,
  },
  {
    type: 'grant',
    title: 'Tech Grants & Ecosystem Funds',
    description: 'Non-dilutive micro-grants, public goods funding, and open-source project bounties.',
    icon: Coins,
  },
  {
    type: 'venture_hub',
    title: 'Venture Hub Applications',
    description: 'Tier-1 accelerator cohorts, venture studios, and early-stage startup fellowships.',
    icon: Building2,
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
    <div className="space-y-12 sm:space-y-14 bg-white">
      {/* Page Header */}
      <div className="space-y-3">
        <h1 className="text-2xl sm:text-3xl font-semibold text-neutral-950 tracking-tight" style={{ textWrap: 'balance' }}>
          Discover Opportunities
        </h1>
        <p className="text-sm text-neutral-500 max-w-xl leading-relaxed" style={{ textWrap: 'pretty' }}>
          Inspect application questions upfront, verify sponsor judging criteria, and organize your preparation inside a persistent workspace.
        </p>

        {/* Filter Strip */}
        <div className="pt-2">
          <InterestBoostBar />
        </div>
      </div>

      {/* Discovery Rails */}
      <LayoutGroup>
        <div className="space-y-12 sm:space-y-14">
          {SECTIONS.map((section) => {
            const rawItems = opportunitiesByType[section.type] || [];
            const sortedItems = sortSectionOpportunities(rawItems);
            // Display 3 cards per rail for optimal 3-column layout
            const displayItems = sortedItems.slice(0, 3);

            return (
              <section key={section.type} className="space-y-4">
                {/* Rail Header */}
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-1">
                  <div>
                    <h2 className="text-base sm:text-lg font-semibold tracking-tight text-neutral-950 flex items-center gap-2">
                      <span>{section.title}</span>
                      <span className="text-xs font-normal text-neutral-400 font-mono tabular-nums">({rawItems.length})</span>
                    </h2>
                    <p className="text-xs text-neutral-500 mt-0.5" style={{ textWrap: 'pretty' }}>
                      {section.description}
                    </p>
                  </div>

                  <Link
                    to={`/discover/${section.type}`}
                    className="btn-tactile-secondary inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-neutral-600 hover:text-neutral-950 whitespace-nowrap self-start sm:self-auto group/rail"
                  >
                    <span>View all</span>
                    <ArrowRight className="w-3.5 h-3.5 text-neutral-400 stroke-[1.75] transition-transform duration-150 group-hover/rail:translate-x-0.5" />
                  </Link>
                </div>

                {/* 3-Column Grid Cards - Generous breathing room */}
                <motion.div layout className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {displayItems.map((opportunity) => {
                    const isMatched = selectedInterests.length > 0 &&
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
