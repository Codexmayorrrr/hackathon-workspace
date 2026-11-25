import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Bookmark,
  Check,
  ArrowRight,
  Sparkles,
  MapPin,
} from 'lucide-react';
import { Opportunity } from '../../types';
import { getRelativeDeadline } from '../../utils/dateUtils';
import { CATEGORY_THEMES } from '../../utils/categoryTheme';
import { useWorkspaceStore } from '../../store/useWorkspaceStore';
import { EventBanner } from '../ui/EventBanner';
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
  const theme = CATEGORY_THEMES[opportunity.type] || CATEGORY_THEMES.hackathon;
  const CategoryIcon = theme.icon;

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
      toast.success('Saved to workspace', {
        description: 'Checklist and deadline reminders ready.',
        action: {
          label: 'Open Workspace',
          onClick: () => navigate(`/workspaces/${opportunity.id}`),
        },
      });
    }
  };

  const urgencyDot = {
    critical: 'bg-rose-600 motion-safe:animate-pulse',
    warning: 'bg-amber-600',
    normal: 'bg-[#63636B]',
    past: 'bg-neutral-400',
  }[deadline.urgency];

  const locationText = opportunity.location || 'Online';

  return (
    <motion.article
      layout
      transition={{ type: 'spring', duration: 0.32, bounce: 0.05 }}
      className="group surface-card surface-card-interactive rounded-2xl overflow-hidden flex flex-col min-w-0"
    >
      <EventBanner
        title={opportunity.title}
        type={opportunity.type}
        bannerUrl={opportunity.bannerUrl}
        bannerTheme={opportunity.bannerTheme}
        organizerName={opportunity.organizerName}
        variant="card"
        badgeSlot={
          isMatched ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-orange-100 text-orange-950 text-[11px] font-semibold">
              <Sparkles aria-hidden="true" className="w-3 h-3 stroke-[2]" />
              <span>Matched</span>
            </span>
          ) : undefined
        }
      />

      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between min-w-0">
        {/* Top Meta Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 flex-wrap min-w-0">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold ${theme.badgeClasses}`}
              >
                <CategoryIcon aria-hidden="true" className="w-3 h-3 stroke-[2]" />
                <span>{theme.label}</span>
              </span>

              <span className="text-[11px] font-medium text-[#63636B] capitalize">
                {opportunity.format}
              </span>
            </div>

          <div className="flex items-center gap-1.5 text-[#52525B] text-[11px] font-mono font-medium tabular-nums flex-shrink-0">
            <span aria-hidden="true" className={`w-1.5 h-1.5 rounded-full ${urgencyDot}`} />
            <span>{deadline.label}</span>
          </div>
        </div>

        {/* Title & Summary */}
        <div className="space-y-2">
          <Link
            to={`/opportunities/${opportunity.slug}`}
            className="block rounded-md focus-visible:outline-2 group/link"
          >
            <h3 className="text-base font-semibold text-[#18181B] group-hover/link:text-[#52525B] transition-colors tracking-tight leading-snug line-clamp-2">
              {opportunity.title}
            </h3>
          </Link>

          <p className="text-[13px] text-[#52525B] line-clamp-2 leading-relaxed">
            {opportunity.summary}
          </p>
        </div>

        {/* Prize Pool & Location Well */}
        <div className="p-3 rounded-xl bg-[#F4F4F6] flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="font-semibold text-[#18181B] tracking-tight font-mono tabular-nums">
            {opportunity.prizePool}
          </span>
          <span
            title={locationText}
            className="text-[#52525B] text-[11px] inline-flex items-center gap-1 truncate max-w-[160px]"
          >
            <MapPin aria-hidden="true" className="w-3 h-3 text-[#63636B] flex-shrink-0 stroke-[1.75]" />
            <span className="truncate">{locationText}</span>
          </span>
        </div>

        {/* Tags */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {opportunity.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-[11px] text-[#63636B] font-medium px-2 py-0.5 rounded-md bg-[#F4F4F6]/80"
            >
              #{tag}
            </span>
          ))}
          {opportunity.tags.length > 3 && (
            <span className="text-[11px] text-[#63636B] font-medium">
              +{opportunity.tags.length - 3}
            </span>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="pt-5 mt-4 flex items-center justify-between gap-2.5 flex-wrap">
        <button
          type="button"
          onClick={handleSaveToggle}
          aria-pressed={isSaved}
          aria-label={isSaved ? `Remove ${opportunity.title} from Saved Queue` : `Save ${opportunity.title} to Workspace`}
          className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs transition-[transform,background-color,color] duration-150 active:scale-[0.96] min-h-[36px] ${
            isSaved ? 'btn-tactile-accent' : 'btn-tactile-secondary'
          }`}
        >
          {isSaved ? (
            <>
              <Check aria-hidden="true" className="w-3.5 h-3.5 stroke-[2.25]" />
              <span>Saved</span>
            </>
          ) : (
            <>
              <Bookmark aria-hidden="true" className="w-3.5 h-3.5 stroke-[1.75]" />
              <span>Save</span>
            </>
          )}
        </button>

        {isSaved ? (
          <Link
            to={`/workspaces/${opportunity.id}`}
            className="btn-tactile-primary ps-4 pe-3.5 py-2 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 min-h-[36px] group/btn"
          >
            <span>Open Workspace</span>
            <ArrowRight aria-hidden="true" className="w-3.5 h-3.5 stroke-[2] rtl:-scale-x-100 transition-transform duration-150 group-hover/btn:translate-x-0.5" />
          </Link>
        ) : (
          <Link
            to={`/opportunities/${opportunity.slug}`}
            className="btn-tactile-secondary ps-4 pe-3.5 py-2 rounded-xl text-xs font-medium inline-flex items-center gap-1.5 min-h-[36px] group/btn"
          >
            <span>Preview</span>
            <ArrowRight aria-hidden="true" className="w-3.5 h-3.5 text-[#52525B] stroke-[1.75] rtl:-scale-x-100 transition-transform duration-150 group-hover/btn:translate-x-0.5" />
          </Link>
        )}
        </div>
      </div>
    </motion.article>
  );
};
