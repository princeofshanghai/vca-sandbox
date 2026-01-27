import {
    ReactFlow,
    Background,
    useNodesState,
    useEdgesState,
    NodeTypes,
    Node,
    Edge,
    useReactFlow,
    ReactFlowProvider,
    OnConnect,
    MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { TurnNode } from './nodes/TurnNode';
import { UserTurnNode } from './nodes/UserTurnNode';
import { ConditionNode } from './nodes/ConditionNode';
import { Flow, Component, ComponentType, FlowPhase, Turn, ComponentContent, UserTurn, Condition, Branch } from '../studio/types';
import { useCallback, useMemo, useEffect, useState } from 'react';
import { SelectionState } from './types';
import { ContextToolbar } from './components/ContextToolbar';
import { FloatingToolbar } from './components/FloatingToolbar';
import { ZoomControls } from './components/ZoomControls';
import { ArrowLeft, Play, Download } from 'lucide-react';


// Register custom node types
const nodeTypes: NodeTypes = {
    turn: TurnNode,
    'user-turn': UserTurnNode,
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
        default: {
            const exhaustiveCheck: never = type;
            throw new Error(`Unhandled component type: ${exhaustiveCheck}`);
        }
    }
};

interface CanvasEditorProps {
    flow: Flow;
    onUpdateFlow: (flow: Flow) => void;
    onBack: () => void;
    onPreview: () => void;
    isPreviewActive?: boolean;
}

export function CanvasEditor(props: CanvasEditorProps) {
    return (
        <ReactFlowProvider>
            <CanvasEditorInner {...props} />
        </ReactFlowProvider>
    );
}

function CanvasEditorInner({ flow, onUpdateFlow, onBack, onPreview, isPreviewActive }: CanvasEditorProps) {
    const { screenToFlowPosition } = useReactFlow();
    // Selection state
    const [selection, setSelection] = useState<SelectionState | null>(null);
    const [selectionAnchorEl, setSelectionAnchorEl] = useState<HTMLElement | null>(null);


    const selectionType = selection?.type;
    const selectionNodeId = selection?.nodeId;
    const selectionComponentId = selection?.type === 'component' ? selection.componentId : undefined;

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
                    onSelectNode: (nodeId: string, anchorEl: HTMLElement) => {
                        if (selectionType === 'node' && selectionNodeId === nodeId) return;
                        setSelection({ type: 'node', nodeId });
                        setSelectionAnchorEl(anchorEl);
                    },
                    onSelectComponent: (nodeId: string, componentId: string, anchorEl: HTMLElement) => {
                        // Allow re-clicking to toggle popover off
                        if (selectionType === 'component' && selectionNodeId === nodeId && selectionComponentId === componentId) {
                            setSelection(null);
                            setSelectionAnchorEl(null);
                        } else {
                            setSelection({ type: 'component', nodeId, componentId });
                            setSelectionAnchorEl(anchorEl);
                        }
                    },

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
                        phase: step.phase,
                        label: step.label,
                        componentCount: step.components.length,
                        components: step.components,
                        selectedComponentId: selectionType === 'component' && selectionNodeId === step.id ? selectionComponentId : undefined,
                        onSelectNode: (nodeId: string, anchorEl: HTMLElement) => {
                            if (selectionType === 'node' && selectionNodeId === nodeId) return;
                            setSelection({ type: 'node', nodeId });
                            setSelectionAnchorEl(anchorEl);
                        },
                        onSelectComponent: (nodeId: string, componentId: string, anchorEl: HTMLElement) => {
                            // Allow re-clicking to toggle popover off
                            if (selectionType === 'component' && selectionNodeId === nodeId && selectionComponentId === componentId) {
                                setSelection(null);
                                setSelectionAnchorEl(null);
                            } else {
                                setSelection({ type: 'component', nodeId, componentId });
                                setSelectionAnchorEl(anchorEl);
                            }
                        },
                        onDeselect: () => {
                            setSelection(null);
                            setSelectionAnchorEl(null);
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
            } else if (step.type === 'user-turn') {
                return {
                    id: step.id,
                    type: 'user-turn',
                    position: step.position || { x: 250, y: 0 },
                    data: {
                        label: step.label,
                        inputType: step.inputType || 'button', // Default key
                        triggerValue: step.triggerValue,
                        onLabelChange: (newLabel: string) => {
                            const updatedSteps = flow.steps?.map(s =>
                                s.id === step.id && s.type === 'user-turn'
                                    ? { ...s, label: newLabel }
                                    : s
                            );
                            onUpdateFlow({
                                ...flow,
                                steps: updatedSteps,
                                lastModified: Date.now()
                            });
                        },
                        onSelectNode: (nodeId: string, anchorEl: HTMLElement) => {
                            if (selectionType === 'node' && selectionNodeId === nodeId) return;
                            setSelection({ type: 'node', nodeId });
                            setSelectionAnchorEl(anchorEl);
                        }
                    }
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
                        onSelectNode: (nodeId: string, anchorEl: HTMLElement) => {
                            if (selectionType === 'node' && selectionNodeId === nodeId) return;
                            setSelection({ type: 'node', nodeId });
                            setSelectionAnchorEl(anchorEl);
                        }
                    },
                };
            }
        });
    }, [flow, selectionType, selectionNodeId, selectionComponentId, onUpdateFlow]);

    // Create connections from flow.connections or generate from blocks
    const initialEdges = useMemo(() => {
        const edgeStyle = {
            stroke: '#94a3b8', // Slate-400
            strokeWidth: 2,
        };
        const edgeMarker = {
            type: MarkerType.ArrowClosed,
            color: '#94a3b8',
        };

        // Use new connections[] if available
        if (flow.connections && flow.connections.length > 0) {
            return flow.connections.map(conn => ({
                id: conn.id,
                source: conn.source,
                sourceHandle: conn.sourceHandle,
                target: conn.target,
                targetHandle: conn.targetHandle,
                type: 'smoothstep',
                style: edgeStyle,
                markerEnd: edgeMarker,
            }));
        }

        // Fallback: generate sequential connections from blocks
        return flow.blocks.slice(0, -1).map((block, index) => ({
            id: `edge-${block.id}-${flow.blocks[index + 1].id}`,
            source: block.id,
            target: flow.blocks[index + 1].id,
            type: 'smoothstep',
            style: edgeStyle,
            markerEnd: edgeMarker,
        }));
    }, [flow.blocks, flow.connections]);

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes as Node[]);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges as Edge[]);

    // Sync edges when flow model changes
    useEffect(() => {
        setEdges(initialEdges as Edge[]);
    }, [initialEdges, setEdges]);

    // Sync node data (but preserve positions) when flow changes
    useEffect(() => {
        setNodes((currentNodes) => {
            // Create a map of current nodes for O(1) access
            const currentNodeMap = new Map(currentNodes.map(n => [n.id, n]));

            // Map over initialNodes (the source of truth) to ensure new nodes are added
            // and removed nodes are removed
            return (initialNodes as Node[]).map((newNode) => {
                const existingNode = currentNodeMap.get(newNode.id);
                if (existingNode) {
                    // Update data but keep current position
                    // We check if the 'flow' gave us a specific new position (e.g. from onDrop)
                    // If the position in flow differs significantly from 0,0 default or if it's a new node

                    // Actually, simple logic: rely on initialNodes data, but prefer existingNode potision 
                    // UNLESS initialNode position has changed (how to detect? tricky).
                    // For now, let's just use existingNode.position to prevent jumpiness on data updates,
                    // BUT if we just added it, existingNode is undefined.
                    return {
                        ...newNode,
                        position: existingNode.position, // Preserve user's drag position
                    };
                }
                // If not in current nodes, it's a new node! Return it as is.
                return newNode;
            });
        });
    }, [initialNodes, setNodes]);

    // Save positions when dragging stops
    const onNodeDragStop = useCallback((_: React.MouseEvent, node: Node) => {
        const updatedSteps = flow.steps?.map(s =>
            s.id === node.id
                ? { ...s, position: node.position }
                : s
        );
        // Only update if changed
        // (Optimization skipped for brevity, onUpdateFlow handles it)
        onUpdateFlow({ ...flow, steps: updatedSteps, lastModified: Date.now() });
    }, [flow, onUpdateFlow]);

    // Connection handler
    const onConnect: OnConnect = useCallback(
        (connection) => {
            // Update persistent flow model
            const newConnection: import('../studio/types').Connection = {
                id: `edge-${connection.source}-${connection.target}-${Date.now()}`,
                source: connection.source,
                sourceHandle: connection.sourceHandle || undefined,
                target: connection.target,
                targetHandle: connection.targetHandle || undefined
            };

            const updatedConnections = [...(flow.connections || []), newConnection];
            let updatedSteps = flow.steps;

            // SMART LINKING LOGIC:
            // If connecting from a specific prompt handle (starts with 'handle-') to a User Turn,
            // auto-fill the User Turn with that prompt's text.
            if (connection.sourceHandle && connection.sourceHandle.startsWith('handle-')) {
                const sourceNodeId = connection.source;
                const targetNodeId = connection.target;
                const componentId = connection.sourceHandle.replace('handle-', '');

                // Find the prompt text
                const sourceStep = flow.steps?.find(s => s.id === sourceNodeId);
                const targetStep = flow.steps?.find(s => s.id === targetNodeId);

                if (sourceStep && sourceStep.type === 'turn' && targetStep && targetStep.type === 'user-turn') {
                    const promptComponent = sourceStep.components.find(c => c.id === componentId);
                    if (promptComponent && promptComponent.type === 'prompt') {
                        const promptText = (promptComponent.content as import('../studio/types').PromptContent).text;
                        if (promptText) {
                            // Valid link! Update the User Turn.
                            updatedSteps = flow.steps?.map(s =>
                                s.id === targetNodeId
                                    ? { ...s, label: promptText, inputType: 'prompt' }
                                    : s
                            );
                        }
                    }
                }
            }

            onUpdateFlow({
                ...flow,
                connections: updatedConnections,
                steps: updatedSteps,
                lastModified: Date.now()
            });
        },
        [flow, onUpdateFlow]
    );

    // Selection and toolbar handlers
    const handleDeselect = useCallback(() => {
        setSelection(null);
        setSelectionAnchorEl(null);
    }, [setSelection, setSelectionAnchorEl]);

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

    const handleChangeUserTurnInputType = (inputType: 'text' | 'prompt' | 'button') => {
        if (selection?.type === 'node') {
            const updatedSteps = flow.steps?.map(s =>
                s.id === selection.nodeId && s.type === 'user-turn'
                    ? { ...s, inputType }
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



    const handleDeleteNode = useCallback(() => {
        if (selection?.type === 'node') {
            const step = flow.steps?.find(s => s.id === selection.nodeId);
            // Prevent deleting locked nodes (like Welcome)
            if (step && 'locked' in step && step.locked) {
                return;
            }

            const updatedSteps = flow.steps?.filter(s => s.id !== selection.nodeId);

            // Also remove connections attached to this node
            const updatedConnections = (flow.connections || []).filter(
                conn => conn.source !== selection.nodeId && conn.target !== selection.nodeId
            );

            onUpdateFlow({
                ...flow,
                steps: updatedSteps,
                connections: updatedConnections,
                lastModified: Date.now()
            });
            handleDeselect();
        }
    }, [selection, flow, onUpdateFlow, handleDeselect]);

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

    const handleDeleteSelection = useCallback(() => {
        if (selection?.type === 'node') {
            handleDeleteNode();
        } else if (selection?.type === 'component') {
            handleDeleteComponent();
        }
    }, [selection, handleDeleteNode, handleDeleteComponent]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Don't trigger if user is typing in an input
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                return;
            }

            if (e.key === 'Escape') {
                handleDeselect();
            } else if (e.key === 'Delete' || e.key === 'Backspace') {
                e.preventDefault();
                handleDeleteSelection();
            } else if (selection?.type === 'component') {
                if (e.key === 'ArrowUp') {
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
    }, [selection, handleDeleteSelection, handleMoveComponentUp, handleMoveComponentDown, handleDeselect]);

    // Drag and Drop handlers
    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();

            const type = event.dataTransfer.getData('application/reactflow');
            if (typeof type === 'undefined' || !type) {
                return;
            }

            const position = screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            if (type === 'turn') {
                const newTurn: Turn = {
                    id: crypto.randomUUID(),
                    type: 'turn',
                    speaker: 'ai',
                    components: [{
                        id: crypto.randomUUID(),
                        type: 'message',
                        content: getDefaultContent('message')
                    }],
                    position
                };
                onUpdateFlow({
                    ...flow,
                    steps: [...(flow.steps || []), newTurn],
                    lastModified: Date.now()
                });
            } else if (type === 'user-turn') {
                const newUserTurn: UserTurn = {
                    id: crypto.randomUUID(),
                    type: 'user-turn',
                    label: 'User selects option',
                    inputType: 'button',
                    position
                };
                onUpdateFlow({
                    ...flow,
                    steps: [...(flow.steps || []), newUserTurn],
                    lastModified: Date.now()
                });
            } else if (type === 'condition') {
                const newCondition: Condition = {
                    id: crypto.randomUUID(),
                    type: 'condition',
                    label: 'New Condition',
                    branches: [
                        { id: crypto.randomUUID(), condition: 'Yes' },
                        { id: crypto.randomUUID(), condition: 'No' },
                    ],
                    position
                };
                onUpdateFlow({
                    ...flow,
                    steps: [...(flow.steps || []), newCondition],
                    lastModified: Date.now()
                });
            }
        },
        [flow, onUpdateFlow, screenToFlowPosition]
    );

    // Get current phase for toolbar (AI Turn)
    const currentPhase = selection?.type === 'node'
        ? (flow.steps?.find(s => s.id === selection.nodeId && s.type === 'turn') as Turn | undefined)?.phase
        : undefined;

    // Get current input type for toolbar (User Turn)
    const currentUserTurnInputType = selection?.type === 'node'
        ? (flow.steps?.find(s => s.id === selection.nodeId && s.type === 'user-turn') as UserTurn | undefined)?.inputType
        : undefined;

    // Get current branches for toolbar (Condition Node)
    const currentBranches = selection?.type === 'node'
        ? (flow.steps?.find(s => s.id === selection.nodeId && s.type === 'condition') as Condition | undefined)?.branches
        : undefined;

    const handleUpdateBranches = (branches: Branch[]) => {
        if (selection?.type === 'node') {
            const updatedSteps = flow.steps?.map(s =>
                s.id === selection.nodeId && s.type === 'condition'
                    ? { ...s, branches }
                    : s
            );
            onUpdateFlow({ ...flow, steps: updatedSteps, lastModified: Date.now() });
        }
    };

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
                panOnScrollSpeed={2.0} // Increased for snappier feel
                zoomOnPinch={true}      // FigJam-like pinch to zoom
                onDragOver={onDragOver}
                onDrop={onDrop}
                onNodeDragStop={onNodeDragStop}
                onConnect={onConnect}
            >
                <Background />
                <ZoomControls />

                <FloatingToolbar
                    onAddAiTurn={() => {
                        const newTurn: Turn = {
                            id: crypto.randomUUID(),
                            type: 'turn',
                            speaker: 'ai',
                            components: [{
                                id: crypto.randomUUID(),
                                type: 'message',
                                content: getDefaultContent('message')
                            }],
                            position: { x: 100, y: 100 + (flow.steps?.length || 0) * 50 }
                        };
                        onUpdateFlow({
                            ...flow,
                            steps: [...(flow.steps || []), newTurn],
                            lastModified: Date.now()
                        });
                    }}
                    onAddUserTurn={() => {
                        const newUserTurn: UserTurn = {
                            id: crypto.randomUUID(),
                            type: 'user-turn',
                            label: 'User selects option',
                            inputType: 'button',
                            position: { x: 100, y: 100 + (flow.steps?.length || 0) * 50 }
                        };
                        onUpdateFlow({
                            ...flow,
                            steps: [...(flow.steps || []), newUserTurn],
                            lastModified: Date.now()
                        });
                    }}
                    onAddCondition={() => {
                        const newCondition: Condition = {
                            id: crypto.randomUUID(),
                            type: 'condition',
                            label: 'New Condition',
                            branches: [
                                { id: crypto.randomUUID(), condition: 'Yes' },
                                { id: crypto.randomUUID(), condition: 'No' }
                            ],
                            position: { x: 100, y: 100 + (flow.steps?.length || 0) * 50 }
                        };
                        onUpdateFlow({
                            ...flow,
                            steps: [...(flow.steps || []), newCondition],
                            lastModified: Date.now()
                        });
                    }}
                />


                {/* Context Toolbar */}
                {selection && selectionAnchorEl && (
                    <ContextToolbar
                        selection={selection}
                        onAddComponent={handleComponentAdd}
                        onChangePhase={handleChangePhase}
                        onMoveUp={handleMoveComponentUp}
                        onMoveDown={handleMoveComponentDown}
                        onDelete={handleDeleteSelection}
                        anchorEl={selectionAnchorEl}
                        currentPhase={currentPhase as FlowPhase}
                        currentUserTurnInputType={currentUserTurnInputType}
                        onChangeUserTurnInputType={handleChangeUserTurnInputType}
                        currentBranches={currentBranches}
                        onUpdateBranches={handleUpdateBranches}
                        canMoveUp={canMoveUp}
                        canMoveDown={canMoveDown}
                    />
                )}




            </ReactFlow>
        </div>
    );
}
