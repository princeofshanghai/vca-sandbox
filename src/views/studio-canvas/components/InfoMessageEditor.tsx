import { useEffect, useState } from 'react';
import { MessageSquareText, Pencil, Plus, X } from 'lucide-react';
import { ShellButton, ShellIconButton } from '@/components/shell';
import { Component, AIInfoContent } from '../../studio/types';
import { ComponentEditorPopover } from './ComponentEditorPopover';
import { EditorRoot } from './editor-ui/EditorRoot';
import { EditorHeader } from './editor-ui/EditorHeader';
import { EditorContent } from './editor-ui/EditorContent';
import { EditorSection } from './editor-ui/EditorSection';
import { EditorAddButton } from './editor-ui/EditorAddButton';
import { EditorField } from './editor-ui/EditorField';
import { RichTextEditor } from './RichTextEditor';

interface InfoMessageEditorProps {
    component: Component;
    onChange: (updates: Partial<AIInfoContent>) => void;
    children: React.ReactNode;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    readOnly?: boolean;
}

const isValidSourceUrl = (value: string) => {
    try {
        return Boolean(new URL(value));
    } catch (_error) {
        return false;
    }
};

const deriveSourceLabel = (value?: string) => {
    if (!value || !isValidSourceUrl(value)) return '';

    try {
        const url = new URL(value);
        const hostname = url.hostname.replace(/^www\./, '');
        return hostname.charAt(0).toUpperCase() + hostname.slice(1);
    } catch (_error) {
        return '';
    }
};

export function InfoMessageEditor({
    component,
    onChange,
    children,
    isOpen,
    onOpenChange,
    readOnly = false,
}: InfoMessageEditorProps) {
    const content = component.content as AIInfoContent;

    // --- State Management ---
    // Using local state to prevent cursor jumping from re-renders
    const [localBody, setLocalBody] = useState(content.body || '');
    const [editingCustomLabelIndex, setEditingCustomLabelIndex] = useState<number | null>(null);
    const sources = content.sources || [];

    // Sync from props only when component ID changes (to avoid overwriting user typing)
    useEffect(() => {
        setLocalBody(content.body || '');
        setEditingCustomLabelIndex(null);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [component.id]);

    useEffect(() => {
        if (editingCustomLabelIndex !== null && editingCustomLabelIndex >= sources.length) {
            setEditingCustomLabelIndex(null);
        }
    }, [editingCustomLabelIndex, sources.length]);

    // --- Handlers ---

    const handleBodyChange = (value: string) => {
        if (readOnly) return;
        setLocalBody(value);
        onChange({ ...content, body: value });
    };

    const updateSources = (newSources: AIInfoContent['sources']) => {
        if (readOnly) return;
        onChange({ ...content, sources: newSources });
    };

    const addSource = () => {
        updateSources([...sources, { text: '', url: '' }]);
    };

    const removeSource = (index: number) => {
        updateSources(sources.filter((_, sourceIndex) => sourceIndex !== index));
        setEditingCustomLabelIndex((currentIndex) => {
            if (currentIndex === null) return null;
            if (currentIndex === index) return null;
            return currentIndex > index ? currentIndex - 1 : currentIndex;
        });
    };

    const handleSourceLabelChange = (index: number, value: string) => {
        const nextSources = [...sources];
        nextSources[index] = { ...nextSources[index], text: value };
        updateSources(nextSources);
    };

    const handleSourceUrlChange = (index: number, value: string) => {
        const nextSources = [...sources];
        const currentSource = nextSources[index];
        const previousAutoLabel = deriveSourceLabel(currentSource.url);
        const nextAutoLabel = deriveSourceLabel(value);
        const currentText = currentSource.text || '';
        const hasCustomLabel = Boolean(currentText.trim()) && currentText.trim() !== previousAutoLabel;

        let nextText = currentText;
        if (!hasCustomLabel) {
            if (!value.trim()) {
                nextText = '';
            } else if (nextAutoLabel) {
                nextText = nextAutoLabel;
            }
        }

        nextSources[index] = {
            ...currentSource,
            url: value,
            text: nextText,
        };

        updateSources(nextSources);
    };

    const editorContent = (
        <EditorRoot>
            <EditorHeader
                icon={MessageSquareText}
                title="Info Message"
                onClose={() => onOpenChange(false)}
            />

            <EditorContent>
                <EditorSection>
                    <EditorField label="Info Message text" renderInput={false}>
                        <RichTextEditor
                            value={localBody}
                            onChange={handleBodyChange}
                            placeholder="To add a user in LinkedIn Recruiter, you need to be a Product Settings or Account Center Admin. Here's how you can do it"
                            readOnly={readOnly}
                            surfaceVariant="field"
                            minHeight={160}
                            resizable
                        />
                    </EditorField>
                </EditorSection>

                {/* 3. Sources Section */}
                {sources.length > 0 ? (
                    <EditorSection
                        title="Sources"
                        action={!readOnly ? (
                            <ShellButton
                                type="button"
                                variant="ghost"
                                size="compact"
                                onClick={addSource}
                            >
                                <Plus className="h-3.5 w-3.5" />
                                <span>Add</span>
                            </ShellButton>
                        ) : undefined}
                    >
                        <div className="space-y-3">
                            {sources.map((source, idx) => {
                                const derivedLabel = deriveSourceLabel(source.url);
                                const hasValidUrl = Boolean(source.url && isValidSourceUrl(source.url));
                                const hasCustomLabel =
                                    Boolean(source.text?.trim()) && source.text.trim() !== derivedLabel;
                                const isEditingCustomLabel = editingCustomLabelIndex === idx;
                                const displayLabel = source.text?.trim() || derivedLabel;

                                return (
                                    <div
                                        key={idx}
                                        className="group/source relative rounded-lg border border-shell-border-subtle bg-shell-surface-subtle p-3 space-y-3 animate-in fade-in slide-in-from-top-1"
                                    >
                                        <div className="flex items-start gap-2">
                                            <div className="flex-1">
                                                <EditorField
                                                    label="Source URL"
                                                    value={source.url || ''}
                                                    onChange={(value) => handleSourceUrlChange(idx, value)}
                                                    placeholder="Paste a source URL"
                                                    readOnly={readOnly}
                                                    error={source.url && !isValidSourceUrl(source.url) ? 'Enter a valid URL' : undefined}
                                                    hint={
                                                        source.url && !hasValidUrl
                                                            ? 'Use a full URL like https://example.com'
                                                            : undefined
                                                    }
                                                />
                                            </div>
                                            <ShellIconButton
                                                type="button"
                                                size="sm"
                                                disabled={readOnly}
                                                aria-label={`Remove source ${idx + 1}`}
                                                onClick={() => removeSource(idx)}
                                                className="mt-6"
                                            >
                                                <X size={12} />
                                            </ShellIconButton>
                                        </div>

                                        {(hasValidUrl || hasCustomLabel || isEditingCustomLabel) && (
                                            <div className="rounded-md border border-shell-border-subtle bg-shell-surface px-3 py-2">
                                                <div className="flex items-center justify-between gap-3">
                                                    <div className="min-w-0">
                                                        <p className="truncate text-[11px] font-medium text-shell-text">
                                                            {displayLabel || 'Link label will appear here'}
                                                        </p>
                                                    </div>
                                                    <ShellButton
                                                        type="button"
                                                        variant="ghost"
                                                        size="compact"
                                                        disabled={readOnly}
                                                        onClick={() =>
                                                            setEditingCustomLabelIndex((currentIndex) =>
                                                                currentIndex === idx ? null : idx
                                                            )
                                                        }
                                                    >
                                                        <Pencil className="h-3.5 w-3.5" />
                                                        <span>Edit</span>
                                                    </ShellButton>
                                                </div>
                                            </div>
                                        )}

                                        {(isEditingCustomLabel || hasCustomLabel) && (
                                            <EditorField
                                                label="Custom label"
                                                value={source.text}
                                                onChange={(value) => handleSourceLabelChange(idx, value)}
                                                placeholder={derivedLabel || 'How this link should appear'}
                                                hint={
                                                    derivedLabel
                                                        ? 'Leave blank to use the link name from the URL.'
                                                        : 'Optional. Add a valid URL first if you want an automatic label.'
                                                }
                                                readOnly={readOnly}
                                                autoFocus={isEditingCustomLabel}
                                            />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </EditorSection>
                ) : (
                    <EditorSection>
                        <div className="space-y-2">
                            <EditorAddButton
                                disabled={readOnly}
                                onClick={addSource}
                                icon={<Plus className="h-3.5 w-3.5" />}
                            >
                                Add source
                            </EditorAddButton>
                        </div>
                    </EditorSection>
                )}
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
