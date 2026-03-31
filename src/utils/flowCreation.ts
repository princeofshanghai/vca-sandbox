import { Flow, Turn, Component, StartNode, Connection } from '../views/studio/types';

/**
 * Creates a new flow with a start node and locked welcome turn.
 * @returns A complete Flow object with a generic starter experience
 */
export function createNewFlow(): Flow {
    const startNodeId = crypto.randomUUID();
    const welcomeTurnId = crypto.randomUUID();

    const components: Component[] = [
        {
            id: crypto.randomUUID(),
            type: 'message',
            content: {
                text: 'Hi there. With the help of AI, I can help answer your questions or connect you to our team. Not sure where to start? You can try:'
            }
        },
        {
            id: crypto.randomUUID(),
            type: 'prompt',
            content: {
                text: 'Prompt 1',
                showAiIcon: false
            }
        },
        {
            id: crypto.randomUUID(),
            type: 'prompt',
            content: {
                text: 'Prompt 2',
                showAiIcon: false
            }
        }
    ];

    const startNode: StartNode = {
        id: startNodeId,
        type: 'start',
        label: 'Flow 1',
        position: { x: 50, y: 50 }
    };

    const welcomeTurn: Turn = {
        id: welcomeTurnId,
        type: 'turn',
        speaker: 'ai',
        phase: 'welcome',
        label: 'Welcome message',
        locked: true,
        components,
        position: { x: 250, y: 50 }
    };

    const connections: Connection[] = [
        {
            id: crypto.randomUUID(),
            source: startNodeId,
            target: welcomeTurnId
        }
    ];

    return {
        id: crypto.randomUUID(),
        version: 2,
        title: 'Untitled',
        description: '',
        settings: {
            showDisclaimer: true,
            simulateThinking: true,
            showHotspots: true,
            entryPoint: 'custom',
            productName: 'LinkedIn'
        },

        steps: [startNode, welcomeTurn],
        connections,
        startStepId: startNodeId,

        blocks: [],

        lastModified: Date.now()
    };
}
