import React, { useState } from 'react';
import { 
  Trophy, 
  Sparkles, 
  Github, 
  Twitter, 
  Linkedin, 
  ExternalLink, 
  Search
} from 'lucide-react';

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

  const filteredWinners = MOCK_WINNERS.filter((w) =>
    w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.featuredProject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 sm:space-y-10 pb-20 bg-white">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-1">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-semibold text-neutral-950 tracking-tight" style={{ textWrap: 'balance' }}>
            Winners & Talent Discovery
          </h1>
          <p className="text-sm text-neutral-500 leading-relaxed max-w-xl" style={{ textWrap: 'pretty' }}>
            Verified profiles of hackathon winners, their core architectures, and judge teardowns of why they won.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-60">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-neutral-400 stroke-[1.75]" />
          <input
            type="text"
            placeholder="Search winners, tech..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#F5F5F5] rounded-lg pl-9 pr-3.5 py-2 text-xs text-neutral-900 focus:outline-none placeholder:text-neutral-400 border-0"
          />
        </div>
      </div>

      {/* Winner Cards List */}
      <div className="space-y-6">
        {filteredWinners.map((winner) => (
          <div
            key={winner.id}
            className="p-6 sm:p-7 rounded-2xl bg-[#FDFDFD] hover:bg-[#F8F8FA] transition-colors space-y-5"
          >
            {/* Top Profile Header */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <img
                  src={winner.avatarUrl}
                  alt={winner.name}
                  className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-semibold text-neutral-950" style={{ textWrap: 'balance' }}>
                      {winner.name}
                    </h3>
                    <span className="text-xs text-neutral-400 font-mono">
                      {winner.handle}
                    </span>
                    <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-[#F5F5F5] text-neutral-700">
                      {winner.verifiedWinsCount} Wins
                    </span>
                  </div>

                  <p className="text-xs text-neutral-500 font-medium">
                    {winner.role}
                  </p>
                </div>
              </div>

              {/* Prize Pool Badge & Socials */}
              <div className="flex items-center gap-4 self-start sm:self-auto">
                <div className="text-left sm:text-right">
                  <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold block">Total Earnings</span>
                  <span className="text-sm font-semibold text-neutral-950 font-mono tabular-nums">
                    {winner.totalPrizesWon}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  {winner.socials.twitter && (
                    <a
                      href={winner.socials.twitter}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-lg text-neutral-400 hover:text-neutral-900 hover:bg-[#F5F5F5] active:scale-[0.97] transition-colors"
                      title="Twitter / X"
                    >
                      <Twitter className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {winner.socials.github && (
                    <a
                      href={winner.socials.github}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-lg text-neutral-400 hover:text-neutral-900 hover:bg-[#F5F5F5] active:scale-[0.97] transition-colors"
                      title="GitHub"
                    >
                      <Github className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {winner.socials.linkedin && (
                    <a
                      href={winner.socials.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-lg text-neutral-400 hover:text-neutral-900 hover:bg-[#F5F5F5] active:scale-[0.97] transition-colors"
                      title="LinkedIn"
                    >
                      <Linkedin className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Featured Winning Project Section */}
            <div className="pt-2 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                <div>
                  <h4 className="text-sm font-semibold text-neutral-900 flex items-center gap-2">
                    <Trophy className="w-3.5 h-3.5 text-neutral-500 stroke-[1.75]" />
                    <span>{winner.featuredProject.name}</span>
                    <span className="text-xs font-normal text-neutral-400">· {winner.featuredProject.hackathonName} ({winner.featuredProject.year})</span>
                  </h4>
                </div>

                <span className="text-xs font-mono font-semibold text-neutral-900 tabular-nums self-start sm:self-auto">
                  {winner.featuredProject.prizeWon}
                </span>
              </div>

              <p className="text-xs text-neutral-600 leading-relaxed" style={{ textWrap: 'pretty' }}>
                <strong className="text-neutral-900 font-medium">Problem Solved:</strong> {winner.featuredProject.problemSolved}
              </p>

              {/* Why They Won Breakdown */}
              <div className="p-3.5 rounded-lg bg-[#F5F5F5] text-xs space-y-1">
                <span className="font-semibold text-neutral-900 flex items-center gap-1.5 text-[11px]">
                  <Sparkles className="w-3 h-3 text-neutral-600 stroke-[2]" />
                  <span>Why They Won:</span>
                </span>
                <p className="text-neutral-600 leading-relaxed" style={{ textWrap: 'pretty' }}>
                  "{winner.featuredProject.whyTheyWon}"
                </p>
              </div>

              {/* Links */}
              <div className="flex items-center gap-4 pt-1 text-xs">
                {winner.featuredProject.repoUrl && (
                  <a
                    href={winner.featuredProject.repoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-neutral-600 hover:text-neutral-950 font-mono inline-flex items-center gap-1.5 transition-colors"
                  >
                    <Github className="w-3.5 h-3.5" />
                    <span>View Repo</span>
                  </a>
                )}
                {winner.featuredProject.demoUrl && (
                  <a
                    href={winner.featuredProject.demoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-neutral-600 hover:text-neutral-950 font-mono inline-flex items-center gap-1.5 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Demo Walkthrough</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
