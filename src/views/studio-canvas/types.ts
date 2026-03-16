// Canvas-specific types for React Flow integration
// This file will contain types for nodes, edges, and canvas state

// Selection state for canvas interactions
export type SelectionType = 'node' | 'nodes' | 'component' | 'components' | 'branch';

export type SelectionState =
    | { type: 'node'; nodeId: string }
    | { type: 'nodes'; nodeIds: string[] }
    | { type: 'component'; nodeId: string; componentId: string }
    | { type: 'components'; nodeId: string; componentIds: string[] }
    | { type: 'branch'; nodeId: string; branchId: string };

export interface CanvasNodeCommentState {
    hasComments: boolean;
    isActive: boolean;
    isPlacementMode: boolean;
}

export { };
