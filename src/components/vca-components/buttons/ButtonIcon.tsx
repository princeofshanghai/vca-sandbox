import { VcaIcon, VcaIconName } from '../icons';
import { cn } from '@/utils';

export type ButtonIconType = 'primary' | 'secondary' | 'tertiary';
export type ButtonIconSize = 'sm' | 'md';

export type ButtonIconProps = {
  variant?: ButtonIconType;
  size?: ButtonIconSize;
  emphasis?: boolean;
  disabled?: boolean;
  icon: VcaIconName;
  onClick?: () => void;
  className?: string;
  ariaLabel?: string;
};

/**
 * ButtonIcon - Icon-only circular button
 * Compact button for actions represented by icons (send, close, etc.)
 */
export const ButtonIcon = ({
  variant = 'primary',
  size = 'sm',
  emphasis = true,
  disabled = false,
  icon,
  onClick,
  className,
  ariaLabel,
}: ButtonIconProps) => {

  // Size classes
  const sizeClasses = {
    sm: 'w-8 h-8 p-vca-s', // 32px
    md: 'w-12 h-12 p-vca-md', // 48px
  };

  // Icon sizes
  const iconSizeMap = {
    sm: 'sm' as const,
    md: 'md' as const,
  };

  // Base styles - always circular
  const baseClasses = 'flex items-center justify-center rounded-full transition-colors';

  // Type & emphasis combinations
  let variantClasses = '';

  if (variant === 'primary') {
    if (emphasis) {
      // Primary Emphasis - Blue background
      variantClasses = cn(
        'bg-vca-action text-white',
        !disabled && 'hover:bg-vca-action-hover active:bg-vca-action-active',
        disabled && 'bg-vca-background-disabled text-vca-text-disabled cursor-not-allowed'
      );
    } else {
      // Primary Low Emphasis - Dark overlay background
      variantClasses = cn(
        'bg-vca-background-overlay text-white',
        !disabled && 'hover:bg-vca-background-overlay-hover active:bg-vca-background-overlay-active',
        disabled && 'bg-vca-background-disabled text-vca-text-disabled cursor-not-allowed'
      );
    }
  } else if (variant === 'secondary') {
    if (emphasis) {
      // Secondary Emphasis - Blue border
      variantClasses = cn(
        'border border-vca-action text-vca-action',
        !disabled && 'hover:bg-vca-background-action-transparent-hover hover:border-vca-action-hover hover:border-2 hover:text-vca-action-hover',
        !disabled && 'active:bg-vca-background-action-transparent-active active:border-vca-action-active active:text-vca-action-active',
        disabled && 'bg-vca-background-disabled border-none text-vca-text-disabled cursor-not-allowed'
      );
    } else {
      // Secondary Low Emphasis - Neutral border
      variantClasses = cn(
        'border border-vca-border text-vca-text',
        !disabled && 'hover:bg-vca-background-transparent-hover hover:border-vca-border-hover hover:border-2',
        !disabled && 'active:bg-vca-background-transparent-active active:border-vca-border-active',
        disabled && 'bg-vca-background-disabled border-none text-vca-text-disabled cursor-not-allowed'
      );
    }
  } else if (variant === 'tertiary') {
    if (emphasis) {
      // Tertiary Emphasis - Blue text, transparent background
      variantClasses = cn(
        'text-vca-action',
        !disabled && 'hover:bg-vca-background-action-transparent-hover hover:text-vca-action-hover',
        !disabled && 'active:bg-vca-background-action-transparent-active active:text-vca-action-active',
        disabled && 'bg-vca-background-disabled text-vca-text-disabled cursor-not-allowed'
      );
    } else {
      // Tertiary Low Emphasis - Neutral text, transparent background
      variantClasses = cn(
        'text-vca-text',
        !disabled && 'hover:bg-vca-background-transparent-hover',
        !disabled && 'active:bg-vca-background-transparent-active',
        disabled && 'text-vca-text-disabled cursor-not-allowed'
      );
    }
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel || `${icon} button`}
      className={cn(
        baseClasses,
        sizeClasses[size],
        variantClasses,
        className
      )}
    >
      <VcaIcon icon={icon} size={iconSizeMap[size]} />
    </button>
  );
};

