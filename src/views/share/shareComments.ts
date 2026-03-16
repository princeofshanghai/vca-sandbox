import { supabase } from '@/lib/supabase';

export type CommentStatus = 'open' | 'resolved';
export type CommentFilter = 'open' | 'all' | 'resolved';
export type CommentAnchorMode = 'canvas' | 'review';
export type CommentAnchorKind = 'turn' | 'component' | 'decision' | 'feedback';
export type CanvasCommentAnchorType = 'node' | 'free';

export interface FlowCommentCanvasNodeAnchor {
    anchorMode: 'canvas';
    anchorKind: 'feedback';
    canvasAnchorType: 'node';
    anchorStepId: string;
    anchorBlockId?: null;
    anchorComponentId?: null;
    anchorHistoryIndex?: null;
    anchorLocalX: number;
    anchorLocalY: number;
    anchorCanvasX?: null;
    anchorCanvasY?: null;
    pathSignature?: null;
}

export interface FlowCommentCanvasFreeAnchor {
    anchorMode: 'canvas';
    anchorKind: 'feedback';
    canvasAnchorType: 'free';
    anchorStepId?: null;
    anchorBlockId?: null;
    anchorComponentId?: null;
    anchorHistoryIndex?: null;
    anchorLocalX?: null;
    anchorLocalY?: null;
    anchorCanvasX: number;
    anchorCanvasY: number;
    pathSignature?: null;
}

export interface FlowCommentReviewAnchor {
    anchorMode: 'review';
    anchorKind: CommentAnchorKind;
    canvasAnchorType?: null;
    anchorBlockId: string;
    anchorStepId: string;
    anchorComponentId?: string | null;
    anchorHistoryIndex: number;
    anchorLocalX: number;
    anchorLocalY: number;
    anchorCanvasX?: null;
    anchorCanvasY?: null;
    pathSignature: string;
}

export type FlowCommentCanvasAnchor = FlowCommentCanvasNodeAnchor | FlowCommentCanvasFreeAnchor;
export type FlowCommentAnchor = FlowCommentCanvasAnchor | FlowCommentReviewAnchor;

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
    anchor_mode?: CommentAnchorMode | null;
    anchor_kind?: CommentAnchorKind | null;
    anchor_canvas_type?: CanvasCommentAnchorType | null;
    anchor_block_id?: string | null;
    anchor_step_id?: string | null;
    anchor_component_id?: string | null;
    anchor_history_index?: number | null;
    anchor_local_x?: number | null;
    anchor_local_y?: number | null;
    anchor_canvas_x?: number | null;
    anchor_canvas_y?: number | null;
    path_signature?: string | null;
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

type FlowCommentAnchorColumns = Partial<{
    anchorMode: CommentAnchorMode | null;
    anchorKind: CommentAnchorKind | null;
    canvasAnchorType: CanvasCommentAnchorType | null;
    anchorBlockId: string | null;
    anchorStepId: string | null;
    anchorComponentId: string | null;
    anchorHistoryIndex: number | null;
    anchorLocalX: number | null;
    anchorLocalY: number | null;
    anchorCanvasX: number | null;
    anchorCanvasY: number | null;
    pathSignature: string | null;
}>;

const getCommentAnchorColumns = (anchor?: FlowCommentAnchor | FlowCommentAnchorColumns | null) => ({
    anchor_mode: anchor?.anchorMode ?? null,
    anchor_kind: anchor?.anchorKind ?? null,
    anchor_canvas_type: anchor?.canvasAnchorType ?? null,
    anchor_block_id: anchor?.anchorBlockId ?? null,
    anchor_step_id: anchor?.anchorStepId ?? null,
    anchor_component_id: anchor?.anchorComponentId ?? null,
    anchor_history_index: anchor?.anchorHistoryIndex ?? null,
    anchor_local_x: anchor?.anchorLocalX ?? null,
    anchor_local_y: anchor?.anchorLocalY ?? null,
    anchor_canvas_x: anchor?.anchorCanvasX ?? null,
    anchor_canvas_y: anchor?.anchorCanvasY ?? null,
    path_signature: anchor?.pathSignature ?? null,
});

export const getFlowCommentAnchor = (comment: FlowComment): FlowCommentAnchor | null => {
    if (comment.anchor_mode === 'review') {
        if (
            !comment.anchor_block_id ||
            !comment.anchor_step_id ||
            comment.anchor_history_index == null ||
            comment.anchor_local_x == null ||
            comment.anchor_local_y == null
        ) {
            return null;
        }

        return {
            anchorMode: 'review',
            anchorKind: comment.anchor_kind || 'component',
            anchorBlockId: comment.anchor_block_id,
            anchorStepId: comment.anchor_step_id,
            anchorComponentId: comment.anchor_component_id ?? null,
            anchorHistoryIndex: comment.anchor_history_index,
            anchorLocalX: comment.anchor_local_x,
            anchorLocalY: comment.anchor_local_y,
            pathSignature: comment.path_signature || '',
        };
    }

    if (comment.anchor_mode !== 'canvas') {
        return null;
    }

    if (
        comment.anchor_canvas_type === 'node' &&
        comment.anchor_step_id &&
        comment.anchor_local_x != null &&
        comment.anchor_local_y != null
    ) {
        return {
            anchorMode: 'canvas',
            anchorKind: 'feedback',
            canvasAnchorType: 'node',
            anchorStepId: comment.anchor_step_id,
            anchorLocalX: comment.anchor_local_x,
            anchorLocalY: comment.anchor_local_y,
        };
    }

    if (
        comment.anchor_canvas_type === 'free' &&
        comment.anchor_canvas_x != null &&
        comment.anchor_canvas_y != null
    ) {
        return {
            anchorMode: 'canvas',
            anchorKind: 'feedback',
            canvasAnchorType: 'free',
            anchorCanvasX: comment.anchor_canvas_x,
            anchorCanvasY: comment.anchor_canvas_y,
        };
    }

    return null;
};

export const isFlowCommentCanvasAnchor = (
    anchor: FlowCommentAnchor | null | undefined
): anchor is FlowCommentCanvasAnchor => anchor?.anchorMode === 'canvas';

export const isFlowCommentCanvasNodeAnchor = (
    anchor: FlowCommentAnchor | null | undefined
): anchor is FlowCommentCanvasNodeAnchor =>
    anchor?.anchorMode === 'canvas' && anchor.canvasAnchorType === 'node';

export const isFlowCommentCanvasFreeAnchor = (
    anchor: FlowCommentAnchor | null | undefined
): anchor is FlowCommentCanvasFreeAnchor =>
    anchor?.anchorMode === 'canvas' && anchor.canvasAnchorType === 'free';

type CreateRootCommentBaseParams = {
    flowId: string;
    authorName: string;
    authorUserId: string;
    authorAvatarUrl?: string | null;
    message: string;
};

type CreateRootReviewCommentParams = CreateRootCommentBaseParams & {
    anchor: FlowCommentReviewAnchor;
    pinX: number;
    pinY: number;
};

type CreateRootCanvasCommentParams = CreateRootCommentBaseParams & {
    anchor: FlowCommentCanvasAnchor;
};

export const createFlowRootComment = async (
    params: CreateRootReviewCommentParams | CreateRootCanvasCommentParams
) => {
    const {
        flowId,
        authorName,
        authorUserId,
        authorAvatarUrl,
        message,
        anchor,
    } = params;
    const reviewPins = 'pinX' in params
        ? { pin_x: params.pinX, pin_y: params.pinY }
        : { pin_x: null, pin_y: null };

    const { data, error } = await supabase
        .from('flow_comments')
        .insert({
            flow_id: flowId,
            parent_id: null,
            author_name: authorName.trim(),
            author_user_id: authorUserId,
            author_avatar_url: authorAvatarUrl || null,
            message: message.trim(),
            status: 'open',
            ...reviewPins,
            ...getCommentAnchorColumns(anchor),
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

export const updateFlowCommentMessage = async ({
    commentId,
    message,
}: {
    commentId: string;
    message: string;
}) => {
    const { data, error } = await supabase
        .from('flow_comments')
        .update({
            message: message.trim(),
            updated_at: new Date().toISOString(),
        })
        .eq('id', commentId)
        .select('*')
        .single();

    if (error) throw error;
    return data as FlowComment;
};

export const updateFlowCommentPin = async (
    params: (
    | { commentId: string; anchor: FlowCommentReviewAnchor; pinX: number; pinY: number }
    | { commentId: string; anchor: FlowCommentCanvasAnchor }
)) => {
    const { commentId, anchor } = params;
    const reviewPins = 'pinX' in params
        ? { pin_x: params.pinX, pin_y: params.pinY }
        : { pin_x: null, pin_y: null };

    const { data, error } = await supabase
        .from('flow_comments')
        .update({
            ...reviewPins,
            ...getCommentAnchorColumns(anchor),
            updated_at: new Date().toISOString(),
        })
        .eq('id', commentId)
        .select('*')
        .single();

    if (error) throw error;
    return data as FlowComment;
};

export const deleteFlowComment = async ({ commentId }: { commentId: string }) => {
    const { error } = await supabase.from('flow_comments').delete().eq('id', commentId);

    if (error) throw error;
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
