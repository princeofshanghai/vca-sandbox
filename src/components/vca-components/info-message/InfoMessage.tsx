import { ReactNode } from 'react';
import { VcaIcon } from '../icons';
import { Feedback, FeedbackValue } from '../feedback';
import { Sources } from '../sources';
import { cn } from '@/utils';

export type InfoMessageProps = {

  status?: 'complete' | 'interrupted';
  title?: string;
  children?: ReactNode;
  sources?: Array<{
    text: string;
    href?: string;
    status?: 'enabled' | 'hover' | 'active' | 'visited';
  }>;
  feedbackValue?: FeedbackValue;
  onFeedbackChange?: (value: FeedbackValue) => void;
  className?: string;
};

/**
 * InfoMessage - AI-generated informational message
 */
export const InfoMessage = ({
  status = 'complete',
  title,
  children,
  sources,
  feedbackValue,
  onFeedbackChange,
  className,
}: InfoMessageProps) => {

  // Interrupted / Response Stopped state
  if (status === 'interrupted') {
    return (
      <div className={cn('flex flex-col gap-vca-xl items-start w-full', className)}>
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

  // Default / Complete state
  return (
    <div className={cn('flex flex-col items-start w-full', className)}>
      {/* Title and Message */}
      <div className="flex flex-col gap-vca-lg items-start w-full">
        {/* Optional Title */}
        {title && (
          <div className="flex flex-col justify-center min-w-full">
            <p className="font-vca-text text-vca-small-bold text-vca-text">
              {title}
            </p>
          </div>
        )}

        {/* Message Content (children) */}
        {children && (
          <div className="font-vca-text text-vca-small-open text-vca-text">
            {children}
          </div>
        )}
      </div>

      {/* Optional Sources */}
      {sources && sources.length > 0 && (
        <div className="mt-vca-xl w-full">
          <Sources sources={sources} />
        </div>
      )}

      {/* Optional Rating */}
      {onFeedbackChange && (
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

