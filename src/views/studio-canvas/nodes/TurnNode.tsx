import { memo, useState, useRef, useEffect } from 'react';
import { Handle, Position, NodeProps, useStore } from '@xyflow/react';
import { VcaIcon } from '@/components/vca-components/icons/VcaIcon';
import { Component } from '../../studio/types';
import { TurnNodeComponentList } from './components/TurnNodeComponentList';


interface TurnNodeData {
    speaker: 'user' | 'ai';
    phase?: string;
    label?: string;
    components?: Component[];
    selectedComponentId?: string;
    entryPoint?: string;

    onSelectComponent?: (nodeId: string, componentId: string, anchorEl: HTMLElement) => void;
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
        if (editedLabel.trim() !== (typedData.label || '')) {
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
    const borderClassName = isAI
        ? (selected
            ? 'border-shell-accent ring-1 ring-shell-accent/30'
            : 'border-shell-accent/35 hover:border-shell-accent/60')
        : (selected
            ? 'border-shell-node-user ring-1 ring-shell-node-user/30'
            : 'border-shell-node-user/35 hover:border-shell-node-user/60');
    const nodeSurfaceClassName = isAI
        ? 'bg-[rgb(var(--shell-node-ai-surface)/1)]'
        : 'bg-[rgb(var(--shell-node-user-surface)/1)]';
    const accentClassName = isAI ? 'text-shell-accent' : 'text-shell-node-user';
    const handleClassName = isAI ? '!bg-shell-accent' : '!bg-shell-node-user';
    const labelInputBorderClassName = isAI ? 'border-shell-accent' : 'border-shell-node-user';

    return (
        <div
            id={`node-${id}`}
            className={`${nodeSurfaceClassName} rounded-lg border shadow-sm w-[320px] transition-colors relative overflow-visible ${borderClassName}`}
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
                        />
                    ) : (
                        <div
                            className={`w-full h-full flex items-center text-xs font-medium truncate rounded transition-colors cursor-text ${!typedData.label ? 'text-shell-muted' : 'text-shell-muted-strong hover:text-shell-text'}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsEditingLabel(true);
                            }}
                            title="Click to rename"
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
                className={`${handleClassName} !w-3 !h-3 !border-2 !border-shell-bg !z-50`}
                style={{ top: 19 }}
            />

            {/* Internal Content Wrapper for clipping rounded corners */}
            <div className="w-full h-full rounded-lg">
                {/* Component List */}
                <TurnNodeComponentList
                    nodeId={nodeId}
                    components={components}
                    selectedComponentId={typedData.selectedComponentId}
                    entryPoint={typedData.entryPoint}
                    surfaceClassName={nodeSurfaceClassName}
                    onSelectComponent={typedData.onSelectComponent}
                    onDeselect={typedData.onDeselect}
                    onComponentReorder={typedData.onComponentReorder}
                    onComponentUpdate={typedData.onComponentUpdate}
                />
            </div>

            {/* Output Handle */}
            <Handle
                type="source"
                id="main-output"
                position={Position.Right}
                className={`${handleClassName} !w-3 !h-3 !border-2 !border-shell-bg !z-50`}
                style={{ top: 19 }}
            />
        </div >
    );
});

TurnNode.displayName = 'TurnNode';
