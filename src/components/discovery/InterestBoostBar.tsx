import React from 'react';
import { Check } from 'lucide-react';
import { useWorkspaceStore } from '../../store/useWorkspaceStore';
import { ALL_INTEREST_TAGS } from '../../types';

export const InterestBoostBar: React.FC = () => {
  const selectedInterests = useWorkspaceStore((state) => state.selectedInterests);
  const toggleInterest = useWorkspaceStore((state) => state.toggleInterest);
  const clearInterests = useWorkspaceStore((state) => state.clearInterests);

  const isAll = selectedInterests.length === 0;

  return (
    <div
      role="group"
      aria-label="Filter and prioritize by track"
      className="flex items-center gap-2 flex-wrap py-1"
    >
      <button
        type="button"
        onClick={clearInterests}
        aria-pressed={isAll}
        className={`px-3.5 py-2 rounded-xl text-xs font-medium min-h-[34px] ${
          isAll ? 'btn-tactile-primary' : 'btn-tactile-secondary'
        }`}
      >
        All Tracks
      </button>

      {ALL_INTEREST_TAGS.map((tag) => {
        const isSelected = selectedInterests.includes(tag);
        return (
          <button
            type="button"
            key={tag}
            onClick={() => toggleInterest(tag)}
            aria-pressed={isSelected}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium min-h-[34px] ${
              isSelected ? 'btn-tactile-primary' : 'btn-tactile-secondary'
            }`}
          >
            {isSelected && <Check aria-hidden="true" className="w-3.5 h-3.5 stroke-[2.25]" />}
            <span>{tag}</span>
          </button>
        );
      })}
    </div>
  );
};
