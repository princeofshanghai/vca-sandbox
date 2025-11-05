import { cn } from '@/utils';

export type BadgeState = 'online' | 'offline';

export type BadgeProps = {
  state?: BadgeState;
  className?: string;
};

/**
 * Badge - Small circular status indicator
 * Used to show availability status (online/offline) on avatars
 */
export const Badge = ({
  state = 'online',
  className,
}: BadgeProps) => {
  
  const stateClasses = {
    online: 'bg-[#017550]', // Green - positive/available
    offline: 'bg-[#CB112D]', // Red - negative/unavailable
  };
  
  return (
    <div
      className={cn(
        'rounded-full w-2 h-2', // 8px
        stateClasses[state],
        className
      )}
      aria-label={`Status: ${state}`}
    />
  );
};

