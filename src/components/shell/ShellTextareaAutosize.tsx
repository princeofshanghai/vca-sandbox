import * as React from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { cn } from '@/utils';
import {
  shellTextareaSurfaceToneClasses,
  shellTextareaTextToneClasses,
  shellTextareaVariantClasses,
} from './shellTextareaStyles';
import type { ShellTextareaTone, ShellTextareaVariant } from './ShellTextarea';

export type ShellTextareaAutosizeProps = React.ComponentProps<typeof TextareaAutosize> & {
  tone?: ShellTextareaTone;
  variant?: ShellTextareaVariant;
};

export const ShellTextareaAutosize = React.forwardRef<
  HTMLTextAreaElement,
  ShellTextareaAutosizeProps
>(({ className, tone = 'default', variant = 'default', ...props }, ref) => {
  return (
    <TextareaAutosize
      ref={ref}
      className={cn(
        'flex w-full border disabled:cursor-not-allowed disabled:opacity-50',
        shellTextareaTextToneClasses[tone],
        shellTextareaVariantClasses[variant],
        variant === 'default' && shellTextareaSurfaceToneClasses[tone],
        className
      )}
      {...props}
    />
  );
});

ShellTextareaAutosize.displayName = 'ShellTextareaAutosize';
