import React, { useEffect, useState } from 'react';
import { X, Sparkles, Check, Image as ImageIcon } from 'lucide-react';
import { AccessibleModal } from '../ui/AccessibleModal';
import { BANNER_THEMES, EventBanner, getDefaultBannerTheme } from '../ui/EventBanner';
import { BannerThemeId, Opportunity } from '../../types';

export const BANNER_PHOTO_PRESETS: Array<{ label: string; url: string }> = [
  {
    label: 'None (Vector Art)',
    url: '',
  },
  {
    label: 'Builder Sprint',
    url: 'https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'AI Systems',
    url: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Main Stage Summit',
    url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Clean Climate',
    url: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=1200&q=80',
  },
];

export const BANNER_THEME_LABELS: Record<BannerThemeId, string> = {
  lavender_mesh: 'Lavender Mesh',
  emerald_circuit: 'Emerald Circuit',
  amber_horizon: 'Amber Horizon',
  indigo_grid: 'Indigo Grid',
};

interface BannerEditorModalProps {
  isOpen: boolean;
  opportunity: Opportunity | null;
  onClose: () => void;
  onSave: (opportunityId: string, banner: { bannerUrl?: string; bannerTheme?: BannerThemeId }) => void;
}

export const BannerEditorModal: React.FC<BannerEditorModalProps> = ({
  isOpen,
  opportunity,
  onClose,
  onSave,
}) => {
  const [bannerTheme, setBannerTheme] = useState<BannerThemeId>('lavender_mesh');
  const [bannerUrl, setBannerUrl] = useState('');

  useEffect(() => {
    if (!opportunity) return;
    setBannerTheme(opportunity.bannerTheme || getDefaultBannerTheme(opportunity.type));
    setBannerUrl(opportunity.bannerUrl || '');
  }, [opportunity, isOpen]);

  if (!opportunity) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(opportunity.id, {
      bannerTheme,
      bannerUrl: bannerUrl.trim() || undefined,
    });
    onClose();
  };

  return (
    <AccessibleModal
      isOpen={isOpen}
      onClose={onClose}
      titleId="banner-editor-title"
      descriptionId="banner-editor-desc"
      maxWidthClass="max-w-2xl"
    >
      <div className="p-5 sm:p-6 space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 id="banner-editor-title" className="text-lg font-bold text-[#18181B] tracking-tight">
              Customize Event Banner
            </h2>
            <p id="banner-editor-desc" className="text-xs text-[#52525B] mt-1 truncate">
              Updates banner artwork live for {opportunity.title}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close banner editor"
            className="w-9 h-9 rounded-xl bg-[#F4F4F6] hover:bg-[#E5E5EA] text-[#52525B] hover:text-[#18181B] flex items-center justify-center flex-shrink-0 transition-colors active:scale-[0.96]"
          >
            <X aria-hidden="true" className="w-4 h-4 stroke-[2]" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          {/* Live Preview */}
          <div className="rounded-2xl overflow-hidden bg-[#F4F4F6]">
            <EventBanner
              title={opportunity.title}
              type={opportunity.type}
              bannerTheme={bannerTheme}
              bannerUrl={bannerUrl.trim() || undefined}
              organizerName={opportunity.organizerName}
              variant="hero"
            />
          </div>

          {/* Geometric Backdrop Theme */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-[#18181B] block">
              Vector Backdrop Palette
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(Object.keys(BANNER_THEMES) as BannerThemeId[]).map((themeKey) => {
                const palette = BANNER_THEMES[themeKey];
                const isSelected = bannerTheme === themeKey;
                return (
                  <button
                    key={themeKey}
                    type="button"
                    onClick={() => setBannerTheme(themeKey)}
                    aria-pressed={isSelected}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors min-h-[40px] active:scale-[0.96] ${
                      isSelected
                        ? 'bg-[#18181B] text-white font-semibold'
                        : 'bg-[#F4F4F6] text-[#18181B] hover:bg-[#EAEAEF]'
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className="w-4 h-4 rounded-md flex-shrink-0"
                      style={{ backgroundColor: palette.secondary }}
                    />
                    <span className="truncate">{BANNER_THEME_LABELS[themeKey]}</span>
                    {isSelected && <Check aria-hidden="true" className="w-3.5 h-3.5 ms-auto flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Curated Photography Presets */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-[#18181B] flex items-center gap-1.5">
              <ImageIcon aria-hidden="true" className="w-3.5 h-3.5 text-[#52525B]" />
              <span>Quick Banner Presets</span>
            </span>
            <div className="flex flex-wrap gap-2">
              {BANNER_PHOTO_PRESETS.map((preset) => {
                const isSelected = bannerUrl.trim() === preset.url;
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setBannerUrl(preset.url)}
                    aria-pressed={isSelected}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors min-h-[34px] active:scale-[0.96] ${
                      isSelected
                        ? 'bg-[#EFE6FF] text-[#3B0764] font-semibold'
                        : 'bg-[#F4F4F6] text-[#52525B] hover:text-[#18181B] hover:bg-[#EAEAEF]'
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Image URL */}
          <div className="space-y-1.5">
            <label htmlFor="banner-editor-url" className="text-xs font-semibold text-[#18181B] block">
              Custom Cover Image URL (optional)
            </label>
            <input
              id="banner-editor-url"
              type="url"
              value={bannerUrl}
              onChange={(e) => setBannerUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F4F6] focus:bg-[#FFFFFF] text-sm text-[#18181B] placeholder:text-[#63636B]"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-tactile-secondary px-4 py-2.5 rounded-xl text-xs font-medium min-h-[40px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-tactile-primary px-5 py-2.5 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 min-h-[40px]"
            >
              <Sparkles aria-hidden="true" className="w-3.5 h-3.5 stroke-[2]" />
              <span>Save Banner</span>
            </button>
          </div>
        </form>
      </div>
    </AccessibleModal>
  );
};
