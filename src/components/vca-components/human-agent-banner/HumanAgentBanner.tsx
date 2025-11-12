import { Avatar } from '../avatar';
import { ButtonLink } from '../buttons';

export type HumanAgentBannerProps = {
  agentName?: string;
  onEndChat?: () => void;
  className?: string;
};

/**
 * HumanAgentBanner - Banner showing active live chat with human agent
 * Displays agent avatar, name, and option to end the live chat session
 */
export const HumanAgentBanner = ({
  agentName = 'Agent',
  onEndChat,
  className,
}: HumanAgentBannerProps) => {
  return (
    <div className={`bg-vca-surface-tint w-full ${className || ''}`}>
      <div className="flex items-center justify-between px-vca-lg py-vca-md">
        {/* Left: Avatar + Name */}
        <div className="flex items-center gap-vca-md">
          <Avatar size={24} showBadge badgeState="online" />
          <span className="font-vca-text text-vca-small-bold text-vca-text">
            Live chat with {agentName}
          </span>
        </div>
        
        {/* Right: End chat action */}
        <ButtonLink onClick={onEndChat}>
          End live chat
        </ButtonLink>
      </div>
    </div>
  );
};

