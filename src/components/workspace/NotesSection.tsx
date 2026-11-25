import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  Copy,
  Check,
  Sparkles,
} from 'lucide-react';
import { Opportunity } from '../../types';
import { useWorkspaceStore } from '../../store/useWorkspaceStore';
import { toast } from 'sonner';

interface NotesSectionProps {
  opportunity: Opportunity;
}

export const NotesSection: React.FC<NotesSectionProps> = ({ opportunity }) => {
  const workspace = useWorkspaceStore((state) => state.getWorkspace(opportunity.id));
  const updateWorkspaceNotes = useWorkspaceStore((state) => state.updateWorkspaceNotes);

  const initialNotes = workspace?.notes || '';
  const [notes, setNotes] = useState(initialNotes);
  const [savedStatus, setSavedStatus] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (workspace?.notes !== undefined && workspace.notes !== notes) {
      setNotes(workspace.notes);
    }
  }, [workspace?.notes]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setNotes(val);
    setSavedStatus('Typing…');

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      updateWorkspaceNotes(opportunity.id, val);
      setSavedStatus('Saved');
      setTimeout(() => setSavedStatus(null), 2500);
    }, 800);
  };

  const handleInsertTemplate = (templateContent: string, templateName: string) => {
    const updated = notes.trim()
      ? `${notes}\n\n${templateContent}`
      : templateContent;
    setNotes(updated);
    updateWorkspaceNotes(opportunity.id, updated);
    toast.success(`Inserted ${templateName} template`);
  };

  const handleCopy = () => {
    if (!notes) return;
    navigator.clipboard.writeText(notes);
    setCopySuccess(true);
    toast.success('Notes copied to clipboard');
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const wordCount = notes.trim() ? notes.trim().split(/\s+/).length : 0;

  const TEMPLATES = [
    {
      name: 'Mentor / Judge Feedback',
      content: `### Mentor & Evaluator Feedback\n- **Reviewer:** \n- **Key Praise:** \n- **Critical Questions / Gaps:** \n- **Action Items Before Code Freeze:** \n`,
    },
    {
      name: 'Architecture & Decisions',
      content: `### Architecture Decisions & Trade-offs\n- **Chosen Stack:** \n- **Why this architecture:** \n- **Known Bottlenecks & Mitigations:** \n- **Security & Privacy Considerations:** \n`,
    },
    {
      name: 'Grant Budget Breakdown',
      content: `### Grant Milestone Budget Breakdown\n- **Total Requested:** $ \n- **Milestone 1 (Months 1-2):** Engineering infra & setup ($)\n- **Milestone 2 (Months 3-4):** Prototype testnet deployment ($)\n- **Milestone 3 (Months 5-6):** Audit & community pilot ($)\n`,
    },
    {
      name: 'Pitch Talking Points',
      content: `### 3-Minute Pitch Script Outline\n- **Hook (0:00 - 0:30):** The quantifiable pain in the field.\n- **Solution (0:30 - 1:15):** How our engine solves it in 1 click.\n- **Traction / Demo (1:15 - 2:15):** Real transaction on testnet.\n- **The Ask (2:15 - 3:00):** Why our team will execute.\n`,
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 pb-10">
      <div className="surface-card p-6 sm:p-8 rounded-2xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-lg sm:text-xl font-bold text-[#18181B] tracking-tight">
              Workspace Notes & Scratchpad
            </h2>
            <p className="text-xs sm:text-sm text-[#52525B] leading-relaxed">
              Capture meeting takeaways, evaluator feedback, and architecture decisions in one persistent scratchpad.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            {savedStatus && (
              <span role="status" className="text-xs text-[#52525B] italic">
                {savedStatus}
              </span>
            )}
            <button
              type="button"
              onClick={handleCopy}
              disabled={!notes}
              className="btn-tactile-secondary px-4 py-2 rounded-xl text-xs font-medium disabled:opacity-40 gap-1.5 min-h-[38px]"
            >
              {copySuccess ? (
                <Check aria-hidden="true" className="w-3.5 h-3.5 text-emerald-700 stroke-[2.25]" />
              ) : (
                <Copy aria-hidden="true" className="w-3.5 h-3.5 stroke-[1.75]" />
              )}
              <span>{copySuccess ? 'Copied' : 'Copy all'}</span>
            </button>
          </div>
        </div>

        {/* Quick Insert Templates */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-[#63636B]">
            Quick insert templates
          </p>
          <div className="flex flex-wrap gap-2">
            {TEMPLATES.map((tmpl) => (
              <button
                key={tmpl.name}
                type="button"
                onClick={() => handleInsertTemplate(tmpl.content, tmpl.name)}
                className="btn-tactile-secondary px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 min-h-[34px]"
              >
                <Sparkles aria-hidden="true" className="w-3.5 h-3.5 text-[#52525B] stroke-[1.75]" />
                <span>{tmpl.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Persistent Scratchpad Area */}
      <div className="surface-card p-6 rounded-2xl space-y-3">
        <div className="flex items-center justify-between text-xs text-[#52525B]">
          <label
            htmlFor="workspace-notes-scratchpad"
            className="font-semibold text-[#18181B] flex items-center gap-1.5"
          >
            <FileText aria-hidden="true" className="w-4 h-4 stroke-[1.75]" />
            <span>Scratchpad</span>
          </label>
          <span className="font-mono tabular-nums">{wordCount} words</span>
        </div>

        <textarea
          id="workspace-notes-scratchpad"
          value={notes}
          onChange={handleChange}
          rows={14}
          placeholder="Type or paste notes here... All edits auto-save to this opportunity workspace."
          className="field-surface w-full rounded-xl p-4 text-base sm:text-sm leading-relaxed font-sans"
        />

        <p className="text-xs text-[#52525B] leading-relaxed">
          Notes are scoped directly to <strong className="text-[#18181B] font-semibold">{opportunity.title}</strong> and preserved across all navigation customizations.
        </p>
      </div>
    </div>
  );
};
