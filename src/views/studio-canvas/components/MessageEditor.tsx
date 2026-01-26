import { useRef, useEffect, useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { Component, AIMessageContent } from '../../studio/types';
import { ComponentEditorPopover } from './ComponentEditorPopover';
import { MarkdownToolbar } from './MarkdownToolbar';

interface MessageEditorProps {
    component: Component;
    onChange: (updates: Partial<AIMessageContent>) => void;
    children: React.ReactNode;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

const Label = ({ children }: { children: React.ReactNode }) => (
    <label className="text-xs font-semibold text-gray-500">
        {children}
    </label>
);

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
            <div className="space-y-2">
                <Label>Message</Label>
                <TextareaAutosize
                    ref={textareaRef}
                    value={localText}
                    onChange={(e) => handleTextChange(e.target.value)}
                    placeholder="Type your message here..."
                    minRows={3}
                    maxRows={15}
                    className="w-full text-sm leading-relaxed text-gray-700 placeholder:text-gray-300 border border-gray-200 rounded px-2 py-1.5 resize-none focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
                {/* Markdown Toolbar - appears on text selection */}
                <MarkdownToolbar
                    textareaRef={textareaRef}
                    value={localText}
                    onChange={handleTextChange}
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
