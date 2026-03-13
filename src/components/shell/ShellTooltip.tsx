import * as React from 'react';
import * as Tooltip from '@radix-ui/react-tooltip';
import { cn } from '@/utils';

export type ShellTooltipProps = {
  children: React.ReactNode;
  label: string;
  shortcut?: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
  disabled?: boolean;
};

export function ShellTooltip({
  children,
  label,
  shortcut,
  side = 'top',
  disabled = false,
}: ShellTooltipProps) {
  if (disabled) {
    return <>{children}</>;
  }

  return (
    <Tooltip.Provider delayDuration={100}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            side={side}
            sideOffset={8}
            className="relative z-[1100] rounded-[10px] border border-shell-dark-border bg-shell-dark-panel px-2.5 py-1.5 text-shell-dark-text shadow-[0_18px_40px_rgb(0_0_0/0.36)] animate-in fade-in zoom-in-95 duration-150"
          >
            <div className={cn('flex items-center whitespace-nowrap', shortcut ? 'gap-2.5' : 'gap-0')}>
              <span className="text-[11px] font-medium leading-none text-shell-dark-text">{label}</span>
              {shortcut ? (
                <span className="text-[10px] font-medium leading-none tracking-[0.06em] text-shell-dark-muted">
                  {shortcut}
                </span>
              ) : null}
            </div>
            <Tooltip.Arrow asChild>
              <svg
                width="14"
                height="8"
                viewBox="0 0 30 10"
                preserveAspectRatio="none"
                className="block"
                aria-hidden="true"
              >
                <polygon points="0,0 30,0 15,10" fill="rgb(var(--shell-dark-panel))" />
                <path
                  d="M0 0 L15 10 L30 0"
                  fill="none"
                  stroke="rgb(var(--shell-dark-border) / var(--shell-dark-border-alpha))"
                  strokeWidth="1.25"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
            </Tooltip.Arrow>
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}
