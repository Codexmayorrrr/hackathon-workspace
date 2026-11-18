import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  FolderArchive, 
  Copy, 
  Check, 
  Plus, 
  Trash2, 
  Edit3, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useWorkspaceStore } from '../../store/useWorkspaceStore';
import { VaultCategory, VaultItem } from '../../types';
import { toast } from 'sonner';

interface ReusableVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertSnippet?: (text: string) => void;
}

const CATEGORY_LABELS: Record<VaultCategory, string> = {
  bio: 'Founder Bio',
  problem_statement: 'Problem Statement',
  tam_model: 'TAM / Market Model',
  personal_story: 'Personal Origin Story',
  tech_architecture: 'Tech Architecture',
  general: 'General Asset',
};

export const ReusableVaultModal: React.FC<ReusableVaultModalProps> = ({
  isOpen,
  onClose,
  onInsertSnippet,
}) => {
  const vaultItems = useWorkspaceStore((state) => state.vaultItems);
  const addVaultItem = useWorkspaceStore((state) => state.addVaultItem);
  const updateVaultItem = useWorkspaceStore((state) => state.updateVaultItem);
  const deleteVaultItem = useWorkspaceStore((state) => state.deleteVaultItem);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // New Item Form State
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<VaultCategory>('bio');
  const [formContent, setFormContent] = useState('');

  if (!isOpen) return null;

  const countWords = (str: string) => str.trim().split(/\s+/).filter(Boolean).length;

  const handleCopy = (item: VaultItem) => {
    navigator.clipboard.writeText(item.content);
    setCopiedId(item.id);
    toast.success('Copied to clipboard', {
      description: item.title,
    });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleInsert = (item: VaultItem) => {
    if (onInsertSnippet) {
      onInsertSnippet(item.content);
      toast.success('Inserted into draft', {
        description: item.title,
      });
      onClose();
    }
  };

  const handleSaveNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formContent.trim()) {
      toast.error('Please enter a title and content');
      return;
    }

    if (editingId) {
      updateVaultItem(editingId, {
        title: formTitle.trim(),
        category: formCategory,
        content: formContent.trim(),
        wordCount: countWords(formContent),
      });
      toast.success('Vault asset updated');
      setEditingId(null);
    } else {
      addVaultItem({
        title: formTitle.trim(),
        category: formCategory,
        content: formContent.trim(),
        wordCount: countWords(formContent),
      });
      toast.success('Saved to Reusable Vault');
    }

    setIsAddingNew(false);
    setFormTitle('');
    setFormContent('');
    setFormCategory('bio');
  };

  const startEdit = (item: VaultItem) => {
    setEditingId(item.id);
    setFormTitle(item.title);
    setFormCategory(item.category);
    setFormContent(item.content);
    setIsAddingNew(true);
  };

  const filteredItems = selectedCategory === 'all'
    ? vaultItems
    : vaultItems.filter((i) => i.category === selectedCategory);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-neutral-900/25 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            style={{ transformOrigin: 'center' }}
            className="w-full max-w-2xl bg-white rounded-2xl p-6 sm:p-8 relative overflow-hidden max-h-[92vh] overflow-y-auto space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FDFDFD] flex items-center justify-center text-neutral-800">
                  <FolderArchive className="w-5 h-5 stroke-[1.75]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-neutral-900 tracking-tight [text-wrap:balance]">
                      Reusable Application Vault
                    </h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FDFDFD] text-neutral-600 font-mono font-semibold">
                      PRD §3.K
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 [text-wrap:pretty]">
                    Store your bio, TAM models, and project stories once. Reuse across any hackathon workspace.
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-neutral-400 hover:text-neutral-700 hover:bg-[#FDFDFD] transition-[transform,background-color,color] duration-150 active:scale-[0.97]"
                aria-label="Close modal"
              >
                <X className="w-4 h-4 stroke-[1.75]" />
              </button>
            </div>

        {/* Category Pills & Add Trigger */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors active:scale-[0.97] ${
                selectedCategory === 'all'
                  ? 'bg-neutral-900 text-white font-semibold'
                  : 'bg-[#FDFDFD] text-neutral-600 hover:text-neutral-900'
              }`}
            >
              All Assets ({vaultItems.length})
            </button>
            {Object.entries(CATEGORY_LABELS).map(([catKey, label]) => (
              <button
                key={catKey}
                onClick={() => setSelectedCategory(catKey)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-[transform,background-color,color] duration-150 active:scale-[0.97] ${
                  selectedCategory === catKey
                    ? 'bg-neutral-900 text-white font-semibold'
                    : 'bg-[#FDFDFD] text-neutral-600 hover:text-neutral-900'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {!isAddingNew && (
            <button
              onClick={() => {
                setEditingId(null);
                setFormTitle('');
                setFormContent('');
                setFormCategory('bio');
                setIsAddingNew(true);
              }}
              className="btn-tactile-primary px-3.5 py-2 rounded-xl text-xs font-semibold active:scale-[0.97] text-white flex items-center justify-center gap-1.5 flex-shrink-0"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2]" />
              <span>New Asset</span>
            </button>
          )}
        </div>

        {/* Add / Edit Form */}
        {isAddingNew && (
          <motion.form 
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.16, ease: [0.23, 1, 0.32, 1] }}
            onSubmit={handleSaveNew} 
            className="p-5 rounded-2xl bg-[#FDFDFD] space-y-4"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-xs sm:text-sm font-bold text-neutral-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600 stroke-[1.75]" />
                <span>{editingId ? 'Edit Vault Asset' : 'Add New Reusable Asset'}</span>
              </h4>
              <button
                type="button"
                onClick={() => setIsAddingNew(false)}
                className="text-xs text-neutral-400 hover:text-neutral-700"
              >
                Cancel
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-neutral-600 block mb-1">Asset Title</label>
                <input
                  type="text"
                  placeholder="e.g. 50-Word Personal Origin Story"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full bg-white rounded-xl px-3.5 py-2.5 text-base sm:text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 border-0"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-600 block mb-1">Category</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as VaultCategory)}
                  className="w-full bg-white rounded-xl px-3.5 py-2.5 text-base sm:text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 border-0"
                >
                  {Object.entries(CATEGORY_LABELS).map(([catKey, label]) => (
                    <option key={catKey} value={catKey}>{label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-neutral-600">Asset Content</label>
                <span className="text-[11px] font-mono text-neutral-400 tabular-nums">
                  {countWords(formContent)} words
                </span>
              </div>
              <textarea
                rows={4}
                placeholder="Write or paste your reusable snippet here..."
                value={formContent}
                onChange={(e) => setFormContent(e.target.value)}
                className="w-full bg-white rounded-xl p-3.5 text-base sm:text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 leading-relaxed border-0"
                required
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setIsAddingNew(false)}
                className="bg-white hover:bg-neutral-100 px-4 py-2 rounded-xl text-xs font-medium text-neutral-700 active:scale-[0.97]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-tactile-primary px-4.5 py-2 rounded-xl text-xs font-semibold text-white active:scale-[0.97]"
              >
                {editingId ? 'Save Changes' : 'Add to Vault'}
              </button>
            </div>
          </motion.form>
        )}

        {/* Vault Items List */}
        <div className="space-y-3.5">
          {filteredItems.length === 0 ? (
            <div className="p-8 rounded-2xl bg-[#FDFDFD] text-center space-y-2">
              <p className="text-sm font-semibold text-neutral-900">No assets in this category</p>
              <p className="text-xs text-neutral-500">Save a reusable snippet above to start filling your vault.</p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <div 
                key={item.id}
                className="p-5 rounded-2xl bg-[#FDFDFD] hover:bg-[#f9f9fa] transition-colors space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h4 className="text-sm font-semibold text-neutral-900 [text-wrap:balance]">
                      {item.title}
                    </h4>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-white text-neutral-600 font-medium">
                      {CATEGORY_LABELS[item.category]}
                    </span>
                    <span className="text-[11px] font-mono text-neutral-400 tabular-nums">
                      {item.wordCount} words
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    {onInsertSnippet && (
                      <button
                        onClick={() => handleInsert(item)}
                        className="btn-tactile-primary px-3 py-1.5 rounded-xl text-xs font-semibold text-white active:scale-[0.97] flex items-center gap-1.5"
                      >
                        <span>Insert</span>
                        <ArrowRight className="w-3 h-3 stroke-[2]" />
                      </button>
                    )}

                    <button
                      onClick={() => handleCopy(item)}
                      className="p-2 rounded-xl bg-white hover:bg-neutral-50 text-neutral-600 hover:text-neutral-900 active:scale-[0.97] transition-colors"
                      title="Copy content"
                    >
                      {copiedId === item.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 stroke-[1.75]" />
                      )}
                    </button>

                    <button
                      onClick={() => startEdit(item)}
                      className="p-2 rounded-xl bg-white hover:bg-neutral-50 text-neutral-600 hover:text-neutral-900 active:scale-[0.97] transition-colors"
                      title="Edit asset"
                    >
                      <Edit3 className="w-3.5 h-3.5 stroke-[1.75]" />
                    </button>

                    <button
                      onClick={() => {
                        deleteVaultItem(item.id);
                        toast.info('Removed from Vault');
                      }}
                      className="p-2 rounded-xl bg-white hover:bg-rose-50 text-neutral-400 hover:text-rose-600 active:scale-[0.97] transition-colors"
                      title="Delete asset"
                    >
                      <Trash2 className="w-3.5 h-3.5 stroke-[1.75]" />
                    </button>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed [text-wrap:pretty]">
                  {item.content}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="btn-tactile-primary px-5 py-2.5 rounded-xl text-xs font-semibold active:scale-[0.97] text-white"
          >
            Done
          </button>
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
  );
};
