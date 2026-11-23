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
  Presentation, 
  Luggage, 
  FolderArchive, 
  SlidersHorizontal, 
  FileText, 
  Code2 
} from 'lucide-react';
import { MOCK_OPPORTUNITIES } from '../data/mockOpportunities';
import { 
  WorkspaceStage, 
  ApplicationRequirement, 
  VaultCategory, 
  WorkspaceSectionId, 
  WorkspaceConfig 
} from '../types';
import { useWorkspaceStore } from '../store/useWorkspaceStore';
import { getCountdownParts, formatEventDate, generateReminderCheckpoints } from '../utils/dateUtils';
import { 
  ALL_SECTIONS_META, 
  generateAdaptiveWorkspaceConfig, 
  getOrderedVisibleSections 
} from '../utils/workspaceConfig';
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

  const opportunity = MOCK_OPPORTUNITIES.find((opp) => opp.id === workspaceId);
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

  // Phase 2 & 3 Modals
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
  const [activeTimerKey, setActiveTimerKey] = useState<'app_deadline' | 'event_start' | 'build_clock' | 'submission_cutoff' | 'pitch_slot'>('app_deadline');

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

  // Canonical tab resolution
  const requestedTab = searchParams.get('tab') || 'overview';
  let currentSectionId: WorkspaceSectionId = 'overview';
  if (requestedTab === 'checklist') currentSectionId = 'application';
  else if (requestedTab === 'pitch') currentSectionId = 'pitch_documents';
  else if (requestedTab === 'judges' || requestedTab === 'sponsors' || requestedTab === 'winners') currentSectionId = 'intel';
  else if (Object.keys(ALL_SECTIONS_META).includes(requestedTab)) currentSectionId = requestedTab as WorkspaceSectionId;

  // Fallback to first visible section if requested section is disabled
  if (!config.sections[currentSectionId]) {
    currentSectionId = visibleSections[0] || 'overview';
  }

  const getAutoCategory = (title: string): VaultCategory => {
    const t = title.toLowerCase();
    if (t.includes('bio') || t.includes('founder') || t.includes('background') || t.includes('team')) return 'bio';
    if (t.includes('problem') || t.includes('friction') || t.includes('why')) return 'problem_statement';
    if (t.includes('market') || t.includes('tam') || t.includes('volume') || t.includes('business')) return 'tam_model';
    if (t.includes('story') || t.includes('origin') || t.includes('personal')) return 'personal_story';
    if (t.includes('architecture') || t.includes('tech') || t.includes('stack') || t.includes('infrastructure')) return 'tech_architecture';
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

  if (!opportunity) {
    return (
      <div className="py-24 text-center space-y-4 bg-white">
        <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">Opportunity not found</h2>
        <p className="text-sm text-neutral-500">The workspace you requested does not exist.</p>
        <Link to="/saved" className="btn-tactile-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-xs font-semibold active:scale-[0.97]">
          Return to Saved Queue
        </Link>
      </div>
    );
  }

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
    <div className="space-y-8 sm:space-y-10 pb-20 bg-white">
      {/* Breadcrumb & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <Link
          to="/saved"
          className="inline-flex items-center gap-2 text-xs font-medium text-neutral-500 hover:text-neutral-900 transition-colors group"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1 stroke-[1.75]" />
          <span>Saved Queue</span>
          <span className="text-neutral-300">/</span>
          <span className="text-neutral-900 font-medium truncate max-w-[200px] sm:max-w-xs">{opportunity.title}</span>
        </Link>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <button
            onClick={() => setVaultModalOpen(true)}
            className="btn-tactile-secondary px-3.5 py-2 rounded-lg text-xs font-medium gap-1.5"
            title="Open Reusable Vault"
          >
            <FolderArchive className="w-3.5 h-3.5 text-neutral-500 stroke-[1.75]" />
            <span>Vault</span>
          </button>

          <button
            onClick={() => setCalendarModalOpen(true)}
            className="btn-tactile-secondary px-3.5 py-2 rounded-lg text-xs font-medium gap-1.5"
          >
            <Calendar className="w-3.5 h-3.5 text-neutral-500 stroke-[1.75]" />
            <span>Sync</span>
          </button>

          <a
            href={opportunity.externalPortalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-tactile-secondary px-3.5 py-2 rounded-lg text-xs font-medium gap-1.5"
          >
            <span>Portal</span>
            <ExternalLink className="w-3.5 h-3.5 text-neutral-400 stroke-[1.75]" />
          </a>
        </div>
      </div>

      {/* Workspace Header Block */}
      <div className="space-y-4 pb-1">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-neutral-500 font-medium flex-wrap">
              <span className="capitalize">{opportunity.format}</span>
              <span className="text-neutral-300">·</span>
              <span className="capitalize">{opportunity.type.replace('_', ' ')}</span>
              <span className="text-neutral-300">·</span>
              <span className="font-semibold text-neutral-900 font-mono tabular-nums">{opportunity.prizePool}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-semibold text-neutral-950 tracking-tight leading-snug" style={{ textWrap: 'balance' }}>
              {opportunity.title}
            </h1>
          </div>

          {/* Consolidated Clocks Control */}
          <div className="flex flex-col sm:items-end gap-2 flex-shrink-0">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#F5F5F5] text-xs font-mono tabular-nums">
              <Clock className="w-3.5 h-3.5 text-neutral-500 stroke-[1.75]" />
              <span className="font-semibold text-neutral-950">
                {activeTimerKey === 'app_deadline' && `${countdown.days}d ${countdown.hours}h ${countdown.minutes}m ${countdown.seconds}s`}
                {activeTimerKey === 'build_clock' && `${opportunity.buildClockHours || 48}h 00m 00s`}
                {activeTimerKey === 'event_start' && (opportunity.eventStart ? formatEventDate(opportunity.eventStart) : 'Nov 27, 2026')}
                {activeTimerKey === 'submission_cutoff' && (opportunity.submissionCutoff ? formatEventDate(opportunity.submissionCutoff) : 'Nov 29, 2026')}
                {activeTimerKey === 'pitch_slot' && (opportunity.pitchSlotTime || '3m 00s')}
              </span>
              <span className="text-neutral-400 font-sans text-[11px]">
                {activeTimerKey === 'app_deadline' ? 'left to apply' : activeTimerKey.replace('_', ' ')}
              </span>
            </div>

            {/* Inline Clock Selector Pills */}
            <div className="flex items-center gap-1 text-[11px]">
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
                    key={tKey}
                    onClick={() => setActiveTimerKey(tKey)}
                    className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors active:scale-[0.97] ${
                      isSelected ? 'bg-neutral-900 text-white font-semibold' : 'text-neutral-500 hover:text-neutral-900 hover:bg-[#F5F5F5]'
                    }`}
                  >
                    {labels[tKey]}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Stage Selector Pipeline */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
          <span className="text-xs font-medium text-neutral-400 mr-1 flex-shrink-0">Stage</span>
          <div className="flex items-center gap-1 bg-[#F5F5F5] p-1 rounded-xl flex-nowrap flex-shrink-0">
            {STAGES.map((st, idx) => {
              const isCurrent = effectiveWorkspace.stage === st;
              const isPastStage = STAGES.indexOf(effectiveWorkspace.stage) > idx;

              return (
                <button
                  key={st}
                  onClick={() => {
                    setWorkspaceStage(opportunity.id, st);
                    toast.success(`Moved to ${st.toUpperCase()}`);
                  }}
                  className={`relative px-3 py-1 rounded-lg text-xs font-medium capitalize transition-colors whitespace-nowrap active:scale-[0.97] ${
                    isCurrent
                      ? 'text-neutral-950 font-semibold bg-white'
                      : isPastStage
                      ? 'text-emerald-700'
                      : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  <span className="relative z-10 flex items-center gap-1.5">
                    {isPastStage && <Check className="w-3 h-3 text-emerald-600 stroke-[2.5]" />}
                    <span>{st}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Workspace Tabs Navigation (Adaptive & Configurable) */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-xl py-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar flex-1 min-w-0">
          {visibleSections.map((secId) => {
            const meta = ALL_SECTIONS_META[secId];
            const Icon = SECTION_ICONS[secId] || Layers;
            const isActive = currentSectionId === secId;

            return (
              <button
                key={secId}
                onClick={() => handleTabChange(secId)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap active:scale-[0.97] ${
                  isActive
                    ? 'bg-[#F5F5F5] text-neutral-950 font-semibold'
                    : 'text-neutral-500 hover:text-neutral-900 hover:bg-[#F5F5F5]/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 stroke-[1.75] ${isActive ? 'text-neutral-950' : 'text-neutral-400'}`} />
                <span>{meta.shortLabel}</span>

                {secId === 'application' && (
                  <span className="px-1.5 py-0.2 rounded-md text-[10px] font-mono font-semibold bg-[#EBEBEB] text-neutral-800 tabular-nums">
                    {completedTotal}/{totalItems}
                  </span>
                )}

                {secId === 'tasks_deadlines' && (effectiveWorkspace.tasks?.filter((t) => !t.completed).length ?? 0) > 0 && (
                  <span className="px-1.5 py-0.2 rounded-md text-[10px] font-mono font-semibold bg-neutral-200 text-neutral-800 tabular-nums">
                    {effectiveWorkspace.tasks?.filter((t) => !t.completed).length}
                  </span>
                )}

                {secId === 'results' && effectiveWorkspace.results?.outcome && effectiveWorkspace.results.outcome !== 'pending_review' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                )}
              </button>
            );
          })}
        </div>

        {/* Customize Navigation Button (PRD Rule 5) */}
        <button
          onClick={() => setCustomizeModalOpen(true)}
          className="btn-tactile-secondary px-3 py-2 rounded-lg text-xs font-medium gap-1.5 flex-shrink-0 text-neutral-600 hover:text-neutral-950"
          title="Customize workspace sections"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 stroke-[1.75]" />
          <span className="hidden sm:inline">Customize</span>
        </button>
      </div>

      {/* TAB CONTENT AREAS */}

      {/* 1. OVERVIEW TAB */}
      {currentSectionId === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            <div className="p-6 sm:p-8 rounded-2xl bg-[#FDFDFD] space-y-4">
              <h2 className="text-base sm:text-lg font-semibold text-neutral-900 tracking-tight">About the Opportunity</h2>
              <div className="text-sm text-neutral-600 leading-relaxed space-y-3 whitespace-pre-line max-w-prose" style={{ textWrap: 'pretty' }}>
                {opportunity.descriptionMarkdown}
              </div>
            </div>

            {/* Key Milestones Timeline */}
            <div className="p-6 sm:p-8 rounded-2xl bg-[#FDFDFD] space-y-5">
              <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                Event Milestones
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-[#F5F5F5] space-y-1">
                  <p className="text-[10px] uppercase font-semibold text-neutral-400 tracking-wider">Registration Opens</p>
                  <p className="text-sm font-semibold text-neutral-800 font-mono tabular-nums">
                    {formatEventDate(opportunity.registrationOpens)}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-[#F5F5F5] space-y-1">
                  <p className="text-[10px] uppercase font-semibold text-neutral-900 tracking-wider">Submission Deadline</p>
                  <p className="text-sm font-semibold text-neutral-950 font-mono tabular-nums">
                    {formatEventDate(opportunity.applicationDeadline)}
                  </p>
                </div>
                {opportunity.judgingStarts && (
                  <div className="p-4 rounded-xl bg-[#F5F5F5] space-y-1">
                    <p className="text-[10px] uppercase font-semibold text-neutral-400 tracking-wider">Judging Starts</p>
                    <p className="text-sm font-semibold text-neutral-800 font-mono tabular-nums">
                      {formatEventDate(opportunity.judgingStarts)}
                    </p>
                  </div>
                )}
                {opportunity.winnersAnnounced && (
                  <div className="p-4 rounded-xl bg-[#F5F5F5] space-y-1">
                    <p className="text-[10px] uppercase font-semibold text-neutral-400 tracking-wider">Winners Announced</p>
                    <p className="text-sm font-semibold text-neutral-950 font-mono tabular-nums">
                      {formatEventDate(opportunity.winnersAnnounced)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Reminders */}
          <div className="space-y-6 sm:space-y-8">
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
          {/* Progress Header */}
          <div className="p-6 sm:p-8 rounded-2xl bg-[#FDFDFD] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <h2 className="text-lg sm:text-xl font-bold text-neutral-900 tracking-tight">
                  Application Preparation Checklist
                </h2>
                <p className="text-xs sm:text-sm text-neutral-500" style={{ textWrap: 'pretty' }}>
                  Checking items saves your progress locally and moves workspace to <strong className="text-blue-600 font-semibold">Preparing</strong>.
                </p>
              </div>
              <div className="text-right">
                <span className="text-sm font-mono font-bold text-neutral-900 tabular-nums">
                  {completedMandatory} of {totalMandatory} mandatory ready
                </span>
                <p className="text-xs text-neutral-400 tabular-nums">({progressPercent}% overall)</p>
              </div>
            </div>

            <div className="w-full h-2.5 bg-neutral-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-neutral-900 rounded-full"
                initial={false}
                animate={{ width: `${progressPercent}%` }}
                transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
              />
            </div>
          </div>

          {/* Step Grouped Interactive Rows */}
          <div className="space-y-8">
            {Object.entries(stepGroups).map(([stepName, reqs]) => (
              <div key={stepName} className="space-y-3.5">
                <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider px-1 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-900" />
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
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. INTEL & RESEARCH TAB */}
      {currentSectionId === 'intel' && (
        <IntelSection
          opportunity={opportunity}
          highlightedJudgeId={highlightedJudgeId}
        />
      )}

      {/* 4. TASKS & DEADLINES TAB */}
      {currentSectionId === 'tasks_deadlines' && (
        <TasksDeadlinesSection
          opportunity={opportunity}
          onOpenCalendarSync={() => setCalendarModalOpen(true)}
        />
      )}

      {/* 5. NOTES & SCRATCHPAD TAB */}
      {currentSectionId === 'notes' && (
        <NotesSection opportunity={opportunity} />
      )}

      {/* 6. TEAMMATES & COLLABORATORS TAB */}
      {currentSectionId === 'team' && (
        <TeammateFinderBoard
          workspaceId={opportunity.id}
          opportunityTitle={opportunity.title}
        />
      )}

      {/* 7. IDEA SUGGESTIONS & R&D TAB */}
      {currentSectionId === 'ideas' && (
        <IdeaSuggestionsEngine
          opportunity={opportunity}
          workspaceId={opportunity.id}
        />
      )}

      {/* 8. BUILD & TECH STACK TAB */}
      {currentSectionId === 'build' && (
        <BuildSection opportunity={opportunity} />
      )}

      {/* 9. PITCH & DOCUMENTS TAB */}
      {currentSectionId === 'pitch_documents' && (
        <PitchDocumentsSection
          opportunity={opportunity}
          onLaunchCoach={() => setCoachModalOpen(true)}
        />
      )}

      {/* 10. IN-PERSON LOGISTICS TAB */}
      {currentSectionId === 'logistics' && (
        <InPersonLogistics
          workspaceId={opportunity.id}
          opportunityTitle={opportunity.title}
        />
      )}

      {/* 11. SHOWCASE & DEMOS TAB */}
      {currentSectionId === 'showcase' && (
        <ShowcaseSection opportunity={opportunity} />
      )}

      {/* 12. RESULTS & RETROSPECTIVE TAB */}
      {currentSectionId === 'results' && (
        <ResultsSection opportunity={opportunity} />
      )}

      {/* Calendar Modal */}
      <CalendarSyncModal
        isOpen={calendarModalOpen}
        onClose={() => setCalendarModalOpen(false)}
        opportunityTitle={opportunity.title}
        isGoogleSynced={effectiveWorkspace.googleCalendarSynced}
        onToggleGoogleSync={(synced) => toggleGoogleCalendar(opportunity.id, synced)}
      />

      {/* Customize Navigation Modal (PRD Rule 5) */}
      <CustomizeSectionsModal
        isOpen={customizeModalOpen}
        onClose={() => setCustomizeModalOpen(false)}
        opportunity={opportunity}
      />

      {/* Application Helper Modal (PRD §3.C Strict Limit) */}
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
            // Find first text prompt requirement to populate
            const firstPrompt = opportunity.requirements.find((r) => r.type === 'text_prompt');
            if (firstPrompt) {
              updateItemDraft(opportunity.id, firstPrompt.id, text);
            }
          }
        }}
      />

      {/* Presentation Coach Voice Modal (PRD §3.I Spotify-Lyrics) */}
      {coachModalOpen && (
        <PresentationCoach
          isOpen={coachModalOpen}
          onClose={() => setCoachModalOpen(false)}
          slideDeck={effectiveWorkspace.slideDeck || {
            id: `deck-${opportunity.id}`,
            title: `${opportunity.title} — Pitch Deck`,
            targetTimeMinutes: 3,
            targetAudience: 'judges',
            slides: [
              {
                id: 's1',
                slideNumber: 1,
                title: opportunity.title,
                subtitle: opportunity.summary,
                layoutType: 'title',
                bullets: ['Target Bounty Track: ' + (opportunity.sponsors[0]?.bountyTitle || 'Fintech'), 'Format: ' + opportunity.format],
                scriptLines: [
                  'Good afternoon judges and builders.',
                  'We are presenting our solution for ' + opportunity.title + '.',
                  'Let us walk you through the core technical architecture and market impact.',
                ],
                allocatedSeconds: 25,
              },
              {
                id: 's2',
                slideNumber: 2,
                title: 'Problem & User Bottleneck',
                subtitle: 'Quantified market friction observed in the field',
                layoutType: 'problem_solution',
                bullets: opportunity.themeContext.problemStatements.slice(0, 3),
                scriptLines: [
                  'Here is the verified bottleneck we are tackling.',
                  'Current market players lose excessive revenue due to manual reconciliation and delayed clearing.',
                  'Our interviews showed over eighty percent of users struggle with these exact friction points.',
                ],
                allocatedSeconds: 35,
              },
              {
                id: 's3',
                slideNumber: 3,
                title: 'Technical Implementation & Solution',
                subtitle: 'Decoupled event-driven microservices architecture',
                layoutType: 'architecture',
                bullets: ['High-throughput execution engine', 'Sub-second state verification', 'Resilient retry queues', 'Audit trail'],
                scriptLines: [
                  'To solve this without adding operational complexity, we built an event-driven engine.',
                  'Transactions execute with cryptographic proof verification in sub-second latency.',
                  'The user experience remains seamless with zero onboarding friction.',
                ],
                allocatedSeconds: 45,
              },
              {
                id: 's4',
                slideNumber: 4,
                title: 'Market Opportunity & Unit Economics',
                subtitle: opportunity.prizePool + ' addressable ecosystem volume',
                layoutType: 'market_tam',
                bullets: ['Direct B2B merchant volume', 'Low customer acquisition cost', 'Sustainable monetization model'],
                scriptLines: [
                  'The market size here is massive and growing exponentially.',
                  'Our unit economics allow us to offer transparent pricing that is seventy percent cheaper than legacy alternatives.',
                ],
                allocatedSeconds: 35,
              },
              {
                id: 's5',
                slideNumber: 5,
                title: 'Demo & Product Flow',
                subtitle: 'Live functional demonstration on testnet',
                layoutType: 'demo_flow',
                bullets: ['1. Fast checkout creation', '2. Dynamic invoice generation', '3. Sub-second clearing', '4. Verified receipt'],
                scriptLines: [
                  'Let us now review the live demo flow.',
                  'Everything you see is running live on our deployed testnet sandbox.',
                  'Within six seconds, the entire transaction lifecycle is confirmed.',
                ],
                allocatedSeconds: 40,
              },
              {
                id: 's6',
                slideNumber: 6,
                title: 'Team & Roadmap',
                subtitle: 'Execution capability and next-quarter milestones',
                layoutType: 'team_roadmap',
                bullets: ['Multi-disciplinary team with proven track record', 'Pilot commitments signed', 'Post-hackathon deployment timeline'],
                scriptLines: [
                  'Our team has previously shipped production systems handling millions in volume.',
                  'We are ready to deploy into our commercial pilot next month. Thank you!',
                ],
                allocatedSeconds: 20,
              },
            ],
          }}
          opportunityTitle={opportunity.title}
        />
      )}
    </div>
  );
};

// SUBCOMPONENT: Interactive Checklist Item Row with Choreographed Accordion & Word Counter
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

  // Auto-detect a matching snippet from the vault when draft is empty
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

  let wordCountColor = 'text-neutral-400';
  let isOverLimit = false;

  if (words > 0) {
    if (words > maxWords) {
      wordCountColor = 'text-rose-600 font-bold';
      isOverLimit = true;
    } else if (wordRatio >= 0.9) {
      wordCountColor = 'text-amber-700 font-semibold';
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
      toast.success('Deliverable link updated');
    }
  };

  const handleCopy = () => {
    if (!draft) return;
    navigator.clipboard.writeText(draft);
    setCopySuccess(true);
    toast.success('Answer copied to clipboard');
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const isDeliverableLinkType = 
    requirement.type === 'pitch_deck' || 
    requirement.type === 'demo_video' || 
    requirement.type === 'repo_link' || 
    requirement.type === 'live_url';

  return (
    <div
      className={`rounded-2xl transition-colors ${
        itemState.completed
          ? 'bg-[#FDFDFD] opacity-75'
          : 'bg-[#FDFDFD] hover:bg-[#F8F8FA]'
      }`}
    >
      {/* Row Header */}
      <div className="p-5 sm:p-6 flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 flex-1 min-w-0">
          {/* Tactile Checkbox */}
          <button
            onClick={onToggle}
            className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center transition-all duration-150 active:scale-[0.97] flex-shrink-0 cursor-pointer ${
              itemState.completed
                ? 'bg-neutral-900 text-white'
                : 'bg-[#F5F5F5] hover:bg-[#EBEBEB]'
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
          </button>

          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h4
                onClick={onToggle}
                className={`text-sm font-semibold cursor-pointer transition-colors ${
                  itemState.completed ? 'line-through text-neutral-400' : 'text-neutral-950 hover:text-neutral-600'
                }`}
                style={{ textWrap: 'balance' }}
              >
                {requirement.title}
              </h4>

              <span
                className={`text-[10px] font-semibold uppercase tracking-wider ${
                  requirement.mandatory
                    ? 'text-neutral-900'
                    : 'text-neutral-400'
                }`}
              >
                {requirement.mandatory ? 'Required' : 'Optional'}
              </span>

              {requirement.maxWords && (
                <span className="text-[10px] font-mono text-neutral-400 tabular-nums">
                  (Max {requirement.maxWords} words)
                </span>
              )}

              {requirement.acceptedFormats && (
                <span className="text-[10px] font-mono text-neutral-400">
                  ({requirement.acceptedFormats})
                </span>
              )}
            </div>

            {requirement.description && (
              <p className="text-xs text-neutral-500 leading-relaxed max-w-xl" style={{ textWrap: 'pretty' }}>
                {requirement.description}
              </p>
            )}

            {!isExpanded && (
              <div className="pt-1 flex items-center gap-3 text-xs">
                {requirement.type === 'text_prompt' && draft && (
                  <span className="text-neutral-400 font-mono text-[11px] tabular-nums">
                    Draft: {words} words
                  </span>
                )}
                {isDeliverableLinkType && url && (
                  <a
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-neutral-600 hover:text-neutral-950 hover:underline inline-flex items-center gap-1 text-[11px] truncate max-w-[200px]"
                  >
                    <span className="truncate">{url.replace(/^https?:\/\//, '')}</span>
                    <ExternalLink className="w-3 h-3 flex-shrink-0 stroke-[1.75]" />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          aria-label={isExpanded ? 'Collapse row' : 'Expand row'}
          className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-[#F5F5F5] transition-colors flex-shrink-0 cursor-pointer active:scale-[0.97]"
        >
          {isExpanded ? <ChevronUp className="w-4 h-4 stroke-[1.75]" /> : <ChevronDown className="w-4 h-4 stroke-[1.75]" />}
        </button>
      </div>

      {/* Accordion Expansion */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: 'spring', duration: 0.3, bounce: 0 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 pt-1 space-y-4">
              {/* TEXT PROMPT EDITOR */}
              {requirement.type === 'text_prompt' && (
                <div className="space-y-2.5 pt-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-neutral-600 font-medium">Draft Answer</span>
                      {onOpenHelper && (
                        <button
                          type="button"
                          onClick={onOpenHelper}
                          className="bg-[#F5F5F5] hover:bg-[#EBEBEB] px-2.5 py-1 rounded-md text-[11px] font-semibold text-neutral-800 flex items-center gap-1 active:scale-[0.97] transition-colors"
                          title="Open Application Helper with strict word limit guidance"
                        >
                          <Sparkles className="w-3 h-3 text-amber-600 stroke-[2]" />
                          <span>Helper (&le; {maxWords}w)</span>
                        </button>
                      )}
                      {onOpenVault && (
                        <button
                          type="button"
                          onClick={onOpenVault}
                          className="btn-tactile-secondary px-2.5 py-1 rounded-md text-[11px] font-medium text-neutral-600 hover:text-neutral-900 flex items-center gap-1"
                          title="Insert snippet from Reusable Vault"
                        >
                          <FolderArchive className="w-3 h-3 stroke-[1.75]" />
                          <span>Vault</span>
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      {savedStatus && (
                        <span className="text-[11px] text-neutral-400 italic">
                          {savedStatus}
                        </span>
                      )}
                      <span className={`font-mono text-xs tabular-nums ${wordCountColor}`}>
                        {words} / {maxWords} words
                        {isOverLimit && ` — ${words - maxWords} words over limit`}
                      </span>
                    </div>
                  </div>

                  {/* Matching Vault Snippet Instant Suggestion */}
                  {suggestedVaultItem && (
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50/70 text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <Sparkles className="w-3.5 h-3.5 text-amber-700 flex-shrink-0 stroke-[2]" />
                        <span className="text-amber-900 truncate">
                          Matching snippet: <strong className="font-semibold">{suggestedVaultItem.title}</strong> ({suggestedVaultItem.wordCount}w)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setDraft(suggestedVaultItem.content);
                          onSaveDraft(suggestedVaultItem.content);
                          toast.success(`Inserted "${suggestedVaultItem.title}" into draft`);
                        }}
                        className="btn-tactile-secondary px-2.5 py-1 rounded-lg text-[11px] font-semibold text-neutral-900 flex-shrink-0 ml-2"
                      >
                        Insert
                      </button>
                    </div>
                  )}

                  <textarea
                    value={draft}
                    onChange={handleDraftChange}
                    placeholder="Draft your answer here... Changes auto-save every 800ms."
                    rows={4}
                    className="w-full bg-[#F5F5F5] rounded-xl p-3.5 text-base sm:text-sm text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900/10 transition-colors leading-relaxed border-0"
                  />

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                    <p className="text-[11px] text-neutral-400 leading-relaxed" style={{ textWrap: 'pretty' }}>
                      {isOverLimit
                        ? 'Over-limit text is preserved so you can edit down cleanly before submission.'
                        : 'Auto-saved locally. Copy directly into portal when ready.'}
                    </p>

                    <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
                      {onSaveToVault && draft.trim().length > 10 && (
                        <button
                          type="button"
                          onClick={() => onSaveToVault(draft.trim())}
                          className="btn-tactile-secondary px-3 py-1.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 text-neutral-700"
                          title="Save this answer to your Reusable Vault"
                        >
                          <FolderArchive className="w-3.5 h-3.5 stroke-[1.75]" />
                          <span>Save to Vault</span>
                        </button>
                      )}

                      <button
                        onClick={handleCopy}
                        disabled={!draft}
                        className="btn-tactile-secondary px-3.5 py-1.5 rounded-lg text-xs font-medium disabled:opacity-40 flex items-center justify-center gap-1.5 w-full sm:w-auto text-neutral-800"
                      >
                        {copySuccess ? <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" /> : <Copy className="w-3.5 h-3.5 text-neutral-400 stroke-[1.75]" />}
                        <span>{copySuccess ? 'Copied' : 'Copy Answer'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* DELIVERABLE URL INPUT */}
              {isDeliverableLinkType && (
                <div className="space-y-2.5 pt-2">
                  <label className="text-xs font-medium text-neutral-600">
                    Deliverable URL (Figma, Loom, YouTube, GitHub, Google Drive)
                  </label>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                    <div className="relative flex-1">
                      <LinkIcon className="absolute left-3.5 top-3 w-4 h-4 text-neutral-400 stroke-[1.75]" />
                      <input
                        type="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        onBlur={handleUrlBlur}
                        placeholder="https://..."
                        className="w-full bg-[#F5F5F5] rounded-lg pl-10 pr-3.5 py-2 text-base sm:text-sm text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900/10 transition-colors font-mono border-0"
                      />
                    </div>

                    {url && (
                      <a
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-[#F5F5F5] hover:bg-[#EBEBEB] px-3.5 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 whitespace-nowrap w-full sm:w-auto text-center active:scale-[0.97] text-neutral-800"
                      >
                        <span>Test Link</span>
                        <ExternalLink className="w-3.5 h-3.5 text-neutral-400 stroke-[1.75]" />
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
