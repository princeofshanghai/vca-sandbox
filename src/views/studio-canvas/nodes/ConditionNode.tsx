import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { Handle, Position, NodeProps, useStore, useUpdateNodeInternals } from '@xyflow/react';
import {
    closestCenter,
    DndContext,
    DragEndEvent,
    KeyboardSensor,
    PointerSensor as DndPointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Split } from 'lucide-react';
import { ConditionBranchEditor } from '../components/ConditionBranchEditor';
import { BranchCard } from './components/BranchCard';
import { Branch } from '../../studio/types';
import { createDefaultConditionBranches } from '../../studio/conditionBranches';
import {
    CONDITION_NAME_FALLBACK,
    CONDITION_QUESTION_PLACEHOLDER,
    getConditionQuestionLabel,
    materializeConditionQuestion,
} from '../../studio/conditionBranchLabels';
import { CanvasNodeCommentState } from '../types';

const HANDLE_SYNC_WINDOW_MS = 280;

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

interface ConditionNodeData {
    label: string;
    question?: string;
    branches?: Branch[];
    readOnly?: boolean;
    commentState?: CanvasNodeCommentState;
    onLabelChange?: (nodeId: string, newLabel: string) => void;
    onQuestionChange?: (nodeId: string, question: string) => void;
    onUpdateBranches?: (nodeId: string, branches: Branch[]) => void;
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
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [isEditingLabel, setIsEditingLabel] = useState(false);
    const [editedLabel, setEditedLabel] = useState(typedData.label || '');
    const [lastDragAt, setLastDragAt] = useState(0);
    const labelInputRef = useRef<HTMLInputElement>(null);
    const branches = useMemo<Branch[]>(
        () => {
            const sourceBranches = typedData.branches && typedData.branches.length > 0
                ? typedData.branches
                : createDefaultConditionBranches();
            const matchingBranches: Branch[] = [];
            const fallbackBranches: Branch[] = [];

            sourceBranches.forEach((branch) => {
                if (branch.isDefault) {
                    fallbackBranches.push(branch);
                } else {
                    matchingBranches.push(branch);
                }
            });

            return [...matchingBranches, ...fallbackBranches];
        },
        [typedData.branches]
    );
    const questionLabel = getConditionQuestionLabel(typedData.question, typedData.label);
    const editorQuestion = materializeConditionQuestion(typedData.question, typedData.label);
    const branchIds = useMemo(() => branches.map((branch) => branch.id), [branches]);
    const branchLayoutKey = useMemo(() => branchIds.join('|'), [branchIds]);
    const reorderableBranchCount = useMemo(
        () => branches.filter((branch) => !branch.isDefault).length,
        [branches]
    );
    const canReorderBranches = !typedData.readOnly && reorderableBranchCount > 1;
    const updateNodeInternals = useUpdateNodeInternals();
    const sensors = useSensors(
        useSensor(BranchPointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        if (!isEditingLabel) {
            setEditedLabel(typedData.label || '');
        }
    }, [isEditingLabel, typedData.label]);

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

    useEffect(() => {
        if (isEditingLabel && labelInputRef.current) {
            labelInputRef.current.focus();
            labelInputRef.current.select();
        }
    }, [isEditingLabel]);

    const handleLabelSave = () => {
        const nextLabel = editedLabel.trim();
        if (!typedData.readOnly && nextLabel !== (typedData.label || '')) {
            typedData.onLabelChange?.(nodeId, nextLabel);
        }
        setIsEditingLabel(false);
    };

    const handleLabelKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            handleLabelSave();
        } else if (event.key === 'Escape') {
            setEditedLabel(typedData.label || '');
            setIsEditingLabel(false);
        }
    };

    const handleBranchDragStart = () => {
        setLastDragAt(Date.now());
    };

    const handleBranchDragCancel = () => {
        setLastDragAt(Date.now());
    };

    const handleBranchDragEnd = (event: DragEndEvent) => {
        setLastDragAt(Date.now());

        if (typedData.readOnly) return;

        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const activeIndex = branches.findIndex((branch) => branch.id === active.id);
        const overBranch = branches.find((branch) => branch.id === over.id);
        let overIndex = branches.findIndex((branch) => branch.id === over.id);

        if (activeIndex === -1 || overIndex === -1) return;
        if (branches[activeIndex]?.isDefault) return;

        const fallbackIndex = branches.findIndex((branch) => branch.isDefault);
        const lastMatchIndex = fallbackIndex === -1 ? branches.length - 1 : fallbackIndex - 1;
        if (lastMatchIndex < 0) return;

        if (overBranch?.isDefault) {
            overIndex = lastMatchIndex;
        }

        const nextBranches = arrayMove(branches, activeIndex, overIndex);
        typedData.onUpdateBranches?.(nodeId, nextBranches);
    };

    const zoom = useStore((s) => s.transform[2]);
    const scale = Math.max(1, 1 / zoom);
    const conditionSurfaceClassName = 'bg-[rgb(var(--shell-node-condition-surface)/1)]';
    const commentState = typedData.commentState;
    const isCommentHighlighted = Boolean(commentState?.isActive);
    const isCommentPlacementMode = Boolean(commentState?.isPlacementMode);
    const borderClassName = selected || isEditorOpen
        ? 'border-shell-node-condition ring-1 ring-shell-node-condition/30'
        : isCommentHighlighted
            ? 'border-shell-accent ring-2 ring-shell-accent/28 shadow-[0_16px_36px_rgb(var(--shell-accent)/0.12)]'
            : isCommentPlacementMode
                ? 'border-shell-node-condition/35 hover:border-shell-accent/60 hover:ring-1 hover:ring-shell-accent/18 cursor-pointer'
                : 'border-shell-node-condition/35 hover:border-shell-node-condition/60';

    return (
        <ConditionBranchEditor
            nodeId={nodeId}
            question={editorQuestion}
            branches={branches}
            onQuestionChange={(nextQuestion) => typedData.onQuestionChange?.(nodeId, nextQuestion)}
            onBranchesChange={(nextBranches) => typedData.onUpdateBranches?.(nodeId, nextBranches)}
            isOpen={isEditorOpen}
            onOpenChange={setIsEditorOpen}
            readOnly={typedData.readOnly}
        >
            <div
                id={`node-${nodeId}`}
                className={`${conditionSurfaceClassName} rounded-lg border shadow-sm min-w-[240px] transition-colors relative overflow-visible ${borderClassName}`}
                onClick={(event) => {
                    const target = event.target as HTMLElement | null;
                    if (target?.closest('.react-flow__handle')) {
                        return;
                    }
                    if (Date.now() - lastDragAt < 180) {
                        return;
                    }
                    setIsEditorOpen(true);
                }}
            >
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
                            onChange={(event) => setEditedLabel(event.target.value)}
                            onBlur={handleLabelSave}
                            onKeyDown={handleLabelKeyDown}
                            className="w-full h-full rounded border border-shell-node-condition bg-transparent px-1 text-xs font-medium text-shell-text outline-none nodrag"
                            onClick={(event) => event.stopPropagation()}
                            readOnly={typedData.readOnly}
                        />
                    ) : (
                        <div
                            className={`w-full h-full flex items-center truncate rounded text-xs font-medium transition-colors ${typedData.readOnly ? 'cursor-default text-shell-muted-strong' : 'cursor-text'} ${typedData.label ? 'text-shell-muted-strong hover:text-shell-text' : 'text-shell-muted'}`}
                            onClick={(event) => {
                                event.stopPropagation();
                                if (typedData.readOnly) return;
                                setIsEditingLabel(true);
                            }}
                            title={typedData.readOnly ? undefined : 'Click to rename'}
                        >
                            {typedData.label || CONDITION_NAME_FALLBACK}
                        </div>
                    )}
                </div>

                <Handle
                    type="target"
                    position={Position.Left}
                    className="!bg-shell-node-condition !w-3.5 !h-3.5 !border-2 !border-shell-bg"
                />

                <div className={`w-full h-full px-7 py-7 ${conditionSurfaceClassName} rounded-lg`}>
                    <div className="mb-5 px-1">
                        <p className={`text-[15px] font-semibold leading-snug ${questionLabel ? 'text-shell-text' : 'text-shell-muted'}`}>
                            {questionLabel || CONDITION_QUESTION_PLACEHOLDER}
                        </p>
                    </div>

                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragStart={canReorderBranches ? handleBranchDragStart : undefined}
                        onDragCancel={canReorderBranches ? handleBranchDragCancel : undefined}
                        onDragEnd={canReorderBranches ? handleBranchDragEnd : undefined}
                    >
                        <SortableContext items={branchIds} strategy={verticalListSortingStrategy}>
                            <div className="flex flex-col gap-3">
                                {branches.map((branch) => (
                                    <SortableBranchRow
                                        key={branch.id}
                                        branchId={branch.id}
                                        disabled={!canReorderBranches || !!branch.isDefault}
                                    >
                                        <BranchCard
                                            branch={branch}
                                            isSelected={false}
                                            readOnly={typedData.readOnly}
                                            onCardClick={() => {
                                                if (Date.now() - lastDragAt < 180) {
                                                    return;
                                                }
                                                setIsEditorOpen(true);
                                            }}
                                            stopPropagationOnClick={false}
                                        />
                                    </SortableBranchRow>
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                </div>
            </div>
        </ConditionBranchEditor>
    );
});

ConditionNode.displayName = 'ConditionNode';
