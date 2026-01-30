import { ComponentEditorPopover } from './ComponentEditorPopover';
import { EditorField } from './EditorField';
import { useRef, useEffect } from 'react';

interface UserTurnEditorProps {
    nodeId: string;
    label: string;
    inputType: 'text' | 'button' | 'prompt';
    triggerValue: string;
    onChange: (updates: { label?: string; inputType?: 'text' | 'button' | 'prompt'; triggerValue?: string }) => void;
    isLinked?: boolean;
    promptText?: string;
    children: React.ReactNode;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export const UserTurnEditor = ({
    nodeId,
    inputType,
    triggerValue,
    onChange,
    isLinked,
    promptText,
    children,
    isOpen,
    onOpenChange
}: UserTurnEditorProps) => {
    const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

    // Focus handling
    useEffect(() => {
        if (isOpen && inputRef.current) {
            const el = inputRef.current;
            el.focus();
            // Small timeout to ensure cursor is placed at the end after browser's default focus behavior
            setTimeout(() => {
                const length = el.value.length;
                el.setSelectionRange(length, length);
            }, 0);
        }
    }, [isOpen]);

    const editorContent = (
        <div className="flex flex-col p-5 space-y-4">
            {/* Dynamic Fields based on Input Type */}
            {inputType === 'text' && (
                <>
                    <EditorField
                        label="User Says"
                        placeholder={'e.g. "I want to book", "Pricing", "How much?"'}
                        value={triggerValue}
                        onChange={(val) => onChange({ triggerValue: val })}
                        type="textarea"
                        minRows={3}
                        inputRef={inputRef}
                    />
                    <p className="text-[10px] text-gray-400 leading-normal">
                        Enter the keywords or sentences the user might type here.
                    </p>
                </>
            )}

            {inputType === 'button' && (
                <EditorField
                    label="Button Label"
                    placeholder="Which button does the user click?"
                    value={triggerValue}
                    onChange={(val) => onChange({ triggerValue: val })}
                    inputRef={inputRef}
                />
            )}

            {inputType === 'prompt' && (
                <div className="p-3 bg-blue-50/50 rounded border border-blue-100/50 text-xs text-blue-700 leading-normal font-medium">
                    {isLinked
                        ? `Triggers when user clicks: ${promptText || 'AI Prompt'}`
                        : "Link an AI Prompt on the canvas to trigger this path."}
                </div>
            )}
        </div>
    );

    return (
        <ComponentEditorPopover
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            componentId={nodeId} // We will wrap the node content in id={`component-${nodeId}`} to make this work
            editorContent={editorContent}
            width={320}
        >
            {children}
        </ComponentEditorPopover>
    );
};
