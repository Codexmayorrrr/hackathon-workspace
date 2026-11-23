import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, 
  Copy, 
  Check, 
  Sparkles 
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
      <div className="p-6 sm:p-8 rounded-2xl bg-[#FDFDFD] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-lg sm:text-xl font-bold text-neutral-900 tracking-tight">
              Workspace Notes & Research Scratchpad
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed" style={{ textWrap: 'pretty' }}>
              Capture meeting takeaways, judge feedback, architecture thoughts, and strategy notes in one persistent place.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {savedStatus && (
              <span className="text-xs text-neutral-400 italic mr-2">{savedStatus}</span>
            )}
            <button
              onClick={handleCopy}
              disabled={!notes}
              className="btn-tactile-secondary px-3.5 py-2 rounded-lg text-xs font-medium disabled:opacity-40 gap-1.5"
            >
              {copySuccess ? <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" /> : <Copy className="w-3.5 h-3.5 stroke-[1.75]" />}
              <span>{copySuccess ? 'Copied' : 'Copy All'}</span>
            </button>
          </div>
        </div>

        {/* Quick Insert Templates */}
        <div className="space-y-2 pt-2">
          <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
            Quick Insert Templates
          </p>
          <div className="flex flex-wrap gap-2">
            {TEMPLATES.map((tmpl) => (
              <button
                key={tmpl.name}
                type="button"
                onClick={() => handleInsertTemplate(tmpl.content, tmpl.name)}
                className="btn-tactile-secondary px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 text-neutral-700"
              >
                <Sparkles className="w-3 h-3 text-neutral-400 stroke-[1.75]" />
                <span>{tmpl.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Persistent Scratchpad Area */}
      <div className="p-6 rounded-2xl bg-[#FDFDFD] space-y-3">
        <div className="flex items-center justify-between text-xs text-neutral-500">
          <span className="font-semibold text-neutral-700 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 stroke-[1.75]" />
            <span>Scratchpad</span>
          </span>
          <span className="font-mono tabular-nums">{wordCount} words</span>
        </div>

        <textarea
          value={notes}
          onChange={handleChange}
          rows={14}
          placeholder="Type or paste notes here... All edits auto-save to this opportunity workspace."
          className="w-full bg-[#F5F5F5] rounded-xl p-4 text-sm text-neutral-900 leading-relaxed font-sans border-0 focus:outline-none focus:ring-1 focus:ring-neutral-900/10 transition-colors"
        />

        <p className="text-[11px] text-neutral-400 leading-relaxed">
          Notes are scoped directly to <strong className="text-neutral-700">{opportunity.title}</strong> and preserved across all workspace configuration changes.
        </p>
      </div>
    </div>
  );
};
