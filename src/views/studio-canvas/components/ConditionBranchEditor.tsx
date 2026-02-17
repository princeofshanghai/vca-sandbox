import { useRef, useEffect } from 'react';
import { Trash2, Settings2, ArrowRight } from 'lucide-react';
import { ComponentEditorPopover } from './ComponentEditorPopover';
import { EditorRoot } from './editor-ui/EditorRoot';
import { EditorHeader } from './editor-ui/EditorHeader';
import { EditorContent } from './editor-ui/EditorContent';
import { EditorSection } from './editor-ui/EditorSection';
import { EditorField } from './editor-ui/EditorField';
import { Badge } from '@/components/ui/badge';

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
                title="Branch Settings"
                onClose={() => onOpenChange(false)}
            />
            <EditorContent>
                {/* Identity Section */}
                <EditorSection title="Identity">
                    <EditorField
                        label="Path Name"
                        value={condition}
                        onChange={(val) => onChange({ condition: val })}
                        inputRef={inputRef}
                        placeholder={'e.g. "Yes", "No", "Admin"'}
                        hint="The name shown on the canvas to identify this path."
                    />
                </EditorSection>

                {/* Routing Logic Section */}
                <EditorSection title="Routing Logic">
                    <div className="space-y-4">
                        {/* Default Path Toggle */}
                        <label className="flex items-center justify-between cursor-pointer group p-1">
                            <span className="text-xs text-gray-600 group-hover:text-gray-900 transition-colors">Default (Else) Path</span>
                            <div className="relative inline-flex items-center">
                                <input
                                    type="checkbox"
                                    checked={isDefault || false}
                                    onChange={(e) => onChange({ isDefault: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-7 h-4 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-600"></div>
                            </div>
                        </label>

                        {isDefault ? (
                            <div className="text-[10px] text-gray-500 bg-white/50 p-2 rounded border border-gray-100/50 leading-relaxed italic">
                                This path will be taken automatically if no other conditions are met.
                            </div>
                        ) : (
                            <div className="space-y-4 animate-in fade-in slide-in-from-top-1 duration-200 pt-2 border-t border-gray-100">
                                <EditorField
                                    label="If Property"
                                    placeholder="e.g. IsAdmin"
                                    value={logic?.variable || ''}
                                    onChange={(val) => onChange({ logic: { variable: val, value: logic?.value || '', operator: 'eq' } })}
                                />

                                <div className="flex items-center justify-center gap-2 py-1">
                                    <div className="h-[1px] flex-1 bg-gray-200/60" />
                                    <Badge variant="outline" className="text-[9px] font-bold text-gray-400 border-gray-200 uppercase tracking-widest py-0 px-2 h-5 bg-white">
                                        Is Equal To
                                    </Badge>
                                    <div className="h-[1px] flex-1 bg-gray-200/60" />
                                </div>

                                <EditorField
                                    label="Value"
                                    placeholder="e.g. true"
                                    value={logic?.value || ''}
                                    onChange={(val) => onChange({ logic: { variable: logic?.variable || '', value: val, operator: 'eq' } })}
                                />

                                {logic?.variable && (
                                    <div className="flex gap-2 p-2 bg-blue-50/50 rounded border border-blue-100/50">
                                        <ArrowRight size={12} className="text-blue-400 shrink-0 mt-0.5" />
                                        <p className="text-[10px] text-blue-600/80 leading-tight">
                                            Test this by typing the value in the chat preview!
                                        </p>
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

