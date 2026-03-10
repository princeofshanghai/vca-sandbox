import * as React from 'react';
import { Button, type ButtonProps } from '@/components/ui/button';
import { cn } from '@/utils';

export type ShellIconButtonTone = 'default' | 'cinematicDark';
export type ShellIconButtonShape = 'rounded' | 'circle';
export type ShellIconButtonVariant = 'ghost' | 'outline' | 'primary';

type ShellIconButtonProps = Omit<ButtonProps, 'size' | 'variant'> & {
  size?: 'sm' | 'md';
  tone?: ShellIconButtonTone;
  shape?: ShellIconButtonShape;
  variant?: ShellIconButtonVariant;
};

export const ShellIconButton = React.forwardRef<HTMLButtonElement, ShellIconButtonProps>(
  ({ className, variant = 'ghost', size = 'md', tone = 'default', shape = 'rounded', ...props }, ref) => {
    const buttonVariant: ButtonProps['variant'] =
      variant === 'outline' ? 'outline' : variant === 'primary' ? 'default' : 'ghost';

    return (
      <Button
        ref={ref}
        variant={buttonVariant}
        size="icon"
        className={cn(
          size === 'sm' ? 'h-7 w-7' : 'h-8 w-8',
          shape === 'circle' ? 'rounded-full' : 'rounded-md',
          tone === 'default' &&
            variant === 'ghost' &&
            'text-shell-muted hover:text-shell-text hover:bg-shell-surface',
          tone === 'default' &&
            variant === 'outline' &&
            'border-shell-border bg-shell-bg text-shell-text hover:bg-shell-surface',
          tone === 'default' &&
            variant === 'primary' &&
            'bg-shell-accent text-white hover:bg-shell-accent-hover',
          tone === 'cinematicDark' &&
            variant === 'ghost' &&
            'text-shell-dark-muted hover:text-shell-dark-text hover:bg-shell-dark-surface focus-visible:ring-shell-dark-accent/30',
          tone === 'cinematicDark' &&
            variant === 'outline' &&
            'border-shell-dark-border bg-shell-dark-surface text-shell-dark-text hover:bg-shell-dark-surface focus-visible:ring-shell-dark-accent/30',
          tone === 'cinematicDark' &&
            variant === 'primary' &&
            'bg-shell-dark-accent text-white hover:bg-shell-dark-accent-hover focus-visible:ring-shell-dark-accent/30',
          className
        )}
        {...props}
      />
    );
  }
);

ShellIconButton.displayName = 'ShellIconButton';
