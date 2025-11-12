import { VcaIcon } from '../icons';
import { ButtonIcon } from '../buttons';
import { Sources } from '../sources';
import { cn } from '@/utils';

export type AIInformationMessageProps = {
  type?: 'default' | 'response-stopped';
  title?: string;
  message?: string;
  showTitle?: boolean;
  showDivider?: boolean;
  showResponseStopped?: boolean;
  showSources?: boolean;
  showRating?: boolean;
  sources?: Array<{
    text: string;
    href?: string;
    state?: 'enabled' | 'hover' | 'active' | 'visited';
  }>;
  onThumbsUp?: () => void;
  onThumbsDown?: () => void;
  className?: string;
};

/**
 * AIInformationMessage - AI-generated informational message with optional title, divider, sources, and rating
 * Light blue background card for additional context and information
 * Note: No built-in horizontal padding or width - parent container controls spacing
 */
export const AIInformationMessage = ({
  type = 'default',
  title = 'Optional title',
  message = 'This is the message this is the message this is the message this is the message this is the message.',
  showTitle = true,
  showDivider = true,
  showResponseStopped = false,
  showSources = true,
  showRating = true,
  sources,
  onThumbsUp,
  onThumbsDown,
  className,
}: AIInformationMessageProps) => {
  
  // Response stopped variant - simplified
  if (type === 'response-stopped') {
    return (
      <div className={cn('flex flex-col gap-[10px] items-start', className)}>
        <div className="bg-vca-surface-tint flex flex-col gap-vca-lg p-vca-lg rounded-tl-vca-md rounded-tr-vca-md rounded-br-vca-md rounded-bl-vca-sm w-full">
          {/* Response Stopped Feedback */}
          <div className="flex gap-vca-xs items-center w-full">
            <div className="flex gap-vca-xs items-center flex-1">
              <VcaIcon icon="close" size="sm" className="text-vca-text-neutral" />
              <p className="font-vca-text text-vca-small text-vca-text-neutral">
                Response stopped
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Default variant - full featured
  return (
    <div className={cn('flex flex-col gap-[10px] items-start', className)}>
      <div className="bg-vca-surface-tint flex flex-col gap-vca-lg p-vca-lg rounded-tl-vca-md rounded-tr-vca-md rounded-br-vca-md rounded-bl-vca-sm w-full">
        {/* Optional Title */}
        {showTitle && (
          <div className="flex flex-col justify-center min-w-full">
            <p className="font-vca-text text-vca-small-bold text-vca-text">
              {title}
            </p>
          </div>
        )}

        {/* Message Text */}
        <p className="font-vca-text text-vca-small-open text-vca-text">
          {message}
        </p>

        {/* Optional Divider */}
        {showDivider && (
          <div className="h-0 w-full border-t border-vca-border-faint" />
        )}

        {/* Optional Response Stopped Feedback */}
        {showResponseStopped && (
          <div className="flex gap-vca-xs items-center w-full">
            <div className="flex gap-vca-xs items-center flex-1">
              <VcaIcon icon="close" size="sm" className="text-vca-text-neutral" />
              <p className="font-vca-text text-vca-small text-vca-text-neutral">
                Response stopped
              </p>
            </div>
          </div>
        )}

        {/* Optional Sources */}
        {showSources && sources && (
          <Sources sources={sources} />
        )}

        {/* Optional Rating */}
        {showRating && (
          <div className="flex gap-vca-s items-center justify-end w-full">
            <ButtonIcon 
              type="tertiary"
              size="md"
              emphasis={false}
              icon="thumbs-up-outline"
              onClick={onThumbsUp}
              ariaLabel="Good response"
            />
            <ButtonIcon 
              type="tertiary"
              size="md"
              emphasis={false}
              icon="thumbs-down-outline"
              onClick={onThumbsDown}
              ariaLabel="Bad response"
            />
          </div>
        )}
      </div>
    </div>
  );
};

