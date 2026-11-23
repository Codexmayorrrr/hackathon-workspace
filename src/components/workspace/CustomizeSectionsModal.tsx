import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Layers, 
  Check, 
  RotateCcw, 
  ShieldCheck 
} from 'lucide-react';
import { Opportunity, WorkspaceSectionId } from '../../types';
import { ALL_SECTIONS_META, SectionMeta } from '../../utils/workspaceConfig';
import { useWorkspaceStore } from '../../store/useWorkspaceStore';
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

  if (!isOpen) return null;

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
      willBeEnabled ? `Enabled "${ALL_SECTIONS_META[id].label}"` : `Hidden "${ALL_SECTIONS_META[id].label}"`
    );
  };

  const handleReset = () => {
    resetWorkspaceSections(opportunity.id);
    toast.success('Reset navigation to recommended category defaults');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        />

        {/* Modal Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ type: 'spring', duration: 0.28, bounce: 0 }}
          className="relative w-full max-w-xl max-h-[85vh] bg-white rounded-2xl p-6 sm:p-8 flex flex-col justify-between overflow-hidden shadow-2xl z-10"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-4 pb-4 border-b border-neutral-100">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-neutral-900 stroke-[1.75]" />
                <h3 className="text-base font-semibold text-neutral-950 tracking-tight">
                  Customize Workspace Navigation
                </h3>
              </div>
              <p className="text-xs text-neutral-500 leading-relaxed" style={{ textWrap: 'pretty' }}>
                Adapt navigation sections to match the exact requirements of this {opportunity.type.replace('_', ' ')}.
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-[#F5F5F5] transition-colors"
            >
              <X className="w-4 h-4 stroke-[1.75]" />
            </button>
          </div>

          {/* Section Toggles Scrollable Area */}
          <div className="flex-1 overflow-y-auto no-scrollbar py-4 space-y-6">
            {/* Core Sections */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                  Core Foundation Sections (Shared Across All Types)
                </span>
                <span className="text-[10px] text-neutral-400 font-mono">Always Active</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {coreSections.map((section) => (
                  <div
                    key={section.id}
                    className="p-3 rounded-xl bg-[#F5F5F5] flex items-center justify-between gap-2 opacity-85"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-neutral-900 truncate">{section.label}</p>
                      <p className="text-[10px] text-neutral-500 line-clamp-1">{section.description}</p>
                    </div>
                    <span className="w-4 h-4 rounded-full bg-neutral-900 text-white flex items-center justify-center flex-shrink-0">
                      <Check className="w-2.5 h-2.5 stroke-[2.5]" />
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Contextual Sections */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                  Contextual Sections (Toggle on / off as required)
                </span>
              </div>

              <div className="space-y-2">
                {contextualSections.map((section) => {
                  const isEnabled = Boolean(currentSections[section.id]);

                  return (
                    <div
                      key={section.id}
                      onClick={() => handleToggle(section.id)}
                      className={`p-3.5 rounded-xl flex items-center justify-between gap-4 cursor-pointer transition-colors ${
                        isEnabled ? 'bg-[#FDFDFD] hover:bg-[#F8F8FA]' : 'bg-[#F5F5F5]/60 hover:bg-[#F5F5F5]'
                      }`}
                    >
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <div className="flex items-center gap-2">
                          <p className={`text-xs font-semibold ${isEnabled ? 'text-neutral-950' : 'text-neutral-500'}`}>
                            {section.label}
                          </p>
                          {isEnabled && (
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                              Active
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-neutral-500 leading-snug" style={{ textWrap: 'pretty' }}>
                          {section.description}
                        </p>
                      </div>

                      {/* Tactile Switch */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggle(section.id);
                        }}
                        className={`w-9 h-5 rounded-full transition-colors relative flex items-center flex-shrink-0 ${
                          isEnabled ? 'bg-neutral-900' : 'bg-neutral-200'
                        }`}
                      >
                        <motion.span
                          layout
                          transition={{ type: 'spring', duration: 0.2 }}
                          className={`w-3.5 h-3.5 rounded-full bg-white transition-transform ${
                            isEnabled ? 'translate-x-4' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Data Safety Notice (Rule 6) */}
            <div className="p-3.5 rounded-xl bg-neutral-100 flex items-start gap-2.5 text-xs text-neutral-600">
              <ShieldCheck className="w-4 h-4 text-neutral-800 flex-shrink-0 mt-0.5 stroke-[1.75]" />
              <p className="text-[11px] leading-relaxed">
                <strong>Data continuity guaranteed:</strong> Hiding a section never deletes any existing drafts, tasks, or documents. Re-enabling a section restores all data immediately.
              </p>
            </div>
          </div>

          {/* Footer Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
            <button
              onClick={handleReset}
              className="btn-tactile-secondary px-3 py-1.5 rounded-lg text-xs font-medium gap-1.5 text-neutral-600"
            >
              <RotateCcw className="w-3.5 h-3.5 stroke-[1.75]" />
              <span>Reset Defaults</span>
            </button>

            <button
              onClick={onClose}
              className="btn-tactile-primary px-4 py-2 rounded-xl text-xs font-semibold"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
