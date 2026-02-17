import { useState, useEffect } from 'react';
import { Plus, X, GripVertical, Wand2, CheckSquare } from 'lucide-react';
import { Component, CheckboxGroupContent } from '../../studio/types';
import { ComponentEditorPopover } from './ComponentEditorPopover';
import { EditorRoot } from './editor-ui/EditorRoot';
import { EditorHeader } from './editor-ui/EditorHeader';
import { EditorContent } from './editor-ui/EditorContent';
import { EditorSection } from './editor-ui/EditorSection';
import { EditorField } from './editor-ui/EditorField';

interface CheckboxGroupEditorProps {
    component: Component;
    onChange: (updates: Partial<CheckboxGroupContent>) => void;
    children: React.ReactNode;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

// Mock Presets for Checkboxes
const PRESETS = {
    policies: [
        { id: 'tnc', label: 'I agree to the Terms and Conditions' },
        { id: 'privacy', label: 'I agree to the Privacy Policy' },
        { id: 'marketing', label: 'Keep me updated on news and offers' },
    ],
    features: [
        { id: 'f1', label: 'Analytics' },
        { id: 'f2', label: 'Custom Reporting' },
        { id: 'f3', label: 'API Access' },
        { id: 'f4', label: 'White-labeling' },
    ],
    feedback: [
        { id: 'bug', label: 'Report a Bug' },
        { id: 'feature', label: 'Request a Feature' },
        { id: 'other', label: 'Other' },
    ]
};

export function CheckboxGroupEditor({ component, onChange, children, isOpen, onOpenChange }: CheckboxGroupEditorProps) {
    const content = component.content as CheckboxGroupContent;

    // Local state for better UX
    const [localTitle, setLocalTitle] = useState(content.title || '');
    const [localDescription, setLocalDescription] = useState(content.description || '');
    const [localSaveLabel, setLocalSaveLabel] = useState(content.saveLabel || 'Save');
    const [expandedItemId, setExpandedItemId] = useState<string | null>(null);

    useEffect(() => {
        setLocalTitle(content.title || '');
        setLocalDescription(content.description || '');
        setLocalSaveLabel(content.saveLabel || 'Save');
    }, [component.id, content.title, content.description, content.saveLabel]);

    const handleTitleChange = (val: string) => {
        setLocalTitle(val);
        onChange({ ...content, title: val });
    };

    const handleDescriptionChange = (val: string) => {
        setLocalDescription(val);
        onChange({ ...content, description: val });
    };

    const handleSaveLabelChange = (val: string) => {
        setLocalSaveLabel(val);
        onChange({ ...content, saveLabel: val });
    };

    const applyPreset = (presetKey: keyof typeof PRESETS) => {
        onChange({
            ...content,
            options: PRESETS[presetKey].map(opt => ({ ...opt, id: Math.random().toString(36).substr(2, 9) }))
        });
    };

    const updateOption = (index: number, updates: Partial<CheckboxGroupContent['options'][0]>) => {
        const newOptions = [...(content.options || [])];
        newOptions[index] = { ...newOptions[index], ...updates };
        onChange({ ...content, options: newOptions });
    };

    const deleteOption = (index: number) => {
        const newOptions = [...(content.options || [])].filter((_, i) => i !== index);
        onChange({ ...content, options: newOptions });
    };

    const addOption = () => {
        const newOption = {
            id: Math.random().toString(36).substr(2, 9),
            label: 'New Option',
            description: ''
        };
        onChange({ ...content, options: [...(content.options || []), newOption] });
        setExpandedItemId(newOption.id);
    };

    const presetActions = (
        <div className="relative group">
            <button className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors">
                <Wand2 className="w-3.5 h-3.5" />
                <span>Preset</span>
            </button>
            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-xl border border-gray-100 py-1 hidden group-hover:block z-50">
                <button onClick={() => applyPreset('policies')} className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 text-gray-700">
                    Policies
                </button>
                <button onClick={() => applyPreset('features')} className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 text-gray-700">
                    Product Features
                </button>
                <button onClick={() => applyPreset('feedback')} className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 text-gray-700">
                    Feedback Types
                </button>
            </div>
        </div>
    );

    const editorContent = (
        <EditorRoot>
            <EditorHeader
                icon={CheckSquare}
                title="Checkbox Group"
                onClose={() => onOpenChange(false)}
            />
            <EditorContent>
                {/* 1. Settings */}
                <EditorSection title="Settings" action={presetActions}>
                    <EditorField
                        label="Question / Title"
                        value={localTitle}
                        onChange={handleTitleChange}
                        placeholder="e.g. Which topics interest you?"
                    />
                    <EditorField
                        label="Description (Optional)"
                        value={localDescription}
                        onChange={handleDescriptionChange}
                        placeholder="Select all that apply."
                    />
                    <EditorField
                        label="Save Button Label"
                        value={localSaveLabel}
                        onChange={handleSaveLabelChange}
                        placeholder="Save"
                    />
                </EditorSection>

                {/* 2. Options List */}
                <EditorSection
                    title={`Options (${content.options?.length || 0})`}
                    action={
                        <button
                            onClick={addOption}
                            className="flex items-center gap-1 text-[10px] text-blue-600 hover:text-blue-700 font-medium"
                        >
                            <Plus size={12} />
                            Add
                        </button>
                    }
                >
                    <div className="space-y-2">
                        {content.options?.map((option, idx) => (
                            <div key={option.id} className="group border border-gray-200 rounded-lg bg-white overflow-hidden transition-all hover:border-gray-300">
                                {/* Item Header / Summary */}
                                <div
                                    className="flex items-center gap-3 p-2 cursor-pointer bg-gray-50/50 hover:bg-gray-50 transition-colors"
                                    onClick={() => setExpandedItemId(expandedItemId === option.id ? null : option.id)}
                                >
                                    <div className="text-gray-400 cursor-grab active:cursor-grabbing">
                                        <GripVertical className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1 min-w-0 flex items-center gap-2">
                                        <div className="w-4 h-4 rounded border border-gray-300 bg-white flex items-center justify-center">
                                            <div className="w-2 h-2 rounded-[1px] bg-gray-200 opacity-0 group-hover:opacity-100" />
                                        </div>
                                        <div className="text-xs font-medium text-gray-900 truncate">
                                            {option.label || 'New Option'}
                                        </div>
                                    </div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); deleteOption(idx); }}
                                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </div>

                                {/* Expanded Editor */}
                                {expandedItemId === option.id && (
                                    <div className="p-3 border-t border-gray-100 bg-white space-y-3 animate-in fade-in slide-in-from-top-1">
                                        <EditorField
                                            label="Label"
                                            value={option.label}
                                            onChange={(val) => updateOption(idx, { label: val })}
                                        />
                                        <EditorField
                                            label="Description (Optional)"
                                            value={option.description || ''}
                                            onChange={(val) => updateOption(idx, { description: val })}
                                            placeholder="Add extra detail..."
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                        {content.options?.length === 0 && (
                            <div className="text-center py-4 text-xs text-gray-400 border border-dashed border-gray-200 rounded-lg">
                                No options added yet.
                            </div>
                        )}
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
