export type OpportunityType = 'hackathon' | 'event' | 'grant' | 'venture_hub';
export type OpportunityFormat = 'Online' | 'In-Person' | 'Hybrid';
export type WorkspaceStage = 'saved' | 'preparing' | 'applied' | 'building' | 'pitching' | 'results';

export type RequirementType = 
  | 'text_prompt' 
  | 'pitch_deck' 
  | 'demo_video' 
  | 'repo_link' 
  | 'live_url' 
  | 'document';

export interface ApplicationRequirement {
  id: string;
  step: string; // e.g., "Step 1: Team & Project Overview", "Step 2: Technical Deliverables"
  title: string;
  description?: string;
  type: RequirementType;
  maxWords?: number;
  acceptedFormats?: string; // e.g., "PDF, PPTX (Max 10 slides)" or "MP4, Loom (Max 2 mins)"
  mandatory: boolean;
}

export interface Judge {
  id: string;
  name: string;
  role: string;
  company: string;
  avatarUrl: string;
  bio: string;
  notableProducts: string[];
  socials: {
    linkedin?: string;
    twitter?: string;
    github?: string;
  };
  sponsorId?: string; // Link to matching sponsor for overlap detection
  preferredThemes?: string[];
  judgingAdvice?: string;
}

export interface Sponsor {
  id: string;
  name: string;
  logoUrl?: string;
  tier: 'Title' | 'Gold' | 'Silver' | 'Community';
  bountyTitle: string;
  bountyDescription: string;
  prizePool: string;
  judgeRepresentativeId?: string; // Links to Judge.id
  recommendedTech?: string[];
}

export interface PastWinner {
  id: string;
  edition: string; // e.g., "2025", "2024"
  projectName: string;
  teamName: string;
  problemSolved: string;
  prizeWon: string;
  deckUrl?: string;
  demoUrl?: string;
  repoUrl?: string;
  whyTheyWon?: string;
  contactHandle?: string;
}

export interface OpportunityThemeContext {
  theme: string;
  problemStatements: string[];
  judgingCriteria: {
    name: string;
    weight: string;
    description: string;
  }[];
}

export interface ResearchedIdea {
  id: string;
  title: string;
  tagline: string;
  problemStatement: string;
  solution: string;
  targetSponsorBounty: string;
  recommendedStack: string[];
  whyNotCliche: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

export interface Opportunity {
  id: string;
  slug: string;
  title: string;
  summary: string;
  descriptionMarkdown: string;
  type: OpportunityType;
  format: OpportunityFormat;
  location?: string;
  prizePool: string;
  tags: string[]; // e.g., ["Web3", "AI / ML", "Fintech"]
  applicationDeadline: string; // ISO 8601 UTC
  registrationOpens: string;
  eventStart?: string;
  buildClockHours?: number;
  submissionCutoff?: string;
  pitchSlotTime?: string;
  judgingStarts?: string;
  winnersAnnounced?: string;
  externalPortalUrl: string;
  requirements: ApplicationRequirement[];
  judges: Judge[];
  sponsors: Sponsor[];
  pastWinners: PastWinner[];
  themeContext: OpportunityThemeContext;
  researchedIdeas?: ResearchedIdea[];
}

export interface WorkspaceItemState {
  completed: boolean;
  draftText?: string;
  deliverableUrl?: string;
  lastEditedAt?: string;
}

// Reusable Vault Item (PRD §3.K)
export type VaultCategory = 
  | 'bio' 
  | 'problem_statement' 
  | 'tam_model' 
  | 'personal_story' 
  | 'tech_architecture' 
  | 'general';

export interface VaultItem {
  id: string;
  title: string;
  category: VaultCategory;
  content: string;
  wordCount: number;
  updatedAt: string;
}

// Slide Deck & Presentation Coach Models (PRD §3.F & §3.I)
export interface SlideItem {
  id: string;
  slideNumber: number;
  title: string;
  subtitle: string;
  layoutType: 'title' | 'problem_solution' | 'architecture' | 'market_tam' | 'demo_flow' | 'team_roadmap';
  bullets: string[];
  metricCallout?: {
    value: string;
    label: string;
  };
  scriptLines: string[]; // Lines to be spoken on this slide
  allocatedSeconds: number; // Duration budgeted for this slide
}

export interface SlideDeck {
  id: string;
  title: string;
  repoUrl?: string;
  targetTimeMinutes: number; // 1, 3, or 5 mins
  targetAudience: 'judges' | 'investors' | 'grant_panel';
  slides: SlideItem[];
}

// Teammate Finder Models (PRD §3.L)
export type TeammateSkill = 
  | 'Backend' 
  | 'Frontend' 
  | 'Mobile' 
  | 'AI / ML' 
  | 'UI / UX Design' 
  | 'Pitching & Business' 
  | 'Smart Contracts';

export interface TeammateProfile {
  id: string;
  name: string;
  handle: string;
  avatarUrl: string;
  primaryRole: string;
  skills: TeammateSkill[];
  bio: string;
  githubUrl?: string;
  portfolioUrl?: string;
  verifiedWins: number;
  isAvailable: boolean;
}

export interface TeammateListing {
  id: string;
  hackathonId: string;
  type: 'need_people' | 'available';
  author: TeammateProfile;
  title: string;
  description: string;
  missingSkills?: TeammateSkill[];
  createdAt: string;
}

// In-Person Logistics Planner (PRD §3.K)
export interface InPersonLogistics {
  venueName: string;
  venueAddress: string;
  mapDirections: string;
  travelDates: string;
  packingList: {
    id: string;
    item: string;
    category: 'hardware' | 'documents' | 'essentials';
    packed: boolean;
  }[];
  schedule: {
    time: string;
    activity: string;
  }[];
  emergencyContacts: {
    name: string;
    role: string;
    contact: string;
  }[];
}

// Adaptive Workspace Navigation Models (PRD §4 & §7)
export type WorkspaceSectionId = 
  | 'overview'
  | 'intel'
  | 'tasks_deadlines'
  | 'notes'
  | 'team'
  | 'application'
  | 'ideas'
  | 'build'
  | 'pitch_documents'
  | 'logistics'
  | 'showcase'
  | 'results';

export type SectionState = 'unstarted' | 'active' | 'pending' | 'completed';

export interface WorkspaceConfig {
  opportunityType: OpportunityType;
  sections: Record<WorkspaceSectionId, boolean>;
  sectionOrder: WorkspaceSectionId[];
  customActivatedSections?: WorkspaceSectionId[];
}

export interface WorkspaceTask {
  id: string;
  title: string;
  dueDate?: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  category?: 'milestone' | 'custom' | 'application';
  createdAt: string;
}

export type ResultOutcome = 
  | 'pending_review' 
  | 'shortlisted' 
  | 'finalist' 
  | 'winner' 
  | 'grant_awarded' 
  | 'not_selected';

export interface WorkspaceResult {
  outcome: ResultOutcome;
  prizeWon?: string;
  feedbackNotes?: string;
  retrospective?: string;
  updatedAt?: string;
}

export interface WorkspaceRecord {
  id: string; // matches opportunityId
  opportunityId: string;
  savedAt: string;
  stage: WorkspaceStage;
  items: Record<string, WorkspaceItemState>; // requirementId -> state
  config?: WorkspaceConfig;
  tasks?: WorkspaceTask[];
  notes?: string;
  results?: WorkspaceResult;
  selectedIdeaId?: string;
  githubRepoUrl?: string;
  techStack?: string[];
  slideDeck?: SlideDeck;
  proposalDraft?: string;
  logistics?: InPersonLogistics;
  teamMembers?: TeammateProfile[];
  remindersEnabled: boolean;
  googleCalendarSynced: boolean;
  appleCalendarSynced: boolean;
}

export type ReminderInterval = '14d' | '7d' | '3d' | '24h' | '3h';
export type ReminderStatus = 'sent' | 'scheduled' | 'passed_before_save' | 'cancelled';

export interface ReminderCheckpoint {
  id: string;
  label: string;
  interval: ReminderInterval;
  targetDate: string; // ISO string
  status: ReminderStatus;
}

export const ALL_INTEREST_TAGS = [
  'Web3',
  'Fintech',
  'Agritech',
  'Foodtech',
  'AI / ML',
  'Healthtech',
  'Climate & Energy',
  'Developer Tools',
] as const;

export type InterestTag = (typeof ALL_INTEREST_TAGS)[number];


