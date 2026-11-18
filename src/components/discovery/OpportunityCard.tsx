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
      className="group rounded-2xl p-6 flex flex-col justify-between transition-colors bg-[#FDFDFD] hover:bg-[#F8F8FA]"
    >
      {/* Top Meta Header */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-neutral-400 font-medium">
            <span className="capitalize text-neutral-600">{opportunity.format}</span>
            {isMatched && (
              <>
                <span className="text-neutral-300">·</span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-neutral-900">
                  <Sparkles className="w-2.5 h-2.5 stroke-[2] text-neutral-900" />
                  <span>Matched</span>
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-neutral-500 text-[11px] font-mono tabular-nums">
            <span className={`w-1.5 h-1.5 rounded-full ${urgencyDot}`} />
            <span>{deadline.label}</span>
          </div>
        </div>

        {/* Title */}
        <Link 
          to={`/opportunities/${opportunity.slug}`}
          className="block transition-colors group-hover:text-neutral-600"
        >
          <h3 className="text-base font-semibold text-neutral-950 tracking-tight leading-snug line-clamp-2" style={{ textWrap: 'balance' }}>
            {opportunity.title}
          </h3>
        </Link>

        {/* Summary Description */}
        <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed" style={{ textWrap: 'pretty' }}>
          {opportunity.summary}
        </p>

        {/* Prize Pool & Location */}
        <div className="pt-2 flex items-center justify-between text-xs text-neutral-500">
          <span className="font-semibold text-neutral-950 tracking-tight font-mono tabular-nums">
            {opportunity.prizePool}
          </span>
          <span className="text-neutral-400 text-[11px] truncate max-w-[140px]">
            {opportunity.location || 'Online'}
          </span>
        </div>

        {/* Tags */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1">
          {opportunity.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-[11px] text-neutral-400 font-medium"
            >
              #{tag}
            </span>
          ))}
          {opportunity.tags.length > 3 && (
            <span className="text-[10px] text-neutral-300 font-medium">
              +{opportunity.tags.length - 3}
            </span>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="pt-6 mt-4 flex items-center justify-between gap-3">
        <button
          onClick={handleSaveToggle}
          className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium transition-all duration-150 active:scale-[0.97] ${
            isSaved
              ? 'text-neutral-950 font-semibold bg-[#EBEBEB]'
              : 'text-neutral-600 hover:text-neutral-950 hover:bg-[#EAEAEA]/60'
          }`}
        >
          {isSaved ? (
            <>
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Saved</span>
            </>
          ) : (
            <>
              <Bookmark className="w-3.5 h-3.5 stroke-[1.75]" />
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
            className="px-4 py-2 rounded-xl text-xs font-medium inline-flex items-center gap-1.5 text-neutral-800 active:scale-[0.97] bg-[#EBEBEB] hover:bg-[#E0E0E0] transition-colors"
          >
            <span>Preview</span>
            <ArrowRight className="w-3.5 h-3.5 text-neutral-500 stroke-[1.75]" />
          </Link>
        )}
      </div>
    </motion.div>
  );
};
