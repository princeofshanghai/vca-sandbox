import { memo, useState, useRef, useEffect } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { VcaIcon } from '@/components/vca-components/icons/VcaIcon';
import { MessageSquare, SquareStack, Info, Zap, Circle, Edit3 } from 'lucide-react';
import { Component } from '../../studio/types';
import { MessageEditor } from '../components/MessageEditor';
import { PromptEditor } from '../components/PromptEditor';

interface TurnNodeData {
    speaker: 'user' | 'ai';
    phase?: string;
    label?: string;
    componentCount?: number;
    locked?: boolean;
    components?: Component[];
    onLabelChange?: (newLabel: string) => void;
    onPhaseChange?: (newPhase: string | undefined) => void;
    onComponentUpdate?: (componentId: string, updates: Partial<Component>) => void;
}

// Capitalize phase for display
const formatPhase = (phase?: string): string => {
    if (!phase) return '';
    return phase.charAt(0).toUpperCase() + phase.slice(1);
};

// Get icon and label for component type
const getComponentDisplay = (component: Component): { icon: JSX.Element; label: string; detail?: string } => {
    switch (component.type) {
        case 'message':
            const messageContent = component.content as any;
            return {
                icon: <MessageSquare className="w-4 h-4" />,
                label: 'Message',
                detail: messageContent.text || ''
            };
        case 'prompt':
            const promptContent = component.content as any;
            return {
                icon: <SquareStack className="w-4 h-4" />,
                label: 'Prompt',
                detail: promptContent.text || ''
            };
        case 'infoMessage':
            return { icon: <Info className="w-4 h-4" />, label: 'Info Message' };
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

export const TurnNode = memo(({ data }: NodeProps<TurnNodeData>) => {
    const isAI = data.speaker === 'ai';
    const components = data.components || [];

    // Label editing state
    const [isEditingLabel, setIsEditingLabel] = useState(false);
    const [editedLabel, setEditedLabel] = useState(data.label || '');
    const labelInputRef = useRef<HTMLInputElement>(null);

    // Phase dropdown state
    const [showPhaseDropdown, setShowPhaseDropdown] = useState(false);
    const phaseDropdownRef = useRef<HTMLDivElement>(null);

    // Focus input when editing starts
    useEffect(() => {
        if (isEditingLabel && labelInputRef.current) {
            labelInputRef.current.focus();
            labelInputRef.current.select();
        }
    }, [isEditingLabel]);

    // Close phase dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (phaseDropdownRef.current && !phaseDropdownRef.current.contains(event.target as Node)) {
                setShowPhaseDropdown(false);
            }
        };

        if (showPhaseDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [showPhaseDropdown]);

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

    const handlePhaseChange = (newPhase: string | undefined) => {
        data.onPhaseChange?.(newPhase);
        setShowPhaseDropdown(false);
    };

    const phaseOptions = [
        { value: undefined, label: 'No phase' },
        { value: 'welcome', label: 'Welcome' },
        { value: 'intent', label: 'Intent' },
        { value: 'info', label: 'Info' },
        { value: 'action', label: 'Action' },
    ];

    // Component editing state
    const [editingComponentId, setEditingComponentId] = useState<string | null>(null);
    const [editingAnchorEl, setEditingAnchorEl] = useState<HTMLElement | null>(null);

    const editingComponent = components.find(c => c.id === editingComponentId);

    const handleComponentClick = (component: Component, anchorEl: HTMLElement) => {
        setEditingComponentId(component.id);
        setEditingAnchorEl(anchorEl);
    };

    const handleComponentSave = (componentId: string, updates: Partial<Component>) => {
        data.onComponentUpdate?.(componentId, updates);
        setEditingComponentId(null);
        setEditingAnchorEl(null);
    };

    const handleCloseEditor = () => {
        setEditingComponentId(null);
        setEditingAnchorEl(null);
    };

    return (
        <div className="bg-white rounded-lg border border-gray-300 shadow-sm min-w-[280px] max-w-[320px] hover:border-blue-500 transition-colors">
            {/* Input Handle */}
            <Handle
                type="target"
                position={Position.Top}
                className="!bg-gray-400 !w-3 !h-3 !border-2 !border-white"
            />

            {/* Header - Now white with more padding */}
            <div className="px-4 py-3 border-b border-gray-200">
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
                                    className="w-full h-full text-sm font-medium text-gray-900 bg-white border border-blue-500 rounded px-2 outline-none"
                                    onClick={(e) => e.stopPropagation()}
                                />
                            ) : (
                                <div
                                    className="w-full h-full flex items-center px-2 text-sm font-medium text-gray-900 truncate cursor-text rounded hover:bg-gray-100 transition-colors"
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

                    {/* Phase Badge with Dropdown */}
                    <div className="relative group" ref={phaseDropdownRef}>
                        {data.phase ? (
                            // Show phase badge when set
                            <button
                                className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium flex-shrink-0 hover:bg-blue-100 transition-colors"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowPhaseDropdown(!showPhaseDropdown);
                                }}
                            >
                                {formatPhase(data.phase)}
                            </button>
                        ) : (
                            // Show + Add phase button on hover when no phase
                            <button
                                className="px-2 py-1 bg-transparent text-gray-400 rounded text-xs font-medium flex-shrink-0 opacity-0 group-hover:opacity-100 hover:bg-gray-100 hover:text-gray-600 transition-all"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowPhaseDropdown(!showPhaseDropdown);
                                }}
                            >
                                + Add phase
                            </button>
                        )}

                        {/* Dropdown Menu */}
                        {showPhaseDropdown && (
                            <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-10 min-w-[120px]">
                                {phaseOptions.filter(opt => opt.value !== undefined).map((option) => (
                                    <button
                                        key={option.value}
                                        className="w-full px-3 py-1.5 text-xs text-left hover:bg-gray-50 transition-colors"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handlePhaseChange(option.value);
                                        }}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                                {/* Show Remove option only if phase is set */}
                                {data.phase && (
                                    <>
                                        <div className="border-t border-gray-200 my-1"></div>
                                        <button
                                            className="w-full px-3 py-1.5 text-xs text-left text-red-600 hover:bg-red-50 transition-colors"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handlePhaseChange(undefined);
                                            }}
                                        >
                                            ✕ Remove phase
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

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
                        <div
                            key={component.id}
                            ref={(el) => {
                                // Store ref for popover positioning
                                if (el && component.id === editingComponentId) {
                                    setEditingAnchorEl(el);
                                }
                            }}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleComponentClick(component, e.currentTarget);
                            }}
                            className="flex items-center gap-2 px-3 py-2.5 rounded-md border border-gray-200 hover:bg-gray-50 cursor-pointer group transition-colors"
                        >
                            <span className="text-gray-600 flex-shrink-0">{display.icon}</span>
                            <div className="flex-1 min-w-0">
                                {display.detail && (
                                    <div className="text-xs text-gray-700 line-clamp-2">{display.detail}</div>
                                )}
                            </div>
                            <button
                                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 transition-opacity p-1"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleComponentClick(component, e.currentTarget.parentElement as HTMLElement);
                                }}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                            </button>
                        </div>
                    );
                })}

                {/* Add Component Button */}
                <button className="w-full px-3 py-2.5 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-md border border-dashed border-gray-300 transition-colors text-left font-medium">
                    + Add component
                </button>
            </div>

            {/* Component Editors (Rendered as Popovers) */}
            {editingComponent && editingAnchorEl && (
                <>
                    {editingComponent.type === 'message' && (
                        <MessageEditor
                            text={(editingComponent.content as any).text || ''}
                            onSave={(newText) => {
                                handleComponentSave(editingComponent.id, {
                                    content: { text: newText }
                                });
                            }}
                            onClose={handleCloseEditor}
                            anchorEl={editingAnchorEl}
                        />
                    )}
                    {editingComponent.type === 'prompt' && (
                        <PromptEditor
                            text={(editingComponent.content as any).text || ''}
                            onSave={(text) => {
                                handleComponentSave(editingComponent.id, {
                                    content: { text, showAiIcon: false }
                                });
                            }}
                            onClose={handleCloseEditor}
                            anchorEl={editingAnchorEl}
                        />
                    )}
                </>
            )}

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
