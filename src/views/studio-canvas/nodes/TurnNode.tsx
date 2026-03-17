import { memo, useState, useRef, useEffect } from 'react';
import { Handle, Position, NodeProps, useStore } from '@xyflow/react';
import { VcaIcon } from '@/components/vca-components/icons/VcaIcon';
import { Component } from '../../studio/types';
import { TurnNodeComponentList } from './components/TurnNodeComponentList';
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

    onLabelChange?: (nodeId: string, newLabel: string) => void;
    onComponentUpdate?: (nodeId: string, componentId: string, updates: Partial<Component>) => void;
}

export const TurnNode = memo(({ id, data, selected }: NodeProps) => {
    const nodeId = id as string;
    const typedData = data as unknown as TurnNodeData;
    const isAI = typedData.speaker === 'ai';
    const components = typedData.components || [];
    const hasComponents = components.length > 0;

    // Label editing state
    const [isEditingLabel, setIsEditingLabel] = useState(false);
    const [editedLabel, setEditedLabel] = useState(typedData.label || '');
    const labelInputRef = useRef<HTMLInputElement>(null);

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

    return (
        <div
            id={`node-${id}`}
            className={`${nodeSurfaceClassName} ${nodeWidthClassName} rounded-lg border shadow-sm transition-colors relative overflow-visible ${borderClassName}`}
        >
            {/* Node Label (Figma Style) - Above the card */}
            < div
                className="absolute bottom-full left-0 mb-1.5 px-0.5 min-w-[100px] h-6 flex items-center gap-1.5 origin-bottom-left"
                style={{
                    transform: `scale(${scale})`,
                }}
            >
                {/* Speaker Icon relocated from header */}
                {
                    isAI ? (
                        <VcaIcon icon="signal-ai" size="sm" className={`${accentClassName} flex-shrink-0`} />
                    ) : (
                        <span className={`${accentClassName} flex-shrink-0 text-xs`}>👤</span>
                    )
                }

                {
                    isEditingLabel ? (
                        <input
                            ref={labelInputRef}
                            type="text"
                            value={editedLabel}
                            onChange={(e) => setEditedLabel(e.target.value)}
                            onBlur={handleLabelSave}
                            onKeyDown={handleLabelKeyDown}
                            className={`w-full h-full text-xs font-medium text-shell-text bg-transparent border rounded px-1 outline-none nodrag ${labelInputBorderClassName}`}
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
                            {typedData.label || (isAI ? 'AI Turn' : 'User Turn')}
                        </div>
                    )
                }
            </div >

            {/* Input Handle */}
            <Handle
                type="target"
                id="main-input"
                position={Position.Left}
                className={`${handleClassName} !w-3.5 !h-3.5 !border-2 !border-shell-bg !z-50`}
                style={hasComponents ? { top: 19 } : undefined}
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
                className={`${handleClassName} !w-3.5 !h-3.5 !border-2 !border-shell-bg !z-50`}
                style={hasComponents ? { top: 19 } : undefined}
            />
        </div >
    );
});

TurnNode.displayName = 'TurnNode';
