import { VcaIcon } from '../icons';
import { ButtonLink } from '../buttons';
import { cn } from '@/utils';

export type AgentStatusState = 'connecting' | 'success';

export type AgentStatusProps = {
  state?: AgentStatusState;
  statusLabel?: string;
  agentName?: string;
  description?: string;
  actionLabel?: string;
  showDescription?: boolean;
  showAction?: boolean;
  onAction?: () => void;
  className?: string;
};

/**
 * AgentStatus - Shows connection status when transferring to live human agent
 * Two states: connecting (with spinner) and success (with checkmark)
 * Note: No built-in horizontal padding or width - parent container controls spacing
 */
export const AgentStatus = ({
  state = 'success',
  statusLabel = "You're next in line",
  agentName = 'Agent',
  description = 'A member of our team will join the chat soon.',
  actionLabel = 'Cancel',
  showDescription = true,
  showAction = true,
  onAction,
  className,
}: AgentStatusProps) => {

  // For success state, use agent name format and ignore description/action
  const displayLabel = state === 'success' ? `${agentName} has joined the chat` : statusLabel;
  const shouldShowDescription = state === 'connecting' && showDescription;
  const shouldShowAction = state === 'connecting' && showAction;

  return (
    <div className={cn('bg-vca-surface-tint flex flex-col gap-vca-lg p-vca-lg rounded-tl-vca-md rounded-tr-vca-md rounded-br-vca-md rounded-bl-vca-sm', className)}>
      {/* Header - Status with icon/spinner */}
      <div className="flex gap-vca-s items-center">
        {/* Progress Indicator (connecting) or Success Icon */}
        {state === 'connecting' ? (
          <div className="relative w-5 h-5 shrink-0">
            {/* Define keyframes locally to guarantee they exist */}
            <style>
              {`
                @keyframes vca-spin {
                  from { transform: rotate(0deg); }
                  to { transform: rotate(360deg); }
                }
              `}
            </style>

            {/* Track Circle */}
            <div className="absolute inset-0 border border-vca-text-meta opacity-20 rounded-full" />

            {/* Progress Circle - Spinning */}
            <div
              className="absolute inset-0"
              style={{ animation: 'vca-spin 1s linear infinite' }}
            >
              <div className="w-full h-full border-2 border-transparent border-t-vca-action rounded-full" />
            </div>
          </div>
        ) : (
          <VcaIcon icon="signal-success" size="md" className="text-vca-text-positive shrink-0" />
        )}

        {/* Status Label */}
        <div className="flex flex-col justify-center flex-1">
          <p className="font-vca-text text-vca-small-bold text-vca-text">
            {displayLabel}
          </p>
        </div>
      </div>

      {/* Optional Description (connecting state only) */}
      {shouldShowDescription && (
        <div className="flex items-start w-full">
          <p className="font-vca-text text-vca-small-open text-vca-text w-full">
            {description}
          </p>
        </div>
      )}

      {/* Optional Action Link (connecting state only) */}
      {shouldShowAction && (
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

