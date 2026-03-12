import { ALargeSmall, MessageCirclePlus, MousePointerClick } from 'lucide-react';
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
    buttonText?: string;
    children: React.ReactNode;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    readOnly?: boolean;
}

export const UserTurnEditor = ({
    nodeId,
    inputType,
    triggerValue,
    onChange,
    isLinked,
    promptText,
    buttonText,
    children,
    isOpen,
    onOpenChange,
    readOnly = false,
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
            case 'text': return ALargeSmall;
            case 'button': return MousePointerClick;
            case 'prompt': return MessageCirclePlus;
            default: return ALargeSmall;
        }
    };

    const getTitle = () => {
        switch (inputType) {
            case 'text': return 'user message';
            case 'button': return 'User Button Click';
            case 'prompt': return 'AI Prompt Trigger';
            default: return 'User Turn';
        }
    };

    const getButtonHelperText = () => {
        if (isLinked) {
            if (buttonText) {
                return `Triggers when user clicks: ${buttonText}`;
            }

            return 'This path is linked to a button. Update the source component to add or change its label.';
        }

        if (triggerValue.trim()) {
            return `Saved button label: ${triggerValue}. Link a button-based component on the canvas to keep this synced.`;
        }

        return 'Link a button-based component on the canvas to trigger this path.';
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
                            label="User says"
                            placeholder={'e.g. "I want to book", "Pricing", "How much?"'}
                            value={triggerValue}
                            onChange={(val) => onChange({ triggerValue: val })}
                            type="textarea"
                            minRows={3}
                            autoFocus={true}
                            hint="Enter the keywords or sentences the user might type here."
                            readOnly={readOnly}
                        />
                    </div>
                )}

                {inputType === 'button' && (
                    <div className="text-sm leading-relaxed text-shell-text">
                        {getButtonHelperText()}
                    </div>
                )}

                {inputType === 'prompt' && (
                    <div className="text-sm leading-relaxed text-shell-text">
                        {isLinked
                            ? `Triggers when user clicks: ${promptText || 'AI Prompt'}`
                            : "Link an AI Prompt on the canvas to trigger this path."}
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
            readOnly={readOnly}
        >
            {children}
        </ComponentEditorPopover>
    );
};
