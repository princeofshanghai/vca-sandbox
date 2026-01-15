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
    folderId?: string;
}

export const INITIAL_FLOW: Flow = {
    id: 'initial',
    title: 'New Conversation',
    settings: { showDisclaimer: true, simulateThinking: false },
    lastModified: Date.now(),
    blocks: [
        {
            id: '1',
            type: 'ai',
            variant: 'message',
            content: {
                text: 'Hi there! I can help you with your account.'
            }
        }
    ]
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
            return stored ? JSON.parse(stored) : null;
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
                folderId: finalFolderId
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
