import React, { useState } from 'react';
import { X, Plus, Sparkles, Check } from 'lucide-react';
import { AccessibleModal } from '../ui/AccessibleModal';
import { BANNER_THEMES, EventBanner } from '../ui/EventBanner';
import { BANNER_PHOTO_PRESETS, BANNER_THEME_LABELS } from './BannerEditorModal';
import {
  ALL_INTEREST_TAGS,
  ApplicationRequirement,
  BannerThemeId,
  OpportunityFormat,
  OpportunityType,
} from '../../types';
import { useWorkspaceStore } from '../../store/useWorkspaceStore';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface CreateOpportunityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DEFAULT_REQUIREMENTS: ApplicationRequirement[] = [
  {
    id: 'req-custom-repo',
    step: 'Step 1: Technical Deliverables',
    title: 'Public GitHub Repository',
    description: 'Link to open source repository with README setup instructions.',
    type: 'repo_link',
    mandatory: true,
  },
  {
    id: 'req-custom-demo',
    step: 'Step 1: Technical Deliverables',
    title: '2-Minute Live Demo Video',
    description: 'Walkthrough showcasing core user flow and technical architecture.',
    type: 'demo_video',
    mandatory: true,
  },
  {
    id: 'req-custom-deck',
    step: 'Step 2: Project Overview',
    title: 'Executive Problem & Architecture Brief',
    description: 'Summarize the bottleneck solved and measurable traction.',
    type: 'text_prompt',
    maxWords: 250,
    mandatory: true,
  },
];

export const CreateOpportunityModal: React.FC<CreateOpportunityModalProps> = ({
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();
  const publishOpportunity = useWorkspaceStore((state) => state.publishOpportunity);

  const defaultDeadline = new Date(Date.now() + 21 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  const [title, setTitle] = useState('');
  const [organizerName, setOrganizerName] = useState('HackWorkspace Host Guild');
  const [type, setType] = useState<OpportunityType>('hackathon');
  const [format, setFormat] = useState<OpportunityFormat>('Hybrid');
  const [location, setLocation] = useState('Lagos & Remote');
  const [prizePool, setPrizePool] = useState('$25,000 USD + Cloud Credits');
  const [deadlineDate, setDeadlineDate] = useState(defaultDeadline);
  const [summary, setSummary] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>(['AI / ML', 'Developer Tools']);
  const [bannerTheme, setBannerTheme] = useState<BannerThemeId>('lavender_mesh');
  const [bannerUrl, setBannerUrl] = useState(BANNER_PHOTO_PRESETS[1].url);
  const [customReqTitle, setCustomReqTitle] = useState('');
  const [requirements, setRequirements] = useState<ApplicationRequirement[]>(DEFAULT_REQUIREMENTS);

  const handleToggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag]
    );
  };

  const handleAddRequirement = () => {
    const clean = customReqTitle.trim();
    if (!clean) return;
    setRequirements((prev) => [
      ...prev,
      {
        id: `req-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        step: 'Step 2: Custom Deliverables',
        title: clean,
        description: 'Deliverable defined by event organizer.',
        type: 'live_url',
        mandatory: true,
      },
    ]);
    setCustomReqTitle('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) {
      toast.error('Please enter an event title');
      return;
    }

    const cleanSummary =
      summary.trim() ||
      `Build practical software solutions with developers and mentors curated by ${organizerName.trim() || 'the organizer team'}.`;

    const isoDeadline = new Date(`${deadlineDate}T23:59:00Z`).toISOString();
    const created = publishOpportunity({
      title: cleanTitle,
      summary: cleanSummary,
      descriptionMarkdown: `### Overview\n${cleanSummary}\n\n### Deliverables\nComplete every required item inside your preparation workspace before the deadline.`,
      type,
      format,
      location: format === 'Online' ? undefined : location.trim() || 'Global Hub',
      prizePool: prizePool.trim() || '$10,000 USD',
      tags: selectedTags.length > 0 ? selectedTags : ['Developer Tools'],
      bannerTheme,
      bannerUrl: bannerUrl.trim() || undefined,
      organizerName: organizerName.trim() || 'Independent Host',
      applicationDeadline: isoDeadline,
      registrationOpens: new Date().toISOString(),
      externalPortalUrl: 'https://hackworkspace.dev/submit',
      requirements,
      themeContext: {
        theme: cleanTitle,
        problemStatements: [cleanSummary],
        judgingCriteria: [
          {
            name: 'Technical Execution',
            weight: '50%',
            description: 'Completeness, reliability, and engineering craft.',
          },
          {
            name: 'Real-World Utility',
            weight: '50%',
            description: 'Clarity of problem solved and readiness for deployment.',
          },
        ],
      },
    });

    toast.success('Event published live to Discover', {
      description: `"${created.title}" is now visible to developers.`,
      action: {
        label: 'Preview Listing',
        onClick: () => navigate(`/opportunities/${created.slug}`),
      },
    });

    setTitle('');
    setSummary('');
    setRequirements(DEFAULT_REQUIREMENTS);
    onClose();
  };

  return (
    <AccessibleModal
      isOpen={isOpen}
      onClose={onClose}
      titleId="create-opportunity-title"
      descriptionId="create-opportunity-desc"
      maxWidthClass="max-w-3xl"
    >
      <div className="p-5 sm:p-6 space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2
              id="create-opportunity-title"
              className="text-lg sm:text-xl font-bold text-[#18181B] tracking-tight"
            >
              Publish Event or Opportunity
            </h2>
            <p id="create-opportunity-desc" className="text-xs text-[#52525B] mt-1">
              Customize your banner, deliverables, and go live for builders immediately.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close publish modal"
            className="w-9 h-9 rounded-xl bg-[#F4F4F6] hover:bg-[#E5E5EA] text-[#52525B] hover:text-[#18181B] flex items-center justify-center flex-shrink-0 transition-colors active:scale-[0.96]"
          >
            <X aria-hidden="true" className="w-4 h-4 stroke-[2]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Live Banner Preview */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-[#18181B] block">
              Live Event Banner Preview
            </span>
            <div className="rounded-2xl overflow-hidden bg-[#F4F4F6]">
              <EventBanner
                title={title.trim() || 'Your Event Title'}
                type={type}
                bannerTheme={bannerTheme}
                bannerUrl={bannerUrl.trim() || undefined}
                organizerName={organizerName.trim() || 'Your Organization'}
                variant="hero"
              />
            </div>

            {/* Theme Swatches & Photo Presets */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              {(Object.keys(BANNER_THEMES) as BannerThemeId[]).map((themeKey) => {
                const palette = BANNER_THEMES[themeKey];
                const isSelected = bannerTheme === themeKey;
                return (
                  <button
                    key={themeKey}
                    type="button"
                    onClick={() => setBannerTheme(themeKey)}
                    aria-pressed={isSelected}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-colors min-h-[38px] active:scale-[0.96] ${
                      isSelected
                        ? 'bg-[#18181B] text-white font-semibold'
                        : 'bg-[#F4F4F6] text-[#18181B] hover:bg-[#EAEAEF]'
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className="w-3.5 h-3.5 rounded-sm flex-shrink-0"
                      style={{ backgroundColor: palette.secondary }}
                    />
                    <span className="truncate">{BANNER_THEME_LABELS[themeKey]}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {BANNER_PHOTO_PRESETS.map((preset) => {
                const isSelected = bannerUrl.trim() === preset.url;
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setBannerUrl(preset.url)}
                    aria-pressed={isSelected}
                    className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors min-h-[32px] active:scale-[0.96] ${
                      isSelected
                        ? 'bg-[#EFE6FF] text-[#3B0764] font-semibold'
                        : 'bg-[#F4F4F6] text-[#52525B] hover:text-[#18181B]'
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Core Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5 sm:col-span-2">
              <label htmlFor="create-opp-name" className="text-xs font-semibold text-[#18181B] block">
                Event Title
              </label>
              <input
                id="create-opp-name"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., West Africa AI Agents Buildathon 2026"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F4F6] focus:bg-[#FFFFFF] text-sm text-[#18181B] placeholder:text-[#63636B]"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="create-opp-org" className="text-xs font-semibold text-[#18181B] block">
                Organizer Name
              </label>
              <input
                id="create-opp-org"
                type="text"
                value={organizerName}
                onChange={(e) => setOrganizerName(e.target.value)}
                placeholder="e.g., Lagos Developer Collective"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F4F6] focus:bg-[#FFFFFF] text-sm text-[#18181B]"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="create-opp-banner-url" className="text-xs font-semibold text-[#18181B] block">
                Custom Banner URL (optional)
              </label>
              <input
                id="create-opp-banner-url"
                type="url"
                value={bannerUrl}
                onChange={(e) => setBannerUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F4F6] focus:bg-[#FFFFFF] text-sm text-[#18181B]"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="create-opp-type" className="text-xs font-semibold text-[#18181B] block">
                Category
              </label>
              <select
                id="create-opp-type"
                value={type}
                onChange={(e) => setType(e.target.value as OpportunityType)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F4F6] focus:bg-[#FFFFFF] text-sm text-[#18181B]"
              >
                <option value="hackathon">Hackathon</option>
                <option value="event">Tech Event</option>
                <option value="grant">Grant Program</option>
                <option value="venture_hub">Accelerator / Venture Hub</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="create-opp-format" className="text-xs font-semibold text-[#18181B] block">
                Format
              </label>
              <select
                id="create-opp-format"
                value={format}
                onChange={(e) => setFormat(e.target.value as OpportunityFormat)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F4F6] focus:bg-[#FFFFFF] text-sm text-[#18181B]"
              >
                <option value="Hybrid">Hybrid</option>
                <option value="Online">Online</option>
                <option value="In-Person">In-Person</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="create-opp-prize" className="text-xs font-semibold text-[#18181B] block">
                Prize Pool / Funding
              </label>
              <input
                id="create-opp-prize"
                type="text"
                value={prizePool}
                onChange={(e) => setPrizePool(e.target.value)}
                placeholder="$25,000 USD"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F4F6] focus:bg-[#FFFFFF] text-sm text-[#18181B]"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="create-opp-deadline" className="text-xs font-semibold text-[#18181B] block">
                Submission Deadline
              </label>
              <input
                id="create-opp-deadline"
                type="date"
                value={deadlineDate}
                onChange={(e) => setDeadlineDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F4F6] focus:bg-[#FFFFFF] text-sm text-[#18181B]"
              />
            </div>

            {format !== 'Online' && (
              <div className="space-y-1.5 sm:col-span-2">
                <label htmlFor="create-opp-location" className="text-xs font-semibold text-[#18181B] block">
                  City / Venue Location
                </label>
                <input
                  id="create-opp-location"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., Yaba, Lagos & Online"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F4F6] focus:bg-[#FFFFFF] text-sm text-[#18181B]"
                />
              </div>
            )}

            <div className="space-y-1.5 sm:col-span-2">
              <label htmlFor="create-opp-summary" className="text-xs font-semibold text-[#18181B] block">
                Developer Brief Summary
              </label>
              <textarea
                id="create-opp-summary"
                rows={2}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Describe what builders will ship and why judges care..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F4F6] focus:bg-[#FFFFFF] text-sm text-[#18181B] placeholder:text-[#63636B]"
              />
            </div>
          </div>

          {/* Domain Tags */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-[#18181B] block">Domain Tags</span>
            <div className="flex flex-wrap gap-1.5">
              {ALL_INTEREST_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleToggleTag(tag)}
                    aria-pressed={isSelected}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors min-h-[34px] active:scale-[0.96] ${
                      isSelected
                        ? 'bg-[#18181B] text-white font-semibold'
                        : 'bg-[#F4F4F6] text-[#52525B] hover:text-[#18181B]'
                    }`}
                  >
                    {isSelected && <Check aria-hidden="true" className="w-3 h-3 stroke-[2.5]" />}
                    <span>{tag}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Required Deliverables Builder */}
          <div className="space-y-2.5 bg-[#F4F4F6] p-4 rounded-2xl">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-[#18181B]">
                Builder Checklist Requirements ({requirements.length})
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {requirements.map((req) => (
                <span
                  key={req.id}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FFFFFF] text-xs font-medium text-[#18181B]"
                >
                  <span>{req.title}</span>
                  {requirements.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        setRequirements((prev) => prev.filter((item) => item.id !== req.id))
                      }
                      aria-label={`Remove ${req.title}`}
                      className="text-[#63636B] hover:text-[#18181B] p-0.5 rounded"
                    >
                      <X aria-hidden="true" className="w-3 h-3" />
                    </button>
                  )}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                aria-label="Add custom deliverable"
                value={customReqTitle}
                onChange={(e) => setCustomReqTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddRequirement();
                  }
                }}
                placeholder="Add deliverable (e.g., Figma Prototype Link)"
                className="flex-1 min-w-0 px-3 py-2 rounded-xl bg-[#FFFFFF] text-xs text-[#18181B] placeholder:text-[#63636B]"
              />
              <button
                type="button"
                onClick={handleAddRequirement}
                className="btn-tactile-secondary px-3 py-2 rounded-xl text-xs font-medium inline-flex items-center gap-1 min-h-[36px] flex-shrink-0"
              >
                <Plus aria-hidden="true" className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* Submit Footer */}
          <div className="flex items-center justify-end gap-2.5 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="btn-tactile-secondary px-4 py-2.5 rounded-xl text-xs font-medium min-h-[42px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-tactile-primary px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold inline-flex items-center gap-2 min-h-[42px]"
            >
              <Sparkles aria-hidden="true" className="w-4 h-4 stroke-[2]" />
              <span>Publish Event</span>
            </button>
          </div>
        </form>
      </div>
    </AccessibleModal>
  );
};
