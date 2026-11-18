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
    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
      <button
        onClick={clearInterests}
        className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium ${
          isAll
            ? 'btn-tactile-primary'
            : 'btn-tactile-secondary text-neutral-600 hover:text-neutral-950'
        }`}
      >
        All Tracks
      </button>

      {ALL_INTEREST_TAGS.map((tag) => {
        const isSelected = selectedInterests.includes(tag);
        return (
          <button
            key={tag}
            onClick={() => toggleInterest(tag)}
            className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${
              isSelected
                ? 'btn-tactile-primary'
                : 'btn-tactile-secondary text-neutral-600 hover:text-neutral-950'
            }`}
          >
            {isSelected && <Check className="w-3 h-3 stroke-[2.5]" />}
            <span>{tag}</span>
          </button>
        );
      })}
    </div>
  );
};
