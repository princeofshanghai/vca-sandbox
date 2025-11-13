import { ReactNode } from 'react';
import { cn } from '@/utils';
import { AppIcon } from '@/components/app-shell/AppIcon';

type CollapsibleSectionProps = {
  /** Section title displayed in the header */
  title: string;
  /** Whether the section is expanded or collapsed */
  expanded: boolean;
  /** Callback when user clicks to toggle */
  onToggle: () => void;
  /** Content to show when expanded */
  children: ReactNode;
  /** Additional CSS classes for the wrapper */
  className?: string;
};

/**
 * CollapsibleSection - Reusable expandable/collapsible section with chevron indicator
 * 
 * Used in sidebars for organizing navigation items into collapsible groups.
 * 
 * @example
 * ```tsx
 * const [expanded, setExpanded] = useState(true);
 * 
 * <CollapsibleSection
 *   title="Foundations"
 *   expanded={expanded}
 *   onToggle={() => setExpanded(!expanded)}
 * >
 *   <div>Your content here</div>
 * </CollapsibleSection>
 * ```
 */
const CollapsibleSection = ({
  title,
  expanded,
  onToggle,
  children,
  className,
}: CollapsibleSectionProps) => {
  return (
    <div className={className}>
      {/* Header button */}
      <button
        onClick={onToggle}
        className="flex items-center gap-2 text-sm font-medium text-gray-900 mb-4 cursor-pointer hover:text-gray-700 transition-colors w-full"
        aria-expanded={expanded}
        aria-label={`${expanded ? 'Collapse' : 'Expand'} ${title} section`}
      >
        <span>{title}</span>
        
        {/* Chevron icon - rotates based on expanded state */}
        <AppIcon
          icon="chevron-down"
          size="sm"
          className={cn("transition-transform", expanded ? "rotate-0" : "-rotate-90")}
        />
      </button>
      
      {/* Content - only rendered when expanded */}
      {expanded && children}
    </div>
  );
};

export default CollapsibleSection;

