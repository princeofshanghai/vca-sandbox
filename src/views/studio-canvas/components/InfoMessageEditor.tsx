import { useEffect, useState } from 'react';
import { MessageSquareText, Plus, X } from 'lucide-react';
import { Component, AIInfoContent } from '../../studio/types';
import { ComponentEditorPopover } from './ComponentEditorPopover';
import { EditorRoot } from './editor-ui/EditorRoot';
import { EditorHeader } from './editor-ui/EditorHeader';
import { EditorContent } from './editor-ui/EditorContent';
import { EditorSection } from './editor-ui/EditorSection';
import { EditorField } from './editor-ui/EditorField';
import { RichTextEditor } from './RichTextEditor';

interface InfoMessageEditorProps {
    component: Component;
    onChange: (updates: Partial<AIInfoContent>) => void;
    children: React.ReactNode;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}


export function InfoMessageEditor({ component, onChange, children, isOpen, onOpenChange }: InfoMessageEditorProps) {
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
        setLocalBody(value);
        onChange({ ...content, body: value });
    };

    const updateSources = (newSources: AIInfoContent['sources']) => {
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
                    <EditorField renderInput={false}>
                        <RichTextEditor
                            value={localBody}
                            onChange={handleBodyChange}
                            placeholder="Type your message here..."
                        />
                    </EditorField>
                </EditorSection>

                {/* 3. Sources Section */}
                <EditorSection>
                        <div className="space-y-4">
                            {(content.sources || []).map((source, idx) => (
                            <div key={idx} className="group/source relative p-3 bg-shell-surface-subtle rounded-lg border border-shell-border-subtle space-y-2 animate-in fade-in slide-in-from-top-1">
                                <div className="flex justify-between items-start">
                                    <span className="text-[10px] font-semibold text-shell-muted tracking-wider">source {idx + 1}</span>
                                    <button
                                        onClick={() => updateSources((content.sources || []).filter((_, i) => i !== idx))}
                                        className="text-shell-muted hover:text-shell-danger transition-colors"
                                    >
                                        <X size={12} />
                                    </button>
                                </div>

                                <EditorField
                                    value={source.text}
                                    onChange={(val) => {
                                        const s = [...(content.sources || [])];
                                        s[idx] = { ...s[idx], text: val };
                                        updateSources(s);
                                    }}
                                    placeholder="Label (e.g. Wikipedia)"
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
                                />
                            </div>
                        ))}

                        <button
                            onClick={() => updateSources([...(content.sources || []), { text: '', url: '' }])}
                            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border border-dashed border-shell-border text-shell-muted text-xs font-medium hover:border-shell-accent-border hover:text-shell-accent hover:bg-shell-accent-soft transition-all"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add source</span>
                        </button>
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
        >
            {children}
        </ComponentEditorPopover>
    );
}
