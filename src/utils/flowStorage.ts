import { Flow } from '../views/studio/types';

const METADATA_KEY = 'vca-flows-metadata';
const FOLDERS_KEY = 'vca-folders';
const FLOW_PREFIX = 'vca-flow-';

export interface Folder {
    id: string;
    name: string;
    createdAt: number;
}

export interface FlowMetadata {
    id: string;
    title: string;
    lastModified: number;
    previewText?: string;
    description?: string;
    folderId?: string;
    entryPoint?: string;
}

export const INITIAL_FLOW: Flow = {
    id: 'initial',
    title: 'New Conversation',
    settings: {
        showDisclaimer: true,
        simulateThinking: true,
        entryPoint: 'custom',
        productName: 'LinkedIn'
    },
    lastModified: Date.now(),
    steps: [
        {
            id: 'start-1',
            type: 'start',
            position: { x: 50, y: 50 }
        },
        {
            id: 'welcome-1',
            type: 'turn',
            speaker: 'ai',
            phase: 'welcome',
            label: 'Welcome Message',
            locked: true,
            position: { x: 250, y: 50 },
            components: [
                {
                    id: 'c1',
                    type: 'message',
                    content: { text: 'Hi there! I can help you with your account.' }
                },
                {
                    id: 'c2',
                    type: 'prompt',
                    content: { text: 'Remove a user', showAiIcon: false }
                }
            ]
        },
        {
            id: 'user-1',
            type: 'user-turn',
            label: "User selects 'Remove a user'",
            inputType: 'prompt',
            triggerValue: 'Remove a user',
            position: { x: 250, y: 350 }
        }
    ],
    connections: [
        {
            id: 'e-start',
            source: 'start-1',
            target: 'welcome-1'
        },
        {
            id: 'e1',
            source: 'welcome-1',
            target: 'user-1'
        }
    ],
    blocks: [] // Legacy field kept empty
};

export const flowStorage = {
    getAllFolders: (): Folder[] => {
        try {
            const stored = localStorage.getItem(FOLDERS_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            console.error('Failed to load folders', e);
            return [];
        }
    },

    createFolder: (name: string) => {
        const folders = flowStorage.getAllFolders();
        const newFolder: Folder = {
            id: crypto.randomUUID(),
            name,
            createdAt: Date.now()
        };
        folders.push(newFolder);
        localStorage.setItem(FOLDERS_KEY, JSON.stringify(folders));
        return newFolder;
    },

    deleteFolder: (id: string) => {
        // 1. Delete folder
        const folders = flowStorage.getAllFolders();
        const filtered = folders.filter(f => f.id !== id);
        localStorage.setItem(FOLDERS_KEY, JSON.stringify(filtered));

        // 2. Move contents to root (remove folderId)
        const flows = flowStorage.getAllFlows();
        let changed = false;
        flows.forEach(f => {
            if (f.folderId === id) {
                delete f.folderId;
                changed = true;
            }
        });
        if (changed) {
            localStorage.setItem(METADATA_KEY, JSON.stringify(flows));
        }
    },

    getAllFlows: (): FlowMetadata[] => {
        try {
            const stored = localStorage.getItem(METADATA_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            console.error('Failed to load flows metadata', e);
            return [];
        }
    },

    getFlow: (id: string): Flow | null => {
        try {
            const stored = localStorage.getItem(`${FLOW_PREFIX}${id}`);
            if (!stored) return null;

            const flow = JSON.parse(stored) as Flow;

            // Simple Migration: Ensure all blocks have a phase
            // If strictly missing, default to 'action' (safe catch-all)
            // In a real app we might try to infer based on position, but this is safe.
            if (flow.blocks) {
                flow.blocks = flow.blocks.map(b => ({
                    ...b,
                    phase: b.phase || 'action'
                }));
            }

            return flow;
        } catch (e) {
            console.error(`Failed to load flow ${id}`, e);
            return null;
        }
    },

    saveFlow: (flow: Flow & { folderId?: string }) => {
        try {
            const metadata = flowStorage.getAllFlows();
            const index = metadata.findIndex(m => m.id === flow.id);

            // Preserve existing folderId if not specified in update, or update it if provided
            const existingMeta = index >= 0 ? metadata[index] : null;

            let finalFolderId = existingMeta?.folderId;
            if (flow.folderId !== undefined) {
                finalFolderId = flow.folderId;
            }

            const newMeta: FlowMetadata = {
                id: flow.id,
                title: flow.title,
                lastModified: Date.now(),
                previewText: getPreviewText(flow.blocks[0]),
                folderId: finalFolderId,
                entryPoint: flow.settings?.entryPoint
            };

            if (index >= 0) {
                metadata[index] = newMeta;
            } else {
                metadata.push(newMeta);
            }

            localStorage.setItem(METADATA_KEY, JSON.stringify(metadata));
            localStorage.setItem(`${FLOW_PREFIX}${flow.id}`, JSON.stringify(flow));
        } catch (e) {
            console.error('Failed to save flow', e);
        }
    },

    moveFlowToFolder: (flowId: string, folderId?: string) => {
        const flows = flowStorage.getAllFlows();
        const flow = flows.find(f => f.id === flowId);
        if (flow) {
            if (folderId) {
                flow.folderId = folderId;
            } else {
                delete flow.folderId;
            }
            localStorage.setItem(METADATA_KEY, JSON.stringify(flows));
        }
    },

    createFlow: (folderId?: string): string => {
        const id = crypto.randomUUID();
        const newFlow: Flow & { folderId?: string } = {
            ...INITIAL_FLOW,
            id,
            title: 'Untitled Conversation',
            lastModified: Date.now(),
            folderId
        };
        flowStorage.saveFlow(newFlow);
        return id;
    },

    deleteFlow: (id: string) => {
        const metadata = flowStorage.getAllFlows();
        const filtered = metadata.filter(m => m.id !== id);
        localStorage.setItem(METADATA_KEY, JSON.stringify(filtered));
        localStorage.removeItem(`${FLOW_PREFIX}${id}`);
    }
};

function getPreviewText(block?: import('../views/studio/types').Block): string | undefined {
    if (!block) return undefined;
    if (block.type === 'ai') {
        const content = block.content;
        // Determine preview based on variant using type guards or loose checks
        if ('text' in content) return content.text;
        if ('title' in content) return content.title;
        if ('loadingTitle' in content) return content.loadingTitle;
        return 'System Message';
    }
    if (block.type === 'user') {
        return block.content;
    }
    return undefined;
}
