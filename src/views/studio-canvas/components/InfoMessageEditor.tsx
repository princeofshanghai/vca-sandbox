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
    const [localTitle, setLocalTitle] = useState(content.title || '');
    const [showHeadingField, setShowHeadingField] = useState(false);

    // Sync from props only when component ID changes (to avoid overwriting user typing)
    useEffect(() => {
        setLocalBody(content.body || '');
        setLocalTitle(content.title || '');
        setShowHeadingField(content.title?.trim() !== '');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [component.id]);

    // --- Handlers ---

    const handleBodyChange = (value: string) => {
        setLocalBody(value);
        onChange({ ...content, body: value });
    };

    const handleTitleChange = (value: string) => {
        setLocalTitle(value);
        onChange({ ...content, title: value });
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
                {/* 1. Heading Section (Progressive Disclosure) */}
                <EditorSection title="Header">
                    {!showHeadingField && localTitle.trim() === '' ? (
                        <button
                            onClick={() => setShowHeadingField(true)}
                            className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors w-fit"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add heading</span>
                        </button>
                    ) : (
                        <div className="flex items-end gap-2 group/heading animate-in fade-in slide-in-from-top-1 duration-200">
                            <EditorField
                                label="Heading"
                                value={localTitle}
                                onChange={handleTitleChange}
                                placeholder="e.g., Eligibility Requirements"
                                className="flex-1"
                            >
                                <button
                                    onClick={() => {
                                        handleTitleChange('');
                                        setShowHeadingField(false);
                                    }}
                                    className="absolute right-0 top-0 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-all opacity-0 group-hover/heading:opacity-100"
                                    title="Remove heading"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </EditorField>
                        </div>
                    )}
                </EditorSection>

                {/* 2. Body Section */}
                <EditorSection title="Content">
                    <EditorField label="Message Body" value="" onChange={() => { }}>
                        <RichTextEditor
                            value={localBody}
                            onChange={handleBodyChange}
                            placeholder="Type your message here..."
                        />
                    </EditorField>
                </EditorSection>

                {/* 3. Sources Section */}
                <EditorSection title="Citations & Sources" collapsible defaultOpen={false}>
                    <div className="space-y-4">
                        {(content.sources || []).map((source, idx) => (
                            <div key={idx} className="group/source relative p-3 bg-gray-50 rounded-lg border border-gray-100 space-y-2 animate-in fade-in slide-in-from-top-1">
                                <div className="flex justify-between items-start">
                                    <span className="text-[10px] uppercase font-semibold text-gray-400 tracking-wider">Source {idx + 1}</span>
                                    <button
                                        onClick={() => updateSources((content.sources || []).filter((_, i) => i !== idx))}
                                        className="text-gray-400 hover:text-red-500 transition-colors"
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
                                        const isValidUrl = (string: string) => { try { return Boolean(new URL(string)); } catch (e) { return false; } };

                                        if (isValidUrl(val) && (!newText || newText.trim() === '')) {
                                            try {
                                                const urlObj = new URL(val);
                                                const hostname = urlObj.hostname.replace(/^www\./, '');
                                                newText = hostname.charAt(0).toUpperCase() + hostname.slice(1);
                                            } catch (e) { }
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
                            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border border-dashed border-gray-300 text-gray-500 text-xs font-medium hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50 transition-all"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add Source</span>
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
