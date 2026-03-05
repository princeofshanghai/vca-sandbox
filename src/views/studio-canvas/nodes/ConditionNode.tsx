import { memo, useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Handle, Position, NodeProps, useStore, useUpdateNodeInternals } from '@xyflow/react';
import {
    closestCenter,
    DndContext,
    DragEndEvent,
    PointerSensor as DndPointerSensor,
    useSensor,
    useSensors
} from '@dnd-kit/core';
import {
    SortableContext,
    useSortable,
    verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Split } from 'lucide-react';
import { ConditionBranchEditor } from '../components/ConditionBranchEditor';
import { BranchCard } from './components/BranchCard';
import { Branch } from '../../studio/types';

const HANDLE_SYNC_WINDOW_MS = 280;

interface ConditionNodeData {
    label: string;
    branches?: Branch[];
    selectedBranchId?: string;
    readOnly?: boolean;
    onLabelChange?: (nodeId: string, newLabel: string) => void;
    onUpdateBranches?: (nodeId: string, branches: Branch[]) => void;
    onSelectBranch?: (nodeId: string, branchId: string, anchorEl: HTMLElement) => void;
    onDeselect?: () => void;
}

const isNonDraggableTarget = (target: HTMLElement | null): boolean => {
    if (!target) return false;
    return Boolean(
        target.closest('input, textarea, button, select, [contenteditable="true"], .react-flow__handle, [data-no-dnd="true"]')
    );
};

class BranchPointerSensor extends DndPointerSensor {
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

interface SortableBranchRowProps {
    branchId: string;
    disabled?: boolean;
    children: React.ReactNode;
}

const SortableBranchRow = memo(({ branchId, disabled = false, children }: SortableBranchRowProps) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: branchId,
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

SortableBranchRow.displayName = 'SortableBranchRow';

export const ConditionNode = memo(({ id, data, selected }: NodeProps) => {
    const nodeId = String(id);
    const typedData = data as unknown as ConditionNodeData;
    const fallbackBranches = useMemo<Branch[]>(() => ([
        { id: 'yes', condition: 'Yes' },
        { id: 'no', condition: 'No' }
    ]), []);
    const branches = typedData.branches || fallbackBranches;

    // Label editing state
    const [isEditingLabel, setIsEditingLabel] = useState(false);
    const [editedLabel, setEditedLabel] = useState(typedData.label || '');
    const labelInputRef = useRef<HTMLInputElement>(null);

    const selectedBranchId = typedData.selectedBranchId ?? null;
    const [lastDragAt, setLastDragAt] = useState(0);

    const sensors = useSensors(
        useSensor(BranchPointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );
    const updateNodeInternals = useUpdateNodeInternals();

    // Focus input when editing starts
    useEffect(() => {
        if (isEditingLabel && labelInputRef.current) {
            labelInputRef.current.focus();
            labelInputRef.current.select();
        }
    }, [isEditingLabel]);

    const handleLabelSave = () => {
        if (!typedData.readOnly && editedLabel.trim() !== (typedData.label || '')) {
            typedData.onLabelChange?.(nodeId, editedLabel.trim());
        }
        setIsEditingLabel(false);
    };

    const handleLabelKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleLabelSave();
        } else if (e.key === 'Escape') {
            setEditedLabel(typedData.label || '');
            setIsEditingLabel(false);
        }
    };

    const handleBranchUpdate = useCallback((branchId: string, updates: Partial<Branch>) => {
        if (typedData.readOnly) return;

        const newBranches = branches.map(b =>
            b.id === branchId ? { ...b, ...updates } : b
        );
        typedData.onUpdateBranches?.(nodeId, newBranches);
    }, [branches, nodeId, typedData]);

    const handleBranchReorder = useCallback((activeBranchId: string, overBranchId: string) => {
        if (typedData.readOnly) return;
        if (activeBranchId === overBranchId) return;

        const oldIndex = branches.findIndex((branch) => branch.id === activeBranchId);
        const newIndex = branches.findIndex((branch) => branch.id === overBranchId);
        if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return;

        const reorderedBranches = [...branches];
        const [movedBranch] = reorderedBranches.splice(oldIndex, 1);
        reorderedBranches.splice(newIndex, 0, movedBranch);
        typedData.onUpdateBranches?.(nodeId, reorderedBranches);
    }, [branches, nodeId, typedData]);

    const handleDragStart = useCallback(() => {
        if (typedData.readOnly) return;
        setLastDragAt(Date.now());
    }, [typedData.readOnly]);

    const handleDragCancel = useCallback(() => {
        if (typedData.readOnly) return;
        setLastDragAt(Date.now());
    }, [typedData.readOnly]);

    const handleDragEnd = useCallback((event: DragEndEvent) => {
        if (typedData.readOnly) return;
        setLastDragAt(Date.now());
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        handleBranchReorder(String(active.id), String(over.id));
    }, [handleBranchReorder, typedData.readOnly]);

    const branchIds = useMemo(() => branches.map((branch) => branch.id), [branches]);
    const branchLayoutKey = useMemo(() => branchIds.join('|'), [branchIds]);
    const canReorderBranches = branches.length > 1;

    // Reordering animates branch rows with transforms, so we keep handle geometry in sync
    // during the animation window to avoid stale connector start positions.
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
    }, [branchLayoutKey, nodeId, updateNodeInternals]);

    const zoom = useStore((s) => s.transform[2]);
    const scale = Math.max(1, 1 / zoom);
    const conditionSurfaceClassName = 'bg-[rgb(var(--shell-node-condition-surface)/1)]';

    return (
        <div
            className={`${conditionSurfaceClassName} rounded-lg border shadow-sm min-w-[200px] transition-colors relative ${selected
                ? 'border-shell-node-condition ring-1 ring-shell-node-condition/30'
                : 'border-shell-node-condition/35 hover:border-shell-node-condition/60'
                }`}
        >
            {/* Condition Label (Figma Style) - Above the card */}
            <div
                className="absolute bottom-full left-0 mb-1.5 px-0.5 min-w-[100px] h-6 flex items-center gap-1.5 origin-bottom-left"
                style={{
                    transform: `scale(${scale})`,
                }}
            >
                <Split size={12} className="text-shell-node-condition flex-shrink-0" />
                {isEditingLabel ? (
                    <input
                        ref={labelInputRef}
                        type="text"
                        value={editedLabel}
                        onChange={(e) => setEditedLabel(e.target.value)}
                        onBlur={handleLabelSave}
                        onKeyDown={handleLabelKeyDown}
                        className="w-full h-full text-xs font-medium text-shell-text bg-transparent border border-shell-node-condition rounded px-1 outline-none nodrag"
                        onClick={(e) => e.stopPropagation()}
                        readOnly={typedData.readOnly}
                    />
                ) : (
                    <div
                        className={`w-full h-full flex items-center text-xs font-medium truncate rounded transition-colors ${typedData.readOnly ? 'cursor-default text-shell-muted-strong' : 'cursor-text'} ${!typedData.label ? 'text-shell-muted' : 'text-shell-muted-strong hover:text-shell-text'}`}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (typedData.readOnly) return;
                            setIsEditingLabel(true);
                        }}
                        title={typedData.readOnly ? undefined : 'Click to rename'}
                    >
                        {typedData.label || 'Condition'}
                    </div>
                )}
            </div>

            {/* Input Handle */}
            <Handle
                type="target"
                position={Position.Left}
                className="!bg-shell-node-condition !w-3.5 !h-3.5 !border-2 !border-shell-bg"
            />

            {/* Wrapper for branch rows */}
            <div className={`w-full h-full p-5 ${conditionSurfaceClassName} rounded-lg`}>
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={handleDragStart}
                    onDragCancel={handleDragCancel}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext items={branchIds} strategy={verticalListSortingStrategy}>
                        <div className="flex flex-col gap-2">
                            {branches.map((branch) => (
                                <SortableBranchRow
                                    key={branch.id}
                                    branchId={branch.id}
                                    disabled={typedData.readOnly || !canReorderBranches}
                                >
                                    <ConditionBranchEditor
                                        branchId={branch.id}
                                        condition={branch.condition}
                                        logic={branch.logic}
                                        isDefault={branch.isDefault}
                                        onChange={(u) => handleBranchUpdate(branch.id, u)}
                                        isOpen={selectedBranchId === branch.id}
                                        onOpenChange={(open) => {
                                            if (!open) {
                                                typedData.onDeselect?.();
                                            }
                                        }}
                                        readOnly={typedData.readOnly}
                                    >
                                        <BranchCard
                                            branch={branch}
                                            isSelected={selectedBranchId === branch.id}
                                            readOnly={typedData.readOnly}
                                            onCardClick={(anchorEl) => {
                                                if (Date.now() - lastDragAt < 180) {
                                                    return;
                                                }
                                                typedData.onSelectBranch?.(nodeId, branch.id, anchorEl);
                                            }}
                                        />
                                    </ConditionBranchEditor>
                                </SortableBranchRow>
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            </div>
        </div>
    );
});

ConditionNode.displayName = 'ConditionNode';
