import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Plus, X, GripVertical, Wand2, LayoutList, LayoutGrid, GalleryHorizontal } from 'lucide-react';
import { Avatar, AvatarFallbackTone } from '@/components/vca-components/avatar';
import { VcaIcon, VcaIconName } from '@/components/vca-components/icons';
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
    readOnly?: boolean;
}

type SelectionListItem = SelectionListContent['items'][0];
type ItemVisualType = NonNullable<SelectionListItem['visualType']>;

const ICON_OPTIONS: VcaIconName[] = ['user', 'building', 'document', 'messages'];
const FALLBACK_AVATAR_TONES: AvatarFallbackTone[] = ['amber', 'rose', 'green', 'blue', 'taupe'];

const getFallbackToneFromSeed = (seed: string): AvatarFallbackTone => {
    let hash = 0;
    for (let i = 0; i < seed.length; i += 1) {
        hash = (hash << 5) - hash + seed.charCodeAt(i);
        hash |= 0;
    }
    return FALLBACK_AVATAR_TONES[Math.abs(hash) % FALLBACK_AVATAR_TONES.length];
};

const getResolvedVisualType = (item: SelectionListItem): ItemVisualType => {
    if (item.imageUrl) return 'avatar';
    if (item.visualType) return item.visualType;
    if (item.iconName) return 'icon';
    return 'none';
};

interface SelectionListItemRowProps {
    item: SelectionListItem;
    isExpanded: boolean;
    readOnly?: boolean;
    onToggle: (itemId: string) => void;
    onUpdate: (itemId: string, updates: Partial<SelectionListItem>) => void;
    onDelete: (itemId: string) => void;
}

const SelectionListItemRow = memo(({
    item,
    isExpanded,
    readOnly = false,
    onToggle,
    onUpdate,
    onDelete,
}: SelectionListItemRowProps) => {
    const handleToggle = useCallback(() => {
        onToggle(item.id);
    }, [item.id, onToggle]);

    const handleDelete = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        if (readOnly) return;
        onDelete(item.id);
    }, [item.id, onDelete, readOnly]);

    const handleTitleChange = useCallback((val: string) => {
        if (readOnly) return;
        onUpdate(item.id, { title: val });
    }, [item.id, onUpdate, readOnly]);

    const handleSubtitleChange = useCallback((val: string) => {
        if (readOnly) return;
        onUpdate(item.id, { subtitle: val });
    }, [item.id, onUpdate, readOnly]);

    const handleVisualTypeChange = useCallback((visualType: ItemVisualType) => {
        if (readOnly) return;
        if (visualType === 'avatar') {
            onUpdate(item.id, {
                visualType: 'avatar',
                iconName: undefined
            });
            return;
        }

        if (visualType === 'icon') {
            onUpdate(item.id, {
                visualType: 'icon',
                imageUrl: undefined,
                iconName: (item.iconName as VcaIconName) || 'building'
            });
            return;
        }

        onUpdate(item.id, {
            visualType: 'none',
            imageUrl: undefined,
            iconName: undefined
        });
    }, [item.iconName, item.id, onUpdate, readOnly]);

    const handleIconNameChange = useCallback((iconName: VcaIconName) => {
        if (readOnly) return;
        onUpdate(item.id, { iconName, visualType: 'icon' });
    }, [item.id, onUpdate, readOnly]);

    const currentVisualType = getResolvedVisualType(item);
    const fallbackTone = getFallbackToneFromSeed(item.id || item.title || 'item');

    return (
        <div className="group border border-shell-border rounded-lg bg-shell-bg overflow-hidden transition-all hover:border-shell-accent-border">
            {/* Item Header / Summary */}
            <div
                className="flex items-center gap-3 p-2 cursor-pointer bg-shell-surface-subtle hover:bg-shell-surface transition-colors"
                onClick={handleToggle}
            >
                <div className="text-shell-muted cursor-grab active:cursor-grabbing">
                    <GripVertical className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-shell-text truncate">
                        {item.title || 'Untitled'}
                    </div>
                    <div className="text-[10px] text-shell-muted truncate">
                        {item.subtitle}
                    </div>
                </div>
                <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                    {currentVisualType === 'avatar' && (
                        <Avatar
                            size={24}
                            src={item.imageUrl}
                            alt={item.title ? `${item.title} avatar` : 'Item avatar'}
                            fallbackStyle="silhouette"
                            fallbackTone={fallbackTone}
                        />
                    )}
                    {currentVisualType === 'icon' && (
                        <div className="w-6 h-6 rounded-md bg-shell-surface border border-shell-border-subtle flex items-center justify-center text-shell-muted">
                            <VcaIcon icon={(item.iconName as VcaIconName) || 'building'} size="sm" />
                        </div>
                    )}
                    {currentVisualType === 'none' && (
                        <div className="w-6 h-6 rounded-md border border-dashed border-shell-border" />
                    )}
                </div>
                <button
                    onClick={handleDelete}
                    disabled={readOnly}
                    className="p-1.5 text-shell-muted hover:text-shell-danger hover:bg-shell-danger-soft rounded transition-all opacity-0 group-hover:opacity-100"
                >
                    <X className="w-3.5 h-3.5" />
                </button>
            </div>

            {/* Expanded Editor */}
            {isExpanded && (
                <div className="p-3 border-t border-shell-border-subtle bg-shell-bg space-y-3 animate-in fade-in slide-in-from-top-1">
                    <EditorField
                        label="Title"
                        value={item.title}
                        onChange={handleTitleChange}
                        readOnly={readOnly}
                    />
                    <EditorField
                        label="Subtitle"
                        value={item.subtitle || ''}
                        onChange={handleSubtitleChange}
                        readOnly={readOnly}
                    />
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-medium text-shell-muted-strong">Visual</label>
                        <div className="grid grid-cols-3 gap-1.5">
                            {(['avatar', 'icon', 'none'] as ItemVisualType[]).map((option) => (
                                <button
                                    key={option}
                                    type="button"
                                    onClick={() => handleVisualTypeChange(option)}
                                    disabled={readOnly}
                                    className={`rounded-md border px-2 py-1.5 text-[11px] font-medium transition-colors ${currentVisualType === option
                                        ? 'border-shell-accent-border bg-shell-accent-soft text-shell-accent-text'
                                        : 'border-shell-border text-shell-muted-strong hover:border-shell-accent-border'
                                        }`}
                                >
                                    {option === 'avatar' ? 'Avatar' : option === 'icon' ? 'Icon' : 'None'}
                                </button>
                            ))}
                        </div>
                        <p className="text-[10px] text-shell-muted">Avatar auto-generates when no photo is provided.</p>
                    </div>

                    {currentVisualType === 'icon' && (
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-medium text-shell-muted-strong">Icon</label>
                            <select
                                className="w-full text-[13px] text-shell-text border border-shell-border rounded-lg p-2.5 bg-shell-bg focus:outline-none focus:border-shell-accent focus:ring-2 focus:ring-shell-accent/20"
                                value={(item.iconName as VcaIconName) || 'building'}
                                onChange={(e) => handleIconNameChange(e.target.value as VcaIconName)}
                                disabled={readOnly}
                            >
                                {ICON_OPTIONS.map((iconOption) => (
                                    <option key={iconOption} value={iconOption}>
                                        {iconOption}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
});

SelectionListItemRow.displayName = 'SelectionListItemRow';

// Mock Presets
const PRESETS = {
    users: [
        { id: '1', title: 'Sarah Jenkins', subtitle: 'sarah.j@example.com', visualType: 'avatar' as const },
        { id: '2', title: 'Michael Chen', subtitle: 'm.chen@example.com', visualType: 'avatar' as const },
        { id: '3', title: 'Emily Davis', subtitle: 'edavis@example.com', visualType: 'avatar' as const },
    ],
    accounts: [
        { id: 'a1', title: 'Acme Corp', subtitle: 'ID: 8839201', visualType: 'icon' as const, iconName: 'building' as const },
        { id: 'a2', title: 'Globex Inc', subtitle: 'ID: 4492011', visualType: 'icon' as const, iconName: 'building' as const },
        { id: 'a3', title: 'Soylent Corp', subtitle: 'ID: 1102934', visualType: 'icon' as const, iconName: 'building' as const },
    ],
    licenses: [
        { id: 'l1', title: 'Enterprise Seat 2024', subtitle: 'Expires Dec 31', visualType: 'none' as const },
        { id: 'l2', title: 'Pro Seat 2024', subtitle: 'Expires Nov 15', visualType: 'none' as const },
        { id: 'l3', title: 'Basic Seat', subtitle: 'Monthly', visualType: 'none' as const },
    ]
};

export function SelectionListEditor({
    component,
    onChange,
    children,
    isOpen,
    onOpenChange,
    readOnly = false,
}: SelectionListEditorProps) {
    const content = component.content as SelectionListContent;

    // Local state for better UX
    const [expandedItemId, setExpandedItemId] = useState<string | null>(null);

    const contentRef = useRef(content);
    const onChangeRef = useRef(onChange);
    const expandedItemIdRef = useRef(expandedItemId);
    useEffect(() => {
        contentRef.current = content;
    }, [content]);
    useEffect(() => {
        onChangeRef.current = onChange;
    }, [onChange]);
    useEffect(() => {
        expandedItemIdRef.current = expandedItemId;
    }, [expandedItemId]);

    const handleLayoutChange = useCallback((val: 'list' | 'grid' | 'carousel') => {
        if (readOnly) return;
        const current = contentRef.current;
        onChangeRef.current({ ...current, layout: val });
    }, [readOnly]);

    const applyPreset = useCallback((presetKey: keyof typeof PRESETS) => {
        if (readOnly) return;
        const current = contentRef.current;
        onChangeRef.current({
            ...current,
            items: PRESETS[presetKey].map(item => ({ ...item, id: Math.random().toString(36).substr(2, 9) }))
        });
    }, [readOnly]);

    const updateItem = useCallback((itemId: string, updates: Partial<SelectionListItem>) => {
        if (readOnly) return;
        const current = contentRef.current;
        const items = current.items || [];
        const index = items.findIndex(item => item.id === itemId);
        if (index === -1) return;

        const newItems = [...items];
        newItems[index] = { ...newItems[index], ...updates };
        onChangeRef.current({ ...current, items: newItems });
    }, [readOnly]);

    const deleteItem = useCallback((itemId: string) => {
        if (readOnly) return;
        const current = contentRef.current;
        const newItems = (current.items || []).filter(item => item.id !== itemId);
        if (expandedItemIdRef.current === itemId) {
            setExpandedItemId(null);
        }
        onChangeRef.current({ ...current, items: newItems });
    }, [readOnly]);

    const addItem = useCallback(() => {
        if (readOnly) return;
        const current = contentRef.current;
        const newItem: SelectionListItem = {
            id: Math.random().toString(36).substr(2, 9),
            title: 'New Item',
            subtitle: 'Description',
            visualType: 'none'
        };
        onChangeRef.current({ ...current, items: [...(current.items || []), newItem] });
        setExpandedItemId(newItem.id);
    }, [readOnly]);

    const handleToggleItem = useCallback((itemId: string) => {
        setExpandedItemId(prev => (prev === itemId ? null : itemId));
    }, []);

    const items = useMemo(() => content.items || [], [content.items]);
    const layoutOptions = [
        { id: 'list', icon: LayoutList, label: 'List' },
        { id: 'grid', icon: LayoutGrid, label: 'Grid' },
        { id: 'carousel', icon: GalleryHorizontal, label: 'Carousel' }
    ] as const;

    const editorContent = (
        <EditorRoot>
            <EditorHeader
                icon={LayoutList}
                title="Selection List"
                onClose={() => onOpenChange(false)}
            />

            <EditorContent>


                {/* 2. Layout & Presets */}
                <EditorSection>
                    <div className="grid grid-cols-3 gap-2">
                        {layoutOptions.map(opt => (
                            <button
                                key={opt.id}
                                onClick={() => handleLayoutChange(opt.id)}
                                disabled={readOnly}
                                className={`flex items-center justify-center gap-2 p-1.5 rounded-lg border transition-all ${content.layout === opt.id
                                    ? 'bg-shell-accent-soft border-shell-accent-border text-shell-accent-text'
                                    : 'bg-shell-bg border-shell-border text-shell-muted-strong hover:border-shell-accent-border'
                                    }`}
                            >
                                <opt.icon className="w-4 h-4" />
                                <span className="text-[10px] font-medium">{opt.label}</span>
                            </button>
                        ))}
                    </div>
                </EditorSection>

                {/* 3. Items List */}
                <EditorSection
                    title={`Items (${items.length})`}
                    action={
                        <div className="relative group">
                            <button className="flex items-center gap-1.5 text-xs text-shell-accent hover:text-shell-accent-hover font-medium transition-colors">
                                <Wand2 className="w-3.5 h-3.5" />
                                <span>Load Preset</span>
                            </button>
                            <div className="absolute right-0 top-full mt-1 w-48 bg-shell-surface rounded-lg shadow-xl border border-shell-border py-1 hidden group-hover:block z-50">
                                <button onClick={() => applyPreset('users')} className="w-full text-left px-3 py-2 text-xs hover:bg-shell-surface-subtle text-shell-muted-strong">
                                    Users (Avatars)
                                </button>
                                <button onClick={() => applyPreset('accounts')} className="w-full text-left px-3 py-2 text-xs hover:bg-shell-surface-subtle text-shell-muted-strong">
                                    Accounts (Icons)
                                </button>
                                <button onClick={() => applyPreset('licenses')} className="w-full text-left px-3 py-2 text-xs hover:bg-shell-surface-subtle text-shell-muted-strong">
                                    Simple (Text only)
                                </button>
                            </div>
                        </div>
                    }
                >
                    <div className="space-y-2">
                        {items.map((item) => (
                            <SelectionListItemRow
                                key={item.id}
                                item={item}
                                isExpanded={expandedItemId === item.id}
                                readOnly={readOnly}
                                onToggle={handleToggleItem}
                                onUpdate={updateItem}
                                onDelete={deleteItem}
                            />
                        ))}
                    </div>

                    <button
                        onClick={addItem}
                        disabled={readOnly}
                        className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-lg border border-dashed border-shell-border text-shell-muted text-xs font-medium hover:border-shell-accent-border hover:text-shell-accent hover:bg-shell-accent-soft transition-all"
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
            readOnly={readOnly}
        >
            {children}
        </ComponentEditorPopover>
    );
}
