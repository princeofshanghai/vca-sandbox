import { useState, useEffect } from 'react';
import { Plus, X, GripVertical, Wand2, LayoutList, LayoutGrid, GalleryHorizontal } from 'lucide-react';
import { Component, SelectionListContent } from '../../studio/types';
import { ComponentEditorPopover } from './ComponentEditorPopover';

import { EditorRoot } from './editor-ui/EditorRoot';
import { EditorHeader } from './editor-ui/EditorHeader';
import { EditorContent } from './editor-ui/EditorContent';
import { EditorSection } from './editor-ui/EditorSection';
import { EditorField } from './editor-ui/EditorField';

interface SelectionListEditorProps {
    component: Component;
    onChange: (updates: Partial<SelectionListContent>) => void;
    children: React.ReactNode;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

// Mock Presets
const PRESETS = {
    users: [
        { id: '1', title: 'Sarah Jenkins', subtitle: 'sarah.j@example.com', imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
        { id: '2', title: 'Michael Chen', subtitle: 'm.chen@example.com', imageUrl: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
        { id: '3', title: 'Emily Davis', subtitle: 'edavis@example.com', imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
    ],
    accounts: [
        { id: 'a1', title: 'Acme Corp', subtitle: 'ID: 8839201', iconName: 'building' },
        { id: 'a2', title: 'Globex Inc', subtitle: 'ID: 4492011', iconName: 'building' },
        { id: 'a3', title: 'Soylent Corp', subtitle: 'ID: 1102934', iconName: 'building' },
    ],
    licenses: [
        { id: 'l1', title: 'Enterprise Seat 2024', subtitle: 'Expires Dec 31' },
        { id: 'l2', title: 'Pro Seat 2024', subtitle: 'Expires Nov 15' },
        { id: 'l3', title: 'Basic Seat', subtitle: 'Monthly' },
    ]
};

export function SelectionListEditor({ component, onChange, children, isOpen, onOpenChange }: SelectionListEditorProps) {
    const content = component.content as SelectionListContent;

    // Local state for better UX
    const [localTitle, setLocalTitle] = useState(content.title || '');
    const [expandedItemId, setExpandedItemId] = useState<string | null>(null);

    useEffect(() => {
        setLocalTitle(content.title || '');
    }, [component.id, content.title]);

    const handleTitleChange = (val: string) => {
        setLocalTitle(val);
        onChange({ ...content, title: val });
    };

    const handleLayoutChange = (val: string) => {
        onChange({ ...content, layout: val as 'list' | 'grid' | 'carousel' });
    };

    const applyPreset = (presetKey: keyof typeof PRESETS) => {
        onChange({
            ...content,
            items: PRESETS[presetKey].map(item => ({ ...item, id: Math.random().toString(36).substr(2, 9) }))
        });
    };

    const updateItem = (index: number, updates: Partial<SelectionListContent['items'][0]>) => {
        const newItems = [...(content.items || [])];
        newItems[index] = { ...newItems[index], ...updates };
        onChange({ ...content, items: newItems });
    };

    const deleteItem = (index: number) => {
        const newItems = [...(content.items || [])].filter((_, i) => i !== index);
        onChange({ ...content, items: newItems });
    };

    const addItem = () => {
        const newItem = {
            id: Math.random().toString(36).substr(2, 9),
            title: 'New Item',
            subtitle: 'Description'
        };
        onChange({ ...content, items: [...(content.items || []), newItem] });
        setExpandedItemId(newItem.id);
    };

    const editorContent = (
        <EditorRoot>
            <EditorHeader
                icon={LayoutList}
                title="Selection List"
                onClose={() => onOpenChange(false)}
            />

            <EditorContent>
                {/* 1. Header (Title) */}
                <EditorSection>
                    <EditorField
                        label="Heading (Optional)"
                        value={localTitle}
                        onChange={handleTitleChange}
                        placeholder="e.g., Select an account..."
                    />
                </EditorSection>

                {/* 2. Layout & Presets */}
                <EditorSection title="Layout">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">Display Style</span>

                            {/* Magic Presets Dropdown */}
                            <div className="relative group">
                                <button className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors">
                                    <Wand2 className="w-3.5 h-3.5" />
                                    <span>Load Preset</span>
                                </button>
                                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-xl border border-gray-100 py-1 hidden group-hover:block z-50">
                                    <button onClick={() => applyPreset('users')} className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 text-gray-700">
                                        Users (Avatars)
                                    </button>
                                    <button onClick={() => applyPreset('accounts')} className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 text-gray-700">
                                        Accounts (Icons)
                                    </button>
                                    <button onClick={() => applyPreset('licenses')} className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 text-gray-700">
                                        Simple (Text only)
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { id: 'list', icon: LayoutList, label: 'List' },
                                { id: 'grid', icon: LayoutGrid, label: 'Grid' },
                                { id: 'carousel', icon: GalleryHorizontal, label: 'Carousel' }
                            ].map(opt => (
                                <button
                                    key={opt.id}
                                    onClick={() => handleLayoutChange(opt.id)}
                                    className={`flex flex-col items-center justify-center gap-1.5 p-2 rounded-lg border transition-all ${content.layout === opt.id
                                        ? 'bg-blue-50 border-blue-200 text-blue-700'
                                        : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                                        }`}
                                >
                                    <opt.icon className="w-4 h-4" />
                                    <span className="text-[10px] font-medium">{opt.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </EditorSection>

                {/* 3. Items List */}
                <EditorSection title={`Items (${content.items?.length || 0})`}>
                    <div className="space-y-2">
                        {content.items?.map((item, idx) => (
                            <div key={item.id} className="group border border-gray-200 rounded-lg bg-white overflow-hidden transition-all hover:border-gray-300">
                                {/* Item Header / Summary */}
                                <div
                                    className="flex items-center gap-3 p-2 cursor-pointer bg-gray-50/50 hover:bg-gray-50 transition-colors"
                                    onClick={() => setExpandedItemId(expandedItemId === item.id ? null : item.id)}
                                >
                                    <div className="text-gray-400 cursor-grab active:cursor-grabbing">
                                        <GripVertical className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-xs font-medium text-gray-900 truncate">
                                            {item.title || 'Untitled'}
                                        </div>
                                        <div className="text-[10px] text-gray-500 truncate">
                                            {item.subtitle}
                                        </div>
                                    </div>
                                    <div className="w-6 h-6 rounded overflow-hidden bg-gray-100 flex-shrink-0">
                                        {item.imageUrl && (
                                            <img src={item.imageUrl} className="w-full h-full object-cover" />
                                        )}
                                    </div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); deleteItem(idx); }}
                                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </div>

                                {/* Expanded Editor */}
                                {expandedItemId === item.id && (
                                    <div className="p-3 border-t border-gray-100 bg-white space-y-3 animate-in fade-in slide-in-from-top-1">
                                        <EditorField
                                            label="Title"
                                            value={item.title}
                                            onChange={(val) => updateItem(idx, { title: val })}
                                        />
                                        <EditorField
                                            label="Subtitle"
                                            value={item.subtitle || ''}
                                            onChange={(val) => updateItem(idx, { subtitle: val })}
                                        />
                                        <EditorField
                                            label="Image URL"
                                            value={item.imageUrl || ''}
                                            onChange={(val) => updateItem(idx, { imageUrl: val })}
                                            placeholder="https://..."
                                        />
                                        <EditorField
                                            label="Icon Name (if no image)"
                                            value={item.iconName || ''}
                                            onChange={(val) => updateItem(idx, { iconName: val })}
                                            placeholder="e.g. building, user..."
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={addItem}
                        className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-lg border border-dashed border-gray-300 text-gray-500 text-xs font-medium hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50 transition-all"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Item</span>
                    </button>
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
