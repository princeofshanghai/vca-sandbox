import { useRef, useEffect, useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { Link, Plus, X, ThumbsUp } from 'lucide-react';
import { Component, AIInfoContent } from '../../studio/types';
import * as SwitchPrimitive from '@radix-ui/react-switch';
import { ComponentEditorPopover } from './ComponentEditorPopover';
import { MarkdownToolbar } from './MarkdownToolbar';

interface InfoMessageEditorProps {
    component: Component;
    onChange: (updates: Partial<AIInfoContent>) => void;
    children: React.ReactNode;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

// --- Internal Helper Components ---

const Label = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
    <label className={`text-xs font-semibold text-gray-500 ${className}`}>
        {children}
    </label>
);

const Toggle = ({ checked, onCheckedChange }: { checked: boolean; onCheckedChange: (c: boolean) => void }) => (
    <SwitchPrimitive.Root
        checked={checked}
        onCheckedChange={onCheckedChange}
        className={`w-9 h-5 rounded-full relative shadow-sm transition-colors border-transparent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center ${checked ? 'bg-blue-600' : 'bg-gray-200'}`}
    >
        <SwitchPrimitive.Thumb
            className={`block w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${checked ? 'translate-x-4' : 'translate-x-0.75'}`}
        />
    </SwitchPrimitive.Root>
);

export function InfoMessageEditor({ component, onChange, children, isOpen, onOpenChange }: InfoMessageEditorProps) {
    const content = component.content as AIInfoContent;
    const bodyRef = useRef<HTMLTextAreaElement>(null);

    // --- State Management ---
    // Using local state to prevent cursor jumping from re-renders
    const [localBody, setLocalBody] = useState(content.body || '');
    const [localTitle, setLocalTitle] = useState(content.title || '');

    // Sync from props only when component ID changes (to avoid overwriting user typing)
    useEffect(() => {
        setLocalBody(content.body || '');
        setLocalTitle(content.title || '');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [component.id]);

    // Focus handling
    useEffect(() => {
        if (isOpen && bodyRef.current) {
            bodyRef.current.focus();
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
        <div className="flex flex-col p-5 space-y-3 max-h-[60vh] overflow-y-auto thin-scrollbar">
            {/* Body Section */}
            <div className="space-y-2">
                <Label>Message</Label>
                <TextareaAutosize
                    ref={bodyRef}
                    value={localBody}
                    onChange={(e) => handleBodyChange(e.target.value)}
                    placeholder="Type your message here..."
                    minRows={3}
                    className="w-full text-sm leading-relaxed text-gray-700 placeholder:text-gray-300 border border-gray-200 rounded px-2 py-1.5 resize-none focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
                {/* Markdown Toolbar - appears on text selection */}
                <MarkdownToolbar
                    textareaRef={bodyRef}
                    value={localBody}
                    onChange={handleBodyChange}
                />
            </div>

            {/* Title Section */}
            <div className="space-y-1">
                <Label>Title (optional)</Label>
                <input
                    value={localTitle}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="e.g., Eligibility Requirements"
                    className="w-full text-sm font-medium text-gray-900 placeholder:text-gray-300 border border-gray-200 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
            </div>

            {/* Sources Section */}
            <div className="space-y-3">
                <Label className="flex items-center gap-1.5 pt-1">
                    <Link className="w-3.5 h-3.5" /> Sources
                </Label>
                <div className="space-y-2">
                    {(content.sources || []).map((source, idx) => (
                        <div key={idx} className="group relative bg-gray-50 rounded-lg p-2 space-y-2 border border-transparent focus-within:border-blue-200 focus-within:bg-blue-50/30 transition-colors">
                            <input
                                value={source.text}
                                onChange={(e) => {
                                    const s = [...(content.sources || [])];
                                    s[idx] = { ...s[idx], text: e.target.value };
                                    updateSources(s);
                                }}
                                placeholder="Source title"
                                className="w-full text-xs font-medium bg-transparent border border-gray-200 rounded px-1.5 py-1 pr-7 focus:ring-1 focus:ring-blue-500 focus:outline-none focus:border-blue-500 placeholder:text-gray-400 bg-white"
                            />
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] text-gray-400 uppercase">URL</span>
                                <input
                                    value={source.url || ''}
                                    onChange={(e) => {
                                        const s = [...(content.sources || [])];
                                        s[idx] = { ...s[idx], url: e.target.value };
                                        updateSources(s);
                                    }}
                                    placeholder="https://..."
                                    className="flex-1 text-xs text-blue-600 bg-transparent border border-gray-200 rounded px-1.5 py-1 pr-7 focus:ring-1 focus:ring-blue-500 focus:outline-none focus:border-blue-500 placeholder:text-gray-300 bg-white"
                                />
                            </div>
                            <button
                                onClick={() => updateSources((content.sources || []).filter((_, i) => i !== idx))}
                                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 text-gray-400 hover:text-red-600 rounded transition-all"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    ))}
                    <button
                        onClick={() => updateSources([...(content.sources || []), { text: '', url: '' }])}
                        className="w-full py-1.5 border border-dashed border-gray-200 rounded-lg text-xs text-gray-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-colors flex items-center justify-center gap-1.5"
                    >
                        <Plus className="w-3 h-3" /> Add source
                    </button>
                </div>
            </div>

            {/* Feedback Toggle */}
            <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-gray-100 rounded text-gray-500"><ThumbsUp className="w-3.5 h-3.5" /></div>
                    <span className="text-xs font-medium text-gray-900">Show feedback UI</span>
                </div>
                <Toggle
                    checked={content.showFeedback !== false}
                    onCheckedChange={(val) => onChange({ ...content, showFeedback: val })}
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
