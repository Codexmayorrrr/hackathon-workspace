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
    <div className="space-y-12 sm:space-y-16 bg-white">
      {/* Intro Header */}
      <div className="space-y-3">
        <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 tracking-tight" style={{ textWrap: 'balance' }}>
          Ecosystem Discovery Rails
        </h1>
        <p className="text-sm sm:text-base text-neutral-500 max-w-2xl leading-relaxed" style={{ textWrap: 'pretty' }}>
          Audit application requirements upfront, verify sponsor judging overlaps, and organize your preparation inside a persistent workspace.
        </p>

        {/* Clean Filter Strip */}
        <div className="pt-3">
          <InterestBoostBar />
        </div>
      </div>

      {/* 4 Distinct Rails with Layout Animation */}
      <LayoutGroup>
        <div className="space-y-14 sm:space-y-16">
          {SECTIONS.map((section) => {
            const rawItems = opportunitiesByType[section.type] || [];
            const sortedItems = sortSectionOpportunities(rawItems);
            const displayItems = sortedItems.slice(0, 4);

            return (
              <section key={section.type} className="space-y-4">
                {/* Rail Header */}
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-1">
                  <div>
                    <h2 className="text-lg sm:text-xl font-semibold tracking-tight text-neutral-900 flex items-center gap-2">
                      <span>{section.title}</span>
                      <span className="text-xs font-normal text-neutral-400 font-mono tabular-nums">· {rawItems.length}</span>
                    </h2>
                    <p className="text-xs sm:text-sm text-neutral-500 mt-1" style={{ textWrap: 'pretty' }}>
                      {section.description}
                    </p>
                  </div>

                  <Link
                    to={`/discover/${section.type}`}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium text-neutral-700 bg-[#FDFDFD] hover:bg-[#f2f2f4] transition-[transform,background-color] duration-150 whitespace-nowrap self-start sm:self-auto active:scale-[0.97]"
                  >
                    <span>See all</span>
                    <ArrowRight className="w-3.5 h-3.5 text-neutral-400 stroke-[1.75]" />
                  </Link>
                </div>

                {/* Animated Grid Cards - Mobile Stack / Desktop Grid */}
                <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
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
