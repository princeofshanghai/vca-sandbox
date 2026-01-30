import React from 'react';
import TextareaAutosize from 'react-textarea-autosize';

interface EditorFieldProps {
    label?: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    type?: 'text' | 'textarea';
    minRows?: number;
    className?: string; // Margin overrides etc
    inputRef?: React.Ref<HTMLInputElement | HTMLTextAreaElement>; // Allow ref forwarding
    children?: React.ReactNode; // For helper text or toolbars
    onKeyDown?: (e: React.KeyboardEvent) => void;
}

export const EditorField = ({
    label,
    value,
    onChange,
    placeholder,
    type = 'text',
    minRows = 2,
    className = '',
    inputRef,
    children,
    onKeyDown
}: EditorFieldProps) => {
    return (
        <div className={`flex flex-col gap-1.5 w-full ${className}`}>
            {label && (
                <label className="text-xs font-medium text-gray-500">
                    {label}
                </label>
            )}
            {type === 'textarea' ? (
                <TextareaAutosize
                    ref={inputRef as React.Ref<HTMLTextAreaElement>}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    minRows={minRows}
                    onKeyDown={onKeyDown}
                    className="w-full text-xs text-gray-700 border border-gray-200 rounded p-1.5 resize-none focus:border-blue-500 focus:outline-none bg-white leading-relaxed"
                />
            ) : (
                <input
                    ref={inputRef as React.Ref<HTMLInputElement>}
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    onKeyDown={onKeyDown}
                    className="w-full text-xs text-gray-700 border border-gray-200 rounded p-1.5 focus:border-blue-500 focus:outline-none bg-white"
                />
            )}
            {children}
        </div>
    );
};
