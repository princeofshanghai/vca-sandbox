import React from 'react';
import {
    ShellSelect,
    ShellSelectContent,
    ShellSelectItem,
    ShellSelectTrigger,
    ShellSelectValue,
} from '@/components/shell';
import { cn } from '@/utils/cn';

interface EditorSelectOption<T extends string> {
    label: string;
    value: T;
}

interface EditorSelectFieldProps<T extends string> {
    label?: string;
    value?: T;
    onChange: (value: T) => void;
    options: EditorSelectOption<T>[];
    placeholder?: string;
    hint?: string;
    disabled?: boolean;
    readOnly?: boolean;
    className?: string;
    contentClassName?: string;
}

export function EditorSelectField<T extends string>({
    label,
    value,
    onChange,
    options,
    placeholder,
    hint,
    disabled = false,
    readOnly = false,
    className,
    contentClassName,
}: EditorSelectFieldProps<T>) {
    const fieldId = React.useId();
    const hintId = hint ? `${fieldId}-hint` : undefined;

    return (
        <div className={cn("flex flex-col gap-1.5 w-full", className)}>
            {label && (
                <label className="text-[11px] font-medium text-shell-muted-strong" htmlFor={fieldId}>
                    {label}
                </label>
            )}

            <ShellSelect
                disabled={readOnly || disabled}
                value={value}
                onValueChange={(nextValue) => onChange(nextValue as T)}
            >
                <ShellSelectTrigger
                    id={fieldId}
                    aria-describedby={hintId}
                    className="h-auto min-h-[40px] rounded-lg bg-shell-surface px-3 py-2 text-[13px] leading-5 md:text-[13px]"
                >
                    <ShellSelectValue placeholder={placeholder} />
                </ShellSelectTrigger>
                <ShellSelectContent
                    className={cn("rounded-lg", contentClassName)}
                    data-editor-keep-open
                >
                    {options.map((option) => (
                        <ShellSelectItem
                            key={option.value}
                            value={option.value}
                            className="text-[13px]"
                        >
                            {option.label}
                        </ShellSelectItem>
                    ))}
                </ShellSelectContent>
            </ShellSelect>

            {hint && (
                <p className="text-[10px] text-shell-muted leading-relaxed" id={hintId}>
                    {hint}
                </p>
            )}
        </div>
    );
}
