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
  
  const linkClasses = cn(
    'font-vca-text text-[12px] leading-[15px] underline inline-block',
    'decoration-solid [text-decoration-skip-ink:none] [text-underline-position:from-font]',
    state === 'enabled' && 'text-vca-text-meta',
    (state === 'hover' || state === 'active') && 'text-[#004182]',
    state === 'visited' && 'text-[#8443ce]',
    className
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

