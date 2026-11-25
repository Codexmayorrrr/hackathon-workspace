import React, { useState } from 'react';
import {
  Trophy,
  Sparkles,
  Github,
  Twitter,
  Linkedin,
  ExternalLink,
  Search,
} from 'lucide-react';
import { Avatar } from '../components/ui/Avatar';

interface WinnerProfile {
  id: string;
  name: string;
  handle: string;
  role: string;
  avatarUrl: string;
  totalPrizesWon: string;
  verifiedWinsCount: number;
  featuredProject: {
    name: string;
    hackathonName: string;
    prizeWon: string;
    year: string;
    problemSolved: string;
    whyTheyWon: string;
    repoUrl?: string;
    demoUrl?: string;
  };
  socials: {
    twitter?: string;
    github?: string;
    linkedin?: string;
  };
}

const MOCK_WINNERS: WinnerProfile[] = [
  {
    id: 'winner-1',
    name: 'Tobi Daniels',
    handle: '@tobidaniels',
    role: 'Rust & Distributed Systems Engineer',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    totalPrizesWon: '$45,000 USD',
    verifiedWinsCount: 3,
    featuredProject: {
      name: 'AfriFlow Protocol',
      hackathonName: 'Lagos FinTech & Stablecoin Buildathon 2025',
      prizeWon: '$20,000 Grand Prize Winner',
      year: '2025',
      problemSolved: 'Automated stablecoin liquidity rebalancing across 5 fragmented West African fiat currency exchanges.',
      whyTheyWon: 'Judges praised the clean Rust smart contract architecture and live testnet demonstration with real simulated mobile transfers.',
      repoUrl: 'https://github.com/afriflow/core-contracts',
      demoUrl: 'https://youtube.com',
    },
    socials: {
      twitter: 'https://x.com/tobidaniels',
      github: 'https://github.com/tobidaniels',
      linkedin: 'https://linkedin.com',
    },
  },
  {
    id: 'winner-2',
    name: 'Zainab Balogun',
    handle: '@zainab_ux',
    role: 'Lead Interaction & Product Designer',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    totalPrizesWon: '$38,000 USD',
    verifiedWinsCount: 4,
    featuredProject: {
      name: 'KudiSettle USSD',
      hackathonName: 'Paystack Emerging Markets Hackathon',
      prizeWon: '$15,000 Title Track Winner',
      year: '2025',
      problemSolved: 'USSD-based stablecoin remittance app for non-internet feature phones with automated SMS receipts.',
      whyTheyWon: 'Observed real physical market friction in open markets where internet fails; designed for zero-smartphone onboarding.',
      demoUrl: 'https://youtube.com',
    },
    socials: {
      twitter: 'https://x.com/zainab_ux',
      linkedin: 'https://linkedin.com',
    },
  },
  {
    id: 'winner-3',
    name: 'Amara Diallo',
    handle: '@amara_pitch',
    role: 'Fintech Founder & Narrative Architect',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    totalPrizesWon: '$52,000 USD',
    verifiedWinsCount: 5,
    featuredProject: {
      name: 'SwitchPay Escrow',
      hackathonName: 'ETHSafari Nairobi 2024',
      prizeWon: '$18,000 1st Prize DeFi Track',
      year: '2024',
      problemSolved: 'Decentralized escrow protocol for cross-border goods procurement between African importers and overseas suppliers.',
      whyTheyWon: 'Masterclass pitch delivery: timed perfectly to 180 seconds with undeniable customer letters of intent.',
      repoUrl: 'https://github.com/switchpay/escrow',
      demoUrl: 'https://youtube.com',
    },
    socials: {
      twitter: 'https://x.com/amara_pitch',
      github: 'https://github.com',
    },
  },
];

export const WinnersLeaderboardPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredWinners = MOCK_WINNERS.filter(
    (w) =>
      w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.featuredProject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 sm:space-y-10 pb-20 min-w-0">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#18181B] tracking-tight">
            Winners & Talent Discovery
          </h1>
          <p className="text-sm text-[#52525B] leading-relaxed max-w-[65ch]">
            Verified profiles of hackathon winners, their core architectures, and judge teardowns of why they won.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64 flex-shrink-0">
          <label htmlFor="winners-search" className="sr-only">
            Search winners, roles, or winning projects
          </label>
          <Search aria-hidden="true" className="absolute start-3.5 top-2.5 w-4 h-4 text-[#63636B] stroke-[1.75] pointer-events-none" />
          <input
            id="winners-search"
            type="search"
            enterKeyHint="search"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            placeholder="Search winners, projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="field-surface w-full rounded-xl ps-9 pe-3.5 py-2 text-base sm:text-[13px]"
          />
        </div>
      </div>

      {/* Empty Search State */}
      {filteredWinners.length === 0 ? (
        <div className="surface-card p-10 rounded-2xl text-center space-y-3">
          <p className="text-sm font-semibold text-[#18181B]">
            No results for “{searchQuery}”
          </p>
          <p className="text-xs text-[#52525B]">
            Try searching by engineer name, role, or project title.
          </p>
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="btn-tactile-secondary px-4 py-2 rounded-xl text-xs font-medium"
          >
            Clear filter
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredWinners.map((winner) => (
            <article
              key={winner.id}
              className="surface-card surface-card-interactive p-6 sm:p-7 rounded-2xl space-y-5"
            >
              {/* Top Profile Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-start gap-4 min-w-0">
                  <Avatar src={winner.avatarUrl} name={winner.name} />
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-base font-semibold text-[#18181B]">
                        {winner.name}
                      </h2>
                      <span className="text-xs text-[#63636B] font-mono">
                        {winner.handle}
                      </span>
                      <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md bg-[#EFE6FF] text-[#3B0764]">
                        {winner.verifiedWinsCount} Wins
                      </span>
                    </div>

                    <p className="text-[13px] text-[#52525B] font-medium">
                      {winner.role}
                    </p>
                  </div>
                </div>

                {/* Prize Pool Badge & Socials */}
                <div className="flex items-center gap-4 self-start sm:self-auto flex-shrink-0">
                  <div className="text-start sm:text-end">
                    <span className="text-xs text-[#63636B] font-medium block">
                      Total earnings
                    </span>
                    <span className="text-sm font-semibold text-[#18181B] font-mono tabular-nums">
                      {winner.totalPrizesWon}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {winner.socials.twitter && (
                      <a
                        href={winner.socials.twitter}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`${winner.name} on X (Twitter)`}
                        title={`${winner.name} on X (Twitter)`}
                        className="w-9 h-9 rounded-lg text-[#52525B] hover:text-[#18181B] btn-tactile-ghost flex items-center justify-center"
                      >
                        <Twitter aria-hidden="true" className="w-4 h-4 stroke-[1.75]" />
                      </a>
                    )}
                    {winner.socials.github && (
                      <a
                        href={winner.socials.github}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`${winner.name} on GitHub`}
                        title={`${winner.name} on GitHub`}
                        className="w-9 h-9 rounded-lg text-[#52525B] hover:text-[#18181B] btn-tactile-ghost flex items-center justify-center"
                      >
                        <Github aria-hidden="true" className="w-4 h-4 stroke-[1.75]" />
                      </a>
                    )}
                    {winner.socials.linkedin && (
                      <a
                        href={winner.socials.linkedin}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`${winner.name} on LinkedIn`}
                        title={`${winner.name} on LinkedIn`}
                        className="w-9 h-9 rounded-lg text-[#52525B] hover:text-[#18181B] btn-tactile-ghost flex items-center justify-center"
                      >
                        <Linkedin aria-hidden="true" className="w-4 h-4 stroke-[1.75]" />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Featured Winning Project Section */}
              <div className="pt-2 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                  <h3 className="text-sm font-semibold text-[#18181B] flex items-center gap-2 flex-wrap">
                    <Trophy aria-hidden="true" className="w-4 h-4 text-[#52525B] stroke-[1.75]" />
                    <span>{winner.featuredProject.name}</span>
                    <span className="text-xs font-normal text-[#63636B]">
                      · {winner.featuredProject.hackathonName} ({winner.featuredProject.year})
                    </span>
                  </h3>

                  <span className="text-xs font-mono font-semibold text-[#065F46] bg-[#ECFDF5] px-2.5 py-0.5 rounded-md tabular-nums self-start sm:self-auto">
                    {winner.featuredProject.prizeWon}
                  </span>
                </div>

                <p className="text-[13px] text-[#52525B] leading-relaxed max-w-[65ch]">
                  <strong className="text-[#18181B] font-semibold">Problem solved:</strong>{' '}
                  {winner.featuredProject.problemSolved}
                </p>

                {/* Why They Won Breakdown */}
                <div className="p-4 rounded-xl bg-[#F4F4F6] text-[13px] space-y-1">
                  <span className="font-semibold text-[#18181B] flex items-center gap-1.5 text-xs">
                    <Sparkles aria-hidden="true" className="w-3.5 h-3.5 text-[#52525B] stroke-[2]" />
                    <span>Why they won:</span>
                  </span>
                  <p className="text-[#52525B] leading-relaxed">
                    “{winner.featuredProject.whyTheyWon}”
                  </p>
                </div>

                {/* Links */}
                <div className="flex items-center gap-4 pt-1 text-xs">
                  {winner.featuredProject.repoUrl && (
                    <a
                      href={winner.featuredProject.repoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#52525B] hover:text-[#18181B] font-mono font-medium inline-flex items-center gap-1.5 transition-colors py-1"
                    >
                      <Github aria-hidden="true" className="w-3.5 h-3.5 stroke-[1.75]" />
                      <span>View repo</span>
                    </a>
                  )}
                  {winner.featuredProject.demoUrl && (
                    <a
                      href={winner.featuredProject.demoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#52525B] hover:text-[#18181B] font-mono font-medium inline-flex items-center gap-1.5 transition-colors py-1"
                    >
                      <ExternalLink aria-hidden="true" className="w-3.5 h-3.5 stroke-[1.75]" />
                      <span>Demo walkthrough</span>
                    </a>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};
