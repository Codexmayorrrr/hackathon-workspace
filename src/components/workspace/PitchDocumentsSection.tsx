import React, { useState } from 'react';
import { 
  Presentation, 
  FileText 
} from 'lucide-react';
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
  // If the opportunity is a grant, default to 'proposal', otherwise 'slides'
  const isGrant = opportunity.type === 'grant';
  const [activeSubTab, setActiveSubTab] = useState<'slides' | 'proposals'>(
    isGrant ? 'proposals' : 'slides'
  );

  return (
    <div className="space-y-6 sm:space-y-8 pb-10">
      {/* Section Sub-nav Pill Header */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#FDFDFD] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-lg sm:text-xl font-bold text-neutral-900 tracking-tight">
              Pitch & Documentation Studio
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed" style={{ textWrap: 'pretty' }}>
              Generate interactive pitch decks with real-time audio rehearsal and draft executive proposals with budget breakdowns.
            </p>
          </div>

          <div className="flex items-center gap-1 bg-[#F5F5F5] p-1 rounded-xl self-start sm:self-auto">
            <button
              onClick={() => setActiveSubTab('slides')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors active:scale-[0.97] ${
                activeSubTab === 'slides'
                  ? 'bg-white text-neutral-950 font-semibold'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <Presentation className="w-3.5 h-3.5 stroke-[1.75]" />
              <span>Pitch Deck & Coach</span>
            </button>

            <button
              onClick={() => setActiveSubTab('proposals')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors active:scale-[0.97] ${
                activeSubTab === 'proposals'
                  ? 'bg-white text-neutral-950 font-semibold'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5 stroke-[1.75]" />
              <span>Written Proposal & Budget</span>
            </button>
          </div>
        </div>
      </div>

      {/* Subtab Content */}
      {activeSubTab === 'slides' ? (
        <SlideDeckGenerator
          workspaceId={opportunity.id}
          opportunityTitle={opportunity.title}
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
