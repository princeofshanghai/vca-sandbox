import { useState } from 'react';
import { VcaIcon } from '../icons';
import { cn } from '@/utils';

export type FeedbackValue = 'up' | 'down' | null;

export type FeedbackProps = {
  value?: FeedbackValue;
  onChange?: (value: FeedbackValue) => void;
  disabled?: boolean;
  className?: string;
};

/**
 * Feedback - Thumbs up/down feedback component
 * Allows users to give positive or negative feedback on AI responses
 * Mutually exclusive selection - only one can be selected at a time
 */
export const Feedback = ({
  value: controlledValue,
  onChange,
  disabled = false,
  className,
}: FeedbackProps) => {
  // Internal state for uncontrolled mode
  const [internalValue, setInternalValue] = useState<FeedbackValue>(null);
  
  // Use controlled value if provided, otherwise use internal state
  const value = controlledValue !== undefined ? controlledValue : internalValue;
  
  const handleClick = (newValue: 'up' | 'down') => {
    if (disabled) return;
    
    // Toggle: if clicking the same value, deselect it
    const nextValue = value === newValue ? null : newValue;
    
    // Update internal state if uncontrolled
    if (controlledValue === undefined) {
      setInternalValue(nextValue);
    }
    
    // Call onChange callback
    onChange?.(nextValue);
  };
  
  // Base button styles - matches ButtonIcon secondary, low emphasis, small
  const baseButtonClasses = cn(
    'flex items-center justify-center rounded-full transition-colors',
    'w-8 h-8 p-vca-s', // Small size (32px)
    'border border-vca-border-faint text-vca-text', // Custom border color
    !disabled && 'hover:bg-vca-background-transparent-hover hover:border-vca-border-faint-hover hover:border-2',
    !disabled && 'active:bg-vca-background-transparent-active active:border-vca-border-faint-active',
    disabled && 'bg-vca-background-disabled border-none text-vca-text-disabled cursor-not-allowed'
  );
  
  return (
    <div className={cn('flex items-center gap-vca-md', className)}>
      {/* Thumbs Up Button */}
      {(!value || value === 'up') && (
        <button
          type="button"
          onClick={() => handleClick('up')}
          disabled={disabled}
          aria-label="Thumbs up"
          className={baseButtonClasses}
        >
          <VcaIcon 
            icon={value === 'up' ? 'thumbs-up-fill' : 'thumbs-up-outline'} 
            size="sm" 
          />
        </button>
      )}
      
      {/* Thumbs Down Button */}
      {(!value || value === 'down') && (
        <button
          type="button"
          onClick={() => handleClick('down')}
          disabled={disabled}
          aria-label="Thumbs down"
          className={baseButtonClasses}
        >
          <VcaIcon 
            icon={value === 'down' ? 'thumbs-down-fill' : 'thumbs-down-outline'} 
            size="sm" 
          />
        </button>
      )}
    </div>
  );
};

