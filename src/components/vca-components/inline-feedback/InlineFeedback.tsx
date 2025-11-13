import { VcaIcon } from '../icons';
import { cn } from '@/utils';

export type InlineFeedbackType = 'negative' | 'neutral' | 'positive';

export type InlineFeedbackProps = {
  /** Type of feedback message */
  type?: InlineFeedbackType;
  /** Whether to show action button (only for negative type) */
  showAction?: boolean;
  /** Main message text */
  message?: string;
  /** Action button text (only for negative type) */
  actionText?: string;
  /** Action button click handler */
  onActionClick?: () => void;
  /** Additional CSS classes */
  className?: string;
};

/**
 * InlineFeedback - Inline success/error feedback message
 * 
 * Displays small status messages with icons for success or error states.
 * Used for showing message delivery status, form validation, etc.
 * 
 * @example
 * ```tsx
 * // Success message
 * <InlineFeedback type="positive" message="Success" />
 * 
 * // Error with retry action
 * <InlineFeedback 
 *   type="negative" 
 *   message="Not delivered."
 *   showAction={true}
 *   actionText="Try again"
 *   onActionClick={() => retry()}
 * />
 * ```
 */
export const InlineFeedback = ({ 
  type = 'positive',
  showAction = true,
  message,
  actionText = 'Try again',
  onActionClick,
  className,
}: InlineFeedbackProps) => {
  
  const isNegative = type === 'negative';
  const textColor = isNegative ? 'text-vca-text-negative' : 'text-vca-text-positive';
  const defaultMessage = isNegative ? 'Not delivered.' : 'Success';
  const displayMessage = message || defaultMessage;
  
  return (
    <div className={cn('flex gap-vca-xs items-center', className)}>
      <div className="flex gap-vca-s items-center">
        <VcaIcon 
          icon={isNegative ? 'signal-error' : 'signal-success'} 
          size="sm"
          className={textColor}
        />
        {/* ✅ Typography pattern: template literal with color variable */}
        <p className={`font-vca-text text-vca-xsmall-open whitespace-nowrap ${textColor}`}>
          {displayMessage}
        </p>
      </div>
      
      {showAction && isNegative && (
        <button
          onClick={onActionClick}
          className={`font-vca-text text-vca-xsmall-bold-open underline whitespace-nowrap ${textColor} cursor-pointer hover:opacity-80`}
          type="button"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

