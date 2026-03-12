import { useEffect, useState } from 'react';
import { MessageSquareText, X } from 'lucide-react';
import { ShellIconButton } from '@/components/shell';
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

    // Sync from props only when component ID changes (to avoid overwriting user typing)
    useEffect(() => {
        setLocalBody(content.body || '');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [component.id]);

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
                        />
                    </EditorField>
                </EditorSection>

                {/* 3. Sources Section */}
                <EditorSection title={`Sources (${(content.sources || []).length})`}>
                        <div className="space-y-4">
                            {(content.sources || []).length === 0 && (
                                <div className="rounded-lg border border-dashed border-shell-border px-3 py-3 text-xs text-shell-muted">
                                    No sources yet. Add links people can open from the info message.
                                </div>
                            )}
                            {(content.sources || []).map((source, idx) => (
                            <div key={idx} className="group/source relative p-3 bg-shell-surface-subtle rounded-lg border border-shell-border-subtle space-y-2 animate-in fade-in slide-in-from-top-1">
                                <div className="flex justify-between items-start">
                                    <span className="text-[10px] font-semibold text-shell-muted tracking-wider">Source {idx + 1}</span>
                                    <ShellIconButton
                                        type="button"
                                        size="sm"
                                        disabled={readOnly}
                                        aria-label={`Remove source ${idx + 1}`}
                                        onClick={() => updateSources((content.sources || []).filter((_, i) => i !== idx))}
                                    >
                                        <X size={12} />
                                    </ShellIconButton>
                                </div>

                                <EditorField
                                    value={source.text}
                                    onChange={(val) => {
                                        const s = [...(content.sources || [])];
                                        s[idx] = { ...s[idx], text: val };
                                        updateSources(s);
                                    }}
                                    placeholder="Label (e.g. Wikipedia)"
                                    readOnly={readOnly}
                                />
                                <EditorField
                                    value={source.url || ''}
                                    onChange={(val) => {
                                        const s = [...(content.sources || [])];
                                        // Auto-generate label logic reused here
                                        let newText = s[idx].text;
                                        const isValidUrl = (string: string) => { try { return Boolean(new URL(string)); } catch (_e) { return false; } };

                                        if (isValidUrl(val) && (!newText || newText.trim() === '')) {
                                            try {
                                                const urlObj = new URL(val);
                                                const hostname = urlObj.hostname.replace(/^www\./, '');
                                                newText = hostname.charAt(0).toUpperCase() + hostname.slice(1);
                                            } catch (_e) { /* ignore */ }
                                        }
                                        s[idx] = { ...s[idx], url: val, text: newText };
                                        updateSources(s);
                                    }}
                                    placeholder="URL (https://...)"
                                    readOnly={readOnly}
                                />
                            </div>
                        ))}

                        <EditorAddButton
                            disabled={readOnly}
                            onClick={() => updateSources([...(content.sources || []), { text: '', url: '' }])}
                        >
                            Add source
                        </EditorAddButton>
                    </div>
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
            readOnly={readOnly}
        >
            {children}
        </ComponentEditorPopover>
    );
}
