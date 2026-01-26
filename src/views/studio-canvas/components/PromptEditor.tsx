import { useRef, useEffect, useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { Component, PromptContent } from '../../studio/types';
import { ComponentEditorPopover } from './ComponentEditorPopover';
import * as SwitchPrimitive from '@radix-ui/react-switch';

interface PromptEditorProps {
    component: Component;
    onChange: (updates: Partial<PromptContent>) => void;
    children: React.ReactNode;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

const Label = ({ children }: { children: React.ReactNode }) => (
    <label className="text-xs font-semibold text-gray-500">
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

export function PromptEditor({ component, onChange, children, isOpen, onOpenChange }: PromptEditorProps) {
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
            textareaRef.current.focus();
        }
    }, [isOpen]);

    const handleTextChange = (value: string) => {
        setLocalText(value);
        onChange({ ...content, text: value });
    };

    const editorContent = (
        <div className="flex flex-col p-5 space-y-3">
            <div className="space-y-2">
                <Label>Prompt text</Label>
                <TextareaAutosize
                    ref={textareaRef}
                    value={localText}
                    onChange={(e) => handleTextChange(e.target.value)}
                    placeholder="Type prompt text..."
                    minRows={2}
                    maxRows={10}
                    className="w-full text-sm leading-relaxed text-gray-700 placeholder:text-gray-300 border border-gray-200 rounded px-2 py-1.5 resize-none focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
            </div>

            {/* AI Icon Toggle */}
            <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-medium text-gray-900">Show AI icon</span>
                <Toggle
                    checked={content.showAiIcon !== false}
                    onCheckedChange={(val) => onChange({ ...content, showAiIcon: val })}
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
