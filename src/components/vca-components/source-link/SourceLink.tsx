import { cn } from '@/utils';

export type SourceLinkState = 'enabled' | 'hover' | 'active' | 'visited';

export type SourceLinkProps = {
  state?: SourceLinkState;
  text?: string;
  href?: string;
  onClick?: () => void;
  className?: string;
};

/**
 * SourceLink - Small citation/source link component
 * Used for references, sources, and external links in messages
 * Note: No fixed width - adapts to content
 */
export const SourceLink = ({
  state = 'enabled',
  text = 'This is title of link',
  href,
  onClick,
  className,
}: SourceLinkProps) => {
  
  // Split typography and color to avoid cn() conflicts
  const baseTypography = 'font-vca-text text-vca-xsmall underline inline-block decoration-solid [text-decoration-skip-ink:none] [text-underline-position:from-font]';
  
  const colorClass = state === 'enabled' 
    ? 'text-vca-text-meta'
    : (state === 'hover' || state === 'active') 
      ? 'text-vca-link-hover'
      : 'text-vca-link-visited';
  
  const linkClasses = className 
    ? `${baseTypography} ${colorClass} ${className}`
    : `${baseTypography} ${colorClass}`;

  if (href) {
    return (
      <a 
        href={href} 
        onClick={onClick}
        className={linkClasses}
        target="_blank"
        rel="noopener noreferrer"
      >
        {text}
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={linkClasses}
    >
      {text}
    </button>
  );
};

