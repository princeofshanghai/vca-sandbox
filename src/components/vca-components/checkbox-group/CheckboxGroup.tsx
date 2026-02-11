import { useState } from 'react';
import { cn } from '@/utils';
import { Checkbox } from '../checkbox/Checkbox';
import { Button } from '../buttons/Button';

export interface CheckboxOption {
    id: string;
    label: string;
    description?: string;
    disabled?: boolean;
}

export interface CheckboxGroupProps {
    /** Title of the group (e.g. question) */
    title?: string;
    /** Helper description text */
    description?: string;
    /** Array of checkbox options */
    options: CheckboxOption[];
    /** Controlled value: array of selected IDs */
    value?: string[];
    /** Default value for uncontrolled mode */
    defaultValue?: string[];
    /** Callback when selection changes */
    onChange?: (selectedIds: string[]) => void;
    /** Callback for primary action (Save) */
    onSave?: (selectedIds: string[]) => void;
    /** Callback for secondary action (Cancel) */
    onCancel?: () => void;
    /** Label for primary action */
    saveLabel?: string;
    /** Label for secondary action */
    cancelLabel?: string;
    /** Additional classes */
    className?: string;
}

export const CheckboxGroup = ({
    title,
    description,
    options,
    value,
    defaultValue = [],
    onChange,
    onSave,
    onCancel,
    saveLabel = 'Save',
    cancelLabel = 'Cancel',
    className,
}: CheckboxGroupProps) => {
    // Determine if controlled or uncontrolled
    const isControlled = value !== undefined;
    const [internalValue, setInternalValue] = useState<string[]>(defaultValue);

    // Use either controlled value or internal state
    const selectedIds = isControlled ? value : internalValue;

    // Handle internal state updates if props change in uncontrolled mode
    // (Optional but good practice if defaultValue might shift, though usually it's initial only)

    const handleToggle = (id: string, checked: boolean | 'indeterminate') => {
        if (checked === 'indeterminate') return; // Should not happen for this simple group

        let newSelection: string[];
        if (checked) {
            newSelection = [...selectedIds, id];
        } else {
            newSelection = selectedIds.filter(selectedId => selectedId !== id);
        }

        if (!isControlled) {
            setInternalValue(newSelection);
        }

        onChange?.(newSelection);
    };

    return (
        <div className={cn("flex flex-col space-y-6", className)}>
            {/* Header */}
            {(title || description) && (
                <div className="space-y-1">
                    {title && (
                        <h3 className="text-vca-medium-bold text-gray-900">
                            {title}
                        </h3>
                    )}
                    {description && (
                        <p className="text-vca-text-meta text-vca-small">
                            {description}
                        </p>
                    )}
                </div>
            )}

            {/* List */}
            <div className="flex flex-col space-y-4">
                {options.map((option) => (
                    <Checkbox
                        key={option.id}
                        id={option.id}
                        label={option.label}
                        description={option.description}
                        disabled={option.disabled}
                        checked={selectedIds.includes(option.id)}
                        onCheckedChange={(checked) => handleToggle(option.id, checked)}
                    />
                ))}
            </div>

            {/* Actions */}
            {(onSave || onCancel) && (
                <div className="flex items-center gap-2 pt-2">
                    {onSave && (
                        <Button
                            variant="primary"
                            emphasis={true}
                            onClick={() => onSave(selectedIds)}
                        >
                            {saveLabel}
                        </Button>
                    )}
                    {onCancel && (
                        <Button
                            variant="tertiary"
                            emphasis={false}
                            onClick={onCancel}
                        >
                            {cancelLabel}
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
};
