import * as React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/utils';
import {
  shellTextareaSurfaceToneClasses,
  shellTextareaTextToneClasses,
  shellTextareaVariantClasses,
} from './shellTextareaStyles';

export type ShellTextareaTone = 'default' | 'cinematicDark';
export type ShellTextareaVariant = 'default' | 'bare';

export type ShellTextareaProps = React.ComponentProps<typeof Textarea> & {
  tone?: ShellTextareaTone;
  variant?: ShellTextareaVariant;
};

export const ShellTextarea = React.forwardRef<HTMLTextAreaElement, ShellTextareaProps>(
  ({ className, tone = 'default', variant = 'default', ...props }, ref) => {
    return (
      <Textarea
        ref={ref}
        className={cn(
          'border disabled:cursor-not-allowed disabled:opacity-50',
          shellTextareaTextToneClasses[tone],
          shellTextareaVariantClasses[variant],
          variant === 'default' && shellTextareaSurfaceToneClasses[tone],
          className
        )}
        {...props}
      />
    );
  }
);

ShellTextarea.displayName = 'ShellTextarea';
