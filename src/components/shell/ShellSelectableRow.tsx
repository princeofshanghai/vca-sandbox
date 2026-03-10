import * as React from 'react';
import { cn } from '@/utils';

export type ShellSelectableRowTone = 'default' | 'cinematicDark';
export type ShellSelectableRowSize = 'default' | 'compact';

export type ShellSelectableRowProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  selected?: boolean;
  tone?: ShellSelectableRowTone;
  size?: ShellSelectableRowSize;
};

const sizeClasses: Record<ShellSelectableRowSize, string> = {
  default: 'gap-2.5 rounded-[22px] px-3 py-3',
  compact: 'gap-2 rounded-[20px] px-3 py-2.5',
};

const toneIdleClasses: Record<ShellSelectableRowTone, string> = {
  default:
    'border-transparent bg-transparent text-shell-text hover:-translate-y-[1px] hover:border-shell-border hover:bg-shell-surface-subtle hover:shadow-sm focus-visible:ring-shell-accent/20',
  cinematicDark:
    'border-transparent bg-transparent text-shell-dark-text hover:-translate-y-[1px] hover:border-shell-dark-border/65 hover:bg-shell-dark-surface/45 hover:shadow-[0_14px_28px_rgb(0_0_0/0.18)] focus-visible:ring-shell-dark-accent/30',
};

const toneSelectedClasses: Record<ShellSelectableRowTone, string> = {
  default:
    'border-shell-accent/20 bg-shell-surface shadow-sm text-shell-text focus-visible:ring-shell-accent/20',
  cinematicDark:
    'border-shell-dark-accent/25 bg-shell-dark-surface/80 shadow-[0_18px_32px_rgb(0_0_0/0.22)] text-shell-dark-text focus-visible:ring-shell-dark-accent/30',
};

export const ShellSelectableRow = React.forwardRef<HTMLButtonElement, ShellSelectableRowProps>(
  ({ className, selected = false, tone = 'default', size = 'default', type = 'button', ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(
        'flex h-auto w-full items-start justify-start border text-left font-normal transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-60',
        sizeClasses[size],
        selected ? toneSelectedClasses[tone] : toneIdleClasses[tone],
        className
      )}
      {...props}
    />
  )
);

ShellSelectableRow.displayName = 'ShellSelectableRow';
