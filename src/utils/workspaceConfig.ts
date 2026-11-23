import { 
  Opportunity, 
  OpportunityType, 
  WorkspaceConfig, 
  WorkspaceSectionId 
} from '../types';

export interface SectionMeta {
  id: WorkspaceSectionId;
  label: string;
  shortLabel: string;
  description: string;
  isCore: boolean;
  typicalTypes: OpportunityType[];
}

export const ALL_SECTIONS_META: Record<WorkspaceSectionId, SectionMeta> = {
  overview: {
    id: 'overview',
    label: 'Overview',
    shortLabel: 'Overview',
    description: 'Central summary of the opportunity, status, important dates and next actions.',
    isCore: true,
    typicalTypes: ['hackathon', 'grant', 'venture_hub', 'event'],
  },
  intel: {
    id: 'intel',
    label: 'Intel & Research',
    shortLabel: 'Intel',
    description: 'Opportunity information, eligibility, requirements, organisers, sponsors and relevant research.',
    isCore: true,
    typicalTypes: ['hackathon', 'grant', 'venture_hub', 'event'],
  },
  tasks_deadlines: {
    id: 'tasks_deadlines',
    label: 'Tasks & Deadlines',
    shortLabel: 'Tasks',
    description: 'Track activities, milestones, outstanding tasks and important dates.',
    isCore: true,
    typicalTypes: ['hackathon', 'grant', 'venture_hub', 'event'],
  },
  notes: {
    id: 'notes',
    label: 'Notes & Scratchpad',
    shortLabel: 'Notes',
    description: 'Capture ideas, observations, meeting notes and other relevant information.',
    isCore: true,
    typicalTypes: ['hackathon', 'grant', 'venture_hub', 'event'],
  },
  team: {
    id: 'team',
    label: 'Team & Collaborators',
    shortLabel: 'Team',
    description: 'Manage collaborators, team members, responsibilities and communication.',
    isCore: true,
    typicalTypes: ['hackathon', 'venture_hub'],
  },
  application: {
    id: 'application',
    label: 'Application Checklist',
    shortLabel: 'Application',
    description: 'Manage application requirements, questions, answers and submission status.',
    isCore: false,
    typicalTypes: ['grant', 'venture_hub', 'hackathon'],
  },
  ideas: {
    id: 'ideas',
    label: 'Ideas & Innovation',
    shortLabel: 'Ideas',
    description: 'Develop, organise and evaluate ideas against criteria and sponsor bounties.',
    isCore: false,
    typicalTypes: ['hackathon', 'venture_hub'],
  },
  build: {
    id: 'build',
    label: 'Build & Tech Stack',
    shortLabel: 'Build',
    description: 'Manage project development, GitHub repository, execution, and video walkthroughs.',
    isCore: false,
    typicalTypes: ['hackathon', 'venture_hub'],
  },
  pitch_documents: {
    id: 'pitch_documents',
    label: 'Pitch & Documents',
    shortLabel: 'Pitch & Docs',
    description: 'Prepare proposals, presentations, pitch decks and supporting materials.',
    isCore: false,
    typicalTypes: ['grant', 'venture_hub', 'hackathon'],
  },
  logistics: {
    id: 'logistics',
    label: 'Logistics & Packing',
    shortLabel: 'Logistics',
    description: 'Manage registration, attendance, travel, accommodation and event arrangements.',
    isCore: false,
    typicalTypes: ['event', 'hackathon', 'venture_hub'],
  },
  showcase: {
    id: 'showcase',
    label: 'Showcase & Demos',
    shortLabel: 'Showcase',
    description: 'Manage project presentation, demos, public submissions and voting requirements.',
    isCore: false,
    typicalTypes: ['hackathon', 'venture_hub'],
  },
  results: {
    id: 'results',
    label: 'Results & Outcomes',
    shortLabel: 'Results',
    description: 'Track outcomes, awards, application decisions and participation results.',
    isCore: false,
    typicalTypes: ['hackathon', 'grant', 'venture_hub'],
  },
};

/**
 * Generates an adaptive workspace configuration based on opportunity type and actual requirements (Rule 1 & Rule 2).
 */
export function generateAdaptiveWorkspaceConfig(opportunity: Opportunity): WorkspaceConfig {
  const isPhysical = opportunity.format === 'In-Person' || opportunity.format === 'Hybrid';
  const hasRequirements = opportunity.requirements.length > 0;
  const hasRepoReq = opportunity.requirements.some((r) => r.type === 'repo_link');
  const hasPitchReq = opportunity.requirements.some((r) => r.type === 'pitch_deck' || r.type === 'demo_video');
  const hasTeamReq = opportunity.requirements.some((r) => 
    r.title.toLowerCase().includes('team') || 
    r.title.toLowerCase().includes('founder') ||
    r.title.toLowerCase().includes('composition')
  );
  const hasCashPrize = Boolean(opportunity.prizePool && !opportunity.prizePool.toLowerCase().includes('n/a'));

  const baseSections: Record<WorkspaceSectionId, boolean> = {
    overview: true,
    intel: true,
    tasks_deadlines: true,
    notes: true,
    team: false,
    application: false,
    ideas: false,
    build: false,
    pitch_documents: false,
    logistics: false,
    showcase: false,
    results: false,
  };

  let sectionOrder: WorkspaceSectionId[] = [];

  switch (opportunity.type) {
    case 'hackathon':
      // 5.1 Hackathon workspace (Build-focused)
      // Recommended: Overview, Application, Intel, Ideas, Build, Team, Pitch & Docs, Logistics, Showcase, Results, Tasks & Deadlines, Notes
      sectionOrder = [
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
      ];
      baseSections.overview = true;
      baseSections.application = true;
      baseSections.intel = true;
      baseSections.ideas = true;
      baseSections.build = true;
      baseSections.team = true;
      baseSections.pitch_documents = true;
      baseSections.logistics = isPhysical; // conditional on physical/hybrid
      baseSections.showcase = true;
      baseSections.results = true;
      baseSections.tasks_deadlines = true;
      baseSections.notes = true;
      break;

    case 'grant':
      // 5.2 Grant workspace (Application-focused)
      // Recommended: Overview, Intel, Application, Team, Pitch & Docs, Tasks & Deadlines, Notes, Results
      // Conditional: Ideas, Build, Showcase
      sectionOrder = [
        'overview',
        'intel',
        'application',
        'team',
        'pitch_documents',
        'tasks_deadlines',
        'notes',
        'results',
        'ideas',
        'build',
        'showcase',
      ];
      baseSections.overview = true;
      baseSections.intel = true;
      baseSections.application = true;
      baseSections.team = hasTeamReq; // conditional
      baseSections.pitch_documents = true;
      baseSections.tasks_deadlines = true;
      baseSections.notes = true;
      baseSections.results = true;
      baseSections.build = hasRepoReq; // Rule 2: prototype required
      baseSections.ideas = false;
      baseSections.showcase = false;
      baseSections.logistics = false;
      break;

    case 'venture_hub':
      // 5.3 Accelerator workspace (Growth-focused)
      // Recommended: Overview, Intel, Application, Team, Ideas, Build, Pitch & Docs, Tasks & Deadlines, Notes, Results
      // Conditional: Showcase, Logistics
      sectionOrder = [
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
      ];
      baseSections.overview = true;
      baseSections.intel = true;
      baseSections.application = true;
      baseSections.team = true;
      baseSections.ideas = true;
      baseSections.build = true;
      baseSections.pitch_documents = true;
      baseSections.tasks_deadlines = true;
      baseSections.notes = true;
      baseSections.results = true;
      baseSections.showcase = true; // demo days typical in accelerators
      baseSections.logistics = isPhysical; // conditional
      break;

    case 'event':
      // 5.4 Tech event workspace (Participation-focused)
      // Recommended: Overview, Intel, Logistics, Tasks & Deadlines, Notes, Team
      // Conditional: Application, Pitch & Documents, Results
      sectionOrder = [
        'overview',
        'intel',
        'logistics',
        'tasks_deadlines',
        'notes',
        'team',
        'application',
        'pitch_documents',
        'results',
      ];
      baseSections.overview = true;
      baseSections.intel = true;
      baseSections.logistics = true;
      baseSections.tasks_deadlines = true;
      baseSections.notes = true;
      baseSections.team = hasTeamReq;
      baseSections.application = hasRequirements; // Rule 2: application if required
      baseSections.pitch_documents = hasPitchReq; // Rule 2: pitch if presenting
      baseSections.results = hasCashPrize; // Rule 2: results if competition
      baseSections.ideas = false;
      baseSections.build = hasRepoReq;
      baseSections.showcase = false;
      break;

    default:
      sectionOrder = [
        'overview',
        'intel',
        'tasks_deadlines',
        'notes',
        'team',
        'application',
        'ideas',
        'build',
        'pitch_documents',
        'logistics',
        'showcase',
        'results',
      ];
      baseSections.overview = true;
      baseSections.intel = true;
      baseSections.tasks_deadlines = true;
      baseSections.notes = true;
      baseSections.application = hasRequirements;
  }

  return {
    opportunityType: opportunity.type,
    sections: baseSections,
    sectionOrder,
  };
}

/**
 * Returns active visible sections in proper sequence for the workspace.
 */
export function getOrderedVisibleSections(config: WorkspaceConfig): WorkspaceSectionId[] {
  return config.sectionOrder.filter((id) => config.sections[id] === true);
}
