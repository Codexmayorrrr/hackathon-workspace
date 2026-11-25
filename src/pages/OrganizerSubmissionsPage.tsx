import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Trophy,
  XCircle,
  RotateCcw,
  ExternalLink,
  Code2,
  Play,
  Users,
} from 'lucide-react';
import { useAllOpportunities, useWorkspaceStore } from '../store/useWorkspaceStore';
import { SubmissionReviewStatus } from '../types';
import { toast } from 'sonner';

type StatusFilter = 'all' | SubmissionReviewStatus;

const STATUS_META: Record<
  SubmissionReviewStatus,
  { label: string; pillClasses: string }
> = {
  pending: {
    label: 'Pending Review',
    pillClasses: 'bg-[#FEF3C7] text-[#92400E]',
  },
  shortlisted: {
    label: 'Shortlisted',
    pillClasses: 'bg-[#EFE6FF] text-[#3B0764]',
  },
  winner: {
    label: 'Winner',
    pillClasses: 'bg-[#ECFDF5] text-[#065F46]',
  },
  declined: {
    label: 'Declined',
    pillClasses: 'bg-[#F4F4F6] text-[#63636B]',
  },
};

export const OrganizerSubmissionsPage: React.FC = () => {
  const allOpportunities = useAllOpportunities();
  const organizerSubmissions = useWorkspaceStore((state) => state.organizerSubmissions);
  const updateSubmissionStatus = useWorkspaceStore((state) => state.updateSubmissionStatus);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedEventId, setSelectedEventId] = useState<string>('all');

  const eventsWithSubmissions = useMemo(() => {
    const ids = Array.from(new Set(organizerSubmissions.map((s) => s.opportunityId)));
    return ids.map((id) => ({
      id,
      title: allOpportunities.find((o) => o.id === id)?.title || id,
    }));
  }, [organizerSubmissions, allOpportunities]);

  const counts = useMemo(() => {
    const map = { all: 0, pending: 0, shortlisted: 0, winner: 0, declined: 0 };
    organizerSubmissions.forEach((s) => {
      if (selectedEventId !== 'all' && s.opportunityId !== selectedEventId) return;
      map.all += 1;
      map[s.status] += 1;
    });
    return map;
  }, [organizerSubmissions, selectedEventId]);

  const filteredSubmissions = useMemo(() => {
    return organizerSubmissions.filter((sub) => {
      if (selectedEventId !== 'all' && sub.opportunityId !== selectedEventId) return false;
      if (statusFilter !== 'all' && sub.status !== statusFilter) return false;
      return true;
    });
  }, [organizerSubmissions, selectedEventId, statusFilter]);

  const handleStatusChange = (
    submissionId: string,
    projectTitle: string,
    prevStatus: SubmissionReviewStatus,
    nextStatus: SubmissionReviewStatus
  ) => {
    updateSubmissionStatus(submissionId, nextStatus);
    toast.success(`Marked "${projectTitle}" as ${STATUS_META[nextStatus].label}`, {
      action: {
        label: 'Undo',
        onClick: () => updateSubmissionStatus(submissionId, prevStatus),
      },
    });
  };

  return (
    <div className="space-y-8 min-w-0">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#18181B] tracking-tight">
            Developer Submissions Inbox
          </h1>
          <p className="text-sm text-[#52525B]">
            Inspect repositories, watch live demos, add judge notes, and advance finalists.
          </p>
        </div>

        <div className="flex flex-col gap-1 min-w-0 sm:w-64">
          <label htmlFor="submissions-event-filter" className="text-xs font-medium text-[#63636B]">
            Filter by Event
          </label>
          <select
            id="submissions-event-filter"
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFFFFF] text-xs sm:text-sm font-medium text-[#18181B]"
          >
            <option value="all">All Hosted Events</option>
            {eventsWithSubmissions.map((evt) => (
              <option key={evt.id} value={evt.id}>
                {evt.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Status Filter Pills */}
      <div
        role="group"
        aria-label="Filter submissions by review status"
        className="flex items-center gap-2 flex-wrap"
      >
        {(
          [
            { key: 'all', label: 'All' },
            { key: 'pending', label: 'Pending' },
            { key: 'shortlisted', label: 'Shortlisted' },
            { key: 'winner', label: 'Winners' },
            { key: 'declined', label: 'Declined' },
          ] as Array<{ key: StatusFilter; label: string }>
        ).map((tab) => {
          const isSelected = statusFilter === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setStatusFilter(tab.key)}
              aria-pressed={isSelected}
              className={`px-3.5 py-2 rounded-xl text-xs font-medium inline-flex items-center gap-1.5 min-h-[36px] transition-colors active:scale-[0.96] ${
                isSelected
                  ? 'bg-[#18181B] text-white font-semibold'
                  : 'bg-[#FFFFFF] text-[#52525B] hover:text-[#18181B] hover:bg-[#EFEFF2]'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`font-mono tabular-nums text-[11px] ${
                  isSelected ? 'text-white/75' : 'text-[#63636B]'
                }`}
              >
                {counts[tab.key]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Submissions List */}
      {filteredSubmissions.length === 0 ? (
        <div className="surface-card rounded-2xl p-10 text-center space-y-2">
          <h2 className="text-base font-semibold text-[#18181B]">No matching submissions</h2>
          <p className="text-sm text-[#52525B]">
            Try clearing your status or event filters above.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSubmissions.map((sub) => {
            const parentOpp = allOpportunities.find((o) => o.id === sub.opportunityId);
            const meta = STATUS_META[sub.status];

            return (
              <article
                key={sub.id}
                className="surface-card rounded-2xl p-5 sm:p-6 space-y-5 min-w-0"
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="space-y-2 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold ${meta.pillClasses}`}>
                        {meta.label}
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-[#F4F4F6] text-[#52525B] text-[11px] font-medium">
                        {sub.trackName}
                      </span>
                      <span className="text-xs text-[#63636B] truncate">
                        {parentOpp?.title || sub.opportunityId}
                      </span>
                    </div>

                    <h2 className="text-lg sm:text-xl font-bold text-[#18181B] tracking-tight">
                      {sub.projectTitle}
                    </h2>
                    <p className="text-sm text-[#52525B]">{sub.tagline}</p>
                    <p className="text-xs text-[#63636B] inline-flex items-center gap-1.5">
                      <Users aria-hidden="true" className="w-3.5 h-3.5" />
                      <span>
                        {sub.teamName} — {sub.builderNames.join(', ')}
                      </span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap flex-shrink-0">
                    <a
                      href={sub.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-tactile-secondary px-3.5 py-2 rounded-xl text-xs font-medium inline-flex items-center gap-1.5 min-h-[36px]"
                    >
                      <Code2 aria-hidden="true" className="w-3.5 h-3.5" />
                      <span>Inspect Repo</span>
                      <ExternalLink aria-hidden="true" className="w-3 h-3 text-[#63636B]" />
                    </a>
                    {sub.demoUrl && (
                      <a
                        href={sub.demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-tactile-secondary px-3.5 py-2 rounded-xl text-xs font-medium inline-flex items-center gap-1.5 min-h-[36px]"
                      >
                        <Play aria-hidden="true" className="w-3.5 h-3.5" />
                        <span>Live Demo</span>
                        <ExternalLink aria-hidden="true" className="w-3 h-3 text-[#63636B]" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Deck Summary & Notes */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="bg-[#F4F4F6] rounded-xl p-4 space-y-1">
                    <p className="text-xs font-semibold text-[#18181B]">Pitch & Architecture Summary</p>
                    <p className="text-xs sm:text-sm text-[#52525B] leading-relaxed">
                      {sub.deckSummary}
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor={`eval-notes-${sub.id}`}
                      className="text-xs font-semibold text-[#18181B] block"
                    >
                      Evaluator Notes
                    </label>
                    <textarea
                      id={`eval-notes-${sub.id}`}
                      rows={2}
                      value={sub.evaluatorNotes || ''}
                      onChange={(e) =>
                        updateSubmissionStatus(sub.id, sub.status, e.target.value)
                      }
                      placeholder="Add scoring feedback or follow-up questions for the builders..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F4F6] focus:bg-[#FFFFFF] text-xs sm:text-sm text-[#18181B] placeholder:text-[#63636B]"
                    />
                  </div>
                </div>

                {/* Triage Actions */}
                <div className="flex items-center justify-between gap-2 pt-1 flex-wrap">
                  <span className="text-xs text-[#63636B] font-mono tabular-nums">
                    Submitted {new Date(sub.submittedAt).toLocaleDateString()}
                    {sub.score !== undefined ? ` · Score ${sub.score}/100` : ''}
                  </span>

                  <div className="flex items-center gap-2 flex-wrap">
                    {sub.status !== 'shortlisted' && (
                      <button
                        type="button"
                        onClick={() =>
                          handleStatusChange(sub.id, sub.projectTitle, sub.status, 'shortlisted')
                        }
                        className="btn-tactile-accent px-3.5 py-2 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 min-h-[36px]"
                      >
                        <CheckCircle2 aria-hidden="true" className="w-3.5 h-3.5" />
                        <span>Shortlist</span>
                      </button>
                    )}

                    {sub.status !== 'winner' && (
                      <button
                        type="button"
                        onClick={() =>
                          handleStatusChange(sub.id, sub.projectTitle, sub.status, 'winner')
                        }
                        className="btn-tactile-primary px-3.5 py-2 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 min-h-[36px]"
                      >
                        <Trophy aria-hidden="true" className="w-3.5 h-3.5" />
                        <span>Mark Winner</span>
                      </button>
                    )}

                    {sub.status !== 'declined' && (
                      <button
                        type="button"
                        onClick={() =>
                          handleStatusChange(sub.id, sub.projectTitle, sub.status, 'declined')
                        }
                        className="btn-tactile-secondary px-3 py-2 rounded-xl text-xs font-medium inline-flex items-center gap-1.5 min-h-[36px]"
                      >
                        <XCircle aria-hidden="true" className="w-3.5 h-3.5 text-[#63636B]" />
                        <span>Decline</span>
                      </button>
                    )}

                    {sub.status !== 'pending' && (
                      <button
                        type="button"
                        onClick={() =>
                          handleStatusChange(sub.id, sub.projectTitle, sub.status, 'pending')
                        }
                        className="btn-tactile-ghost px-3 py-2 rounded-xl text-xs font-medium inline-flex items-center gap-1.5 min-h-[36px]"
                      >
                        <RotateCcw aria-hidden="true" className="w-3.5 h-3.5" />
                        <span>Reset</span>
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
