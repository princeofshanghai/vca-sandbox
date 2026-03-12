import { useState } from 'react';
import { cn } from '@/utils';
import { Checkbox } from '../checkbox/Checkbox';
import { Button } from '../buttons/Button';
import { HotspotBeacon } from '../hotspot';

export interface CheckboxOption {
    id: string;
    label: string;
    description?: string;
    disabled?: boolean;
}

interface CheckboxGroupActionConfig {
    primaryLabel?: string;
    secondaryLabel?: string;
    saveLabel?: string;
    cancelLabel?: string;
}

export const getCheckboxGroupPrimaryLabel = ({
    primaryLabel,
    saveLabel,
}: CheckboxGroupActionConfig): string => primaryLabel?.trim() || saveLabel?.trim() || 'Select';

export const getCheckboxGroupSecondaryLabel = ({
    secondaryLabel,
    cancelLabel,
}: CheckboxGroupActionConfig): string => secondaryLabel?.trim() || cancelLabel?.trim() || 'Cancel';

export interface CheckboxGroupProps {
    /** Array of checkbox options */
    options: CheckboxOption[];
    /** Controlled value: array of selected IDs */
    value?: string[];
    /** Default value for uncontrolled mode */
    defaultValue?: string[];
    /** Callback when selection changes */
    onChange?: (selectedIds: string[]) => void;
    /** Callback for primary action */
    onPrimaryAction?: (selectedIds: string[]) => void;
    /** Callback for secondary action */
    onSecondaryAction?: (selectedIds: string[]) => void;
    /** Label for primary action */
    primaryLabel?: string;
    /** Label for secondary action */
    secondaryLabel?: string;
    /** @deprecated Use onPrimaryAction instead. */
    onSave?: (selectedIds: string[]) => void;
    /** @deprecated Use onSecondaryAction instead. */
    onCancel?: () => void;
    /** @deprecated Use primaryLabel instead. */
    saveLabel?: string;
    /** @deprecated Use secondaryLabel instead. */
    cancelLabel?: string;
    showOptionHotspots?: boolean;
    showPrimaryHotspot?: boolean;
    showSecondaryHotspot?: boolean;
    /** @deprecated Use showPrimaryHotspot instead. */
    showSaveHotspot?: boolean;
    /** Additional classes */
    className?: string;
}

export const CheckboxGroup = ({
    options,
    value,
    defaultValue = [],
    onChange,
    onPrimaryAction,
    onSecondaryAction,
    primaryLabel,
    secondaryLabel,
    onSave,
    onCancel,
    saveLabel,
    cancelLabel,
    showOptionHotspots = false,
    showPrimaryHotspot = false,
    showSecondaryHotspot = false,
    showSaveHotspot = false,
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

    const resolvedPrimaryLabel = getCheckboxGroupPrimaryLabel({ primaryLabel, saveLabel });
    const resolvedSecondaryLabel = getCheckboxGroupSecondaryLabel({ secondaryLabel, cancelLabel });
    const primaryAction = onPrimaryAction ?? onSave;
    const secondaryAction = onSecondaryAction ?? (onCancel ? () => onCancel() : undefined);
    const shouldShowPrimaryHotspot = showPrimaryHotspot || showSaveHotspot;

    return (
        <div className={cn("flex flex-col space-y-6", className)}>
            {/* List */}
            <div className="flex flex-col space-y-4">
                {options.map((option) => (
                    <div key={option.id} className="relative">
                        {showOptionHotspots && !option.disabled && (
                            <HotspotBeacon className="-right-2 top-1/2 -translate-y-1/2" />
                        )}
                        <Checkbox
                            id={option.id}
                            label={option.label}
                            description={option.description}
                            labelClassName="font-vca-text text-vca-small-bold text-vca-text"
                            disabled={option.disabled}
                            checked={selectedIds.includes(option.id)}
                            onCheckedChange={(checked) => handleToggle(option.id, checked)}
                        />
                    </div>
                ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2">
                <div className="relative">
                    {shouldShowPrimaryHotspot && (
                        <HotspotBeacon className="-right-2 top-1/2 -translate-y-1/2" />
                    )}
                    <Button
                        variant="secondary"
                        emphasis={true}
                        onClick={() => primaryAction?.(selectedIds)}
                    >
                        {resolvedPrimaryLabel}
                    </Button>
                </div>
                <div className="relative">
                    {showSecondaryHotspot && (
                        <HotspotBeacon className="-right-2 top-1/2 -translate-y-1/2" />
                    )}
                    <Button
                        variant="tertiary"
                        emphasis={false}
                        onClick={() => secondaryAction?.(selectedIds)}
                    >
                        {resolvedSecondaryLabel}
                    </Button>
                </div>
            </div>
        </div>
    );
};
