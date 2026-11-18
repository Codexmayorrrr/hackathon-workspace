import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Bookmark, 
  Check, 
  ArrowRight, 
  Sparkles 
} from 'lucide-react';
import { Opportunity } from '../../types';
import { getRelativeDeadline } from '../../utils/dateUtils';
import { useWorkspaceStore } from '../../store/useWorkspaceStore';
import { toast } from 'sonner';

interface OpportunityCardProps {
  opportunity: Opportunity;
  isMatched?: boolean;
}

export const OpportunityCard: React.FC<OpportunityCardProps> = ({
  opportunity,
  isMatched = false,
}) => {
  const navigate = useNavigate();
  const isSaved = useWorkspaceStore((state) => state.isSaved(opportunity.id));
  const saveOpportunity = useWorkspaceStore((state) => state.saveOpportunity);
  const unsaveOpportunity = useWorkspaceStore((state) => state.unsaveOpportunity);

  const deadline = getRelativeDeadline(opportunity.applicationDeadline);

  const handleSaveToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isSaved) {
      unsaveOpportunity(opportunity.id);
      toast('Removed from Saved Queue', {
        description: opportunity.title,
      });
    } else {
      saveOpportunity(opportunity.id);
      toast.success('Saved to Workspace', {
        description: 'Checklist and deadline reminders ready.',
        action: {
          label: 'Open Workspace',
          onClick: () => navigate(`/workspaces/${opportunity.id}`),
        },
      });
    }
  };

  const urgencyDot = {
    critical: 'bg-rose-500 animate-pulse',
    warning: 'bg-amber-500',
    normal: 'bg-neutral-400',
    past: 'bg-neutral-300',
  }[deadline.urgency];

  return (
    <motion.div
      layout
      transition={{ type: 'spring', duration: 0.35, bounce: 0.08 }}
      className={`group rounded-2xl p-6 flex flex-col justify-between transition-colors bg-[#FDFDFD] ${
        isMatched
          ? 'ring-1 ring-blue-500/30'
          : 'hover:bg-[#f7f7f9]'
      }`}
    >
      {/* Top Meta Bar */}
      <div>
        <div className="flex items-center justify-between text-xs mb-3.5">
          <div className="flex items-center gap-2 text-neutral-500 font-medium">
            <span className="capitalize">{opportunity.format}</span>
            {isMatched && (
              <>
                <span className="text-neutral-300">·</span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 bg-white px-2.5 py-0.5 rounded-full">
                  <Sparkles className="w-2.5 h-2.5 stroke-[2]" />
                  <span>Matched</span>
                </span>
              </>
            )}
          </div>

          <span className="text-[11px] font-mono tabular-nums text-neutral-600 flex items-center gap-1.5 bg-white px-2.5 py-0.5 rounded-full">
            <span className={`w-1.5 h-1.5 rounded-full ${urgencyDot}`} />
            <span>{deadline.label}</span>
          </span>
        </div>

        {/* Title */}
        <Link 
          to={`/opportunities/${opportunity.slug}`}
          className="block group-hover:text-blue-600 transition-colors"
        >
          <h3 className="text-base font-semibold text-neutral-900 tracking-tight leading-snug line-clamp-2" style={{ textWrap: 'balance' }}>
            {opportunity.title}
          </h3>
        </Link>

        {/* Summary */}
        <p className="mt-2 text-xs text-neutral-500 line-clamp-2 leading-relaxed" style={{ textWrap: 'pretty' }}>
          {opportunity.summary}
        </p>

        {/* Location & Prize Details */}
        <div className="mt-5 flex items-center justify-between text-xs pt-1">
          <span className="font-semibold text-neutral-900 tracking-tight tabular-nums">{opportunity.prizePool}</span>
          <span className="text-neutral-400 text-[11px] truncate max-w-[130px]">
            {opportunity.location || 'Online'}
          </span>
        </div>

        {/* Tags */}
        <div className="mt-3.5 flex items-center gap-1.5 flex-wrap">
          {opportunity.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-0.5 rounded-lg text-[10px] font-medium text-neutral-600 bg-[#f4f4f6]"
            >
              {tag}
            </span>
          ))}
          {opportunity.tags.length > 3 && (
            <span className="text-[10px] text-neutral-400 font-medium">
              +{opportunity.tags.length - 3}
            </span>
          )}
        </div>
      </div>

      {/* Footer Actions - Responsive Tactile Buttons, Zero Border, Zero Shadow */}
      <div className="mt-6 pt-3 flex items-center justify-between gap-2.5">
        <button
          onClick={handleSaveToggle}
          className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium transition-[transform,background-color,color] duration-150 active:scale-[0.97] ${
            isSaved
              ? 'text-emerald-700 bg-white font-semibold'
              : 'bg-white hover:bg-neutral-50 text-neutral-800'
          }`}
        >
          {isSaved ? (
            <>
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Saved</span>
            </>
          ) : (
            <>
              <Bookmark className="w-3.5 h-3.5 stroke-[1.75] text-neutral-400" />
              <span>Save</span>
            </>
          )}
        </button>

        {isSaved ? (
          <Link
            to={`/workspaces/${opportunity.id}`}
            className="btn-tactile-primary px-4 py-2 rounded-xl text-xs font-medium inline-flex items-center gap-1.5 text-white active:scale-[0.97]"
          >
            <span>Workspace</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[2]" />
          </Link>
        ) : (
          <Link
            to={`/opportunities/${opportunity.slug}`}
            className="btn-tactile-secondary px-4 py-2 rounded-xl text-xs font-medium inline-flex items-center gap-1.5 text-neutral-800 active:scale-[0.97] bg-white hover:bg-neutral-50"
          >
            <span>Preview</span>
            <ArrowRight className="w-3.5 h-3.5 text-neutral-400 stroke-[1.75]" />
          </Link>
        )}
      </div>
    </motion.div>
  );
};
