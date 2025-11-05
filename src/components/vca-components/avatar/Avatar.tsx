import { Badge, BadgeState } from '../badge';
import { cn } from '@/utils';

export type AvatarSize = 20 | 24 | 32;

export type AvatarProps = {
  size?: AvatarSize;
  src?: string;
  alt?: string;
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
  showBadge = false,
  badgeState = 'online',
  className,
}: AvatarProps) => {
  
  // Size classes
  const sizeClasses = {
    20: 'w-5 h-5',
    24: 'w-6 h-6',
    32: 'w-8 h-8',
  };
  
  // Badge positioning based on avatar size
  const badgePositionClasses = {
    20: 'bottom-0 right-0',
    24: 'bottom-0 right-0',
    32: 'bottom-0 right-0',
  };
  
  return (
    <div className={cn('relative inline-block', sizeClasses[size], className)}>
      {/* Avatar Image */}
      <img
        src={src || `https://i.pravatar.cc/${size}`}
        alt={alt}
        className="w-full h-full rounded-full object-cover"
      />
      
      {/* Status Badge */}
      {showBadge && (
        <div className={cn('absolute', badgePositionClasses[size])}>
          <Badge state={badgeState} />
        </div>
      )}
    </div>
  );
};

