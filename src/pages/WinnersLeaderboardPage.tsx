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
    <div className="space-y-10 sm:space-y-12 pb-20 bg-white">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-900 tracking-tight [text-wrap:balance]">
              Winners & Talent Discovery
            </h1>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#FDFDFD] text-amber-800 font-semibold font-mono">
              PRD §3.J Bragging Rights
            </span>
          </div>
          <p className="text-xs sm:text-sm text-neutral-500 [text-wrap:pretty] max-w-2xl">
            Winning a hackathon is a bragging right. Verified profiles of builders, their winning architectures, and analyses of why they won.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-neutral-400 stroke-[1.75]" />
          <input
            type="text"
            placeholder="Search winners, tech..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#FDFDFD] rounded-xl pl-10 pr-3.5 py-2 text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 border-0"
          />
        </div>
      </div>

      {/* Winner Cards List */}
      <div className="space-y-6">
        {filteredWinners.map((winner) => (
          <div
            key={winner.id}
            className="p-6 sm:p-8 rounded-2xl bg-[#FDFDFD] hover:bg-[#f9f9fa] transition-colors space-y-6"
          >
            {/* Top Profile Header */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <img
                  src={winner.avatarUrl}
                  alt={winner.name}
                  className="w-14 h-14 rounded-2xl object-cover"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base sm:text-lg font-bold text-neutral-900 [text-wrap:balance]">
                      {winner.name}
                    </h3>
                    <span className="text-xs text-neutral-400 font-mono">
                      {winner.handle}
                    </span>
                    <span className="text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-white text-emerald-800">
                      {winner.verifiedWinsCount} Verified Wins
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-neutral-600 font-medium">
                    {winner.role}
                  </p>
                </div>
              </div>

              {/* Prize Pool Badge & Socials */}
              <div className="flex items-center gap-3 self-start sm:self-auto">
                <div className="text-right">
                  <span className="text-[11px] text-neutral-400 font-medium block">Total Prize Earnings</span>
                  <span className="text-base font-extrabold text-neutral-900 font-mono tabular-nums">
                    {winner.totalPrizesWon}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 pl-3">
                  {winner.socials.twitter && (
                    <a
                      href={winner.socials.twitter}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-xl bg-white hover:bg-neutral-100 text-neutral-600 hover:text-neutral-900 active:scale-[0.97]"
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
                      className="p-2 rounded-xl bg-white hover:bg-neutral-100 text-neutral-600 hover:text-neutral-900 active:scale-[0.97]"
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
                      className="p-2 rounded-xl bg-white hover:bg-neutral-100 text-neutral-600 hover:text-neutral-900 active:scale-[0.97]"
                      title="LinkedIn"
                    >
                      <Linkedin className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Featured Winning Project Showcase */}
            <div className="p-5 sm:p-6 rounded-xl bg-white space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#FDFDFD] flex items-center justify-center text-amber-600 font-bold text-xs">
                    <Trophy className="w-4 h-4 stroke-[1.75]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-neutral-900">
                      {winner.featuredProject.name}
                    </h4>
                    <p className="text-xs text-neutral-500">
                      {winner.featuredProject.hackathonName} · {winner.featuredProject.year}
                    </p>
                  </div>
                </div>

                <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full self-start sm:self-auto">
                  {winner.featuredProject.prizeWon}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed [text-wrap:pretty]">
                <strong className="text-neutral-900">Problem Solved:</strong> {winner.featuredProject.problemSolved}
              </p>

              {/* Why They Won Breakdown (Abimbola's critical requirement) */}
              <div className="p-3.5 rounded-lg bg-[#FDFDFD] text-xs space-y-1">
                <span className="font-semibold text-neutral-900 block flex items-center gap-1.5 text-[11px]">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600 stroke-[2]" />
                  <span>Why They Won (Judge & Organizer Feedback):</span>
                </span>
                <p className="text-neutral-600 italic [text-wrap:pretty]">
                  "{winner.featuredProject.whyTheyWon}"
                </p>
              </div>

              {/* Links */}
              <div className="flex items-center gap-3 pt-1 text-xs">
                {winner.featuredProject.repoUrl && (
                  <a
                    href={winner.featuredProject.repoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-neutral-700 hover:text-neutral-900 font-mono inline-flex items-center gap-1.5 hover:underline"
                  >
                    <Github className="w-3.5 h-3.5" />
                    <span>View Winning Repo</span>
                  </a>
                )}
                {winner.featuredProject.demoUrl && (
                  <a
                    href={winner.featuredProject.demoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-neutral-700 hover:text-neutral-900 font-mono inline-flex items-center gap-1.5 hover:underline"
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
