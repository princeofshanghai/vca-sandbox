import { cn } from '@/utils';

export type DividerProps = {
  text?: string;
  className?: string;
};

/**
 * Divider - Horizontal line with centered text
 * Used to separate sections (e.g., "LIVE CHAT" when switching to human agent mode)
 * Full width component that expands to fill container
 */
export const Divider = ({
  text = 'LIVE CHAT',
  className,
}: DividerProps) => {
  return (
    <div className={cn('relative flex items-center justify-center h-14 w-full', className)}>
      {/* Horizontal line */}
      <div className="absolute inset-x-0 top-1/2 transform -translate-y-1/2 border-t border-vca-border-subtle" />
      
      {/* Text with white background */}
      <div className="relative bg-vca-background px-vca-s">
        <p className="font-vca-text text-vca-xsmall-bold text-vca-text-disabled whitespace-nowrap">
          {text}
        </p>
      </div>
    </div>
  );
};

export default Divider;

