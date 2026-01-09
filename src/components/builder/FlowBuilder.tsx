import React, { useState, useCallback, useRef } from 'react';

import { Play, PenTool, Smartphone, Monitor } from 'lucide-react';
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


import { Sidebar } from './Sidebar';
import { Canvas } from './Canvas';
import { PropertiesPanel } from './PropertiesPanel';


import { FlowPlayer } from '@/components/preview/FlowPlayer';
import { ContainerViewport } from '@/components/vca-components/container';




const initialNodes: Node[] = [
    {
        id: '1',
        type: 'smart-entry',
        position: { x: 100, y: 100 },
        data: {
            entryPointId: 'remove-license',
            greetingConfig: {
                componentId: 'greeting',
                props: { content: "Hi! I can help you remove a license. Who is the user?" }
            }
        },
    },
    {
        id: '2',
        type: 'smart-collect',
        position: { x: 100, y: 300 },
        data: {
            collectId: 'collect-person',
            slots: [
                { id: 's1', variable: 'person', type: 'person', question: 'Who needs their license removed?' }
            ]
        },
    },
    {
        id: '3',
        type: 'smart-action',
        position: { x: 100, y: 500 },
        data: {
            actionId: 'remove_license_api',
            config: { target: '$person' } // mocked config
        },
    },
    {
        id: '4',
        type: 'smart-response',
        position: { x: 100, y: 650 },
        data: {
            component: {
                type: 'Message',
                props: {
                    content: 'Success! Use license for $person has been removed.',
                    type: 'success'
                }
            }
        },
    },
    {
        id: '5',
        type: 'smart-follow-up',
        position: { x: 100, y: 800 },
        data: {
            text: 'Is there anything else?',
            suggestions: ['Check status', 'Billing help']
        },
    }
];

const initialEdges: Edge[] = [
    { id: 'e1-2', source: '1', target: '2' },
    { id: 'e2-3', source: '2', target: '3' },
    { id: 'e3-4', source: '3', target: '4' },
    { id: 'e4-5', source: '4', target: '5' }
];

type ViewMode = 'build' | 'preview';

export const FlowBuilder = () => {
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(initialEdges);
    const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);
    const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);

    // Persistence: Load from localStorage on mount
    React.useEffect(() => {
        const savedNodes = localStorage.getItem('vca-sandbox-nodes-smart-v1');
        const savedEdges = localStorage.getItem('vca-sandbox-edges-smart-v1');

        if (savedNodes && savedEdges) {
            setNodes(JSON.parse(savedNodes));
            setEdges(JSON.parse(savedEdges));
        } else {
            setNodes(initialNodes);
            setEdges(initialEdges);
        }
    }, []);

    // Persistence: Save to localStorage on change
    React.useEffect(() => {
        if (nodes.length > 0) { // Only save if we have nodes (avoid saving empty state on initial render before load)
            localStorage.setItem('vca-sandbox-nodes-smart-v1', JSON.stringify(nodes));
            localStorage.setItem('vca-sandbox-edges-smart-v1', JSON.stringify(edges));
        }
    }, [nodes, edges]);

    // View State
    const [mode, setMode] = useState<ViewMode>('build');


    // Preview State
    const [previewViewport, setPreviewViewport] = useState<ContainerViewport>('desktop');

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

            if (!position) return;

            const newNode: Node = {
                id: `${type}-${Date.now()}`,
                type,
                position,
                data: { label: `New ${type}` },
            };

            setNodes((nds) => nds.concat(newNode));
        },
        [reactFlowInstance, setNodes],
    );

    const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
        setSelectedNode(node);
        setSelectedEdge(null); // Clear selected edge when node is clicked
    }, []);

    const onEdgeClick = useCallback((_: React.MouseEvent, edge: Edge) => {
        setSelectedEdge(edge);
        setSelectedNode(null); // Clear selected node when edge is clicked
    }, []);

    const onPaneClick = useCallback(() => {
        setSelectedNode(null);
        setSelectedEdge(null);
    }, []);

    const handleNodeChange = useCallback((id: string, data: Record<string, unknown>) => {
        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === id) {
                    // Update the selected node state as well so the panel reflects changes immediately
                    const updatedNode = { ...node, data: { ...node.data, ...data } };
                    if (selectedNode?.id === id) {
                        setSelectedNode(updatedNode);
                    }
                    return updatedNode;
                }
                return node;
            })
        );
    }, [setNodes, selectedNode]);

    const handleEdgeChange = useCallback((id: string, data: Record<string, unknown>) => {
        setEdges((eds) =>
            eds.map((edge) => {
                if (edge.id === id) {
                    const updatedEdge = { ...edge, data: { ...edge.data, ...data } };
                    if (selectedEdge?.id === id) {
                        setSelectedEdge(updatedEdge);
                    }
                    return updatedEdge;
                }
                return edge;
            })
        );
    }, [setEdges, selectedEdge]);

    const handleSwitchToPreview = useCallback(() => {
        // We no longer use 'compileFlow'. We pass the raw nodes/edges to the Smart Engine.
        // FlowPlayer will need to accept raw graph data.
        setMode('preview');
    }, []);


    return (
        <div className="flex flex-col h-full w-full bg-gray-50 relative">
            {/* Extended Toolbar / Action Bar - Floating Top Right */}
            <div className="absolute top-4 right-4 z-50 flex items-center gap-2 pointer-events-auto">
                {/* Viewport Toggle - only visible in Preview mode */}
                {mode === 'preview' && (
                    <div className="bg-white/90 backdrop-blur-sm p-1 rounded-lg border border-gray-200/50 shadow-sm flex items-center animate-in fade-in slide-in-from-right-4 duration-200">
                        <button
                            onClick={() => setPreviewViewport('desktop')}
                            className={`p-2 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${previewViewport === 'desktop'
                                ? 'bg-gray-100 text-gray-900'
                                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                                }`}
                            title="Desktop View"
                        >
                            <Monitor size={16} />
                        </button>
                        <button
                            onClick={() => setPreviewViewport('mobile')}
                            className={`p-2 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${previewViewport === 'mobile'
                                ? 'bg-gray-100 text-gray-900'
                                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                                }`}
                            title="Mobile View"
                        >
                            <Smartphone size={16} />
                        </button>
                    </div>
                )}

                {/* Primary Action Button */}
                <div className="bg-white/90 backdrop-blur-sm p-1 rounded-lg border border-gray-200/50 shadow-sm flex items-center">
                    {mode === 'build' ? (
                        <button
                            onClick={handleSwitchToPreview}
                            className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5"
                        >
                            <Play size={14} fill="currentColor" />
                            Preview
                        </button>
                    ) : (
                        <button
                            onClick={() => setMode('build')}
                            className="text-gray-500 hover:text-gray-900 hover:bg-gray-100 px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5"
                        >
                            <PenTool size={14} />
                            Exit Preview
                        </button>
                    )}
                </div>
            </div>

            {/* Content Area */}
            <div className="flex flex-1 overflow-hidden relative">
                {/* Build View */}
                <div className={`flex flex-1 h-full w-full absolute inset-0 transition-opacity duration-200 ${mode === 'build' ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none z-0'
                    }`}>
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
                                onEdgeClick={onEdgeClick}
                                onPaneClick={onPaneClick}
                            />
                        </div>
                        <PropertiesPanel
                            selectedNode={selectedNode}
                            onNodeChange={handleNodeChange}
                            selectedEdge={selectedEdge}
                            onEdgeChange={handleEdgeChange}
                        />
                    </ReactFlowProvider>
                </div>

                {/* Preview View */}
                {mode === 'preview' && (
                    <div className="absolute inset-0 z-10 bg-stone-50 animate-in fade-in duration-200">
                        <FlowPlayer
                            nodes={nodes}
                            edges={edges}
                            viewport={previewViewport}
                            onRestart={() => { }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};
