import { memo, useCallback, useEffect, useMemo, useState } from 'react';
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
    selectedComponentId?: string;
    entryPoint?: string;
    surfaceClassName?: string;
    onSelectComponent?: (nodeId: string, componentId: string, anchorEl: HTMLElement) => void;
    onDeselect?: () => void;
    onComponentUpdate?: (nodeId: string, componentId: string, updates: Partial<Component>) => void;
    onComponentReorder?: (nodeId: string, activeComponentId: string, overComponentId: string) => void;
}

interface ComponentRowProps {
    nodeId: string;
    component: Component;
    isSelected: boolean;
    entryPoint?: string;
    onSelectComponent?: (nodeId: string, componentId: string, anchorEl: HTMLElement) => void;
    onDeselect?: () => void;
    onComponentUpdate?: (nodeId: string, componentId: string, updates: Partial<Component>) => void;
    lastDragAt: number;
}

const ComponentRow = memo(({
    nodeId,
    component,
    isSelected,
    entryPoint,
    onSelectComponent,
    onDeselect,
    onComponentUpdate,
    lastDragAt,
}: ComponentRowProps) => {
    const display = useMemo(() => getComponentDisplay(component), [component]);

    const handleClick = useCallback(() => {
        // Ignore click right after dragging so we don't accidentally open the editor popover.
        if (Date.now() - lastDragAt < 180) {
            return;
        }
        const el = document.getElementById(`component-${component.id}`);
        onSelectComponent?.(nodeId, component.id, el || document.body);
    }, [component.id, lastDragAt, nodeId, onSelectComponent]);

    const handleOpenChange = useCallback((open: boolean) => {
        if (!open && isSelected) {
            onDeselect?.();
        }
    }, [isSelected, onDeselect]);

    const handleComponentChange = useCallback((updates: Record<string, unknown>) => {
        onComponentUpdate?.(nodeId, component.id, { content: { ...component.content, ...updates } });
    }, [component, nodeId, onComponentUpdate]);

    const card = (
        <SimpleComponentCard
            component={component}
            display={display}
            isSelected={isSelected}
            onClick={handleClick}
        />
    );

    if (component.type === 'message') {
        return (
            <MessageEditor
                component={component}
                onChange={handleComponentChange}
                isOpen={isSelected}
                onOpenChange={handleOpenChange}
            >
                {card}
            </MessageEditor>
        );
    }

    if (component.type === 'prompt') {
        return (
            <PromptEditor
                component={component}
                entryPoint={entryPoint}
                onChange={handleComponentChange}
                isOpen={isSelected}
                onOpenChange={handleOpenChange}
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
                isOpen={isSelected}
                onOpenChange={handleOpenChange}
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
                isOpen={isSelected}
                onOpenChange={handleOpenChange}
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
                isOpen={isSelected}
                onOpenChange={handleOpenChange}
            >
                {card}
            </SelectionListEditor>
        );
    }

    if (component.type === 'checkboxGroup') {
        return (
            <CheckboxGroupEditor
                component={component}
                onChange={handleComponentChange}
                isOpen={isSelected}
                onOpenChange={handleOpenChange}
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
    selectedComponentId,
    entryPoint,
    surfaceClassName = 'bg-shell-bg',
    onSelectComponent,
    onDeselect,
    onComponentUpdate,
    onComponentReorder
}: TurnNodeComponentListProps) => {
    const [lastDragAt, setLastDragAt] = useState(0);
    const canReorder = components.length > 1;
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
        setLastDragAt(Date.now());

        const { active, over } = event;
        if (!over || active.id === over.id) return;

        onComponentReorder?.(nodeId, String(active.id), String(over.id));
    }, [nodeId, onComponentReorder]);

    const handleDragStart = useCallback(() => {
        setLastDragAt(Date.now());
    }, []);

    const handleDragCancel = useCallback(() => {
        setLastDragAt(Date.now());
    }, []);

    return (
        <div className={`px-5 pb-5 pt-5 space-y-3 ${surfaceClassName} rounded-lg overflow-visible`}>
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragCancel={handleDragCancel}
                onDragEnd={handleDragEnd}
            >
                <SortableContext items={componentIds} strategy={verticalListSortingStrategy}>
                    <div className="flex flex-col gap-3">
                        {components.map((component: Component) => (
                            <SortableComponentRow
                                key={component.id}
                                componentId={component.id}
                                disabled={!canReorder}
                            >
                                <ComponentRow
                                    nodeId={nodeId}
                                    component={component}
                                    isSelected={selectedComponentId === component.id}
                                    entryPoint={entryPoint}
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
