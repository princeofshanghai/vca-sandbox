import React, { useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';
import {
    ReactFlowProvider,
    useNodesState,
    useEdgesState,
    addEdge,
    Connection,
    Node,
    Edge,
    ReactFlowInstance,
} from '@xyflow/react';
import { nanoid } from 'nanoid';

import { Sidebar } from './Sidebar';
import { Canvas } from './Canvas';
import { PropertiesPanel } from './PropertiesPanel';
import { PreviewModal } from './PreviewModal';
import { compileFlow } from '@/utils/flowCompiler';
import { Flow } from '@/utils/flowEngine';

const initialNodes: Node[] = [
    {
        id: 'start',
        type: 'start',
        position: { x: 250, y: 50 },
        data: { label: 'Start' }
    },
    {
        id: '1',
        type: 'message',
        position: { x: 250, y: 150 },
        data: { label: 'Welcome Message', content: 'Hello! How can I help you today?' }
    },
];

export const FlowBuilder = () => {
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
    const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);

    // Preview State
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [compiledFlow, setCompiledFlow] = useState<Flow | null>(null);

    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge(params, eds)),
        [setEdges],
    );

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();

            const type = event.dataTransfer.getData('application/reactflow');

            // check if the dropped element is valid
            if (typeof type === 'undefined' || !type) {
                return;
            }

            const position = reactFlowInstance?.screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            const newNode: Node = {
                id: nanoid(),
                type,
                position: position || { x: 0, y: 0 },
                data: { label: `New ${type}`, content: '' },
            };

            setNodes((nds) => nds.concat(newNode));
        },
        [reactFlowInstance, setNodes],
    );

    const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
        setSelectedNode(node);
    }, []);

    const onNodeDataChange = useCallback((id: string, newData: Record<string, unknown>) => {
        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === id) {
                    // Update the selected node state as well so the panel reflects changes immediately
                    const updatedNode = { ...node, data: newData };
                    if (selectedNode?.id === id) {
                        setSelectedNode(updatedNode);
                    }
                    return updatedNode;
                }
                return node;
            })
        );
    }, [setNodes, selectedNode]);

    const onPlay = useCallback(() => {
        const flow = compileFlow(nodes, edges);
        setCompiledFlow(flow);
        setIsPreviewOpen(true);
    }, [nodes, edges]);

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] w-full bg-gray-50">
            <div className="h-14 bg-white border-b border-gray-200 px-4 flex items-center justify-between">
                <h1 className="text-sm font-semibold text-gray-900">Flow Builder</h1>
                <Button
                    onClick={onPlay}
                    className="gap-2"
                >
                    <Play size={16} className="fill-current" />
                    Play Flow
                </Button>
            </div>
            <div className="flex flex-1 overflow-hidden">
                <ReactFlowProvider>
                    <Sidebar />
                    <div className="flex-1 h-full" ref={reactFlowWrapper}>
                        <Canvas
                            nodes={nodes}
                            edges={edges}
                            onNodesChange={onNodesChange}
                            onEdgesChange={onEdgesChange}
                            onConnect={onConnect}
                            onInit={setReactFlowInstance}
                            onDrop={onDrop}
                            onDragOver={onDragOver}
                            onNodeClick={onNodeClick}
                        />
                    </div>
                    <PropertiesPanel
                        selectedNode={selectedNode}
                        onNodeChange={onNodeDataChange}
                    />
                </ReactFlowProvider>
            </div>

            <PreviewModal
                isOpen={isPreviewOpen}
                onClose={() => setIsPreviewOpen(false)}
                flowData={compiledFlow}
            />
        </div>
    );
};
