import {
    ReactFlow,
    Background,
    useNodesState,
    useEdgesState,
    NodeTypes,
    Node,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { TurnNode } from './nodes/TurnNode';
import { ConditionNode } from './nodes/ConditionNode';
import { Flow, Component, ComponentType, FlowPhase, Turn, ComponentContent } from '../studio/types';
import { useCallback, useMemo, useEffect, useState } from 'react';
import { SelectionState } from './types';
import { ContextToolbar } from './components/ContextToolbar';
import { AddComponentPopover } from './components/AddComponentPopover';
import { ZoomControls } from './components/ZoomControls';
import { ArrowLeft, Play, Download } from 'lucide-react';


// Register custom node types
// Register custom node types
const nodeTypes: NodeTypes = {
    turn: TurnNode,
    condition: ConditionNode,
};

// Helper function to create default content for each component type
const getDefaultContent = (type: ComponentType): ComponentContent => {
    switch (type) {
        case 'message':
            return { text: '' };
        case 'prompt':
            return { text: '', showAiIcon: false };
        case 'infoMessage':
            return { title: '', body: '', sources: [], showFeedback: true };
        case 'actionCard':
            return { loadingTitle: '', successTitle: '', successDescription: '' };
        case 'buttons':
            return { options: [] };
        case 'input':
            return { placeholder: '', validationRules: [] };
    }
};

interface CanvasEditorProps {
    flow: Flow;
    onUpdateFlow: (flow: Flow) => void;
    onBack: () => void;
    onPreview: () => void;
    isPreviewActive?: boolean;
}

export function CanvasEditor({ flow, onUpdateFlow, onBack, onPreview, isPreviewActive }: CanvasEditorProps) {
    // Selection state
    const [selection, setSelection] = useState<SelectionState | null>(null);
    const [selectionAnchorEl, setSelectionAnchorEl] = useState<HTMLElement | null>(null);
    const [editingComponent, setEditingComponent] = useState<{ nodeId: string, componentId: string, initialCursorIndex?: number } | null>(null);
    const [showAddComponent, setShowAddComponent] = useState(false);
    const [addComponentAnchorEl, setAddComponentAnchorEl] = useState<HTMLElement | null>(null);


    // Convert flow steps to React Flow nodes
    const initialNodes = useMemo(() => {
        // Use new steps[] if available, otherwise fall back to old blocks[]
        const steps = flow.steps || [];

        if (steps.length === 0) {
            // Fallback: convert old blocks to display (for backward compatibility)
            return flow.blocks.map((block, index) => ({
                id: block.id,
                type: 'turn',
                position: { x: 250, y: index * 150 },
                data: {
                    speaker: block.type as 'user' | 'ai',
                    phase: block.phase,
                    label: block.type === 'ai' && 'variant' in block
                        ? block.variant
                        : undefined,
                    componentCount: 1,
                    locked: index === 0 && block.phase === 'welcome',
                },
            }));
        }

        // Use new Turn structure
        return steps.map((step) => {
            if (step.type === 'turn') {
                return {
                    id: step.id,
                    type: 'turn',
                    position: step.position || { x: 250, y: 0 },
                    data: {
                        speaker: step.speaker,
                        phase: step.phase || 'intent',
                        label: step.label,
                        componentCount: step.components.length,
                        locked: step.locked || false,
                        components: step.components,
                        isSelected: selection?.type === 'node' && selection.nodeId === step.id,
                        selectedComponentId: selection?.type === 'component' && selection.nodeId === step.id ? selection.componentId : undefined,
                        editingComponentId: editingComponent?.nodeId === step.id ? editingComponent.componentId : undefined,
                        initialCursorIndex: editingComponent?.nodeId === step.id ? editingComponent.initialCursorIndex : undefined,
                        onSelectNode: (nodeId: string, anchorEl: HTMLElement) => {
                            if (selection?.type === 'node' && selection.nodeId === nodeId) return;
                            setSelection({ type: 'node', nodeId });
                            setSelectionAnchorEl(anchorEl);
                        },
                        onSelectComponent: (nodeId: string, componentId: string, anchorEl: HTMLElement) => {
                            if (selection?.type === 'component' && selection.nodeId === nodeId && selection.componentId === componentId) return;
                            setSelection({ type: 'component', nodeId, componentId });
                            setSelectionAnchorEl(anchorEl);
                        },
                        onSetEditingComponent: (nodeId: string, componentId: string | null, cursorIndex?: number) => {
                            if (componentId) {
                                setEditingComponent({ nodeId, componentId, initialCursorIndex: cursorIndex });
                            } else {
                                setEditingComponent(null);
                            }
                        },
                        onLabelChange: (newLabel: string) => {
                            // Update the turn label
                            const updatedSteps = flow.steps?.map(s =>
                                s.id === step.id && s.type === 'turn'
                                    ? { ...s, label: newLabel }
                                    : s
                            );
                            onUpdateFlow({
                                ...flow,
                                steps: updatedSteps,
                                lastModified: Date.now()
                            });
                        },
                        onPhaseChange: (newPhase: string | undefined) => {
                            // Update the turn phase
                            const updatedSteps = flow.steps?.map(s =>
                                s.id === step.id && s.type === 'turn'
                                    ? { ...s, phase: newPhase as FlowPhase }
                                    : s
                            );
                            onUpdateFlow({
                                ...flow,
                                steps: updatedSteps,
                                lastModified: Date.now()
                            });
                        },
                        onComponentUpdate: (componentId: string, updates: Partial<Component>) => {
                            // Update the component within the turn
                            const updatedSteps = flow.steps?.map(s => {
                                if (s.id === step.id && s.type === 'turn') {
                                    return {
                                        ...s,
                                        components: s.components.map(c =>
                                            c.id === componentId
                                                ? { ...c, ...updates }
                                                : c
                                        )
                                    };
                                }
                                return s;
                            });
                            onUpdateFlow({
                                ...flow,
                                steps: updatedSteps,
                                lastModified: Date.now()
                            });
                        },
                        onComponentAdd: (type: import('../studio/types').ComponentType) => {
                            // Create new component with default content
                            const newComponent: Component = {
                                id: `component-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                                type,
                                content: getDefaultContent(type)
                            };

                            // Add to the turn's components
                            const updatedSteps = flow.steps?.map(s => {
                                if (s.id === step.id && s.type === 'turn') {
                                    return {
                                        ...s,
                                        components: [...s.components, newComponent]
                                    };
                                }
                                return s;
                            });

                            onUpdateFlow({
                                ...flow,
                                steps: updatedSteps,
                                lastModified: Date.now()
                            });
                        },
                        onComponentDelete: (componentId: string) => {
                            // Remove component from the turn
                            const updatedSteps = flow.steps?.map(s => {
                                if (s.id === step.id && s.type === 'turn') {
                                    return {
                                        ...s,
                                        components: s.components.filter(c => c.id !== componentId)
                                    };
                                }
                                return s;
                            });

                            onUpdateFlow({
                                ...flow,
                                steps: updatedSteps,
                                lastModified: Date.now()
                            });
                        },
                        onComponentReorder: (componentIds: string[]) => {
                            // Reorder components based on new ID order
                            const updatedSteps = flow.steps?.map(s => {
                                if (s.id === step.id && s.type === 'turn') {
                                    // Create a map for quick lookup
                                    const componentMap = new Map(s.components.map(c => [c.id, c]));
                                    // Reorder based on new IDs array
                                    const reorderedComponents = componentIds
                                        .map(id => componentMap.get(id))
                                        .filter((c): c is Component => c !== undefined);

                                    return {
                                        ...s,
                                        components: reorderedComponents
                                    };
                                }
                                return s;
                            });

                            onUpdateFlow({
                                ...flow,
                                steps: updatedSteps,
                                lastModified: Date.now()
                            });
                        },
                    },
                };
            } else {
                // Condition node
                return {
                    id: step.id,
                    type: 'condition',
                    position: step.position || { x: 250, y: 0 },
                    data: {
                        label: step.label,
                        branches: step.branches,
                    },
                };
            }
        });
    }, [flow, selection, editingComponent, onUpdateFlow]);

    // Create connections from flow.connections or generate from blocks
    const initialEdges = useMemo(() => {
        // Use new connections[] if available
        if (flow.connections && flow.connections.length > 0) {
            return flow.connections.map(conn => ({
                id: conn.id,
                source: conn.source,
                sourceHandle: conn.sourceHandle,
                target: conn.target,
                type: 'smoothstep',
            }));
        }

        // Fallback: generate sequential connections from blocks
        return flow.blocks.slice(0, -1).map((block, index) => ({
            id: `edge-${block.id}-${flow.blocks[index + 1].id}`,
            source: block.id,
            target: flow.blocks[index + 1].id,
            type: 'smoothstep',
        }));
    }, [flow.blocks, flow.connections]);

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes as Node[]);
    const [edges, , onEdgesChange] = useEdgesState(initialEdges);

    // Sync node data (but preserve positions) when flow changes
    useEffect(() => {
        setNodes((currentNodes) => {
            return currentNodes.map((node) => {
                // Find corresponding node in initialNodes
                const updatedNode = (initialNodes as Node[]).find((n) => n.id === node.id);
                if (updatedNode) {
                    // Update data but keep current position
                    return {
                        ...updatedNode,
                        position: node.position, // Preserve user's drag position
                    };
                }
                return node;
            });
        });
    }, [initialNodes, setNodes]);

    // Selection and toolbar handlers
    const handleDeselect = useCallback(() => {
        setSelection(null);
        setSelectionAnchorEl(null);
    }, [setSelection, setSelectionAnchorEl]);

    const handleAddComponent = () => {
        if (selection?.type === 'node') {
            const nodeEl = document.getElementById(`node-${selection.nodeId}`);
            setAddComponentAnchorEl(nodeEl);
            setShowAddComponent(true);
        }
    };

    const handleComponentAdd = (type: ComponentType) => {
        if (selection?.type === 'node') {
            // Find the turn and add component
            const step = flow.steps?.find(s => s.id === selection.nodeId && s.type === 'turn');
            if (step && step.type === 'turn') {
                const newComponent: Component = {
                    id: `component-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    type,
                    content: getDefaultContent(type)
                };
                const updatedSteps = flow.steps?.map(s =>
                    s.id === selection.nodeId && s.type === 'turn'
                        ? { ...s, components: [...s.components, newComponent] }
                        : s
                );
                onUpdateFlow({ ...flow, steps: updatedSteps, lastModified: Date.now() });
            }
        }
        setShowAddComponent(false);
        setAddComponentAnchorEl(null);
    };

    const handleChangePhase = (phase: FlowPhase | undefined) => {
        if (selection?.type === 'node') {
            const updatedSteps = flow.steps?.map(s =>
                s.id === selection.nodeId && s.type === 'turn'
                    ? { ...s, phase }
                    : s
            );
            onUpdateFlow({ ...flow, steps: updatedSteps, lastModified: Date.now() });
        }
    };

    const handleMoveComponentUp = useCallback(() => {
        if (selection?.type === 'component') {
            const step = flow.steps?.find(s => s.id === selection.nodeId && s.type === 'turn');
            if (step && step.type === 'turn') {
                const componentIndex = step.components.findIndex(c => c.id === selection.componentId);
                if (componentIndex > 0) {
                    const newComponents = [...step.components];
                    [newComponents[componentIndex - 1], newComponents[componentIndex]] =
                        [newComponents[componentIndex], newComponents[componentIndex - 1]];
                    const updatedSteps = flow.steps?.map(s =>
                        s.id === selection.nodeId && s.type === 'turn'
                            ? { ...s, components: newComponents }
                            : s
                    );
                    onUpdateFlow({ ...flow, steps: updatedSteps, lastModified: Date.now() });
                }
            }
        }
    }, [selection, flow, onUpdateFlow]);

    const handleMoveComponentDown = useCallback(() => {
        if (selection?.type === 'component') {
            const step = flow.steps?.find(s => s.id === selection.nodeId && s.type === 'turn');
            if (step && step.type === 'turn') {
                const componentIndex = step.components.findIndex(c => c.id === selection.componentId);
                if (componentIndex < step.components.length - 1) {
                    const newComponents = [...step.components];
                    [newComponents[componentIndex], newComponents[componentIndex + 1]] =
                        [newComponents[componentIndex + 1], newComponents[componentIndex]];
                    const updatedSteps = flow.steps?.map(s =>
                        s.id === selection.nodeId && s.type === 'turn'
                            ? { ...s, components: newComponents }
                            : s
                    );
                    onUpdateFlow({ ...flow, steps: updatedSteps, lastModified: Date.now() });
                }
            }
        }
    }, [selection, flow, onUpdateFlow]);



    const handleDeleteComponent = useCallback(() => {
        if (selection?.type === 'component') {
            const updatedSteps = flow.steps?.map(s =>
                s.id === selection.nodeId && s.type === 'turn'
                    ? { ...s, components: s.components.filter(c => c.id !== selection.componentId) }
                    : s
            );
            onUpdateFlow({ ...flow, steps: updatedSteps, lastModified: Date.now() });
            handleDeselect();
        }
    }, [selection, flow, onUpdateFlow, handleDeselect]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Don't trigger if user is typing in an input
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                return;
            }

            if (e.key === 'Escape') {
                handleDeselect();
            } else if (selection?.type === 'component') {
                if (e.key === 'Delete' || e.key === 'Backspace') {
                    e.preventDefault();
                    handleDeleteComponent();
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    handleMoveComponentUp();
                } else if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    handleMoveComponentDown();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selection, handleDeleteComponent, handleMoveComponentUp, handleMoveComponentDown, handleDeselect]);

    // Get current phase for toolbar
    const currentPhase = selection?.type === 'node'
        ? (flow.steps?.find(s => s.id === selection.nodeId && s.type === 'turn') as Turn | undefined)?.phase
        : undefined;

    // Check if component can move up/down
    const canMoveUp = selection?.type === 'component' ? (() => {
        const step = flow.steps?.find(s => s.id === selection.nodeId && s.type === 'turn');
        if (step && step.type === 'turn') {
            const index = step.components.findIndex(c => c.id === selection.componentId);
            return index > 0;
        }
        return false;
    })() : false;

    const canMoveDown = selection?.type === 'component' ? (() => {
        const step = flow.steps?.find(s => s.id === selection.nodeId && s.type === 'turn');
        if (step && step.type === 'turn') {
            const index = step.components.findIndex(c => c.id === selection.componentId);
            return index < step.components.length - 1;
        }
        return false;
    })() : false;

    const handleDownload = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(flow, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `${flow.title || 'conversation'}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    return (
        <div className="w-full h-full relative">
            {/* Top Left Floating Pill */}
            <div className="absolute top-3 left-3 z-50 flex items-center bg-white rounded-full shadow-lg border border-gray-200 p-1">
                <button
                    onClick={onBack}
                    className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-full transition-colors cursor-default"
                    title="Back"
                >
                    <ArrowLeft size={18} />
                </button>
                <div className="w-px h-6 bg-gray-200 mx-1" />
                <div className="relative flex items-center min-w-[128px] max-w-[400px]">
                    {/* Ghost span for auto-sizing */}
                    <span className="px-3 py-1 text-sm font-semibold invisible whitespace-pre">
                        {flow.title || "Untitled Conversation"}
                    </span>
                    <input
                        value={flow.title}
                        onChange={(e) => onUpdateFlow({ ...flow, title: e.target.value })}
                        className="absolute inset-0 px-3 py-1 text-sm font-semibold text-gray-800 bg-transparent border-none focus:ring-0 truncate w-full"
                        placeholder="Untitled Conversation"
                    />
                </div>
            </div>

            {/* Top Right Floating Pill */}
            <div className="absolute top-3 right-3 z-50 flex items-center bg-white rounded-full shadow-lg border border-gray-200 p-1">
                <button
                    onClick={handleDownload}
                    className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-full transition-colors cursor-default"
                    title="Download JSON"
                >
                    <Download size={18} />
                </button>
                <div className="w-px h-6 bg-gray-200 mx-1" />
                <button
                    onClick={onPreview}
                    className={`flex items-center gap-2 pl-3 pr-4 py-1.5 rounded-full transition-colors text-sm font-medium cursor-default ${isPreviewActive
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'text-blue-600 hover:bg-blue-50'
                        }`}
                >
                    <Play size={16} className="fill-current" />
                    <span>Preview</span>
                </button>
            </div>
            <style>{`
                .react-flow__pane, 
                .react-flow__selection-pane,
                .cursor-default {
                    cursor: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpath fill='%23FFF' stroke='%23000' stroke-width='2' d='M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87a.5.5 0 0 0 .35-.85L6.35 2.85a.5.5 0 0 0-.85.35Z'%3E%3C/path%3E%3C/svg%3E") 6 3, auto !important;
                }
                .thin-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .thin-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .thin-scrollbar::-webkit-scrollbar-thumb {
                    background-color: #cbd5e1;
                    border-radius: 3px;
                }
                .thin-scrollbar::-webkit-scrollbar-thumb:hover {
                    background-color: #94a3b8;
                }
            `}</style>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onPaneClick={handleDeselect}
                nodeTypes={nodeTypes}
                fitView
                className="bg-gray-100 !cursor-default"
                panOnScroll={true}
                panOnDrag={false}
                selectionOnDrag={true}
                zoomOnScroll={false}
                zoomOnDoubleClick={false}
            >
                <Background />
                <ZoomControls />


                {/* Context Toolbar */}
                {selection && selectionAnchorEl && (
                    <ContextToolbar
                        selection={selection}
                        onAddComponent={handleAddComponent}
                        onChangePhase={handleChangePhase}
                        onMoveUp={handleMoveComponentUp}
                        onMoveDown={handleMoveComponentDown}
                        onDelete={handleDeleteComponent}
                        anchorEl={selectionAnchorEl}
                        currentPhase={currentPhase as FlowPhase}
                        canMoveUp={canMoveUp}
                        canMoveDown={canMoveDown}
                    />
                )}

                {/* Add Component Popover */}
                {showAddComponent && addComponentAnchorEl && (
                    <AddComponentPopover
                        onAdd={handleComponentAdd}
                        onClose={() => {
                            setShowAddComponent(false);
                            setAddComponentAnchorEl(null);
                        }}
                        anchorEl={addComponentAnchorEl}
                    />
                )}


            </ReactFlow>
        </div>
    );
}
