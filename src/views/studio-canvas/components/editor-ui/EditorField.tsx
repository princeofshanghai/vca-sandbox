import React from 'react';
import { ShellInput, ShellTextareaAutosize } from '@/components/shell';
import { cn } from '@/utils/cn';

interface EditorFieldProps {
    label?: string;
    value?: string;
    onChange?: (value: string) => void;
    placeholder?: string;
    type?: 'text' | 'textarea';
    minRows?: number;
    className?: string;
    inputRef?: React.Ref<HTMLInputElement | HTMLTextAreaElement>;
    hint?: string;
    error?: string;
    children?: React.ReactNode;
    onKeyDown?: (e: React.KeyboardEvent) => void;
    autoFocus?: boolean;
    renderInput?: boolean;
    readOnly?: boolean;
    disabled?: boolean;
}

export const EditorField = ({
    label,
    value,
    onChange,
    placeholder,
    type = 'text',
    minRows = 2,
    className,
    inputRef,
    hint,
    error,
    children,
    onKeyDown,
    autoFocus,
    renderInput = true,
    readOnly = false,
    disabled = false,
}: EditorFieldProps) => {
    const fieldId = React.useId();
    const errorId = error ? `${fieldId}-error` : undefined;
    const hintId = hint ? `${fieldId}-hint` : undefined;
    const describedBy = [errorId, hintId].filter(Boolean).join(' ') || undefined;

    const handleInputKeyDown = (e: React.KeyboardEvent) => {
        e.stopPropagation();
        onKeyDown?.(e);
    };

    return (
        <div className={cn("flex flex-col gap-1.5 w-full", className)}>
            {(label || error) && (
                <div className="flex justify-between items-baseline">
                    {label && (
                        <label
                            className="text-[11px] font-medium text-shell-muted-strong"
                            htmlFor={renderInput ? fieldId : undefined}
                        >
                            {label}
                        </label>
                    )}
                    {error && (
                        <span className="text-[10px] text-shell-danger font-medium" id={errorId}>
                            {error}
                        </span>
                    )}
                </div>
            )}

            {renderInput && (type === 'textarea' ? (
                <ShellTextareaAutosize
                    id={fieldId}
                    ref={inputRef as React.Ref<HTMLTextAreaElement>}
                    value={value || ''}
                    onChange={(e) => onChange?.(e.target.value)}
                    placeholder={placeholder}
                    minRows={minRows}
                    onKeyDown={handleInputKeyDown}
                    autoFocus={autoFocus}
                    readOnly={readOnly}
                    disabled={disabled}
                    aria-invalid={Boolean(error)}
                    aria-describedby={describedBy}
                    className={cn(
                        "min-h-[88px] rounded-lg bg-shell-surface px-3 py-2 text-[13px] leading-relaxed placeholder:text-shell-muted/55 md:text-[13px]",
                        error
                            ? "border-shell-danger-border bg-shell-danger-soft/20 focus-visible:border-shell-danger focus-visible:ring-shell-danger/20"
                            : null
                    )}
                />
            ) : (
                <ShellInput
                    id={fieldId}
                    ref={inputRef as React.Ref<HTMLInputElement>}
                    type="text"
                    value={value || ''}
                    onChange={(e) => onChange?.(e.target.value)}
                    placeholder={placeholder}
                    onKeyDown={handleInputKeyDown}
                    autoFocus={autoFocus}
                    readOnly={readOnly}
                    disabled={disabled}
                    aria-invalid={Boolean(error)}
                    aria-describedby={describedBy}
                    className={cn(
                        "h-auto min-h-[40px] rounded-lg bg-shell-surface px-3 py-2 text-[13px] leading-5 placeholder:text-shell-muted/55 md:text-[13px]",
                        error
                            ? "border-shell-danger-border bg-shell-danger-soft/20 focus-visible:border-shell-danger focus-visible:ring-shell-danger/20"
                            : null
                    )}
                />
            ))}

            {hint && (
                <p className="text-[10px] text-shell-muted leading-relaxed" id={hintId}>
                    {hint}
                </p>
            )}

            {children}
        </div>
    );
};
