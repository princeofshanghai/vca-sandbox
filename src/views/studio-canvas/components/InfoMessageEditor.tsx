import { useRef, useEffect, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Component, AIInfoContent } from '../../studio/types';
import { ComponentEditorPopover } from './ComponentEditorPopover';
import { MarkdownEditor } from './MarkdownEditor';
import { EditorField } from './EditorField';

interface InfoMessageEditorProps {
    component: Component;
    onChange: (updates: Partial<AIInfoContent>) => void;
    children: React.ReactNode;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}


export function InfoMessageEditor({ component, onChange, children, isOpen, onOpenChange }: InfoMessageEditorProps) {
    const content = component.content as AIInfoContent;
    const bodyRef = useRef<HTMLTextAreaElement>(null);

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

    // Focus handling
    useEffect(() => {
        if (isOpen && bodyRef.current) {
            const el = bodyRef.current;
            el.focus();
            // Small timeout to ensure cursor is placed at the end after browser's default focus behavior
            setTimeout(() => {
                const length = el.value.length;
                el.setSelectionRange(length, length);
            }, 0);
        }
    }, [isOpen]);

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
        <div className="flex flex-col p-5 space-y-5 max-h-[60vh] overflow-y-auto thin-scrollbar">
            {/* 1. Heading Section (Progressive Disclosure) */}
            {(showHeadingField || localTitle.trim() !== '') && (
                <div className="flex items-end gap-2 group/heading animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="flex-1">
                        <EditorField
                            label="Heading (optional)"
                            value={localTitle}
                            onChange={handleTitleChange}
                            placeholder="e.g., Eligibility Requirements"
                        />
                    </div>
                    <button
                        onClick={() => {
                            handleTitleChange('');
                            setShowHeadingField(false);
                        }}
                        className="p-1.5 mb-0.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-all opacity-0 group-hover/heading:opacity-100"
                        title="Remove heading"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* 2. Body Section */}
            <div className="flex flex-col gap-1.5 w-full">
                <label className="text-xs font-medium text-gray-500">
                    Message
                </label>
                <MarkdownEditor
                    value={localBody}
                    onChange={handleBodyChange}
                    placeholder="Type your message here..."
                />
            </div>

            {/* 3. Sources Section (Progressive Disclosure) */}
            {(content.sources && content.sources.length > 0) && (
                <div className="space-y-4">
                    <div className="text-xs font-medium text-gray-500 pt-1">
                        Sources
                    </div>
                    <div className="space-y-5">
                        {content.sources.map((source, idx) => (
                            <div key={idx} className="group/source relative flex flex-col gap-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                                <div className="flex items-end gap-2">
                                    <div className="flex-1">
                                        <EditorField
                                            value={source.text}
                                            onChange={(val) => {
                                                const s = [...(content.sources || [])];
                                                s[idx] = { ...s[idx], text: val };
                                                updateSources(s);
                                            }}
                                            placeholder="Source label"
                                        />
                                    </div>
                                    <button
                                        onClick={() => updateSources((content.sources || []).filter((_, i) => i !== idx))}
                                        className="p-1.5 mb-0.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-all opacity-0 group-hover/source:opacity-100"
                                        title="Remove source"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="flex items-start gap-2">
                                    <div className="flex-1">
                                        <EditorField
                                            value={source.url || ''}
                                            onChange={(val) => {
                                                const s = [...(content.sources || [])];
                                                s[idx] = { ...s[idx], url: val };
                                                updateSources(s);
                                            }}
                                            placeholder="https://..."
                                        />
                                    </div>
                                    {/* Spacer to match the X button width in the row above */}
                                    <div className="w-[28px] p-1.5 invisible shrink-0">
                                        <X className="w-4 h-4" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 4. Action Buttons (Stacked at bottom) */}
            <div className="flex flex-col gap-3 pt-2 border-t border-gray-50">
                {!(showHeadingField || localTitle.trim() !== '') && (
                    <button
                        onClick={() => setShowHeadingField(true)}
                        className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors w-fit"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add heading</span>
                    </button>
                )}

                <button
                    onClick={() => updateSources([...(content.sources || []), { text: '', url: '' }])}
                    className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors w-fit"
                >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add source</span>
                </button>
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
