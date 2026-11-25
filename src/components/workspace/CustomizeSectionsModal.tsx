import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
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
  const shouldReduceMotion = useReducedMotion();

  const currentSections = workspace?.config?.sections || {
    overview: true,
    application: true,
    intel: true,
    ideas: true,
    build: true,
    team: true,
    pitch_documents: true,
    logistics: false,
    showcase: true,
    results: true,
    tasks_deadlines: true,
    notes: true,
  };

  const allSectionsList: SectionMeta[] = Object.values(ALL_SECTIONS_META);
  const coreSections = allSectionsList.filter((s) => s.isCore);
  const contextualSections = allSectionsList.filter((s) => !s.isCore);

  const handleToggle = (id: WorkspaceSectionId) => {
    const willBeEnabled = !currentSections[id];
    toggleWorkspaceSection(opportunity.id, id);
    toast.success(
      willBeEnabled ? `Shown “${ALL_SECTIONS_META[id].label}”` : `Hidden “${ALL_SECTIONS_META[id].label}”`
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
      title="Customize workspace sections"
      description={`Show or hide tabs to fit this ${opportunity.type.replace('_', ' ')}.`}
      icon={<Layers className="w-4 h-4 stroke-[1.75]" />}
      closeLabel="Close customize sections dialog"
      footer={
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="btn-tactile-secondary px-3.5 py-2.5 rounded-xl text-xs font-medium gap-1.5 min-h-[40px]"
          >
            <RotateCcw aria-hidden="true" className="w-3.5 h-3.5 stroke-[1.75]" />
            <span>Reset defaults</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="btn-tactile-primary px-5 py-2.5 rounded-xl text-xs font-semibold min-h-[40px]"
          >
            Done
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Core Sections */}
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-[#18181B]">
              Core sections
            </h3>
            <span className="text-xs text-[#63636B] font-mono">Always visible</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {coreSections.map((section) => (
              <div
                key={section.id}
                className="p-3.5 rounded-xl bg-[#F4F4F6] flex items-center justify-between gap-2.5"
              >
                <div className="min-w-0 space-y-0.5">
                  <p className="text-xs font-semibold text-[#18181B] truncate">{section.label}</p>
                  <p className="text-xs text-[#52525B] line-clamp-1 leading-snug">{section.description}</p>
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

        {/* Optional Sections */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-[#18181B]">
            Optional sections
          </h3>

          <div className="space-y-2.5">
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
                      ? 'bg-[#EFEFF2] hover:bg-[#E6E6EB]'
                      : 'bg-[#F8F8FA] hover:bg-[#EFEFF2]'
                  }`}
                >
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[13px] font-semibold ${isEnabled ? 'text-[#18181B]' : 'text-[#52525B]'}`}>
                        {section.label}
                      </span>
                      {isEnabled && (
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[#ECFDF5] text-[#065F46]">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#52525B] leading-snug text-pretty">
                      {section.description}
                    </p>
                  </div>

                  {/* Pure Spring Switch Visual */}
                  <span
                    aria-hidden="true"
                    className={`w-10 h-6 rounded-full transition-colors duration-150 relative flex items-center flex-shrink-0 ${
                      isEnabled ? 'bg-[#18181B]' : 'bg-neutral-300'
                    }`}
                  >
                    <motion.span
                      initial={false}
                      animate={{ x: isEnabled ? 20 : 4 }}
                      transition={
                        shouldReduceMotion
                          ? { duration: 0.01 }
                          : { type: 'spring', stiffness: 500, damping: 34 }
                      }
                      className="w-4 h-4 rounded-full bg-white block"
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
          <p className="leading-relaxed text-pretty">
            <strong className="text-[#18181B]">Your work stays intact:</strong> Hiding a section never deletes existing drafts, tasks, or documents. Re-enabling restores them immediately.
          </p>
        </div>
      </div>
    </AccessibleModal>
  );
};
