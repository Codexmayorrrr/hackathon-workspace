import React, { useState } from 'react';
import { Presentation, FileText } from 'lucide-react';
import { Opportunity } from '../../types';
import { SlideDeckGenerator } from '../pitch/SlideDeckGenerator';
import { DocumentProposalGenerator } from './DocumentProposalGenerator';

interface PitchDocumentsSectionProps {
  opportunity: Opportunity;
  onLaunchCoach?: () => void;
}

export const PitchDocumentsSection: React.FC<PitchDocumentsSectionProps> = ({
  opportunity,
  onLaunchCoach,
}) => {
  const isGrant = opportunity.type === 'grant';
  const [activeSubTab, setActiveSubTab] = useState<'slides' | 'proposals'>(
    isGrant ? 'proposals' : 'slides'
  );

  return (
    <div className="space-y-6 sm:space-y-8 pb-10">
      {/* Section Sub-nav Header */}
      <div className="surface-card p-6 sm:p-8 rounded-2xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-lg sm:text-xl font-bold text-[#18181B] tracking-tight">
              Pitch & Documentation Studio
            </h2>
            <p className="text-xs sm:text-sm text-[#52525B] leading-relaxed max-w-[65ch]">
              Generate interactive pitch decks with live rehearsal timing and draft structured proposals with budget breakdowns.
            </p>
          </div>

          <div
            className="flex items-center gap-1 bg-[#F4F4F6] p-1 rounded-xl self-start lg:self-auto flex-wrap"
            role="group"
            aria-label="Document mode"
          >
            <button
              type="button"
              onClick={() => setActiveSubTab('slides')}
              aria-pressed={activeSubTab === 'slides'}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-[transform,background-color,color] duration-150 active:scale-[0.96] min-h-[34px] ${
                activeSubTab === 'slides'
                  ? 'bg-white shadow-border text-[#18181B] font-semibold'
                  : 'text-[#52525B] hover:text-[#18181B]'
              }`}
            >
              <Presentation aria-hidden="true" className="w-3.5 h-3.5 stroke-[1.75]" />
              <span>Pitch deck & coach</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('proposals')}
              aria-pressed={activeSubTab === 'proposals'}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-[transform,background-color,color] duration-150 active:scale-[0.96] min-h-[34px] ${
                activeSubTab === 'proposals'
                  ? 'bg-white shadow-border text-[#18181B] font-semibold'
                  : 'text-[#52525B] hover:text-[#18181B]'
              }`}
            >
              <FileText aria-hidden="true" className="w-3.5 h-3.5 stroke-[1.75]" />
              <span>Proposal & budget</span>
            </button>
          </div>
        </div>
      </div>

      {/* Subtab Content */}
      {activeSubTab === 'slides' ? (
        <SlideDeckGenerator
          workspaceId={opportunity.id}
          opportunityTitle={opportunity.title}
          opportunity={opportunity}
          onLaunchCoach={onLaunchCoach}
        />
      ) : (
        <DocumentProposalGenerator
          opportunity={opportunity}
          workspaceId={opportunity.id}
        />
      )}
    </div>
  );
};
