import React, { useEffect, useState } from 'react';
import { BannerThemeId, OpportunityType } from '../../types';

interface EventBannerProps {
  title: string;
  type: OpportunityType;
  bannerUrl?: string;
  bannerTheme?: BannerThemeId;
  organizerName?: string;
  variant?: 'card' | 'hero' | 'preview';
  className?: string;
  badgeSlot?: React.ReactNode;
}

interface BannerPalette {
  bg: string;
  primary: string;
  secondary: string;
  ink: string;
  pillBg: string;
}

export const BANNER_THEMES: Record<BannerThemeId, BannerPalette> = {
  lavender_mesh: {
    bg: '#EFE6FF',
    primary: '#D7BBFF',
    secondary: '#C49BFF',
    ink: '#3B0764',
    pillBg: 'bg-white/90 text-[#18181B]',
  },
  emerald_circuit: {
    bg: '#E6F9F0',
    primary: '#B9F0D6',
    secondary: '#7DE2B4',
    ink: '#065F46',
    pillBg: 'bg-white/90 text-[#065F46]',
  },
  amber_horizon: {
    bg: '#FEF3C7',
    primary: '#FDE08D',
    secondary: '#F9C74F',
    ink: '#92400E',
    pillBg: 'bg-white/90 text-[#92400E]',
  },
  indigo_grid: {
    bg: '#EAEFFF',
    primary: '#CDD9FF',
    secondary: '#A5BAFF',
    ink: '#3730A3',
    pillBg: 'bg-white/90 text-[#3730A3]',
  },
};

export function getDefaultBannerTheme(type: OpportunityType): BannerThemeId {
  switch (type) {
    case 'grant':
      return 'emerald_circuit';
    case 'event':
      return 'amber_horizon';
    case 'venture_hub':
      return 'indigo_grid';
    case 'hackathon':
    default:
      return 'lavender_mesh';
  }
}

/**
 * Flat borderless & shadowless event banner that paints deterministic editorial vector
 * artwork immediately and cross-fades optional photographic imagery on load.
 */
export const EventBanner: React.FC<EventBannerProps> = ({
  title,
  type,
  bannerUrl,
  bannerTheme,
  organizerName,
  variant = 'card',
  className = '',
  badgeSlot,
}) => {
  const [hasLoaded, setHasLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasLoaded(false);
    setHasError(false);
  }, [bannerUrl]);

  const resolvedThemeId = bannerTheme || getDefaultBannerTheme(type);
  const palette = BANNER_THEMES[resolvedThemeId] || BANNER_THEMES.lavender_mesh;

  const heightClasses =
    variant === 'hero'
      ? 'h-40 sm:h-52'
      : variant === 'preview'
      ? 'h-28'
      : 'h-32 sm:h-36';

  const showPhoto = Boolean(bannerUrl && hasLoaded && !hasError);

  return (
    <div
      style={{ backgroundColor: palette.bg }}
      className={`relative w-full overflow-hidden select-none ${heightClasses} ${className}`}
    >
      {/* Instant SVG Editorial Backdrop */}
      <svg
        aria-hidden="true"
        viewBox="0 0 800 320"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 w-full h-full pointer-events-none"
      >
        <rect width="800" height="320" fill={palette.bg} />
        <circle cx="670" cy="70" r="175" fill={palette.primary} opacity="0.65" />
        <circle cx="725" cy="250" r="135" fill={palette.secondary} opacity="0.45" />
        <path
          d="M-40 280 C 180 180, 380 310, 620 190 S 760 120, 840 160 L 840 340 L -40 340 Z"
          fill={palette.primary}
          opacity="0.42"
        />
        <g stroke={palette.ink} strokeOpacity="0.09" strokeWidth="1.2">
          <line x1="0" y1="80" x2="800" y2="80" />
          <line x1="0" y1="160" x2="800" y2="160" />
          <line x1="0" y1="240" x2="800" y2="240" />
          <line x1="200" y1="0" x2="200" y2="320" />
          <line x1="400" y1="0" x2="400" y2="320" />
          <line x1="600" y1="0" x2="600" y2="320" />
        </g>
      </svg>

      {/* Optional Photographic Banner Overlay */}
      {bannerUrl && !hasError && (
        <img
          src={bannerUrl}
          alt={`${title} event banner`}
          loading="lazy"
          onLoad={() => setHasLoaded(true)}
          onError={() => setHasError(true)}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
            showPhoto ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}

      {/* Subtle Readability Scrim Only When Photo Loaded */}
      {showPhoto && (
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent pointer-events-none"
        />
      )}

      {/* Clean Overlay Metadata Strip */}
      {(organizerName || badgeSlot) && (
        <div className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-2 z-10">
          {organizerName ? (
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-semibold backdrop-blur-md truncate max-w-[75%] ${
                showPhoto ? 'bg-[#18181B]/80 text-white' : palette.pillBg
              }`}
            >
              Hosted by {organizerName}
            </span>
          ) : (
            <span />
          )}

          {badgeSlot && <div className="flex-shrink-0">{badgeSlot}</div>}
        </div>
      )}
    </div>
  );
};
