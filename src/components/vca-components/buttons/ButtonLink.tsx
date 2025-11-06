import { cn } from '@/utils';

export type ButtonLinkProps = {
  children: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
  href?: string;
};

/**
 * ButtonLink - Text-only link button
 * Simple text link without backgrounds or borders, for inline actions
 */
export const ButtonLink = ({
  children,
  disabled = false,
  onClick,
  className,
  href,
}: ButtonLinkProps) => {
  
  const wrapperClasses = cn(
    'inline-flex items-center justify-center gap-vca-s h-[18px] p-0',
    !disabled && 'cursor-pointer',
    disabled && 'cursor-not-allowed',
    'transition-colors',
    className
  );
  
  // Split typography and color to avoid cn() conflicts
  const baseTextClasses = 'font-vca-text text-vca-small-bold';
  const colorClasses = !disabled 
    ? 'text-vca-link hover:text-vca-link-hover active:text-vca-link-active'
    : 'text-vca-link-disabled';
  
  // If href is provided, render as anchor tag
  if (href && !disabled) {
    return (
      <a
        href={href}
        onClick={onClick}
        className={wrapperClasses}
      >
        <span className={`${baseTextClasses} ${colorClasses}`}>{children}</span>
      </a>
    );
  }
  
  // Otherwise render as button
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={wrapperClasses}
    >
      <span className={`${baseTextClasses} ${colorClasses}`}>{children}</span>
    </button>
  );
};

