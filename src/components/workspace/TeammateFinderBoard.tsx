import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Sparkles, 
  Check, 
  ExternalLink, 
  Github, 
  Trophy, 
  ShieldCheck
} from 'lucide-react';
import { TeammateProfile, TeammateSkill } from '../../types';
import { useWorkspaceStore } from '../../store/useWorkspaceStore';
import { toast } from 'sonner';

interface TeammateFinderBoardProps {
  workspaceId: string;
  opportunityTitle?: string;
}

const MOCK_CANDIDATES: TeammateProfile[] = [
  {
    id: 'user-zainab',
    name: 'Zainab Balogun',
    handle: '@zainab_ux',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    primaryRole: 'Lead Product & Interaction Designer',
    skills: ['UI / UX Design', 'Pitching & Business'],
    bio: 'Specialized in mobile-native fintech interfaces, micro-interactions, and high-conversion pitch deck design. Former designer at Flutterwave.',
    portfolioUrl: 'https://zainab.design',
    verifiedWins: 3,
    isAvailable: true,
  },
  {
    id: 'user-emeka',
    name: 'Emeka Nwosu',
    handle: '@emeka_sol',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    primaryRole: 'Smart Contract & Rust Engineer',
    skills: ['Smart Contracts', 'Backend'],
    bio: 'Writes gas-optimized Solana programs and Ethereum rollups. Audited over 12 protocols with $30M+ TVL.',
    githubUrl: 'https://github.com/emekanwosu',
    verifiedWins: 2,
    isAvailable: true,
  },
  {
    id: 'user-amara',
    name: 'Amara Diallo',
    handle: '@amara_pitch',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    primaryRole: 'Fintech Founder & Pitch Storyteller',
    skills: ['Pitching & Business', 'UI / UX Design'],
    bio: 'Won 1st prize at ETHSafari 2025. Expert in economic TAM modeling, financial storytelling, and stage presentations.',
    verifiedWins: 4,
    isAvailable: true,
  },
  {
    id: 'user-farouk',
    name: 'Farouk Al-Hassan',
    handle: '@farouk_mobile',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    primaryRole: 'React Native & Offline-First Mobile Dev',
    skills: ['Mobile', 'Frontend'],
    bio: 'Builds ultra-fast offline SQLite sync engines for low-end Android devices across West Africa.',
    githubUrl: 'https://github.com/faroukalhassan',
    verifiedWins: 1,
    isAvailable: true,
  },
];

export const TeammateFinderBoard: React.FC<TeammateFinderBoardProps> = ({
  workspaceId,
}) => {
  const workspace = useWorkspaceStore((state) => state.getWorkspace(workspaceId));
  const addTeammateToWorkspace = useWorkspaceStore((state) => state.addTeammateToWorkspace);

  const teamMembers = workspace?.teamMembers || [];
  const [activeTab, setActiveTab] = useState<'available' | 'need_people' | 'my_team'>('available');
  const [candidates] = useState<TeammateProfile[]>(MOCK_CANDIDATES);
  const [invitedIds, setInvitedIds] = useState<string[]>([]);

  // Collect all skills already represented in current team
  const coveredSkills = new Set<TeammateSkill>();
  teamMembers.forEach((m) => m.skills.forEach((s) => coveredSkills.add(s)));

  // Identify skill gaps (PRD §3.L: "A team with backend + designer + pitch beats 4 backend devs")
  const desiredSkills: TeammateSkill[] = [
    'Backend',
    'Frontend',
    'UI / UX Design',
    'Pitching & Business',
    'Mobile',
  ];

  const missingSkills = desiredSkills.filter((s) => !coveredSkills.has(s));

  const handleInviteCandidate = (candidate: TeammateProfile) => {
    addTeammateToWorkspace(workspaceId, candidate);
    setInvitedIds((prev) => [...prev, candidate.id]);
    toast.success(`${candidate.name} joined your team!`, {
      description: `Roster updated with ${candidate.skills.join(', ')} skills.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner - Complementary Skill Matching */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#FDFDFD] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-neutral-800">
              <Users className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-neutral-900 tracking-tight [text-wrap:balance]">
                  Teammate Finder & Gap Matching
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white text-neutral-700 font-mono font-semibold">
                  PRD §3.L
                </span>
              </div>
              <p className="text-xs text-neutral-500 [text-wrap:pretty]">
                Matches based on skill gaps. A team with a backend developer, a designer, and someone who can pitch beats four backend developers.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-semibold px-3 py-1 rounded-xl bg-white text-neutral-800">
              {teamMembers.length} / 4 Members
            </span>
          </div>
        </div>

        {/* Skill Gap Analysis Strip */}
        <div className="pt-2 p-4 rounded-xl bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-neutral-900 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 stroke-[2]" />
              <span>Team Skill Composition:</span>
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {Array.from(coveredSkills).map((s) => (
                <span key={s} className="text-[11px] font-medium bg-[#FDFDFD] text-emerald-800 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                  <Check className="w-3 h-3 stroke-[2.5]" />
                  <span>{s}</span>
                </span>
              ))}
            </div>
          </div>

          {missingSkills.length > 0 ? (
            <div className="text-xs text-neutral-600 sm:text-right space-y-1">
              <span className="text-rose-700 font-semibold block text-[11px]">Recommended Gap Hires:</span>
              <div className="flex items-center gap-1.5 sm:justify-end flex-wrap">
                {missingSkills.map((m) => (
                  <span key={m} className="text-[10px] font-semibold bg-rose-50 text-rose-800 px-2 py-0.5 rounded-md">
                    + {m}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-xs text-emerald-700 font-medium flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 stroke-[2]" />
              <span>Full multidisciplinary team coverage achieved!</span>
            </div>
          )}
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 pb-2">
        <button
          onClick={() => setActiveTab('available')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors active:scale-[0.97] ${
            activeTab === 'available'
              ? 'bg-neutral-900 text-white'
              : 'bg-[#FDFDFD] text-neutral-600 hover:text-neutral-900'
          }`}
        >
          Candidates Available ({candidates.length})
        </button>

        <button
          onClick={() => setActiveTab('my_team')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors active:scale-[0.97] ${
            activeTab === 'my_team'
              ? 'bg-neutral-900 text-white'
              : 'bg-[#FDFDFD] text-neutral-600 hover:text-neutral-900'
          }`}
        >
          Current Team Roster ({teamMembers.length})
        </button>
      </div>

      {/* Candidates List with Gap Matching Priority */}
      {activeTab === 'available' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {candidates.map((candidate) => {
            const fillsGap = candidate.skills.some((s) => missingSkills.includes(s));
            const isAlreadyOnTeam = teamMembers.some((m) => m.id === candidate.id) || invitedIds.includes(candidate.id);

            return (
              <div
                key={candidate.id}
                className="p-5 sm:p-6 rounded-2xl bg-[#FDFDFD] hover:bg-[#f9f9fa] transition-colors space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={candidate.avatarUrl}
                        alt={candidate.name}
                        className="w-12 h-12 rounded-xl object-cover"
                      />
                      <div>
                        <h4 className="text-sm font-bold text-neutral-900 [text-wrap:balance]">
                          {candidate.name}
                        </h4>
                        <p className="text-xs text-neutral-400 font-mono">
                          {candidate.handle}
                        </p>
                      </div>
                    </div>

                    {candidate.verifiedWins > 0 && (
                      <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-white text-amber-800 flex items-center gap-1">
                        <Trophy className="w-3 h-3 stroke-[2] text-amber-600" />
                        <span>{candidate.verifiedWins} Wins</span>
                      </span>
                    )}
                  </div>

                  <p className="text-xs font-medium text-neutral-800">
                    {candidate.primaryRole}
                  </p>

                  <p className="text-xs text-neutral-500 leading-relaxed [text-wrap:pretty]">
                    {candidate.bio}
                  </p>

                  {/* Skills tags */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    {candidate.skills.map((s) => {
                      const isNeeded = missingSkills.includes(s);
                      return (
                        <span
                          key={s}
                          className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${
                            isNeeded
                              ? 'bg-emerald-600 text-white'
                              : 'bg-white text-neutral-700'
                          }`}
                        >
                          {isNeeded ? `★ ${s}` : s}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Card Action */}
                <div className="pt-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-neutral-400">
                    {candidate.githubUrl && (
                      <a
                        href={candidate.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-neutral-900"
                      >
                        <Github className="w-4 h-4 stroke-[1.75]" />
                      </a>
                    )}
                    {candidate.portfolioUrl && (
                      <a
                        href={candidate.portfolioUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-neutral-900"
                      >
                        <ExternalLink className="w-4 h-4 stroke-[1.75]" />
                      </a>
                    )}
                  </div>

                  <button
                    onClick={() => handleInviteCandidate(candidate)}
                    disabled={isAlreadyOnTeam}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold active:scale-[0.97] transition-colors flex items-center gap-1.5 ${
                      isAlreadyOnTeam
                        ? 'bg-neutral-200 text-neutral-500 cursor-default'
                        : fillsGap
                        ? 'btn-tactile-primary text-white'
                        : 'bg-white hover:bg-neutral-100 text-neutral-800'
                    }`}
                  >
                    {isAlreadyOnTeam ? (
                      <>
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>On Team</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>{fillsGap ? 'Fill Team Gap' : 'Invite to Team'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Current Team Roster View */}
      {activeTab === 'my_team' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {teamMembers.map((member) => (
              <div
                key={member.id}
                className="p-5 rounded-2xl bg-[#FDFDFD] flex items-center gap-4"
              >
                <img
                  src={member.avatarUrl}
                  alt={member.name}
                  className="w-12 h-12 rounded-xl object-cover"
                />
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-neutral-900">
                    {member.name}
                  </h4>
                  <p className="text-xs text-neutral-500">{member.primaryRole}</p>
                  <div className="flex items-center gap-1 flex-wrap pt-0.5">
                    {member.skills.map((s) => (
                      <span key={s} className="text-[10px] bg-white text-neutral-600 px-2 py-0.5 rounded font-medium">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
