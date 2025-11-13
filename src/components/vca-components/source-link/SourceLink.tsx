import { VcaIcon } from '../icons';

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
  
  // Split typography and color to avoid cn() conflicts with tailwind-merge
  const baseTypography = 'font-vca-text text-vca-xsmall-bold';
  const layoutClasses = 'underline inline-flex items-center decoration-solid [text-decoration-skip-ink:none] [text-underline-position:from-font] gap-vca-xs';
  
  const colorClass = state === 'enabled' 
    ? 'text-vca-text-meta'
    : (state === 'hover' || state === 'active') 
      ? 'text-vca-link-hover'
      : 'text-vca-link-visited';
  
  // Use string concatenation for text classes, cn() only for layout classes
  const linkClasses = className 
    ? `${baseTypography} ${colorClass} ${layoutClasses} ${className}`
    : `${baseTypography} ${colorClass} ${layoutClasses}`;

  const content = (
    <>
      {text}
      <VcaIcon icon="external-link" size="sm" className="shrink-0" />
    </>
  );

  if (href) {
    return (
      <a 
        href={href} 
        onClick={onClick}
        className={linkClasses}
        target="_blank"
        rel="noopener noreferrer"
      >
        {content}
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={linkClasses}
    >
      {content}
    </button>
  );
};

