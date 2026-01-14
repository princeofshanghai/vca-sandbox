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

        // Helper to find all intents (keywords on edges)
        const getIntents = (sourceId: string) => {
            return edges
                .filter(e => e.source === sourceId && e.data?.keywords)
                .map(e => ({
                    keywords: (e.data!.keywords as string).split(',').map(k => k.trim()).filter(k => k),
                    nextStep: e.target
                }))
                .filter(intent => intent.keywords.length > 0);
        };

        const intents = getIntents(node.id);
        if (intents.length > 0) {
            step.intents = intents;
        }

        // Handle specific node types
        if (node.type === 'message') {
            step.type = 'ai-message';
            step.nextStep = getTargetNodeId(node.id);
        }
        else if (node.type === 'input') {
            // Treat input as a pause point
            step.type = 'ai-message';
            step.text = "Waiting for user input... (Try typing keywords defined on outgoing edges or just any text)";
            // Don't set step.nextStep (which causes auto-advance). 
            // Instead, create a wildcard intent for the default path.
            const defaultPath = getTargetNodeId(node.id);
            if (defaultPath) {
                step.intents = step.intents || [];
                // Add wildcard intent that catches everything
                step.intents.push({
                    keywords: ['*'],
                    nextStep: defaultPath
                });
            }
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

    // 5. Inject "Smart Start" steps (Disclaimer, Greeting, Prompts)
    // These behave as a prefix to the flow.
    // The flow waits for user input after these steps are shown.

    // We will build a chain of intro steps
    const introSteps: FlowStep[] = [];

    // A. Disclaimer
    if (startNode.data.disclaimerText) {
        introSteps.push({
            id: 'intro-disclaimer',
            type: 'disclaimer',
            text: startNode.data.disclaimerText as string
        });
    }

    // B. Greeting
    if (startNode.data.greetingText) {
        introSteps.push({
            id: 'intro-greeting',
            type: 'ai-message',
            text: startNode.data.greetingText as string
        });
    }

    // C. Initial Prompts
    if (startNode.data.initialPrompts) {
        const promptLines = (startNode.data.initialPrompts as string).split('\n').filter(line => line.trim());
        if (promptLines.length > 0) {
            introSteps.push({
                id: 'intro-prompts',
                type: 'ai-message',
                text: "Not sure where to start? You can try:",
                buttons: promptLines.map(label => ({
                    label,
                    nextStep: '' // For now, these don't lead anywhere until Keyword Simulation is added
                }))
            });
        }
    }

    // Chain the intro steps
    for (let i = 0; i < introSteps.length - 1; i++) {
        introSteps[i].nextStep = introSteps[i + 1].id;
    }

    // If we have intro steps, we prepend them to the main steps
    // And we DO NOT automatically link the last intro step to 'firstStepId'
    // because we assume the flow waits for user interaction (typing or clicking prompt)
    // after the welcome message.

    if (introSteps.length > 0) {
        steps.unshift(...introSteps);
    } else if (firstStepId) {
        // Fallback: If no smart start data, behave like legacy (start -> node 1)
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
