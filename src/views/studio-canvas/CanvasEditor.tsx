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
import { Flow, Component, ComponentType, Turn, ComponentContent, UserTurn, Condition, Branch, Note } from '../studio/types';
import { useCallback, useMemo, useEffect, useState, useRef } from 'react';
import { SelectionState } from './types';
import { ContextToolbar } from './components/ContextToolbar';
import { FloatingToolbar } from './components/FloatingToolbar';
import { ZoomControls } from './components/ZoomControls';
import { Button } from '@/components/ui/button';
import { ActionTooltip } from './components/ActionTooltip';
import { ConnectionLine } from './components/ConnectionLine';
import { ShareDialog } from '../studio/components/ShareDialog';
import { ArrowLeft, Play, PanelRightOpen, ExternalLink, Download, Upload, FileJson } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';


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
        case 'statusCard':
            return { loadingTitle: '', successTitle: '', successDescription: '' };
        case 'selectionList':
            return {
                title: 'Select an option',
                layout: 'list',
                items: [
                    { id: '1', title: 'Option 1', subtitle: 'Description' },
                    { id: '2', title: 'Option 2', subtitle: 'Description' }
                ]
            };
        case 'checkboxGroup':
            return {
                title: 'Which options apply?',
                description: 'Select all that apply.',
                saveLabel: 'Save',
                options: [
                    { id: '1', label: 'Option 1' },
                    { id: '2', label: 'Option 2' },
                    { id: '3', label: 'Option 3' }
                ]
            };
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
    header?: React.ReactNode;
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

    const selectionRef = useRef<SelectionState | null>(selection);
    const flowRef = useRef(flow);

    useEffect(() => {
        selectionRef.current = selection;
    }, [selection]);

    useEffect(() => {
        flowRef.current = flow;
    }, [flow]);

    // Export/Import handlers
    const handleExportJSON = () => {
        // Create clean JSON export
        const exportData = {
            version: 1,
            id: flow.id,
            title: flow.title,
            description: flow.description,
            settings: flow.settings,
            steps: flow.steps,
            connections: flow.connections,
            metadata: {
                exportedAt: new Date().toISOString(),
                exportedBy: 'VCA Sandbox Studio',
            }
        };

        // Convert to JSON string
        const jsonString = JSON.stringify(exportData, null, 2);

        // Create blob and download
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;

        // Generate filename: flow-title-YYYY-MM-DD.json
        const date = new Date().toISOString().split('T')[0];
        const safeTitle = (flow.title || 'untitled-flow').toLowerCase().replace(/[^a-z0-9]+/g, '-');
        link.download = `${safeTitle}-${date}.json`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleImportJSON = () => {
        // Create file input
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/json,.json';

        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const importedData = JSON.parse(event.target?.result as string);

                    // Validate basic structure
                    if (!importedData.steps || !importedData.settings) {
                        alert('Invalid flow file format. Missing required fields.');
                        return;
                    }

                    // Update flow with imported data
                    const updatedFlow: Flow = {
                        ...flow,
                        title: importedData.title || flow.title,
                        description: importedData.description,
                        settings: importedData.settings,
                        steps: importedData.steps,
                        connections: importedData.connections || [],
                        lastModified: Date.now(),
                    };

                    onUpdateFlow(updatedFlow);

                } catch (error) {
                    console.error('Error importing flow:', error);
                    alert('Failed to import flow. Please check the file format.');
                }
            };

            reader.readAsText(file);
        };

        input.click();
    };

    const handleDeselect = useCallback(() => {
        setSelection(null);
        setSelectionAnchorEl(null);
    }, []);

    const handleSelectComponent = useCallback((nodeId: string, componentId: string, anchorEl: HTMLElement) => {
        // Keep card selection sticky so Delete consistently targets the card.
        setSelection({ type: 'component', nodeId, componentId });
        setSelectionAnchorEl(anchorEl);
    }, []);

    const handleTurnLabelChange = useCallback((nodeId: string, newLabel: string) => {
        const currentFlow = flowRef.current;
        if (!currentFlow.steps) return;
        const updatedSteps = currentFlow.steps.map(s =>
            s.id === nodeId && s.type === 'turn'
                ? { ...s, label: newLabel }
                : s
        );
        onUpdateFlow({ ...currentFlow, steps: updatedSteps, lastModified: Date.now() });
    }, [onUpdateFlow]);

    const handleTurnComponentUpdate = useCallback((nodeId: string, componentId: string, updates: Partial<Component>) => {
        const currentFlow = flowRef.current;
        if (!currentFlow.steps) return;
        const updatedSteps = currentFlow.steps.map(s => {
            if (s.id === nodeId && s.type === 'turn') {
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
        onUpdateFlow({ ...currentFlow, steps: updatedSteps, lastModified: Date.now() });
    }, [onUpdateFlow]);

    const handleTurnComponentReorder = useCallback((nodeId: string, activeComponentId: string, overComponentId: string) => {
        if (activeComponentId === overComponentId) return;

        const currentFlow = flowRef.current;
        if (!currentFlow.steps) return;

        let didReorder = false;
        const updatedSteps = currentFlow.steps.map((step) => {
            if (step.id !== nodeId || step.type !== 'turn') {
                return step;
            }

            const oldIndex = step.components.findIndex((component) => component.id === activeComponentId);
            const newIndex = step.components.findIndex((component) => component.id === overComponentId);

            if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) {
                return step;
            }

            const reorderedComponents = [...step.components];
            const [movedComponent] = reorderedComponents.splice(oldIndex, 1);
            reorderedComponents.splice(newIndex, 0, movedComponent);
            didReorder = true;

            return {
                ...step,
                components: reorderedComponents
            };
        });

        if (!didReorder) return;

        onUpdateFlow({ ...currentFlow, steps: updatedSteps, lastModified: Date.now() });
    }, [onUpdateFlow]);

    const handleUserTurnUpdate = useCallback((nodeId: string, updates: Partial<UserTurn>) => {
        const currentFlow = flowRef.current;
        if (!currentFlow.steps) return;
        const updatedSteps = currentFlow.steps.map(s =>
            s.id === nodeId && s.type === 'user-turn'
                ? { ...s, ...updates }
                : s
        );
        onUpdateFlow({ ...currentFlow, steps: updatedSteps, lastModified: Date.now() });
    }, [onUpdateFlow]);

    const handleConditionLabelChange = useCallback((nodeId: string, newLabel: string) => {
        const currentFlow = flowRef.current;
        if (!currentFlow.steps) return;
        const updatedSteps = currentFlow.steps.map(s =>
            s.id === nodeId && s.type === 'condition'
                ? { ...s, label: newLabel }
                : s
        );
        onUpdateFlow({ ...currentFlow, steps: updatedSteps, lastModified: Date.now() });
    }, [onUpdateFlow]);

    const handleConditionUpdateBranches = useCallback((nodeId: string, branches: Branch[]) => {
        const currentFlow = flowRef.current;
        if (!currentFlow.steps) return;
        const updatedSteps = currentFlow.steps.map(s =>
            s.id === nodeId && s.type === 'condition'
                ? { ...s, branches }
                : s
        );
        onUpdateFlow({ ...currentFlow, steps: updatedSteps, lastModified: Date.now() });
    }, [onUpdateFlow]);

    const handleNoteLabelChange = useCallback((nodeId: string, newLabel: string) => {
        const currentFlow = flowRef.current;
        if (!currentFlow.steps) return;
        const updatedSteps = currentFlow.steps.map(s =>
            s.id === nodeId && s.type === 'note'
                ? { ...s, label: newLabel }
                : s
        );
        onUpdateFlow({ ...currentFlow, steps: updatedSteps, lastModified: Date.now() });
    }, [onUpdateFlow]);

    const handleNoteContentChange = useCallback((nodeId: string, newContent: string) => {
        const currentFlow = flowRef.current;
        if (!currentFlow.steps) return;
        const updatedSteps = currentFlow.steps.map(s =>
            s.id === nodeId && s.type === 'note'
                ? { ...s, content: newContent }
                : s
        );
        onUpdateFlow({ ...currentFlow, steps: updatedSteps, lastModified: Date.now() });
    }, [onUpdateFlow]);

    // Convert flow steps to React Flow nodes
    const baseNodes = useMemo(() => {
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
                    entryPoint: flow.settings.entryPoint,
                    onSelectComponent: handleSelectComponent,
                    onDeselect: handleDeselect,
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
                        components: step.components,
                        entryPoint: flow.settings.entryPoint,
                        onSelectComponent: handleSelectComponent,
                        onDeselect: handleDeselect,
                        onComponentReorder: handleTurnComponentReorder,
                        onLabelChange: handleTurnLabelChange,
                        onComponentUpdate: handleTurnComponentUpdate,
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
                        onUpdate: handleUserTurnUpdate,
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
                        onLabelChange: handleConditionLabelChange,
                        onUpdateBranches: handleConditionUpdateBranches,
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
                        onLabelChange: handleNoteLabelChange,
                        onContentChange: handleNoteContentChange,
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
    }, [
        flow.blocks,
        flow.settings.entryPoint,
        flow.steps,
        handleConditionLabelChange,
        handleConditionUpdateBranches,
        handleDeselect,
        handleNoteContentChange,
        handleNoteLabelChange,
        handleSelectComponent,
        handleTurnComponentReorder,
        handleTurnComponentUpdate,
        handleTurnLabelChange,
        handleUserTurnUpdate,
    ]);

    // Create connections from flow.connections or generate from blocks
    const initialEdges = useMemo(() => {
        const edgeMarker = {
            type: MarkerType.ArrowClosed,
            color: 'rgb(var(--shell-flow-edge-marker) / 1)',
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

    const [nodes, setNodes, onNodesChange] = useNodesState(baseNodes as Node[]);
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

    // Sync node data when flow changes
    useEffect(() => {
        setNodes((currentNodes) => {
            // Create a map of current node states to preserve transient state not in 'flow'
            // (like React Flow's internal 'selected' state, or dragging position before commit)
            const currentNodeMap = new Map(currentNodes.map(n => [n.id, n]));

            return baseNodes.map(newNode => {
                const existingNode = currentNodeMap.get(newNode.id);
                if (existingNode) {
                    const existingData = existingNode.data as { selectedComponentId?: string } | undefined;
                    const nextData = newNode.type === 'turn'
                        ? {
                            ...(newNode.data as Record<string, unknown>),
                            selectedComponentId: existingData?.selectedComponentId
                        }
                        : newNode.data;

                    return {
                        ...newNode,
                        data: nextData,
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
    }, [baseNodes, setNodes]);

    // Sync selected component without rebuilding all node data
    useEffect(() => {
        const selectedNodeId = selection?.type === 'component' ? selection.nodeId : null;
        const selectedComponentId = selection?.type === 'component' ? selection.componentId : undefined;

        setNodes((currentNodes) => {
            let didChange = false;
            const nextNodes = currentNodes.map(node => {
                if (node.type !== 'turn') return node;
                const data = node.data as { selectedComponentId?: string };
                const nextSelected = node.id === selectedNodeId ? selectedComponentId : undefined;
                if (data.selectedComponentId === nextSelected) {
                    return node;
                }
                didChange = true;
                return {
                    ...node,
                    data: { ...data, selectedComponentId: nextSelected }
                };
            });

            return didChange ? nextNodes : currentNodes;
        });
    }, [selection, setNodes]);

    // Save positions when dragging stops
    const onNodeDragStop = useCallback((_: React.MouseEvent, _node: Node, nodes: Node[]) => {
        // Handle both single and multi-selection dragging by updating all dragged nodes
        // nodes array contains all nodes that serve as the drag selection
        const draggedNodes = nodes && nodes.length > 0 ? nodes : [_node];
        const draggedNodeMap = new Map(draggedNodes.map(n => [n.id, n]));

        const updatedSteps = flow.steps?.map(s => {
            const movedNode = draggedNodeMap.get(s.id);
            if (movedNode) {
                return { ...s, position: movedNode.position };
            }
            return s;
        });

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
            // auto-fill the User Turn with that prompt's text or selection item's title.
            if (connection.sourceHandle && connection.sourceHandle.startsWith('handle-')) {
                const sourceNodeId = connection.source;
                const targetNodeId = connection.target;
                const handleId = connection.sourceHandle;

                // Parse component ID from handle
                // Format: handle-{componentId} OR handle-{componentId}-{itemId}
                // We know componentId usually starts with 'component-'

                const sourceStep = flow.steps?.find(s => s.id === sourceNodeId);
                const targetStep = flow.steps?.find(s => s.id === targetNodeId);

                if (sourceStep && sourceStep.type === 'turn' && targetStep && targetStep.type === 'user-turn') {
                    // Try to find matching component
                    const component = sourceStep.components.find(c => handleId.includes(c.id));

                    if (component) {
                        let textToFill = '';

                        if (component.type === 'prompt') {
                            textToFill = (component.content as import('../studio/types').PromptContent).text;
                        } else if (component.type === 'selectionList') {
                            const listContent = component.content as import('../studio/types').SelectionListContent;
                            // Extract item ID from handle: handle-{componentId}-{itemId}
                            // The itemId is the suffix after componentId-
                            const itemId = handleId.split(`${component.id}-`)[1];
                            const item = listContent.items.find(i => i.id === itemId);
                            if (item) {
                                textToFill = item.title;
                            }
                        }

                        if (textToFill) {
                            // Valid link! Update the User Turn input type.
                            updatedSteps = flow.steps?.map(s =>
                                s.id === targetNodeId
                                    ? {
                                        ...s,
                                        label: textToFill, // Auto-fill label
                                        inputType: component.type === 'prompt' ? 'prompt' : 'button' // Selection acts like button? or text?
                                    }
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

            const target = e.target as HTMLElement | null;
            // Don't trigger if user is typing in an editable field.
            if (
                target &&
                (
                    target instanceof HTMLInputElement ||
                    target instanceof HTMLTextAreaElement ||
                    target.isContentEditable
                )
            ) {
                return;
            }

            const currentSelection = selectionRef.current;

            if (e.key === 'Escape') {
                handleDeselect();
            } else if (e.key === 'Delete' || e.key === 'Backspace') {
                // Only hijack delete if we are deleting a COMPONENT (which React Flow doesn't know about)
                if (currentSelection?.type === 'component') {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    handleDeleteSelection();
                    return;
                }
                // Otherwise let the event bubble to React Flow to handle Node deletion (single or multi)
            } else if (currentSelection?.type === 'component') {
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

        // Use capture so component-level shortcuts run before React Flow's node delete handler.
        window.addEventListener('keydown', handleKeyDown, true);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown, true);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [handleDeleteSelection, handleMoveComponentUp, handleMoveComponentDown, handleDeselect]);

    // Node Cloning Logic
    const onNodeDragStart = useCallback((event: React.MouseEvent, node: Node) => {
        if (event.altKey) {
            const originalStep = flow.steps?.find(s => s.id === node.id);
            if (!originalStep || originalStep.type === 'start') return;

            // Strategy:
            // 1. The node being dragged (Node A, original ID) becomes the "Duplicate" (moving).
            //    - It gets a new label.
            //    - It should have no connections.
            // 2. We place a NEW node (Node B, new ID) at the original position.
            //    - It keeps the original label.
            //    - It receives all of Node A's existing edges.
            //    - This keeps the original graph wiring on the node that stayed in place.

            // 1. Prepare Node B (The "Original" that stays)
            let staticOriginalClone: typeof originalStep;
            const newOriginalId = crypto.randomUUID();

            if (originalStep.type === 'turn') {
                staticOriginalClone = {
                    ...originalStep,
                    id: newOriginalId,
                    // Keep component IDs so handle-based connections remain valid.
                    components: originalStep.components.map(c => ({ ...c })),
                };
            } else if (originalStep.type === 'condition') {
                staticOriginalClone = {
                    ...originalStep,
                    id: newOriginalId,
                    // Keep branch IDs so branch-handle connections remain valid.
                    branches: originalStep.branches.map(b => ({ ...b })),
                };
            } else {
                staticOriginalClone = {
                    ...originalStep,
                    id: newOriginalId,
                };
            }

            // 2. Move Node A's edges to Node B so the dragged copy starts disconnected.
            const currentEdges = flow.connections || [];
            const finalConnections = currentEdges.map((conn) => {
                if (conn.source !== node.id && conn.target !== node.id) {
                    return conn;
                }

                return {
                    ...conn,
                    source: conn.source === node.id ? newOriginalId : conn.source,
                    target: conn.target === node.id ? newOriginalId : conn.target,
                };
            });

            // 3. Update flow
            // - Add Node B (Static Original)
            // - Rename Node A (Dragging) - happens via React Flow dragging? 
            //   No, we should update the label of the *dragged* node (originalStep) to indicate it's new?
            //   Actually, let's just mark the dragged one as "Copy".

            const updatedSteps = [...(flow.steps || [])];

            // Rename the dragged node (original ID)
            const draggedNodeIndex = updatedSteps.findIndex(s => s.id === node.id);
            if (draggedNodeIndex !== -1) {
                const nodeToUpdate = updatedSteps[draggedNodeIndex];
                if (nodeToUpdate.type !== 'start' && 'label' in nodeToUpdate) {
                    updatedSteps[draggedNodeIndex] = {
                        ...nodeToUpdate,
                        label: `${nodeToUpdate.label} (Copy)`
                    };
                }
            }

            // Add the static original
            updatedSteps.push(staticOriginalClone);

            onUpdateFlow({
                ...flow,
                steps: updatedSteps,
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

    const selectedNodeId = selection?.type === 'node' ? selection.nodeId : null;

    // Get current input type for toolbar (User Turn)
    const currentUserTurnInputType = selectedNodeId
        ? (flow.steps?.find(s => s.id === selectedNodeId && s.type === 'user-turn') as UserTurn | undefined)?.inputType
        : undefined;

    // Get current branches for toolbar (Condition Node)
    const currentBranches = selectedNodeId
        ? (flow.steps?.find(s => s.id === selectedNodeId && s.type === 'condition') as Condition | undefined)?.branches
        : undefined;

    const handleUpdateBranches = (branches: Branch[]) => {
        if (selectedNodeId) {
            const updatedSteps = flow.steps?.map(s =>
                s.id === selectedNodeId && s.type === 'condition'
                    ? { ...s, branches }
                    : s
            );
            onUpdateFlow({ ...flow, steps: updatedSteps, lastModified: Date.now() });
        }
    };

    return (
        <div className="w-full h-full flex flex-col relative bg-shell-canvas">
            {/* Header */}
            {/* Top Left Pill: Back & Title */}
            <div className="absolute top-4 left-4 z-50 flex items-center h-11 gap-1.5 bg-shell-bg px-2 rounded-xl shadow-sm border border-shell-border/70 backdrop-blur-sm">
                <ActionTooltip content="Back to dashboard">
                    <button
                        onClick={onBack}
                        className="flex items-center justify-center p-2 text-shell-muted hover:text-shell-text transition-colors rounded-md hover:bg-shell-surface"
                    >
                        <ArrowLeft size={18} />
                    </button>
                </ActionTooltip>
                <div className="h-5 w-px bg-shell-border-subtle" />
                <div className="relative inline-grid items-center min-w-[60px] max-w-[320px]">
                    <span className="invisible px-3 py-1 text-sm font-medium whitespace-pre border border-transparent col-start-1 row-start-1">
                        {flow.title || "Untitled flow"}
                    </span>
                    <input
                        value={flow.title}
                        onChange={(e) => onUpdateFlow({ ...flow, title: e.target.value, lastModified: Date.now() })}
                        className="absolute inset-0 w-full h-full font-medium text-sm text-shell-text bg-transparent hover:bg-shell-surface-subtle focus:bg-shell-bg border border-transparent focus:border-shell-accent-border rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-shell-accent/20 transition-all truncate placeholder:text-shell-muted"
                        placeholder="Untitled flow"
                    />
                </div>
            </div>

            {/* Top Right Pill: File, Run & Share */}
            <div className="absolute top-4 right-4 z-50 flex items-center h-11 gap-2 bg-shell-bg px-1.5 rounded-xl shadow-sm border border-shell-border/70 backdrop-blur-sm">
                {/* File Menu (Export/Import) */}
                <DropdownMenu>
                    <ActionTooltip content="File options">
                        <DropdownMenuTrigger asChild>
                            <button
                                className="flex items-center justify-center w-8 h-8 rounded-md transition-all text-shell-muted hover:text-shell-text hover:bg-shell-surface"
                            >
                                <FileJson size={16} />
                            </button>
                        </DropdownMenuTrigger>
                    </ActionTooltip>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={handleExportJSON} className="gap-2">
                            <Download size={14} className="text-shell-muted" />
                            Export JSON
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleImportJSON} className="gap-2">
                            <Upload size={14} className="text-shell-muted" />
                            Import JSON
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <div className="h-5 w-px bg-shell-border-subtle" />

                {/* Run Menu */}
                <DropdownMenu>
                    <ActionTooltip content="Play prototype" disabled={isPreviewActive}>
                        <DropdownMenuTrigger asChild>
                            <button
                                className={`flex items-center justify-center w-8 h-8 rounded-md transition-all group ${isPreviewActive
                                    ? "text-shell-accent-text bg-shell-accent-soft ring-1 ring-shell-accent-border"
                                    : "text-shell-muted hover:text-shell-text hover:bg-shell-surface"
                                    }`}
                            >
                                <Play size={16} fill={isPreviewActive ? "currentColor" : "none"} className="mr-[1px]" />
                            </button>
                        </DropdownMenuTrigger>
                    </ActionTooltip>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={onPreview} className="gap-2">
                            <PanelRightOpen size={14} className="text-shell-muted" />
                            Preview in canvas
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() => window.open(`/share/${flow.id}`, '_blank')}
                            className="gap-2"
                        >
                            <ExternalLink size={14} className="text-shell-muted" />
                            Open prototype
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <ShareDialog flow={flow}>
                    <Button
                        size="sm"
                        className="bg-shell-accent text-white hover:bg-shell-accent-hover border-0"
                    >
                        Share
                    </Button>
                </ShareDialog>
            </div>

            {/* Canvas Area */}
            <div className="flex-1 w-full relative overflow-hidden h-full">
                <style>{`
                    .react-flow__pane, 
                    .react-flow__selection-pane {
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
                        background-color: rgb(var(--shell-scrollbar-thumb) / 1);
                        border-radius: 3px;
                    }
                    .thin-scrollbar::-webkit-scrollbar-thumb:hover {
                        background-color: rgb(var(--shell-scrollbar-thumb-hover) / 1);
                    }
                `}</style>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    nodeTypes={nodeTypes}
                    fitView
                    fitViewOptions={{
                        padding: 0.2,
                        minZoom: 0.2,
                        maxZoom: 1,
                    }}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onNodeClick={onNodeClick}
                    onNodeDragStart={onNodeDragStart}
                    onNodesDelete={onNodesDelete}
                    onEdgesDelete={onEdgesDelete}
                    onNodeDragStop={onNodeDragStop}
                    onPaneClick={handleDeselect}
                    panOnScroll
                    selectionOnDrag
                    selectionMode={SelectionMode.Partial}
                    multiSelectionKeyCode={null}
                    panOnDrag={isAltPressed}
                    zoomOnScroll={!isAltPressed}
                    deleteKeyCode={['Delete', 'Backspace']}
                    proOptions={{ hideAttribution: true }}
                    minZoom={0.1}
                    maxZoom={2}
                    onDragOver={onDragOver}
                    onDrop={onDrop}
                    connectionLineComponent={ConnectionLine}
                    className={`bg-shell-canvas ${isAltPressed ? 'is-alt-pressed' : ''}`}
                >

                    <Background color="rgb(var(--shell-canvas-grid) / 1)" gap={20} size={2} />
                    {selectedNodeId && (
                        <ContextToolbar
                            selection={{ type: 'node', nodeId: selectedNodeId }}
                            anchorEl={selectionAnchorEl}
                            onAddComponent={(type: ComponentType) => handleComponentAdd(type)}
                            onChangeUserTurnInputType={handleChangeUserTurnInputType}
                            currentUserTurnInputType={currentUserTurnInputType}
                            currentBranches={currentBranches}
                            onUpdateBranches={handleUpdateBranches}
                            isAiTurn={flow.steps?.some(s => s.id === selectedNodeId && s.type === 'turn')}
                        />
                    )}

                    <FloatingToolbar
                        // FloatingToolbar as seen in Step 72 accepts specific callbacks
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
                    <ZoomControls />
                </ReactFlow>
            </div>
        </div>
    );
}
