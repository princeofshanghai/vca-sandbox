import { useRef, useEffect, useState } from 'react';
import { Component, PromptContent } from '../../studio/types';
import { ComponentEditorPopover } from './ComponentEditorPopover';
import { EditorField } from './EditorField';

interface PromptEditorProps {
    component: Component;
    entryPoint?: string;
    onChange: (updates: Partial<PromptContent>) => void;
    children: React.ReactNode;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export function PromptEditor({ component, entryPoint, onChange, children, isOpen, onOpenChange }: PromptEditorProps) {
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

    const getPlaceholder = () => {
        switch (entryPoint) {
            case 'flagship':
                return 'Learn about Premium features, Manage subscription, Billing...';
            case 'recruiter':
                return 'Search for candidates, Schedule an interview, View job posts...';
            case 'admin-center':
                return 'Add or remove a user, Manage licenses, View billing...';
            case 'sales-navigator':
                return 'Find leads, Save searches, Manage account lists...';
            case 'learning':
                return 'Find a course, Track learning progress, Get recommendations...';
            case 'campaign-manager':
                return 'Create a campaign, View analytics, Manage budget...';
            default:
                return 'Type prompt text...';
        }
    };

    const editorContent = (
        <div className="flex flex-col p-5 space-y-3">
            <EditorField
                label="Prompt text"
                value={localText}
                onChange={handleTextChange}
                placeholder={getPlaceholder()}
                type="textarea"
                minRows={2}
                inputRef={textareaRef}
            />
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
