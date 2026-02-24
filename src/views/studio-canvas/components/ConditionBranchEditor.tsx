import { Settings2, ArrowRight } from 'lucide-react';
import { ComponentEditorPopover } from './ComponentEditorPopover';
import { EditorRoot } from './editor-ui/EditorRoot';
import { EditorHeader } from './editor-ui/EditorHeader';
import { EditorContent } from './editor-ui/EditorContent';
import { EditorSection } from './editor-ui/EditorSection';
import { EditorField } from './editor-ui/EditorField';


interface ConditionBranchEditorProps {
    branchId: string;
    condition: string;
    logic?: { variable: string; value: string; operator: 'eq' };
    isDefault?: boolean;
    onChange: (updates: { condition?: string; logic?: { variable: string; value: string; operator: 'eq' }, isDefault?: boolean }) => void;
    children: React.ReactNode;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ConditionBranchEditor({
    branchId,
    condition,
    logic,
    isDefault,
    onChange,
    children,
    isOpen,
    onOpenChange
}: ConditionBranchEditorProps) {
    const editorContent = (
        <EditorRoot>
            <EditorHeader
                icon={Settings2}
                title="Branch"
                onClose={() => onOpenChange(false)}
            />
            <EditorContent>
                {/* Identity Section */}
                <EditorSection>
                    <EditorField
                        label="Button Label"
                        value={condition}
                        onChange={(val) => onChange({ condition: val })}
                        placeholder={'e.g. "Premium", "Free plan", "Need verification"'}
                        hint="This is what people see and click in preview."
                    />
                </EditorSection>

                {/* Conditions Section (Sentence Builder) */}
                <EditorSection title="Conditions">
                    <div className="space-y-4">
                        <div className="text-[11px] text-shell-muted bg-shell-surface-subtle p-2.5 rounded-lg border border-shell-border-subtle leading-relaxed">
                            The button label is for preview UI. The match value is what this path checks in your variable.
                        </div>

                        {/* Status Toggle */}
                        <div className="flex bg-shell-surface-subtle p-1 rounded-lg">
                            <button
                                onClick={() => onChange({ isDefault: true })}
                                className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-all ${isDefault
                                    ? 'bg-shell-bg border border-shell-border shadow-sm text-shell-text'
                                    : 'text-shell-muted hover:text-shell-muted-strong'
                                    }`}
                            >
                                Always (Default)
                            </button>
                            <button
                                onClick={() => onChange({ isDefault: false })}
                                className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-all ${!isDefault
                                    ? 'bg-shell-bg border border-shell-border shadow-sm text-shell-text'
                                    : 'text-shell-muted hover:text-shell-muted-strong'
                                    }`}
                            >
                                When...
                            </button>
                        </div>

                        {isDefault ? (
                            <div className="text-[11px] text-shell-muted bg-shell-surface-subtle p-3 rounded-lg border border-shell-border-subtle leading-relaxed">
                                This path will be taken automatically if no other conditions are met.
                            </div>
                        ) : (
                            <div className="space-y-3 animate-in fade-in slide-in-from-top-1 pt-1">
                                <div className="bg-shell-bg border border-shell-border rounded-lg p-3 space-y-3 shadow-sm">
                                    <div className="text-[10px] font-semibold text-shell-muted uppercase tracking-widest pl-1">
                                        If
                                    </div>
                                    <EditorField
                                        placeholder="[ Attribute key ]"
                                        value={logic?.variable || ''}
                                        onChange={(val) => onChange({ logic: { variable: val, value: logic?.value || '', operator: 'eq' } })}
                                    />

                                    <div className="flex items-center gap-2">
                                        <div className="h-px bg-shell-border-subtle flex-1" />
                                        <span className="text-[10px] font-medium text-shell-muted">is equal to</span>
                                        <div className="h-px bg-shell-border-subtle flex-1" />
                                    </div>

                                    <EditorField
                                        placeholder="[ Match value ]"
                                        value={logic?.value || ''}
                                        onChange={(val) => onChange({ logic: { variable: logic?.variable || '', value: val, operator: 'eq' } })}
                                    />
                                </div>

                                {logic?.variable && (
                                    <div className="flex items-start gap-2 p-2.5 bg-shell-accent-soft rounded-lg border border-shell-accent-border">
                                        <ArrowRight size={14} className="text-shell-accent shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-[11px] text-shell-accent-text font-medium">Preview behavior</p>
                                            <p className="text-[10px] text-shell-accent-text/80 leading-tight">
                                                Shows as <span className="font-semibold text-shell-accent-text">"{condition || 'This path'}"</span> and matches <span className="font-semibold text-shell-accent-text">"{logic.value || 'value'}"</span>.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </EditorSection>

            </EditorContent>
        </EditorRoot>
    );

    return (
        <ComponentEditorPopover
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            componentId={branchId}
            editorContent={editorContent}
            width={320}
        >
            {children}
        </ComponentEditorPopover>
    );
}
