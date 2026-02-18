import { useEffect, useState } from 'react';
import { Component, AIStatusContent } from '../../studio/types';
import { ComponentEditorPopover } from './ComponentEditorPopover';
import { Zap } from 'lucide-react';

import { EditorRoot } from './editor-ui/EditorRoot';
import { EditorHeader } from './editor-ui/EditorHeader';
import { EditorContent } from './editor-ui/EditorContent';
import { EditorSection } from './editor-ui/EditorSection';
import { EditorField } from './editor-ui/EditorField';
import { RichTextEditor } from './RichTextEditor';

interface StatusCardEditorProps {
    component: Component;
    onChange: (updates: Partial<AIStatusContent>) => void;
    children: React.ReactNode;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export function StatusCardEditor({ component, onChange, children, isOpen, onOpenChange }: StatusCardEditorProps) {
    const content = component.content as AIStatusContent;
    // Local state for all fields
    const [localLoadingTitle, setLocalLoadingTitle] = useState(content.loadingTitle || '');
    const [localSuccessTitle, setLocalSuccessTitle] = useState(content.successTitle || '');
    const [localSuccessDesc, setLocalSuccessDesc] = useState(content.successDescription || '');



    // Sync from props only when component ID changes
    useEffect(() => {
        setLocalLoadingTitle(content.loadingTitle || '');
        setLocalSuccessTitle(content.successTitle || '');
        setLocalSuccessDesc(content.successDescription || '');

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [component.id]);

    const handleLoadingTitleChange = (value: string) => {
        setLocalLoadingTitle(value);
        onChange({ ...content, loadingTitle: value });
    };

    const handleSuccessTitleChange = (value: string) => {
        setLocalSuccessTitle(value);
        onChange({ ...content, successTitle: value });
    };

    const handleSuccessDescChange = (value: string) => {
        setLocalSuccessDesc(value);
        onChange({ ...content, successDescription: value });
    };

    const editorContent = (
        <EditorRoot>
            <EditorHeader
                icon={Zap}
                title="Status Card"
                onClose={() => onOpenChange(false)}
            />

            <EditorContent>
                <EditorSection>
                    <EditorField
                        label="Loading label"
                        value={localLoadingTitle}
                        onChange={handleLoadingTitleChange}
                        placeholder="e.g., Removing user..."
                    />

                    <EditorField
                        label="Success label"
                        value={localSuccessTitle}
                        onChange={handleSuccessTitleChange}
                        placeholder="e.g., User removed from Flexis Recruiter"
                    />

                    <EditorField label="Success description" renderInput={false}>
                        <RichTextEditor
                            value={localSuccessDesc}
                            onChange={handleSuccessDescChange}
                            placeholder="Provide additional context or next steps..."
                        />
                    </EditorField>
                </EditorSection>
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

