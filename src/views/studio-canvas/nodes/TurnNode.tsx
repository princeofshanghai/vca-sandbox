import { memo, useState, useRef, useEffect } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { VcaIcon } from '@/components/vca-components/icons/VcaIcon';
import { Component, ComponentType } from '../../studio/types';
import { TurnNodeComponentList } from './components/TurnNodeComponentList';
import { formatPhase } from './utils/turnNodeUtils';

interface TurnNodeData {
    speaker: 'user' | 'ai';
    phase?: string;
    label?: string;
    componentCount?: number;
    components?: Component[];
    selectedComponentId?: string;

    onSelectNode?: (nodeId: string, anchorEl: HTMLElement) => void;
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

    const handleNodeClick = (e: React.MouseEvent) => {
        const target = e.target as HTMLElement;
        // Only select node if clicking the header area, not input fields
        if (!target.closest('input') && !target.closest('button') && typedData.onSelectNode) {
            e.stopPropagation(); // Prevent canvas from immediately deselecting
            const nodeEl = e.currentTarget as HTMLElement;
            typedData.onSelectNode(nodeId, nodeEl);
        }
    };

    return (
        <div
            id={`node-${id}`}
            className={`bg-white rounded-lg border shadow-sm w-[320px] transition-colors cursor-default relative ${selected
                ? 'border-blue-500'
                : `border-gray-300 hover:border-blue-300 ${isAI ? 'has-[.component-card:hover]:border-gray-300 has-[.node-label:hover]:border-gray-300' : ''}`
                }`}
            onClick={handleNodeClick}
        >
            {/* Hanging Phase Tag */}
            {typedData.phase && (
                <div className={`absolute bottom-full left-0 mb-2 px-2.5 py-1 rounded-none text-[11px] font-bold uppercase tracking-wider border shadow-sm transition-colors ${typedData.phase === 'welcome' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                    typedData.phase === 'intent' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                        typedData.phase === 'info' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                            typedData.phase === 'action' ? 'bg-rose-100 text-rose-700 border-rose-200' :
                                'bg-blue-50 text-blue-700 border-blue-100'
                    }`}>
                    {formatPhase(typedData.phase)}
                </div>
            )}
            {/* Input Handle */}
            <Handle
                type="target"
                position={Position.Top}
                className="!bg-gray-400 !w-3 !h-3 !border-2 !border-white"
            />

            {/* Header - Now white with more padding */}
            <div
                className="px-5 py-4 border-b border-gray-200 cursor-default"
            >
                <div className="flex items-center gap-2">
                    {/* Speaker Icon & Label */}
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                        {isAI ? (
                            <VcaIcon icon="signal-ai" size="sm" className="text-blue-600 flex-shrink-0" />
                        ) : (
                            <span className="text-gray-600 flex-shrink-0">👤</span>
                        )}

                        {/* Editable Label - Fixed height to prevent jumping */}
                        <div className="flex-1 min-w-0 h-7 flex items-center">
                            {isEditingLabel ? (
                                <input
                                    ref={labelInputRef}
                                    type="text"
                                    value={editedLabel}
                                    onChange={(e) => setEditedLabel(e.target.value)}
                                    onBlur={handleLabelSave}
                                    onKeyDown={handleLabelKeyDown}
                                    className="w-full h-full text-base font-semibold text-gray-900 bg-white border border-blue-500 rounded px-2 outline-none nodrag"
                                    onClick={(e) => e.stopPropagation()}
                                />
                            ) : (
                                <div
                                    className={`node-label w-full h-full flex items-center px-2 text-base font-semibold truncate rounded hover:bg-gray-100 transition-colors cursor-default ${!typedData.label ? 'text-gray-400' : 'text-gray-900'}`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsEditingLabel(true);
                                    }}
                                    title="Click to edit"
                                >
                                    {typedData.label || 'Add name'}
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>

            {/* Component List */}
            <TurnNodeComponentList
                nodeId={nodeId}
                components={components}
                selectedComponentId={typedData.selectedComponentId}
                onSelectComponent={typedData.onSelectComponent}
                onDeselect={typedData.onDeselect}
                onComponentUpdate={typedData.onComponentUpdate}
            />

            {/* Output Handle */}
            <Handle
                type="source"
                position={Position.Bottom}
                className="!bg-gray-400 !w-3 !h-3 !border-2 !border-white"
            />
        </div>
    );
});

TurnNode.displayName = 'TurnNode';

