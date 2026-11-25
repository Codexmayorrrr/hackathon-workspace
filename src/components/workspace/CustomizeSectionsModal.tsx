import React from 'react';
import { motion } from 'framer-motion';
import {
  X,
  Layers,
  Check,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';
import { Opportunity, WorkspaceSectionId } from '../../types';
import { ALL_SECTIONS_META, SectionMeta } from '../../utils/workspaceConfig';
import { useWorkspaceStore } from '../../store/useWorkspaceStore';
import { AccessibleModal } from '../ui/AccessibleModal';
import { toast } from 'sonner';

interface CustomizeSectionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  opportunity: Opportunity;
}

export const CustomizeSectionsModal: React.FC<CustomizeSectionsModalProps> = ({
  isOpen,
  onClose,
  opportunity,
}) => {
  const workspace = useWorkspaceStore((state) => state.getWorkspace(opportunity.id));
  const toggleWorkspaceSection = useWorkspaceStore((state) => state.toggleWorkspaceSection);
  const resetWorkspaceSections = useWorkspaceStore((state) => state.resetWorkspaceSections);

  const currentSections = workspace?.config?.sections || {
    overview: true,
    intel: true,
    tasks_deadlines: true,
    notes: true,
    team: true,
    application: true,
    ideas: true,
    build: true,
    pitch_documents: true,
    logistics: true,
    showcase: true,
    results: true,
  };

  const allSectionsList: SectionMeta[] = Object.values(ALL_SECTIONS_META);
  const coreSections = allSectionsList.filter((s) => s.isCore);
  const contextualSections = allSectionsList.filter((s) => !s.isCore);

  const handleToggle = (id: WorkspaceSectionId) => {
    toggleWorkspaceSection(opportunity.id, id);
    const willBeEnabled = !currentSections[id];
    toast.success(
      willBeEnabled ? `Shown "${ALL_SECTIONS_META[id].label}"` : `Hidden "${ALL_SECTIONS_META[id].label}"`
    );
  };

  const handleReset = () => {
    resetWorkspaceSections(opportunity.id);
    toast.success('Reset navigation to category defaults');
  };

  return (
    <AccessibleModal
      isOpen={isOpen}
      onClose={onClose}
      titleId="customize-sections-title"
      descriptionId="customize-sections-desc"
      maxWidthClass="max-w-xl"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 pb-4 border-b border-neutral-200/70">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Layers aria-hidden="true" className="w-4 h-4 text-[#18181B] stroke-[1.75]" />
            <h2
              id="customize-sections-title"
              className="text-base font-semibold text-[#18181B] tracking-tight"
            >
              Customize workspace navigation
            </h2>
          </div>
          <p id="customize-sections-desc" className="text-xs text-[#52525B] leading-relaxed">
            Show or hide sections to fit the requirements of this {opportunity.type.replace('_', ' ')}.
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close customize navigation dialog"
          className="w-9 h-9 rounded-xl btn-tactile-ghost flex items-center justify-center flex-shrink-0"
        >
          <X aria-hidden="true" className="w-4 h-4 stroke-[1.75]" />
        </button>
      </div>

      {/* Section Toggles Scrollable Area */}
      <div className="py-5 space-y-6">
        {/* Core Sections */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-semibold text-[#63636B] uppercase tracking-wider">
              Core sections
            </span>
            <span className="text-[11px] text-[#63636B] font-mono">Always visible</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {coreSections.map((section) => (
              <div
                key={section.id}
                className="p-3 rounded-xl bg-[#F4F4F6] flex items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[#18181B] truncate">{section.label}</p>
                  <p className="text-[11px] text-[#52525B] line-clamp-1">{section.description}</p>
                </div>
                <span
                  aria-hidden="true"
                  className="w-5 h-5 rounded-full bg-[#18181B] text-white flex items-center justify-center flex-shrink-0"
                >
                  <Check className="w-3 h-3 stroke-[2.5]" />
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Contextual Sections */}
        <div className="space-y-2.5">
          <span className="text-[11px] font-semibold text-[#63636B] uppercase tracking-wider block">
            Contextual sections
          </span>

          <div className="space-y-2">
            {contextualSections.map((section) => {
              const isEnabled = Boolean(currentSections[section.id]);

              return (
                <button
                  key={section.id}
                  type="button"
                  role="switch"
                  aria-checked={isEnabled}
                  aria-label={`${section.label}: ${section.description}`}
                  onClick={() => handleToggle(section.id)}
                  className={`w-full p-3.5 rounded-xl flex items-center justify-between gap-4 text-start transition-[transform,background-color] duration-150 active:scale-[0.99] ${
                    isEnabled
                      ? 'bg-[#F4F4F6] hover:bg-[#EBECEF]'
                      : 'bg-[#FAFAFB] hover:bg-[#F4F4F6] shadow-[0_0_0_1px_oklch(0_0_0/0.05)]'
                  }`}
                >
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[13px] font-semibold ${isEnabled ? 'text-[#18181B]' : 'text-[#52525B]'}`}>
                        {section.label}
                      </span>
                      {isEnabled && (
                        <span className="px-1.5 py-0.5 rounded text-[11px] font-semibold bg-[#ECFDF5] text-[#065F46]">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#52525B] leading-snug">
                      {section.description}
                    </p>
                  </div>

                  {/* Switch Visual */}
                  <span
                    aria-hidden="true"
                    className={`w-10 h-6 rounded-full transition-colors relative flex items-center flex-shrink-0 ${
                      isEnabled ? 'bg-[#18181B]' : 'bg-neutral-300'
                    }`}
                  >
                    <motion.span
                      layout
                      transition={{ type: 'spring', duration: 0.2, bounce: 0 }}
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        isEnabled ? 'translate-x-5' : 'translate-x-1'
                      }`}
                    />
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Data Safety Notice */}
        <div className="p-3.5 rounded-xl bg-[#F4F4F6] flex items-start gap-2.5 text-xs text-[#52525B]">
          <ShieldCheck aria-hidden="true" className="w-4 h-4 text-[#18181B] flex-shrink-0 mt-0.5 stroke-[1.75]" />
          <p className="leading-relaxed">
            <strong className="text-[#18181B]">Your work stays intact:</strong> Hiding a section never deletes existing drafts, tasks, or documents. Re-enabling restores them immediately.
          </p>
        </div>
      </div>

      {/* Footer Controls */}
      <div className="flex items-center justify-between pt-4 border-t border-neutral-200/70 gap-3">
        <button
          type="button"
          onClick={handleReset}
          className="btn-tactile-secondary px-3.5 py-2 rounded-xl text-xs font-medium gap-1.5 min-h-[38px]"
        >
          <RotateCcw aria-hidden="true" className="w-3.5 h-3.5 stroke-[1.75]" />
          <span>Reset defaults</span>
        </button>

        <button
          type="button"
          onClick={onClose}
          className="btn-tactile-primary px-5 py-2 rounded-xl text-xs font-semibold min-h-[38px]"
        >
          Done
        </button>
      </div>
    </AccessibleModal>
  );
};
