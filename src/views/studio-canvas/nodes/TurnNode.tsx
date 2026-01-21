import { memo, useState, useRef, useEffect } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { VcaIcon } from '@/components/vca-components/icons/VcaIcon';
import { MessageSquare, SquareStack, MessageSquareText, Zap, Circle, Edit3 } from 'lucide-react';
import { Component, ComponentType, AIMessageContent, PromptContent } from '../../studio/types';
import TextareaAutosize from 'react-textarea-autosize';

interface TurnNodeData {
    speaker: 'user' | 'ai';
    phase?: string;
    label?: string;
    componentCount?: number;
    locked?: boolean;
    components?: Component[];
    isSelected?: boolean;
    selectedComponentId?: string;
    editingComponentId?: string;
    initialCursorIndex?: number;
    onSelectNode?: (nodeId: string, anchorEl: HTMLElement) => void;
    onSelectComponent?: (nodeId: string, componentId: string, anchorEl: HTMLElement) => void;
    onSetEditingComponent?: (nodeId: string, componentId: string | null, cursorIndex?: number) => void;
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
    return phase.charAt(0).toUpperCase() + phase.slice(1);
};

// Get icon and label for component type
const getComponentDisplay = (component: Component): { icon: JSX.Element; label: string; detail?: string } => {
    switch (component.type) {
        case 'message': {
            const messageContent = component.content as AIMessageContent;
            return {
                icon: <MessageSquare className="w-4 h-4" />,
                label: 'Message',
                detail: messageContent.text || ''
            };
        }
        case 'prompt': {
            const promptContent = component.content as PromptContent;
            return {
                icon: <SquareStack className="w-4 h-4" />,
                label: 'Prompt',
                detail: promptContent.text || ''
            };
        }
        case 'infoMessage':
            return { icon: <MessageSquareText className="w-4 h-4" />, label: 'Info Message' };
        case 'actionCard':
            return { icon: <Zap className="w-4 h-4" />, label: 'Action Card' };
        case 'buttons':
            return { icon: <Circle className="w-4 h-4" />, label: 'Buttons' };
        case 'input':
            return { icon: <Edit3 className="w-4 h-4" />, label: 'Input' };
        default:
            return { icon: <MessageSquare className="w-4 h-4" />, label: 'Component' };
    }
};

// Simplified Component Card (no drag handles or buttons)
const SimpleComponentCard = ({
    component,
    display,
    isSelected,
    isEditing,
    initialCursorIndex,
    onClick,
    onDoubleClick,
    onSave,
}: {
    component: Component;
    display: { icon: JSX.Element; label: string; detail?: string };
    isSelected: boolean;
    isEditing: boolean;
    initialCursorIndex?: number;
    onClick: () => void;
    onDoubleClick: () => void;
    onSave: (val: string) => void;
}) => {
    const handleKeyDown = (e: React.KeyboardEvent) => {
        // Prevent event propagation so it doesn't trigger other shortcuts
        e.stopPropagation();
    };

    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Apply initial cursor position if provided
    useEffect(() => {
        if (isEditing && initialCursorIndex !== undefined && textareaRef.current) {
            textareaRef.current.setSelectionRange(initialCursorIndex, initialCursorIndex);
        }
    }, [isEditing, initialCursorIndex]);

    return (
        <div
            id={`component-${component.id}`}
            onClick={(e) => {
                e.stopPropagation(); // Prevent node selection
                onClick();
            }}
            onDoubleClick={(e) => {
                e.stopPropagation();
                onDoubleClick();
            }}
            className={`flex items-start gap-2 px-3 py-2.5 rounded-md border transition-all ${isSelected
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200'
                } ${isEditing ? 'bg-white ring-2 ring-blue-500 border-transparent cursor-text' : 'cursor-default'}`}
        >
            <span className="text-gray-600 flex-shrink-0 mt-0.5">{display.icon}</span>
            <div className="flex-1 min-w-0">
                {isEditing ? (
                    <TextareaAutosize
                        ref={textareaRef}
                        defaultValue={display.detail || ''}
                        autoFocus
                        onBlur={(e) => onSave(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onWheel={(e) => e.stopPropagation()}
                        className="w-full resize-none bg-transparent outline-none text-xs text-gray-900 leading-normal font-sans nodrag nopan nowheel thin-scrollbar"
                        minRows={1}
                        maxRows={15}
                    />
                ) : (
                    display.detail && (
                        <div className="text-xs text-gray-700 whitespace-pre-wrap leading-normal font-sans break-words">
                            {display.detail}
                        </div>
                    )
                )}
                {!display.detail && !isEditing && (
                    <div className="text-[11px] text-gray-400">Add {display.label.toLowerCase()} text</div>
                )}
            </div>
        </div>
    );
};

export const TurnNode = memo(({ id, data }: NodeProps<TurnNodeData>) => {
    const isAI = data.speaker === 'ai';
    const components = data.components || [];

    // Label editing state
    const [isEditingLabel, setIsEditingLabel] = useState(false);
    const [editedLabel, setEditedLabel] = useState(data.label || '');
    const labelInputRef = useRef<HTMLInputElement>(null);

    // Focus input when editing starts
    useEffect(() => {
        if (isEditingLabel && labelInputRef.current) {
            labelInputRef.current.focus();
            labelInputRef.current.select();
        }
    }, [isEditingLabel]);


    const handleLabelSave = () => {
        if (editedLabel.trim() && editedLabel !== data.label) {
            data.onLabelChange?.(editedLabel.trim());
        }
        setIsEditingLabel(false);
    };

    const handleLabelKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleLabelSave();
        } else if (e.key === 'Escape') {
            setEditedLabel(data.label || '');
            setIsEditingLabel(false);
        }
    };



    const handleNodeClick = (e: React.MouseEvent) => {
        const target = e.target as HTMLElement;
        // Only select node if clicking the header area, not input fields
        if (!target.closest('input') && !target.closest('button') && data.onSelectNode) {
            const nodeEl = e.currentTarget as HTMLElement;
            data.onSelectNode(id, nodeEl);
        }
    };

    return (
        <div
            id={`node-${data.label}`}
            className={`bg-white rounded-lg border shadow-sm w-[320px] transition-colors cursor-default ${data.isSelected ? 'border-blue-500' : 'border-gray-300'
                }`}
        >
            {/* Input Handle */}
            <Handle
                type="target"
                position={Position.Top}
                className="!bg-gray-400 !w-3 !h-3 !border-2 !border-white"
            />

            {/* Header - Now white with more padding */}
            <div
                className="px-4 py-3 border-b border-gray-200 cursor-default"
                onClick={handleNodeClick}
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
                                    className="w-full h-full flex items-center px-2 text-base font-semibold text-gray-900 truncate rounded transition-colors cursor-default"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsEditingLabel(true);
                                    }}
                                    title="Click to edit"
                                >
                                    {data.label || 'Untitled'}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Phase Badge (Display Only) */}
                    {data.phase && (
                        <div className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium flex-shrink-0">
                            {formatPhase(data.phase)}
                        </div>
                    )}

                    {/* Lock Icon */}
                    {data.locked && (
                        <span className="text-amber-500 text-xs flex-shrink-0">🔒</span>
                    )}
                </div>
            </div>

            {/* Component List - Card style with spacing */}
            <div className="p-3 space-y-2">
                {components.map((component) => {
                    const display = getComponentDisplay(component);
                    return (
                        <SimpleComponentCard
                            key={component.id}
                            component={component}
                            display={display}
                            isSelected={data.selectedComponentId === component.id}
                            isEditing={data.editingComponentId === component.id}
                            initialCursorIndex={data.initialCursorIndex}
                            onClick={() => {
                                const el = document.getElementById(`component-${component.id}`);
                                if (data.onSelectComponent) {
                                    data.onSelectComponent(id, component.id, el || document.body);
                                }
                            }}
                            onDoubleClick={() => {
                                if ((component.type === 'message' || component.type === 'prompt') && data.onSetEditingComponent) {
                                    // Capture cursor position from current selection
                                    let cursorIndex = undefined;
                                    try {
                                        const selection = window.getSelection();
                                        if (selection && selection.anchorNode && selection.anchorNode.parentElement) {
                                            // The anchorOffset is relative to the text node
                                            cursorIndex = selection.anchorOffset;
                                        }
                                    } catch (e) {
                                        // Ignore selection errors
                                    }
                                    data.onSetEditingComponent(id, component.id, cursorIndex);
                                }
                            }}
                            onSave={(newText) => {
                                if (data.onComponentUpdate && data.onSetEditingComponent) {
                                    data.onComponentUpdate(component.id, {
                                        content: { ...component.content, text: newText }
                                    });
                                    data.onSetEditingComponent(id, null);
                                }
                            }}
                        />
                    );
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
