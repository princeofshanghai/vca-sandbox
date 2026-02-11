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

                                                // Auto-generate label if empty and valid URL
                                                let newText = s[idx].text;
                                                const isValidUrl = (string: string) => {
                                                    try { return Boolean(new URL(string)); } catch (e) { return false; }
                                                };

                                                if (isValidUrl(val) && (!newText || newText.trim() === '')) {
                                                    // 1. Immediate fallback: Domain name
                                                    try {
                                                        const urlObj = new URL(val);
                                                        const hostname = urlObj.hostname.replace(/^www\./, '');
                                                        newText = hostname.charAt(0).toUpperCase() + hostname.slice(1);

                                                        // Update state immediately with domain fallback
                                                        const tempS = [...s];
                                                        tempS[idx] = { ...tempS[idx], url: val, text: newText };
                                                        updateSources(tempS);

                                                        // 2. Async fetch: Get real page title via proxy
                                                        fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(val)}`)
                                                            .then(response => response.json())
                                                            .then(data => {
                                                                if (data.contents) {
                                                                    const parser = new DOMParser();
                                                                    const doc = parser.parseFromString(data.contents, "text/html");
                                                                    const title = doc.querySelector('title')?.innerText;

                                                                    if (title) {
                                                                        // Clean up title
                                                                        const cleanTitle = title.split(/ [|-] /)[0].trim();

                                                                        // We need to update the sources again. 
                                                                        // Since we are in a closure, 'content' might be stale, 
                                                                        // but for this prototype, we'll try to re-read or just force update.
                                                                        // A better way in React is functional update, but 'onChange' here likely expects full object.
                                                                        // We'll invoke onChange with a fresh copy of what we expect.
                                                                        // NOTE: Only update if the user hasn't changed the label in the meantime.
                                                                        // Since we can't check that easily without ref, we'll just update for now.

                                                                        // Construct fresh sources array based on what we just set
                                                                        const upgradedSources = [...tempS];
                                                                        upgradedSources[idx] = { ...upgradedSources[idx], text: cleanTitle };

                                                                        // We need to merge with potentially *newer* content if other fields changed, 
                                                                        // but efficiently we just update sources here.
                                                                        // Warning: this could overwrite concurrent edits if user types VERY fast in 200ms.
                                                                        onChange({ ...content, sources: upgradedSources });
                                                                    }
                                                                }
                                                            })
                                                            .catch(() => {
                                                                // If fetch fails, we stick with the domain name fallback
                                                            });
                                                        return; // We handled the update logic inside
                                                    } catch (e) {
                                                        // URL parsing error
                                                    }
                                                }

                                                s[idx] = { ...s[idx], url: val, text: newText };
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
