import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FolderArchive,
  Copy,
  Check,
  Plus,
  Trash2,
  Edit3,
  Sparkles,
  ArrowRight,
  Search,
} from 'lucide-react';
import { useWorkspaceStore } from '../../store/useWorkspaceStore';
import { VaultCategory, VaultItem, ApplicationRequirement } from '../../types';
import { AccessibleModal } from '../ui/AccessibleModal';
import { toast } from 'sonner';

interface ReusableVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertSnippet?: (text: string, title?: string) => void;
  targetRequirement?: ApplicationRequirement | null;
  initialFormState?: {
    title: string;
    category: VaultCategory;
    content: string;
  } | null;
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
  targetRequirement,
  initialFormState,
}) => {
  const vaultItems = useWorkspaceStore((state) => state.vaultItems);
  const addVaultItem = useWorkspaceStore((state) => state.addVaultItem);
  const updateVaultItem = useWorkspaceStore((state) => state.updateVaultItem);
  const deleteVaultItem = useWorkspaceStore((state) => state.deleteVaultItem);
  const restoreVaultItem = useWorkspaceStore((state) => state.restoreVaultItem);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<VaultCategory>('bio');
  const [formContent, setFormContent] = useState('');

  useEffect(() => {
    if (initialFormState) {
      setFormTitle(initialFormState.title);
      setFormCategory(initialFormState.category);
      setFormContent(initialFormState.content);
      setIsAddingNew(true);
      setEditingId(null);
    }
  }, [initialFormState, isOpen]);

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
      onInsertSnippet(item.content, item.title);
      const targetName = targetRequirement ? targetRequirement.title : 'draft';
      toast.success(`Inserted into ${targetName}`, {
        description: item.title,
      });
      onClose();
    }
  };

  const handleDeleteWithUndo = (item: VaultItem) => {
    deleteVaultItem(item.id);
    toast('Snippet removed', {
      description: item.title,
      duration: 6000,
      action: {
        label: 'Undo',
        onClick: () => restoreVaultItem(item),
      },
    });
  };

  const handleSaveNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formContent.trim()) {
      toast.error('Enter both a title and snippet content');
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

  const filteredItems = vaultItems
    .filter((item) => selectedCategory === 'all' || item.category === selectedCategory)
    .filter((item) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return item.title.toLowerCase().includes(q) || item.content.toLowerCase().includes(q);
    });

  return (
    <AccessibleModal
      isOpen={isOpen}
      onClose={onClose}
      titleId="vault-modal-title"
      descriptionId="vault-modal-desc"
      maxWidthClass="max-w-2xl"
      title="Reusable Vault"
      description="Store bios, origins, and core answers once to insert into any application."
      icon={<FolderArchive className="w-4 h-4 stroke-[1.75]" />}
      closeLabel="Close Reusable Vault dialog"
      footer={
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="btn-tactile-primary px-5 py-2.5 rounded-xl text-xs font-semibold w-full sm:w-auto min-h-[40px]"
          >
            Done
          </button>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Target Requirement Destination Banner */}
        {targetRequirement && (
          <div className="p-3.5 rounded-xl bg-[#18181B] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <Sparkles aria-hidden="true" className="w-4 h-4 text-[#DECAFF] stroke-[2] flex-shrink-0" />
              <span className="truncate">
                Target field: <strong className="text-white">{targetRequirement.title}</strong>
                {targetRequirement.maxWords && (
                  <span className="text-neutral-200 font-mono text-[11px] ms-1.5 tabular-nums">
                    ({targetRequirement.maxWords} words max)
                  </span>
                )}
              </span>
            </div>
            <span className="text-[11px] text-neutral-200 flex-shrink-0">
              Choose Insert on any snippet
            </span>
          </div>
        )}

        {/* Search Input */}
        <div className="relative">
          <label htmlFor="vault-search" className="sr-only">
            Search reusable vault snippets
          </label>
          <Search aria-hidden="true" className="w-4 h-4 text-[#63636B] absolute start-3.5 top-1/2 -translate-y-1/2 stroke-[1.75] pointer-events-none" />
          <input
            id="vault-search"
            type="search"
            enterKeyHint="search"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search snippets by title or keyword…"
            className="field-surface w-full rounded-xl ps-10 pe-16 py-2.5 text-base sm:text-sm"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 end-2 px-2 flex items-center text-xs font-medium text-[#52525B] hover:text-[#18181B]"
            >
              Clear
            </button>
          )}
        </div>

        {/* Category Pills & Add Trigger */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 flex-wrap py-1" role="group" aria-label="Filter vault snippets by category">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              aria-pressed={selectedCategory === 'all'}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium min-h-[34px] ${
                selectedCategory === 'all' ? 'btn-tactile-primary font-semibold' : 'btn-tactile-secondary'
              }`}
            >
              All ({vaultItems.length})
            </button>
            {Object.entries(CATEGORY_LABELS).map(([catKey, label]) => (
              <button
                type="button"
                key={catKey}
                onClick={() => setSelectedCategory(catKey)}
                aria-pressed={selectedCategory === catKey}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium min-h-[34px] ${
                  selectedCategory === catKey ? 'btn-tactile-primary font-semibold' : 'btn-tactile-secondary'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {!isAddingNew && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setFormTitle('');
                setFormContent('');
                setFormCategory(selectedCategory === 'all' ? 'bio' : (selectedCategory as VaultCategory));
                setIsAddingNew(true);
              }}
              className="btn-tactile-primary px-4 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 flex-shrink-0 min-h-[38px]"
            >
              <Plus aria-hidden="true" className="w-3.5 h-3.5 stroke-[2]" />
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
            className="p-5 rounded-2xl bg-[#F4F4F6] space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#18181B] flex items-center gap-2">
                <Sparkles aria-hidden="true" className="w-4 h-4 text-amber-700 stroke-[1.75]" />
                <span>{editingId ? 'Edit snippet' : 'Add new snippet'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddingNew(false)}
                className="text-xs font-medium text-[#52525B] hover:text-[#18181B]"
              >
                Cancel
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="vault-item-title" className="text-xs font-medium text-[#52525B] block mb-1.5">
                  Title
                </label>
                <input
                  id="vault-item-title"
                  type="text"
                  placeholder="e.g., Short founder bio"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="field-surface bg-white w-full rounded-xl px-3.5 py-2.5 text-base sm:text-sm"
                  required
                />
              </div>

              <div>
                <label htmlFor="vault-item-category" className="text-xs font-medium text-[#52525B] block mb-1.5">
                  Category
                </label>
                <select
                  id="vault-item-category"
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as VaultCategory)}
                  className="field-surface bg-white w-full rounded-xl px-3.5 py-2.5 text-base sm:text-sm"
                >
                  {Object.entries(CATEGORY_LABELS).map(([catKey, label]) => (
                    <option key={catKey} value={catKey}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="vault-item-content" className="text-xs font-medium text-[#52525B]">
                  Content
                </label>
                <span className="text-xs font-mono text-[#52525B] tabular-nums">
                  {countWords(formContent)} words
                </span>
              </div>
              <textarea
                id="vault-item-content"
                rows={4}
                placeholder="Write or paste reusable text..."
                value={formContent}
                onChange={(e) => setFormContent(e.target.value)}
                className="field-surface bg-white w-full rounded-xl p-3.5 text-base sm:text-sm leading-relaxed"
                required
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setIsAddingNew(false)}
                className="btn-tactile-secondary bg-white px-4 py-2 rounded-xl text-xs font-medium min-h-[38px]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-tactile-primary px-4 py-2 rounded-xl text-xs font-semibold min-h-[38px]"
              >
                {editingId ? 'Save changes' : 'Save snippet'}
              </button>
            </div>
          </motion.form>
        )}

        {/* Vault Items List */}
        <div className="space-y-3">
          {filteredItems.length === 0 ? (
            <div className="p-8 rounded-2xl bg-[#F4F4F6] text-center space-y-3">
              {searchQuery ? (
                <>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-[#18181B]">
                      No snippets match “{searchQuery}”
                    </p>
                    <p className="text-xs text-[#52525B] max-w-sm mx-auto">
                      Try a different keyword or clear the search filter.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="btn-tactile-secondary bg-white px-4 py-2 rounded-xl text-xs font-medium"
                  >
                    Clear filter
                  </button>
                </>
              ) : (
                <>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-[#18181B]">No snippets in this category</p>
                    <p className="text-xs text-[#52525B] max-w-sm mx-auto">
                      Save your bio, answers, or project stories to reuse them across applications.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(null);
                      setFormTitle('');
                      setFormContent('');
                      setFormCategory(selectedCategory === 'all' ? 'bio' : (selectedCategory as VaultCategory));
                      setIsAddingNew(true);
                    }}
                    className="btn-tactile-secondary bg-white px-4 py-2 rounded-xl text-xs font-medium inline-flex items-center gap-1.5"
                  >
                    <Plus aria-hidden="true" className="w-3.5 h-3.5 stroke-[2]" />
                    <span>Add snippet</span>
                  </button>
                </>
              )}
            </div>
          ) : (
            filteredItems.map((item) => {
              const maxWords = targetRequirement?.maxWords;
              const fits = !maxWords || item.wordCount <= maxWords;
              const diff = maxWords ? item.wordCount - maxWords : 0;

              return (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-[#F4F4F6] space-y-2.5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-semibold text-[#18181B]">
                        {item.title}
                      </h3>
                      <span className="text-[11px] px-2 py-0.5 rounded-md bg-white text-[#52525B] font-medium">
                        {CATEGORY_LABELS[item.category]}
                      </span>
                      <span className="text-xs font-mono text-[#52525B] tabular-nums">
                        {item.wordCount} words
                      </span>
                      {maxWords && (
                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                            fits ? 'bg-[#ECFDF5] text-[#065F46]' : 'bg-[#FEF3C7] text-[#92400E]'
                          }`}
                        >
                          {fits ? `Fits (${item.wordCount}/${maxWords}w)` : `${diff}w over limit`}
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 self-start sm:self-auto">
                      {onInsertSnippet && (
                        <button
                          type="button"
                          onClick={() => handleInsert(item)}
                          className="btn-tactile-primary ps-3.5 pe-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 min-h-[36px]"
                        >
                          <span>Insert</span>
                          <ArrowRight aria-hidden="true" className="w-3.5 h-3.5 stroke-[2] rtl:-scale-x-100" />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleCopy(item)}
                        className="btn-tactile-secondary bg-white w-9 h-9 rounded-xl flex items-center justify-center"
                        title={`Copy "${item.title}"`}
                        aria-label={`Copy "${item.title}"`}
                      >
                        {copiedId === item.id ? (
                          <Check aria-hidden="true" className="w-3.5 h-3.5 text-emerald-700 stroke-[2.25]" />
                        ) : (
                          <Copy aria-hidden="true" className="w-3.5 h-3.5 stroke-[1.75]" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => startEdit(item)}
                        className="btn-tactile-secondary bg-white w-9 h-9 rounded-xl flex items-center justify-center"
                        title={`Edit "${item.title}"`}
                        aria-label={`Edit "${item.title}"`}
                      >
                        <Edit3 aria-hidden="true" className="w-3.5 h-3.5 stroke-[1.75]" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteWithUndo(item)}
                        className="btn-tactile-secondary bg-white w-9 h-9 rounded-xl flex items-center justify-center text-rose-700 hover:bg-rose-50"
                        title={`Delete "${item.title}"`}
                        aria-label={`Delete "${item.title}"`}
                      >
                        <Trash2 aria-hidden="true" className="w-3.5 h-3.5 stroke-[1.75]" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs sm:text-[13px] text-[#52525B] leading-relaxed">
                    {item.content}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </div>
    </AccessibleModal>
  );
};
