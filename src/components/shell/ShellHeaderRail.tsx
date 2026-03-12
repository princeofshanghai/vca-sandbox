import * as React from 'react';
import { Button, type ButtonProps } from '@/components/ui/button';
import { cn } from '@/utils';

export type ShellHeaderRailTone = 'default' | 'cinematicDark';

const ShellHeaderRailContext = React.createContext<ShellHeaderRailTone>('default');

const railToneClasses: Record<ShellHeaderRailTone, string> = {
  default: '',
  cinematicDark: '',
};

const itemToneClasses: Record<ShellHeaderRailTone, { active: string; inactive: string; focus: string }> = {
  default: {
    active: 'bg-shell-surface text-shell-text hover:bg-shell-surface hover:text-shell-text',
    inactive: 'text-shell-muted hover:bg-shell-surface hover:text-shell-text',
    focus: 'focus-visible:ring-shell-accent/30',
  },
  cinematicDark: {
    active:
      'bg-shell-dark-accent-soft text-shell-dark-accent-text hover:bg-shell-dark-accent-soft hover:text-shell-dark-accent-text',
    inactive:
      'text-shell-dark-muted hover:bg-shell-dark-surface hover:text-shell-dark-text',
    focus: 'focus-visible:ring-shell-dark-accent/30',
  },
};

export type ShellHeaderRailProps = React.HTMLAttributes<HTMLDivElement> & {
  tone?: ShellHeaderRailTone;
};

export function ShellHeaderRail({
  children,
  className,
  tone = 'default',
  ...props
}: ShellHeaderRailProps) {
  return (
    <ShellHeaderRailContext.Provider value={tone}>
      <div
        className={cn(
          'relative flex h-full shrink-0 self-stretch items-stretch overflow-visible',
          railToneClasses[tone],
          className
        )}
        {...props}
      >
        {children}
      </div>
    </ShellHeaderRailContext.Provider>
  );
}

export type ShellHeaderRailItemProps = Omit<ButtonProps, 'size' | 'variant'> & {
  active?: boolean;
  iconOnly?: boolean;
  tone?: ShellHeaderRailTone;
};

export const ShellHeaderRailItem = React.forwardRef<HTMLButtonElement, ShellHeaderRailItemProps>(
  (
    {
      active = false,
      asChild = false,
      className,
      children,
      iconOnly = false,
      tone,
      ...props
    },
    ref
  ) => {
    const contextTone = React.useContext(ShellHeaderRailContext);
    const resolvedTone = tone ?? contextTone;

    return (
      <Button
        ref={ref}
        asChild={asChild}
        variant="ghost"
        className={cn(
          'relative h-full shrink-0 rounded-none border-0 bg-transparent shadow-none focus-visible:z-10',
          iconOnly ? 'w-12 gap-0 px-0 [&_svg]:size-[18px]' : 'px-4 text-xs',
          itemToneClasses[resolvedTone][active ? 'active' : 'inactive'],
          itemToneClasses[resolvedTone].focus,
          className
        )}
        {...props}
      >
        {children}
      </Button>
    );
  }
);

ShellHeaderRailItem.displayName = 'ShellHeaderRailItem';
