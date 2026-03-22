import * as React from 'react';
import { ShellButton, type ShellButtonProps } from '@/components/shell/ShellButton';
import { cn } from '@/utils/cn';

interface PreviewHeaderActionButtonProps extends Omit<ShellButtonProps, 'size' | 'variant'> {
    tone?: 'default' | 'cinematicDark';
    active?: boolean;
}

export const PreviewHeaderActionButton = React.forwardRef<HTMLButtonElement, PreviewHeaderActionButtonProps>(
    ({
        tone = 'default',
        active = false,
        className,
        ...props
    }, ref) => {
        const isDark = tone === 'cinematicDark';

        return (
            <ShellButton
                ref={ref}
                variant="outline"
                size="compact"
                className={cn(
                    'relative overflow-visible h-7 gap-2 px-3 text-xs font-medium shadow-sm',
                    isDark
                        ? active
                            ? 'border-shell-dark-accent/45 bg-shell-dark-accent-soft text-shell-dark-accent-text hover:border-shell-dark-accent/55 hover:bg-shell-dark-accent-soft hover:text-shell-dark-accent-text'
                            : 'border-shell-dark-border bg-shell-dark-surface text-shell-dark-muted-strong hover:border-shell-dark-border-strong hover:bg-shell-dark-surface hover:text-shell-dark-text'
                        : active
                            ? 'border-shell-accent-border bg-shell-accent-soft text-shell-accent-text hover:border-shell-accent-border hover:bg-shell-accent-soft hover:text-shell-accent-text'
                            : 'border-shell-border/70 bg-shell-bg text-shell-muted-strong hover:bg-shell-surface hover:text-shell-text',
                    className
                )}
                {...props}
            />
        );
    }
);

PreviewHeaderActionButton.displayName = 'PreviewHeaderActionButton';
