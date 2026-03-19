import { useEffect, useMemo, useState } from 'react';
import { IdCard } from 'lucide-react';
import { Component, ConfirmationCardContent } from '../../studio/types';
import { ComponentEditorPopover } from './ComponentEditorPopover';
import { EditorRoot } from './editor-ui/EditorRoot';
import { EditorHeader } from './editor-ui/EditorHeader';
import { EditorContent } from './editor-ui/EditorContent';
import { EditorSection } from './editor-ui/EditorSection';
import { EditorActionMenu } from './editor-ui/EditorActionMenu';
import { EditorField } from './editor-ui/EditorField';
import { EditorFieldRow } from './editor-ui/EditorFieldRow';
import { EditorLeadingVisualField } from './editor-ui/EditorLeadingVisualField';
import { EditorSegmentedControl } from './editor-ui/EditorSegmentedControl';
import { buildDisplayCardAutofillItem } from './editor-ui/editorAutofillPresets';

interface ConfirmationCardEditorProps {
    component: Component;
    onChange: (updates: Partial<ConfirmationCardContent>) => void;
    onDelete?: () => void;
    children: React.ReactNode;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    readOnly?: boolean;
}

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
    onDelete,
    children,
    isOpen,
    onOpenChange,
    readOnly = false,
}: ConfirmationCardEditorProps) {
    const content = component.content as ConfirmationCardContent;
    const safeItem = content.item || { id: 'item-1', title: '', visualType: 'none' as const };
    const currentVisualType = useMemo(() => resolveVisualType(content), [content]);
    const currentActionMode: 'display' | 'actions' = content.showActions === false ? 'display' : 'actions';

    const [localTitle, setLocalTitle] = useState(safeItem.title || '');
    const [localSubtitle, setLocalSubtitle] = useState(safeItem.subtitle || '');
    const [localActionMode, setLocalActionMode] = useState<'display' | 'actions'>(currentActionMode);
    const [localConfirmLabel, setLocalConfirmLabel] = useState(content.confirmLabel || 'Confirm');
    const [localRejectLabel, setLocalRejectLabel] = useState(content.rejectLabel || 'Cancel');

    useEffect(() => {
        setLocalTitle(safeItem.title || '');
        setLocalSubtitle(safeItem.subtitle || '');
        setLocalActionMode(content.showActions === false ? 'display' : 'actions');
        setLocalConfirmLabel(content.confirmLabel || 'Confirm');
        setLocalRejectLabel(content.rejectLabel || 'Cancel');
    }, [
        component.id,
        safeItem.title,
        safeItem.subtitle,
        content.showActions,
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
                id: safeItem.id || 'item-1'
            }
        });
    };

    const cardDetailsAction = (
        <EditorActionMenu
            label="Autofill"
            disabled={readOnly}
            items={[
                { label: 'Users', onSelect: () => updateItem(buildDisplayCardAutofillItem('users')) },
                { label: 'Accounts', onSelect: () => updateItem(buildDisplayCardAutofillItem('accounts')) },
                { label: 'Invoices', onSelect: () => updateItem(buildDisplayCardAutofillItem('invoices')) },
            ]}
        />
    );

    const editorContent = (
        <EditorRoot>
            <EditorHeader
                icon={IdCard}
                title="Display Card"
                onClose={() => onOpenChange(false)}
                onDelete={onDelete}
                deleteLabel="Remove display card from turn"
                deleteDisabled={readOnly}
            />
            <EditorContent>
                <EditorSection title="Card details" action={cardDetailsAction}>
                    <div className="grid grid-cols-[40px_minmax(0,1fr)] gap-x-2.5 gap-y-3">
                        <EditorLeadingVisualField
                            value={{
                                visualType: currentVisualType,
                                imageUrl: safeItem.imageUrl,
                                iconName: safeItem.iconName,
                            }}
                            onChange={(nextValue) => {
                                if (readOnly) return;
                                updateItem(nextValue);
                            }}
                            readOnly={readOnly}
                            seed={safeItem.id || safeItem.title || 'item'}
                            ariaLabel="Choose card visual"
                        />
                        <EditorField
                            label="Card label"
                            value={localTitle}
                            onChange={(value) => {
                                if (readOnly) return;
                                setLocalTitle(value);
                                updateItem({ title: value });
                            }}
                            placeholder="Sarah Jenkins"
                            readOnly={readOnly}
                            className="min-w-0"
                        />
                        <EditorField
                            label="Caption"
                            value={localSubtitle}
                            onChange={(value) => {
                                if (readOnly) return;
                                setLocalSubtitle(value);
                                updateItem({ subtitle: value });
                            }}
                            placeholder="sjenkins@flexis.com"
                            readOnly={readOnly}
                            className="col-start-2 min-w-0"
                        />
                    </div>
                </EditorSection>

                <EditorSection title="Actions">
                    <EditorSegmentedControl
                        value={localActionMode}
                        onChange={(nextValue) => {
                            if (readOnly) return;
                            setLocalActionMode(nextValue);
                            onChange({ ...content, showActions: nextValue === 'actions' });
                        }}
                        options={[
                            { value: 'display', label: 'No actions' },
                            { value: 'actions', label: 'With actions' },
                        ]}
                        readOnly={readOnly}
                        size="default"
                    />
                    {localActionMode === 'actions' && (
                        <EditorFieldRow>
                            <EditorField
                                label="Primary CTA"
                                value={localConfirmLabel}
                                onChange={(value) => {
                                    if (readOnly) return;
                                    setLocalConfirmLabel(value);
                                    onChange({ ...content, confirmLabel: value, showActions: true });
                                }}
                                placeholder="Confirm"
                                readOnly={readOnly}
                            />
                            <EditorField
                                label="Secondary CTA"
                                value={localRejectLabel}
                                onChange={(value) => {
                                    if (readOnly) return;
                                    setLocalRejectLabel(value);
                                    onChange({ ...content, rejectLabel: value, showActions: true });
                                }}
                                placeholder="Cancel"
                                readOnly={readOnly}
                            />
                        </EditorFieldRow>
                    )}
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
