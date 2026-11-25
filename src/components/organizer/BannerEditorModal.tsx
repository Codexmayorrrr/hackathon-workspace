import React, { useEffect, useState } from 'react';
import { Sparkles, Check, Image as ImageIcon, Palette } from 'lucide-react';
import { AccessibleModal } from '../ui/AccessibleModal';
import { BANNER_THEMES, EventBanner, getDefaultBannerTheme } from '../ui/EventBanner';
import { BannerThemeId, Opportunity } from '../../types';

export const BANNER_PHOTO_PRESETS: Array<{ label: string; url: string }> = [
  {
    label: 'Vector artwork only',
    url: '',
  },
  {
    label: 'Builder sprint',
    url: 'https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'AI systems',
    url: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Main stage summit',
    url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Clean climate',
    url: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=1200&q=80',
  },
];

export const BANNER_THEME_LABELS: Record<BannerThemeId, string> = {
  lavender_mesh: 'Lavender',
  emerald_circuit: 'Emerald',
  amber_horizon: 'Amber',
  indigo_grid: 'Indigo',
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
      title="Customize event banner"
      description={`Changes apply live across ${opportunity.title} listings.`}
      icon={<Palette className="w-4 h-4 stroke-[1.75]" />}
      iconToneClass="bg-[#EFE6FF] text-[#3B0764]"
      closeLabel="Close banner editor"
      footer={
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="btn-tactile-secondary px-4 py-2.5 rounded-xl text-xs font-medium min-h-[40px]"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="banner-editor-form"
            className="btn-tactile-primary px-5 py-2.5 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 min-h-[40px]"
          >
            <Sparkles aria-hidden="true" className="w-3.5 h-3.5 stroke-[2]" />
            <span>Save banner</span>
          </button>
        </div>
      }
    >
      <form id="banner-editor-form" onSubmit={handleSave} className="space-y-5">
        {/* Live Preview */}
        <div className="rounded-xl overflow-hidden bg-[#F4F4F6]">
          <EventBanner
            title={opportunity.title}
            type={opportunity.type}
            bannerTheme={bannerTheme}
            bannerUrl={bannerUrl.trim() || undefined}
            organizerName={opportunity.organizerName}
            variant="hero"
          />
        </div>

        {/* Vector Backdrop Palette */}
        <div className="space-y-2.5">
          <span className="text-sm font-semibold text-[#18181B] block">
            Vector backdrop palette
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
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs transition-colors min-h-[40px] active:scale-[0.96] ${
                    isSelected
                      ? 'bg-[#18181B] text-white font-semibold'
                      : 'bg-[#F4F4F6] text-[#18181B] font-medium hover:bg-[#EAEAEF]'
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className="w-3.5 h-3.5 rounded-sm flex-shrink-0"
                    style={{ backgroundColor: palette.secondary }}
                  />
                  <span className="truncate">{BANNER_THEME_LABELS[themeKey]}</span>
                  {isSelected && <Check aria-hidden="true" className="w-3.5 h-3.5 ms-auto flex-shrink-0 stroke-[2.2]" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Curated Photography Presets */}
        <div className="space-y-2.5">
          <span className="text-sm font-semibold text-[#18181B] flex items-center gap-2">
            <ImageIcon aria-hidden="true" className="w-4 h-4 text-[#52525B] stroke-[1.75]" />
            <span>Cover photo presets</span>
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
                  className={`px-3 py-1.5 rounded-xl text-xs transition-colors min-h-[36px] active:scale-[0.96] ${
                    isSelected
                      ? 'bg-[#EFE6FF] text-[#3B0764] font-semibold'
                      : 'bg-[#F4F4F6] text-[#52525B] font-medium hover:text-[#18181B] hover:bg-[#EAEAEF]'
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
          <label htmlFor="banner-editor-url" className="text-xs font-medium text-[#52525B] block">
            Custom cover image URL (optional)
          </label>
          <input
            id="banner-editor-url"
            type="url"
            value={bannerUrl}
            onChange={(e) => setBannerUrl(e.target.value)}
            placeholder="https://example.com/banner.jpg"
            className="field-surface w-full rounded-xl px-3.5 py-2.5 text-base sm:text-sm"
          />
        </div>
      </form>
    </AccessibleModal>
  );
};
