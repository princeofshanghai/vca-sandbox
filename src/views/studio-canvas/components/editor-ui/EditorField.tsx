import React from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { cn } from '@/utils/cn';

interface EditorFieldProps {
    label?: string;
    value: string;
    onChange: (value: string) => void;
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
    autoFocus
}: EditorFieldProps) => {
    return (
        <div className={cn("flex flex-col gap-1.5 w-full", className)}>
            {(label || error) && (
                <div className="flex justify-between items-baseline">
                    {label && (
                        <label className="text-xs font-medium text-gray-700">
                            {label}
                        </label>
                    )}
                    {error && (
                        <span className="text-[10px] text-red-500 font-medium">
                            {error}
                        </span>
                    )}
                </div>
            )}

            {type === 'textarea' ? (
                <TextareaAutosize
                    ref={inputRef as React.Ref<HTMLTextAreaElement>}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    minRows={minRows}
                    onKeyDown={onKeyDown}
                    autoFocus={autoFocus}
                    className={cn(
                        "w-full text-xs text-gray-900 border rounded-lg p-2.5 resize-none leading-relaxed transition-all",
                        "placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100",
                        error
                            ? "border-red-300 focus:border-red-400 focus:ring-red-50 bg-red-50/10"
                            : "border-gray-200 focus:border-blue-400 bg-white"
                    )}
                />
            ) : (
                <input
                    ref={inputRef as React.Ref<HTMLInputElement>}
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    onKeyDown={onKeyDown}
                    autoFocus={autoFocus}
                    className={cn(
                        "w-full text-xs text-gray-900 border rounded-lg p-2 transition-all",
                        "placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100",
                        error
                            ? "border-red-300 focus:border-red-400 focus:ring-red-50 bg-red-50/10"
                            : "border-gray-200 focus:border-blue-400 bg-white"
                    )}
                />
            )}

            {hint && (
                <p className="text-[10px] text-gray-500 leading-relaxed">
                    {hint}
                </p>
            )}

            {children}
        </div>
    );
};
