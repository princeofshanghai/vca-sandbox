import { VcaIcon } from '../icons';
import { Button } from '../buttons';
import { cn } from '@/utils';

export type RecommendationState = 'default' | 'applied' | 'dismissed';

export type RecommendationProps = {
  state?: RecommendationState;
  title?: string;
  impactText?: string;
  description?: string;
  onApply?: () => void;
  onDismiss?: () => void;
  className?: string;
};

/**
 * Recommendation - AI-powered action suggestion component
 * Shows recommended actions with impact, supporting default/applied/dismissed states
 * Note: No built-in horizontal padding or width - parent container controls spacing
 */
export const Recommendation = ({
  state = 'default',
  title = 'Recommended action',
  impactText = 'impact',
  description = 'Description',
  onApply,
  onDismiss,
  className,
}: RecommendationProps) => {
  
  return (
    <div className={cn('flex flex-col gap-vca-lg items-start', className)}>
      <div className="bg-vca-surface-tint flex flex-col gap-vca-lg p-vca-lg rounded-tl-vca-md rounded-tr-vca-md rounded-br-vca-md rounded-bl-vca-sm w-full">
        {/* Header */}
        <div className="flex flex-col gap-vca-s items-start w-full">
          <div className="flex gap-vca-s items-center w-full">
            <p className="font-vca-text text-vca-small-bold text-vca-text flex-1">
              {title} + <span className="text-vca-text-positive">{impactText}</span>
            </p>
          </div>
        </div>

        {/* Description */}
        <div className="flex flex-col gap-vca-md items-start w-full">
          <p className="font-vca-text text-vca-small-open text-vca-text w-full">
            {description}
          </p>
        </div>

        {/* Actions or Feedback */}
        {state === 'default' && (
          <div className="flex items-start w-full gap-vca-none">
            <Button 
              variant="secondary" 
              emphasis={true}
              onClick={onApply}
            >
              Apply
            </Button>
            <Button 
              variant="tertiary" 
              emphasis={false}
              onClick={onDismiss}
            >
              Dismiss
            </Button>
          </div>
        )}

        {state === 'applied' && (
          <div className="flex gap-vca-xs items-center w-full">
            <div className="flex gap-vca-xs items-center flex-1">
              <VcaIcon icon="signal-success" size="sm" className="text-vca-text-positive" />
              <p className="font-vca-text text-vca-small text-vca-text-positive">
                Applied
              </p>
            </div>
          </div>
        )}

        {state === 'dismissed' && (
          <div className="flex gap-vca-xs items-center w-full">
            <div className="flex gap-vca-xs items-center flex-1">
              <VcaIcon icon="close" size="sm" className="text-vca-text-neutral" />
              <p className="font-vca-text text-vca-small text-vca-text-neutral">
                Dismissed
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

