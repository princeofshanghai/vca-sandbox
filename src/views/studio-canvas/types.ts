// Canvas-specific types for React Flow integration
// This file will contain types for nodes, edges, and canvas state

// Selection state for canvas interactions
export type SelectionType = 'node' | 'component';

export type SelectionState =
    | { type: 'node'; nodeId: string }
    | { type: 'component'; nodeId: string; componentId: string };

export { };
