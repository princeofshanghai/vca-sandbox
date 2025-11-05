import { VcaIcon } from '../icons';
import { ButtonIcon } from '../buttons';
import { ButtonLink } from '../buttons';
import { cn } from '@/utils';

export type AgentStatusState = 'connecting' | 'success';

export type AgentStatusProps = {
  state?: AgentStatusState;
  statusLabel?: string;
  description?: string;
  actionLabel?: string;
  showUndo?: boolean;
  showDescription?: boolean;
  showAction?: boolean;
  onUndo?: () => void;
  onAction?: () => void;
  className?: string;
};

/**
 * AgentStatus - Shows connection status when transferring to live agent
 * Two states: connecting (with spinner) and success (with checkmark)
 * Note: No built-in horizontal padding or width - parent container controls spacing
 */
export const AgentStatus = ({
  state = 'success',
  statusLabel = 'Connected to live chat',
  description = 'Our team is joining soon for live chat. AI will not be responding at this moment.',
  actionLabel = 'Cancel',
  showUndo = true,
  showDescription = true,
  showAction = true,
  onUndo,
  onAction,
  className,
}: AgentStatusProps) => {
  
  return (
    <div className={cn('flex flex-col gap-[10px] items-start', className)}>
      <div className="bg-[#f6fbff] flex flex-col gap-vca-lg p-vca-lg rounded-tl-vca-md rounded-tr-vca-md rounded-br-vca-md rounded-bl-vca-sm w-full">
        {/* Header - Status with icon/spinner and undo button */}
        <div className="flex items-center justify-between w-full">
          <div className="flex gap-vca-s items-start flex-1">
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
              <VcaIcon icon="check" size="md" className="text-vca-text shrink-0" />
            )}
            
            {/* Status Label */}
            <div className="flex flex-col justify-center flex-1">
              <p className="font-vca-text text-[14px] leading-[18px] font-semibold text-vca-text">
                {statusLabel}
              </p>
            </div>
          </div>
          
          {/* Optional Undo Button */}
          {showUndo && (
            <ButtonIcon 
              type="tertiary"
              size="md"
              emphasis={false}
              icon="undo"
              onClick={onUndo}
              ariaLabel="Undo"
            />
          )}
        </div>

        {/* Optional Description */}
        {showDescription && (
          <div className="flex gap-[10px] items-start w-full">
            <p className="font-vca-text text-[14px] leading-[21px] text-vca-text flex-1">
              {description}
            </p>
          </div>
        )}

        {/* Optional Action Link */}
        {showAction && (
          <ButtonLink 
            onClick={onAction}
          >
            {actionLabel}
          </ButtonLink>
        )}
      </div>
    </div>
  );
};

