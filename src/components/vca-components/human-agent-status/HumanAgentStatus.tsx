import { VcaIcon } from '../icons';
import { ButtonLink } from '../buttons';
import { cn } from '@/utils';

export type HumanAgentStatusState = 'connecting' | 'success';

export type HumanAgentStatusProps = {
  state?: HumanAgentStatusState;
  statusLabel?: string;
  description?: string;
  actionLabel?: string;
  showDescription?: boolean;
  showAction?: boolean;
  onAction?: () => void;
  className?: string;
};

/**
 * HumanAgentStatus - Shows connection status when transferring to live human agent
 * Two states: connecting (with spinner) and success (with checkmark)
 * Note: No built-in horizontal padding or width - parent container controls spacing
 */
export const HumanAgentStatus = ({
  state = 'success',
  statusLabel = 'Connected to live chat',
  description = 'Our team is joining soon for live chat. AI will not be responding at this moment.',
  actionLabel = 'Cancel',
  showDescription = true,
  showAction = true,
  onAction,
  className,
}: HumanAgentStatusProps) => {
  
  return (
    <div className={cn('bg-vca-surface-tint flex flex-col gap-vca-lg p-vca-lg rounded-tl-vca-md rounded-tr-vca-md rounded-br-vca-md rounded-bl-vca-sm', className)}>
      {/* Header - Status with icon/spinner */}
      <div className="flex gap-vca-s items-center">
            {/* Progress Indicator (connecting) or Success Icon */}
            {state === 'connecting' ? (
              <div className="relative w-5 h-5 shrink-0">
                {/* Track Circle */}
                <div className="absolute inset-0 border border-vca-text-meta rounded-full" />
                {/* Progress Circle - Spinning */}
                <div className="absolute inset-0 animate-spin">
                  <div className="w-full h-full border-2 border-transparent border-t-vca-action rounded-full" />
                </div>
              </div>
            ) : (
          <VcaIcon icon="signal-success" size="md" className="text-vca-text-positive shrink-0" />
            )}
            
            {/* Status Label */}
            <div className="flex flex-col justify-center flex-1">
          <p className="font-vca-text text-vca-small-bold text-vca-text">
                {statusLabel}
              </p>
            </div>
        </div>

        {/* Optional Description */}
        {showDescription && (
        <div className="flex items-start w-full">
          <p className="font-vca-text text-vca-small-open text-vca-text w-full">
              {description}
            </p>
          </div>
        )}

        {/* Optional Action Link */}
        {showAction && (
          <div className="flex items-start w-full">
            <ButtonLink 
              onClick={onAction}
            >
              {actionLabel}
            </ButtonLink>
          </div>
        )}
    </div>
  );
};

