import { useEffect, useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { Component, AIMessageContent } from '../../studio/types';
import { ComponentEditorPopover } from './ComponentEditorPopover';
import { EditorRoot } from './editor-ui/EditorRoot';
import { EditorHeader } from './editor-ui/EditorHeader';
import { EditorContent } from './editor-ui/EditorContent';
import { EditorField } from './editor-ui/EditorField';
import { RichTextEditor } from './RichTextEditor';

interface MessageEditorProps {
    component: Component;
    onChange: (updates: Partial<AIMessageContent>) => void;
    onDelete?: () => void;
    children: React.ReactNode;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    readOnly?: boolean;
}

export function MessageEditor({
    component,
    onChange,
    onDelete,
    children,
    isOpen,
    onOpenChange,
    readOnly = false,
}: MessageEditorProps) {
    const content = component.content as AIMessageContent;

    // Local state to prevent cursor jumping
    const [localText, setLocalText] = useState(content.text || '');

    // Sync from props only when component ID changes
    useEffect(() => {
        setLocalText(content.text || '');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [component.id]);

    const handleTextChange = (value: string) => {
        if (readOnly) return;
        setLocalText(value);
        onChange({ ...content, text: value });
    };

    const editorContent = (
        <EditorRoot>
            <EditorHeader
                icon={MessageSquare}
                title="Message"
                onClose={() => onOpenChange(false)}
                onDelete={onDelete}
                deleteLabel="Remove message from turn"
                deleteDisabled={readOnly}
            />
            <EditorContent>
                <EditorField label="Message text" renderInput={false}>
                    <RichTextEditor
                        value={localText}
                        onChange={handleTextChange}
                        placeholder="How can I help?"
                        autoFocus={isOpen && !readOnly}
                        readOnly={readOnly}
                        surfaceVariant="field"
                    />
                </EditorField>
            </EditorContent>
        </EditorRoot>
    );

    return (
        <ComponentEditorPopover
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            componentId={component.id}
            editorContent={editorContent}
            width={400} // Increased width for better writing experience
            readOnly={readOnly}
        >
            {children}
        </ComponentEditorPopover>
    );
}
