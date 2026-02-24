import * as React from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/utils';

export type ShellInputProps = React.ComponentProps<typeof Input>;

export const ShellInput = React.forwardRef<HTMLInputElement, ShellInputProps>(
  ({ className, ...props }, ref) => {
    return (
      <Input
        ref={ref}
        className={cn(
          'h-8 rounded-shell-lg border border-shell-border bg-shell-bg px-shell-3 py-shell-2 text-xs text-shell-text placeholder:text-shell-muted shadow-none',
          'focus-visible:ring-2 focus-visible:ring-shell-accent/20 focus-visible:border-shell-accent',
          className
        )}
        {...props}
      />
    );
  }
);

ShellInput.displayName = 'ShellInput';
