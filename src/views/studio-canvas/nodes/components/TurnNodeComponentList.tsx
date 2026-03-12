import { memo, useCallback, useEffect, useMemo, useState, type MouseEvent } from 'react';
import { useUpdateNodeInternals } from '@xyflow/react';
import {
    closestCenter,
    DndContext,
    DragEndEvent,
    KeyboardSensor,
    PointerSensor as DndPointerSensor,
    useSensor,
    useSensors
} from '@dnd-kit/core';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Component } from '../../../studio/types';
import { SimpleComponentCard } from './SimpleComponentCard';
import { getComponentDisplay } from '../utils/turnNodeUtils';
import { MessageEditor } from '../../components/MessageEditor';
import { PromptEditor } from '../../components/PromptEditor';
import { InfoMessageEditor } from '../../components/InfoMessageEditor';
import { StatusCardEditor } from '../../components/StatusCardEditor';
import { SelectionListEditor } from '../../components/SelectionListEditor';
import { ConfirmationCardEditor } from '../../components/ConfirmationCardEditor';
import { CheckboxGroupEditor } from '../../components/CheckboxGroupEditor';

const HANDLE_SYNC_WINDOW_MS = 280;

const isNonDraggableTarget = (target: HTMLElement | null): boolean => {
    if (!target) return false;
    return Boolean(
        target.closest('input, textarea, button, select, [contenteditable="true"], .react-flow__handle, [data-no-dnd="true"]')
    );
};

class CardPointerSensor extends DndPointerSensor {
    static activators = [
        {
            eventName: 'onPointerDown' as const,
            handler: ({ nativeEvent }: React.PointerEvent) => {
                if (!nativeEvent.isPrimary || nativeEvent.button !== 0) {
                    return false;
                }

                return !isNonDraggableTarget(nativeEvent.target as HTMLElement);
            },
        },
    ];
}

interface TurnNodeComponentListProps {
    nodeId: string;
    components: Component[];
    selectedComponentIds?: string[];
    openComponentId?: string;
    isAiTurn?: boolean;
    readOnly?: boolean;
    surfaceClassName?: string;
    onSelectComponent?: (
        nodeId: string,
        componentId: string,
        anchorEl: HTMLElement,
        options?: { appendToSelection?: boolean }
    ) => void;
    onDeselect?: () => void;
    onComponentUpdate?: (nodeId: string, componentId: string, updates: Partial<Component>) => void;
    onComponentReorder?: (nodeId: string, activeComponentId: string, overComponentId: string) => void;
}

interface ComponentRowProps {
    nodeId: string;
    component: Component;
    isSelected: boolean;
    isOpen: boolean;
    readOnly?: boolean;
    onSelectComponent?: (
        nodeId: string,
        componentId: string,
        anchorEl: HTMLElement,
        options?: { appendToSelection?: boolean }
    ) => void;
    onDeselect?: () => void;
    onComponentUpdate?: (nodeId: string, componentId: string, updates: Partial<Component>) => void;
    lastDragAt: number;
}

const ComponentRow = memo(({
    nodeId,
    component,
    isSelected,
    isOpen,
    readOnly = false,
    onSelectComponent,
    onDeselect,
    onComponentUpdate,
    lastDragAt,
}: ComponentRowProps) => {
    const display = useMemo(() => getComponentDisplay(component), [component]);

    const handleClick = useCallback((event: MouseEvent<HTMLDivElement>) => {
        // Ignore click right after dragging so we don't accidentally open the editor popover.
        if (Date.now() - lastDragAt < 180) {
            return;
        }
        onSelectComponent?.(
            nodeId,
            component.id,
            event.currentTarget as HTMLElement,
            { appendToSelection: event.shiftKey }
        );
    }, [component.id, lastDragAt, nodeId, onSelectComponent]);

    const handleOpenChange = useCallback((open: boolean) => {
        if (!open && isOpen) {
            onDeselect?.();
        }
    }, [isOpen, onDeselect]);

    const handleComponentChange = useCallback((updates: Record<string, unknown>) => {
        if (readOnly) return;
        onComponentUpdate?.(nodeId, component.id, { content: { ...component.content, ...updates } });
    }, [component, nodeId, onComponentUpdate, readOnly]);

    const card = (
        <SimpleComponentCard
            component={component}
            display={display}
            isSelected={isSelected}
            readOnly={readOnly}
            onClick={handleClick}
        />
    );

    if (component.type === 'message') {
        return (
            <MessageEditor
                component={component}
                onChange={handleComponentChange}
                isOpen={isOpen}
                onOpenChange={handleOpenChange}
                readOnly={readOnly}
            >
                {card}
            </MessageEditor>
        );
    }

    if (component.type === 'prompt') {
        return (
            <PromptEditor
                component={component}
                onChange={handleComponentChange}
                isOpen={isOpen}
                onOpenChange={handleOpenChange}
                readOnly={readOnly}
            >
                {card}
            </PromptEditor>
        );
    }

    if (component.type === 'infoMessage') {
        return (
            <InfoMessageEditor
                component={component}
                onChange={handleComponentChange}
                isOpen={isOpen}
                onOpenChange={handleOpenChange}
                readOnly={readOnly}
            >
                {card}
            </InfoMessageEditor>
        );
    }

    if (component.type === 'statusCard') {
        return (
            <StatusCardEditor
                component={component}
                onChange={handleComponentChange}
                isOpen={isOpen}
                onOpenChange={handleOpenChange}
                readOnly={readOnly}
            >
                {card}
            </StatusCardEditor>
        );
    }

    if (component.type === 'selectionList') {
        return (
            <SelectionListEditor
                component={component}
                onChange={handleComponentChange}
                isOpen={isOpen}
                onOpenChange={handleOpenChange}
                readOnly={readOnly}
            >
                {card}
            </SelectionListEditor>
        );
    }

    if (component.type === 'confirmationCard') {
        return (
            <ConfirmationCardEditor
                component={component}
                onChange={handleComponentChange}
                isOpen={isOpen}
                onOpenChange={handleOpenChange}
                readOnly={readOnly}
            >
                {card}
            </ConfirmationCardEditor>
        );
    }

    if (component.type === 'checkboxGroup') {
        return (
            <CheckboxGroupEditor
                component={component}
                onChange={handleComponentChange}
                isOpen={isOpen}
                onOpenChange={handleOpenChange}
                readOnly={readOnly}
            >
                {card}
            </CheckboxGroupEditor>
        );
    }

    return card;
});

ComponentRow.displayName = 'ComponentRow';

interface SortableComponentRowProps {
    componentId: string;
    disabled?: boolean;
    children: React.ReactNode;
}

const SortableComponentRow = memo(({ componentId, disabled = false, children }: SortableComponentRowProps) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: componentId,
        disabled,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 40 : undefined,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`nodrag nopan ${isDragging ? 'opacity-95 scale-[1.01]' : ''}`}
            {...attributes}
            {...listeners}
        >
            {children}
        </div>
    );
});

SortableComponentRow.displayName = 'SortableComponentRow';

export const TurnNodeComponentList = ({
    nodeId,
    components,
    selectedComponentIds = [],
    openComponentId,
    isAiTurn = false,
    readOnly = false,
    surfaceClassName = 'bg-shell-bg',
    onSelectComponent,
    onDeselect,
    onComponentUpdate,
    onComponentReorder,
}: TurnNodeComponentListProps) => {
    const [lastDragAt, setLastDragAt] = useState(0);
    const canReorder = !readOnly && components.length > 1;
    const showEmptyStateText = isAiTurn && components.length === 0;
    const isEmptyState = showEmptyStateText;
    const updateNodeInternals = useUpdateNodeInternals();

    const sensors = useSensors(
        useSensor(CardPointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const componentIds = useMemo(() => components.map((component) => component.id), [components]);
    const componentLayoutKey = useMemo(() => componentIds.join('|'), [componentIds]);

    // Component reorder animates card rows with transforms, so refresh handle geometry
    // during animation to keep connector start points pinned to the dots.
    useEffect(() => {
        const start = performance.now();
        let frameId = 0;

        const syncHandles = () => {
            updateNodeInternals(nodeId);
            if (performance.now() - start < HANDLE_SYNC_WINDOW_MS) {
                frameId = requestAnimationFrame(syncHandles);
            }
        };

        frameId = requestAnimationFrame(syncHandles);
        return () => {
            cancelAnimationFrame(frameId);
        };
    }, [componentLayoutKey, nodeId, updateNodeInternals]);

    const handleDragEnd = useCallback((event: DragEndEvent) => {
        if (readOnly) return;
        setLastDragAt(Date.now());

        const { active, over } = event;
        if (!over || active.id === over.id) return;

        onComponentReorder?.(nodeId, String(active.id), String(over.id));
    }, [nodeId, onComponentReorder, readOnly]);

    const handleDragStart = useCallback(() => {
        setLastDragAt(Date.now());
    }, []);

    const handleDragCancel = useCallback(() => {
        setLastDragAt(Date.now());
    }, []);

    if (isEmptyState) {
        return (
            <div className={`w-full rounded-lg overflow-visible ${surfaceClassName}`}>
                <div className="pointer-events-none select-none px-4 py-3 text-sm text-shell-muted">
                    No components yet
                </div>
            </div>
        );
    }

    return (
        <div className={`px-7 py-9 ${surfaceClassName} rounded-lg overflow-visible`}>
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={readOnly ? undefined : handleDragStart}
                onDragCancel={readOnly ? undefined : handleDragCancel}
                onDragEnd={readOnly ? undefined : handleDragEnd}
            >
                <SortableContext items={componentIds} strategy={verticalListSortingStrategy}>
                    <div className="flex flex-col gap-5">
                        {components.map((component: Component) => (
                            <SortableComponentRow
                                key={component.id}
                                componentId={component.id}
                                disabled={!canReorder}
                            >
                                <ComponentRow
                                    nodeId={nodeId}
                                    component={component}
                                    isSelected={selectedComponentIds.includes(component.id)}
                                    isOpen={openComponentId === component.id}
                                    readOnly={readOnly}
                                    onSelectComponent={onSelectComponent}
                                    onDeselect={onDeselect}
                                    onComponentUpdate={onComponentUpdate}
                                    lastDragAt={lastDragAt}
                                />
                            </SortableComponentRow>
                        ))}
                    </div>
                </SortableContext>
            </DndContext>
        </div>
    );
};
