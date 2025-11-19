import { Node, Edge } from '@xyflow/react';
import { Flow, FlowStep, FlowButton } from './flowEngine';

export const compileFlow = (nodes: Node[], edges: Edge[]): Flow => {
    const steps: FlowStep[] = [];

    // 1. Find the Start Node
    const startNode = nodes.find(n => n.type === 'start');
    if (!startNode) {
        console.warn('No Start Node found');
        return { flowId: 'draft', title: 'Draft Flow', steps: [] };
    }

    // 2. Helper to find connected target node ID
    const getTargetNodeId = (sourceId: string, sourceHandle?: string) => {
        const edge = edges.find(
            e => e.source === sourceId &&
                (sourceHandle ? e.sourceHandle === sourceHandle : true)
        );
        return edge ? edge.target : undefined;
    };

    // 3. Process all nodes
    nodes.forEach(node => {
        if (node.type === 'start') return; // Skip start node itself

        const step: FlowStep = {
            id: node.id,
            type: 'ai-message', // Default
            text: (node.data.content as string) || (node.data.label as string) || '',
        };

        // Handle specific node types
        if (node.type === 'message') {
            step.type = 'ai-message';
            step.nextStep = getTargetNodeId(node.id);
        }
        else if (node.type === 'input') {
            // For now, treat input as a stopping point that waits for user
            // The FlowEngine doesn't explicitly have a 'wait-for-input' type that pauses,
            // but we can simulate it or just end the flow here for the MVP.
            // A better way: 'user-message' usually comes from the user, not the flow definition.
            // We'll make it a 'disclaimer' type just to show something different, 
            // or keep it as ai-message that says "Waiting for input..."
            step.type = 'ai-message';
            step.text = "Waiting for user input... (Input simulation not fully supported in preview yet)";
            step.nextStep = getTargetNodeId(node.id);
        }
        else if (node.type === 'options') {
            step.type = 'ai-message';
            step.text = (node.data.label as string) || 'Select an option:';

            const buttons: FlowButton[] = [];

            // Check Option A connection
            const targetA = getTargetNodeId(node.id, 'option-a');
            if (targetA) {
                buttons.push({ label: 'Option A', nextStep: targetA });
            } else {
                // Add dummy button if not connected, to show it exists
                buttons.push({ label: 'Option A', nextStep: '' });
            }

            // Check Option B connection
            const targetB = getTargetNodeId(node.id, 'option-b');
            if (targetB) {
                buttons.push({ label: 'Option B', nextStep: targetB });
            } else {
                buttons.push({ label: 'Option B', nextStep: '' });
            }

            step.buttons = buttons;
        }

        steps.push(step);
    });

    // 4. Determine the first step (connected to Start Node)
    const firstStepId = getTargetNodeId(startNode.id);

    // Reorder steps so the first one is actually first (FlowEngine starts at index 0)
    if (firstStepId) {
        const firstStepIndex = steps.findIndex(s => s.id === firstStepId);
        if (firstStepIndex > -1) {
            const [firstStep] = steps.splice(firstStepIndex, 1);
            steps.unshift(firstStep);
        }
    }

    return {
        flowId: 'custom-flow',
        title: 'Custom Flow',
        steps,
    };
};
