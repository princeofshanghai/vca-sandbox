import { useEffect, useState } from 'react';
import { Badge, BadgeState } from '../badge';
import { cn } from '@/utils';

export type AvatarSize = 20 | 24 | 32;
export type AvatarFallbackStyle = 'photo-default' | 'silhouette';
export type AvatarFallbackTone = 'amber' | 'rose' | 'green' | 'blue' | 'taupe';

export type AvatarProps = {
  size?: AvatarSize;
  src?: string;
  alt?: string;
  fallbackStyle?: AvatarFallbackStyle;
  fallbackTone?: AvatarFallbackTone;
  showBadge?: boolean;
  badgeState?: BadgeState;
  className?: string;
};

/**
 * Avatar - Circular profile image with optional status badge
 * Used to display user profile pictures with availability status
 */
export const Avatar = ({
  size = 20,
  src,
  alt = 'User avatar',
  fallbackStyle = 'photo-default',
  fallbackTone = 'blue',
  showBadge = false,
  badgeState = 'online',
  className,
}: AvatarProps) => {
  const [didSrcFail, setDidSrcFail] = useState(false);
  const [didDefaultPhotoFail, setDidDefaultPhotoFail] = useState(false);

  useEffect(() => {
    setDidSrcFail(false);
    setDidDefaultPhotoFail(false);
  }, [src]);

  // Size classes
  const sizeClasses = {
    20: 'w-5 h-5',
    24: 'w-6 h-6',
    32: 'w-8 h-8',
  };
  
  // Badge positioning based on avatar size
  const badgePositionClasses = {
    20: '-bottom-0.5 -right-1.5',
    24: '-bottom-0.5 -right-1.5',
    32: '-bottom-0.5 -right-1.5',
  };

  const toneClasses = {
    amber: 'text-[#b77a1a]',
    rose: 'text-[#b57a6c]',
    green: 'text-[#6f9468]',
    blue: 'text-[#7b9ab8]',
    taupe: 'text-[#8f8777]',
  };

  const shouldUseSrc = Boolean(src) && !didSrcFail;
  const shouldUseDefaultPhoto = fallbackStyle === 'photo-default' && !shouldUseSrc && !didDefaultPhotoFail;
  const imageSrc = shouldUseSrc ? src : shouldUseDefaultPhoto ? '/avatar.jpg' : undefined;

  const handleImageError = () => {
    if (shouldUseSrc) {
      setDidSrcFail(true);
      return;
    }
    if (shouldUseDefaultPhoto) {
      setDidDefaultPhotoFail(true);
    }
  };
  
  return (
    <div className={cn('relative inline-block', sizeClasses[size], className)}>
      {imageSrc ? (
        <img
          src={imageSrc}
          alt={alt}
          className="w-full h-full rounded-full object-cover"
          onError={handleImageError}
        />
      ) : (
        <div
          role="img"
          aria-label={alt}
          className="w-full h-full rounded-full overflow-hidden bg-vca-background-neutral-soft"
        >
          <div className={cn('w-full h-full relative', toneClasses[fallbackTone])}>
            <div className="absolute left-1/2 top-[20%] -translate-x-1/2 w-[46%] h-[46%] rounded-full bg-current opacity-80" />
            <div className="absolute left-1/2 -bottom-[3%] -translate-x-1/2 w-[92%] h-[58%] rounded-t-[999px] bg-current opacity-60" />
          </div>
        </div>
      )}
      
      {/* Status Badge */}
      {showBadge && (
        <div className={cn('absolute', badgePositionClasses[size])}>
          <Badge state={badgeState} />
        </div>
      )}
    </div>
  );
};
