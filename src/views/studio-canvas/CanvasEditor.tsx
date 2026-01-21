import ReactFlow, {
    Controls,
    Background,
    MiniMap,
    useNodesState,
    useEdgesState,
    NodeTypes,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { TurnNode } from './nodes/TurnNode';
import { ConditionNode } from './nodes/ConditionNode';
import { Flow, Component } from '../studio/types';
import { useMemo, useEffect } from 'react';

// Register custom node types
const nodeTypes: NodeTypes = {
    turn: TurnNode,
    condition: ConditionNode,
};

interface CanvasEditorProps {
    flow: Flow;
    onUpdateFlow: (flow: Flow) => void;
}

export function CanvasEditor({ flow, onUpdateFlow }: CanvasEditorProps) {

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
                                    ? { ...s, phase: newPhase as any }
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
    }, [flow.blocks, flow.steps]);

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

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes as any);
    const [edges, , onEdgesChange] = useEdgesState(initialEdges);

    // Sync node data (but preserve positions) when flow changes
    useEffect(() => {
        setNodes((currentNodes) => {
            return currentNodes.map((node) => {
                // Find corresponding node in initialNodes
                const updatedNode = (initialNodes as any[]).find((n: any) => n.id === node.id);
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
    }, [initialNodes]);

    return (
        <div className="w-full h-full">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodeTypes={nodeTypes}
                fitView
                className="bg-gray-50"
            >
                <Background />
                <Controls />
                <MiniMap
                    nodeColor={(node) => {
                        if (node.type === 'condition') return '#fbbf24';
                        return '#3b82f6';
                    }}
                    className="!bg-white !border-gray-300"
                    style={{ width: 120, height: 80 }}
                />
            </ReactFlow>
        </div>
    );
}
