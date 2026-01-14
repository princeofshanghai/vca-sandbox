import { ReactNode } from 'react';
import { VcaIcon } from '../icons';
import { Feedback, FeedbackValue } from '../feedback';
import { Sources } from '../sources';
import { cn } from '@/utils';

export type InfoMessageProps = {
  type?: 'default' | 'response-stopped';
  title?: string;
  message?: string | ReactNode;
  showTitle?: boolean;
  showResponseStopped?: boolean;
  showSources?: boolean;
  showRating?: boolean;
  sources?: Array<{
    text: string;
    href?: string;
    state?: 'enabled' | 'hover' | 'active' | 'visited';
  }>;
  feedbackValue?: FeedbackValue;
  onFeedbackChange?: (value: FeedbackValue) => void;
  className?: string;
};

/**
 * InfoMessage - AI-generated informational message with optional title, divider, sources, and rating
 * Plain layout without background container, similar to AI message type
 * Note: No built-in horizontal padding or width - parent container controls spacing
 */
export const InfoMessage = ({
  type = 'default',
  title,
  message,
  showTitle = true,
  showResponseStopped = false,
  showSources = true,
  showRating = true,
  sources,
  feedbackValue,
  onFeedbackChange,
  className,
}: InfoMessageProps) => {

  // Response stopped variant - simplified
  if (type === 'response-stopped') {
    return (
      <div className={cn('flex flex-col gap-vca-xl items-start w-full', className)}>
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
    );
  }

  // Default variant - full featured
  return (
    <div className={cn('flex flex-col items-start w-full', className)}>
      {/* Title and Message with 16px gap */}
      <div className="flex flex-col gap-vca-lg items-start w-full">
        {/* Optional Title */}
        {showTitle && title && (
          <div className="flex flex-col justify-center min-w-full">
            <p className="font-vca-text text-vca-small-bold text-vca-text">
              {title}
            </p>
          </div>
        )}

        {/* Message Text */}
        <div className="font-vca-text text-vca-small-open text-vca-text">
          {message}
        </div>
      </div>

      {/* Optional Response Stopped Feedback */}
      {showResponseStopped && (
        <div className="flex gap-vca-xs items-center w-full mt-vca-xl">
          <div className="flex gap-vca-xs items-center flex-1">
            <VcaIcon icon="close" size="sm" className="text-vca-text-neutral" />
            <p className="font-vca-text text-vca-small text-vca-text-neutral">
              Response stopped
            </p>
          </div>
        </div>
      )}

      {/* Optional Sources - 20px gap from message */}
      {showSources && sources && (
        <div className="mt-vca-xl w-full">
          <Sources sources={sources} />
        </div>
      )}

      {/* Optional Rating - 20px gap from sources */}
      {showRating && (
        <div className="flex items-center justify-start w-full mt-vca-xl">
          <Feedback
            value={feedbackValue}
            onChange={onFeedbackChange}
          />
        </div>
      )}
    </div>
  );
};

