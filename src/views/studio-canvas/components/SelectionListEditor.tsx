import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { X, ChevronDown, LayoutList, LayoutGrid, GalleryHorizontal } from 'lucide-react';
import { ShellIconButton } from '@/components/shell';
import { Avatar, getAvatarFallbackTone } from '@/components/vca-components/avatar';
import { VcaIcon, VcaIconName } from '@/components/vca-components/icons';
import { cn } from '@/utils/cn';
import { Component, SelectionListContent } from '../../studio/types';
import { ComponentEditorPopover } from './ComponentEditorPopover';

import { EditorActionMenu } from './editor-ui/EditorActionMenu';
import { EditorAddButton } from './editor-ui/EditorAddButton';
import { EditorRoot } from './editor-ui/EditorRoot';
import { EditorHeader } from './editor-ui/EditorHeader';
import { EditorContent } from './editor-ui/EditorContent';
import { EditorSection } from './editor-ui/EditorSection';
import { EditorField } from './editor-ui/EditorField';
import { EditorLeadingVisualField } from './editor-ui/EditorLeadingVisualField';
import { EditorSegmentedControl } from './editor-ui/EditorSegmentedControl';
import { buildSelectionListAutofillItems } from './editor-ui/editorAutofillPresets';

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

    const handleLeadingVisualChange = useCallback((updates: {
        visualType: ItemVisualType;
        imageUrl?: string;
        iconName?: VcaIconName;
    }) => {
        if (readOnly) return;
        onUpdate(item.id, updates);
    }, [item.id, onUpdate, readOnly]);

    const currentVisualType = getResolvedVisualType(item);
    const fallbackTone = getAvatarFallbackTone(item.id || item.title || 'item');

    return (
        <div className="group border border-shell-border rounded-lg bg-shell-bg overflow-hidden transition-all hover:border-shell-accent-border">
            {/* Card Header / Summary */}
            <div
                className="flex items-center gap-3 p-2 cursor-pointer bg-shell-surface-subtle hover:bg-shell-surface transition-colors"
                onClick={handleToggle}
            >
                <div className="text-shell-muted">
                    <ChevronDown
                        className={cn(
                            "w-4 h-4 transition-transform duration-200",
                            isExpanded && "rotate-180"
                        )}
                    />
                </div>
                <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                    {currentVisualType === 'avatar' && (
                        <Avatar
                            size={24}
                            src={item.imageUrl}
                            alt={item.title ? `${item.title} avatar` : 'Card avatar'}
                            fallbackStyle="silhouette"
                            fallbackTone={fallbackTone}
                        />
                    )}
                    {currentVisualType === 'icon' && (
                        <div className="w-6 h-6 rounded-md bg-shell-surface border border-shell-border-subtle flex items-center justify-center text-shell-muted">
                            <VcaIcon icon={(item.iconName as VcaIconName) || 'placeholder'} size="sm" />
                        </div>
                    )}
                    {currentVisualType === 'none' && (
                        <div className="w-6 h-6 rounded-md border border-dashed border-shell-border" />
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-shell-text truncate">
                        {item.title || 'Card label'}
                    </div>
                    <div className="text-[10px] text-shell-muted truncate">
                        {item.subtitle}
                    </div>
                </div>
                <ShellIconButton
                    onClick={handleDelete}
                    disabled={readOnly}
                    type="button"
                    size="sm"
                    aria-label={`Delete ${item.title || 'card'}`}
                    className="opacity-0 transition-opacity group-hover:opacity-100"
                >
                    <X className="w-3.5 h-3.5" />
                </ShellIconButton>
            </div>

            {/* Expanded Editor */}
            {isExpanded && (
                <div className="space-y-4 border-t border-shell-border-subtle bg-shell-bg p-4 animate-in fade-in slide-in-from-top-1">
                    <div className="grid grid-cols-[40px_minmax(0,1fr)] gap-x-2.5 gap-y-3">
                        <EditorLeadingVisualField
                            value={{
                                visualType: currentVisualType,
                                imageUrl: item.imageUrl,
                                iconName: item.iconName,
                            }}
                            onChange={handleLeadingVisualChange}
                            readOnly={readOnly}
                            seed={item.id || item.title || 'item'}
                            ariaLabel={`Choose visual for ${item.title || 'card'}`}
                        />
                        <EditorField
                            label="Card label"
                            value={item.title}
                            onChange={handleTitleChange}
                            placeholder="Sarah Jenkins"
                            readOnly={readOnly}
                            className="min-w-0"
                        />
                        <EditorField
                            label="Caption"
                            value={item.subtitle || ''}
                            onChange={handleSubtitleChange}
                            placeholder="sjenkins@flexis.com"
                            readOnly={readOnly}
                            className="col-start-2 min-w-0"
                        />
                    </div>
                </div>
            )}
        </div>
    );
});

SelectionListItemRow.displayName = 'SelectionListItemRow';

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

    const applyPreset = useCallback((presetKey: 'users' | 'accounts' | 'invoices') => {
        if (readOnly) return;
        const current = contentRef.current;
        onChangeRef.current({
            ...current,
            items: buildSelectionListAutofillItems(presetKey)
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
            title: '',
            subtitle: '',
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
                title="Select Cards"
                onClose={() => onOpenChange(false)}
            />

            <EditorContent>


                {/* 2. Layout & Presets */}
                <EditorSection title="Layout">
                    <EditorSegmentedControl
                        value={content.layout}
                        onChange={handleLayoutChange}
                        options={layoutOptions.map((option) => ({
                            value: option.id,
                            label: option.label,
                            icon: option.icon,
                        }))}
                        readOnly={readOnly}
                        size="default"
                    />
                </EditorSection>

                {/* 3. Cards List */}
                <EditorSection
                    title="Cards"
                    action={
                        <EditorActionMenu
                            label="Autofill"
                            disabled={readOnly}
                            items={[
                                { label: 'Users', onSelect: () => applyPreset('users') },
                                { label: 'Accounts', onSelect: () => applyPreset('accounts') },
                                { label: 'Invoices', onSelect: () => applyPreset('invoices') },
                            ]}
                        />
                    }
                >
                    {items.length === 0 ? (
                        <div className="rounded-lg border border-dashed border-shell-border px-3 py-4 text-center text-xs text-shell-muted">
                            No cards yet. Add cards people can pick from.
                        </div>
                    ) : (
                        <div className="space-y-3">
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
                    )}

                    <EditorAddButton onClick={addItem} disabled={readOnly}>
                        Add card
                    </EditorAddButton>
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
