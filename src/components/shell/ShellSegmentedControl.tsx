import * as React from 'react';
import { Button, type ButtonProps } from '@/components/ui/button';
import { cn } from '@/utils';

export type ShellSegmentedControlTone = 'default' | 'cinematicDark';
export type ShellSegmentedControlSize = 'default' | 'compact';
export type ShellSegmentedControlShape = 'pill' | 'rounded';

type SegmentedControlContextValue = {
  tone: ShellSegmentedControlTone;
  size: ShellSegmentedControlSize;
  shape: ShellSegmentedControlShape;
};

const ShellSegmentedControlContext = React.createContext<SegmentedControlContextValue | null>(null);

export type ShellSegmentedControlProps = React.HTMLAttributes<HTMLDivElement> & {
  tone?: ShellSegmentedControlTone;
  size?: ShellSegmentedControlSize;
  shape?: ShellSegmentedControlShape;
};

const containerToneClasses: Record<ShellSegmentedControlTone, string> = {
  default: 'bg-shell-bg border-shell-border shadow-sm',
  cinematicDark: 'bg-shell-dark-surface border-shell-dark-border shadow-sm',
};

const dividerToneClasses: Record<ShellSegmentedControlTone, string> = {
  default: 'bg-shell-border-subtle',
  cinematicDark: 'bg-shell-dark-border',
};

export function ShellSegmentedControl({
  children,
  className,
  tone = 'default',
  size = 'default',
  shape = 'pill',
  ...props
}: ShellSegmentedControlProps) {
  const childrenArray = React.Children.toArray(children).filter(Boolean);

  return (
    <ShellSegmentedControlContext.Provider value={{ tone, size, shape }}>
      <div
        className={cn(
          'flex items-center gap-0.5 border p-0.5',
          shape === 'pill' ? 'rounded-full' : 'rounded-lg',
          containerToneClasses[tone],
          className
        )}
        {...props}
      >
        {childrenArray.map((child, index) => (
          <React.Fragment key={index}>
            {child}
            {index < childrenArray.length - 1 ? (
              <div className={cn('mx-px h-3.5 w-px shrink-0', dividerToneClasses[tone])} />
            ) : null}
          </React.Fragment>
        ))}
      </div>
    </ShellSegmentedControlContext.Provider>
  );
}

export type ShellSegmentedControlItemProps = Omit<ButtonProps, 'size' | 'variant'> & {
  selected?: boolean;
  iconOnly?: boolean;
  tone?: ShellSegmentedControlTone;
  size?: ShellSegmentedControlSize;
  shape?: ShellSegmentedControlShape;
};

const itemSizeClasses: Record<ShellSegmentedControlSize, { icon: string; text: string }> = {
  default: {
    icon: 'h-8 w-8',
    text: 'h-8 px-3 text-xs font-medium',
  },
  compact: {
    icon: 'h-7 w-7',
    text: 'h-7 px-2.5 text-[11px] font-medium',
  },
};

export const ShellSegmentedControlItem = React.forwardRef<
  HTMLButtonElement,
  ShellSegmentedControlItemProps
>(
  (
    {
      className,
      selected = false,
      iconOnly = false,
      tone,
      size,
      shape,
      asChild = false,
      ...props
    },
    ref
  ) => {
    const context = React.useContext(ShellSegmentedControlContext);
    const resolvedTone = tone ?? context?.tone ?? 'default';
    const resolvedSize = size ?? context?.size ?? 'default';
    const resolvedShape = shape ?? context?.shape ?? 'pill';

    return (
      <Button
        ref={ref}
        asChild={asChild}
        variant="ghost"
        className={cn(
          'border transition-colors focus-visible:ring-0',
          iconOnly ? itemSizeClasses[resolvedSize].icon : itemSizeClasses[resolvedSize].text,
          resolvedShape === 'pill' ? 'rounded-full' : 'rounded-md',
          resolvedTone === 'default' &&
            selected &&
            'bg-shell-accent-soft text-shell-accent-text shadow-sm border-shell-accent-border hover:bg-shell-accent-soft hover:text-shell-accent-text',
          resolvedTone === 'default' &&
            !selected &&
            'bg-transparent border-transparent text-shell-muted hover:text-shell-text hover:bg-shell-surface',
          resolvedTone === 'cinematicDark' &&
            selected &&
            'bg-shell-dark-accent-soft text-shell-dark-accent-text border-transparent hover:bg-shell-dark-accent-soft hover:text-shell-dark-accent-text',
          resolvedTone === 'cinematicDark' &&
            !selected &&
            'bg-transparent border-transparent text-shell-dark-muted hover:text-shell-dark-text hover:bg-shell-dark-surface hover:border-shell-dark-border',
          className
        )}
        {...props}
      />
    );
  }
);

ShellSegmentedControlItem.displayName = 'ShellSegmentedControlItem';
