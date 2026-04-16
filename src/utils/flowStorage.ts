import { Flow, Block } from '../views/studio/types';
import { supabase } from '@/lib/supabase';
import { normalizeFlowStartNodes } from '@/views/studio/startNodes';

const THUMBNAIL_BUCKET = 'flow-thumbnails';
let hasLoggedThumbnailBucketIssue = false;

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
    thumbnailPath?: string;
    thumbnailUrl?: string;
    thumbnailUnavailable?: boolean;
    isPublic?: boolean;
    deletedAt?: number | null;
    ownerUserId?: string;
    ownerDisplayName?: string;
    isShared?: boolean;
}

export const INITIAL_FLOW: Flow = {
    id: 'initial',
    title: 'New Conversation',
    settings: {
        showDisclaimer: true,
        simulateThinking: true,
        showHotspots: true,
        entryPoint: 'custom',
        productName: 'LinkedIn'
    },
    lastModified: Date.now(),
    steps: [
        {
            id: 'start-1',
            type: 'start',
            label: 'Flow 1',
            position: { x: 50, y: 50 }
        },
        {
            id: 'welcome-1',
            type: 'turn',
            speaker: 'ai',
            phase: 'welcome',
            label: 'Welcome message',
            locked: true,
            position: { x: 250, y: 50 },
            components: [
                {
                    id: 'c1',
                    type: 'message',
                    content: {
                        text: 'Hi there. With the help of AI, I can help answer your questions or connect you to our team. Not sure where to start? You can try:'
                    }
                },
                {
                    id: 'c2',
                    type: 'prompt',
                    content: { text: 'Prompt 1', showAiIcon: false }
                },
                {
                    id: 'c3',
                    type: 'prompt',
                    content: { text: 'Prompt 2', showAiIcon: false }
                }
            ]
        },
    ],
    connections: [
        {
            id: 'e-start',
            source: 'start-1',
            target: 'welcome-1'
        }
    ],
    startStepId: 'start-1',
    annotations: [],
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

        return data.map((d) => mapFlowMetadata(d, user.id));
    },

    getSharedFlows: async (): Promise<FlowMetadata[]> => {
        const user = (await supabase.auth.getUser()).data.user;
        if (!user) return [];

        const { data: collaboratorRows, error: collaboratorError } = await supabase
            .from('flow_collaborators')
            .select('flow_id')
            .eq('user_id', user.id)
            .eq('role', 'editor');

        if (collaboratorError) {
            console.error('Error fetching shared flow access:', collaboratorError);
            return [];
        }

        const flowIds = Array.from(new Set((collaboratorRows || []).map((row) => row.flow_id).filter(Boolean)));
        if (flowIds.length === 0) return [];

        const { data: sharedFlows, error: sharedFlowsError } = await supabase
            .from('flows')
            .select('id, title, updated_at, folder_id, metadata, is_public, deleted_at, user_id')
            .in('id', flowIds)
            .order('updated_at', { ascending: false });

        if (sharedFlowsError) {
            console.error('Error fetching shared flows:', sharedFlowsError);
            return [];
        }

        const ownerIds = Array.from(
            new Set(
                (sharedFlows || [])
                    .map((flowRow) => flowRow.user_id)
                    .filter((ownerId): ownerId is string => typeof ownerId === 'string' && ownerId !== user.id)
            )
        );

        let ownerProfiles = new Map<string, string>();
        if (ownerIds.length > 0) {
            const { data: profiles, error: profilesError } = await supabase
                .from('profiles')
                .select('user_id, display_name')
                .in('user_id', ownerIds);

            if (profilesError) {
                console.error('Error fetching shared flow owners:', profilesError);
            } else {
                ownerProfiles = new Map(
                    (profiles || [])
                        .filter((profile) => typeof profile.user_id === 'string')
                        .map((profile) => [profile.user_id, profile.display_name || 'Shared project'])
                );
            }
        }

        return (sharedFlows || [])
            .filter((flowRow) => flowRow.user_id !== user.id)
            .map((flowRow) => mapFlowMetadata(flowRow, user.id, ownerProfiles));
    },

    getFlowThumbnailUrl: async (thumbnailPath: string): Promise<string | undefined> => {
        return getSignedThumbnailUrl(thumbnailPath);
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
            is_public: data.is_public,
            settings: data.content?.settings || INITIAL_FLOW.settings,
            steps: data.content?.steps || [],
            connections: data.content?.connections || [],
            startStepId: data.content?.startStepId,
            annotations: data.content?.annotations || [],
            blocks: data.content?.blocks || [],
            ownerUserId: typeof data.user_id === 'string' ? data.user_id : undefined,
            metadata: {
                previewText: data.metadata?.previewText,
                entryPoint: data.metadata?.entryPoint,
                thumbnailPath: data.metadata?.thumbnailPath,
                thumbnailUpdatedAt: data.metadata?.thumbnailUpdatedAt
            }
        };

        // Migration: Ensure phase exists on blocks (same logic as before)
        if (flow.blocks) {
            flow.blocks = flow.blocks.map(b => ({
                ...b,
                phase: b.phase || 'action'
            }));
        }

        return normalizeFlowStartNodes(flow);
    },

    saveFlow: async (flow: Flow & { folderId?: string }) => {
        const user = (await supabase.auth.getUser()).data.user;
        if (!user) {
            console.error('Cannot save flow: User not logged in');
            return false;
        }

        // Prepare data for DB
        const content = {
            settings: flow.settings,
            steps: flow.steps,
            connections: flow.connections,
            startStepId: flow.startStepId,
            annotations: flow.annotations,
            blocks: flow.blocks
        };

        const metadata = {
            previewText: getPreviewText(flow.blocks?.[0]),
            entryPoint: flow.settings?.entryPoint,
            thumbnailPath: flow.metadata?.thumbnailPath,
            thumbnailUpdatedAt: flow.metadata?.thumbnailUpdatedAt
        };

        const payload = {
            title: flow.title,
            content,
            metadata,
            updated_at: new Date().toISOString(),
        };

        const isSharedEditor = !!flow.ownerUserId && flow.ownerUserId !== user.id;
        if (isSharedEditor) {
            const { error } = await supabase
                .from('flows')
                .update(payload)
                .eq('id', flow.id);

            if (error) {
                console.error('Error saving shared flow:', error);
                return false;
            }

            return true;
        }

        const finalPayload = {
            ...payload,
            user_id: flow.ownerUserId ?? user.id,
            folder_id: flow.folderId,
        };

        // Upsert
        const { error } = await supabase
            .from('flows')
            .upsert({ id: flow.id, ...finalPayload })
            .select();

        if (error) {
            console.error('Error saving flow:', error);
            return false;
        }

        return true;
    },

    createFlow: async (folderId?: string): Promise<string | null> => {
        const user = (await supabase.auth.getUser()).data.user;
        if (!user) return null;

        const newFlowContent = {
            settings: INITIAL_FLOW.settings,
            steps: INITIAL_FLOW.steps,
            connections: INITIAL_FLOW.connections,
            startStepId: INITIAL_FLOW.startStepId,
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

function mapFlowMetadata(
    row: {
        id: string;
        title: string;
        updated_at: string;
        folder_id?: string | null;
        metadata?: {
            previewText?: string;
            entryPoint?: string;
            thumbnailPath?: string;
        } | null;
        is_public?: boolean | null;
        deleted_at?: string | null;
        user_id?: string | null;
    },
    currentUserId: string,
    ownerProfiles: Map<string, string> = new Map()
): FlowMetadata {
    const ownerUserId = typeof row.user_id === 'string' ? row.user_id : undefined;
    const isShared = !!ownerUserId && ownerUserId !== currentUserId;

    return {
        id: row.id,
        title: row.title,
        lastModified: new Date(row.updated_at).getTime(),
        folderId: row.folder_id ?? undefined,
        previewText: row.metadata?.previewText,
        entryPoint: row.metadata?.entryPoint,
        thumbnailPath: row.metadata?.thumbnailPath,
        isPublic: row.is_public ?? undefined,
        deletedAt: row.deleted_at ? new Date(row.deleted_at).getTime() : null,
        ownerUserId,
        ownerDisplayName: ownerUserId ? ownerProfiles.get(ownerUserId) : undefined,
        isShared,
    };
}

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

async function getSignedThumbnailUrl(thumbnailPath: string): Promise<string | undefined> {
    const { data, error } = await supabase.storage
        .from(THUMBNAIL_BUCKET)
        .createSignedUrl(thumbnailPath, 60 * 60);

    if (error) {
        maybeLogThumbnailBucketIssue(error);
        return undefined;
    }

    return data.signedUrl;
}

function maybeLogThumbnailBucketIssue(error: { message?: string } | null) {
    if (hasLoggedThumbnailBucketIssue) return;
    if (!error?.message) return;

    hasLoggedThumbnailBucketIssue = true;
    console.warn(
        `Flow thumbnails are disabled because the "${THUMBNAIL_BUCKET}" storage bucket is unavailable. ` +
        'Create this private bucket in Supabase Storage to enable dashboard previews.',
        error.message
    );
}
