import { supabase } from '@/lib/supabase';

export type CommentStatus = 'open' | 'resolved';

export interface FlowComment {
    id: string;
    flow_id: string;
    parent_id: string | null;
    message: string;
    author_name: string;
    author_user_id: string | null;
    author_avatar_url?: string | null;
    status: CommentStatus;
    pin_x: number | null;
    pin_y: number | null;
    created_at: string;
    updated_at: string;
}

export interface FlowCommentThread {
    id: string;
    root: FlowComment;
    replies: FlowComment[];
    latestActivityAt: string;
}

export const listFlowComments = async (flowId: string): Promise<FlowComment[]> => {
    const { data, error } = await supabase
        .from('flow_comments')
        .select('*')
        .eq('flow_id', flowId)
        .order('created_at', { ascending: true });

    if (error) throw error;
    return (data || []) as FlowComment[];
};

export const createFlowRootComment = async ({
    flowId,
    authorName,
    authorUserId,
    authorAvatarUrl,
    message,
    pinX,
    pinY,
}: {
    flowId: string;
    authorName: string;
    authorUserId: string;
    authorAvatarUrl?: string | null;
    message: string;
    pinX: number;
    pinY: number;
}) => {
    const { data, error } = await supabase
        .from('flow_comments')
        .insert({
            flow_id: flowId,
            parent_id: null,
            author_name: authorName.trim(),
            author_user_id: authorUserId,
            author_avatar_url: authorAvatarUrl || null,
            message: message.trim(),
            pin_x: pinX,
            pin_y: pinY,
            status: 'open',
        })
        .select('*')
        .single();

    if (error) throw error;
    return data as FlowComment;
};

export const replyToFlowComment = async ({
    flowId,
    parentId,
    authorName,
    authorUserId,
    authorAvatarUrl,
    message,
}: {
    flowId: string;
    parentId: string;
    authorName: string;
    authorUserId: string;
    authorAvatarUrl?: string | null;
    message: string;
}) => {
    const { data, error } = await supabase
        .from('flow_comments')
        .insert({
            flow_id: flowId,
            parent_id: parentId,
            author_name: authorName.trim(),
            author_user_id: authorUserId,
            author_avatar_url: authorAvatarUrl || null,
            message: message.trim(),
        })
        .select('*')
        .single();

    if (error) throw error;
    return data as FlowComment;
};

export const updateFlowCommentStatus = async ({
    commentId,
    status,
}: {
    commentId: string;
    status: CommentStatus;
}) => {
    const { error } = await supabase
        .from('flow_comments')
        .update({
            status,
            updated_at: new Date().toISOString(),
        })
        .eq('id', commentId);

    if (error) throw error;
};

export const updateFlowCommentPin = async ({
    commentId,
    pinX,
    pinY,
}: {
    commentId: string;
    pinX: number;
    pinY: number;
}) => {
    const { data, error } = await supabase
        .from('flow_comments')
        .update({
            pin_x: pinX,
            pin_y: pinY,
            updated_at: new Date().toISOString(),
        })
        .eq('id', commentId)
        .select('*')
        .single();

    if (error) throw error;
    return data as FlowComment;
};

const resolveThreadRoot = (
    commentsById: Map<string, FlowComment>,
    comment: FlowComment
): FlowComment | null => {
    if (!comment.parent_id) return comment;

    let current = commentsById.get(comment.parent_id) || null;
    while (current?.parent_id) {
        current = commentsById.get(current.parent_id) || null;
    }
    return current;
};

export const buildFlowCommentThreads = (comments: FlowComment[]): FlowCommentThread[] => {
    const commentsById = new Map(comments.map((comment) => [comment.id, comment]));
    const roots = comments.filter((comment) => !comment.parent_id);
    const repliesByRootId: Record<string, FlowComment[]> = {};

    comments
        .filter((comment) => !!comment.parent_id)
        .forEach((comment) => {
            const root = resolveThreadRoot(commentsById, comment);
            if (!root) return;
            repliesByRootId[root.id] = repliesByRootId[root.id] || [];
            repliesByRootId[root.id].push(comment);
        });

    return roots
        .map((root) => {
            const replies = (repliesByRootId[root.id] || []).sort((a, b) =>
                new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            );

            const latestActivity = replies.length > 0
                ? replies[replies.length - 1].created_at
                : root.created_at;

            return {
                id: root.id,
                root,
                replies,
                latestActivityAt: latestActivity,
            };
        })
        .sort(
            (a, b) =>
                new Date(b.latestActivityAt).getTime() - new Date(a.latestActivityAt).getTime()
        );
};
