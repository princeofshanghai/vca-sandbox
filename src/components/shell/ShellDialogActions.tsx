import * as React from 'react';
import { cn } from '@/utils';

export type ShellDialogActionsTone = 'default' | 'cinematicDark';
export type ShellDialogActionsSize = 'default' | 'compact';

export type ShellDialogActionsProps = React.HTMLAttributes<HTMLDivElement> & {
  tone?: ShellDialogActionsTone;
  size?: ShellDialogActionsSize;
  separated?: boolean;
};

const toneBorderClasses: Record<ShellDialogActionsTone, string> = {
  default: 'border-shell-border-subtle',
  cinematicDark: 'border-shell-dark-border',
};

const sizeClasses: Record<ShellDialogActionsSize, string> = {
  default: 'mt-5 gap-2 sm:justify-end',
  compact: 'mt-4 gap-2 sm:justify-end',
};

export const ShellDialogActions = React.forwardRef<HTMLDivElement, ShellDialogActionsProps>(
  ({ className, tone = 'default', size = 'default', separated = false, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex flex-col-reverse sm:flex-row',
        sizeClasses[size],
        separated && ['border-t pt-4', toneBorderClasses[tone]],
        className
      )}
      {...props}
    />
  )
);

ShellDialogActions.displayName = 'ShellDialogActions';
