import { useRef, useEffect, useState } from 'react';
import { Component, AIMessageContent } from '../../studio/types';
import { ComponentEditorPopover } from './ComponentEditorPopover';
import { MarkdownEditor } from './MarkdownEditor';

interface MessageEditorProps {
    component: Component;
    onChange: (updates: Partial<AIMessageContent>) => void;
    children: React.ReactNode;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export function MessageEditor({ component, onChange, children, isOpen, onOpenChange }: MessageEditorProps) {
    const content = component.content as AIMessageContent;
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Local state to prevent cursor jumping
    const [localText, setLocalText] = useState(content.text || '');

    // Sync from props only when component ID changes
    useEffect(() => {
        setLocalText(content.text || '');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [component.id]);

    // Focus handling
    useEffect(() => {
        if (isOpen && textareaRef.current) {
            const el = textareaRef.current;
            el.focus();
            // Small timeout to ensure cursor is placed at the end after browser's default focus behavior
            setTimeout(() => {
                const length = el.value.length;
                el.setSelectionRange(length, length);
            }, 0);
        }
    }, [isOpen]);

    const handleTextChange = (value: string) => {
        setLocalText(value);
        onChange({ ...content, text: value });
    };

    const editorContent = (
        <div className="flex flex-col p-5 space-y-3">
            <div className="flex flex-col gap-1.5 w-full">
                <label className="text-xs font-medium text-gray-500">
                    Message
                </label>
                <MarkdownEditor
                    value={localText}
                    onChange={handleTextChange}
                    placeholder="Type your message here..."
                />
            </div>
        </div>
    );

    return (
        <ComponentEditorPopover
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            componentId={component.id}
            editorContent={editorContent}
            width={360}
        >
            {children}
        </ComponentEditorPopover>
    );
}
