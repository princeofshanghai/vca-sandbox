import * as React from 'react';
import { Button, type ButtonProps } from '@/components/ui/button';
import { cn } from '@/utils';

type ShellButtonSize = NonNullable<ButtonProps['size']> | 'compact';

export type ShellButtonProps = Omit<ButtonProps, 'size'> & {
  size?: ShellButtonSize;
};

export const ShellButton = React.forwardRef<HTMLButtonElement, ShellButtonProps>(
  ({ className, size = 'sm', variant = 'default', ...props }, ref) => {
    const buttonSize: ButtonProps['size'] = size === 'compact' ? 'sm' : size;

    return (
      <Button
        ref={ref}
        variant={variant}
        size={buttonSize}
        className={cn(
          'font-medium',
          size === 'compact' ? 'h-7 px-2.5 text-2xs' : 'h-8 text-xs',
          variant === 'default' && 'bg-shell-accent text-white hover:bg-shell-accent-hover',
          variant === 'ghost' && 'text-shell-muted hover:text-shell-text hover:bg-shell-surface',
          variant === 'outline' && 'border-shell-border bg-shell-bg text-shell-text hover:bg-shell-surface',
          variant === 'destructive' && 'bg-shell-danger text-white hover:bg-shell-danger-hover',
          className
        )}
        {...props}
      />
    );
  }
);

ShellButton.displayName = 'ShellButton';
