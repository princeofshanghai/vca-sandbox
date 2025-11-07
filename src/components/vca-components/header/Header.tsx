import { ButtonIcon } from '../buttons';
import { VcaIcon } from '../icons';
import { cn } from '@/utils';

export type HeaderPosition = 'left' | 'center';

export type HeaderProps = {
  title?: string;
  position?: HeaderPosition;
  showBack?: boolean;
  showPremiumIcon?: boolean;
  showAction?: boolean;
  showPremiumBorder?: boolean;
  onBack?: () => void;
  onAction?: () => void;
  onClose?: () => void;
  className?: string;
};

/**
 * Header - Chat panel header with title and actions
 * Displays title with optional back button, premium icon, minimize, and close buttons
 */
export const Header = ({
  title = 'Help',
  position = 'left',
  showBack = true,
  showPremiumIcon = true,
  showAction = true,
  showPremiumBorder = false,
  onBack,
  onAction,
  onClose,
  className,
}: HeaderProps) => {
  
  const borderClass = showPremiumBorder 
    ? 'border-b-2 border-vca-premium-text-brand' 
    : 'border-b border-vca-border-faint';
  
  // Center-aligned layout
  if (position === 'center') {
    return (
      <div 
        className={cn(
          'relative bg-vca-background h-[72px] w-full',
          borderClass,
          className
        )}
      >
        {/* Back button - left side */}
        {showBack && (
          <div className="absolute left-5 top-1/2 -translate-y-1/2">
            <ButtonIcon 
              type="tertiary" 
              size="md" 
              emphasis={false} 
              icon="arrow-left"
              onClick={onBack}
              ariaLabel="Go back"
            />
          </div>
        )}
        
        {/* Title - center */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-vca-s">
          {showPremiumIcon && (
            <VcaIcon icon="linkedin-bug" size="md" className="text-vca-premium" />
          )}
          <h1 className="font-vca-display text-vca-heading-large text-vca-text tracking-normal">
            {title}
          </h1>
        </div>
        
        {/* Actions - right side */}
        <div className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center">
          {showAction && (
            <ButtonIcon 
              type="tertiary" 
              size="md" 
              emphasis={false} 
              icon="placeholder"
              onClick={onAction}
              ariaLabel="Minimize"
            />
          )}
          <ButtonIcon 
            type="tertiary" 
            size="md" 
            emphasis={false} 
            icon="close"
            onClick={onClose}
            ariaLabel="Close"
          />
        </div>
      </div>
    );
  }
  
  // Left-aligned layout (default)
  return (
    <div 
      className={cn(
        'bg-vca-background h-[72px] w-full flex items-center justify-between px-vca-xl py-vca-xxl gap-vca-lg',
        borderClass,
        className
      )}
    >
      {/* Left side - Title */}
      <div className="flex items-center gap-vca-xs">
        {showBack && (
          <ButtonIcon 
            type="tertiary" 
            size="md" 
            emphasis={false} 
            icon="arrow-left"
            onClick={onBack}
            ariaLabel="Go back"
          />
        )}
        <div className="flex items-center gap-vca-s">
          {showPremiumIcon && (
            <VcaIcon icon="linkedin-bug" size="md" className="text-vca-premium" />
          )}
          <h1 className="font-vca-display text-vca-heading-large text-vca-text tracking-normal">
            {title}
          </h1>
        </div>
      </div>
      
      {/* Right side - Actions */}
      <div className="flex items-center">
        {showAction && (
          <ButtonIcon 
            type="tertiary" 
            size="md" 
            emphasis={false} 
            icon="placeholder"
            onClick={onAction}
            ariaLabel="Minimize"
          />
        )}
        <ButtonIcon 
          type="tertiary" 
          size="md" 
          emphasis={false} 
          icon="close"
          onClick={onClose}
          ariaLabel="Close"
        />
      </div>
    </div>
  );
};

