import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/utils';
import { ShellIconButton } from './ShellIconButton';

export type ShellCoachmarkTone = 'default' | 'cinematicDark';
export type ShellCoachmarkArrowPlacement = 'top' | 'bottom';

type ShellCoachmarkProps = React.HTMLAttributes<HTMLDivElement> & {
  message: React.ReactNode;
  onDismiss?: () => void;
  tone?: ShellCoachmarkTone;
  arrowPlacement?: ShellCoachmarkArrowPlacement;
  arrowClassName?: string;
};

export const ShellCoachmark = React.forwardRef<HTMLDivElement, ShellCoachmarkProps>(
  (
    {
      className,
      message,
      onDismiss,
      tone = 'default',
      arrowPlacement = 'bottom',
      arrowClassName,
      ...props
    },
    ref
  ) => {
    const isDarkTone = tone === 'cinematicDark';
    const isArrowOnTop = arrowPlacement === 'top';

    return (
      <div
        ref={ref}
        className={cn(
          'shell-coachmark-float-animation relative flex max-w-[220px] items-start gap-2 rounded-2xl border px-3 py-2 shadow-[0_18px_44px_rgb(15_23_42/0.16)] backdrop-blur-sm',
          isDarkTone
            ? 'border-shell-dark-border bg-shell-dark-panel/95 text-shell-dark-text'
            : 'border-shell-border bg-shell-bg/95 text-shell-text',
          className
        )}
        {...props}
      >
        <div
          className={cn(
            'min-w-0 flex-1 pr-1 text-[12px] font-medium leading-[1.35]',
            isDarkTone ? 'text-shell-dark-text' : 'text-shell-text'
          )}
        >
          {message}
        </div>

        {onDismiss ? (
          <ShellIconButton
            type="button"
            size="sm"
            tone={tone}
            shape="circle"
            aria-label="Dismiss hint"
            onClick={onDismiss}
            className="mt-[-1px] h-6 w-6 shrink-0"
          >
            <X size={12} />
          </ShellIconButton>
        ) : null}

        <span
          aria-hidden
          className={cn(
            'absolute h-3 w-3 rotate-45',
            isArrowOnTop ? 'top-[-7px] border-l border-t' : 'bottom-[-7px] border-r border-b',
            isDarkTone
              ? 'border-shell-dark-border bg-shell-dark-panel/95'
              : 'border-shell-border bg-shell-bg/95',
            arrowClassName
          )}
        />
      </div>
    );
  }
);

ShellCoachmark.displayName = 'ShellCoachmark';
