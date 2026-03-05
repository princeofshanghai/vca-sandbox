import { useEffect, useMemo, useState } from 'react';
import { User } from 'lucide-react';
import { VcaIconName } from '@/components/vca-components/icons';
import { Component, ConfirmationCardContent } from '../../studio/types';
import { ComponentEditorPopover } from './ComponentEditorPopover';
import { EditorRoot } from './editor-ui/EditorRoot';
import { EditorHeader } from './editor-ui/EditorHeader';
import { EditorContent } from './editor-ui/EditorContent';
import { EditorSection } from './editor-ui/EditorSection';
import { EditorField } from './editor-ui/EditorField';

interface ConfirmationCardEditorProps {
    component: Component;
    onChange: (updates: Partial<ConfirmationCardContent>) => void;
    children: React.ReactNode;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    readOnly?: boolean;
}

const ICON_OPTIONS: VcaIconName[] = ['user', 'building', 'document', 'messages'];

type VisualType = 'avatar' | 'icon' | 'none';

const resolveVisualType = (content: ConfirmationCardContent): VisualType => {
    if (content.item?.imageUrl) return 'avatar';
    if (content.item?.visualType) return content.item.visualType;
    if (content.item?.iconName) return 'icon';
    return 'none';
};

export function ConfirmationCardEditor({
    component,
    onChange,
    children,
    isOpen,
    onOpenChange,
    readOnly = false,
}: ConfirmationCardEditorProps) {
    const content = component.content as ConfirmationCardContent;
    const safeItem = content.item || { id: 'candidate-1', title: '', visualType: 'avatar' as const };
    const currentVisualType = useMemo(() => resolveVisualType(content), [content]);

    const [localTitle, setLocalTitle] = useState(safeItem.title || '');
    const [localSubtitle, setLocalSubtitle] = useState(safeItem.subtitle || '');
    const [localImageUrl, setLocalImageUrl] = useState(safeItem.imageUrl || '');
    const [localConfirmLabel, setLocalConfirmLabel] = useState(content.confirmLabel || 'Yes, confirm');
    const [localRejectLabel, setLocalRejectLabel] = useState(content.rejectLabel || 'No, not this person');

    useEffect(() => {
        setLocalTitle(safeItem.title || '');
        setLocalSubtitle(safeItem.subtitle || '');
        setLocalImageUrl(safeItem.imageUrl || '');
        setLocalConfirmLabel(content.confirmLabel || 'Yes, confirm');
        setLocalRejectLabel(content.rejectLabel || 'No, not this person');
    }, [
        component.id,
        safeItem.title,
        safeItem.subtitle,
        safeItem.imageUrl,
        content.confirmLabel,
        content.rejectLabel
    ]);

    const updateItem = (updates: Partial<ConfirmationCardContent['item']>) => {
        if (readOnly) return;
        onChange({
            ...content,
            item: {
                ...safeItem,
                ...updates,
                id: safeItem.id || 'candidate-1'
            }
        });
    };

    const handleVisualTypeChange = (visualType: VisualType) => {
        if (readOnly) return;
        if (visualType === 'avatar') {
            updateItem({
                visualType: 'avatar',
                iconName: undefined
            });
            return;
        }

        if (visualType === 'icon') {
            updateItem({
                visualType: 'icon',
                imageUrl: undefined,
                iconName: (safeItem.iconName as VcaIconName) || 'user'
            });
            setLocalImageUrl('');
            return;
        }

        updateItem({
            visualType: 'none',
            imageUrl: undefined,
            iconName: undefined
        });
        setLocalImageUrl('');
    };

    const editorContent = (
        <EditorRoot>
            <EditorHeader
                icon={User}
                title="Confirmation Card"
                onClose={() => onOpenChange(false)}
            />
            <EditorContent>
                <EditorSection title="Candidate">
                    <EditorField
                        label="Name"
                        value={localTitle}
                        onChange={(value) => {
                            if (readOnly) return;
                            setLocalTitle(value);
                            updateItem({ title: value });
                        }}
                        placeholder="Sarah Jenkins"
                        readOnly={readOnly}
                    />
                    <EditorField
                        label="Subtitle"
                        value={localSubtitle}
                        onChange={(value) => {
                            if (readOnly) return;
                            setLocalSubtitle(value);
                            updateItem({ subtitle: value });
                        }}
                        placeholder="sarah.j@example.com"
                        readOnly={readOnly}
                    />

                    <EditorField label="Visual" renderInput={false}>
                        <div className="grid grid-cols-3 gap-1.5">
                            {(['avatar', 'icon', 'none'] as VisualType[]).map((option) => (
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
                    </EditorField>

                    {currentVisualType === 'avatar' && (
                        <EditorField
                            label="Avatar URL (Optional)"
                            value={localImageUrl}
                            onChange={(value) => {
                                if (readOnly) return;
                                setLocalImageUrl(value);
                                updateItem({ imageUrl: value || undefined, visualType: 'avatar' });
                            }}
                            placeholder="https://..."
                            readOnly={readOnly}
                        />
                    )}

                    {currentVisualType === 'icon' && (
                        <EditorField label="Icon" renderInput={false}>
                            <select
                                className="w-full rounded-lg border border-shell-border bg-shell-bg p-2.5 text-[13px] text-shell-text focus:border-shell-accent focus:outline-none focus:ring-2 focus:ring-shell-accent/20"
                                value={(safeItem.iconName as VcaIconName) || 'user'}
                                onChange={(e) => {
                                    if (readOnly) return;
                                    updateItem({
                                        iconName: e.target.value as VcaIconName,
                                        visualType: 'icon'
                                    });
                                }}
                                disabled={readOnly}
                            >
                                {ICON_OPTIONS.map((iconOption) => (
                                    <option key={iconOption} value={iconOption}>
                                        {iconOption}
                                    </option>
                                ))}
                            </select>
                        </EditorField>
                    )}
                </EditorSection>

                <EditorSection title="Actions">
                    <EditorField
                        label="Confirm Button"
                        value={localConfirmLabel}
                        onChange={(value) => {
                            if (readOnly) return;
                            setLocalConfirmLabel(value);
                            onChange({ ...content, confirmLabel: value });
                        }}
                        placeholder="Yes, confirm"
                        readOnly={readOnly}
                    />
                    <EditorField
                        label="Reject Button"
                        value={localRejectLabel}
                        onChange={(value) => {
                            if (readOnly) return;
                            setLocalRejectLabel(value);
                            onChange({ ...content, rejectLabel: value });
                        }}
                        placeholder="No, not this person"
                        hint="Each button can connect to a different next step in the flow."
                        readOnly={readOnly}
                    />
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
