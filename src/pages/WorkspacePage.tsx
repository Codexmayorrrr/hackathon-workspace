import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Clock,
  Calendar,
  ExternalLink,
  Layers,
  CheckSquare,
  Users,
  Trophy,
  Lightbulb,
  Copy,
  Check,
  Link as LinkIcon,
  Sparkles,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Presentation,
  Luggage,
  FolderArchive,
  SlidersHorizontal,
  FileText,
  Code2,
} from 'lucide-react';
import {
  WorkspaceStage,
  ApplicationRequirement,
  VaultCategory,
  WorkspaceSectionId,
  WorkspaceConfig,
} from '../types';
import { useAllOpportunities, useWorkspaceStore } from '../store/useWorkspaceStore';
import { EventBanner } from '../components/ui/EventBanner';
import { getCountdownParts, formatEventDate, generateReminderCheckpoints } from '../utils/dateUtils';
import {
  ALL_SECTIONS_META,
  generateAdaptiveWorkspaceConfig,
  getOrderedVisibleSections,
} from '../utils/workspaceConfig';
import { CATEGORY_THEMES } from '../utils/categoryTheme';
import {
  buildDeckFromTemplate,
  getDefaultTemplateIdForOpportunity,
} from '../utils/deckTemplates';
import { MarkdownContent } from '../components/ui/MarkdownContent';
import { CalendarSyncModal } from '../components/calendar/CalendarSyncModal';
import { ReminderTimeline } from '../components/workspace/ReminderTimeline';
import { ApplicationHelperModal } from '../components/workspace/ApplicationHelperModal';
import { ReusableVaultModal } from '../components/vault/ReusableVaultModal';
import { IdeaSuggestionsEngine } from '../components/workspace/IdeaSuggestionsEngine';
import { PresentationCoach } from '../components/pitch/PresentationCoach';
import { TeammateFinderBoard } from '../components/workspace/TeammateFinderBoard';
import { InPersonLogistics } from '../components/workspace/InPersonLogistics';
import { IntelSection } from '../components/workspace/IntelSection';
import { TasksDeadlinesSection } from '../components/workspace/TasksDeadlinesSection';
import { NotesSection } from '../components/workspace/NotesSection';
import { BuildSection } from '../components/workspace/BuildSection';
import { PitchDocumentsSection } from '../components/workspace/PitchDocumentsSection';
import { ShowcaseSection } from '../components/workspace/ShowcaseSection';
import { ResultsSection } from '../components/workspace/ResultsSection';
import { CustomizeSectionsModal } from '../components/workspace/CustomizeSectionsModal';
import { toast } from 'sonner';

const SECTION_ICONS: Record<WorkspaceSectionId, any> = {
  overview: Layers,
  intel: Users,
  tasks_deadlines: Calendar,
  notes: FileText,
  team: Users,
  application: CheckSquare,
  ideas: Lightbulb,
  build: Code2,
  pitch_documents: Presentation,
  logistics: Luggage,
  showcase: Sparkles,
  results: Trophy,
};

const STAGES: WorkspaceStage[] = ['saved', 'preparing', 'applied', 'building', 'pitching', 'results'];

export const WorkspacePage: React.FC = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const allOpportunities = useAllOpportunities();
  const opportunity = allOpportunities.find((opp) => opp.id === workspaceId);
  const workspace = useWorkspaceStore((state) =>
    workspaceId ? state.getWorkspace(workspaceId) : undefined
  );

  const saveOpportunity = useWorkspaceStore((state) => state.saveOpportunity);
  const setWorkspaceStage = useWorkspaceStore((state) => state.setWorkspaceStage);
  const toggleItemCompleted = useWorkspaceStore((state) => state.toggleItemCompleted);
  const updateItemDraft = useWorkspaceStore((state) => state.updateItemDraft);
  const updateItemDeliverableUrl = useWorkspaceStore((state) => state.updateItemDeliverableUrl);
  const toggleReminders = useWorkspaceStore((state) => state.toggleReminders);
  const toggleGoogleCalendar = useWorkspaceStore((state) => state.toggleGoogleCalendar);

  const [calendarModalOpen, setCalendarModalOpen] = useState(false);
  const [customizeModalOpen, setCustomizeModalOpen] = useState(false);
  const [highlightedJudgeId] = useState<string | null>(null);

  const [helperModalOpen, setHelperModalOpen] = useState(false);
  const [activeHelperReq, setActiveHelperReq] = useState<ApplicationRequirement | null>(null);
  const [vaultModalOpen, setVaultModalOpen] = useState(false);
  const [targetVaultReq, setTargetVaultReq] = useState<ApplicationRequirement | null>(null);
  const [initialVaultForm, setInitialVaultForm] = useState<{
    title: string;
    category: VaultCategory;
    content: string;
  } | null>(null);
  const [coachModalOpen, setCoachModalOpen] = useState(false);
  const [activeTimerKey, setActiveTimerKey] = useState<
    'app_deadline' | 'event_start' | 'build_clock' | 'submission_cutoff' | 'pitch_slot'
  >('app_deadline');

  const config: WorkspaceConfig = useMemo(() => {
    if (!opportunity) {
      return {
        opportunityType: 'hackathon',
        sections: { overview: true } as any,
        sectionOrder: ['overview'],
      };
    }
    return workspace?.config || generateAdaptiveWorkspaceConfig(opportunity);
  }, [workspace?.config, opportunity]);

  const visibleSections = useMemo(() => {
    return getOrderedVisibleSections(config);
  }, [config]);

  const requestedTab = searchParams.get('tab') || 'overview';
  let currentSectionId: WorkspaceSectionId = 'overview';
  if (requestedTab === 'checklist') currentSectionId = 'application';
  else if (requestedTab === 'pitch') currentSectionId = 'pitch_documents';
  else if (requestedTab === 'judges' || requestedTab === 'sponsors' || requestedTab === 'winners')
    currentSectionId = 'intel';
  else if (Object.keys(ALL_SECTIONS_META).includes(requestedTab))
    currentSectionId = requestedTab as WorkspaceSectionId;

  if (!config.sections[currentSectionId]) {
    currentSectionId = visibleSections[0] || 'overview';
  }

  const getAutoCategory = (title: string): VaultCategory => {
    const t = title.toLowerCase();
    if (t.includes('bio') || t.includes('founder') || t.includes('background') || t.includes('team'))
      return 'bio';
    if (t.includes('problem') || t.includes('friction') || t.includes('why'))
      return 'problem_statement';
    if (t.includes('market') || t.includes('tam') || t.includes('volume') || t.includes('business'))
      return 'tam_model';
    if (t.includes('story') || t.includes('origin') || t.includes('personal'))
      return 'personal_story';
    if (t.includes('architecture') || t.includes('tech') || t.includes('stack') || t.includes('infrastructure'))
      return 'tech_architecture';
    return 'general';
  };

  useEffect(() => {
    if (workspaceId && !workspace && opportunity) {
      saveOpportunity(workspaceId);
    }
  }, [workspaceId, workspace, opportunity, saveOpportunity]);

  const [countdown, setCountdown] = useState({
    days: '00',
    hours: '00',
    minutes: '00',
    seconds: '00',
    isPast: false,
  });

  useEffect(() => {
    if (!opportunity) return;
    const update = () => {
      setCountdown(getCountdownParts(opportunity.applicationDeadline));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [opportunity]);

  const handleTabChange = (tabId: string) => {
    setSearchParams({ tab: tabId });
  };

  const handleTabKeyDown = (e: React.KeyboardEvent, idx: number) => {
    let targetIdx: number | null = null;
    if (e.key === 'ArrowRight') targetIdx = (idx + 1) % visibleSections.length;
    else if (e.key === 'ArrowLeft') targetIdx = (idx - 1 + visibleSections.length) % visibleSections.length;
    else if (e.key === 'Home') targetIdx = 0;
    else if (e.key === 'End') targetIdx = visibleSections.length - 1;

    if (targetIdx !== null) {
      e.preventDefault();
      const targetId = visibleSections[targetIdx];
      handleTabChange(targetId);
      tabRefs.current[targetId]?.focus();
    }
  };

  if (!opportunity) {
    return (
      <div className="surface-card py-20 px-6 rounded-2xl text-center space-y-4">
        <h1 className="text-2xl font-bold text-[#18181B] tracking-tight">Opportunity not found</h1>
        <p className="text-sm text-[#52525B]">The workspace you requested does not exist.</p>
        <Link
          to="/saved"
          className="btn-tactile-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold min-h-[40px]"
        >
          Return to Saved Queue
        </Link>
      </div>
    );
  }

  const theme = CATEGORY_THEMES[opportunity.type] || CATEGORY_THEMES.hackathon;
  const CategoryIcon = theme.icon;

  const effectiveWorkspace = workspace || {
    id: opportunity.id,
    opportunityId: opportunity.id,
    savedAt: new Date().toISOString(),
    stage: 'saved' as WorkspaceStage,
    items: {},
    remindersEnabled: true,
    googleCalendarSynced: false,
    appleCalendarSynced: false,
  };

  const totalMandatory = opportunity.requirements.filter((r) => r.mandatory).length;
  const completedMandatory = opportunity.requirements.filter(
    (r) => r.mandatory && effectiveWorkspace.items[r.id]?.completed
  ).length;
  const totalItems = opportunity.requirements.length;
  const completedTotal = opportunity.requirements.filter(
    (r) => effectiveWorkspace.items[r.id]?.completed
  ).length;
  const progressPercent = Math.round((completedTotal / totalItems) * 100);

  const stepGroups = opportunity.requirements.reduce((acc, req) => {
    if (!acc[req.step]) acc[req.step] = [];
    acc[req.step].push(req);
    return acc;
  }, {} as Record<string, ApplicationRequirement[]>);

  const checkpoints = generateReminderCheckpoints(
    opportunity.applicationDeadline,
    effectiveWorkspace.savedAt,
    effectiveWorkspace.stage === 'applied' || effectiveWorkspace.stage === 'results'
  );

  return (
    <div className="space-y-6 sm:space-y-8 pb-20 min-w-0">
      {/* Breadcrumb & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Link
          to="/saved"
          className="inline-flex items-center gap-2 text-xs font-medium text-[#52525B] hover:text-[#18181B] transition-colors group min-w-0 py-1"
        >
          <ArrowLeft aria-hidden="true" className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1 rtl:-scale-x-100 stroke-[1.75] flex-shrink-0" />
          <span className="flex-shrink-0">Saved Queue</span>
          <span aria-hidden="true" className="text-[#63636B]">/</span>
          <span className="text-[#18181B] font-semibold truncate">{opportunity.title}</span>
        </Link>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <button
            type="button"
            onClick={() => setVaultModalOpen(true)}
            className="btn-tactile-secondary px-3.5 py-2 rounded-xl text-xs font-medium gap-1.5 min-h-[36px]"
            title="Open Reusable Vault"
          >
            <FolderArchive aria-hidden="true" className="w-3.5 h-3.5 text-[#52525B] stroke-[1.75]" />
            <span>Vault</span>
          </button>

          <button
            type="button"
            onClick={() => setCalendarModalOpen(true)}
            className="btn-tactile-secondary px-3.5 py-2 rounded-xl text-xs font-medium gap-1.5 min-h-[36px]"
          >
            <Calendar aria-hidden="true" className="w-3.5 h-3.5 text-[#52525B] stroke-[1.75]" />
            <span>Sync</span>
          </button>

          <a
            href={opportunity.externalPortalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-tactile-secondary px-3.5 py-2 rounded-xl text-xs font-medium gap-1.5 min-h-[36px]"
          >
            <span>Portal</span>
            <ExternalLink aria-hidden="true" className="w-3.5 h-3.5 text-[#52525B] stroke-[1.75]" />
          </a>
        </div>
      </div>

      {/* Workspace Header Card */}
      <div className="surface-card rounded-2xl overflow-hidden min-w-0">
        <EventBanner
          title={opportunity.title}
          type={opportunity.type}
          bannerUrl={opportunity.bannerUrl}
          bannerTheme={opportunity.bannerTheme}
          organizerName={opportunity.organizerName}
          variant="hero"
        />

        <div className="p-5 sm:p-8 space-y-6 min-w-0">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 min-w-0">
          <div className="space-y-3 min-w-0">
            <div className="flex items-center gap-2 text-xs text-[#52525B] font-medium flex-wrap">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold ${theme.badgeClasses}`}>
                <CategoryIcon aria-hidden="true" className="w-3 h-3 stroke-[2]" />
                <span>{theme.label}</span>
              </span>
              <span className="px-2 py-0.5 rounded-md bg-[#F4F4F6] text-[#52525B] capitalize text-[11px] font-medium">
                {opportunity.format}
              </span>
              <span className="font-semibold text-[#18181B] font-mono tabular-nums">
                {opportunity.prizePool}
              </span>
            </div>

            <h1 className="text-xl sm:text-3xl font-bold text-[#18181B] tracking-tight leading-snug">
              {opportunity.title}
            </h1>
          </div>

          {/* Consolidated Clocks Control */}
          <div className="flex flex-col lg:items-end gap-2 flex-shrink-0 max-w-full">
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#F4F4F6] text-xs font-mono tabular-nums flex-wrap max-w-full">
              <Clock aria-hidden="true" className="w-3.5 h-3.5 text-[#52525B] stroke-[1.75] flex-shrink-0" />
              <span className="font-semibold text-[#18181B]">
                {activeTimerKey === 'app_deadline' &&
                  `${countdown.days}d ${countdown.hours}h ${countdown.minutes}m ${countdown.seconds}s`}
                {activeTimerKey === 'build_clock' && `${opportunity.buildClockHours || 48}h 00m 00s`}
                {activeTimerKey === 'event_start' &&
                  (opportunity.eventStart ? formatEventDate(opportunity.eventStart) : 'Nov 27, 2026')}
                {activeTimerKey === 'submission_cutoff' &&
                  (opportunity.submissionCutoff ? formatEventDate(opportunity.submissionCutoff) : 'Nov 29, 2026')}
                {activeTimerKey === 'pitch_slot' && (opportunity.pitchSlotTime || '3m 00s')}
              </span>
              <span className="text-[#52525B] font-sans text-xs">
                {activeTimerKey === 'app_deadline' ? 'left to apply' : activeTimerKey.replace('_', ' ')}
              </span>
            </div>

            {/* Inline Clock Selector Pills (WCAG 2.5.8 >= 28px touch target) */}
            <div className="flex items-center gap-1.5 flex-wrap" role="group" aria-label="Switch countdown clock">
              {(['app_deadline', 'build_clock', 'event_start', 'submission_cutoff', 'pitch_slot'] as const).map((tKey) => {
                const labels: Record<string, string> = {
                  app_deadline: 'Deadline',
                  build_clock: 'Build',
                  event_start: 'Start',
                  submission_cutoff: 'Cutoff',
                  pitch_slot: 'Pitch',
                };
                const isSelected = activeTimerKey === tKey;
                return (
                  <button
                    type="button"
                    key={tKey}
                    onClick={() => setActiveTimerKey(tKey)}
                    aria-pressed={isSelected}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-[transform,background-color,color] duration-150 active:scale-[0.96] min-h-[28px] ${
                      isSelected
                        ? 'bg-[#18181B] text-white font-semibold'
                        : 'text-[#52525B] hover:text-[#18181B] hover:bg-[#F4F4F6]'
                    }`}
                  >
                    {labels[tKey]}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Stage Selector Pipeline (wraps cleanly down to 320px) */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 pt-1 min-w-0">
          <span className="text-xs font-semibold text-[#52525B] flex-shrink-0">Stage</span>
          <div
            role="group"
            aria-label="Workspace preparation stage"
            className="flex items-center gap-1.5 bg-[#F4F4F6] p-1.5 rounded-xl flex-wrap max-w-full"
          >
            {STAGES.map((st, idx) => {
              const isCurrent = effectiveWorkspace.stage === st;
              const isPastStage = STAGES.indexOf(effectiveWorkspace.stage) > idx;

              return (
                <button
                  type="button"
                  key={st}
                  onClick={() => {
                    setWorkspaceStage(opportunity.id, st);
                    toast.success(`Stage updated to ${st}`);
                  }}
                  aria-pressed={isCurrent}
                  className={`relative px-3 py-1.5 rounded-lg text-xs capitalize transition-[transform,background-color,color] duration-150 whitespace-nowrap active:scale-[0.96] min-h-[32px] ${
                    isCurrent
                      ? 'text-[#18181B] font-semibold bg-white'
                      : isPastStage
                      ? 'text-[#065F46] font-medium'
                      : 'text-[#52525B] font-medium hover:text-[#18181B]'
                  }`}
                >
                  <span className="relative z-10 flex items-center gap-1.5">
                    {isPastStage && <Check aria-hidden="true" className="w-3 h-3 text-emerald-700 stroke-[2.5]" />}
                    <span>{st}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
        </div>
      </div>

      {/* Workspace Tabs Navigation (Wraps cleanly on desktop so zero tabs ever hide at 1440px) */}
      <div className="sticky top-[calc(3.5rem+env(safe-area-inset-top,0px))] md:top-0 z-20 bg-[#F3F3F6]/95 backdrop-blur-xl py-3 flex items-start md:items-center justify-between gap-3">
        <div className="relative flex-1 min-w-0">
          <div
            role="tablist"
            aria-label="Workspace sections"
            className="flex items-center gap-x-1.5 gap-y-2 overflow-x-auto overscroll-x-contain snap-x snap-proximity md:snap-none md:overflow-visible md:flex-wrap no-scrollbar pe-8 md:pe-0 py-0.5"
          >
            {visibleSections.map((secId, idx) => {
              const meta = ALL_SECTIONS_META[secId];
              const Icon = SECTION_ICONS[secId] || Layers;
              const isActive = currentSectionId === secId;
              const hasOutcome =
                secId === 'results' &&
                effectiveWorkspace.results?.outcome &&
                effectiveWorkspace.results.outcome !== 'pending_review';
              const pendingTasks = effectiveWorkspace.tasks?.filter((t) => !t.completed).length ?? 0;

              return (
                <button
                  type="button"
                  key={secId}
                  ref={(el) => {
                    tabRefs.current[secId] = el;
                  }}
                  role="tab"
                  id={`tab-${secId}`}
                  aria-selected={isActive}
                  aria-controls={`panel-${secId}`}
                  tabIndex={isActive ? 0 : -1}
                  onKeyDown={(e) => handleTabKeyDown(e, idx)}
                  onClick={() => handleTabChange(secId)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-[transform,background-color,color] duration-150 whitespace-nowrap snap-start active:scale-[0.96] min-h-[36px] ${
                    isActive
                      ? 'bg-white text-[#18181B] font-semibold'
                      : 'text-[#52525B] hover:text-[#18181B] hover:bg-[#EBECEF]/70'
                  }`}
                >
                  <Icon
                    aria-hidden="true"
                    className={`w-3.5 h-3.5 ${
                      isActive ? 'text-[#18181B] stroke-[2]' : 'text-[#52525B] stroke-[1.75]'
                    }`}
                  />
                  <span>{meta.shortLabel}</span>

                  {secId === 'application' && (
                    <span className="px-1.5 py-0.5 rounded-md text-[11px] font-mono font-semibold bg-[#F4F4F6] text-[#18181B] tabular-nums">
                      {completedTotal}/{totalItems}
                    </span>
                  )}

                  {secId === 'tasks_deadlines' && pendingTasks > 0 && (
                    <span className="px-1.5 py-0.5 rounded-md text-[11px] font-mono font-semibold bg-[#DECAFF] text-[#18181B] tabular-nums">
                      {pendingTasks}
                    </span>
                  )}

                  {hasOutcome && (
                    <span
                      aria-label="Outcome logged"
                      className="inline-flex items-center gap-1 text-[10px] font-semibold bg-[#ECFDF5] text-[#065F46] px-1.5 py-0.5 rounded"
                    >
                      Logged
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Mobile scroll affordance cue when horizontally scrolling */}
          <div
            aria-hidden="true"
            className="md:hidden pointer-events-none absolute inset-y-0 end-0 w-8 bg-gradient-to-l from-[#F3F3F6] via-[#F3F3F6]/85 to-transparent flex items-center justify-end"
          >
            <ChevronRight className="w-4 h-4 text-[#52525B] stroke-[2]" />
          </div>
        </div>

        {/* Customize Navigation Button */}
        <button
          type="button"
          onClick={() => setCustomizeModalOpen(true)}
          className="btn-tactile-secondary px-3.5 py-2 rounded-xl text-xs font-medium gap-1.5 flex-shrink-0 min-h-[36px]"
          title="Customize workspace sections"
          aria-label="Customize workspace sections"
        >
          <SlidersHorizontal aria-hidden="true" className="w-3.5 h-3.5 stroke-[1.75]" />
          <span className="hidden sm:inline">Customize</span>
        </button>
      </div>

      {/* TAB CONTENT AREAS */}
      <div role="tabpanel" id={`panel-${currentSectionId}`} aria-labelledby={`tab-${currentSectionId}`}>
        {/* 1. OVERVIEW TAB */}
        {currentSectionId === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="lg:col-span-2 space-y-6 sm:space-y-8 min-w-0">
              <div className="surface-card p-6 sm:p-8 rounded-2xl space-y-4">
                <h2 className="text-lg font-semibold text-[#18181B] tracking-tight">
                  About the Opportunity
                </h2>
                <MarkdownContent content={opportunity.descriptionMarkdown} />
              </div>

              {/* Key Milestones Timeline */}
              <div className="surface-card p-6 sm:p-8 rounded-2xl space-y-4">
                <h2 className="text-base font-semibold text-[#18181B] tracking-tight">
                  Key Milestones
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="p-4 rounded-xl bg-[#F4F4F6] space-y-1">
                    <p className="text-xs font-medium text-[#63636B]">
                      Registration Opens
                    </p>
                    <p className="text-sm font-semibold text-[#18181B] font-mono tabular-nums">
                      {formatEventDate(opportunity.registrationOpens)}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-[#18181B] text-white space-y-1">
                    <p className="text-xs font-medium text-neutral-200">
                      Submission Deadline
                    </p>
                    <p className="text-sm font-semibold text-white font-mono tabular-nums">
                      {formatEventDate(opportunity.applicationDeadline)}
                    </p>
                  </div>
                  {opportunity.judgingStarts && (
                    <div className="p-4 rounded-xl bg-[#F4F4F6] space-y-1">
                      <p className="text-xs font-medium text-[#63636B]">
                        Judging Starts
                      </p>
                      <p className="text-sm font-semibold text-[#18181B] font-mono tabular-nums">
                        {formatEventDate(opportunity.judgingStarts)}
                      </p>
                    </div>
                  )}
                  {opportunity.winnersAnnounced && (
                    <div className="p-4 rounded-xl bg-[#F4F4F6] space-y-1">
                      <p className="text-xs font-medium text-[#63636B]">
                        Winners Announced
                      </p>
                      <p className="text-sm font-semibold text-[#18181B] font-mono tabular-nums">
                        {formatEventDate(opportunity.winnersAnnounced)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Reminders */}
            <div className="space-y-6 min-w-0">
              <ReminderTimeline
                checkpoints={checkpoints}
                remindersEnabled={effectiveWorkspace.remindersEnabled}
                onToggleReminders={() => toggleReminders(opportunity.id)}
                isApplied={effectiveWorkspace.stage === 'applied' || effectiveWorkspace.stage === 'results'}
              />
            </div>
          </div>
        )}

        {/* 2. APPLICATION CHECKLIST TAB */}
        {currentSectionId === 'application' && (
          <div className="space-y-6 sm:space-y-8">
            <div className="surface-card p-6 sm:p-8 rounded-2xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <h2 className="text-lg sm:text-xl font-bold text-[#18181B] tracking-tight">
                    Application Preparation Checklist
                  </h2>
                  <p className="text-xs sm:text-sm text-[#52525B]">
                    Checking off deliverables saves locally and moves stage to{' '}
                    <strong className="text-[#18181B] font-semibold">Preparing</strong>.
                  </p>
                </div>
                <div className="text-start sm:text-end flex-shrink-0">
                  <span className="text-sm font-mono font-bold text-[#18181B] tabular-nums">
                    {completedMandatory} of {totalMandatory} mandatory ready
                  </span>
                  <p className="text-xs text-[#52525B] tabular-nums">({progressPercent}% overall)</p>
                </div>
              </div>

              <div
                role="progressbar"
                aria-valuenow={progressPercent}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Overall checklist completion"
                className="w-full h-2.5 bg-[#F4F4F6] rounded-full overflow-hidden"
              >
                <motion.div
                  className="h-full bg-[#18181B] rounded-full"
                  initial={false}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
                />
              </div>
            </div>

            <div className="space-y-8">
              {Object.entries(stepGroups).map(([stepName, reqs]) => (
                <section key={stepName} className="space-y-3.5">
                  <h3 className="text-sm font-semibold text-[#52525B] px-1 flex items-center gap-2">
                    <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full bg-[#18181B]" />
                    <span>{stepName}</span>
                  </h3>

                  <div className="space-y-3">
                    {reqs.map((req) => (
                      <InteractiveChecklistRow
                        key={req.id}
                        requirement={req}
                        itemState={effectiveWorkspace.items[req.id]}
                        onToggle={() => toggleItemCompleted(opportunity.id, req.id)}
                        onSaveDraft={(text) => updateItemDraft(opportunity.id, req.id, text)}
                        onSaveUrl={(url) => updateItemDeliverableUrl(opportunity.id, req.id, url)}
                        onOpenHelper={() => {
                          setActiveHelperReq(req);
                          setHelperModalOpen(true);
                        }}
                        onOpenVault={() => {
                          setTargetVaultReq(req);
                          setInitialVaultForm(null);
                          setVaultModalOpen(true);
                        }}
                        onSaveToVault={(text) => {
                          setTargetVaultReq(null);
                          setInitialVaultForm({
                            title: `${req.title} snippet`,
                            category: getAutoCategory(req.title),
                            content: text,
                          });
                          setVaultModalOpen(true);
                        }}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </div>
        )}

        {currentSectionId === 'intel' && (
          <IntelSection opportunity={opportunity} highlightedJudgeId={highlightedJudgeId} />
        )}

        {currentSectionId === 'tasks_deadlines' && (
          <TasksDeadlinesSection
            opportunity={opportunity}
            onOpenCalendarSync={() => setCalendarModalOpen(true)}
          />
        )}

        {currentSectionId === 'notes' && <NotesSection opportunity={opportunity} />}

        {currentSectionId === 'team' && (
          <TeammateFinderBoard workspaceId={opportunity.id} opportunityTitle={opportunity.title} />
        )}

        {currentSectionId === 'ideas' && (
          <IdeaSuggestionsEngine opportunity={opportunity} workspaceId={opportunity.id} />
        )}

        {currentSectionId === 'build' && <BuildSection opportunity={opportunity} />}

        {currentSectionId === 'pitch_documents' && (
          <PitchDocumentsSection
            opportunity={opportunity}
            onLaunchCoach={() => setCoachModalOpen(true)}
          />
        )}

        {currentSectionId === 'logistics' && (
          <InPersonLogistics workspaceId={opportunity.id} opportunityTitle={opportunity.title} />
        )}

        {currentSectionId === 'showcase' && <ShowcaseSection opportunity={opportunity} />}

        {currentSectionId === 'results' && <ResultsSection opportunity={opportunity} />}
      </div>

      {/* Calendar Modal */}
      <CalendarSyncModal
        isOpen={calendarModalOpen}
        onClose={() => setCalendarModalOpen(false)}
        opportunityTitle={opportunity.title}
        isGoogleSynced={effectiveWorkspace.googleCalendarSynced}
        onToggleGoogleSync={(synced) => toggleGoogleCalendar(opportunity.id, synced)}
      />

      {/* Customize Navigation Modal */}
      <CustomizeSectionsModal
        isOpen={customizeModalOpen}
        onClose={() => setCustomizeModalOpen(false)}
        opportunity={opportunity}
      />

      {/* Application Helper Modal */}
      {helperModalOpen && activeHelperReq && (
        <ApplicationHelperModal
          isOpen={helperModalOpen}
          onClose={() => {
            setHelperModalOpen(false);
            setActiveHelperReq(null);
          }}
          requirement={activeHelperReq}
          opportunity={opportunity}
          currentDraft={effectiveWorkspace.items[activeHelperReq.id]?.draftText || ''}
          onApplyDraft={(text) => updateItemDraft(opportunity.id, activeHelperReq.id, text)}
          onOpenVault={() => {
            setTargetVaultReq(activeHelperReq);
            setInitialVaultForm(null);
            setHelperModalOpen(false);
            setVaultModalOpen(true);
          }}
          onSaveToVault={(text) => {
            setTargetVaultReq(null);
            setInitialVaultForm({
              title: `${activeHelperReq.title} snippet`,
              category: getAutoCategory(activeHelperReq.title),
              content: text,
            });
            setHelperModalOpen(false);
            setVaultModalOpen(true);
          }}
        />
      )}

      {/* Reusable Vault Modal */}
      <ReusableVaultModal
        isOpen={vaultModalOpen}
        onClose={() => {
          setVaultModalOpen(false);
          setTargetVaultReq(null);
          setInitialVaultForm(null);
        }}
        targetRequirement={targetVaultReq || activeHelperReq}
        initialFormState={initialVaultForm}
        onInsertSnippet={(text) => {
          const target = targetVaultReq || activeHelperReq;
          if (target) {
            updateItemDraft(opportunity.id, target.id, text);
          } else {
            const firstPrompt = opportunity.requirements.find((r) => r.type === 'text_prompt');
            if (firstPrompt) {
              updateItemDraft(opportunity.id, firstPrompt.id, text);
            }
          }
        }}
      />

      {/* Presentation Coach Voice Modal */}
      {coachModalOpen && (
        <PresentationCoach
          isOpen={coachModalOpen}
          onClose={() => setCoachModalOpen(false)}
          slideDeck={
            effectiveWorkspace.slideDeck ||
            buildDeckFromTemplate(getDefaultTemplateIdForOpportunity(opportunity.type), {
              workspaceId: opportunity.id,
              opportunityTitle: opportunity.title,
              opportunity,
              repoUrl: effectiveWorkspace.githubRepoUrl,
            })
          }
          opportunityTitle={opportunity.title}
        />
      )}
    </div>
  );
};

interface InteractiveChecklistRowProps {
  requirement: ApplicationRequirement;
  itemState?: { completed: boolean; draftText?: string; deliverableUrl?: string };
  onToggle: () => void;
  onSaveDraft: (text: string) => void;
  onSaveUrl: (url: string) => void;
  onOpenHelper?: () => void;
  onOpenVault?: () => void;
  onSaveToVault?: (text: string) => void;
}

const InteractiveChecklistRow: React.FC<InteractiveChecklistRowProps> = ({
  requirement,
  itemState = { completed: false },
  onToggle,
  onSaveDraft,
  onSaveUrl,
  onOpenHelper,
  onOpenVault,
  onSaveToVault,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [draft, setDraft] = useState(itemState.draftText || '');
  const [url, setUrl] = useState(itemState.deliverableUrl || '');
  const [savedStatus, setSavedStatus] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const vaultItems = useWorkspaceStore((state) => state.vaultItems);

  const suggestedVaultItem = useMemo(() => {
    if (draft.trim() || requirement.type !== 'text_prompt') return null;
    const t = requirement.title.toLowerCase();
    if (t.includes('bio') || t.includes('founder') || t.includes('background') || t.includes('team')) {
      return vaultItems.find((i) => i.category === 'bio') || null;
    }
    if (t.includes('problem') || t.includes('friction') || t.includes('bottleneck') || t.includes('why')) {
      return vaultItems.find((i) => i.category === 'problem_statement') || null;
    }
    if (t.includes('market') || t.includes('tam') || t.includes('volume') || t.includes('business')) {
      return vaultItems.find((i) => i.category === 'tam_model') || null;
    }
    if (t.includes('story') || t.includes('origin') || t.includes('personal')) {
      return vaultItems.find((i) => i.category === 'personal_story') || null;
    }
    if (t.includes('architecture') || t.includes('tech') || t.includes('stack') || t.includes('infrastructure')) {
      return vaultItems.find((i) => i.category === 'tech_architecture') || null;
    }
    return null;
  }, [draft, requirement, vaultItems]);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (itemState.draftText !== undefined) setDraft(itemState.draftText);
    if (itemState.deliverableUrl !== undefined) setUrl(itemState.deliverableUrl);
  }, [itemState.draftText, itemState.deliverableUrl]);

  const words = useMemo(() => {
    const trimmed = draft.trim();
    if (!trimmed) return 0;
    return trimmed.split(/\s+/).length;
  }, [draft]);

  const maxWords = requirement.maxWords || 150;
  const wordRatio = words / maxWords;

  let wordCountColor = 'text-[#52525B]';
  let isOverLimit = false;

  if (words > 0) {
    if (words > maxWords) {
      wordCountColor = 'text-rose-700 font-bold';
      isOverLimit = true;
    } else if (wordRatio >= 0.9) {
      wordCountColor = 'text-amber-800 font-semibold';
    }
  }

  const handleDraftChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setDraft(val);
    setSavedStatus('Typing…');

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      onSaveDraft(val);
      setSavedStatus('Saved just now');
      setTimeout(() => setSavedStatus(null), 2500);
    }, 800);
  };

  const handleUrlBlur = () => {
    if (url !== itemState.deliverableUrl) {
      onSaveUrl(url);
      toast.success('Deliverable link saved');
    }
  };

  const handleCopy = () => {
    if (!draft) return;
    navigator.clipboard.writeText(draft);
    setCopySuccess(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const isDeliverableLinkType =
    requirement.type === 'pitch_deck' ||
    requirement.type === 'demo_video' ||
    requirement.type === 'repo_link' ||
    requirement.type === 'live_url';

  const draftFieldId = `draft-${requirement.id}`;
  const urlFieldId = `url-${requirement.id}`;

  return (
    <div
      className={`surface-card rounded-2xl transition-opacity ${
        itemState.completed ? 'opacity-80' : 'surface-card-interactive'
      }`}
    >
      {/* Row Header */}
      <div className="p-5 sm:p-6 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3.5 flex-1 min-w-0">
          {/* Tactile Checkbox with 36x36 hit target */}
          <button
            type="button"
            role="checkbox"
            aria-checked={itemState.completed}
            aria-label={
              itemState.completed
                ? `Mark "${requirement.title}" incomplete`
                : `Mark "${requirement.title}" complete`
            }
            onClick={onToggle}
            className="w-9 h-9 -ms-1.5 -mt-1.5 rounded-xl flex items-center justify-center flex-shrink-0 hover:bg-[#F4F4F6] transition-colors"
          >
            <span
              aria-hidden="true"
              className={`w-5 h-5 rounded-md flex items-center justify-center transition-[transform,background-color] duration-150 ${
                itemState.completed
                  ? 'bg-[#18181B] text-white'
                  : 'bg-[#E4E4E9]'
              }`}
            >
              {itemState.completed && (
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', duration: 0.2 }}
                >
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                </motion.div>
              )}
            </span>
          </button>

          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm font-semibold">
                <button
                  type="button"
                  onClick={onToggle}
                  className={`text-start transition-colors ${
                    itemState.completed
                      ? 'line-through text-[#63636B]'
                      : 'text-[#18181B] hover:text-[#52525B]'
                  }`}
                >
                  {requirement.title}
                </button>
              </h4>

              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                  requirement.mandatory
                    ? 'bg-[#18181B] text-white'
                    : 'bg-[#F4F4F6] text-[#52525B]'
                }`}
              >
                {requirement.mandatory ? 'Required' : 'Optional'}
              </span>

              {requirement.maxWords && (
                <span className="text-xs font-mono text-[#52525B] tabular-nums">
                  (Max {requirement.maxWords} words)
                </span>
              )}

              {requirement.acceptedFormats && (
                <span className="text-xs font-mono text-[#52525B]">
                  ({requirement.acceptedFormats})
                </span>
              )}
            </div>

            {requirement.description && (
              <p className="text-xs text-[#52525B] leading-relaxed max-w-[65ch]">
                {requirement.description}
              </p>
            )}

            {!isExpanded && (
              <div className="pt-1 flex items-center gap-3 text-xs">
                {requirement.type === 'text_prompt' && draft && (
                  <span className="text-[#52525B] font-mono text-xs tabular-nums">
                    Draft: {words} words
                  </span>
                )}
                {isDeliverableLinkType && url && (
                  <a
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#18181B] hover:underline inline-flex items-center gap-1 text-xs truncate max-w-[240px]"
                  >
                    <span className="truncate">{url.replace(/^https?:\/\//, '')}</span>
                    <ExternalLink aria-hidden="true" className="w-3 h-3 flex-shrink-0 stroke-[1.75]" />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-expanded={isExpanded}
          aria-label={isExpanded ? `Collapse ${requirement.title}` : `Expand ${requirement.title}`}
          className="w-9 h-9 rounded-xl btn-tactile-secondary flex items-center justify-center flex-shrink-0"
        >
          {isExpanded ? (
            <ChevronUp aria-hidden="true" className="w-4 h-4 stroke-[1.75]" />
          ) : (
            <ChevronDown aria-hidden="true" className="w-4 h-4 stroke-[1.75]" />
          )}
        </button>
      </div>

      {/* Accordion Expansion */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: 'spring', duration: 0.28, bounce: 0 }}
            className="overflow-hidden"
          >
            <div className="px-5 sm:px-6 pb-6 pt-2 space-y-4">
              {requirement.type === 'text_prompt' && (
                <div className="space-y-2.5 pt-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 flex-wrap">
                      <label htmlFor={draftFieldId} className="text-[#18181B] font-semibold">
                        Draft answer
                      </label>
                      {onOpenHelper && (
                        <button
                          type="button"
                          onClick={onOpenHelper}
                          className="btn-tactile-secondary px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 min-h-[30px]"
                        >
                          <Sparkles aria-hidden="true" className="w-3.5 h-3.5 text-[#92400E] stroke-[2]" />
                          <span>Assistant (&le; {maxWords}w)</span>
                        </button>
                      )}
                      {onOpenVault && (
                        <button
                          type="button"
                          onClick={onOpenVault}
                          className="btn-tactile-secondary px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 min-h-[30px]"
                        >
                          <FolderArchive aria-hidden="true" className="w-3.5 h-3.5 stroke-[1.75]" />
                          <span>Vault</span>
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      {savedStatus && (
                        <span role="status" className="text-xs text-[#52525B] italic">
                          {savedStatus}
                        </span>
                      )}
                      <span className={`font-mono text-xs tabular-nums ${wordCountColor}`}>
                        {words} / {maxWords} words
                        {isOverLimit && ` — ${words - maxWords} over limit`}
                      </span>
                    </div>
                  </div>

                  {suggestedVaultItem && (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-[#FEF3C7]/70 text-xs gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <Sparkles aria-hidden="true" className="w-3.5 h-3.5 text-[#92400E] flex-shrink-0 stroke-[2]" />
                        <span className="text-[#92400E] truncate">
                          Vault match: <strong className="font-semibold">{suggestedVaultItem.title}</strong> ({suggestedVaultItem.wordCount}w)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setDraft(suggestedVaultItem.content);
                          onSaveDraft(suggestedVaultItem.content);
                          toast.success(`Inserted "${suggestedVaultItem.title}"`);
                        }}
                        className="btn-tactile-secondary bg-white px-3 py-1 rounded-lg text-xs font-semibold flex-shrink-0 min-h-[30px]"
                      >
                        Insert
                      </button>
                    </div>
                  )}

                  <textarea
                    id={draftFieldId}
                    value={draft}
                    onChange={handleDraftChange}
                    placeholder="Draft your answer here... Auto-saves locally."
                    rows={4}
                    className="field-surface w-full rounded-xl p-3.5 text-base sm:text-sm leading-relaxed"
                  />

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                    <p className="text-xs text-[#52525B]">
                      {isOverLimit
                        ? 'Over-limit text is preserved while editing down before submission.'
                        : 'Auto-saved locally. Copy directly into portal when ready.'}
                    </p>

                    <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
                      {onSaveToVault && draft.trim().length > 10 && (
                        <button
                          type="button"
                          onClick={() => onSaveToVault(draft.trim())}
                          className="btn-tactile-secondary px-3.5 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 min-h-[36px]"
                        >
                          <FolderArchive aria-hidden="true" className="w-3.5 h-3.5 stroke-[1.75]" />
                          <span>Save to Vault</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={handleCopy}
                        disabled={!draft}
                        className="btn-tactile-secondary px-3.5 py-2 rounded-xl text-xs font-medium disabled:opacity-40 flex items-center justify-center gap-1.5 min-h-[36px]"
                      >
                        {copySuccess ? (
                          <Check aria-hidden="true" className="w-3.5 h-3.5 text-emerald-700 stroke-[2.25]" />
                        ) : (
                          <Copy aria-hidden="true" className="w-3.5 h-3.5 stroke-[1.75]" />
                        )}
                        <span>{copySuccess ? 'Copied' : 'Copy answer'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {isDeliverableLinkType && (
                <div className="space-y-2.5 pt-2">
                  <label htmlFor={urlFieldId} className="text-xs font-medium text-[#52525B] block">
                    Deliverable URL (Figma, Loom, YouTube, GitHub, Google Drive)
                  </label>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                    <div className="relative flex-1">
                      <LinkIcon aria-hidden="true" className="absolute start-3.5 top-3 w-4 h-4 text-[#63636B] stroke-[1.75] pointer-events-none" />
                      <input
                        id={urlFieldId}
                        type="url"
                        inputMode="url"
                        autoCapitalize="none"
                        autoCorrect="off"
                        spellCheck={false}
                        enterKeyHint="done"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        onBlur={handleUrlBlur}
                        placeholder="https://..."
                        className="field-surface w-full rounded-xl ps-10 pe-3.5 py-2 text-base sm:text-sm font-mono"
                      />
                    </div>

                    {url && (
                      <a
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-tactile-secondary px-4 py-2 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 whitespace-nowrap min-h-[38px]"
                      >
                        <span>Test link</span>
                        <ExternalLink aria-hidden="true" className="w-3.5 h-3.5 stroke-[1.75]" />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
