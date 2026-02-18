import { useEffect, useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { Component, AIMessageContent } from '../../studio/types';
import { ComponentEditorPopover } from './ComponentEditorPopover';
import { EditorRoot } from './editor-ui/EditorRoot';
import { EditorHeader } from './editor-ui/EditorHeader';
import { EditorContent } from './editor-ui/EditorContent';
import { RichTextEditor } from './RichTextEditor';

interface MessageEditorProps {
    component: Component;
    onChange: (updates: Partial<AIMessageContent>) => void;
    children: React.ReactNode;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export function MessageEditor({ component, onChange, children, isOpen, onOpenChange }: MessageEditorProps) {
    const content = component.content as AIMessageContent;

    // Local state to prevent cursor jumping
    const [localText, setLocalText] = useState(content.text || '');

    // Sync from props only when component ID changes
    useEffect(() => {
        setLocalText(content.text || '');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [component.id]);

    const handleTextChange = (value: string) => {
        setLocalText(value);
        onChange({ ...content, text: value });
    };

    const editorContent = (
        <EditorRoot>
            <EditorHeader
                icon={MessageSquare}
                title="Message"
                onClose={() => onOpenChange(false)}
            />
            <EditorContent>
                <div className="flex flex-col gap-1.5 w-full">

                    <RichTextEditor
                        value={localText}
                        onChange={handleTextChange}
                        placeholder="Type your message here..."
                        autoFocus={true}
                    />
                </div>
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
        >
            {children}
        </ComponentEditorPopover>
    );
}
