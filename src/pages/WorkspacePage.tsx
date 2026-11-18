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
  HeartHandshake, 
  Trophy, 
  Lightbulb, 
  Copy, 
  Check, 
  Link as LinkIcon, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  Linkedin, 
  Twitter, 
  Github,
  Presentation,
  Luggage,
  FolderArchive
} from 'lucide-react';
import { MOCK_OPPORTUNITIES } from '../data/mockOpportunities';
import { WorkspaceStage, ApplicationRequirement } from '../types';
import { useWorkspaceStore } from '../store/useWorkspaceStore';
import { getCountdownParts, formatEventDate, generateReminderCheckpoints } from '../utils/dateUtils';
import { CalendarSyncModal } from '../components/calendar/CalendarSyncModal';
import { ReminderTimeline } from '../components/workspace/ReminderTimeline';
import { ApplicationHelperModal } from '../components/workspace/ApplicationHelperModal';
import { ReusableVaultModal } from '../components/vault/ReusableVaultModal';
import { IdeaSuggestionsEngine } from '../components/workspace/IdeaSuggestionsEngine';
import { SlideDeckGenerator } from '../components/pitch/SlideDeckGenerator';
import { PresentationCoach } from '../components/pitch/PresentationCoach';
import { TeammateFinderBoard } from '../components/workspace/TeammateFinderBoard';
import { InPersonLogistics } from '../components/workspace/InPersonLogistics';
import { toast } from 'sonner';

const TABS = [
  { id: 'overview', label: 'Overview', icon: Layers },
  { id: 'checklist', label: 'Application Checklist', icon: CheckSquare },
  { id: 'ideas', label: 'Idea Suggestions (R&D)', icon: Lightbulb },
  { id: 'pitch', label: 'Pitch Deck & Coach', icon: Presentation },
  { id: 'team', label: 'Teammates', icon: Users },
  { id: 'logistics', label: 'Logistics & Packing', icon: Luggage },
  { id: 'judges', label: "Judges' Intelligence", icon: Users },
  { id: 'sponsors', label: 'Sponsors & Overlap', icon: HeartHandshake },
  { id: 'winners', label: 'Past Winners', icon: Trophy },
];

const STAGES: WorkspaceStage[] = ['saved', 'preparing', 'applied', 'building', 'pitching', 'results'];

export const WorkspacePage: React.FC = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTab = searchParams.get('tab') || 'overview';

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
  const [winnerEditionFilter, setWinnerEditionFilter] = useState('all');
  const [highlightedJudgeId, setHighlightedJudgeId] = useState<string | null>(null);

  // Phase 2 & 3 Modals
  const [helperModalOpen, setHelperModalOpen] = useState(false);
  const [activeHelperReq, setActiveHelperReq] = useState<ApplicationRequirement | null>(null);
  const [vaultModalOpen, setVaultModalOpen] = useState(false);
  const [coachModalOpen, setCoachModalOpen] = useState(false);
  const [activeTimerKey, setActiveTimerKey] = useState<'app_deadline' | 'event_start' | 'build_clock' | 'submission_cutoff' | 'pitch_slot'>('app_deadline');

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

  const handleJumpToJudge = (judgeId: string) => {
    setSearchParams({ tab: 'judges' });
    setHighlightedJudgeId(judgeId);
    setTimeout(() => {
      const el = document.getElementById(`judge-${judgeId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 150);
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
            className="px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 active:scale-[0.97] bg-[#F5F5F5] hover:bg-[#EBEBEB] text-neutral-800 transition-colors"
            title="Open Reusable Application Vault"
          >
            <FolderArchive className="w-3.5 h-3.5 text-neutral-500 stroke-[1.75]" />
            <span>Vault</span>
          </button>

          <button
            onClick={() => setCalendarModalOpen(true)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 active:scale-[0.97] bg-[#F5F5F5] hover:bg-[#EBEBEB] text-neutral-800 transition-colors"
          >
            <Calendar className="w-3.5 h-3.5 text-neutral-500 stroke-[1.75]" />
            <span>Sync</span>
          </button>

          <a
            href={opportunity.externalPortalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium active:scale-[0.97] bg-[#F5F5F5] hover:bg-[#EBEBEB] text-neutral-800 transition-colors"
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

      {/* Workspace Tabs Navigation */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-xl py-2">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap active:scale-[0.97] ${
                  isActive
                    ? 'bg-[#F5F5F5] text-neutral-950 font-semibold'
                    : 'text-neutral-500 hover:text-neutral-900 hover:bg-[#F5F5F5]/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 stroke-[1.75] ${isActive ? 'text-neutral-950' : 'text-neutral-400'}`} />
                <span>{tab.label}</span>
                {tab.id === 'checklist' && (
                  <span className="px-1.5 py-0.2 rounded-md text-[10px] font-mono font-semibold bg-[#EBEBEB] text-neutral-800 tabular-nums">
                    {completedTotal}/{totalItems}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB CONTENT AREAS */}

      {/* 1. OVERVIEW TAB */}
      {activeTab === 'overview' && (
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
      {activeTab === 'checklist' && (
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
                      onOpenVault={() => setVaultModalOpen(true)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. JUDGES' INTELLIGENCE TAB */}
      {activeTab === 'judges' && (
        <div className="space-y-6 sm:space-y-8">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
              Judges' Intelligence & Backgrounds
            </h2>
            <p className="text-sm text-neutral-500" style={{ textWrap: 'pretty' }}>
              Analyze judge domain areas and discover affiliations with event sponsors.
            </p>
          </div>

          {opportunity.judges.length === 0 ? (
            <div className="p-16 rounded-2xl bg-[#FDFDFD] text-center space-y-3">
              <Users className="w-8 h-8 text-neutral-400 mx-auto stroke-[1.75]" />
              <h3 className="text-sm font-semibold text-neutral-700">Judges haven't been announced yet</h3>
              <p className="text-xs text-neutral-400 max-w-sm mx-auto" style={{ textWrap: 'pretty' }}>
                Profiles and domain specializations will appear here once announced by organizers.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {opportunity.judges.map((judge) => {
                const isTargetHighlighted = highlightedJudgeId === judge.id;
                const matchedSponsor = opportunity.sponsors.find(
                  (s) => s.id === judge.sponsorId || s.judgeRepresentativeId === judge.id
                );

                return (
                  <motion.div
                    key={judge.id}
                    id={`judge-${judge.id}`}
                    animate={{
                      scale: isTargetHighlighted ? 1.02 : 1,
                    }}
                    transition={{ type: 'spring', duration: 0.4 }}
                    className={`p-6 rounded-2xl transition-colors space-y-4 ${
                      isTargetHighlighted
                        ? 'bg-[#edf3ff] ring-1 ring-blue-500/30'
                        : 'bg-[#FDFDFD] hover:bg-[#f7f7f9]'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <img
                        src={judge.avatarUrl}
                        alt={judge.name}
                        className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                      />
                      <div className="space-y-0.5">
                        <h3 className="text-sm font-bold text-neutral-900">
                          {judge.name}
                        </h3>
                        <p className="text-xs text-blue-600 font-medium">
                          {judge.role}
                        </p>
                        <p className="text-[11px] text-neutral-400">
                          {judge.company}
                        </p>
                      </div>
                    </div>

                    {matchedSponsor && (
                      <div className="px-3 py-1.5 rounded-lg bg-white text-amber-800 text-[11px] font-medium flex items-center gap-2">
                        <Sparkles className="w-3 h-3 text-amber-600 stroke-[1.75]" />
                        <span>Sponsor Panelist: <strong>{matchedSponsor.name}</strong></span>
                      </div>
                    )}

                    <p className="text-xs text-neutral-600 leading-relaxed" style={{ textWrap: 'pretty' }}>
                      {judge.bio}
                    </p>

                    <div className="space-y-2 pt-2">
                      <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
                        Notable Products:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {judge.notableProducts.map((p) => (
                          <span
                            key={p}
                            className="px-2.5 py-0.5 rounded-md text-[10px] bg-white text-neutral-700 font-mono"
                          >
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      {judge.socials.linkedin && (
                        <a
                          href={judge.socials.linkedin}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 rounded-lg bg-white text-neutral-600 hover:text-neutral-900 transition-colors active:scale-[0.97]"
                        >
                          <Linkedin className="w-3.5 h-3.5 stroke-[1.75]" />
                        </a>
                      )}
                      {judge.socials.twitter && (
                        <a
                          href={judge.socials.twitter}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 rounded-lg bg-white text-neutral-600 hover:text-neutral-900 transition-colors active:scale-[0.97]"
                        >
                          <Twitter className="w-3.5 h-3.5 stroke-[1.75]" />
                        </a>
                      )}
                      {judge.socials.github && (
                        <a
                          href={judge.socials.github}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 rounded-lg bg-white text-neutral-600 hover:text-neutral-900 transition-colors active:scale-[0.97]"
                        >
                          <Github className="w-3.5 h-3.5 stroke-[1.75]" />
                        </a>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 4. SPONSORS & OVERLAP TAB */}
      {activeTab === 'sponsors' && (
        <div className="space-y-6 sm:space-y-8">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
              Sponsors, Bounties & Judging Panel Overlap
            </h2>
            <p className="text-sm text-neutral-500" style={{ textWrap: 'pretty' }}>
              Identify sponsors whose team members sit on the judging panel to align submission deliverables.
            </p>
          </div>

          {opportunity.sponsors.length === 0 ? (
            <div className="p-16 rounded-2xl bg-[#FDFDFD] text-center space-y-3">
              <HeartHandshake className="w-8 h-8 text-neutral-400 mx-auto stroke-[1.75]" />
              <h3 className="text-sm font-semibold text-neutral-700">No partner bounties announced yet</h3>
              <p className="text-xs text-neutral-400 max-w-sm mx-auto" style={{ textWrap: 'pretty' }}>
                Sponsor tracks and API bounties will be updated once released by organizers.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
              {opportunity.sponsors.map((sponsor) => {
                const repJudge = opportunity.judges.find(
                  (j) => j.id === sponsor.judgeRepresentativeId || j.sponsorId === sponsor.id
                );

                return (
                  <div
                    key={sponsor.id}
                    className="p-6 sm:p-8 rounded-2xl bg-[#FDFDFD] hover:bg-[#f7f7f9] transition-colors space-y-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2.5">
                          <h3 className="text-base font-bold text-neutral-900">
                            {sponsor.name}
                          </h3>
                          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider bg-white text-neutral-700">
                            {sponsor.tier}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-emerald-700 mt-1 tabular-nums">
                          Prize Track: {sponsor.prizePool}
                        </p>
                      </div>

                      {repJudge && (
                        <button
                          onClick={() => handleJumpToJudge(repJudge.id)}
                          className="px-3 py-1.5 rounded-xl bg-white text-amber-800 hover:bg-neutral-50 transition-[transform,background-color] duration-150 text-xs font-semibold flex items-center gap-1.5 active:scale-[0.97]"
                        >
                          <Sparkles className="w-3 h-3 text-amber-600 stroke-[1.75]" />
                          <span>Panelist: {repJudge.name} →</span>
                        </button>
                      )}
                    </div>

                    <div className="space-y-1.5 pt-2">
                      <h4 className="text-xs font-semibold text-neutral-900">
                        {sponsor.bountyTitle}
                      </h4>
                      <p className="text-xs text-neutral-500 leading-relaxed" style={{ textWrap: 'pretty' }}>
                        {sponsor.bountyDescription}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 5. PAST WINNERS TAB */}
      {activeTab === 'winners' && (
        <div className="space-y-6 sm:space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
                Past Winners Archive
              </h2>
              <p className="text-sm text-neutral-500" style={{ textWrap: 'pretty' }}>
                Winning pitch decks, repositories, and problem statements from prior editions.
              </p>
            </div>

            {opportunity.pastWinners.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-400 font-medium">Edition:</span>
                <div className="flex items-center gap-1 bg-[#FDFDFD] p-1 rounded-2xl">
                  {['all', '2025', '2024'].map((ed) => (
                    <button
                      key={ed}
                      onClick={() => setWinnerEditionFilter(ed)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition-colors active:scale-[0.97] ${
                        winnerEditionFilter === ed
                          ? 'bg-white text-neutral-900 font-semibold'
                          : 'text-neutral-600 hover:text-neutral-900'
                      }`}
                    >
                      {ed === 'all' ? 'All Editions' : ed}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {opportunity.pastWinners.length === 0 ? (
            <div className="p-16 rounded-2xl bg-[#FDFDFD] text-center space-y-3">
              <Trophy className="w-8 h-8 text-neutral-400 mx-auto stroke-[1.75]" />
              <h3 className="text-sm font-semibold text-neutral-700">First edition — no past winners yet</h3>
              <p className="text-xs text-neutral-400 max-w-sm mx-auto" style={{ textWrap: 'pretty' }}>
                Inaugural cohort for this opportunity. Winning projects will be archived here after demo day.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {opportunity.pastWinners
                .filter((w) => winnerEditionFilter === 'all' || w.edition === winnerEditionFilter)
                .map((winner) => (
                  <div
                    key={winner.id}
                    className="p-6 rounded-2xl bg-[#FDFDFD] hover:bg-[#f7f7f9] transition-colors space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-blue-700 font-mono tabular-nums">
                          {winner.edition} Cohort
                        </span>
                        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-semibold bg-white text-emerald-700 tabular-nums">
                          {winner.prizeWon}
                        </span>
                      </div>

                      <h3 className="text-sm sm:text-base font-bold text-neutral-900">
                        {winner.projectName}
                      </h3>
                      <p className="text-xs text-neutral-400">
                        Team: {winner.teamName}
                      </p>

                      <p className="text-xs text-neutral-600 leading-relaxed pt-2" style={{ textWrap: 'pretty' }}>
                        {winner.problemSolved}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 pt-3 text-xs">
                      {winner.deckUrl && (
                        <a
                          href={winner.deckUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="bg-white hover:bg-neutral-50 px-3 py-1.5 rounded-xl text-blue-600 flex items-center gap-1.5 font-medium active:scale-[0.97]"
                        >
                          <span>Pitch Deck</span>
                          <ExternalLink className="w-3 h-3 stroke-[1.75]" />
                        </a>
                      )}
                      {winner.demoUrl && (
                        <a
                          href={winner.demoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="bg-white hover:bg-neutral-50 px-3 py-1.5 rounded-xl text-rose-600 flex items-center gap-1.5 font-medium active:scale-[0.97]"
                        >
                          <span>Demo Video</span>
                          <ExternalLink className="w-3 h-3 stroke-[1.75]" />
                        </a>
                      )}
                      {winner.repoUrl && (
                        <a
                          href={winner.repoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="bg-white hover:bg-neutral-50 px-3 py-1.5 rounded-xl text-neutral-700 flex items-center gap-1.5 active:scale-[0.97]"
                        >
                          <span>GitHub</span>
                          <ExternalLink className="w-3 h-3 stroke-[1.75]" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* 3. IDEA SUGGESTIONS & R&D (PRD §3.E) */}
      {activeTab === 'ideas' && (
        <IdeaSuggestionsEngine
          opportunity={opportunity}
          workspaceId={opportunity.id}
        />
      )}

      {/* 4. PITCH DECK & PRESENTATION COACH (PRD §3.F & §3.I) */}
      {activeTab === 'pitch' && (
        <SlideDeckGenerator
          workspaceId={opportunity.id}
          opportunityTitle={opportunity.title}
          onLaunchCoach={() => setCoachModalOpen(true)}
        />
      )}

      {/* 5. TEAMMATES & GAP MATCHING (PRD §3.L) */}
      {activeTab === 'team' && (
        <TeammateFinderBoard
          workspaceId={opportunity.id}
          opportunityTitle={opportunity.title}
        />
      )}

      {/* 6. LOGISTICS & IN-PERSON PACKING PLANNER (PRD §3.K) */}
      {activeTab === 'logistics' && (
        <InPersonLogistics
          workspaceId={opportunity.id}
          opportunityTitle={opportunity.title}
        />
      )}

      {/* Calendar Modal */}
      <CalendarSyncModal
        isOpen={calendarModalOpen}
        onClose={() => setCalendarModalOpen(false)}
        opportunityTitle={opportunity.title}
        isGoogleSynced={effectiveWorkspace.googleCalendarSynced}
        onToggleGoogleSync={(synced) => toggleGoogleCalendar(opportunity.id, synced)}
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
            setHelperModalOpen(false);
            setVaultModalOpen(true);
          }}
        />
      )}

      {/* Reusable Application Vault Modal (PRD §3.K) */}
      <ReusableVaultModal
        isOpen={vaultModalOpen}
        onClose={() => setVaultModalOpen(false)}
        onInsertSnippet={(text) => {
          if (activeHelperReq) {
            updateItemDraft(opportunity.id, activeHelperReq.id, text);
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
}

const InteractiveChecklistRow: React.FC<InteractiveChecklistRowProps> = ({
  requirement,
  itemState = { completed: false },
  onToggle,
  onSaveDraft,
  onSaveUrl,
  onOpenHelper,
  onOpenVault,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [draft, setDraft] = useState(itemState.draftText || '');
  const [url, setUrl] = useState(itemState.deliverableUrl || '');
  const [savedStatus, setSavedStatus] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

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
                          className="bg-[#F5F5F5] hover:bg-[#EBEBEB] px-2.5 py-1 rounded-md text-[11px] font-medium text-neutral-600 hover:text-neutral-900 flex items-center gap-1 active:scale-[0.97] transition-colors"
                          title="Import snippet from Reusable Vault"
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

                    <button
                      onClick={handleCopy}
                      disabled={!draft}
                      className="bg-[#F5F5F5] hover:bg-[#EBEBEB] px-3.5 py-1.5 rounded-lg text-xs font-medium disabled:opacity-40 flex items-center justify-center gap-1.5 w-full sm:w-auto active:scale-[0.97] text-neutral-800"
                    >
                      {copySuccess ? <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" /> : <Copy className="w-3.5 h-3.5 text-neutral-400 stroke-[1.75]" />}
                      <span>{copySuccess ? 'Copied' : 'Copy Answer'}</span>
                    </button>
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
