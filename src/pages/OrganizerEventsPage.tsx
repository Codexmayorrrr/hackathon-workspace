import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Palette,
  Share2,
  Trash2,
  ArrowRight,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useAllOpportunities, useWorkspaceStore } from '../store/useWorkspaceStore';
import { Opportunity, OpportunityType } from '../types';
import { EventBanner } from '../components/ui/EventBanner';
import { CATEGORY_THEMES } from '../utils/categoryTheme';
import { getRelativeDeadline } from '../utils/dateUtils';
import { CreateOpportunityModal } from '../components/organizer/CreateOpportunityModal';
import { BannerEditorModal } from '../components/organizer/BannerEditorModal';
import { toast } from 'sonner';

type FilterType = 'all' | OpportunityType;

const FILTER_OPTIONS: Array<{ value: FilterType; label: string }> = [
  { value: 'all', label: 'All Events' },
  { value: 'hackathon', label: 'Hackathons' },
  { value: 'event', label: 'Conferences & Events' },
  { value: 'grant', label: 'Grants' },
  { value: 'venture_hub', label: 'Accelerators' },
];

export const OrganizerEventsPage: React.FC = () => {
  const allOpportunities = useAllOpportunities();
  const customOpportunities = useWorkspaceStore((state) => state.customOpportunities);
  const updateOpportunityBanner = useWorkspaceStore((state) => state.updateOpportunityBanner);
  const deleteCustomOpportunity = useWorkspaceStore((state) => state.deleteCustomOpportunity);
  const restoreCustomOpportunity = useWorkspaceStore((state) => state.restoreCustomOpportunity);

  const [filterType, setFilterType] = useState<FilterType>('all');
  const [createOpen, setCreateOpen] = useState(false);
  const [editingBannerOpp, setEditingBannerOpp] = useState<Opportunity | null>(null);

  const customIds = useMemo(
    () => new Set(customOpportunities.map((c) => c.id)),
    [customOpportunities]
  );

  const filteredEvents = useMemo(() => {
    if (filterType === 'all') return allOpportunities;
    return allOpportunities.filter((opp) => opp.type === filterType);
  }, [allOpportunities, filterType]);

  const handleCopyShareLink = (slug: string, title: string) => {
    const shareUrl = `${window.location.origin}/opportunities/${slug}`;
    navigator.clipboard?.writeText(shareUrl).catch(() => {});
    toast.success('Copied share link', {
      description: `Developer listing link for "${title}" copied to clipboard.`,
    });
  };

  const handleDeleteCustom = (opp: Opportunity) => {
    deleteCustomOpportunity(opp.id);
    toast.success(`Removed "${opp.title}"`, {
      action: {
        label: 'Undo',
        onClick: () => restoreCustomOpportunity(opp),
      },
    });
  };

  return (
    <div className="space-y-8 min-w-0">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#18181B] tracking-tight">
            Hosted Events & Banners
          </h1>
          <p className="text-sm text-[#52525B]">
            Customize event banners, copy public registration links, or publish a new program.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="btn-tactile-primary px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold inline-flex items-center gap-2 min-h-[42px] self-start sm:self-auto flex-shrink-0"
        >
          <Plus aria-hidden="true" className="w-4 h-4 stroke-[2.2]" />
          <span>Publish Event</span>
        </button>
      </div>

      {/* Category Filter Bar */}
      <div
        role="group"
        aria-label="Filter hosted events by category"
        className="flex items-center gap-2 flex-wrap"
      >
        {FILTER_OPTIONS.map((option) => {
          const isSelected = filterType === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setFilterType(option.value)}
              aria-pressed={isSelected}
              className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-colors min-h-[36px] active:scale-[0.96] ${
                isSelected
                  ? 'bg-[#18181B] text-white font-semibold'
                  : 'bg-[#FFFFFF] text-[#52525B] hover:text-[#18181B] hover:bg-[#EFEFF2]'
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredEvents.map((opp) => {
          const theme = CATEGORY_THEMES[opp.type] || CATEGORY_THEMES.hackathon;
          const deadline = getRelativeDeadline(opp.applicationDeadline);
          const isCustom = customIds.has(opp.id);

          return (
            <article
              key={opp.id}
              className="surface-card rounded-2xl overflow-hidden flex flex-col justify-between min-w-0"
            >
              <EventBanner
                title={opp.title}
                type={opp.type}
                bannerUrl={opp.bannerUrl}
                bannerTheme={opp.bannerTheme}
                organizerName={opp.organizerName}
                variant="card"
                badgeSlot={
                  isCustom ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#EFE6FF] text-[#3B0764] text-[11px] font-semibold">
                      <Sparkles aria-hidden="true" className="w-3 h-3" />
                      <span>Custom</span>
                    </span>
                  ) : undefined
                }
              />

              <div className="p-5 flex-1 flex flex-col justify-between gap-4 min-w-0">
                <div className="space-y-3 min-w-0">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold ${theme.badgeClasses}`}>
                      {theme.label}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[#52525B] font-mono tabular-nums">
                      <Clock aria-hidden="true" className="w-3 h-3 text-[#63636B]" />
                      <span>{deadline.label}</span>
                    </span>
                  </div>

                  <div className="min-w-0">
                    <h2 className="text-base font-semibold text-[#18181B] tracking-tight line-clamp-2">
                      {opp.title}
                    </h2>
                    <p className="text-xs text-[#63636B] mt-1 font-mono tabular-nums truncate">
                      {opp.prizePool}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-[#F4F4F6] rounded-xl p-2.5">
                      <p className="text-[11px] text-[#63636B]">Applicants</p>
                      <p className="text-sm font-semibold text-[#18181B] tabular-nums">
                        {opp.applicantCount ?? 1}
                      </p>
                    </div>
                    <div className="bg-[#F4F4F6] rounded-xl p-2.5">
                      <p className="text-[11px] text-[#63636B]">Submissions</p>
                      <p className="text-sm font-semibold text-[#18181B] tabular-nums">
                        {opp.submissionCount ?? 0}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-2 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setEditingBannerOpp(opp)}
                      className="btn-tactile-secondary px-3 py-2 rounded-xl text-xs font-medium inline-flex items-center gap-1.5 min-h-[36px]"
                    >
                      <Palette aria-hidden="true" className="w-3.5 h-3.5" />
                      <span>Edit Banner</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCopyShareLink(opp.slug, opp.title)}
                      aria-label={`Copy share link for ${opp.title}`}
                      className="btn-tactile-secondary w-9 h-9 rounded-xl flex items-center justify-center"
                    >
                      <Share2 aria-hidden="true" className="w-3.5 h-3.5" />
                    </button>

                    {isCustom && (
                      <button
                        type="button"
                        onClick={() => handleDeleteCustom(opp)}
                        aria-label={`Delete custom event ${opp.title}`}
                        className="btn-tactile-secondary w-9 h-9 rounded-xl flex items-center justify-center text-red-700 hover:bg-red-50"
                      >
                        <Trash2 aria-hidden="true" className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <Link
                    to={`/opportunities/${opp.slug}`}
                    className="btn-tactile-primary px-3.5 py-2 rounded-xl text-xs font-semibold inline-flex items-center gap-1 min-h-[36px]"
                  >
                    <span>Preview</span>
                    <ArrowRight aria-hidden="true" className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <CreateOpportunityModal isOpen={createOpen} onClose={() => setCreateOpen(false)} />

      <BannerEditorModal
        isOpen={Boolean(editingBannerOpp)}
        opportunity={editingBannerOpp}
        onClose={() => setEditingBannerOpp(null)}
        onSave={(id, banner) => {
          updateOpportunityBanner(id, banner);
          toast.success('Event banner updated everywhere');
        }}
      />
    </div>
  );
};
