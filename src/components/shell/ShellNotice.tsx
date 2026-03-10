import * as React from 'react';
import { cn } from '@/utils';

export type ShellNoticeTone = 'default' | 'cinematicDark';
export type ShellNoticeVariant = 'default' | 'error';
export type ShellNoticeSize = 'default' | 'compact';

export type ShellNoticeProps = React.HTMLAttributes<HTMLDivElement> & {
  title?: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  tone?: ShellNoticeTone;
  variant?: ShellNoticeVariant;
  size?: ShellNoticeSize;
};

const containerClasses: Record<ShellNoticeTone, Record<ShellNoticeVariant, string>> = {
  default: {
    default: 'border-shell-border bg-shell-surface-subtle text-shell-text',
    error: 'border-shell-danger-border bg-shell-danger-soft text-shell-text',
  },
  cinematicDark: {
    default: 'border-shell-dark-border bg-shell-dark-surface/35 text-shell-dark-text',
    error: 'border-shell-dark-danger bg-shell-dark-danger-soft/50 text-shell-dark-text',
  },
};

const titleClasses: Record<ShellNoticeTone, string> = {
  default: 'text-shell-text',
  cinematicDark: 'text-shell-dark-text',
};

const descriptionClasses: Record<ShellNoticeTone, Record<ShellNoticeVariant, string>> = {
  default: {
    default: 'text-shell-muted',
    error: 'text-shell-text/90',
  },
  cinematicDark: {
    default: 'text-shell-dark-muted',
    error: 'text-shell-dark-text/90',
  },
};

const iconClasses: Record<ShellNoticeTone, Record<ShellNoticeVariant, string>> = {
  default: {
    default: 'text-shell-muted',
    error: 'text-shell-danger',
  },
  cinematicDark: {
    default: 'text-shell-dark-muted',
    error: 'text-shell-dark-danger',
  },
};

const sizeClasses: Record<ShellNoticeSize, string> = {
  default: 'rounded-xl px-3 py-3',
  compact: 'rounded-lg px-3 py-2.5',
};

const titleSizeClasses: Record<ShellNoticeSize, string> = {
  default: 'text-xs font-medium',
  compact: 'text-[11px] font-medium',
};

const descriptionSizeClasses: Record<ShellNoticeSize, string> = {
  default: 'text-xs leading-relaxed',
  compact: 'text-[11px] leading-relaxed',
};

export const ShellNotice = React.forwardRef<HTMLDivElement, ShellNoticeProps>(
  (
    {
      className,
      title,
      description,
      icon,
      action,
      children,
      tone = 'default',
      variant = 'default',
      size = 'default',
      ...props
    },
    ref
  ) => (
    <div
      ref={ref}
      className={cn(
        'flex items-start justify-between gap-3 border',
        containerClasses[tone][variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      <div className="flex min-w-0 flex-1 items-start gap-2">
        {icon ? (
          <div className={cn('mt-0.5 shrink-0', iconClasses[tone][variant])}>
            {icon}
          </div>
        ) : null}
        <div className="min-w-0 flex-1">
          {title ? (
            <div className={cn(titleClasses[tone], titleSizeClasses[size])}>{title}</div>
          ) : null}
          {description ? (
            <div
              className={cn(
                descriptionClasses[tone][variant],
                descriptionSizeClasses[size],
                title ? 'mt-0.5' : ''
              )}
            >
              {description}
            </div>
          ) : null}
          {children ? <div className={description ? 'mt-2' : title ? 'mt-1.5' : ''}>{children}</div> : null}
        </div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
);

ShellNotice.displayName = 'ShellNotice';
