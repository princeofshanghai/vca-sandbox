import { Flow, Block } from '../views/studio/types';
import { supabase } from '@/lib/supabase';

// Types remain mostly the same
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
    isPublic?: boolean;
    deletedAt?: number | null;
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
    blocks: []
};

// Async Storage Service
export const flowStorage = {
    getAllFolders: async (): Promise<Folder[]> => {
        const user = (await supabase.auth.getUser()).data.user;
        if (!user) return [];

        const { data, error } = await supabase
            .from('folders')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching folders:', error);
            return [];
        }

        return data.map(d => ({
            id: d.id,
            name: d.name,
            createdAt: new Date(d.created_at).getTime()
        }));
    },

    createFolder: async (name: string): Promise<Folder | null> => {
        const user = (await supabase.auth.getUser()).data.user;
        if (!user) return null;

        const { data, error } = await supabase
            .from('folders')
            .insert({ name, user_id: user.id })
            .select()
            .single();

        if (error || !data) {
            console.error('Error creating folder:', error);
            return null;
        }

        return {
            id: data.id,
            name: data.name,
            createdAt: new Date(data.created_at).getTime()
        };
    },

    deleteFolder: async (id: string) => {
        // First, update flows to remove folder_id (Supabase might handle this with cascade or set null, but explicit is safe)
        // Actually, let's just delete the folder. If we didn't set up ON DELETE CASCADE, flows might error or stick around.
        // We will assume "orphan" flows just become "All" flows (folder_id = null).
        // Let's manually set folder_id to null for contained flows first.
        await supabase.from('flows').update({ folder_id: null }).eq('folder_id', id);

        const { error } = await supabase.from('folders').delete().eq('id', id);
        if (error) console.error('Error deleting folder:', error);
    },

    renameFolder: async (id: string, newName: string) => {
        const { error } = await supabase.from('folders').update({ name: newName }).eq('id', id);
        if (error) console.error('Error renaming folder:', error);
    },

    moveFlowToFolder: async (flowId: string, folderId: string | null) => {
        const { error } = await supabase.from('flows').update({ folder_id: folderId }).eq('id', flowId);
        if (error) console.error('Error moving flow to folder:', error);
    },

    getAllFlows: async (): Promise<FlowMetadata[]> => {
        const user = (await supabase.auth.getUser()).data.user;
        if (!user) return [];

        const { data, error } = await supabase
            .from('flows')
            .select('id, title, updated_at, folder_id, metadata, is_public, deleted_at')
            .eq('user_id', user.id)
            .order('updated_at', { ascending: false });

        if (error) {
            console.error('Error fetching flows:', error);
            return [];
        }

        return data.map(d => ({
            id: d.id,
            title: d.title,
            lastModified: new Date(d.updated_at).getTime(),
            folderId: d.folder_id,
            previewText: d.metadata?.previewText,
            entryPoint: d.metadata?.entryPoint,
            isPublic: d.is_public,
            deletedAt: d.deleted_at ? new Date(d.deleted_at).getTime() : null
        }));
    },

    getFlow: async (id: string): Promise<Flow | null> => {
        const { data, error } = await supabase
            .from('flows')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !data) {
            console.error(`Error fetching flow ${id}:`, error);
            return null;
        }

        // Merge content and metadata back into Flow object
        const flow: Flow = {
            id: data.id,
            title: data.title,
            lastModified: new Date(data.updated_at).getTime(),
            settings: data.content?.settings || INITIAL_FLOW.settings,
            steps: data.content?.steps || [],
            connections: data.content?.connections || [],
            blocks: data.content?.blocks || []
        };

        // Migration: Ensure phase exists on blocks (same logic as before)
        if (flow.blocks) {
            flow.blocks = flow.blocks.map(b => ({
                ...b,
                phase: b.phase || 'action'
            }));
        }

        return flow;
    },

    saveFlow: async (flow: Flow & { folderId?: string }) => {
        const user = (await supabase.auth.getUser()).data.user;
        if (!user) {
            console.error('Cannot save flow: User not logged in');
            return;
        }

        // Prepare data for DB
        const content = {
            settings: flow.settings,
            steps: flow.steps,
            connections: flow.connections,
            blocks: flow.blocks
        };

        const metadata = {
            previewText: getPreviewText(flow.blocks?.[0]),
            entryPoint: flow.settings?.entryPoint
        };

        const payload = {
            title: flow.title,
            content,
            metadata,
            updated_at: new Date().toISOString(),
            user_id: user.id,
        };


        const finalPayload = { ...payload, folder_id: flow.folderId };

        // Upsert
        const { error } = await supabase
            .from('flows')
            .upsert({ id: flow.id, ...finalPayload })
            .select();

        if (error) console.error('Error saving flow:', error);
    },

    createFlow: async (folderId?: string): Promise<string | null> => {
        const user = (await supabase.auth.getUser()).data.user;
        if (!user) return null;

        const newFlowContent = {
            settings: INITIAL_FLOW.settings,
            steps: INITIAL_FLOW.steps,
            connections: INITIAL_FLOW.connections,
            blocks: []
        };

        const { data, error } = await supabase
            .from('flows')
            .insert({
                title: 'Untitled Conversation',
                user_id: user.id,
                folder_id: folderId || null,
                content: newFlowContent,
                metadata: { previewText: 'System Message' }
            })
            .select()
            .single();

        if (error || !data) {
            console.error('Error creating flow:', error);
            return null;
        }

        return data.id;
    },

    deleteFlow: async (id: string, permanent: boolean = false) => {
        if (permanent) {
            const { error } = await supabase.from('flows').delete().eq('id', id);
            if (error) console.error('Error permanently deleting flow:', error);
        } else {
            const { error } = await supabase
                .from('flows')
                .update({ deleted_at: new Date().toISOString() })
                .eq('id', id);
            if (error) console.error('Error soft deleting flow:', error);
        }
    },

    restoreFlow: async (id: string) => {
        const { error } = await supabase
            .from('flows')
            .update({ deleted_at: null })
            .eq('id', id);
        if (error) console.error('Error restoring flow:', error);
    }
};

function getPreviewText(block?: Block): string | undefined {
    if (!block) return undefined;
    if (block.type === 'ai') {
        const content = block.content;
        if ('text' in content) return content.text;
        if ('body' in content) return content.body;
        if ('loadingTitle' in content) return content.loadingTitle;
        return 'System Message';
    }
    if (block.type === 'user') {
        return block.content;
    }
    return undefined;
}
