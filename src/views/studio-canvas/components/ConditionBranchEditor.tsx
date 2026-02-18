import { useRef, useEffect } from 'react';
import { Trash2, Settings2, ArrowRight } from 'lucide-react';
import { ComponentEditorPopover } from './ComponentEditorPopover';
import { EditorRoot } from './editor-ui/EditorRoot';
import { EditorHeader } from './editor-ui/EditorHeader';
import { EditorContent } from './editor-ui/EditorContent';
import { EditorSection } from './editor-ui/EditorSection';
import { EditorField } from './editor-ui/EditorField';


interface ConditionBranchEditorProps {
    nodeId: string;
    branchId: string;
    condition: string;
    logic?: { variable: string; value: string; operator: 'eq' };
    isDefault?: boolean;
    onChange: (updates: { condition?: string; logic?: { variable: string; value: string; operator: 'eq' }, isDefault?: boolean }) => void;
    onDelete: () => void;
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
    onDelete,
    children,
    isOpen,
    onOpenChange
}: ConditionBranchEditorProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    // Focus handling handled by autoFocus in EditorField or we can keep it here if we want specific selection range behavior
    useEffect(() => {
        if (isOpen && inputRef.current) {
            const el = inputRef.current;
            el.focus();
            setTimeout(() => {
                const length = el.value.length;
                el.setSelectionRange(length, length);
            }, 0);
        }
    }, [isOpen]);

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
                        label="Path Name"
                        value={condition}
                        onChange={(val) => onChange({ condition: val })}
                        inputRef={inputRef}
                        placeholder={'e.g. "Yes", "No", "Admin"'}
                        hint="The name shown on the canvas to identify this path."
                    />
                </EditorSection>

                {/* Conditions Section (Sentence Builder) */}
                <EditorSection title="Conditions">
                    <div className="space-y-4">
                        {/* Status Toggle */}
                        <div className="flex bg-gray-100 p-1 rounded-lg">
                            <button
                                onClick={() => onChange({ isDefault: true })}
                                className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-all ${isDefault
                                    ? 'bg-white shadow text-gray-900'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                Always (Default)
                            </button>
                            <button
                                onClick={() => onChange({ isDefault: false })}
                                className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-all ${!isDefault
                                    ? 'bg-white shadow text-gray-900'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                When...
                            </button>
                        </div>

                        {isDefault ? (
                            <div className="text-[11px] text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-100/50 leading-relaxed">
                                This path will be taken automatically if no other conditions are met.
                            </div>
                        ) : (
                            <div className="space-y-3 animate-in fade-in slide-in-from-top-1 pt-1">
                                <div className="bg-white border border-gray-200 rounded-lg p-3 space-y-3 shadow-sm">
                                    <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest pl-1">
                                        If
                                    </div>
                                    <EditorField
                                        placeholder="[ User Attribute ]"
                                        value={logic?.variable || ''}
                                        onChange={(val) => onChange({ logic: { variable: val, value: logic?.value || '', operator: 'eq' } })}
                                    />

                                    <div className="flex items-center gap-2">
                                        <div className="h-px bg-gray-100 flex-1" />
                                        <span className="text-[10px] font-medium text-gray-400">is equal to</span>
                                        <div className="h-px bg-gray-100 flex-1" />
                                    </div>

                                    <EditorField
                                        placeholder="[ Value ]"
                                        value={logic?.value || ''}
                                        onChange={(val) => onChange({ logic: { variable: logic?.variable || '', value: val, operator: 'eq' } })}
                                    />
                                </div>

                                {logic?.variable && (
                                    <div className="flex items-start gap-2 p-2.5 bg-blue-50/50 rounded-lg border border-blue-100/50">
                                        <ArrowRight size={14} className="text-blue-500 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-[11px] text-blue-700 font-medium">Test in Preview</p>
                                            <p className="text-[10px] text-blue-600/80 leading-tight">
                                                Type <span className="font-semibold text-blue-800">"{logic.value}"</span> in the chat to test this path.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </EditorSection>

                {/* Footer Actions */}
                <div className="pt-4 flex justify-end">
                    <button
                        onClick={onDelete}
                        className="flex items-center gap-1.5 text-[10px] font-medium text-gray-400 hover:text-red-500 hover:bg-red-50 px-2 py-1 rounded transition-all group"
                    >
                        <Trash2 size={12} className="group-hover:scale-110 transition-transform" />
                        <span>Delete Branch</span>
                    </button>
                </div>
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

