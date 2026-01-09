import {
    ReactFlow,
    MiniMap,
    Controls,
    Background,
    Connection,
    Edge,
    Node,
    ReactFlowInstance,
    BackgroundVariant,
    OnNodesChange,
    OnEdgesChange,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { SmartEntryNode, SmartCollectNode, SmartActionNode, SmartResponseNode, SmartFollowUpNode } from './nodes/SmartNodes';

import { MessageNode } from './nodes/MessageNode';
import { StartNode } from './nodes/StartNode';
import { OptionsNode } from './nodes/OptionsNode';
import { InputNode } from './nodes/InputNode';

const nodeTypes = {
    start: StartNode,
    message: MessageNode,
    options: OptionsNode,
    input: InputNode,
    'smart-entry': SmartEntryNode,
    'smart-collect': SmartCollectNode,
    'smart-action': SmartActionNode,
    'smart-response': SmartResponseNode,
    'smart-follow-up': SmartFollowUpNode,
};

interface CanvasProps {
    nodes: Node[];
    edges: Edge[];
    onNodesChange: OnNodesChange;
    onEdgesChange: OnEdgesChange;
    onConnect: (connection: Connection) => void;
    onInit: (instance: ReactFlowInstance) => void;
    onDrop: (event: React.DragEvent) => void;
    onDragOver: (event: React.DragEvent) => void;
    onNodeClick: (event: React.MouseEvent, node: Node) => void;
    onEdgeClick?: (event: React.MouseEvent, edge: Edge) => void;
    onPaneClick?: (event: React.MouseEvent) => void;
}

export const Canvas = ({
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onInit,
    onDrop,
    onDragOver,
    onNodeClick,
    onEdgeClick,
    onPaneClick,
}: CanvasProps) => {
    return (
        <div className="flex-1 h-full bg-gray-50">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onInit={onInit}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onNodeClick={onNodeClick}
                onEdgeClick={onEdgeClick}
                onPaneClick={onPaneClick}
                nodeTypes={nodeTypes}
                fitView
            >
                <Controls />
                <MiniMap />
                <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
            </ReactFlow>
        </div>
    );
};
