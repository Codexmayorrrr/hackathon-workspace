import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Filter } from 'lucide-react';
import { MOCK_OPPORTUNITIES } from '../data/mockOpportunities';
import { OpportunityCard } from '../components/discovery/OpportunityCard';
import { InterestBoostBar } from '../components/discovery/InterestBoostBar';
import { useWorkspaceStore } from '../store/useWorkspaceStore';
import { OpportunityType } from '../types';

const SECTION_TITLES: Record<string, { title: string; subtitle: string }> = {
  hackathon: {
    title: 'Tech Hackathons',
    subtitle: 'All upcoming sprint buildathons, bounties, and prototype competitions.',
  },
  event: {
    title: 'Tech Events & Conferences',
    subtitle: 'Upcoming demo days, startup pitch showcases, and tech summits.',
  },
  grant: {
    title: 'Tech Grants & Ecosystem Funds',
    subtitle: 'Non-dilutive micro-grants, research funding, and developer bounties.',
  },
  venture_hub: {
    title: 'Venture Hub Applications',
    subtitle: 'Accelerator cohorts, seed studios, and startup fellowship deadlines.',
  },
};

export const SectionRailPage: React.FC = () => {
  const { sectionType } = useParams<{ sectionType: string }>();
  const selectedInterests = useWorkspaceStore((state) => state.selectedInterests);

  const meta = (sectionType && SECTION_TITLES[sectionType]) || {
    title: 'Explore Opportunities',
    subtitle: 'Browse all opportunities',
  };

  const rawItems = MOCK_OPPORTUNITIES.filter(
    (opp) => opp.type === (sectionType as OpportunityType)
  );

  const sortedItems = [...rawItems].sort((a, b) => {
    if (selectedInterests.length > 0) {
      const aMatches = a.tags.some((tag) => selectedInterests.includes(tag));
      const bMatches = b.tags.some((tag) => selectedInterests.includes(tag));
      if (aMatches && !bMatches) return -1;
      if (!aMatches && bMatches) return 1;
    }
    return new Date(a.applicationDeadline).getTime() - new Date(b.applicationDeadline).getTime();
  });

  return (
    <div className="space-y-8 sm:space-y-10 min-w-0">
      {/* Back button & Breadcrumb */}
      <div className="space-y-2.5">
        <Link
          to="/discover"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#52525B] hover:text-[#18181B] transition-colors group py-1"
        >
          <ArrowLeft aria-hidden="true" className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1 rtl:-scale-x-100 stroke-[1.75]" />
          <span>Back to Discover</span>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#18181B] tracking-tight">
          {meta.title}
        </h1>
        <p className="text-sm text-[#52525B] leading-relaxed max-w-[65ch]">
          {meta.subtitle}
        </p>
      </div>

      {/* Filter Strip */}
      <div>
        <InterestBoostBar />
      </div>

      {/* Results Grid */}
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#52525B]">
          <div className="flex items-center gap-2">
            <Filter aria-hidden="true" className="w-3.5 h-3.5 text-[#63636B] stroke-[1.75]" />
            <span className="tabular-nums font-medium">
              Showing {sortedItems.length} active opportunities
            </span>
          </div>
          {selectedInterests.length > 0 && (
            <span className="text-[#18181B] font-semibold">
              Prioritized for: {selectedInterests.join(', ')}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">
          {sortedItems.map((opp) => {
            const isMatched =
              selectedInterests.length > 0 &&
              opp.tags.some((tag) => selectedInterests.includes(tag));
            return (
              <OpportunityCard
                key={opp.id}
                opportunity={opp}
                isMatched={isMatched}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
