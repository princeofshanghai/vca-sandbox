import { useEffect, useState } from 'react';
import { MessageCirclePlus } from 'lucide-react';
import { Component, PromptContent } from '../../studio/types';
import { ComponentEditorPopover } from './ComponentEditorPopover';
import { EditorRoot } from './editor-ui/EditorRoot';
import { EditorHeader } from './editor-ui/EditorHeader';
import { EditorContent } from './editor-ui/EditorContent';
import { EditorField } from './editor-ui/EditorField';

interface PromptEditorProps {
    component: Component;
    onChange: (updates: Partial<PromptContent>) => void;
    children: React.ReactNode;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    readOnly?: boolean;
}

export function PromptEditor({
    component,
    onChange,
    children,
    isOpen,
    onOpenChange,
    readOnly = false,
}: PromptEditorProps) {
    const content = component.content as PromptContent;

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
                icon={MessageCirclePlus}
                title="Prompt"
                onClose={() => onOpenChange(false)}
            />
            <EditorContent>
                <EditorField
                    label="Prompt text"
                    value={localText}
                    onChange={handleTextChange}
                    placeholder="Learn about Premium features"
                    type="textarea"
                    minRows={2}
                    readOnly={readOnly}
                />
            </EditorContent>
        </EditorRoot>
    );

    return (
        <ComponentEditorPopover
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            componentId={component.id}
            editorContent={editorContent}
            width={400}
            readOnly={readOnly}
        >
            {children}
        </ComponentEditorPopover>
    );
}
