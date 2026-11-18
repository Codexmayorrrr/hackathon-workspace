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
    <div className="space-y-8 sm:space-y-10 bg-white">
      {/* Back button & Breadcrumb */}
      <div className="space-y-2">
        <Link
          to="/discover"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-900 transition-colors group mb-1"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1 stroke-[1.75]" />
          <span>Back to Discovery Rails</span>
        </Link>
        <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 tracking-tight" style={{ textWrap: 'balance' }}>
          {meta.title}
        </h1>
        <p className="text-sm text-neutral-500 leading-relaxed" style={{ textWrap: 'pretty' }}>{meta.subtitle}</p>
      </div>

      {/* Floating Filter Strip */}
      <div className="pt-1">
        <InterestBoostBar />
      </div>

      {/* Results Grid */}
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-neutral-500">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-neutral-400 stroke-[1.75]" />
            <span className="tabular-nums">Showing {sortedItems.length} active opportunities</span>
          </div>
          {selectedInterests.length > 0 && (
            <span className="text-blue-600 font-medium">
              Ranked for: {selectedInterests.join(', ')}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {sortedItems.map((opp) => {
            const isMatched = selectedInterests.length > 0 &&
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
