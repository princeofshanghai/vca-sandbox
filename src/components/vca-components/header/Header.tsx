import { ButtonIcon } from '../buttons';
import { VcaIcon } from '../icons';
import { cn } from '@/utils';

export type HeaderPosition = 'left' | 'center';
export type HeaderViewport = 'desktop' | 'mobile';

export type HeaderProps = {
  title?: string;
  position?: HeaderPosition;
  viewport?: HeaderViewport;
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
 * In mobile viewport, shows only a centered drag handle bar
 */
export const Header = ({
  title = 'Help',
  position = 'left',
  viewport = 'desktop',
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

  // Mobile viewport - show only handle bar and close button
  if (viewport === 'mobile') {
    return (
      <div
        className={cn(
          'relative bg-vca-background h-[64px] w-full flex items-center justify-center',
          borderClass,
          className
        )}
      >
        {/* Centered handle bar */}
        <div className="w-12 h-1 bg-gray-400 rounded-full" />

        {/* Close button - right side */}
        <div className="absolute right-5 top-1/2 -translate-y-1/2">
          <ButtonIcon
            variant="tertiary"
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
              variant="tertiary"
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
            <VcaIcon icon="linkedin-bug" size="md" className="text-vca-premium-inbug" />
          )}
          <span className="font-vca-display text-vca-heading-large text-vca-text tracking-normal">
            {title}
          </span>
        </div>

        {/* Actions - right side */}
        <div className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center">
          {showAction && (
            <ButtonIcon
              variant="tertiary"
              size="md"
              emphasis={false}
              icon="placeholder"
              onClick={onAction}
              ariaLabel="Minimize"
            />
          )}
          <ButtonIcon
            variant="tertiary"
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
            variant="tertiary"
            size="md"
            emphasis={false}
            icon="arrow-left"
            onClick={onBack}
            ariaLabel="Go back"
          />
        )}
        <div className="flex items-center gap-vca-s">
          {showPremiumIcon && (
            <VcaIcon icon="linkedin-bug" size="md" className="text-vca-premium-inbug" />
          )}
          <span className="font-vca-display text-vca-heading-large text-vca-text tracking-normal">
            {title}
          </span>
        </div>
      </div>

      {/* Right side - Actions */}
      <div className="flex items-center">
        {showAction && (
          <ButtonIcon
            variant="tertiary"
            size="md"
            emphasis={false}
            icon="placeholder"
            onClick={onAction}
            ariaLabel="Minimize"
          />
        )}
        <ButtonIcon
          variant="tertiary"
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

