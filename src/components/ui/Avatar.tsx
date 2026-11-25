import React, { useState } from 'react';

interface AvatarProps {
  src?: string;
  name: string;
  sizeClass?: string;
}

const AVATAR_TONES = [
  'bg-[#EFE6FF] text-[#3B0764]',
  'bg-[#ECFDF5] text-[#065F46]',
  'bg-[#FEF3C7] text-[#92400E]',
  'bg-[#EEF2FF] text-[#3730A3]',
];

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function getToneClass(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_TONES[Math.abs(hash) % AVATAR_TONES.length];
}

/**
 * Person avatar showing instant crisp initials until the remote photo finishes loading,
 * wrapped in a 10% black inner hairline outline to anchor light backgrounds cleanly.
 */
export const Avatar: React.FC<AvatarProps> = ({
  src,
  name,
  sizeClass = 'w-12 h-12 rounded-xl',
}) => {
  const [hasLoaded, setHasLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <div
      className={`relative overflow-hidden ${sizeClass} ${getToneClass(name)} outline outline-1 -outline-offset-1 outline-black/10 flex items-center justify-center font-semibold text-sm flex-shrink-0 select-none`}
    >
      <span aria-hidden={Boolean(src && hasLoaded && !hasError)}>{getInitials(name)}</span>
      {src && !hasError && (
        <img
          src={src}
          alt={name}
          onLoad={() => setHasLoaded(true)}
          onError={() => setHasError(true)}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-200 ${
            hasLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}
    </div>
  );
};
