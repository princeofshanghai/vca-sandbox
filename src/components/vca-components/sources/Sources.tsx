import { SourceLink } from '../source-link';
import { cn } from '@/utils';

export type SourcesProps = {
  sources?: Array<{
    text: string;
    href?: string;
    status?: 'enabled' | 'hover' | 'active' | 'visited';
  }>;
  className?: string;
};

/**
 * Sources - List of source citations/references
 * Displays a "Sources" heading followed by multiple source links
 * Note: No fixed width - adapts to parent container
 */
export const Sources = ({
  sources = [
    { text: 'This is title of link', status: 'enabled' },
    { text: 'This is title of link', status: 'enabled' },
    { text: 'This is title of link', status: 'enabled' },
  ],
  className,
}: SourcesProps) => {

  return (
    <div className={cn('flex flex-col gap-vca-s items-start', className)}>
      {/* Sources heading */}
      <p className="font-vca-text text-vca-xsmall-bold text-vca-text-meta w-full">
        Sources
      </p>

      {/* Source links list */}
      {sources.map((source, index) => (
        <SourceLink
          key={index}
          text={source.text}
          href={source.href}
          status={source.status}
          className="w-full"
        />
      ))}
    </div>
  );
};

