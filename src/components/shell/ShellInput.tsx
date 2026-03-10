import * as React from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/utils';

export type ShellInputTone = 'default' | 'cinematicDark';
export type ShellInputSize = 'default' | 'compact';

export type ShellInputProps = Omit<React.ComponentProps<typeof Input>, 'size'> & {
  tone?: ShellInputTone;
  size?: ShellInputSize;
};

const toneClasses: Record<ShellInputTone, string> = {
  default:
    'border-shell-border bg-shell-bg text-shell-text placeholder:text-shell-muted focus-visible:ring-shell-accent/20 focus-visible:border-shell-accent',
  cinematicDark:
    'border-shell-dark-border bg-shell-dark-surface text-shell-dark-text placeholder:text-shell-dark-muted focus-visible:ring-shell-dark-accent/30 focus-visible:border-shell-dark-accent',
};

const sizeClasses: Record<ShellInputSize, string> = {
  default: 'h-8 rounded-shell-lg px-shell-3 py-shell-2 text-xs md:text-xs',
  compact: 'h-7 rounded-md px-2 py-1 text-[11px] md:text-[11px]',
};

export const ShellInput = React.forwardRef<HTMLInputElement, ShellInputProps>(
  ({ className, tone = 'default', size = 'default', ...props }, ref) => {
    return (
      <Input
        ref={ref}
        className={cn(
          'border shadow-none',
          toneClasses[tone],
          sizeClasses[size],
          className
        )}
        {...props}
      />
    );
  }
);

ShellInput.displayName = 'ShellInput';
