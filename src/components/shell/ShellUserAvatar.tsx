import { useEffect, useMemo, useState } from 'react';
import { cn } from '@/utils/cn';
import { getInitialsFromName } from '@/utils/userIdentity';

export type ShellUserAvatarTone = 'default' | 'cinematicDark';

type ShellUserAvatarProps = {
  name: string;
  avatarUrl?: string | null;
  alt?: string;
  sizeClassName: string;
  textClassName?: string;
  className?: string;
  fallbackLabel?: string;
  tone?: ShellUserAvatarTone;
};

const toneClasses: Record<ShellUserAvatarTone, { container: string; text: string }> = {
  default: {
    container: 'border border-shell-accent-border/80 bg-shell-accent-soft',
    text: 'text-shell-accent-text',
  },
  cinematicDark: {
    container: 'border border-shell-dark-accent/30 bg-shell-dark-accent-soft',
    text: 'text-shell-dark-accent-text',
  },
};

export function ShellUserAvatar({
  name,
  avatarUrl,
  alt = '',
  sizeClassName,
  textClassName,
  className,
  fallbackLabel,
  tone = 'default',
}: ShellUserAvatarProps) {
  const [didSrcFail, setDidSrcFail] = useState(false);

  useEffect(() => {
    setDidSrcFail(false);
  }, [avatarUrl]);

  const trimmedAvatarUrl = avatarUrl?.trim() || null;
  const shouldShowImage = Boolean(trimmedAvatarUrl) && !didSrcFail;
  const initials = useMemo(
    () => (fallbackLabel?.trim() ? fallbackLabel.trim().toUpperCase() : getInitialsFromName(name)),
    [fallbackLabel, name]
  );
  const resolvedTone = toneClasses[tone];

  return (
    <span
      className={cn(
        'block overflow-hidden rounded-full',
        resolvedTone.container,
        sizeClassName,
        className
      )}
    >
      {shouldShowImage ? (
        <img
          src={trimmedAvatarUrl!}
          alt={alt}
          className="h-full w-full object-cover"
          onError={() => setDidSrcFail(true)}
        />
      ) : (
        <span
          className={cn(
            'flex h-full w-full items-center justify-center font-semibold leading-none',
            resolvedTone.text,
            textClassName
          )}
        >
          {initials}
        </span>
      )}
    </span>
  );
}
