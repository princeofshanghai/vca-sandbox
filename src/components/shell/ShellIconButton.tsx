import * as React from 'react';
import { Button, type ButtonProps } from '@/components/ui/button';
import { cn } from '@/utils';

type ShellIconButtonProps = Omit<ButtonProps, 'size'> & {
  size?: 'sm' | 'md';
};

export const ShellIconButton = React.forwardRef<HTMLButtonElement, ShellIconButtonProps>(
  ({ className, variant = 'ghost', size = 'md', ...props }, ref) => {
    return (
      <Button
        ref={ref}
        variant={variant}
        size="icon"
        className={cn(
          size === 'sm' ? 'h-7 w-7' : 'h-8 w-8',
          'text-shell-muted hover:text-shell-text',
          variant === 'ghost' && 'hover:bg-shell-surface',
          className
        )}
        {...props}
      />
    );
  }
);

ShellIconButton.displayName = 'ShellIconButton';
