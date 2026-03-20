import { memo, useState, useRef, useEffect } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { Handle, Position, NodeProps, useStore } from '@xyflow/react';
import { Plus } from 'lucide-react';
import { ShellIconButton } from '@/components/shell';
import { VcaIcon } from '@/components/vca-components/icons/VcaIcon';
import { Component, ComponentType } from '../../studio/types';
import { AddComponentContent } from '../components/AddComponentPopover';
import { ActionTooltip } from '../components/ActionTooltip';
import { TurnNodeComponentList } from './components/TurnNodeComponentList';
import { OUTER_NODE_HANDLE_OFFSET_PX } from './components/handleOffsets';
import { CanvasNodeCommentState } from '../types';


interface TurnNodeData {
    speaker: 'user' | 'ai';
    phase?: string;
    label?: string;
    components?: Component[];
    selectedComponentIds?: string[];
    openComponentId?: string;
    entryPoint?: string;
    readOnly?: boolean;
    commentState?: CanvasNodeCommentState;

    onSelectComponent?: (
        nodeId: string,
        componentId: string,
        anchorEl: HTMLElement,
        options?: { appendToSelection?: boolean }
    ) => void;
    onDeselect?: () => void;
    onComponentReorder?: (nodeId: string, activeComponentId: string, overComponentId: string) => void;
    onComponentDelete?: (nodeId: string, componentId: string) => void;

    onLabelChange?: (nodeId: string, newLabel: string) => void;
    onComponentUpdate?: (nodeId: string, componentId: string, updates: Partial<Component>) => void;
    onAddComponent?: (nodeId: string, type: ComponentType) => void;
}

export const TurnNode = memo(({ id, data, selected }: NodeProps) => {
    const nodeId = id as string;
    const typedData = data as unknown as TurnNodeData;
    const isAI = typedData.speaker === 'ai';
    const components = typedData.components || [];
    const hasComponents = components.length > 0;

    // Label editing state
    const [isEditingLabel, setIsEditingLabel] = useState(false);
    const [isAddComponentPopoverOpen, setIsAddComponentPopoverOpen] = useState(false);
    const [editedLabel, setEditedLabel] = useState(typedData.label || '');
    const labelInputRef = useRef<HTMLInputElement>(null);

    // Focus input when editing starts
    useEffect(() => {
        if (isEditingLabel && labelInputRef.current) {
            labelInputRef.current.focus();
            labelInputRef.current.select();
        }
    }, [isEditingLabel]);

    useEffect(() => {
        if (isEditingLabel) {
            setIsAddComponentPopoverOpen(false);
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

    const zoom = useStore((s) => s.transform[2]);
    const scale = Math.max(1, 1 / zoom);
    const commentState = typedData.commentState;
    const isCommentHighlighted = Boolean(commentState?.isActive);
    const isCommentPlacementMode = Boolean(commentState?.isPlacementMode);
    const selectedBorderClassName = isAI
        ? 'border-shell-accent ring-1 ring-shell-accent/30'
        : 'border-shell-node-user ring-1 ring-shell-node-user/30';
    const idleBorderClassName = isAI
        ? 'border-shell-accent/35 hover:border-shell-accent/60'
        : 'border-shell-node-user/35 hover:border-shell-node-user/60';
    const commentBorderClassName = isCommentHighlighted
        ? 'border-shell-accent ring-2 ring-shell-accent/28 shadow-[0_16px_36px_rgb(var(--shell-accent)/0.12)]'
        : isCommentPlacementMode
            ? `${idleBorderClassName} cursor-pointer hover:ring-1 hover:ring-shell-accent/18`
            : idleBorderClassName;
    const borderClassName = selected ? selectedBorderClassName : commentBorderClassName;
    const nodeSurfaceClassName = isAI
        ? 'bg-[rgb(var(--shell-node-ai-surface)/1)]'
        : 'bg-[rgb(var(--shell-node-user-surface)/1)]';
    const accentClassName = isAI ? 'text-shell-accent' : 'text-shell-node-user';
    const handleClassName = isAI ? '!bg-shell-accent' : '!bg-shell-node-user';
    const labelInputBorderClassName = isAI ? 'border-shell-accent' : 'border-shell-node-user';
    const nodeWidthClassName = isAI ? 'w-[360px]' : 'w-[320px]';
    const showAddComponentButton = isAI && !typedData.readOnly && !isEditingLabel && Boolean(typedData.onAddComponent);

    return (
        <div
            id={`node-${id}`}
            className={`${nodeSurfaceClassName} ${nodeWidthClassName} rounded-lg border shadow-sm transition-colors relative overflow-visible ${borderClassName}`}
        >
            {/* Node Label (Figma Style) - Above the card */}
            <div
                className="absolute bottom-full left-0 mb-1.5 h-6 pl-0.5 pr-0 flex items-center justify-between gap-2 origin-bottom-left"
                style={{
                    width: `${100 / scale}%`,
                    transform: `scale(${scale})`,
                }}
            >
                <div className="min-w-0 flex flex-1 items-center gap-1.5">
                    {isAI ? (
                        <VcaIcon icon="signal-ai" size="sm" className={`${accentClassName} flex-shrink-0`} />
                    ) : (
                        <span className={`${accentClassName} flex-shrink-0 text-xs`}>👤</span>
                    )}

                    {isEditingLabel ? (
                        <input
                            ref={labelInputRef}
                            type="text"
                            value={editedLabel}
                            onChange={(e) => setEditedLabel(e.target.value)}
                            onBlur={handleLabelSave}
                            onKeyDown={handleLabelKeyDown}
                            className={`h-full flex-1 text-xs font-medium text-shell-text bg-transparent border rounded px-1 outline-none nodrag ${labelInputBorderClassName}`}
                            onClick={(e) => e.stopPropagation()}
                            readOnly={typedData.readOnly}
                        />
                    ) : (
                        <div
                            className={`min-w-0 flex-1 h-full flex items-center text-xs font-medium truncate rounded transition-colors ${typedData.readOnly ? 'cursor-default text-shell-muted-strong' : 'cursor-text'} ${!typedData.label ? 'text-shell-muted' : 'text-shell-muted-strong hover:text-shell-text'}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                if (typedData.readOnly) return;
                                setIsEditingLabel(true);
                            }}
                            title={typedData.readOnly ? undefined : 'Click to rename'}
                        >
                            {typedData.label || (isAI ? 'AI Turn' : 'User Turn')}
                        </div>
                    )}
                </div>

                {showAddComponentButton && (
                    <Popover.Root open={isAddComponentPopoverOpen} onOpenChange={setIsAddComponentPopoverOpen}>
                        <ActionTooltip content="Add component">
                            <Popover.Trigger asChild>
                                <ShellIconButton
                                    type="button"
                                    size="sm"
                                    shape="rounded"
                                    variant="outline"
                                    aria-label="Add component"
                                    data-no-dnd="true"
                                    onClick={(e) => e.stopPropagation()}
                                    onPointerDown={(e) => e.stopPropagation()}
                                    className="nodrag nopan h-6 w-6 shrink-0 translate-x-0.5 rounded-md border-shell-accent/40 bg-[rgb(var(--shell-node-ai-surface)/1)] text-shell-accent shadow-sm hover:border-shell-accent/65 hover:bg-shell-accent-soft hover:text-shell-accent-text focus-visible:ring-shell-accent/20"
                                >
                                    <Plus size={14} />
                                </ShellIconButton>
                            </Popover.Trigger>
                        </ActionTooltip>
                        <AddComponentContent
                            side="bottom"
                            align="end"
                            previewSide="right"
                            onAdd={(type) => {
                                typedData.onAddComponent?.(nodeId, type);
                                setIsAddComponentPopoverOpen(false);
                            }}
                        />
                    </Popover.Root>
                )}
            </div>

            {/* Input Handle */}
            <Handle
                type="target"
                id="main-input"
                position={Position.Left}
                className={`${handleClassName} !w-[18px] !h-[18px] !border-2 !border-shell-bg !z-50`}
                style={hasComponents ? { top: 19, left: -OUTER_NODE_HANDLE_OFFSET_PX } : { left: -OUTER_NODE_HANDLE_OFFSET_PX }}
            />

            {/* Internal Content Wrapper for clipping rounded corners */}
            <div className="w-full h-full rounded-lg">
                {/* Component List */}
                <TurnNodeComponentList
                    nodeId={nodeId}
                    components={components}
                    selectedComponentIds={typedData.selectedComponentIds}
                    openComponentId={typedData.openComponentId}
                    surfaceClassName={nodeSurfaceClassName}
                    onSelectComponent={typedData.onSelectComponent}
                    onDeselect={typedData.onDeselect}
                    onComponentReorder={typedData.onComponentReorder}
                    onComponentDelete={typedData.onComponentDelete}
                    onComponentUpdate={typedData.onComponentUpdate}
                    isAiTurn={isAI}
                    readOnly={typedData.readOnly}
                />
            </div>

            {/* Output Handle */}
            <Handle
                type="source"
                id="main-output"
                position={Position.Right}
                className={`${handleClassName} !w-[18px] !h-[18px] !border-2 !border-shell-bg !z-50`}
                style={hasComponents ? { top: 19, right: -OUTER_NODE_HANDLE_OFFSET_PX } : { right: -OUTER_NODE_HANDLE_OFFSET_PX }}
            />
        </div >
    );
});

TurnNode.displayName = 'TurnNode';
