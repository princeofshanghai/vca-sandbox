import { useEffect, useState } from 'react';
import { Split } from 'lucide-react';
import { ComponentEditorPopover } from './ComponentEditorPopover';
import { EditorRoot } from './editor-ui/EditorRoot';
import { EditorHeader } from './editor-ui/EditorHeader';
import { EditorContent } from './editor-ui/EditorContent';
import { EditorSection } from './editor-ui/EditorSection';
import { EditorField } from './editor-ui/EditorField';
import { EditorFieldRow } from './editor-ui/EditorFieldRow';
import { EditorSegmentedControl } from './editor-ui/EditorSegmentedControl';


interface ConditionBranchEditorProps {
    branchId: string;
    condition: string;
    logic?: { variable: string; value: string; operator: 'eq' };
    isDefault?: boolean;
    onChange: (updates: { condition?: string; logic?: { variable: string; value: string; operator: 'eq' }, isDefault?: boolean }) => void;
    children: React.ReactNode;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    readOnly?: boolean;
}

export function ConditionBranchEditor({
    branchId,
    condition,
    logic,
    isDefault,
    onChange,
    children,
    isOpen,
    onOpenChange,
    readOnly = false,
}: ConditionBranchEditorProps) {
    const [localPathLabel, setLocalPathLabel] = useState(condition || '');
    const [localBehavior, setLocalBehavior] = useState<'match' | 'fallback'>(isDefault ? 'fallback' : 'match');
    const [localVariable, setLocalVariable] = useState(logic?.variable || '');
    const [localValue, setLocalValue] = useState(logic?.value || '');

    useEffect(() => {
        setLocalPathLabel(condition || '');
        setLocalBehavior(isDefault ? 'fallback' : 'match');
        setLocalVariable(logic?.variable || '');
        setLocalValue(logic?.value || '');
    }, [branchId, condition, isDefault, logic?.variable, logic?.value]);

    const applyMatchRule = (variable: string, value: string) => {
        onChange({
            isDefault: false,
            logic: {
                variable,
                value,
                operator: 'eq'
            }
        });
    };

    const editorContent = (
        <EditorRoot>
            <EditorHeader
                icon={Split}
                title="Path"
                onClose={() => onOpenChange(false)}
            />
            <EditorContent>
                <EditorSection title="Path details">
                    <EditorField
                        label="Path label"
                        value={localPathLabel}
                        onChange={(val) => {
                            if (readOnly) return;
                            setLocalPathLabel(val);
                            onChange({ condition: val });
                        }}
                        placeholder={isDefault ? 'Fallback' : 'Premium members'}
                        readOnly={readOnly}
                    />
                </EditorSection>

                <EditorSection title="Path behavior">
                    <EditorSegmentedControl
                        label="Behavior"
                        value={localBehavior}
                        onChange={(nextValue) => {
                            if (readOnly) return;
                            const nextBehavior = nextValue as 'match' | 'fallback';
                            setLocalBehavior(nextBehavior);

                            if (nextBehavior === 'fallback') {
                                onChange({ isDefault: true, logic: undefined });
                                return;
                            }

                            applyMatchRule(localVariable, localValue);
                        }}
                        options={[
                            { value: 'match', label: 'Match value' },
                            { value: 'fallback', label: 'Fallback' },
                        ]}
                        readOnly={readOnly}
                        size="default"
                    />
                </EditorSection>

                {localBehavior === 'match' && (
                    <EditorSection title="Rule">
                        <EditorFieldRow>
                            <EditorField
                                label="Variable"
                                value={localVariable}
                                onChange={(val) => {
                                    if (readOnly) return;
                                    setLocalVariable(val);
                                    applyMatchRule(val, localValue);
                                }}
                                placeholder="isAdmin"
                                readOnly={readOnly}
                            />
                            <EditorField
                                label="Value"
                                value={localValue}
                                onChange={(val) => {
                                    if (readOnly) return;
                                    setLocalValue(val);
                                    applyMatchRule(localVariable, val);
                                }}
                                placeholder="true"
                                readOnly={readOnly}
                            />
                        </EditorFieldRow>
                    </EditorSection>
                )}

            </EditorContent>
        </EditorRoot>
    );

    return (
        <ComponentEditorPopover
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            componentId={branchId}
            editorContent={editorContent}
            width={400}
            readOnly={readOnly}
        >
            {children}
        </ComponentEditorPopover>
    );
}
