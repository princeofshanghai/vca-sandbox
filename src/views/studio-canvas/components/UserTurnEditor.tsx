import { Keyboard, MousePointerClick } from 'lucide-react';
import { ComponentEditorPopover } from './ComponentEditorPopover';
import { EditorRoot } from './editor-ui/EditorRoot';
import { EditorHeader } from './editor-ui/EditorHeader';
import { EditorContent } from './editor-ui/EditorContent';
import { EditorField } from './editor-ui/EditorField';

interface UserTurnEditorProps {
    nodeId: string;
    mode: 'text' | 'click';
    triggerValue: string;
    onChange: (updates: {
        label?: string;
        labelMode?: 'auto' | 'custom';
        autoLabel?: string;
        inputType?: 'text' | 'button' | 'prompt';
        triggerValue?: string;
    }) => void;
    clickLabel?: string;
    clickComponentLabel?: string;
    clickComponentIcon?: React.ReactNode;
    onDelete?: () => void;
    children: React.ReactNode;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    readOnly?: boolean;
}

export const UserTurnEditor = ({
    nodeId,
    mode,
    triggerValue,
    onChange,
    clickLabel,
    clickComponentLabel,
    clickComponentIcon,
    onDelete,
    children,
    isOpen,
    onOpenChange,
    readOnly = false,
}: UserTurnEditorProps) => {
    const getIcon = () => {
        return mode === 'click' ? MousePointerClick : Keyboard;
    };

    const getTitle = () => {
        return mode === 'click' ? 'User clicks' : "Edit user's message";
    };

    const currentClickLabel = clickLabel || triggerValue.trim() || 'No click target yet';
    const connectedComponentLabel = clickComponentLabel || 'Not connected yet';

    const editorContent = (
        <EditorRoot>
            <EditorHeader
                icon={getIcon()}
                title={getTitle()}
                titlePrefix={null}
                onClose={() => onOpenChange(false)}
                onDelete={onDelete}
                deleteLabel="Delete user turn"
                deleteDisabled={readOnly}
            />
            <EditorContent>
                {mode === 'text' && (
                    <div className="space-y-1">
                        <EditorField
                            label="What does the user say?"
                            placeholder={'e.g. "I want to book", "Pricing", "How much?"'}
                            value={triggerValue}
                            onChange={(val) => onChange({ triggerValue: val })}
                            type="textarea"
                            minRows={3}
                            autoFocus={isOpen && !readOnly}
                            readOnly={readOnly}
                        />
                    </div>
                )}

                {mode === 'click' && (
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-1 text-xs font-medium text-shell-text">
                            {clickComponentIcon ? (
                                <span className="text-shell-accent">
                                    {clickComponentIcon}
                                </span>
                            ) : null}
                            <span>{connectedComponentLabel}</span>
                        </div>
                        <p className="text-[13px] leading-5 text-shell-text">
                            {currentClickLabel}
                        </p>
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
