import * as React from 'react';
import * as SwitchPrimitive from '@radix-ui/react-switch';
import { cn } from '@/utils';

export type ShellSwitchTone = 'default' | 'cinematicDark';
export type ShellSwitchSize = 'default' | 'compact';

export type ShellSwitchProps = React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root> & {
  tone?: ShellSwitchTone;
  size?: ShellSwitchSize;
};

const rootToneClasses: Record<ShellSwitchTone, string> = {
  default:
    'data-[state=checked]:bg-shell-accent data-[state=unchecked]:bg-shell-border focus-visible:ring-shell-accent/20 focus-visible:ring-offset-shell-bg',
  cinematicDark:
    'data-[state=checked]:bg-shell-dark-accent data-[state=unchecked]:bg-shell-dark-border focus-visible:ring-shell-dark-accent/30 focus-visible:ring-offset-shell-dark-panel',
};

const thumbToneClasses: Record<ShellSwitchTone, string> = {
  default: 'bg-white',
  cinematicDark: 'bg-shell-dark-text',
};

const sizeClasses: Record<ShellSwitchSize, string> = {
  default: 'h-5 w-9',
  compact: 'h-4 w-7',
};

const thumbSizeClasses: Record<ShellSwitchSize, string> = {
  default: 'h-4 w-4 data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0',
  compact: 'h-3 w-3 data-[state=checked]:translate-x-3 data-[state=unchecked]:translate-x-0',
};

export const ShellSwitch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  ShellSwitchProps
>(({ className, tone = 'default', size = 'default', ...props }, ref) => (
  <SwitchPrimitive.Root
    ref={ref}
    className={cn(
      'peer inline-flex shrink-0 cursor-pointer items-center rounded-full border border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
      rootToneClasses[tone],
      sizeClasses[size],
      className
    )}
    {...props}
  >
    <SwitchPrimitive.Thumb
      className={cn(
        'pointer-events-none block rounded-full shadow-sm ring-0 transition-transform',
        thumbToneClasses[tone],
        thumbSizeClasses[size]
      )}
    />
  </SwitchPrimitive.Root>
));

ShellSwitch.displayName = 'ShellSwitch';
