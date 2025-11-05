import { cn } from '@/utils';
import { VcaIcon } from '@/components/vca-components/icons';
import type { VcaIconProps } from '@/components/vca-components/icons/VcaIcon';

type ButtonProps = {
  /** Button text */
  children: string;
  /** Button type/style variant */
  variant?: 'primary' | 'secondary' | 'tertiary';
  /** Visual emphasis level */
  emphasis?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Optional icon at start or end */
  icon?: VcaIconProps['icon'];
  /** Icon position */
  iconPosition?: 'start' | 'end';
  /** Click handler */
  onClick?: () => void;
  /** Additional classes */
  className?: string;
};

const Button = ({ 
  children,
  variant = 'primary',
  emphasis = true,
  disabled = false,
  icon,
  iconPosition = 'end',
  onClick,
  className
}: ButtonProps) => {
  
  // Base styles - always applied
  const baseStyles = cn(
    'inline-flex items-center justify-center',
    'gap-vca-s',
    'h-[32px]',
    'px-vca-lg py-vca-xs',
    'rounded-vca-lg',
    'font-vca-text text-[length:14px] leading-[18px] font-semibold tracking-[-0.15px]',
    'whitespace-nowrap',
    'transition-colors duration-150',
    'cursor-pointer',
    disabled && 'cursor-not-allowed'
  );

  // Variant styles based on type, emphasis, and disabled state
  const getVariantStyles = () => {
    // Disabled state (same for all variants)
    if (disabled) {
      return cn(
        'bg-vca-background-disabled',
        'text-vca-label-disabled',
        variant === 'secondary' && 'border-0' // Remove border for secondary when disabled
      );
    }

    // Primary button styles
    if (variant === 'primary') {
      if (emphasis) {
        return cn(
          'bg-vca-action',
          'text-vca-label-knockout',
          'hover:bg-vca-action-hover',
          'active:bg-vca-action-active active:text-vca-label-knockout-active'
        );
      } else {
        return cn(
          'bg-vca-background-overlay',
          'text-vca-label-knockout',
          'hover:bg-vca-background-overlay-hover',
          'active:bg-vca-background-overlay-active active:text-vca-label-knockout-active'
        );
      }
    }

    // Secondary button styles (with border)
    if (variant === 'secondary') {
      if (emphasis) {
        return cn(
          'border border-vca-action',
          'text-vca-action',
          'hover:bg-vca-action-background-transparent-hover hover:border-vca-action-hover hover:text-vca-action-hover',
          'active:bg-vca-action-background-transparent-active active:border-vca-action-active active:text-vca-action-active'
        );
      } else {
        return cn(
          'border border-vca-border',
          'text-vca-label',
          'hover:bg-vca-background-transparent-hover hover:border-vca-border-hover hover:text-vca-label-hover',
          'active:bg-vca-background-transparent-active active:border-vca-border-active active:text-vca-label-active'
        );
      }
    }

    // Tertiary button styles (no background, no border)
    if (variant === 'tertiary') {
      if (emphasis) {
        return cn(
          'text-vca-action',
          'hover:bg-vca-action-background-transparent-hover hover:text-vca-action-hover',
          'active:bg-vca-action-background-transparent-active active:text-vca-action-active'
        );
      } else {
        return cn(
          'text-vca-label',
          'hover:bg-vca-background-transparent-hover hover:text-vca-label-hover',
          'active:bg-vca-background-transparent-active active:text-vca-label-active'
        );
      }
    }

    return '';
  };

  const handleClick = () => {
    if (!disabled && onClick) {
      onClick();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!disabled && onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <button
      className={cn(baseStyles, getVariantStyles(), className)}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      type="button"
    >
      {icon && iconPosition === 'start' && (
        <VcaIcon icon={icon} size="sm" />
      )}
      <span>{children}</span>
      {icon && iconPosition === 'end' && (
        <VcaIcon icon={icon} size="sm" />
      )}
    </button>
  );
};

export { Button };
export type { ButtonProps };

