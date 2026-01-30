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
    SelectionMode,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { TurnNode } from './nodes/TurnNode';
import { UserTurnNode } from './nodes/UserTurnNode';
import { ConditionNode } from './nodes/ConditionNode';
import { StartNode } from './nodes/StartNode';
import { NoteNode } from './nodes/NoteNode';
import { Flow, Component, ComponentType, FlowPhase, Turn, ComponentContent, UserTurn, Condition, Branch, Note } from '../studio/types';
import { useCallback, useMemo, useEffect, useState, useRef } from 'react';
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
    start: StartNode,
    note: NoteNode,
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
                    entryPoint: flow.settings.entryPoint,
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
                        entryPoint: flow.settings.entryPoint,
                        selectedComponentId: selectionType === 'component' && selectionNodeId === step.id ? selectionComponentId : undefined,
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
                        onUpdate: (updates: Partial<typeof step>) => {
                            const updatedSteps = flow.steps?.map(s =>
                                s.id === step.id && s.type === 'user-turn'
                                    ? { ...s, ...updates }
                                    : s
                            );
                            onUpdateFlow({
                                ...flow,
                                steps: updatedSteps,
                                lastModified: Date.now()
                            });
                        }
                    }
                };
            } else if (step.type === 'condition') {
                // Condition node
                return {
                    id: step.id,
                    type: 'condition',
                    position: step.position || { x: 250, y: 0 },
                    data: {
                        label: step.label,
                        branches: step.branches,
                        onLabelChange: (newLabel: string) => {
                            const updatedSteps = flow.steps?.map(s =>
                                s.id === step.id && s.type === 'condition'
                                    ? { ...s, label: newLabel }
                                    : s
                            );
                            onUpdateFlow({
                                ...flow,
                                steps: updatedSteps,
                                lastModified: Date.now()
                            });
                        },
                        onUpdateBranches: (branches: import('../studio/types').Branch[]) => {
                            const updatedSteps = flow.steps?.map(s =>
                                s.id === step.id && s.type === 'condition'
                                    ? { ...s, branches }
                                    : s
                            );
                            onUpdateFlow({
                                ...flow,
                                steps: updatedSteps,
                                lastModified: Date.now()
                            });
                        }
                    },
                };
            } else if (step.type === 'note') {
                return {
                    id: step.id,
                    type: 'note',
                    position: step.position || { x: 250, y: 0 },
                    data: {
                        label: step.label,
                        content: step.content,
                        onLabelChange: (newLabel: string) => {
                            const updatedSteps = flow.steps?.map(s =>
                                s.id === step.id && s.type === 'note'
                                    ? { ...s, label: newLabel }
                                    : s
                            );
                            onUpdateFlow({
                                ...flow,
                                steps: updatedSteps,
                                lastModified: Date.now()
                            });
                        },
                        onContentChange: (newContent: string) => {
                            const updatedSteps = flow.steps?.map(s =>
                                s.id === step.id && s.type === 'note'
                                    ? { ...s, content: newContent }
                                    : s
                            );
                            onUpdateFlow({
                                ...flow,
                                steps: updatedSteps,
                                lastModified: Date.now()
                            });
                        }
                    },
                };
            } else {
                // Start Node
                return {
                    id: step.id,
                    type: 'start',
                    position: step.position || { x: 250, y: 0 },
                    data: {},
                    deletable: false, // Start node cannot be deleted
                };
            }
        });
    }, [flow, selectionType, selectionNodeId, selectionComponentId, onUpdateFlow]);

    // Create connections from flow.connections or generate from blocks
    const initialEdges = useMemo(() => {
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
                type: 'default', // Bezier curve
                markerEnd: edgeMarker,
            }));
        }

        // Fallback: generate sequential connections from blocks
        return flow.blocks.slice(0, -1).map((block, index) => ({
            id: `edge-${block.id}-${flow.blocks[index + 1].id}`,
            source: block.id,
            target: flow.blocks[index + 1].id,
            type: 'default', // Bezier curve
            markerEnd: edgeMarker,
        }));
    }, [flow.blocks, flow.connections]);

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes as Node[]);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges as Edge[]);

    // Handle node clicks natively from React Flow
    const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
        // Just Update selection state
        // React Flow handles the visual 'selected' prop automatically
        setSelection({ type: 'node', nodeId: node.id });
        setSelectionAnchorEl(event.currentTarget as HTMLElement);
    }, []);

    // Sync edges when flow model changes
    useEffect(() => {
        setEdges(initialEdges as Edge[]);
    }, [initialEdges, setEdges]);

    // Sync node data when flow changes or selection changes (to update selectedComponentId)
    useEffect(() => {
        setNodes((currentNodes) => {
            // Create a map of current node states to preserve transient state not in 'flow'
            // (like React Flow's internal 'selected' state, or dragging position before commit)
            const currentNodeMap = new Map(currentNodes.map(n => [n.id, n]));

            return initialNodes.map(newNode => {
                const existingNode = currentNodeMap.get(newNode.id);
                if (existingNode) {
                    return {
                        ...newNode,
                        // Preserve React Flow's internal state
                        selected: existingNode.selected,
                        // Optionally preserve position if currently dragging? 
                        // But 'flow' is the source of truth for position, unless we are in the middle of a drag?
                        // For now, let's respect 'newNode' (flow) for position, assuming onNodeDragStop updates flow.
                        // But strictly for 'selected', we MUST preserve it or we deselect on every data update.
                        dragging: existingNode.dragging,
                    };
                }
                return newNode;
            }) as Node[];
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
                            // Valid link! Update the User Turn input type.
                            updatedSteps = flow.steps?.map(s =>
                                s.id === targetNodeId
                                    ? { ...s, inputType: 'prompt' }
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

    // Refs for event handlers to avoid re-binding
    const selectionRef = useRef(selection);
    const flowRef = useRef(flow);

    useEffect(() => {
        selectionRef.current = selection;
    }, [selection]);

    useEffect(() => {
        flowRef.current = flow;
    }, [flow]);

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
        const currentSelection = selectionRef.current;
        const currentFlow = flowRef.current;

        if (currentSelection?.type === 'component') {
            const step = currentFlow.steps?.find(s => s.id === currentSelection.nodeId && s.type === 'turn');
            if (step && step.type === 'turn') {
                const componentIndex = step.components.findIndex(c => c.id === currentSelection.componentId);
                if (componentIndex > 0) {
                    const newComponents = [...step.components];
                    [newComponents[componentIndex - 1], newComponents[componentIndex]] =
                        [newComponents[componentIndex], newComponents[componentIndex - 1]];
                    const updatedSteps = currentFlow.steps?.map(s =>
                        s.id === currentSelection.nodeId && s.type === 'turn'
                            ? { ...s, components: newComponents }
                            : s
                    );
                    onUpdateFlow({ ...currentFlow, steps: updatedSteps, lastModified: Date.now() });
                }
            }
        }
    }, [onUpdateFlow]); // implementation uses refs

    const handleMoveComponentDown = useCallback(() => {
        const currentSelection = selectionRef.current;
        const currentFlow = flowRef.current;

        if (currentSelection?.type === 'component') {
            const step = currentFlow.steps?.find(s => s.id === currentSelection.nodeId && s.type === 'turn');
            if (step && step.type === 'turn') {
                const componentIndex = step.components.findIndex(c => c.id === currentSelection.componentId);
                if (componentIndex < step.components.length - 1) {
                    const newComponents = [...step.components];
                    [newComponents[componentIndex], newComponents[componentIndex + 1]] =
                        [newComponents[componentIndex + 1], newComponents[componentIndex]];
                    const updatedSteps = currentFlow.steps?.map(s =>
                        s.id === currentSelection.nodeId && s.type === 'turn'
                            ? { ...s, components: newComponents }
                            : s
                    );
                    onUpdateFlow({ ...currentFlow, steps: updatedSteps, lastModified: Date.now() });
                }
            }
        }
    }, [onUpdateFlow]); // implementation uses refs


    // Native React Flow delete handler (supports multi-selection)
    const onNodesDelete = useCallback((deletedNodes: Node[]) => {
        const currentFlow = flowRef.current;
        const deletedIds = new Set(deletedNodes.map(n => n.id));

        // Filter out nodes that shouldn't be deleted (e.g. Start node)
        // Note: React Flow might have already removed them from the UI, but we need to keep them in data if locked
        // However, usually we should prevent them from being selectable/deletable in the first place.
        // For now, we just proceed with the deletion from data.

        const updatedSteps = (currentFlow.steps || []).filter(s => !deletedIds.has(s.id));

        // Remove connections attached to these nodes
        const updatedConnections = (currentFlow.connections || []).filter(
            conn => !deletedIds.has(conn.source) && !deletedIds.has(conn.target)
        );

        onUpdateFlow({
            ...currentFlow,
            steps: updatedSteps,
            connections: updatedConnections,
            lastModified: Date.now()
        });

        // If the custom selection was one of the deleted nodes, clear it
        if (selectionRef.current?.type === 'node' && deletedIds.has(selectionRef.current.nodeId)) {
            handleDeselect();
        }
    }, [onUpdateFlow, handleDeselect]); // flowRef used inside

    const onEdgesDelete = useCallback((deletedEdges: Edge[]) => {
        const currentFlow = flowRef.current;
        const deletedIds = new Set(deletedEdges.map(e => e.id));

        const updatedConnections = (currentFlow.connections || []).filter(
            conn => !deletedIds.has(conn.id)
        );

        onUpdateFlow({
            ...currentFlow,
            connections: updatedConnections,
            lastModified: Date.now()
        });
    }, [onUpdateFlow]);


    const handleDeleteComponent = useCallback(() => {
        const currentSelection = selectionRef.current;
        const currentFlow = flowRef.current;

        if (currentSelection?.type === 'component') {
            const updatedSteps = currentFlow.steps?.map(s =>
                s.id === currentSelection.nodeId && s.type === 'turn'
                    ? { ...s, components: s.components.filter(c => c.id !== currentSelection.componentId) }
                    : s
            );
            onUpdateFlow({ ...currentFlow, steps: updatedSteps, lastModified: Date.now() });
            handleDeselect();
        }
    }, [onUpdateFlow, handleDeselect]);

    // Manual delete trigger (only needed for components now, or external buttons)
    const handleDeleteSelection = useCallback(() => {
        const currentSelection = selectionRef.current;
        if (currentSelection?.type === 'component') {
            handleDeleteComponent();
        }
        // For nodes, we let React Flow handle it via the Delete key -> onNodesDelete
    }, [handleDeleteComponent]);

    const [isAltPressed, setIsAltPressed] = useState(false);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Alt') setIsAltPressed(true);

            // Don't trigger if user is typing in an input
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                return;
            }

            if (e.key === 'Escape') {
                handleDeselect();
            } else if (e.key === 'Delete' || e.key === 'Backspace') {
                // Only hijack delete if we are deleting a COMPONENT (which React Flow doesn't know about)
                if (selectionRef.current?.type === 'component') {
                    e.preventDefault();
                    handleDeleteSelection();
                }
                // Otherwise let the event bubble to React Flow to handle Node deletion (single or multi)
            } else if (selectionRef.current?.type === 'component') {
                if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    handleMoveComponentUp();
                } else if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    handleMoveComponentDown();
                }
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.key === 'Alt') setIsAltPressed(false);
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [handleDeleteSelection, handleMoveComponentUp, handleMoveComponentDown, handleDeselect]);

    // Auto-naming helper
    const getIncrementedLabel = (label: string): string => {
        const match = label.match(/^(.*?)(\d+)$/);
        if (match) {
            const prefix = match[1];
            const number = parseInt(match[2], 10);
            return `${prefix}${number + 1}`;
        }
        return `${label} 2`;
    };

    // Node Cloning Logic
    const onNodeDragStart = useCallback((event: React.MouseEvent, node: Node) => {
        if (event.altKey) {
            const originalStep = flow.steps?.find(s => s.id === node.id);
            if (!originalStep || originalStep.type === 'start') return;

            // Strategy: 
            // 1. The node being dragged (Node A, original ID) becomes the "Duplicate" (moving).
            //    - It gets a new label.
            //    - It loses its connections (usually duplicates don't inherit wires).
            // 2. We place a NEW node (Node B, new ID) at the original position.
            //    - It keeps the original label.
            //    - We clone all edges from Node A to Node B.
            //    - This makes Node B effectively act as the "Original" that stayed behind.

            // 1. Prepare Node B (The "Original" that stays)
            let staticOriginalClone: typeof originalStep;
            const newOriginalId = crypto.randomUUID();

            if (originalStep.type === 'turn') {
                staticOriginalClone = {
                    ...originalStep,
                    id: newOriginalId,
                    components: originalStep.components.map(c => ({ ...c, id: crypto.randomUUID() })),
                };
            } else if (originalStep.type === 'condition') {
                staticOriginalClone = {
                    ...originalStep,
                    id: newOriginalId,
                    branches: originalStep.branches.map(b => ({ ...b, id: crypto.randomUUID() })),
                };
            } else {
                staticOriginalClone = {
                    ...originalStep,
                    id: newOriginalId,
                };
            }

            // 2. Prepare edges for Node B (Clone Node A's edges)
            const currentEdges = flow.connections || [];
            const newEdgesForStaticOriginal = currentEdges
                .filter(conn => conn.source === node.id || conn.target === node.id)
                .map(conn => ({
                    ...conn,
                    id: `edge-${Date.now()}-${Math.random()}`,
                    source: conn.source === node.id ? newOriginalId : conn.source,
                    target: conn.target === node.id ? newOriginalId : conn.target,
                }));

            // 3. Update Node A (The "Duplicate" that moves)
            // It loses edges (by not including old edges involving it) and gets a new name
            // Note: We don't need to explicitly delete edges, just returning a filtered list effectively removes them for Node A
            // BUT, for the connections array, we want to KEEP the edges for Node B, and REMOVE the edges for Node A.
            const edgesWithoutMovingNode = currentEdges.filter(conn => conn.source !== node.id && conn.target !== node.id);
            const finalConnections = [...edgesWithoutMovingNode, ...newEdgesForStaticOriginal];

            const newLabel = getIncrementedLabel(originalStep.label || 'Copy');

            const updatedSteps = flow.steps?.map(s => {
                if (s.id === node.id) {
                    // Update the Mover (Node A)
                    if (s.type === 'turn') {
                        return {
                            ...s,
                            label: newLabel,
                            components: s.components.map(c => ({ ...c, id: crypto.randomUUID() })), // Deep clone components for the mover too!
                        };
                    } else if (s.type === 'condition') {
                        return {
                            ...s,
                            label: newLabel,
                            branches: s.branches.map(b => ({ ...b, id: crypto.randomUUID() })),
                        };
                    }
                    return { ...s, label: newLabel };
                }
                return s;
            });

            // Add the Static Original (Node B)
            const finalSteps = [...(updatedSteps || []), staticOriginalClone];

            onUpdateFlow({
                ...flow,
                steps: finalSteps,
                connections: finalConnections,
                lastModified: Date.now()
            });
        }
    }, [flow, onUpdateFlow]);

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
                const aiTurnCount = (flow.steps?.filter(s => s.type === 'turn').length || 0) + 1;
                const newTurn: Turn = {
                    id: crypto.randomUUID(),
                    type: 'turn',
                    speaker: 'ai',
                    label: `AI Turn ${aiTurnCount}`,
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
            } else if (type === 'note') {
                const noteCount = (flow.steps?.filter(s => s.type === 'note').length || 0) + 1;
                const newNote: Note = {
                    id: crypto.randomUUID(),
                    type: 'note',
                    label: `Sticky note ${noteCount}`,
                    content: '',
                    position
                };
                onUpdateFlow({
                    ...flow,
                    steps: [...(flow.steps || []), newNote],
                    lastModified: Date.now()
                });
            } else if (type === 'user-turn') {
                const userTurnCount = (flow.steps?.filter(s => s.type === 'user-turn').length || 0) + 1;
                const newUserTurn: UserTurn = {
                    id: crypto.randomUUID(),
                    type: 'user-turn',
                    label: `User Turn ${userTurnCount}`,
                    inputType: 'text',
                    position
                };
                onUpdateFlow({
                    ...flow,
                    steps: [...(flow.steps || []), newUserTurn],
                    lastModified: Date.now()
                });
            } else if (type === 'condition') {
                const conditionCount = (flow.steps?.filter(s => s.type === 'condition').length || 0) + 1;
                const newCondition: Condition = {
                    id: crypto.randomUUID(),
                    type: 'condition',
                    label: `Condition ${conditionCount}`,
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
        <div className={`w-full h-full relative ${isAltPressed ? 'is-alt-pressed' : ''}`}>
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
                .is-alt-pressed .react-flow__node:hover,
                .is-alt-pressed .react-flow__node:hover * {
                    cursor: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpath fill='%23FFF' stroke='%23000' stroke-width='2' d='M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87a.5.5 0 0 0 .35-.85L6.35 2.85a.5.5 0 0 0-.85.35Z'%3E%3Cpath fill='%23000' stroke='%23FFF' stroke-width='1.5' d='M16 12a4 4 0 1 1 0 8 4 4 0 0 1 0-8Zm0 1.5a.5.5 0 0 0-.5.5v1.5H14a.5.5 0 0 0 0 1h1.5V18a.5.5 0 0 0 1 0v-1.5H18a.5.5 0 0 0 0-1h-1.5V14a.5.5 0 0 0-.5-.5Z'/%3E%3C/svg%3E") 6 3, copy !important;
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
                fitViewOptions={{ maxZoom: 1, padding: 0.2 }}
                className="bg-[#f2f1ee] !cursor-default"
                panOnScroll={true}
                panOnDrag={false}
                selectionOnDrag={true}
                zoomOnScroll={false}
                zoomOnDoubleClick={false}
                selectionMode={SelectionMode.Partial}
                panOnScrollSpeed={2.0} // Increased for snappier feel
                zoomOnPinch={true}      // FigJam-like pinch to zoom
                onDragOver={onDragOver}
                onDrop={onDrop}
                onNodeDragStart={onNodeDragStart}
                onNodeDragStop={onNodeDragStop}
                onNodesDelete={onNodesDelete}
                onEdgesDelete={onEdgesDelete}
                onConnect={onConnect}
                onNodeClick={onNodeClick}
                proOptions={{ hideAttribution: true }}
            >
                <Background
                    gap={8}
                    color="#b4b3a8"
                />
                <ZoomControls />

                <FloatingToolbar
                    onAddAiTurn={() => {
                        const aiTurnCount = (flow.steps?.filter(s => s.type === 'turn').length || 0) + 1;
                        const newTurn: Turn = {
                            id: crypto.randomUUID(),
                            type: 'turn',
                            speaker: 'ai',
                            label: `AI Turn ${aiTurnCount}`,
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
                        const userTurnCount = (flow.steps?.filter(s => s.type === 'user-turn').length || 0) + 1;
                        const newUserTurn: UserTurn = {
                            id: crypto.randomUUID(),
                            type: 'user-turn',
                            label: `User Turn ${userTurnCount}`,
                            inputType: 'text',
                            position: { x: 100, y: 100 + (flow.steps?.length || 0) * 50 }
                        };
                        onUpdateFlow({
                            ...flow,
                            steps: [...(flow.steps || []), newUserTurn],
                            lastModified: Date.now()
                        });
                    }}
                    onAddCondition={() => {
                        const conditionCount = (flow.steps?.filter(s => s.type === 'condition').length || 0) + 1;
                        const newCondition: Condition = {
                            id: crypto.randomUUID(),
                            type: 'condition',
                            label: `Condition ${conditionCount}`,
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
                    onAddNote={() => {
                        const noteCount = (flow.steps?.filter(s => s.type === 'note').length || 0) + 1;
                        const newNote: Note = {
                            id: crypto.randomUUID(),
                            type: 'note',
                            label: `Sticky note ${noteCount}`,
                            content: '',
                            position: { x: 100, y: 100 + (flow.steps?.length || 0) * 50 }
                        };
                        onUpdateFlow({
                            ...flow,
                            steps: [...(flow.steps || []), newNote],
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
                        isAiTurn={selection?.type === 'node' && flow.steps?.some(s => s.id === selection.nodeId && s.type === 'turn')}
                    />
                )}




            </ReactFlow>
        </div>
    );
}
