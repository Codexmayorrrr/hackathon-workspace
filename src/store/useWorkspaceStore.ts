import { useMemo } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  WorkspaceRecord, 
  WorkspaceStage, 
  VaultItem, 
  SlideDeck, 
  TeammateProfile,
  WorkspaceSectionId,
  WorkspaceTask,
  WorkspaceResult,
  PlatformRole,
  BannerThemeId,
  Opportunity,
  OrganizerSubmission,
  SubmissionReviewStatus,
} from '../types';
import { MOCK_OPPORTUNITIES, MOCK_ORGANIZER_SUBMISSIONS } from '../data/mockOpportunities';
import { generateAdaptiveWorkspaceConfig } from '../utils/workspaceConfig';

const mergeOpportunitiesList = (
  customOpportunities: Opportunity[] = [],
  overrides: Record<string, { bannerUrl?: string; bannerTheme?: BannerThemeId }> = {}
): Opportunity[] => {
  const combined = [...customOpportunities, ...MOCK_OPPORTUNITIES];
  return combined.map((opp) => {
    const override = overrides[opp.id];
    if (!override) return opp;
    return {
      ...opp,
      bannerUrl: override.bannerUrl !== undefined ? override.bannerUrl : opp.bannerUrl,
      bannerTheme: override.bannerTheme !== undefined ? override.bannerTheme : opp.bannerTheme,
    };
  });
};

interface WorkspaceStore {
  activeRole: PlatformRole;
  savedWorkspaces: Record<string, WorkspaceRecord>;
  selectedInterests: string[];
  vaultItems: VaultItem[];
  customOpportunities: Opportunity[];
  opportunityBannerOverrides: Record<string, { bannerUrl?: string; bannerTheme?: BannerThemeId }>;
  organizerSubmissions: OrganizerSubmission[];
  
  // Dual-Role & Organizer Actions
  setRole: (role: PlatformRole) => void;
  publishOpportunity: (
    opp: Omit<Opportunity, 'id' | 'slug' | 'judges' | 'sponsors' | 'pastWinners'> & {
      id?: string;
      slug?: string;
    }
  ) => Opportunity;
  updateOpportunityBanner: (
    opportunityId: string,
    banner: { bannerUrl?: string; bannerTheme?: BannerThemeId }
  ) => void;
  deleteCustomOpportunity: (opportunityId: string) => void;
  restoreCustomOpportunity: (opp: Opportunity) => void;
  updateSubmissionStatus: (
    submissionId: string,
    status: SubmissionReviewStatus,
    evaluatorNotes?: string
  ) => void;
  
  // Workspace Actions
  isSaved: (opportunityId: string) => boolean;
  getWorkspace: (opportunityId: string) => WorkspaceRecord | undefined;
  saveOpportunity: (opportunityId: string) => void;
  unsaveOpportunity: (opportunityId: string) => void;
  setWorkspaceStage: (workspaceId: string, stage: WorkspaceStage) => void;
  
  // Adaptive Navigation Actions (PRD §6 & §7)
  toggleWorkspaceSection: (workspaceId: string, sectionId: WorkspaceSectionId) => void;
  resetWorkspaceSections: (workspaceId: string) => void;

  // Tasks & Deadlines Actions (PRD §3 Core)
  addWorkspaceTask: (workspaceId: string, task: Omit<WorkspaceTask, 'id' | 'createdAt'>) => void;
  toggleWorkspaceTask: (workspaceId: string, taskId: string) => void;
  deleteWorkspaceTask: (workspaceId: string, taskId: string) => void;
  restoreWorkspaceTask: (workspaceId: string, task: WorkspaceTask) => void;

  // Checklist & Draft Actions
  toggleItemCompleted: (workspaceId: string, requirementId: string) => void;
  updateItemDraft: (workspaceId: string, requirementId: string, text: string) => void;
  updateItemDeliverableUrl: (workspaceId: string, requirementId: string, url: string) => void;
  
  // Feature Integrations (PRD §3.E, §3.F, §3.I, §3.K, §3.L)
  selectWorkspaceIdea: (workspaceId: string, ideaId: string) => void;
  updateWorkspaceRepo: (workspaceId: string, repoUrl: string) => void;
  updateWorkspaceSlideDeck: (workspaceId: string, slideDeck: SlideDeck) => void;
  updateWorkspaceNotes: (workspaceId: string, notes: string) => void;
  updateWorkspaceResults: (workspaceId: string, results: Partial<WorkspaceResult>) => void;
  updateWorkspaceTechStack: (workspaceId: string, stack: string[]) => void;
  updateWorkspaceProposalDraft: (workspaceId: string, proposal: string) => void;
  toggleLogisticsItemPacked: (workspaceId: string, itemId: string) => void;
  addTeammateToWorkspace: (workspaceId: string, teammate: TeammateProfile) => void;

  // Reusable Vault Actions (PRD §3.K)
  addVaultItem: (item: Omit<VaultItem, 'id' | 'updatedAt'>) => void;
  updateVaultItem: (id: string, updates: Partial<VaultItem>) => void;
  deleteVaultItem: (id: string) => void;
  restoreVaultItem: (item: VaultItem) => void;

  // Integration Toggles
  toggleReminders: (workspaceId: string, enabled?: boolean) => void;
  toggleGoogleCalendar: (workspaceId: string, synced?: boolean) => void;
  toggleAppleCalendar: (workspaceId: string, synced?: boolean) => void;
  
  // Interest Filter Actions
  toggleInterest: (tag: string) => void;
  clearInterests: () => void;
}

const DEFAULT_VAULT_ITEMS: VaultItem[] = [
  {
    id: 'vault-bio-1',
    title: 'Founder bio (33 words)',
    category: 'bio',
    content: 'Full-stack software engineer with 4+ years of experience building high-throughput payment infrastructure and distributed Web3 systems across Sub-Saharan Africa. Passionate about developer tooling, instant low-latency settlement, and offline-first mobile applications.',
    wordCount: 33,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'vault-story-1',
    title: 'Origin story: Cross-border payments',
    category: 'personal_story',
    content: 'Living in Lagos, I regularly experienced cross-border payment failures where remittances were stuck for 72 hours with arbitrary 12% FX fees. After losing a contract deposit due to a delayed banking clearing cycle, I committed to building transparent, real-time micro-settlement rails.',
    wordCount: 42,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'vault-tam-1',
    title: 'Market size & TAM breakdown',
    category: 'tam_model',
    content: 'Our Total Addressable Market (TAM) encompasses $115B in annual informal SME B2B transactions across West Africa. The Serviceable Addressable Market (SAM) is $18B in tech-enabled merchant trade, with our Year 1 Serviceable Obtainable Market (SOM) targeting $240M across 14,000 active cross-border merchants.',
    wordCount: 42,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'vault-arch-1',
    title: 'Architecture & tech stack',
    category: 'tech_architecture',
    content: 'Built on a Rust transaction engine coupled with Node.js microservices, Postgres, and Redis cache. State verification is handled via optimistic rollups with cryptographic proof generation in under 400ms.',
    wordCount: 29,
    updatedAt: new Date().toISOString(),
  },
];

export const useWorkspaceStore = create<WorkspaceStore>()(
  persist(
    (set, get) => ({
      savedWorkspaces: {
        'lagos-fintech-buildathon': {
          id: 'lagos-fintech-buildathon',
          opportunityId: 'lagos-fintech-buildathon',
          savedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          stage: 'saved',
          items: {},
          selectedIdeaId: 'idea-1',
          githubRepoUrl: 'https://github.com/developer/paypulse-core',
          remindersEnabled: true,
          googleCalendarSynced: false,
          appleCalendarSynced: false,
          notes: 'Focus on sub-second local currency conversion via stablecoin micro-rails. Target Paystack Title Bounty.',
          config: {
            opportunityType: 'hackathon',
            sections: {
              overview: true,
              application: true,
              intel: true,
              ideas: true,
              build: true,
              team: true,
              pitch_documents: true,
              logistics: true,
              showcase: true,
              results: true,
              tasks_deadlines: true,
              notes: true,
            },
            sectionOrder: [
              'overview',
              'application',
              'intel',
              'ideas',
              'build',
              'team',
              'pitch_documents',
              'logistics',
              'showcase',
              'results',
              'tasks_deadlines',
              'notes',
            ],
          },
          tasks: [
            {
              id: 'task-lh-1',
              title: 'Review judging criteria & sponsor bounty prompts',
              dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
              priority: 'high',
              completed: true,
              category: 'milestone',
              createdAt: new Date().toISOString(),
            },
            {
              id: 'task-lh-2',
              title: 'Finalize core team roster and assign lead architect',
              priority: 'high',
              completed: true,
              category: 'milestone',
              createdAt: new Date().toISOString(),
            },
            {
              id: 'task-lh-3',
              title: 'Connect GitHub repo and push initial scaffolding',
              priority: 'medium',
              completed: false,
              category: 'custom',
              createdAt: new Date().toISOString(),
            },
            {
              id: 'task-lh-4',
              title: 'Rehearse 3-minute pitch deck with Presentation Coach',
              dueDate: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
              priority: 'medium',
              completed: false,
              category: 'custom',
              createdAt: new Date().toISOString(),
            },
          ],
          logistics: {
            venueName: 'The Zone Tech Hub, Gbagada',
            venueAddress: 'Plot 9, Gbagada Expressway, Lagos, Nigeria',
            mapDirections: 'Off Gbagada-Oworonshoki Expressway, 20 mins from Ikeja Airport',
            travelDates: 'Nov 27 – Nov 29, 2026',
            packingList: [
              { id: 'p1', item: 'Laptop & 100W GaN Fast Charger', category: 'hardware', packed: true },
              { id: 'p2', item: 'Surge protector & universal adapter', category: 'hardware', packed: false },
              { id: 'p3', item: 'National ID / Registration Barcode', category: 'documents', packed: true },
              { id: 'p4', item: 'Power bank (20,000mAh+)', category: 'hardware', packed: true },
              { id: 'p5', item: 'Noise-cancelling headphones', category: 'hardware', packed: false },
              { id: 'p6', item: 'Warm hoodie (Hackathon AC is freezing)', category: 'essentials', packed: false },
            ],
            schedule: [
              { time: 'Day 1 · 08:30 AM', activity: 'Badge check-in & Breakfast' },
              { time: 'Day 1 · 10:00 AM', activity: 'Keynote & Sponsor Bounty Disclosures' },
              { time: 'Day 1 · 11:30 AM', activity: 'Hacking Begins · Build Clock Starts' },
              { time: 'Day 2 · 02:00 PM', activity: 'Mid-Hack Mentor & Judge Walkthroughs' },
              { time: 'Day 3 · 09:00 AM', activity: 'Code Freeze & Devpost/Portal Submission Cutoff' },
              { time: 'Day 3 · 11:00 AM', activity: 'Live Pitching & Presentation Sessions' },
              { time: 'Day 3 · 04:00 PM', activity: 'Winners & Awards Ceremony' },
            ],
            emergencyContacts: [
              { name: 'Tobi Daniels', role: 'Hackathon Director', contact: '+234 802 334 1190' },
              { name: 'Kemi Adeleke', role: 'Tech & WiFi Support', contact: 'wifi@lagosbuild.dev' },
            ],
          },
          teamMembers: [
            {
              id: 'user-self',
              name: 'Mayowa (You)',
              handle: '@mayowadev',
              avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
              primaryRole: 'Full-Stack Developer',
              skills: ['Backend', 'Frontend', 'AI / ML'],
              bio: 'Building developer tools and resilient payment APIs.',
              verifiedWins: 2,
              isAvailable: false,
            },
          ],
        },

        // Pre-seeded Grant Workspace (Application & Funding focused)
        'ethereum-climate-energy-grants': {
          id: 'ethereum-climate-energy-grants',
          opportunityId: 'ethereum-climate-energy-grants',
          savedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          stage: 'preparing',
          items: {},
          remindersEnabled: true,
          googleCalendarSynced: false,
          appleCalendarSynced: false,
          notes: 'Propose an IoT telemetry daemon that writes signed solar kilowatt-hour batches onto Layer 2. Needs detailed 6-month budget breakdown.',
          config: {
            opportunityType: 'grant',
            sections: {
              overview: true,
              intel: true,
              application: true,
              team: false,
              pitch_documents: true,
              tasks_deadlines: true,
              notes: true,
              results: true,
              ideas: false,
              build: true, // Activated by repo requirement (Rule 2)
              showcase: false,
              logistics: false,
            },
            sectionOrder: [
              'overview',
              'intel',
              'application',
              'build',
              'pitch_documents',
              'tasks_deadlines',
              'notes',
              'results',
            ],
          },
          tasks: [
            {
              id: 'task-gr-1',
              title: 'Draft carbon offset methodology & verification formula',
              dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
              priority: 'high',
              completed: false,
              category: 'application',
              createdAt: new Date().toISOString(),
            },
            {
              id: 'task-gr-2',
              title: 'Prepare 6-month budget breakdown ($50k non-dilutive)',
              dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
              priority: 'high',
              completed: false,
              category: 'application',
              createdAt: new Date().toISOString(),
            },
            {
              id: 'task-gr-3',
              title: 'Publish open-source smart contract repository on GitHub',
              priority: 'medium',
              completed: true,
              category: 'custom',
              createdAt: new Date().toISOString(),
            },
          ],
        },

        // Pre-seeded Accelerator Workspace (Growth & Pitch focused)
        'techstars-lagos-2026': {
          id: 'techstars-lagos-2026',
          opportunityId: 'techstars-lagos-2026',
          savedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          stage: 'saved',
          items: {},
          remindersEnabled: true,
          googleCalendarSynced: false,
          appleCalendarSynced: false,
          notes: 'Focus on founder-market fit and 18% MoM GMV growth. Bayo Adeleye values capital efficiency.',
          config: {
            opportunityType: 'venture_hub',
            sections: {
              overview: true,
              intel: true,
              application: true,
              team: true,
              ideas: true,
              build: true,
              pitch_documents: true,
              tasks_deadlines: true,
              notes: true,
              results: true,
              showcase: true,
              logistics: true,
            },
            sectionOrder: [
              'overview',
              'intel',
              'application',
              'team',
              'ideas',
              'build',
              'pitch_documents',
              'tasks_deadlines',
              'notes',
              'results',
              'showcase',
              'logistics',
            ],
          },
          tasks: [
            {
              id: 'task-ts-1',
              title: 'Record 60-second unscripted founder video',
              dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
              priority: 'high',
              completed: false,
              category: 'application',
              createdAt: new Date().toISOString(),
            },
            {
              id: 'task-ts-2',
              title: 'Update 15-slide investor pitch deck with latest cohort metrics',
              dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
              priority: 'high',
              completed: false,
              category: 'application',
              createdAt: new Date().toISOString(),
            },
            {
              id: 'task-ts-3',
              title: 'Gather references from 2 enterprise pilot customers',
              priority: 'medium',
              completed: false,
              category: 'custom',
              createdAt: new Date().toISOString(),
            },
          ],
        },

        // Pre-seeded Tech Event Workspace (Participation & Logistics focused)
        'afrotech-global-summit': {
          id: 'afrotech-global-summit',
          opportunityId: 'afrotech-global-summit',
          savedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
          stage: 'saved',
          items: {},
          remindersEnabled: true,
          googleCalendarSynced: false,
          appleCalendarSynced: false,
          notes: 'Accra International Conference Centre. Book flight arriving by Nov 25. Target meeting partners from Sequoia & Future Africa.',
          config: {
            opportunityType: 'event',
            sections: {
              overview: true,
              intel: true,
              logistics: true,
              tasks_deadlines: true,
              notes: true,
              team: false,
              application: true, // Has application requirement (Rule 2)
              pitch_documents: true, // Main stage pitch deck requirement (Rule 2)
              results: true, // Venture syndicate prize (Rule 2)
              ideas: false,
              build: false,
              showcase: false,
            },
            sectionOrder: [
              'overview',
              'intel',
              'logistics',
              'tasks_deadlines',
              'notes',
              'application',
              'pitch_documents',
              'results',
            ],
          },
          tasks: [
            {
              id: 'task-evt-1',
              title: 'Confirm conference pass & registration badge',
              priority: 'high',
              completed: true,
              category: 'milestone',
              createdAt: new Date().toISOString(),
            },
            {
              id: 'task-evt-2',
              title: 'Finalize main stage 12-slide pitch presentation',
              dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
              priority: 'high',
              completed: false,
              category: 'application',
              createdAt: new Date().toISOString(),
            },
            {
              id: 'task-evt-3',
              title: 'Book flights to Accra (Kotoka International Airport) & hotel',
              dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
              priority: 'high',
              completed: true,
              category: 'custom',
              createdAt: new Date().toISOString(),
            },
          ],
          logistics: {
            venueName: 'Accra International Conference Centre',
            venueAddress: 'Castle Rd, Accra, Ghana',
            mapDirections: '15 mins from Kotoka International Airport (ACC)',
            travelDates: 'Dec 1 – Dec 3, 2026',
            packingList: [
              { id: 'ep1', item: 'Passport & Ghana Entry Visa', category: 'documents', packed: true },
              { id: 'ep2', item: 'Conference Pass Barcode QR', category: 'documents', packed: true },
              { id: 'ep3', item: 'USB-C Display Dongle & Clicker', category: 'hardware', packed: false },
              { id: 'ep4', item: 'Business cards / NFC Tap card', category: 'essentials', packed: true },
            ],
            schedule: [
              { time: 'Day 1 · 09:00 AM', activity: 'Registration & Welcome Keynote' },
              { time: 'Day 1 · 02:00 PM', activity: 'Main Stage Pitch Competition' },
              { time: 'Day 2 · 06:00 PM', activity: 'VIP Investor Gala & Award Announcements' },
            ],
            emergencyContacts: [
              { name: 'Events Desk Accra', role: 'Support', contact: '+233 24 555 0192' },
            ],
          },
        },
      },
      activeRole: 'developer',
      selectedInterests: [],
      vaultItems: DEFAULT_VAULT_ITEMS,
      customOpportunities: [],
      opportunityBannerOverrides: {},
      organizerSubmissions: MOCK_ORGANIZER_SUBMISSIONS,

      setRole: (role: PlatformRole) => {
        set({ activeRole: role });
      },

      publishOpportunity: (oppInput) => {
        const baseSlug = (oppInput.slug || oppInput.title)
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
        const uniqueSuffix = Math.random().toString(36).slice(2, 6);
        const id = oppInput.id || `${baseSlug || 'event'}-${uniqueSuffix}`;
        const created: Opportunity = {
          ...oppInput,
          id,
          slug: oppInput.slug || id,
          applicantCount: oppInput.applicantCount ?? 1,
          submissionCount: oppInput.submissionCount ?? 0,
          judges: [
            {
              id: `judge-${uniqueSuffix}`,
              name: oppInput.organizerName || 'Program Review Panel',
              role: 'Lead Reviewer',
              company: oppInput.organizerName || 'Host Organization',
              avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
              bio: 'Program review lead evaluating technical craft, user utility, and working product execution.',
              notableProducts: [oppInput.title],
              socials: {},
              preferredThemes: oppInput.tags,
            },
          ],
          sponsors: [],
          pastWinners: [],
        };
        set((state) => ({
          customOpportunities: [created, ...(state.customOpportunities ?? [])],
        }));
        return created;
      },

      updateOpportunityBanner: (opportunityId, banner) => {
        set((state) => {
          const updatedCustom = (state.customOpportunities ?? []).map((opp) =>
            opp.id === opportunityId
              ? {
                  ...opp,
                  bannerUrl: banner.bannerUrl !== undefined ? banner.bannerUrl : opp.bannerUrl,
                  bannerTheme: banner.bannerTheme !== undefined ? banner.bannerTheme : opp.bannerTheme,
                }
              : opp
          );
          return {
            customOpportunities: updatedCustom,
            opportunityBannerOverrides: {
              ...(state.opportunityBannerOverrides ?? {}),
              [opportunityId]: {
                ...(state.opportunityBannerOverrides?.[opportunityId] ?? {}),
                ...banner,
              },
            },
          };
        });
      },

      deleteCustomOpportunity: (opportunityId: string) => {
        set((state) => ({
          customOpportunities: (state.customOpportunities ?? []).filter(
            (opp) => opp.id !== opportunityId
          ),
        }));
      },

      restoreCustomOpportunity: (opp: Opportunity) => {
        set((state) => {
          const exists = (state.customOpportunities ?? []).some((item) => item.id === opp.id);
          if (exists) return state;
          return {
            customOpportunities: [opp, ...(state.customOpportunities ?? [])],
          };
        });
      },

      updateSubmissionStatus: (submissionId, status, evaluatorNotes) => {
        set((state) => ({
          organizerSubmissions: (state.organizerSubmissions ?? MOCK_ORGANIZER_SUBMISSIONS).map(
            (sub) =>
              sub.id === submissionId
                ? {
                    ...sub,
                    status,
                    evaluatorNotes:
                      evaluatorNotes !== undefined ? evaluatorNotes : sub.evaluatorNotes,
                  }
                : sub
          ),
        }));
      },

      isSaved: (opportunityId: string) => {
        return !!get().savedWorkspaces[opportunityId];
      },

      getWorkspace: (opportunityId: string) => {
        return get().savedWorkspaces[opportunityId];
      },

      saveOpportunity: (opportunityId: string) => {
        set((state) => {
          if (state.savedWorkspaces[opportunityId]) return state;
          const allOpps = mergeOpportunitiesList(
            state.customOpportunities,
            state.opportunityBannerOverrides
          );
          const opp = allOpps.find((o) => o.id === opportunityId);
          const config = opp ? generateAdaptiveWorkspaceConfig(opp) : undefined;
          const initialTasks: WorkspaceTask[] = opp ? [
            {
              id: `task-${Date.now()}-1`,
              title: `Review eligibility & selection criteria for ${opp.title}`,
              priority: 'high',
              completed: true,
              category: 'milestone',
              createdAt: new Date().toISOString(),
            },
            {
              id: `task-${Date.now()}-2`,
              title: `Complete mandatory application deliverables`,
              dueDate: opp.applicationDeadline,
              priority: 'high',
              completed: false,
              category: 'application',
              createdAt: new Date().toISOString(),
            },
            {
              id: `task-${Date.now()}-3`,
              title: `Submit final application before cutoff`,
              priority: 'medium',
              completed: false,
              category: 'custom',
              createdAt: new Date().toISOString(),
            },
          ] : [];

          const newWorkspace: WorkspaceRecord = {
            id: opportunityId,
            opportunityId,
            savedAt: new Date().toISOString(),
            stage: 'saved',
            items: {},
            config,
            tasks: initialTasks,
            notes: '',
            remindersEnabled: true,
            googleCalendarSynced: false,
            appleCalendarSynced: false,
          };
          return {
            savedWorkspaces: {
              ...state.savedWorkspaces,
              [opportunityId]: newWorkspace,
            },
          };
        });
      },

      toggleWorkspaceSection: (workspaceId: string, sectionId: WorkspaceSectionId) => {
        set((state) => {
          const ws = state.savedWorkspaces[workspaceId];
          if (!ws) return state;
          const opp = mergeOpportunitiesList(
            state.customOpportunities,
            state.opportunityBannerOverrides
          ).find((o) => o.id === ws.opportunityId);
          const currentConfig = ws.config || (opp ? generateAdaptiveWorkspaceConfig(opp) : undefined);
          if (!currentConfig) return state;

          const currentEnabled = !!currentConfig.sections[sectionId];
          const nextSections = {
            ...currentConfig.sections,
            [sectionId]: !currentEnabled,
          };

          return {
            savedWorkspaces: {
              ...state.savedWorkspaces,
              [workspaceId]: {
                ...ws,
                config: {
                  ...currentConfig,
                  sections: nextSections,
                },
              },
            },
          };
        });
      },

      resetWorkspaceSections: (workspaceId: string) => {
        set((state) => {
          const ws = state.savedWorkspaces[workspaceId];
          if (!ws) return state;
          const opp = mergeOpportunitiesList(
            state.customOpportunities,
            state.opportunityBannerOverrides
          ).find((o) => o.id === ws.opportunityId);
          if (!opp) return state;
          const defaultConfig = generateAdaptiveWorkspaceConfig(opp);
          return {
            savedWorkspaces: {
              ...state.savedWorkspaces,
              [workspaceId]: {
                ...ws,
                config: defaultConfig,
              },
            },
          };
        });
      },

      addWorkspaceTask: (workspaceId: string, task: Omit<WorkspaceTask, 'id' | 'createdAt'>) => {
        set((state) => {
          const ws = state.savedWorkspaces[workspaceId];
          if (!ws) return state;
          const newTask: WorkspaceTask = {
            ...task,
            id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            createdAt: new Date().toISOString(),
          };
          return {
            savedWorkspaces: {
              ...state.savedWorkspaces,
              [workspaceId]: {
                ...ws,
                tasks: [newTask, ...(ws.tasks || [])],
              },
            },
          };
        });
      },

      toggleWorkspaceTask: (workspaceId: string, taskId: string) => {
        set((state) => {
          const ws = state.savedWorkspaces[workspaceId];
          if (!ws || !ws.tasks) return state;
          return {
            savedWorkspaces: {
              ...state.savedWorkspaces,
              [workspaceId]: {
                ...ws,
                tasks: ws.tasks.map((t) =>
                  t.id === taskId ? { ...t, completed: !t.completed } : t
                ),
              },
            },
          };
        });
      },

      deleteWorkspaceTask: (workspaceId: string, taskId: string) => {
        set((state) => {
          const ws = state.savedWorkspaces[workspaceId];
          if (!ws || !ws.tasks) return state;
          return {
            savedWorkspaces: {
              ...state.savedWorkspaces,
              [workspaceId]: {
                ...ws,
                tasks: ws.tasks.filter((t) => t.id !== taskId),
              },
            },
          };
        });
      },

      restoreWorkspaceTask: (workspaceId: string, task: WorkspaceTask) => {
        set((state) => {
          const ws = state.savedWorkspaces[workspaceId];
          if (!ws) return state;
          const tasks = ws.tasks || [];
          if (tasks.some((t) => t.id === task.id)) return state;
          return {
            savedWorkspaces: {
              ...state.savedWorkspaces,
              [workspaceId]: {
                ...ws,
                tasks: [task, ...tasks],
              },
            },
          };
        });
      },

      updateWorkspaceResults: (workspaceId: string, results: Partial<WorkspaceResult>) => {
        set((state) => {
          const ws = state.savedWorkspaces[workspaceId];
          if (!ws) return state;
          const currentResult = ws.results || { outcome: 'pending_review' };
          return {
            savedWorkspaces: {
              ...state.savedWorkspaces,
              [workspaceId]: {
                ...ws,
                results: {
                  ...currentResult,
                  ...results,
                  updatedAt: new Date().toISOString(),
                },
              },
            },
          };
        });
      },

      updateWorkspaceTechStack: (workspaceId: string, stack: string[]) => {
        set((state) => {
          const ws = state.savedWorkspaces[workspaceId];
          if (!ws) return state;
          return {
            savedWorkspaces: {
              ...state.savedWorkspaces,
              [workspaceId]: {
                ...ws,
                techStack: stack,
              },
            },
          };
        });
      },

      updateWorkspaceProposalDraft: (workspaceId: string, proposal: string) => {
        set((state) => {
          const ws = state.savedWorkspaces[workspaceId];
          if (!ws) return state;
          return {
            savedWorkspaces: {
              ...state.savedWorkspaces,
              [workspaceId]: {
                ...ws,
                proposalDraft: proposal,
              },
            },
          };
        });
      },

      unsaveOpportunity: (opportunityId: string) => {
        set((state) => {
          const next = { ...state.savedWorkspaces };
          delete next[opportunityId];
          return { savedWorkspaces: next };
        });
      },

      setWorkspaceStage: (workspaceId: string, stage: WorkspaceStage) => {
        set((state) => {
          const existing = state.savedWorkspaces[workspaceId];
          if (!existing) return state;
          return {
            savedWorkspaces: {
              ...state.savedWorkspaces,
              [workspaceId]: {
                ...existing,
                stage,
              },
            },
          };
        });
      },

      toggleItemCompleted: (workspaceId: string, requirementId: string) => {
        set((state) => {
          const workspace = state.savedWorkspaces[workspaceId];
          if (!workspace) return state;

          const currentItem = workspace.items[requirementId] || { completed: false };
          const nextCompleted = !currentItem.completed;

          const nextStage =
            nextCompleted && workspace.stage === 'saved' ? 'preparing' : workspace.stage;

          return {
            savedWorkspaces: {
              ...state.savedWorkspaces,
              [workspaceId]: {
                ...workspace,
                stage: nextStage,
                items: {
                  ...workspace.items,
                  [requirementId]: {
                    ...currentItem,
                    completed: nextCompleted,
                    lastEditedAt: new Date().toISOString(),
                  },
                },
              },
            },
          };
        });
      },

      updateItemDraft: (workspaceId: string, requirementId: string, text: string) => {
        set((state) => {
          const workspace = state.savedWorkspaces[workspaceId];
          if (!workspace) return state;

          const currentItem = workspace.items[requirementId] || { completed: false };
          return {
            savedWorkspaces: {
              ...state.savedWorkspaces,
              [workspaceId]: {
                ...workspace,
                items: {
                  ...workspace.items,
                  [requirementId]: {
                    ...currentItem,
                    draftText: text,
                    lastEditedAt: new Date().toISOString(),
                  },
                },
              },
            },
          };
        });
      },

      updateItemDeliverableUrl: (workspaceId: string, requirementId: string, url: string) => {
        set((state) => {
          const workspace = state.savedWorkspaces[workspaceId];
          if (!workspace) return state;

          const currentItem = workspace.items[requirementId] || { completed: false };
          return {
            savedWorkspaces: {
              ...state.savedWorkspaces,
              [workspaceId]: {
                ...workspace,
                items: {
                  ...workspace.items,
                  [requirementId]: {
                    ...currentItem,
                    deliverableUrl: url,
                    lastEditedAt: new Date().toISOString(),
                  },
                },
              },
            },
          };
        });
      },

      selectWorkspaceIdea: (workspaceId: string, ideaId: string) => {
        set((state) => {
          const ws = state.savedWorkspaces[workspaceId];
          if (!ws) return state;
          return {
            savedWorkspaces: {
              ...state.savedWorkspaces,
              [workspaceId]: {
                ...ws,
                selectedIdeaId: ideaId,
              },
            },
          };
        });
      },

      updateWorkspaceRepo: (workspaceId: string, repoUrl: string) => {
        set((state) => {
          const ws = state.savedWorkspaces[workspaceId];
          if (!ws) return state;
          return {
            savedWorkspaces: {
              ...state.savedWorkspaces,
              [workspaceId]: {
                ...ws,
                githubRepoUrl: repoUrl,
              },
            },
          };
        });
      },

      updateWorkspaceSlideDeck: (workspaceId: string, slideDeck: SlideDeck) => {
        set((state) => {
          const ws = state.savedWorkspaces[workspaceId];
          if (!ws) return state;
          return {
            savedWorkspaces: {
              ...state.savedWorkspaces,
              [workspaceId]: {
                ...ws,
                slideDeck,
              },
            },
          };
        });
      },

      updateWorkspaceNotes: (workspaceId: string, notes: string) => {
        set((state) => {
          const ws = state.savedWorkspaces[workspaceId];
          if (!ws) return state;
          return {
            savedWorkspaces: {
              ...state.savedWorkspaces,
              [workspaceId]: {
                ...ws,
                notes,
              },
            },
          };
        });
      },

      toggleLogisticsItemPacked: (workspaceId: string, itemId: string) => {
        set((state) => {
          const ws = state.savedWorkspaces[workspaceId];
          if (!ws || !ws.logistics) return state;
          return {
            savedWorkspaces: {
              ...state.savedWorkspaces,
              [workspaceId]: {
                ...ws,
                logistics: {
                  ...ws.logistics,
                  packingList: ws.logistics.packingList.map((item) =>
                    item.id === itemId ? { ...item, packed: !item.packed } : item
                  ),
                },
              },
            },
          };
        });
      },

      addTeammateToWorkspace: (workspaceId: string, teammate: TeammateProfile) => {
        set((state) => {
          const ws = state.savedWorkspaces[workspaceId];
          if (!ws) return state;
          const currentMembers = ws.teamMembers || [];
          if (currentMembers.some((m) => m.id === teammate.id)) return state;
          return {
            savedWorkspaces: {
              ...state.savedWorkspaces,
              [workspaceId]: {
                ...ws,
                teamMembers: [...currentMembers, teammate],
              },
            },
          };
        });
      },

      addVaultItem: (item) => {
        set((state) => ({
          vaultItems: [
            {
              ...item,
              id: 'vault-' + Math.random().toString(36).substring(2, 9),
              updatedAt: new Date().toISOString(),
            },
            ...state.vaultItems,
          ],
        }));
      },

      updateVaultItem: (id, updates) => {
        set((state) => ({
          vaultItems: state.vaultItems.map((item) =>
            item.id === id
              ? {
                  ...item,
                  ...updates,
                  updatedAt: new Date().toISOString(),
                }
              : item
          ),
        }));
      },

      deleteVaultItem: (id) => {
        set((state) => ({
          vaultItems: state.vaultItems.filter((item) => item.id !== id),
        }));
      },

      restoreVaultItem: (item) => {
        set((state) => {
          if (state.vaultItems.some((existing) => existing.id === item.id)) return state;
          return {
            vaultItems: [item, ...state.vaultItems],
          };
        });
      },

      toggleReminders: (workspaceId: string, enabled?: boolean) => {
        set((state) => {
          const ws = state.savedWorkspaces[workspaceId];
          if (!ws) return state;
          return {
            savedWorkspaces: {
              ...state.savedWorkspaces,
              [workspaceId]: {
                ...ws,
                remindersEnabled: enabled !== undefined ? enabled : !ws.remindersEnabled,
              },
            },
          };
        });
      },

      toggleGoogleCalendar: (workspaceId: string, synced?: boolean) => {
        set((state) => {
          const ws = state.savedWorkspaces[workspaceId];
          if (!ws) return state;
          return {
            savedWorkspaces: {
              ...state.savedWorkspaces,
              [workspaceId]: {
                ...ws,
                googleCalendarSynced:
                  synced !== undefined ? synced : !ws.googleCalendarSynced,
              },
            },
          };
        });
      },

      toggleAppleCalendar: (workspaceId: string, synced?: boolean) => {
        set((state) => {
          const ws = state.savedWorkspaces[workspaceId];
          if (!ws) return state;
          return {
            savedWorkspaces: {
              ...state.savedWorkspaces,
              [workspaceId]: {
                ...ws,
                appleCalendarSynced:
                  synced !== undefined ? synced : !ws.appleCalendarSynced,
              },
            },
          };
        });
      },

      toggleInterest: (tag: string) => {
        set((state) => {
          const exists = state.selectedInterests.includes(tag);
          return {
            selectedInterests: exists
              ? state.selectedInterests.filter((t) => t !== tag)
              : [...state.selectedInterests, tag],
          };
        });
      },

      clearInterests: () => {
        set({ selectedInterests: [] });
      },
    }),
    {
      name: 'hackathon-workspace-storage',
    }
  )
);

export function useAllOpportunities(): Opportunity[] {
  const customOpportunities = useWorkspaceStore((state) => state.customOpportunities);
  const overrides = useWorkspaceStore((state) => state.opportunityBannerOverrides);
  return useMemo(
    () => mergeOpportunitiesList(customOpportunities, overrides),
    [customOpportunities, overrides]
  );
}
