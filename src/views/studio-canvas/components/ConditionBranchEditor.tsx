import { useRef, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import { ComponentEditorPopover } from './ComponentEditorPopover';
import { EditorField } from './EditorField';

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

    // Focus handling
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
        <div className="flex flex-col p-4 space-y-4">
            <EditorField
                label="Path Name"
                value={condition}
                onChange={(val) => onChange({ condition: val })}
                inputRef={inputRef}
                placeholder={'e.g. "Yes", "No", "Admin"'}
            />
            <p className="px-1 text-[10px] text-gray-400 leading-normal -mt-3 mb-2">
                Name this outcome so you can easily identify it on the canvas.
            </p>

            <div className="pt-2 border-t border-gray-100 flex flex-col gap-3">
                <span className="text-xs font-medium text-gray-500">When does this happen?</span>

                {/* Default Toggle */}
                <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                        type="checkbox"
                        checked={isDefault || false}
                        onChange={(e) => onChange({ isDefault: e.target.checked })}
                        className="w-3 h-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-600 group-hover:text-gray-900">Default (Else) Path</span>
                </label>

                {isDefault ? (
                    <div className="p-2 bg-gray-50 text-[11px] text-gray-500 rounded border border-gray-200 leading-relaxed">
                        This path will be taken automatically if no other conditions are met.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-3 animate-in fade-in duration-200">
                        <EditorField
                            label="If Property"
                            placeholder="e.g. IsAdmin, UserFound, Subscription"
                            value={logic?.variable || ''}
                            onChange={(val) => onChange({ logic: { variable: val, value: logic?.value || '', operator: 'eq' } })}
                        />

                        <div className="flex flex-col space-y-1">
                            <label className="text-xs font-medium text-gray-500 select-none">Operator</label>
                            <input
                                type="text"
                                disabled
                                value="Equals"
                                className="w-full text-xs text-gray-400 border border-gray-200 rounded p-1.5 bg-gray-50 cursor-not-allowed"
                            />
                        </div>

                        <EditorField
                            label="Is Equal To"
                            placeholder="e.g. true, false, Active"
                            value={logic?.value || ''}
                            onChange={(val) => onChange({ logic: { variable: logic?.variable || '', value: val, operator: 'eq' } })}
                        />

                        {/* Helper Hint for Preview */}
                        {logic?.variable && (
                            <div className="p-2 bg-blue-50 text-[10px] text-blue-600 rounded border border-blue-100 leading-relaxed">
                                Top Tip: To test this, type the expected value in the chat!
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="pt-2 border-t border-gray-100">
                <button
                    onClick={onDelete}
                    className="flex items-center gap-2 text-xs text-red-500 hover:text-red-600 hover:bg-red-50 px-2 py-1.5 rounded transition-colors w-full"
                >
                    <Trash2 size={12} />
                    <span>Delete Branch</span>
                </button>
            </div>
        </div>
    );

    return (
        <ComponentEditorPopover
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            componentId={branchId} // Wrap branch row in id={`component-${branchId}`}
            editorContent={editorContent}
            width={280}
        >
            {children}
        </ComponentEditorPopover>
    );
}
