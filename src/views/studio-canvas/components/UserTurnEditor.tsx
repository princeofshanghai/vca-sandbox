import { User, MessageSquare, MousePointerClick } from 'lucide-react';
import { ComponentEditorPopover } from './ComponentEditorPopover';
import { EditorRoot } from './editor-ui/EditorRoot';
import { EditorHeader } from './editor-ui/EditorHeader';
import { EditorContent } from './editor-ui/EditorContent';
import { EditorField } from './editor-ui/EditorField';

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
    // We don't need the ref for focus anymore as EditorField handles it via autoFocus or props if needed,
    // but the original had manual focus logic. 
    // The new EditorField accepts inputRef so we can keep it if we want custom focus behavior,
    // or just let the user click.
    // However, the original had a specific focus + selection range set.
    // I'll keep the logic but adapt it to the new structure.

    // Actually, EditorField (new) has no internal focus logic on mount.
    // But it passes inputRef to the underlying input/textarea.

    // I will use a simple autoFocus on the first field which is standard.

    const getIcon = () => {
        switch (inputType) {
            case 'text': return MessageSquare;
            case 'button': return MousePointerClick;
            default: return User;
        }
    };

    const getTitle = () => {
        switch (inputType) {
            case 'text': return 'User Text Input';
            case 'button': return 'User Button Click';
            case 'prompt': return 'AI Prompt Trigger';
            default: return 'User Turn';
        }
    };

    const editorContent = (
        <EditorRoot>
            <EditorHeader
                icon={getIcon()}
                title={getTitle()}
                onClose={() => onOpenChange(false)}
            />
            <EditorContent>
                {/* Dynamic Fields based on Input Type */}
                {inputType === 'text' && (
                    <div className="space-y-1">
                        <EditorField
                            label="User Says"
                            placeholder={'e.g. "I want to book", "Pricing", "How much?"'}
                            value={triggerValue}
                            onChange={(val) => onChange({ triggerValue: val })}
                            type="textarea"
                            minRows={3}
                            autoFocus={true}
                            hint="Enter the keywords or sentences the user might type here."
                        />
                    </div>
                )}

                {inputType === 'button' && (
                    <EditorField
                        label="Button Label"
                        placeholder="Which button does the user click?"
                        value={triggerValue}
                        onChange={(val) => onChange({ triggerValue: val })}
                        autoFocus={true}
                    />
                )}

                {inputType === 'prompt' && (
                    <div className="p-3 bg-shell-accent-soft rounded border border-shell-accent-border text-xs text-shell-accent-text leading-normal font-medium flex items-start gap-2">
                        <div className="mt-0.5">
                            <User size={14} />
                        </div>
                        <div>
                            {isLinked
                                ? `Triggers when user clicks: ${promptText || 'AI Prompt'}`
                                : "Link an AI Prompt on the canvas to trigger this path."}
                        </div>
                    </div>
                )}
            </EditorContent>
        </EditorRoot>
    );

    return (
        <ComponentEditorPopover
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            componentId={nodeId}
            editorContent={editorContent}
            width={320}
        >
            {children}
        </ComponentEditorPopover>
    );
};
