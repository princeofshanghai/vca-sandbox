import * as React from 'react';
import {
  Select as SelectRoot,
  SelectContent as SelectContentBase,
  SelectGroup,
  SelectItem as SelectItemBase,
  SelectLabel as SelectLabelBase,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator as SelectSeparatorBase,
  SelectTrigger as SelectTriggerBase,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/utils';

export type ShellSelectTone = 'default' | 'cinematicDark';
export type ShellSelectSize = 'default' | 'compact';

export const ShellSelect = SelectRoot;
export const ShellSelectGroup = SelectGroup;
export const ShellSelectValue = SelectValue;
export const ShellSelectScrollUpButton = SelectScrollUpButton;
export const ShellSelectScrollDownButton = SelectScrollDownButton;

const triggerToneClasses: Record<ShellSelectTone, string> = {
  default:
    'border-shell-border bg-shell-bg text-shell-text data-[placeholder]:text-shell-muted focus:border-shell-accent focus:ring-shell-accent/20 [&>svg]:text-shell-muted',
  cinematicDark:
    'border-shell-dark-border bg-shell-dark-surface text-shell-dark-text data-[placeholder]:text-shell-dark-muted focus:border-shell-dark-accent focus:ring-shell-dark-accent/30 [&>svg]:text-shell-dark-muted',
};

const triggerSizeClasses: Record<ShellSelectSize, string> = {
  default:
    'h-8 rounded-shell-lg px-shell-3 py-shell-2 text-xs shadow-none gap-2 [&>svg]:h-4 [&>svg]:w-4',
  compact:
    'h-7 rounded-md px-2 py-1 text-[11px] shadow-none gap-1 [&>svg]:h-3.5 [&>svg]:w-3.5',
};

const contentToneClasses: Record<ShellSelectTone, string> = {
  default: 'rounded-shell-lg border-shell-border bg-shell-bg text-shell-text shadow-shell-lg',
  cinematicDark:
    'z-[90] rounded-lg border-shell-dark-border bg-shell-dark-panel text-shell-dark-text shadow-2xl',
};

const itemToneClasses: Record<ShellSelectTone, string> = {
  default: 'text-shell-text focus:bg-shell-surface focus:text-shell-text',
  cinematicDark: 'text-shell-dark-text focus:bg-shell-dark-surface focus:text-shell-dark-text',
};

const itemSizeClasses: Record<ShellSelectSize, string> = {
  default: 'py-1.5 text-xs',
  compact: 'py-1.5 text-[11px]',
};

const labelToneClasses: Record<ShellSelectTone, string> = {
  default: 'text-shell-muted',
  cinematicDark: 'text-shell-dark-muted',
};

const separatorToneClasses: Record<ShellSelectTone, string> = {
  default: 'bg-shell-border-subtle',
  cinematicDark: 'bg-shell-dark-border',
};

export type ShellSelectTriggerProps = React.ComponentPropsWithoutRef<typeof SelectTriggerBase> & {
  tone?: ShellSelectTone;
  size?: ShellSelectSize;
};

export const ShellSelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectTriggerBase>,
  ShellSelectTriggerProps
>(({ className, tone = 'default', size = 'default', ...props }, ref) => (
  <SelectTriggerBase
    ref={ref}
    className={cn(
      '[&>span]:text-left',
      triggerToneClasses[tone],
      triggerSizeClasses[size],
      className
    )}
    {...props}
  />
));

ShellSelectTrigger.displayName = 'ShellSelectTrigger';

export type ShellSelectContentProps = React.ComponentPropsWithoutRef<typeof SelectContentBase> & {
  tone?: ShellSelectTone;
};

export const ShellSelectContent = React.forwardRef<
  React.ElementRef<typeof SelectContentBase>,
  ShellSelectContentProps
>(({ className, tone = 'default', ...props }, ref) => (
  <SelectContentBase
    ref={ref}
    className={cn(contentToneClasses[tone], className)}
    {...props}
  />
));

ShellSelectContent.displayName = 'ShellSelectContent';

export type ShellSelectItemProps = React.ComponentPropsWithoutRef<typeof SelectItemBase> & {
  tone?: ShellSelectTone;
  size?: ShellSelectSize;
};

export const ShellSelectItem = React.forwardRef<
  React.ElementRef<typeof SelectItemBase>,
  ShellSelectItemProps
>(({ className, tone = 'default', size = 'default', ...props }, ref) => (
  <SelectItemBase
    ref={ref}
    className={cn(itemToneClasses[tone], itemSizeClasses[size], className)}
    {...props}
  />
));

ShellSelectItem.displayName = 'ShellSelectItem';

export type ShellSelectLabelProps = React.ComponentPropsWithoutRef<typeof SelectLabelBase> & {
  tone?: ShellSelectTone;
};

export const ShellSelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectLabelBase>,
  ShellSelectLabelProps
>(({ className, tone = 'default', ...props }, ref) => (
  <SelectLabelBase
    ref={ref}
    className={cn('px-2 py-1.5 text-xs font-medium', labelToneClasses[tone], className)}
    {...props}
  />
));

ShellSelectLabel.displayName = 'ShellSelectLabel';

export type ShellSelectSeparatorProps = React.ComponentPropsWithoutRef<typeof SelectSeparatorBase> & {
  tone?: ShellSelectTone;
};

export const ShellSelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectSeparatorBase>,
  ShellSelectSeparatorProps
>(({ className, tone = 'default', ...props }, ref) => (
  <SelectSeparatorBase
    ref={ref}
    className={cn(separatorToneClasses[tone], className)}
    {...props}
  />
));

ShellSelectSeparator.displayName = 'ShellSelectSeparator';
