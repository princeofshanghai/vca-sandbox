import { memo, useState, useRef, useEffect, forwardRef } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { VcaIcon } from '@/components/vca-components/icons/VcaIcon';
import { MessageSquare, MessageCirclePlus, MessageSquareText, Zap } from 'lucide-react';
import { Component, ComponentType, AIMessageContent, PromptContent, AIInfoContent, AIActionContent } from '../../studio/types';
import { InfoMessageEditor } from '../components/InfoMessageEditor';
import { MessageEditor } from '../components/MessageEditor';
import { PromptEditor } from '../components/PromptEditor';
import { ActionCardEditor } from '../components/ActionCardEditor';

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

// Capitalize phase for display
const formatPhase = (phase?: string): string => {
    if (!phase) return '';
    if (phase === 'intent') return 'Intent recognition';
    if (phase === 'info') return 'Info gathering';
    return phase.charAt(0).toUpperCase() + phase.slice(1);
};

// Get icon and label for component type
const getComponentDisplay = (component: Component): { icon: JSX.Element; label: string; detail?: string } => {
    switch (component.type) {
        case 'message': {
            const messageContent = component.content as AIMessageContent;
            return {
                icon: <MessageSquare className="w-3 h-3" />,
                label: 'Message',
                detail: messageContent.text || ''
            };
        }
        case 'prompt': {
            const promptContent = component.content as PromptContent;
            return {
                icon: <MessageCirclePlus className="w-3 h-3" />,
                label: 'Prompt',
                detail: promptContent.text || ''
            };
        }
        case 'infoMessage': {
            const infoContent = component.content as AIInfoContent;
            return {
                icon: <MessageSquareText className="w-3 h-3" />,
                label: 'Info Message',
                detail: infoContent.title || infoContent.body || ''
            };
        }
        case 'actionCard': {
            const actionContent = component.content as AIActionContent;
            return {
                icon: <Zap className="w-3 h-3" />,
                label: 'Action Card',
                detail: actionContent.loadingTitle || actionContent.successTitle || ''
            };
        }
        default:
            return { icon: <MessageSquare className="w-3 h-3" />, label: 'Component' };
    }
};

// Simplified Component Card - Display only, no inline editing
const SimpleComponentCard = memo(forwardRef<HTMLDivElement, {
    component: Component;
    display: { icon: JSX.Element; label: string; detail?: string };
    isSelected: boolean;
    onClick: () => void;
}>(({
    component,
    display,
    isSelected,
    onClick,
}, ref) => {
    return (
        <div
            ref={ref}
            id={`component-${component.id}`}
            onClick={(e) => {
                e.stopPropagation(); // Prevent node selection
                onClick();
            }}
            className={`component-card flex items-start gap-2 px-3 py-2.5 rounded-md border transition-all ${isSelected
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 bg-white hover:border-blue-300'
                } cursor-default`}
        >
            <span className="text-gray-600 flex-shrink-0 mt-0.5">{display.icon}</span>
            <div className="flex-1 min-w-0">
                {display.detail ? (
                    <div className="text-xs text-gray-700 whitespace-pre-wrap leading-normal font-sans break-words">
                        {display.detail}
                    </div>
                ) : (
                    <div className="text-[11px] text-gray-400">Add {display.label.toLowerCase()} text</div>
                )}
            </div>
        </div>
    );
}));

SimpleComponentCard.displayName = 'SimpleComponentCard';

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

            {/* Component List - Card style with spacing */}
            <div className="px-5 pb-5 pt-5 space-y-3 bg-gray-50 rounded-b-lg">
                {components.map((component: Component) => {
                    const display = getComponentDisplay(component);

                    const card = (
                        <SimpleComponentCard
                            component={component}
                            display={display}
                            isSelected={typedData.selectedComponentId === component.id}
                            onClick={() => {
                                const el = document.getElementById(`component-${component.id}`);
                                if (typedData.onSelectComponent) {
                                    typedData.onSelectComponent(nodeId, component.id, el || document.body);
                                }
                            }}
                        />
                    );

                    // Wrap each component type with its respective editor
                    const handleOpenChange = (open: boolean) => {
                        if (!open && typedData.selectedComponentId === component.id) {
                            typedData.onDeselect?.();
                        }
                    };

                    if (component.type === 'message') {
                        return (
                            <MessageEditor
                                key={component.id}
                                component={component}
                                onChange={(updates) => typedData.onComponentUpdate?.(component.id, { content: { ...component.content, ...updates } })}
                                isOpen={typedData.selectedComponentId === component.id}
                                onOpenChange={handleOpenChange}
                            >
                                {card}
                            </MessageEditor>
                        );
                    }

                    if (component.type === 'prompt') {
                        return (
                            <PromptEditor
                                key={component.id}
                                component={component}
                                onChange={(updates) => typedData.onComponentUpdate?.(component.id, { content: { ...component.content, ...updates } })}
                                isOpen={typedData.selectedComponentId === component.id}
                                onOpenChange={handleOpenChange}
                            >
                                {card}
                            </PromptEditor>
                        );
                    }

                    if (component.type === 'infoMessage') {
                        return (
                            <InfoMessageEditor
                                key={component.id}
                                component={component}
                                onChange={(updates) => typedData.onComponentUpdate?.(component.id, { content: { ...component.content, ...updates } })}
                                isOpen={typedData.selectedComponentId === component.id}
                                onOpenChange={handleOpenChange}
                            >
                                {card}
                            </InfoMessageEditor>
                        );
                    }

                    if (component.type === 'actionCard') {
                        return (
                            <ActionCardEditor
                                key={component.id}
                                component={component}
                                onChange={(updates) => typedData.onComponentUpdate?.(component.id, { content: { ...component.content, ...updates } })}
                                isOpen={typedData.selectedComponentId === component.id}
                                onOpenChange={handleOpenChange}
                            >
                                {card}
                            </ActionCardEditor>
                        );
                    }

                    return card;
                })}
            </div>





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
