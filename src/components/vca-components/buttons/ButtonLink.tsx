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
  
  const linkClasses = cn(
    'inline-flex items-center justify-center gap-vca-s h-[18px] p-0',
    'text-vca-small-bold',
    !disabled && 'text-vca-link hover:text-vca-link-hover active:text-vca-link-active cursor-pointer',
    disabled && 'text-vca-link-disabled cursor-not-allowed',
    'transition-colors',
    className
  );
  
  // If href is provided, render as anchor tag
  if (href && !disabled) {
    return (
      <a
        href={href}
        onClick={onClick}
        className={linkClasses}
      >
        {children}
      </a>
    );
  }
  
  // Otherwise render as button
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={linkClasses}
    >
      {children}
    </button>
  );
};

