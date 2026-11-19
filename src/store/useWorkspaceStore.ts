import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  WorkspaceRecord, 
  WorkspaceStage, 
  VaultItem, 
  SlideDeck, 
  TeammateProfile 
} from '../types';

interface WorkspaceStore {
  savedWorkspaces: Record<string, WorkspaceRecord>;
  selectedInterests: string[];
  vaultItems: VaultItem[];
  
  // Workspace Actions
  isSaved: (opportunityId: string) => boolean;
  getWorkspace: (opportunityId: string) => WorkspaceRecord | undefined;
  saveOpportunity: (opportunityId: string) => void;
  unsaveOpportunity: (opportunityId: string) => void;
  setWorkspaceStage: (workspaceId: string, stage: WorkspaceStage) => void;
  
  // Checklist & Draft Actions
  toggleItemCompleted: (workspaceId: string, requirementId: string) => void;
  updateItemDraft: (workspaceId: string, requirementId: string, text: string) => void;
  updateItemDeliverableUrl: (workspaceId: string, requirementId: string, url: string) => void;
  
  // Feature Integrations (PRD §3.E, §3.F, §3.I, §3.K, §3.L)
  selectWorkspaceIdea: (workspaceId: string, ideaId: string) => void;
  updateWorkspaceRepo: (workspaceId: string, repoUrl: string) => void;
  updateWorkspaceSlideDeck: (workspaceId: string, slideDeck: SlideDeck) => void;
  updateWorkspaceNotes: (workspaceId: string, notes: string) => void;
  toggleLogisticsItemPacked: (workspaceId: string, itemId: string) => void;
  addTeammateToWorkspace: (workspaceId: string, teammate: TeammateProfile) => void;

  // Reusable Vault Actions (PRD §3.K)
  addVaultItem: (item: Omit<VaultItem, 'id' | 'updatedAt'>) => void;
  updateVaultItem: (id: string, updates: Partial<VaultItem>) => void;
  deleteVaultItem: (id: string) => void;

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
      },
      selectedInterests: [],
      vaultItems: DEFAULT_VAULT_ITEMS,

      isSaved: (opportunityId: string) => {
        return !!get().savedWorkspaces[opportunityId];
      },

      getWorkspace: (opportunityId: string) => {
        return get().savedWorkspaces[opportunityId];
      },

      saveOpportunity: (opportunityId: string) => {
        set((state) => {
          if (state.savedWorkspaces[opportunityId]) return state;
          const newWorkspace: WorkspaceRecord = {
            id: opportunityId,
            opportunityId,
            savedAt: new Date().toISOString(),
            stage: 'saved',
            items: {},
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
