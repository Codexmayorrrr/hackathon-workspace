import React, { useState } from 'react';
import { 
  Users, 
  HeartHandshake, 
  Trophy, 
  Lightbulb, 
  ExternalLink, 
  Linkedin, 
  Twitter, 
  Github 
} from 'lucide-react';
import { Opportunity } from '../../types';

interface IntelSectionProps {
  opportunity: Opportunity;
  highlightedJudgeId?: string | null;
}

export const IntelSection: React.FC<IntelSectionProps> = ({
  opportunity,
  highlightedJudgeId,
}) => {
  const [intelSubTab, setIntelSubTab] = useState<'all' | 'judges' | 'sponsors' | 'winners' | 'theme'>('all');
  const [winnerEditionFilter, setWinnerEditionFilter] = useState('all');
  const [searchQuery] = useState('');

  const hasJudges = opportunity.judges.length > 0;
  const hasSponsors = opportunity.sponsors.length > 0;
  const hasPastWinners = opportunity.pastWinners.length > 0;
  const hasThemeContext = Boolean(opportunity.themeContext);

  const filteredJudges = opportunity.judges.filter((j) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      j.name.toLowerCase().includes(q) ||
      j.role.toLowerCase().includes(q) ||
      j.company.toLowerCase().includes(q) ||
      j.bio.toLowerCase().includes(q)
    );
  });

  const filteredWinners = opportunity.pastWinners.filter((w) => {
    const matchesFilter = winnerEditionFilter === 'all' || w.edition === winnerEditionFilter;
    if (!matchesFilter) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      w.projectName.toLowerCase().includes(q) ||
      w.teamName.toLowerCase().includes(q) ||
      w.problemSolved.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 sm:space-y-8 pb-10">
      {/* Section Header */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#FDFDFD] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-lg sm:text-xl font-bold text-neutral-900 tracking-tight">
              Opportunity Intelligence & Research
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 max-w-2xl leading-relaxed" style={{ textWrap: 'pretty' }}>
              Deep background on judging criteria, sponsor bounties, overlap opportunities, and past winning benchmarks.
            </p>
          </div>

          {/* Sub-navigation Filter Pills */}
          <div className="flex items-center gap-1 bg-[#F5F5F5] p-1 rounded-xl flex-wrap">
            {[
              { id: 'all', label: 'All Intel' },
              ...(hasJudges ? [{ id: 'judges', label: `Judges (${opportunity.judges.length})` }] : []),
              ...(hasSponsors ? [{ id: 'sponsors', label: `Sponsors (${opportunity.sponsors.length})` }] : []),
              ...(hasPastWinners ? [{ id: 'winners', label: `Past Winners (${opportunity.pastWinners.length})` }] : []),
              ...(hasThemeContext ? [{ id: 'theme', label: 'Theme & Criteria' }] : []),
            ].map((tab) => {
              const isSelected = intelSubTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setIntelSubTab(tab.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors active:scale-[0.97] ${
                    isSelected
                      ? 'bg-white text-neutral-950 font-semibold'
                      : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* THEME & CRITERIA BLOCK */}
      {(intelSubTab === 'all' || intelSubTab === 'theme') && hasThemeContext && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-neutral-600 stroke-[1.75]" />
            <h3 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider">
              Theme & Problem Statement
            </h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 p-6 rounded-2xl bg-[#FDFDFD] space-y-3">
              <h4 className="text-sm font-semibold text-neutral-950">
                {opportunity.themeContext.theme}
              </h4>
              <div className="space-y-2">
                <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                  Target Problem Statements
                </p>
                <ul className="space-y-2 text-xs text-neutral-600 leading-relaxed">
                  {opportunity.themeContext.problemStatements.map((prob, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-neutral-900 mt-1.5 flex-shrink-0" />
                      <span>{prob}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#FDFDFD] space-y-3">
              <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                Evaluation Weights
              </p>
              <div className="space-y-2.5">
                {opportunity.themeContext.judgingCriteria.map((crit, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-[#F5F5F5] space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-neutral-900">{crit.name}</span>
                      <span className="font-mono font-bold text-neutral-950 tabular-nums">{crit.weight}</span>
                    </div>
                    <p className="text-[11px] text-neutral-500 leading-snug">{crit.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* JUDGES BLOCK */}
      {(intelSubTab === 'all' || intelSubTab === 'judges') && hasJudges && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-neutral-600 stroke-[1.75]" />
              <h3 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider">
                Judges & Evaluators ({opportunity.judges.length})
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredJudges.map((judge) => {
              const isHighlighted = highlightedJudgeId === judge.id;
              const matchingSponsor = opportunity.sponsors.find((s) => s.id === judge.sponsorId);

              return (
                <div
                  key={judge.id}
                  id={`judge-${judge.id}`}
                  className={`p-6 rounded-2xl bg-[#FDFDFD] flex flex-col justify-between transition-colors space-y-4 ${
                    isHighlighted ? 'ring-2 ring-neutral-900' : 'hover:bg-[#F8F8FA]'
                  }`}
                >
                  <div className="space-y-3.5">
                    <div className="flex items-start gap-3.5">
                      <img
                        src={judge.avatarUrl}
                        alt={judge.name}
                        className="w-12 h-12 rounded-xl object-cover bg-neutral-100 flex-shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-semibold text-neutral-950 truncate">{judge.name}</h4>
                        <p className="text-xs text-neutral-500 truncate">{judge.role}</p>
                        <p className="text-xs font-medium text-neutral-800 truncate">{judge.company}</p>
                      </div>
                    </div>

                    {matchingSponsor && (
                      <div className="px-2.5 py-1.5 rounded-lg bg-neutral-100 text-[11px] flex items-center justify-between">
                        <span className="text-neutral-500">Representative for:</span>
                        <span className="font-semibold text-neutral-900">{matchingSponsor.name}</span>
                      </div>
                    )}

                    <p className="text-xs text-neutral-600 line-clamp-3 leading-relaxed" style={{ textWrap: 'pretty' }}>
                      {judge.bio}
                    </p>

                    {judge.notableProducts.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-[10px] uppercase font-semibold text-neutral-400 tracking-wider">Notable Work</p>
                        <div className="flex flex-wrap gap-1">
                          {judge.notableProducts.map((p, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded bg-[#F5F5F5] text-[10px] text-neutral-700">
                              {p}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-neutral-100">
                    {judge.socials.linkedin && (
                      <a
                        href={judge.socials.linkedin}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 hover:bg-[#F5F5F5] transition-colors"
                      >
                        <Linkedin className="w-3.5 h-3.5 stroke-[1.75]" />
                      </a>
                    )}
                    {judge.socials.twitter && (
                      <a
                        href={judge.socials.twitter}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 hover:bg-[#F5F5F5] transition-colors"
                      >
                        <Twitter className="w-3.5 h-3.5 stroke-[1.75]" />
                      </a>
                    )}
                    {judge.socials.github && (
                      <a
                        href={judge.socials.github}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 hover:bg-[#F5F5F5] transition-colors"
                      >
                        <Github className="w-3.5 h-3.5 stroke-[1.75]" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SPONSORS BLOCK */}
      {(intelSubTab === 'all' || intelSubTab === 'sponsors') && hasSponsors && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <HeartHandshake className="w-4 h-4 text-neutral-600 stroke-[1.75]" />
            <h3 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider">
              Sponsor Tracks & Bounties ({opportunity.sponsors.length})
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {opportunity.sponsors.map((sponsor) => (
              <div key={sponsor.id} className="p-6 rounded-2xl bg-[#FDFDFD] space-y-3.5 flex flex-col justify-between">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-neutral-950">{sponsor.name}</span>
                    <span className="px-2 py-0.5 rounded bg-neutral-100 text-[10px] font-semibold text-neutral-700">
                      {sponsor.tier}
                    </span>
                  </div>

                  <h4 className="text-sm font-semibold text-neutral-900">{sponsor.bountyTitle}</h4>
                  <p className="text-xs text-neutral-500 leading-relaxed" style={{ textWrap: 'pretty' }}>
                    {sponsor.bountyDescription}
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-neutral-100">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-400">Prize Pool:</span>
                    <span className="font-mono font-bold text-neutral-950 tabular-nums">{sponsor.prizePool}</span>
                  </div>
                  {sponsor.recommendedTech && (
                    <div className="flex flex-wrap gap-1">
                      {sponsor.recommendedTech.map((tech, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-[#F5F5F5] text-[10px] font-mono text-neutral-600">
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PAST WINNERS BLOCK */}
      {(intelSubTab === 'all' || intelSubTab === 'winners') && hasPastWinners && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-neutral-600 stroke-[1.75]" />
              <h3 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider">
                Past Winning Benchmarks ({opportunity.pastWinners.length})
              </h3>
            </div>

            <div className="flex items-center gap-1.5 text-xs">
              {['all', '2025', '2024'].map((ed) => (
                <button
                  key={ed}
                  onClick={() => setWinnerEditionFilter(ed)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                    winnerEditionFilter === ed
                      ? 'bg-neutral-900 text-white font-semibold'
                      : 'text-neutral-500 hover:text-neutral-900 hover:bg-[#F5F5F5]'
                  }`}
                >
                  {ed === 'all' ? 'All Editions' : ed}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredWinners.map((winner) => (
              <div key={winner.id} className="p-6 rounded-2xl bg-[#FDFDFD] space-y-3.5 flex flex-col justify-between">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-[11px] text-neutral-400">{winner.edition}</span>
                    <span className="font-mono font-bold text-neutral-950 tabular-nums text-xs">{winner.prizeWon}</span>
                  </div>

                  <h4 className="text-base font-semibold text-neutral-950">{winner.projectName}</h4>
                  <p className="text-xs text-neutral-500 font-medium">By {winner.teamName}</p>

                  <p className="text-xs text-neutral-600 leading-relaxed" style={{ textWrap: 'pretty' }}>
                    {winner.problemSolved}
                  </p>

                  {winner.whyTheyWon && (
                    <div className="p-3 rounded-xl bg-[#F5F5F5] text-xs space-y-1">
                      <span className="font-semibold text-neutral-800 text-[11px] uppercase tracking-wider">Why they won:</span>
                      <p className="text-neutral-600 text-[11px] leading-snug">{winner.whyTheyWon}</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-neutral-100">
                  {winner.demoUrl && (
                    <a
                      href={winner.demoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-neutral-600 hover:text-neutral-950 inline-flex items-center gap-1 font-medium"
                    >
                      <span>Demo</span>
                      <ExternalLink className="w-3 h-3 stroke-[1.75]" />
                    </a>
                  )}
                  {winner.repoUrl && (
                    <a
                      href={winner.repoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-neutral-600 hover:text-neutral-950 inline-flex items-center gap-1 font-medium"
                    >
                      <Github className="w-3 h-3 stroke-[1.75]" />
                      <span>Code</span>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
