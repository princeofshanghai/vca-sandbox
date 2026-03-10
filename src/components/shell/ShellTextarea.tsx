import * as React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/utils';

export type ShellTextareaTone = 'default' | 'cinematicDark';
export type ShellTextareaVariant = 'default' | 'bare';

export type ShellTextareaProps = React.ComponentProps<typeof Textarea> & {
  tone?: ShellTextareaTone;
  variant?: ShellTextareaVariant;
};

const textToneClasses: Record<ShellTextareaTone, string> = {
  default: 'text-shell-text placeholder:text-shell-muted',
  cinematicDark: 'text-shell-dark-text placeholder:text-shell-dark-muted',
};

const surfaceToneClasses: Record<ShellTextareaTone, string> = {
  default:
    'border-shell-border bg-shell-bg focus-visible:ring-2 focus-visible:ring-shell-accent/20 focus-visible:border-shell-accent',
  cinematicDark:
    'border-shell-dark-border bg-shell-dark-surface focus-visible:ring-2 focus-visible:ring-shell-dark-accent/30 focus-visible:border-shell-dark-accent',
};

const variantClasses: Record<ShellTextareaVariant, string> = {
  default: 'min-h-[88px] rounded-shell-lg px-shell-3 py-shell-2 shadow-none text-sm leading-5',
  bare: 'min-h-0 rounded-none border-0 bg-transparent px-0 py-1 shadow-none text-sm leading-5 focus-visible:ring-0 focus-visible:border-transparent',
};

export const ShellTextarea = React.forwardRef<HTMLTextAreaElement, ShellTextareaProps>(
  ({ className, tone = 'default', variant = 'default', ...props }, ref) => {
    return (
      <Textarea
        ref={ref}
        className={cn(
          'border disabled:cursor-not-allowed disabled:opacity-50',
          textToneClasses[tone],
          variantClasses[variant],
          variant === 'default' && surfaceToneClasses[tone],
          className
        )}
        {...props}
      />
    );
  }
);

ShellTextarea.displayName = 'ShellTextarea';
