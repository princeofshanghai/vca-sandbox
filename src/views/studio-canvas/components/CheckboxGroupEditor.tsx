import { useState, useEffect } from 'react';
import { GripVertical, X, CheckSquare, ChevronDown } from 'lucide-react';
import { ShellIconButton } from '@/components/shell';
import { cn } from '@/utils/cn';
import { Component, CheckboxGroupContent } from '../../studio/types';
import { ComponentEditorPopover } from './ComponentEditorPopover';
import { EditorRoot } from './editor-ui/EditorRoot';
import { EditorHeader } from './editor-ui/EditorHeader';
import { EditorAddButton } from './editor-ui/EditorAddButton';
import { EditorActionMenu } from './editor-ui/EditorActionMenu';
import { EditorContent } from './editor-ui/EditorContent';
import { EditorSection } from './editor-ui/EditorSection';
import { EditorField } from './editor-ui/EditorField';
import { EditorFieldRow } from './editor-ui/EditorFieldRow';
import { buildCheckboxAutofillOptions } from './editor-ui/editorAutofillPresets';
import { getCheckboxGroupPrimaryLabel, getCheckboxGroupSecondaryLabel } from '@/components/vca-components/checkbox-group/CheckboxGroup';

interface CheckboxGroupEditorProps {
    component: Component;
    onChange: (updates: Partial<CheckboxGroupContent>) => void;
    onDelete?: () => void;
    children: React.ReactNode;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    readOnly?: boolean;
}

export function CheckboxGroupEditor({
    component,
    onChange,
    onDelete,
    children,
    isOpen,
    onOpenChange,
    readOnly = false,
}: CheckboxGroupEditorProps) {
    const content = component.content as CheckboxGroupContent;

    // Local state for better UX
    const [localPrimaryLabel, setLocalPrimaryLabel] = useState(getCheckboxGroupPrimaryLabel(content));
    const [localSecondaryLabel, setLocalSecondaryLabel] = useState(getCheckboxGroupSecondaryLabel(content));
    const [expandedItemId, setExpandedItemId] = useState<string | null>(null);

    useEffect(() => {
        setLocalPrimaryLabel(getCheckboxGroupPrimaryLabel(content));
        setLocalSecondaryLabel(getCheckboxGroupSecondaryLabel(content));
    }, [component.id, content.primaryLabel, content.secondaryLabel, content.saveLabel, content.cancelLabel]);

    const handlePrimaryLabelChange = (val: string) => {
        if (readOnly) return;
        setLocalPrimaryLabel(val);
        onChange({ ...content, primaryLabel: val });
    };

    const handleSecondaryLabelChange = (val: string) => {
        if (readOnly) return;
        setLocalSecondaryLabel(val);
        onChange({ ...content, secondaryLabel: val });
    };

    const applyPreset = (presetKey: 'users' | 'accounts' | 'invoices') => {
        if (readOnly) return;
        onChange({
            ...content,
            options: buildCheckboxAutofillOptions(presetKey)
        });
    };

    const updateOption = (index: number, updates: Partial<CheckboxGroupContent['options'][0]>) => {
        if (readOnly) return;
        const newOptions = [...(content.options || [])];
        newOptions[index] = { ...newOptions[index], ...updates };
        onChange({ ...content, options: newOptions });
    };

    const deleteOption = (index: number) => {
        if (readOnly) return;
        const newOptions = [...(content.options || [])].filter((_, i) => i !== index);
        onChange({ ...content, options: newOptions });
    };

    const addOption = () => {
        if (readOnly) return;
        const newOption = {
            id: Math.random().toString(36).substr(2, 9),
            label: '',
            description: ''
        };
        onChange({ ...content, options: [...(content.options || []), newOption] });
        setExpandedItemId(newOption.id);
    };

    const presetActions = (
        <EditorActionMenu
            label="Autofill"
            disabled={readOnly}
            items={[
                { label: 'Users', onSelect: () => applyPreset('users') },
                { label: 'Accounts', onSelect: () => applyPreset('accounts') },
                { label: 'Invoices', onSelect: () => applyPreset('invoices') },
            ]}
        />
    );

    const editorContent = (
        <EditorRoot>
            <EditorHeader
                icon={CheckSquare}
                title="Checkbox Group"
                onClose={() => onOpenChange(false)}
                onDelete={onDelete}
                deleteLabel="Remove checkbox group from turn"
                deleteDisabled={readOnly}
            />
            <EditorContent>
                <EditorSection title="Checkboxes" action={presetActions}>
                    <div className="space-y-3">
                        {content.options?.map((option, idx) => (
                            <div key={option.id} className="group border border-shell-border rounded-lg bg-shell-bg overflow-hidden transition-all hover:border-shell-accent-border">
                                {/* Item Header / Summary */}
                                <div
                                    className="flex items-center gap-3 p-2 cursor-pointer bg-shell-surface-subtle hover:bg-shell-surface transition-colors"
                                    onClick={() => setExpandedItemId(expandedItemId === option.id ? null : option.id)}
                                >
                                    <div className="text-shell-muted cursor-grab active:cursor-grabbing">
                                        <GripVertical className="w-4 h-4" />
                                    </div>
                                    <div className="text-shell-muted">
                                        <ChevronDown
                                            className={cn(
                                                "w-4 h-4 transition-transform duration-200",
                                                expandedItemId === option.id && "rotate-180"
                                            )}
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-xs font-medium text-shell-text truncate">
                                            {option.label || `Checkbox ${idx + 1}`}
                                        </div>
                                        {option.description?.trim() && (
                                            <div className="text-[10px] text-shell-muted truncate">
                                                {option.description}
                                            </div>
                                        )}
                                    </div>
                                    <ShellIconButton
                                        onClick={(e) => { e.stopPropagation(); deleteOption(idx); }}
                                        disabled={readOnly}
                                        type="button"
                                        size="sm"
                                        aria-label={`Delete ${option.label || 'checkbox'}`}
                                        className="opacity-0 transition-opacity group-hover:opacity-100"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </ShellIconButton>
                                </div>

                                {/* Expanded Editor */}
                                {expandedItemId === option.id && (
                                    <div className="space-y-4 border-t border-shell-border-subtle bg-shell-bg p-4 animate-in fade-in slide-in-from-top-1">
                                        <EditorField
                                            label="Checkbox label"
                                            value={option.label}
                                            onChange={(val) => updateOption(idx, { label: val })}
                                            placeholder="Product Design"
                                            readOnly={readOnly}
                                        />
                                        <EditorField
                                            label="Caption"
                                            value={option.description || ''}
                                            onChange={(val) => updateOption(idx, { description: val })}
                                            placeholder="Add extra detail..."
                                            readOnly={readOnly}
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                        {content.options?.length === 0 && (
                            <div className="text-center py-4 text-xs text-shell-muted border border-dashed border-shell-border rounded-lg">
                                No checkboxes yet.
                            </div>
                        )}
                    </div>
                    <EditorAddButton onClick={addOption} disabled={readOnly}>
                        Add checkbox
                    </EditorAddButton>
                </EditorSection>

                <EditorSection title="Actions">
                    <EditorFieldRow>
                        <EditorField
                            label="Primary CTA"
                            value={localPrimaryLabel}
                            onChange={handlePrimaryLabelChange}
                            placeholder="Select"
                            readOnly={readOnly}
                        />
                        <EditorField
                            label="Secondary CTA"
                            value={localSecondaryLabel}
                            onChange={handleSecondaryLabelChange}
                            placeholder="Cancel"
                            readOnly={readOnly}
                        />
                    </EditorFieldRow>
                </EditorSection>
            </EditorContent>
        </EditorRoot>
    );

    return (
        <ComponentEditorPopover
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            componentId={component.id}
            editorContent={editorContent}
            width={400}
            readOnly={readOnly}
        >
            {children}
        </ComponentEditorPopover>
    );
}
