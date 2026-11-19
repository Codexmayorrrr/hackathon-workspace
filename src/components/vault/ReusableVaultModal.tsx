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
  bio: 'Bio',
  problem_statement: 'Problem statement',
  tam_model: 'Market size & metrics',
  personal_story: 'Origin story',
  tech_architecture: 'Architecture',
  general: 'Notes & other',
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
      toast.error('Enter a title and content to continue');
      return;
    }

    if (editingId) {
      updateVaultItem(editingId, {
        title: formTitle.trim(),
        category: formCategory,
        content: formContent.trim(),
        wordCount: countWords(formContent),
      });
      toast.success('Snippet updated');
      setEditingId(null);
    } else {
      addVaultItem({
        title: formTitle.trim(),
        category: formCategory,
        content: formContent.trim(),
        wordCount: countWords(formContent),
      });
      toast.success('Snippet saved to vault');
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
                <div className="w-10 h-10 rounded-xl bg-[#F5F5F5] flex items-center justify-center text-neutral-800">
                  <FolderArchive className="w-5 h-5 stroke-[1.75]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-neutral-900 tracking-tight [text-wrap:balance]">
                    Reusable Vault
                  </h3>
                  <p className="text-xs text-neutral-500 [text-wrap:pretty]">
                    Save your bio, project stories, and answers once. Insert them into any application with one click.
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl btn-tactile-ghost text-neutral-400 hover:text-neutral-700"
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
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap ${
                selectedCategory === 'all'
                  ? 'btn-tactile-primary font-semibold'
                  : 'btn-tactile-secondary text-neutral-600 hover:text-neutral-900'
              }`}
            >
              All ({vaultItems.length})
            </button>
            {Object.entries(CATEGORY_LABELS).map(([catKey, label]) => (
              <button
                key={catKey}
                onClick={() => setSelectedCategory(catKey)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap ${
                  selectedCategory === catKey
                    ? 'btn-tactile-primary font-semibold'
                    : 'btn-tactile-secondary text-neutral-600 hover:text-neutral-900'
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
                setFormCategory(selectedCategory === 'all' ? 'bio' : (selectedCategory as VaultCategory));
                setIsAddingNew(true);
              }}
              className="btn-tactile-primary px-3.5 py-2 rounded-xl text-xs font-semibold text-white flex items-center justify-center gap-1.5 flex-shrink-0"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2]" />
              <span>Add snippet</span>
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
                <span>{editingId ? 'Edit snippet' : 'Add new snippet'}</span>
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
                <label className="text-xs font-medium text-neutral-600 block mb-1">Title</label>
                <input
                  type="text"
                  placeholder="e.g., Short bio or problem statement"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full bg-[#F5F5F5] rounded-xl px-3.5 py-2.5 text-base sm:text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 border-0"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-600 block mb-1">Category</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as VaultCategory)}
                  className="w-full bg-[#F5F5F5] rounded-xl px-3.5 py-2.5 text-base sm:text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 border-0"
                >
                  {Object.entries(CATEGORY_LABELS).map(([catKey, label]) => (
                    <option key={catKey} value={catKey}>{label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-neutral-600">Content</label>
                <span className="text-[11px] font-mono text-neutral-400 tabular-nums">
                  {countWords(formContent)} words
                </span>
              </div>
              <textarea
                rows={4}
                placeholder="Write or paste your text here..."
                value={formContent}
                onChange={(e) => setFormContent(e.target.value)}
                className="w-full bg-[#F5F5F5] rounded-xl p-3.5 text-base sm:text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 leading-relaxed border-0"
                required
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setIsAddingNew(false)}
                className="btn-tactile-secondary px-4 py-2 rounded-xl text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-tactile-primary px-4.5 py-2 rounded-xl text-xs font-semibold text-white"
              >
                {editingId ? 'Save changes' : 'Save snippet'}
              </button>
            </div>
          </motion.form>
        )}

        {/* Vault Items List */}
        <div className="space-y-3.5">
          {filteredItems.length === 0 ? (
            <div className="p-8 rounded-2xl bg-[#FDFDFD] text-center space-y-3">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-neutral-900">No snippets in this category yet</p>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto [text-wrap:pretty]">
                  Save your bio, answers, or project stories to reuse them across applications.
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingId(null);
                  setFormTitle('');
                  setFormContent('');
                  setFormCategory(selectedCategory === 'all' ? 'bio' : (selectedCategory as VaultCategory));
                  setIsAddingNew(true);
                }}
                className="btn-tactile-secondary px-3.5 py-1.5 rounded-xl text-xs font-medium inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2]" />
                <span>Add snippet</span>
              </button>
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
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#F5F5F5] text-neutral-600 font-medium">
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
                        className="btn-tactile-primary px-3 py-1.5 rounded-xl text-xs font-semibold text-white flex items-center gap-1.5"
                      >
                        <span>Insert</span>
                        <ArrowRight className="w-3 h-3 stroke-[2]" />
                      </button>
                    )}

                    <button
                      onClick={() => handleCopy(item)}
                      className="btn-tactile-secondary p-2 rounded-xl"
                      title="Copy text"
                    >
                      {copiedId === item.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 stroke-[1.75]" />
                      )}
                    </button>

                    <button
                      onClick={() => startEdit(item)}
                      className="btn-tactile-secondary p-2 rounded-xl"
                      title="Edit snippet"
                    >
                      <Edit3 className="w-3.5 h-3.5 stroke-[1.75]" />
                    </button>

                    <button
                      onClick={() => {
                        deleteVaultItem(item.id);
                        toast.success('Snippet deleted');
                      }}
                      className="btn-tactile-secondary p-2 rounded-xl hover:bg-rose-50 hover:text-rose-600 text-neutral-400"
                      title="Delete snippet"
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
            className="btn-tactile-primary px-5 py-2.5 rounded-xl text-xs font-semibold text-white"
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
