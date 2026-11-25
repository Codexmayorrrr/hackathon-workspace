import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Sparkles,
  Check,
  ExternalLink,
  Github,
  Trophy,
  ShieldCheck,
} from 'lucide-react';
import { TeammateProfile, TeammateSkill } from '../../types';
import { useWorkspaceStore } from '../../store/useWorkspaceStore';
import { Avatar } from '../ui/Avatar';
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
  const [activeTab, setActiveTab] = useState<'available' | 'my_team'>('available');
  const [candidates] = useState<TeammateProfile[]>(MOCK_CANDIDATES);
  const [invitedIds, setInvitedIds] = useState<string[]>([]);

  const coveredSkills = new Set<TeammateSkill>();
  teamMembers.forEach((m) => m.skills.forEach((s) => coveredSkills.add(s)));

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
    toast.success(`${candidate.name} joined your team`, {
      description: `Added ${candidate.skills.join(', ')} coverage.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="surface-card p-6 sm:p-8 rounded-2xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div
              aria-hidden="true"
              className="w-10 h-10 rounded-xl bg-[#EEF2FF] text-[#3730A3] flex items-center justify-center flex-shrink-0"
            >
              <Users className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#18181B] tracking-tight">
                Teammates & Skill Coverage
              </h2>
              <p className="text-xs sm:text-sm text-[#52525B] mt-0.5 max-w-[65ch]">
                Balance engineering, product design, and storytelling across your collaborator roster.
              </p>
            </div>
          </div>

          <span className="text-xs font-mono font-semibold px-3 py-1.5 rounded-xl bg-[#F4F4F6] text-[#18181B] self-start sm:self-auto flex-shrink-0">
            {teamMembers.length} / 4 Members
          </span>
        </div>

        {/* Skill Gap Analysis Strip */}
        <div className="p-4 rounded-xl bg-[#F4F4F6] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-[#18181B] flex items-center gap-2">
              <Sparkles aria-hidden="true" className="w-3.5 h-3.5 text-[#92400E] stroke-[2]" />
              <span>Covered team skills:</span>
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {Array.from(coveredSkills).map((s) => (
                <span
                  key={s}
                  className="text-xs font-medium bg-white shadow-border text-[#065F46] px-2.5 py-0.5 rounded-md flex items-center gap-1"
                >
                  <Check aria-hidden="true" className="w-3 h-3 stroke-[2.5]" />
                  <span>{s}</span>
                </span>
              ))}
            </div>
          </div>

          {missingSkills.length > 0 ? (
            <div className="text-xs sm:text-end space-y-1.5">
              <span className="text-rose-800 font-semibold block text-xs">Recommended additions:</span>
              <div className="flex items-center gap-1.5 sm:justify-end flex-wrap">
                {missingSkills.map((m) => (
                  <span key={m} className="text-[11px] font-semibold bg-rose-100 text-rose-900 px-2 py-0.5 rounded-md">
                    + {m}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-xs text-[#065F46] font-semibold flex items-center gap-1.5">
              <ShieldCheck aria-hidden="true" className="w-4 h-4 stroke-[2]" />
              <span>Full multidisciplinary coverage ready</span>
            </div>
          )}
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 flex-wrap" role="group" aria-label="Team roster view">
        <button
          type="button"
          onClick={() => setActiveTab('available')}
          aria-pressed={activeTab === 'available'}
          className={`px-4 py-2 rounded-xl text-xs font-semibold min-h-[38px] ${
            activeTab === 'available' ? 'btn-tactile-primary' : 'btn-tactile-secondary'
          }`}
        >
          Available candidates ({candidates.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('my_team')}
          aria-pressed={activeTab === 'my_team'}
          className={`px-4 py-2 rounded-xl text-xs font-semibold min-h-[38px] ${
            activeTab === 'my_team' ? 'btn-tactile-primary' : 'btn-tactile-secondary'
          }`}
        >
          Team roster ({teamMembers.length})
        </button>
      </div>

      {/* Candidates List */}
      {activeTab === 'available' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {candidates.map((candidate) => {
            const fillsGap = candidate.skills.some((s) => missingSkills.includes(s));
            const isAlreadyOnTeam =
              teamMembers.some((m) => m.id === candidate.id) || invitedIds.includes(candidate.id);

            return (
              <article
                key={candidate.id}
                className="surface-card surface-card-interactive p-5 sm:p-6 rounded-2xl space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar src={candidate.avatarUrl} name={candidate.name} />
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-[#18181B] truncate">
                          {candidate.name}
                        </h3>
                        <p className="text-xs text-[#63636B] font-mono truncate">
                          {candidate.handle}
                        </p>
                      </div>
                    </div>

                    {candidate.verifiedWins > 0 && (
                      <span className="text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-[#FEF3C7] text-[#92400E] flex items-center gap-1 flex-shrink-0">
                        <Trophy aria-hidden="true" className="w-3 h-3 stroke-[2]" />
                        <span>{candidate.verifiedWins} Wins</span>
                      </span>
                    )}
                  </div>

                  <p className="text-xs font-semibold text-[#18181B]">
                    {candidate.primaryRole}
                  </p>

                  <p className="text-xs text-[#52525B] leading-relaxed">
                    {candidate.bio}
                  </p>

                  {/* Skills tags */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    {candidate.skills.map((s) => {
                      const isNeeded = missingSkills.includes(s);
                      return (
                        <span
                          key={s}
                          className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-md ${
                            isNeeded
                              ? 'bg-[#047857] text-white'
                              : 'bg-[#F4F4F6] text-[#52525B]'
                          }`}
                        >
                          {isNeeded ? `Gap Match: ${s}` : s}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Card Action */}
                <div className="pt-3 flex items-center justify-between gap-3 border-t border-neutral-200/70">
                  <div className="flex items-center gap-1.5">
                    {candidate.githubUrl && (
                      <a
                        href={candidate.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`${candidate.name} on GitHub`}
                        title={`${candidate.name} on GitHub`}
                        className="w-9 h-9 rounded-lg btn-tactile-ghost flex items-center justify-center"
                      >
                        <Github aria-hidden="true" className="w-4 h-4 stroke-[1.75]" />
                      </a>
                    )}
                    {candidate.portfolioUrl && (
                      <a
                        href={candidate.portfolioUrl}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`${candidate.name} portfolio`}
                        title={`${candidate.name} portfolio`}
                        className="w-9 h-9 rounded-lg btn-tactile-ghost flex items-center justify-center"
                      >
                        <ExternalLink aria-hidden="true" className="w-4 h-4 stroke-[1.75]" />
                      </a>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleInviteCandidate(candidate)}
                    disabled={isAlreadyOnTeam}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 min-h-[38px] ${
                      isAlreadyOnTeam
                        ? 'bg-[#F4F4F6] text-[#52525B] cursor-default'
                        : fillsGap
                        ? 'btn-tactile-primary'
                        : 'btn-tactile-secondary'
                    }`}
                  >
                    {isAlreadyOnTeam ? (
                      <>
                        <Check aria-hidden="true" className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>On team</span>
                      </>
                    ) : (
                      <>
                        <UserPlus aria-hidden="true" className="w-3.5 h-3.5 stroke-[2]" />
                        <span>{fillsGap ? 'Fill team gap' : 'Invite to team'}</span>
                      </>
                    )}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Current Team Roster View */}
      {activeTab === 'my_team' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {teamMembers.map((member) => (
            <div key={member.id} className="surface-card p-5 rounded-2xl flex items-center gap-4">
              <Avatar src={member.avatarUrl} name={member.name} />
              <div className="space-y-1 min-w-0">
                <h3 className="text-sm font-bold text-[#18181B] truncate">
                  {member.name}
                </h3>
                <p className="text-xs text-[#52525B] truncate">{member.primaryRole}</p>
                <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                  {member.skills.map((s) => (
                    <span
                      key={s}
                      className="text-[11px] bg-[#F4F4F6] text-[#52525B] px-2 py-0.5 rounded-md font-medium"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
