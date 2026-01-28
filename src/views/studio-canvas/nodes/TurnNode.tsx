import { memo, useState, useRef, useEffect } from 'react';
import { Handle, Position, NodeProps, useStore } from '@xyflow/react';
import { VcaIcon } from '@/components/vca-components/icons/VcaIcon';
import { Component, ComponentType } from '../../studio/types';
import { TurnNodeComponentList } from './components/TurnNodeComponentList';


interface TurnNodeData {
    speaker: 'user' | 'ai';
    phase?: string;
    label?: string;
    componentCount?: number;
    components?: Component[];
    selectedComponentId?: string;

    onSelectComponent?: (nodeId: string, componentId: string, anchorEl: HTMLElement) => void;
    onDeselect?: () => void;

    onLabelChange?: (newLabel: string) => void;
    onPhaseChange?: (newPhase: string | undefined) => void;
    onComponentUpdate?: (componentId: string, updates: Partial<Component>) => void;
    onComponentAdd?: (type: ComponentType) => void;
    onComponentDelete?: (componentId: string) => void;
    onComponentReorder?: (componentIds: string[]) => void;
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
            typedData.onLabelChange?.(editedLabel.trim());
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

    return (
        <div
            id={`node-${id}`}
            className={`bg-white rounded-lg border shadow-sm w-[320px] transition-colors cursor-default relative ${selected
                ? 'border-blue-500 ring-1 ring-blue-500'
                : 'border-gray-300 hover:border-blue-300'
                }`}
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
                        <VcaIcon icon="signal-ai" size="sm" className="text-blue-600 flex-shrink-0" />
                    ) : (
                        <span className="text-gray-600 flex-shrink-0 text-xs">👤</span>
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
                            className="w-full h-full text-xs font-medium text-gray-900 bg-transparent border border-blue-500 rounded px-1 outline-none nodrag"
                            onClick={(e) => e.stopPropagation()}
                        />
                    ) : (
                        <div
                            className={`w-full h-full flex items-center text-xs font-medium truncate rounded transition-colors cursor-text ${!typedData.label ? 'text-gray-400' : 'text-gray-500 hover:text-gray-900'}`}
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
            < Handle
                type="target"
                position={Position.Left}
                className="!bg-blue-400 !w-3 !h-3 !border-2 !border-white"
            />

            {/* Internal Content Wrapper for clipping rounded corners */}
            < div className="w-full h-full overflow-hidden rounded-lg" >
                {/* Component List */}
                < TurnNodeComponentList
                    nodeId={nodeId}
                    components={components}
                    selectedComponentId={typedData.selectedComponentId}
                    onSelectComponent={typedData.onSelectComponent}
                    onDeselect={typedData.onDeselect}
                    onComponentUpdate={typedData.onComponentUpdate}
                />
            </div >

            {/* Output Handle */}
            < Handle
                type="source"
                position={Position.Right}
                className="!bg-blue-400 !w-3 !h-3 !border-2 !border-white"
            />
        </div >
    );
});

TurnNode.displayName = 'TurnNode';

