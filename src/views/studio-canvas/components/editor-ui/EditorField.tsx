import React from 'react';
import TextareaAutosize from 'react-textarea-autosize';
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
    renderInput = true
}: EditorFieldProps) => {
    const handleInputKeyDown = (e: React.KeyboardEvent) => {
        e.stopPropagation();
        onKeyDown?.(e);
    };

    return (
        <div className={cn("flex flex-col gap-1.5 w-full", className)}>
            {(label || error) && (
                <div className="flex justify-between items-baseline">
                    {label && (
                        <label className="text-[11px] font-medium text-shell-muted-strong">
                            {label}
                        </label>
                    )}
                    {error && (
                        <span className="text-[10px] text-shell-danger font-medium">
                            {error}
                        </span>
                    )}
                </div>
            )}

            {renderInput && (type === 'textarea' ? (
                <TextareaAutosize
                    ref={inputRef as React.Ref<HTMLTextAreaElement>}
                    value={value || ''}
                    onChange={(e) => onChange?.(e.target.value)}
                    placeholder={placeholder}
                    minRows={minRows}
                    onKeyDown={handleInputKeyDown}
                    autoFocus={autoFocus}
                    className={cn(
                        "w-full text-[13px] text-shell-text border rounded-lg p-2.5 resize-none leading-relaxed transition-all",
                        "placeholder:text-shell-muted focus:outline-none",
                        error
                            ? "border-shell-danger-border focus:border-shell-danger focus:ring-2 focus:ring-shell-danger/20 bg-shell-danger-soft/20"
                            : "border-shell-border focus:border-shell-accent focus:ring-2 focus:ring-shell-accent/20 bg-shell-bg"
                    )}
                />
            ) : (
                <input
                    ref={inputRef as React.Ref<HTMLInputElement>}
                    type="text"
                    value={value || ''}
                    onChange={(e) => onChange?.(e.target.value)}
                    placeholder={placeholder}
                    onKeyDown={handleInputKeyDown}
                    autoFocus={autoFocus}
                    className={cn(
                        "w-full text-[13px] text-shell-text border rounded-lg p-2.5 transition-all",
                        "placeholder:text-shell-muted focus:outline-none",
                        error
                            ? "border-shell-danger-border focus:border-shell-danger focus:ring-2 focus:ring-shell-danger/20 bg-shell-danger-soft/20"
                            : "border-shell-border focus:border-shell-accent focus:ring-2 focus:ring-shell-accent/20 bg-shell-bg"
                    )}
                />
            ))}

            {hint && (
                <p className="text-[10px] text-shell-muted leading-relaxed">
                    {hint}
                </p>
            )}

            {children}
        </div>
    );
};
