import { Flow, Turn, Component } from '../views/studio/types';
import { ENTRY_POINTS, EntryPointId } from './entryPoints';

/**
 * Creates a new flow with a locked Welcome node using Turn/Component model
 * @param entryPoint - The entry point ID (admin-center, recruiter, etc.)
 * @returns A complete Flow object with Welcome Turn
 */
export function createNewFlow(entryPoint: EntryPointId): Flow {
    const entryConfig = ENTRY_POINTS[entryPoint];
    const welcomeTurnId = crypto.randomUUID();

    // Create components for the Welcome turn
    const components: Component[] = [
        // Welcome message
        {
            id: crypto.randomUUID(),
            type: 'message',
            content: {
                text: `Hi there. With the help of AI, I can answer questions about ${entryConfig.productName} or connect you to our team.`
            }
        },
        // Title/intro message for prompts
        {
            id: crypto.randomUUID(),
            type: 'message',
            content: {
                text: 'Not sure where to start? You can try:'
            }
        },
        // Individual prompt components
        ...entryConfig.defaultPrompts.map(text => ({
            id: crypto.randomUUID(),
            type: 'prompt' as const,
            content: {
                text,
                showAiIcon: false
            }
        }))
    ];

    // Create the Welcome Turn
    const welcomeTurn: Turn = {
        id: welcomeTurnId,
        type: 'turn',
        speaker: 'ai',
        phase: 'welcome',
        label: 'Standard welcome',
        components,
        position: { x: 250, y: 50 }
    };

    return {
        id: crypto.randomUUID(),
        version: 2,
        title: `New ${entryConfig.productName} Conversation`,
        description: '',
        settings: {
            showDisclaimer: false,
            simulateThinking: false,
            entryPoint,
            productName: entryConfig.productName
        },

        // NEW: Turn-based structure
        steps: [welcomeTurn],
        connections: [],
        startStepId: welcomeTurnId,

        // OLD: Keep empty blocks for backward compatibility
        blocks: [],

        lastModified: Date.now()
    };
}
