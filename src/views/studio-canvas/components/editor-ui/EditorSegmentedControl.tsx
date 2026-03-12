import { LucideIcon } from 'lucide-react';
import {
    ShellSegmentedControl,
    ShellSegmentedControlItem,
} from '@/components/shell';
import { cn } from '@/utils/cn';

interface EditorSegmentedOption<T extends string> {
    value: T;
    label: string;
    icon?: LucideIcon;
}

interface EditorSegmentedControlProps<T extends string> {
    value: T;
    onChange: (value: T) => void;
    options: EditorSegmentedOption<T>[];
    label?: string;
    hint?: string;
    disabled?: boolean;
    readOnly?: boolean;
    className?: string;
    size?: 'default' | 'compact';
}

export function EditorSegmentedControl<T extends string>({
    value,
    onChange,
    options,
    label,
    hint,
    disabled = false,
    readOnly = false,
    className,
    size = 'compact',
}: EditorSegmentedControlProps<T>) {
    return (
        <div className={cn("space-y-1.5", className)}>
            {label && (
                <label className="text-[11px] font-medium text-shell-muted-strong">
                    {label}
                </label>
            )}

            <ShellSegmentedControl
                size={size}
                shape="rounded"
                className="w-full rounded-lg border-shell-border-subtle bg-shell-surface-subtle p-1"
            >
                {options.map((option) => {
                    const Icon = option.icon;

                    return (
                        <ShellSegmentedControlItem
                            key={option.value}
                            type="button"
                            selected={value === option.value}
                            disabled={readOnly || disabled}
                            onClick={() => onChange(option.value)}
                            className="flex-1 justify-center gap-1.5 rounded-md"
                        >
                            {Icon && <Icon className="h-3.5 w-3.5" />}
                            <span>{option.label}</span>
                        </ShellSegmentedControlItem>
                    );
                })}
            </ShellSegmentedControl>

            {hint && (
                <p className="text-[10px] text-shell-muted leading-relaxed">
                    {hint}
                </p>
            )}
        </div>
    );
}
