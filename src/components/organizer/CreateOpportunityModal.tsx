import React, { useRef, useState } from 'react';
import { X, Plus, Sparkles, Check, ShieldAlert } from 'lucide-react';
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
    description: 'Link to an open source repository with setup instructions.',
    type: 'repo_link',
    mandatory: true,
  },
  {
    id: 'req-custom-demo',
    step: 'Step 1: Technical Deliverables',
    title: '2-Minute Live Demo Video',
    description: 'Walkthrough showcasing the core user flow and technical architecture.',
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
  const titleInputRef = useRef<HTMLInputElement | null>(null);

  const defaultDeadline = new Date(Date.now() + 21 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  const [title, setTitle] = useState('');
  const [titleError, setTitleError] = useState('');
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
        description: 'Deliverable specified by the event host.',
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
      setTitleError('Enter a name for your event before publishing.');
      titleInputRef.current?.focus();
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
      description: `“${created.title}” is now visible to developers.`,
      action: {
        label: 'Preview listing',
        onClick: () => navigate(`/opportunities/${created.slug}`),
      },
    });

    setTitle('');
    setTitleError('');
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
      title="Publish event or opportunity"
      description="Customize your banner, deliverables, and go live for builders."
      icon={<Sparkles className="w-4 h-4 stroke-[1.75]" />}
      iconToneClass="bg-[#EFE6FF] text-[#3B0764]"
      closeLabel="Close publish dialog"
      footer={
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="btn-tactile-secondary px-4 py-2.5 rounded-xl text-xs font-medium min-h-[40px]"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="create-opportunity-form"
            className="btn-tactile-primary px-5 py-2.5 rounded-xl text-xs font-semibold inline-flex items-center gap-2 min-h-[40px]"
          >
            <Sparkles aria-hidden="true" className="w-3.5 h-3.5 stroke-[2]" />
            <span>Publish event</span>
          </button>
        </div>
      }
    >
      <form id="create-opportunity-form" onSubmit={handleSubmit} noValidate className="space-y-6">
        {/* Live Banner Preview */}
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-[#18181B]">
            Live banner preview
          </h3>
          <div className="rounded-xl overflow-hidden bg-[#F4F4F6]">
            <EventBanner
              title={title.trim() || 'West Africa AI Buildathon 2026'}
              type={type}
              bannerTheme={bannerTheme}
              bannerUrl={bannerUrl.trim() || undefined}
              organizerName={organizerName.trim() || 'Your Organization'}
              variant="hero"
            />
          </div>

          {/* Theme Swatches & Photo Presets */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(Object.keys(BANNER_THEMES) as BannerThemeId[]).map((themeKey) => {
              const palette = BANNER_THEMES[themeKey];
              const isSelected = bannerTheme === themeKey;
              return (
                <button
                  key={themeKey}
                  type="button"
                  onClick={() => setBannerTheme(themeKey)}
                  aria-pressed={isSelected}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs transition-colors min-h-[38px] active:scale-[0.96] ${
                    isSelected
                      ? 'bg-[#18181B] text-white font-semibold'
                      : 'bg-[#F4F4F6] text-[#18181B] font-medium hover:bg-[#EAEAEF]'
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

          <div className="flex flex-wrap gap-1.5">
            {BANNER_PHOTO_PRESETS.map((preset) => {
              const isSelected = bannerUrl.trim() === preset.url;
              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setBannerUrl(preset.url)}
                  aria-pressed={isSelected}
                  className={`px-3 py-1.5 rounded-xl text-xs transition-colors min-h-[34px] active:scale-[0.96] ${
                    isSelected
                      ? 'bg-[#EFE6FF] text-[#3B0764] font-semibold'
                      : 'bg-[#F4F4F6] text-[#52525B] font-medium hover:text-[#18181B]'
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        </section>

        {/* Core Details Grid */}
        <section className="space-y-3.5">
          <h3 className="text-sm font-semibold text-[#18181B]">
            Event details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5 sm:col-span-2">
              <label htmlFor="create-opp-name" className="text-xs font-medium text-[#52525B] block">
                Event title
              </label>
              <input
                ref={titleInputRef}
                id="create-opp-name"
                type="text"
                required
                aria-invalid={Boolean(titleError)}
                aria-describedby={titleError ? 'create-opp-name-error' : undefined}
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (titleError) setTitleError('');
                }}
                placeholder="West Africa AI Agents Buildathon 2026"
                className="field-surface w-full px-3.5 py-2.5 rounded-xl text-base sm:text-sm"
              />
              {titleError && (
                <p id="create-opp-name-error" role="alert" className="text-xs text-rose-700 font-medium flex items-center gap-1.5">
                  <ShieldAlert aria-hidden="true" className="w-3.5 h-3.5 flex-shrink-0 stroke-[2]" />
                  <span>{titleError}</span>
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="create-opp-org" className="text-xs font-medium text-[#52525B] block">
                Organizer name
              </label>
              <input
                id="create-opp-org"
                type="text"
                value={organizerName}
                onChange={(e) => setOrganizerName(e.target.value)}
                placeholder="Lagos Developer Collective"
                className="field-surface w-full px-3.5 py-2.5 rounded-xl text-base sm:text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="create-opp-banner-url" className="text-xs font-medium text-[#52525B] block">
                Custom banner URL (optional)
              </label>
              <input
                id="create-opp-banner-url"
                type="url"
                value={bannerUrl}
                onChange={(e) => setBannerUrl(e.target.value)}
                placeholder="https://example.com/banner.jpg"
                className="field-surface w-full px-3.5 py-2.5 rounded-xl text-base sm:text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="create-opp-type" className="text-xs font-medium text-[#52525B] block">
                Category
              </label>
              <select
                id="create-opp-type"
                value={type}
                onChange={(e) => setType(e.target.value as OpportunityType)}
                className="field-surface w-full px-3.5 py-2.5 rounded-xl text-base sm:text-sm"
              >
                <option value="hackathon">Hackathon</option>
                <option value="event">Tech Event</option>
                <option value="grant">Grant Program</option>
                <option value="venture_hub">Accelerator / Venture Hub</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="create-opp-format" className="text-xs font-medium text-[#52525B] block">
                Format
              </label>
              <select
                id="create-opp-format"
                value={format}
                onChange={(e) => setFormat(e.target.value as OpportunityFormat)}
                className="field-surface w-full px-3.5 py-2.5 rounded-xl text-base sm:text-sm"
              >
                <option value="Hybrid">Hybrid</option>
                <option value="Online">Online</option>
                <option value="In-Person">In-Person</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="create-opp-prize" className="text-xs font-medium text-[#52525B] block">
                Prize pool or funding
              </label>
              <input
                id="create-opp-prize"
                type="text"
                value={prizePool}
                onChange={(e) => setPrizePool(e.target.value)}
                placeholder="$25,000 USD"
                className="field-surface w-full px-3.5 py-2.5 rounded-xl text-base sm:text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="create-opp-deadline" className="text-xs font-medium text-[#52525B] block">
                Submission deadline
              </label>
              <input
                id="create-opp-deadline"
                type="date"
                value={deadlineDate}
                onChange={(e) => setDeadlineDate(e.target.value)}
                className="field-surface w-full px-3.5 py-2.5 rounded-xl text-base sm:text-sm"
              />
            </div>

            {format !== 'Online' && (
              <div className="space-y-1.5 sm:col-span-2">
                <label htmlFor="create-opp-location" className="text-xs font-medium text-[#52525B] block">
                  City or venue location
                </label>
                <input
                  id="create-opp-location"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Yaba, Lagos & Online"
                  className="field-surface w-full px-3.5 py-2.5 rounded-xl text-base sm:text-sm"
                />
              </div>
            )}

            <div className="space-y-1.5 sm:col-span-2">
              <label htmlFor="create-opp-summary" className="text-xs font-medium text-[#52525B] block">
                Developer brief
              </label>
              <textarea
                id="create-opp-summary"
                rows={2}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Build real-time offline payment rails for informal merchants."
                className="field-surface w-full px-3.5 py-2.5 rounded-xl text-base sm:text-sm leading-relaxed"
              />
            </div>
          </div>
        </section>

        {/* Domain Tags */}
        <section className="space-y-2.5">
          <h3 className="text-sm font-semibold text-[#18181B]">Domain tracks</h3>
          <div className="flex flex-wrap gap-1.5">
            {ALL_INTEREST_TAGS.map((tag) => {
              const isSelected = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleToggleTag(tag)}
                  aria-pressed={isSelected}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs transition-colors min-h-[34px] active:scale-[0.96] ${
                    isSelected
                      ? 'bg-[#18181B] text-white font-semibold'
                      : 'bg-[#F4F4F6] text-[#52525B] font-medium hover:text-[#18181B]'
                  }`}
                >
                  {isSelected && <Check aria-hidden="true" className="w-3 h-3 stroke-[2.2]" />}
                  <span>{tag}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Required Deliverables Builder */}
        <section className="space-y-3 bg-[#F4F4F6] p-4 rounded-2xl">
          <h3 className="text-sm font-semibold text-[#18181B] tabular-nums">
            Required builder deliverables ({requirements.length})
          </h3>
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
              aria-label="Add deliverable requirement"
              value={customReqTitle}
              onChange={(e) => setCustomReqTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddRequirement();
                }
              }}
              placeholder="Figma prototype link"
              className="field-surface bg-white flex-1 min-w-0 px-3 py-2 rounded-xl text-base sm:text-xs"
            />
            <button
              type="button"
              onClick={handleAddRequirement}
              className="btn-tactile-secondary bg-white px-3.5 py-2 rounded-xl text-xs font-medium inline-flex items-center gap-1.5 min-h-[38px] flex-shrink-0"
            >
              <Plus aria-hidden="true" className="w-3.5 h-3.5 stroke-[2]" />
              <span>Add deliverable</span>
            </button>
          </div>
        </section>
      </form>
    </AccessibleModal>
  );
};
