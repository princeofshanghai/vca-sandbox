import * as React from 'react';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { cn } from '@/utils';

export type ShellPopoverContentProps = React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content> & {
  tone?: 'default' | 'cinematicDark';
};

export const ShellPopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  ShellPopoverContentProps
>(({ className, sideOffset = 8, align = 'end', tone = 'default', ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      align={align}
      className={cn(
        'z-[140] overflow-hidden rounded-xl border shadow-2xl focus:outline-none',
        'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
        'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-1 data-[side=top]:slide-in-from-bottom-1',
        tone === 'cinematicDark'
          ? 'border-shell-dark-border bg-shell-dark-panel text-shell-dark-text'
          : 'border-shell-border bg-shell-surface text-shell-text',
        className
      )}
      {...props}
    />
  </PopoverPrimitive.Portal>
));

ShellPopoverContent.displayName = 'ShellPopoverContent';
