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

  const getFeedbackStyles = () => {
    switch (type) {
      case 'negative':
        return {
          icon: 'signal-error' as const,
          iconColor: 'text-vca-text-negative',
          textColor: 'text-vca-text-negative',
          defaultMessage: 'Not delivered.',
        };
      case 'neutral':
        return {
          icon: 'signal-notice' as const,
          iconColor: 'text-vca-icon',
          textColor: 'text-vca-text-neutral',
          defaultMessage: 'Response stopped',
        };
      case 'positive':
      default:
        return {
          icon: 'signal-success' as const,
          iconColor: 'text-vca-text-positive',
          textColor: 'text-vca-text-positive',
          defaultMessage: 'Success',
        };
    }
  };

  const styles = getFeedbackStyles();
  const displayMessage = message || styles.defaultMessage;
  const isNegative = type === 'negative';

  return (
    <div className={cn('flex gap-vca-xs items-center', className)}>
      <div className="flex gap-vca-s items-center">
        <VcaIcon
          icon={styles.icon}
          size="sm"
          className={styles.iconColor}
        />
        {/* ✅ Typography pattern: template literal with color variable */}
        <p className={`font-vca-text text-vca-xsmall-open whitespace-nowrap ${styles.textColor}`}>
          {displayMessage}
        </p>
      </div>

      {showAction && isNegative && (
        <button
          onClick={onActionClick}
          className={`font-vca-text text-vca-xsmall-bold-open underline whitespace-nowrap ${styles.textColor} cursor-pointer hover:opacity-80`}
          type="button"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

