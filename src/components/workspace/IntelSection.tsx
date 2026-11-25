import React, { useState } from 'react';
import {
  Users,
  HeartHandshake,
  Trophy,
  Lightbulb,
  ExternalLink,
  Linkedin,
  Twitter,
  Github,
} from 'lucide-react';
import { Opportunity } from '../../types';
import { Avatar } from '../ui/Avatar';

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
  const [expandedBios, setExpandedBios] = useState<Record<string, boolean>>({});

  const hasJudges = opportunity.judges.length > 0;
  const hasSponsors = opportunity.sponsors.length > 0;
  const hasPastWinners = opportunity.pastWinners.length > 0;
  const hasThemeContext = Boolean(opportunity.themeContext);

  const filteredJudges = opportunity.judges;
  const filteredWinners = opportunity.pastWinners.filter(
    (w) => winnerEditionFilter === 'all' || w.edition === winnerEditionFilter
  );

  const toggleBio = (id: string) => {
    setExpandedBios((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-10">
      {/* Section Header */}
      <div className="surface-card p-6 sm:p-8 rounded-2xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-lg sm:text-xl font-bold text-[#18181B] tracking-tight">
              Opportunity Intel & Research
            </h2>
            <p className="text-xs sm:text-sm text-[#52525B] max-w-[65ch] leading-relaxed">
              Evaluator profiles, weighted scoring criteria, sponsor bounties, and historical winning benchmarks.
            </p>
          </div>

          {/* Sub-navigation Filter Pills */}
          <div className="flex items-center gap-1 bg-[#F4F4F6] p-1 rounded-xl flex-wrap self-start lg:self-auto" role="group" aria-label="Filter intel section">
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
                  type="button"
                  key={tab.id}
                  onClick={() => setIntelSubTab(tab.id as any)}
                  aria-pressed={isSelected}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-[transform,background-color,color] duration-150 active:scale-[0.96] min-h-[32px] ${
                    isSelected
                      ? 'bg-white text-[#18181B] font-semibold'
                      : 'text-[#52525B] hover:text-[#18181B]'
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
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Lightbulb aria-hidden="true" className="w-4 h-4 text-[#52525B] stroke-[2]" />
            <h3 className="text-base font-semibold text-[#18181B]">
              Theme & Problem Statement
            </h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 surface-card p-6 rounded-2xl space-y-3.5">
              <h4 className="text-sm sm:text-base font-semibold text-[#18181B]">
                {opportunity.themeContext.theme}
              </h4>
              <div className="space-y-2.5">
                <p className="text-xs font-medium text-[#63636B]">
                  Target Problem Statements
                </p>
                <ul className="space-y-2.5 text-[13px] text-[#52525B] leading-relaxed">
                  {opportunity.themeContext.problemStatements.map((prob, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full bg-[#18181B] mt-2 flex-shrink-0" />
                      <span>{prob}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="surface-card p-6 rounded-2xl space-y-3">
              <p className="text-xs font-medium text-[#63636B]">
                Evaluation Weights
              </p>
              <div className="space-y-2.5">
                {opportunity.themeContext.judgingCriteria.map((crit, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-[#F4F4F6] space-y-1">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="font-semibold text-[#18181B]">{crit.name}</span>
                      <span className="font-mono font-bold text-[#18181B] tabular-nums">{crit.weight}</span>
                    </div>
                    <p className="text-xs text-[#52525B] leading-snug">{crit.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* JUDGES BLOCK */}
      {(intelSubTab === 'all' || intelSubTab === 'judges') && hasJudges && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Users aria-hidden="true" className="w-4 h-4 text-[#52525B] stroke-[2]" />
            <h3 className="text-base font-semibold text-[#18181B]">
              Judges & Evaluators ({opportunity.judges.length})
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredJudges.map((judge) => {
              const isHighlighted = highlightedJudgeId === judge.id;
              const matchingSponsor = opportunity.sponsors.find((s) => s.id === judge.sponsorId);
              const isBioExpanded = Boolean(expandedBios[judge.id]);
              const isLongBio = judge.bio.length > 110;

              return (
                <article
                  key={judge.id}
                  id={`judge-${judge.id}`}
                  className={`p-6 rounded-2xl flex flex-col justify-between space-y-4 transition-colors duration-150 ${
                    isHighlighted ? 'bg-[#F4EEFF]' : 'surface-card surface-card-interactive'
                  }`}
                >
                  <div className="space-y-3.5">
                    <div className="flex items-start gap-3.5">
                      <Avatar src={judge.avatarUrl} name={judge.name} />
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-semibold text-[#18181B] truncate">{judge.name}</h4>
                        <p className="text-xs text-[#52525B] truncate">{judge.role}</p>
                        <p className="text-xs font-medium text-[#18181B] truncate">{judge.company}</p>
                      </div>
                    </div>

                    {matchingSponsor && (
                      <div className="px-3 py-1.5 rounded-lg bg-[#EFE6FF] text-xs flex items-center justify-between gap-2">
                        <span className="text-[#3B0764]">Representative:</span>
                        <span className="font-semibold text-[#3B0764]">{matchingSponsor.name}</span>
                      </div>
                    )}

                    <div className="space-y-1">
                      <p className={`text-xs text-[#52525B] leading-relaxed ${isBioExpanded ? '' : 'line-clamp-3'}`}>
                        {judge.bio}
                      </p>
                      {isLongBio && (
                        <button
                          type="button"
                          onClick={() => toggleBio(judge.id)}
                          aria-expanded={isBioExpanded}
                          className="text-xs font-semibold text-[#18181B] hover:underline"
                        >
                          {isBioExpanded ? 'Show less' : 'Show full bio'}
                        </button>
                      )}
                    </div>

                    {judge.notableProducts.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-[#63636B]">Notable Work</p>
                        <div className="flex flex-wrap gap-1.5">
                          {judge.notableProducts.map((p, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded-md bg-[#F4F4F6] text-[11px] text-[#52525B] font-medium">
                              {p}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 pt-2">
                    {judge.socials.linkedin && (
                      <a
                        href={judge.socials.linkedin}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`${judge.name} on LinkedIn`}
                        title={`${judge.name} on LinkedIn`}
                        className="w-9 h-9 rounded-lg text-[#52525B] hover:text-[#18181B] btn-tactile-ghost flex items-center justify-center"
                      >
                        <Linkedin aria-hidden="true" className="w-4 h-4 stroke-[1.75]" />
                      </a>
                    )}
                    {judge.socials.twitter && (
                      <a
                        href={judge.socials.twitter}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`${judge.name} on X (Twitter)`}
                        title={`${judge.name} on X (Twitter)`}
                        className="w-9 h-9 rounded-lg text-[#52525B] hover:text-[#18181B] btn-tactile-ghost flex items-center justify-center"
                      >
                        <Twitter aria-hidden="true" className="w-4 h-4 stroke-[1.75]" />
                      </a>
                    )}
                    {judge.socials.github && (
                      <a
                        href={judge.socials.github}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`${judge.name} on GitHub`}
                        title={`${judge.name} on GitHub`}
                        className="w-9 h-9 rounded-lg text-[#52525B] hover:text-[#18181B] btn-tactile-ghost flex items-center justify-center"
                      >
                        <Github aria-hidden="true" className="w-4 h-4 stroke-[1.75]" />
                      </a>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {/* SPONSORS BLOCK */}
      {(intelSubTab === 'all' || intelSubTab === 'sponsors') && hasSponsors && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <HeartHandshake aria-hidden="true" className="w-4 h-4 text-[#52525B] stroke-[2]" />
            <h3 className="text-base font-semibold text-[#18181B]">
              Sponsor Tracks & Bounties ({opportunity.sponsors.length})
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {opportunity.sponsors.map((sponsor) => (
              <article key={sponsor.id} className="surface-card p-6 rounded-2xl space-y-3.5 flex flex-col justify-between">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs gap-2">
                    <span className="font-semibold text-[#18181B]">{sponsor.name}</span>
                    <span className="px-2 py-0.5 rounded-md bg-[#F4F4F6] text-[11px] font-semibold text-[#52525B]">
                      {sponsor.tier}
                    </span>
                  </div>

                  <h4 className="text-sm font-semibold text-[#18181B]">{sponsor.bountyTitle}</h4>
                  <p className="text-[13px] text-[#52525B] leading-relaxed">
                    {sponsor.bountyDescription}
                  </p>
                </div>

                <div className="space-y-2.5 pt-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#52525B]">Prize pool:</span>
                    <span className="font-mono font-bold text-[#18181B] tabular-nums">{sponsor.prizePool}</span>
                  </div>
                  {sponsor.recommendedTech && (
                    <div className="flex flex-wrap gap-1.5">
                      {sponsor.recommendedTech.map((tech, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded-md bg-[#F4F4F6] text-[11px] font-mono text-[#52525B]">
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* PAST WINNERS BLOCK */}
      {(intelSubTab === 'all' || intelSubTab === 'winners') && hasPastWinners && (
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Trophy aria-hidden="true" className="w-4 h-4 text-[#52525B] stroke-[2]" />
              <h3 className="text-base font-semibold text-[#18181B]">
                Past Winning Benchmarks ({opportunity.pastWinners.length})
              </h3>
            </div>

            <div className="flex items-center gap-1.5 text-xs" role="group" aria-label="Filter past winners by year">
              {['all', '2025', '2024'].map((ed) => (
                <button
                  type="button"
                  key={ed}
                  onClick={() => setWinnerEditionFilter(ed)}
                  aria-pressed={winnerEditionFilter === ed}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium min-h-[32px] ${
                    winnerEditionFilter === ed ? 'btn-tactile-primary font-semibold' : 'btn-tactile-secondary'
                  }`}
                >
                  {ed === 'all' ? 'All Editions' : ed}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredWinners.map((winner) => (
              <article key={winner.id} className="surface-card p-6 rounded-2xl space-y-3.5 flex flex-col justify-between">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-xs text-[#63636B]">{winner.edition}</span>
                    <span className="font-mono font-bold text-[#065F46] bg-[#ECFDF5] px-2 py-0.5 rounded-md tabular-nums text-xs">
                      {winner.prizeWon}
                    </span>
                  </div>

                  <h4 className="text-base font-semibold text-[#18181B]">{winner.projectName}</h4>
                  <p className="text-xs text-[#52525B] font-medium">By {winner.teamName}</p>

                  <p className="text-[13px] text-[#52525B] leading-relaxed">
                    {winner.problemSolved}
                  </p>

                  {winner.whyTheyWon && (
                    <div className="p-3.5 rounded-xl bg-[#F4F4F6] text-xs space-y-1.5">
                      <span className="font-semibold text-[#18181B] text-xs block">Why they won</span>
                      <p className="text-[#52525B] leading-snug">{winner.whyTheyWon}</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 pt-2">
                  {winner.demoUrl && (
                    <a
                      href={winner.demoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-[#52525B] hover:text-[#18181B] inline-flex items-center gap-1.5 font-medium py-1"
                    >
                      <span>Demo</span>
                      <ExternalLink aria-hidden="true" className="w-3.5 h-3.5 stroke-[1.75]" />
                    </a>
                  )}
                  {winner.repoUrl && (
                    <a
                      href={winner.repoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-[#52525B] hover:text-[#18181B] inline-flex items-center gap-1.5 font-medium py-1"
                    >
                      <Github aria-hidden="true" className="w-3.5 h-3.5 stroke-[1.75]" />
                      <span>Code</span>
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
