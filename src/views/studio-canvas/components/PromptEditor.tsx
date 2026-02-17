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
    entryPoint?: string;
    onChange: (updates: Partial<PromptContent>) => void;
    children: React.ReactNode;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export function PromptEditor({ component, entryPoint, onChange, children, isOpen, onOpenChange }: PromptEditorProps) {
    const content = component.content as PromptContent;

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
        <EditorRoot>
            <EditorHeader
                icon={MessageCirclePlus}
                title="Prompt"
                onClose={() => onOpenChange(false)}
            />
            <EditorContent>
                <EditorField
                    label="Prompt Instructions"
                    value={localText}
                    onChange={handleTextChange}
                    placeholder={getPlaceholder()}
                    type="textarea"
                    minRows={6}
                    autoFocus={true}
                    hint="Instructions for how the AI should behave in this turn."
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
        >
            {children}
        </ComponentEditorPopover>
    );
}
