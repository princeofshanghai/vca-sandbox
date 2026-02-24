import { ReactNode } from 'react';
import { cn } from '@/utils';
import { AppIcon } from '@/components/app-shell/AppIcon';
import { Button } from '@/components/ui/button';

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
      <Button
        onClick={onToggle}
        className="mb-4 w-full justify-start gap-2 p-0 h-auto text-sm font-medium text-shell-text hover:text-shell-muted-strong"
        aria-expanded={expanded}
        aria-label={`${expanded ? 'Collapse' : 'Expand'} ${title} section`}
        variant="ghost"
        type="button"
      >
        <span>{title}</span>
        
        {/* Chevron icon - rotates based on expanded state */}
        <AppIcon
          icon="chevron-down"
          size="sm"
          className={cn("transition-transform", expanded ? "rotate-0" : "-rotate-90")}
        />
      </Button>
      
      {/* Content - only rendered when expanded */}
      {expanded && children}
    </div>
  );
};

export default CollapsibleSection;
