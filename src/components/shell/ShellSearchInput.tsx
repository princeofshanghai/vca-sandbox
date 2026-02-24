import * as React from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/utils';
import { ShellIconButton } from './ShellIconButton';
import { ShellInput } from './ShellInput';

export type ShellSearchInputProps = Omit<React.ComponentProps<typeof ShellInput>, 'type'> & {
  wrapperClassName?: string;
  onClear?: () => void;
  clearAriaLabel?: string;
};

export const ShellSearchInput = React.forwardRef<HTMLInputElement, ShellSearchInputProps>(
  ({ className, wrapperClassName, onClear, clearAriaLabel = 'Clear search', value, ...props }, ref) => {
    const hasValue = typeof value === 'string' && value.length > 0;

    return (
      <div className={cn('relative group/search', wrapperClassName)}>
        <Search
          className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-shell-muted"
          size={14}
        />
        <ShellInput
          ref={ref}
          type="text"
          value={value}
          className={cn(
            'w-full rounded-vca-sm border-transparent bg-shell-border-subtle pl-8 pr-8 text-2xs md:text-2xs text-shell-muted-strong placeholder:text-shell-muted',
            'focus-visible:bg-shell-border focus-visible:border-shell-border',
            className
          )}
          {...props}
        />
        {hasValue && onClear && (
          <ShellIconButton
            onClick={onClear}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 h-6 w-6 text-shell-muted hover:text-shell-muted-strong"
            aria-label={clearAriaLabel}
            type="button"
          >
            <X size={14} />
          </ShellIconButton>
        )}
      </div>
    );
  }
);

ShellSearchInput.displayName = 'ShellSearchInput';
