import { Avatar } from '../avatar';
import { cn } from '@/utils';

export type AgentTimestampProps = {
  /** Agent's first name */
  agentName?: string;
  /** Time of message (e.g., "1:32 PM") */
  timestamp?: string;
  /** Avatar image source */
  avatarSrc?: string;
  /** Show online badge on avatar */
  showBadge?: boolean;
  /** Additional CSS classes */
  className?: string;
};

/**
 * AgentTimestamp - Displays agent avatar, name, and timestamp
 * 
 * Used in human agent messages to show who sent the message and when.
 * Shows a real avatar with optional online status badge.
 * 
 * @example
 * ```tsx
 * <AgentTimestamp 
 *   agentName="Rose"
 *   timestamp="1:32 PM"
 *   showBadge={true}
 * />
 * ```
 */
export const AgentTimestamp = ({
  agentName = 'Agent',
  timestamp = '1:32 PM',
  avatarSrc,
  showBadge = true,
  className,
}: AgentTimestampProps) => {

  const displayText = `${agentName}  ${timestamp}`;

  return (
    <div className={cn('flex gap-vca-s items-center', className)}>
      <Avatar
        size={24}
        src={avatarSrc}
        alt={agentName}
        showBadge={showBadge}
        badgeState="online"
      />
      {/* ✅ Typography pattern: string concatenation (not cn()) */}
      <p className="font-vca-text text-vca-xsmall text-vca-text-meta whitespace-pre-wrap">
        {displayText}
      </p>
    </div>
  );
};

