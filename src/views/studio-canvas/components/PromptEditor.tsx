import { useRef, useEffect, useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { Component, PromptContent } from '../../studio/types';
import { ComponentEditorPopover } from './ComponentEditorPopover';
interface PromptEditorProps {
    component: Component;
    onChange: (updates: Partial<PromptContent>) => void;
    children: React.ReactNode;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

const Label = ({ children }: { children: React.ReactNode }) => (
    <label className="text-xs font-semibold text-gray-500">
        {children}
    </label>
);

export function PromptEditor({ component, onChange, children, isOpen, onOpenChange }: PromptEditorProps) {
    const content = component.content as PromptContent;
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
                <Label>Prompt text</Label>
                <TextareaAutosize
                    ref={textareaRef}
                    value={localText}
                    onChange={(e) => handleTextChange(e.target.value)}
                    placeholder="Type prompt text..."
                    minRows={2}
                    maxRows={10}
                    className="w-full text-sm leading-relaxed text-gray-700 placeholder:text-gray-300 border border-gray-200 rounded px-2 py-1.5 resize-none focus:ring-1 focus:ring-blue-500 focus:outline-none"
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
