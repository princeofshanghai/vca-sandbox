import * as React from 'react';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import {
  DropdownMenu as DropdownMenuRoot,
  DropdownMenuCheckboxItem as DropdownMenuCheckboxItemBase,
  DropdownMenuContent as DropdownMenuContentBase,
  DropdownMenuGroup,
  DropdownMenuLabel as DropdownMenuLabelBase,
  DropdownMenuPortal,
  DropdownMenuSeparator as DropdownMenuSeparatorBase,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
} from '@/components/ui/dropdown-menu';
import { ShellSwitch } from './ShellSwitch';
import { cn } from '@/utils';

export type ShellMenuTone = 'default' | 'cinematicDark';
export type ShellMenuSize = 'default' | 'compact';
export type ShellMenuItemVariant = 'default' | 'destructive';

export const ShellMenu = DropdownMenuRoot;
export const ShellMenuTrigger = DropdownMenuTrigger;
export const ShellMenuGroup = DropdownMenuGroup;
export const ShellMenuPortal = DropdownMenuPortal;
export const ShellMenuSub = DropdownMenuSub;
export const ShellMenuSubContent = DropdownMenuSubContent;
export const ShellMenuSubTrigger = DropdownMenuSubTrigger;
export const ShellMenuRadioGroup = DropdownMenuRadioGroup;

const ShellMenuContext = React.createContext<{
  tone: ShellMenuTone;
  size: ShellMenuSize;
}>({
  tone: 'default',
  size: 'default',
});

const contentToneClasses: Record<ShellMenuTone, string> = {
  default:
    'z-[1100] rounded-xl border-shell-border bg-shell-bg p-1.5 text-shell-text shadow-[0_20px_48px_rgb(15_23_42/0.18)] dark:bg-shell-surface dark:shadow-[0_22px_56px_rgb(0_0_0/0.34)]',
  cinematicDark: 'z-[1100] rounded-xl border-shell-dark-border bg-shell-dark-panel p-1.5 text-shell-dark-text shadow-2xl',
};

const itemSizeClasses: Record<ShellMenuSize, string> = {
  default: 'py-1.5 text-[13px]',
  compact: 'py-1.5 text-[11px]',
};

const labelToneClasses: Record<ShellMenuTone, string> = {
  default: 'text-shell-muted',
  cinematicDark: 'text-shell-dark-muted',
};

const labelSizeClasses: Record<ShellMenuSize, string> = {
  default: 'px-2.5 py-1.5 text-[13px]',
  compact: 'px-2.5 py-1 text-[11px]',
};

const separatorToneClasses: Record<ShellMenuTone, string> = {
  default: 'bg-shell-border-subtle',
  cinematicDark: 'bg-shell-dark-border',
};

const normalizeMenuChildren = (children: React.ReactNode) => {
  if (typeof children === 'string') {
    return children.trim();
  }

  return children;
};

const getShellMenuItemClassName = ({
  className,
  tone,
  size,
  variant = 'default',
}: {
  className?: string;
  tone: ShellMenuTone;
  size: ShellMenuSize;
  variant?: ShellMenuItemVariant;
}) =>
  cn(
    'shell-dropdown-item relative flex cursor-pointer select-none items-center rounded-lg px-2.5 font-normal outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
    itemSizeClasses[size],
    tone === 'default' &&
      variant === 'default' &&
      'text-shell-text data-[highlighted]:bg-shell-surface data-[highlighted]:text-shell-text dark:data-[highlighted]:bg-shell-surface-subtle',
    tone === 'default' &&
      variant === 'destructive' &&
      'text-shell-danger [&_svg]:text-shell-danger data-[highlighted]:bg-shell-danger-soft data-[highlighted]:text-shell-danger',
    tone === 'cinematicDark' &&
      variant === 'default' &&
      'text-shell-dark-text data-[highlighted]:bg-shell-dark-surface data-[highlighted]:text-shell-dark-text',
    tone === 'cinematicDark' &&
      variant === 'destructive' &&
      'text-shell-dark-danger [&_svg]:text-shell-dark-danger data-[highlighted]:bg-shell-dark-danger-soft data-[highlighted]:text-shell-dark-danger',
    className
  );

export type ShellMenuContentProps = React.ComponentPropsWithoutRef<typeof DropdownMenuContentBase> & {
  tone?: ShellMenuTone;
  size?: ShellMenuSize;
};

export const ShellMenuContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuContentBase>,
  ShellMenuContentProps
>(({ className, tone = 'default', size = 'default', ...props }, ref) => (
  <ShellMenuContext.Provider value={{ tone, size }}>
    <DropdownMenuContentBase
      ref={ref}
      className={cn(contentToneClasses[tone], className)}
      {...props}
    />
  </ShellMenuContext.Provider>
));

ShellMenuContent.displayName = 'ShellMenuContent';

export type ShellMenuItemProps = Omit<
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item>,
  'variant'
> & {
  tone?: ShellMenuTone;
  size?: ShellMenuSize;
  variant?: ShellMenuItemVariant;
};

export const ShellMenuItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  ShellMenuItemProps
>((props, ref) => {
  const context = React.useContext(ShellMenuContext);
  const {
    className,
    children,
    tone = context.tone,
    size = context.size,
    variant = 'default',
    ...rest
  } = props;

  return (
    <DropdownMenuPrimitive.Item
      ref={ref}
      className={cn(
        getShellMenuItemClassName({ className, tone, size, variant }),
        'gap-2.5'
      )}
      {...rest}
    >
      {normalizeMenuChildren(children)}
    </DropdownMenuPrimitive.Item>
  );
});

ShellMenuItem.displayName = 'ShellMenuItem';

export type ShellMenuCheckboxItemProps = React.ComponentPropsWithoutRef<
  typeof DropdownMenuCheckboxItemBase
> & {
  tone?: ShellMenuTone;
  size?: ShellMenuSize;
};

export const ShellMenuCheckboxItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuCheckboxItemBase>,
  ShellMenuCheckboxItemProps
>((props, ref) => {
  const context = React.useContext(ShellMenuContext);
  const {
    className,
    children,
    checked,
    tone = context.tone,
    size = context.size,
    ...rest
  } = props;

  return (
    <DropdownMenuPrimitive.CheckboxItem
      ref={ref}
      checked={checked}
      className={cn(
        'relative flex w-full cursor-pointer select-none items-center rounded-lg py-1.5 pl-2.5 pr-8 outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        itemSizeClasses[size],
        tone === 'default' &&
          'text-shell-text data-[highlighted]:bg-shell-surface data-[highlighted]:text-shell-text dark:data-[highlighted]:bg-shell-surface-subtle',
        tone === 'cinematicDark' &&
          'text-shell-dark-text data-[highlighted]:bg-shell-dark-surface data-[highlighted]:text-shell-dark-text',
        className
      )}
      {...rest}
    >
      {normalizeMenuChildren(children)}
      <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <svg
            className="h-4 w-4 text-current"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
    </DropdownMenuPrimitive.CheckboxItem>
  );
});

ShellMenuCheckboxItem.displayName = 'ShellMenuCheckboxItem';

export type ShellMenuSwitchItemProps = Omit<
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem>,
  'checked' | 'onCheckedChange'
> & {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  tone?: ShellMenuTone;
  size?: ShellMenuSize;
};

export const ShellMenuSwitchItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.CheckboxItem>,
  ShellMenuSwitchItemProps
>((props, ref) => {
  const context = React.useContext(ShellMenuContext);
  const {
    className,
    children,
    checked = false,
    onCheckedChange,
    onSelect,
    tone = context.tone,
    size = context.size,
    ...rest
  } = props;

  const handleSelect = React.useCallback(
    (event: Event) => {
      event.preventDefault();
      onCheckedChange?.(!checked);
      onSelect?.(event);
    },
    [checked, onCheckedChange, onSelect]
  );

  return (
    <DropdownMenuPrimitive.CheckboxItem
      ref={ref}
      checked={checked}
      onSelect={handleSelect}
      className={cn(
        getShellMenuItemClassName({ className, tone, size }),
        'w-full gap-2.5'
      )}
      {...rest}
    >
      <span className="min-w-0 flex-1 truncate">{normalizeMenuChildren(children)}</span>
      <ShellSwitch
        aria-hidden="true"
        checked={checked}
        tone={tone}
        size={size === 'compact' ? 'compact' : 'default'}
        tabIndex={-1}
        className="ml-auto pointer-events-none"
      />
    </DropdownMenuPrimitive.CheckboxItem>
  );
});

ShellMenuSwitchItem.displayName = 'ShellMenuSwitchItem';

export type ShellMenuLabelProps = React.ComponentPropsWithoutRef<typeof DropdownMenuLabelBase> & {
  tone?: ShellMenuTone;
  size?: ShellMenuSize;
};

export const ShellMenuLabel = React.forwardRef<
  React.ElementRef<typeof DropdownMenuLabelBase>,
  ShellMenuLabelProps
>((props, ref) => {
  const context = React.useContext(ShellMenuContext);
  const {
    className,
    tone = context.tone,
    size = context.size,
    ...rest
  } = props;

  return (
    <DropdownMenuLabelBase
      ref={ref}
      className={cn(labelToneClasses[tone], labelSizeClasses[size], className)}
      {...rest}
    />
  );
});

ShellMenuLabel.displayName = 'ShellMenuLabel';

export type ShellMenuSeparatorProps = React.ComponentPropsWithoutRef<typeof DropdownMenuSeparatorBase> & {
  tone?: ShellMenuTone;
};

export const ShellMenuSeparator = React.forwardRef<
  React.ElementRef<typeof DropdownMenuSeparatorBase>,
  ShellMenuSeparatorProps
>(({ className, tone = 'default', ...props }, ref) => (
  <DropdownMenuSeparatorBase
    ref={ref}
    className={cn('my-1', separatorToneClasses[tone], className)}
    {...props}
  />
));

ShellMenuSeparator.displayName = 'ShellMenuSeparator';
