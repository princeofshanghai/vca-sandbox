import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { getUserAvatarUrl, getUserDisplayName } from '@/utils/userIdentity';
import {
    type CommentFilter,
    type FlowComment,
    type FlowCommentCanvasAnchor,
    type FlowCommentThread,
    buildFlowCommentThreads,
    createFlowRootComment,
    deleteFlowComment,
    listFlowComments,
    replyToFlowComment,
    updateFlowCommentMessage,
    updateFlowCommentPin,
    updateFlowCommentStatus,
    isFlowCommentCanvasFreeAnchor,
    isFlowCommentCanvasNodeAnchor,
} from '../share/shareComments';
import {
    friendlyCanvasCommentsError,
    isCanvasCommentThread,
    matchesCanvasCommentFilter,
    sortCanvasCommentThreads,
} from './canvasComments';
import { Flow } from './types';

export type PendingCanvasComment = {
    anchor: FlowCommentCanvasAnchor;
};

export interface CanvasCommentsController {
    threads: FlowCommentThread[];
    visibleThreads: FlowCommentThread[];
    isLoading: boolean;
    error: string | null;
    filter: CommentFilter;
    setFilter: (filter: CommentFilter) => void;
    activeThreadId: string | null;
    activeThread: FlowCommentThread | null;
    hoveredThreadId: string | null;
    pendingComment: PendingCanvasComment | null;
    newCommentText: string;
    setNewCommentText: (value: string) => void;
    replyDrafts: Record<string, string>;
    editingCommentId: string | null;
    editDraft: string;
    setEditDraft: (value: string) => void;
    postingRootComment: boolean;
    postingReplyThreadId: string | null;
    savingEditCommentId: string | null;
    updatingStatusThreadId: string | null;
    deletingCommentId: string | null;
    movingThreadId: string | null;
    isAuthLoading: boolean;
    userCanComment: boolean;
    pendingRevealThreadId: string | null;
    startPendingComment: (anchor: FlowCommentCanvasAnchor) => void;
    dismissPendingComment: () => void;
    dismissComposer: () => void;
    selectThread: (threadId: string, options?: { reveal?: boolean }) => void;
    setHoveredThreadId: (threadId: string | null) => void;
    markRevealHandled: () => void;
    refresh: (options?: { showLoader?: boolean }) => Promise<void>;
    submitPendingComment: () => Promise<boolean>;
    setReplyDraft: (threadId: string, value: string) => void;
    submitReply: (threadId: string) => Promise<boolean>;
    startEditingComment: (comment: FlowComment) => void;
    cancelEditingComment: () => void;
    saveEditingComment: (commentId: string) => Promise<boolean>;
    toggleThreadStatus: (thread: FlowCommentThread, nextStatus: 'open' | 'resolved') => Promise<boolean>;
    deleteComment: (thread: FlowCommentThread, comment: FlowComment) => Promise<boolean>;
    moveThreadAnchor: (threadId: string, anchor: FlowCommentCanvasAnchor) => Promise<boolean>;
    canManageComment: (comment: FlowComment) => boolean;
    canResolveThread: (thread: FlowCommentThread) => boolean;
    resetClosedState: () => void;
}

const applyCanvasAnchorToRootComment = (
    rootComment: FlowComment,
    anchor: FlowCommentCanvasAnchor
): FlowComment => ({
    ...rootComment,
    pin_x: null,
    pin_y: null,
    anchor_mode: 'canvas',
    anchor_kind: 'feedback',
    anchor_canvas_type: anchor.canvasAnchorType,
    anchor_block_id: null,
    anchor_step_id: isFlowCommentCanvasNodeAnchor(anchor) ? anchor.anchorStepId : null,
    anchor_component_id: null,
    anchor_history_index: null,
    anchor_local_x: isFlowCommentCanvasNodeAnchor(anchor) ? anchor.anchorLocalX : null,
    anchor_local_y: isFlowCommentCanvasNodeAnchor(anchor) ? anchor.anchorLocalY : null,
    anchor_canvas_x: isFlowCommentCanvasFreeAnchor(anchor) ? anchor.anchorCanvasX : null,
    anchor_canvas_y: isFlowCommentCanvasFreeAnchor(anchor) ? anchor.anchorCanvasY : null,
    path_signature: null,
    updated_at: new Date().toISOString(),
});

export const useCanvasCommentsController = ({
    flow,
    isVisible,
}: {
    flow: Flow;
    isVisible: boolean;
}): CanvasCommentsController => {
    const { user, isLoading: isAuthLoading } = useAuth();
    const [threads, setThreads] = useState<FlowCommentThread[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<CommentFilter>('open');
    const [ownerUserId, setOwnerUserId] = useState<string | null>(null);
    const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
    const [hoveredThreadId, setHoveredThreadId] = useState<string | null>(null);
    const [pendingComment, setPendingComment] = useState<PendingCanvasComment | null>(null);
    const [newCommentText, setNewCommentText] = useState('');
    const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
    const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
    const [editDraft, setEditDraft] = useState('');
    const [postingRootComment, setPostingRootComment] = useState(false);
    const [postingReplyThreadId, setPostingReplyThreadId] = useState<string | null>(null);
    const [savingEditCommentId, setSavingEditCommentId] = useState<string | null>(null);
    const [updatingStatusThreadId, setUpdatingStatusThreadId] = useState<string | null>(null);
    const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);
    const [movingThreadId, setMovingThreadId] = useState<string | null>(null);
    const [pendingRevealThreadId, setPendingRevealThreadId] = useState<string | null>(null);
    const moveRequestSequenceRef = useRef(0);
    const latestMoveRequestByThreadRef = useRef<Record<string, number>>({});

    const isFlowOwner = !!user && !!ownerUserId && user.id === ownerUserId;
    const userCanComment = !!user;
    const commenterName = useMemo(() => getUserDisplayName(user), [user]);
    const commenterAvatarUrl = useMemo(() => getUserAvatarUrl(user), [user]);
    const sortedThreads = useMemo(() => sortCanvasCommentThreads(threads), [threads]);
    const visibleThreads = useMemo(
        () => sortedThreads.filter((thread) => matchesCanvasCommentFilter(thread, filter)),
        [filter, sortedThreads]
    );
    const activeThread = useMemo(
        () => threads.find((thread) => thread.id === activeThreadId) || null,
        [activeThreadId, threads]
    );

    const canManageComment = useCallback(
        (comment: FlowComment) => !!user && (comment.author_user_id === user.id || isFlowOwner),
        [isFlowOwner, user]
    );

    const canResolveThread = useCallback(
        (thread: FlowCommentThread) => canManageComment(thread.root),
        [canManageComment]
    );

    const resetClosedState = useCallback(() => {
        setActiveThreadId(null);
        setHoveredThreadId(null);
        setPendingComment(null);
        setNewCommentText('');
        setReplyDrafts({});
        setEditingCommentId(null);
        setEditDraft('');
        setPendingRevealThreadId(null);
    }, []);

    const refresh = useCallback(
        async ({ showLoader = false }: { showLoader?: boolean } = {}) => {
            if (!flow.id) return;

            if (showLoader) setIsLoading(true);
            setError(null);

            try {
                const comments = await listFlowComments(flow.id);
                const nextThreads = sortCanvasCommentThreads(
                    buildFlowCommentThreads(comments).filter(isCanvasCommentThread)
                );
                setThreads(nextThreads);
            } catch (loadError) {
                console.error('Error loading canvas comments:', loadError);
                setThreads([]);
                setError(friendlyCanvasCommentsError(loadError));
            } finally {
                if (showLoader) {
                    setIsLoading(false);
                }
            }
        },
        [flow.id]
    );

    useEffect(() => {
        if (!isVisible) {
            setThreads([]);
            setError(null);
            resetClosedState();
            return;
        }

        void refresh({ showLoader: true });
    }, [isVisible, refresh, resetClosedState]);

    useEffect(() => {
        setThreads([]);
        setError(null);
        resetClosedState();
    }, [flow.id, resetClosedState]);

    useEffect(() => {
        if (!isVisible || !flow.id) return;

        let isCancelled = false;

        const loadOwner = async () => {
            try {
                const { data, error: ownerError } = await supabase
                    .from('flows')
                    .select('user_id')
                    .eq('id', flow.id)
                    .single();

                if (ownerError) throw ownerError;
                if (!isCancelled) {
                    setOwnerUserId(typeof data?.user_id === 'string' ? data.user_id : null);
                }
            } catch (ownerLoadError) {
                console.error('Error loading flow owner for comments:', ownerLoadError);
                if (!isCancelled) {
                    setOwnerUserId(null);
                }
            }
        };

        void loadOwner();

        return () => {
            isCancelled = true;
        };
    }, [flow.id, isVisible]);

    useEffect(() => {
        if (!activeThreadId) return;
        if (visibleThreads.some((thread) => thread.id === activeThreadId)) return;
        setActiveThreadId(null);
        setEditingCommentId(null);
        setEditDraft('');
    }, [activeThreadId, visibleThreads]);

    useEffect(() => {
        if (!hoveredThreadId) return;
        if (visibleThreads.some((thread) => thread.id === hoveredThreadId)) return;
        setHoveredThreadId(null);
    }, [hoveredThreadId, visibleThreads]);

    const startPendingComment = useCallback((anchor: FlowCommentCanvasAnchor) => {
        setPendingComment({ anchor });
        setNewCommentText('');
        setActiveThreadId(null);
        setHoveredThreadId(null);
        setEditingCommentId(null);
        setEditDraft('');
        setPendingRevealThreadId(null);
        setError(null);
    }, []);

    const dismissPendingComment = useCallback(() => {
        setPendingComment(null);
        setNewCommentText('');
        setEditingCommentId(null);
        setEditDraft('');
    }, []);

    const dismissComposer = useCallback(() => {
        setPendingComment(null);
        setNewCommentText('');
        setActiveThreadId(null);
        setHoveredThreadId(null);
        setEditingCommentId(null);
        setEditDraft('');
        setPendingRevealThreadId(null);
        setError(null);
    }, []);

    const selectThread = useCallback((threadId: string, options?: { reveal?: boolean }) => {
        setPendingComment(null);
        setNewCommentText('');
        setActiveThreadId(threadId);
        setHoveredThreadId(threadId);
        setEditingCommentId(null);
        setEditDraft('');
        setPendingRevealThreadId(options?.reveal ? threadId : null);
        setError(null);
    }, []);

    const markRevealHandled = useCallback(() => {
        setPendingRevealThreadId(null);
    }, []);

    const submitPendingComment = useCallback(async () => {
        if (!flow.id || !pendingComment || !user) return false;

        const message = newCommentText.trim();
        const authorName = commenterName.trim();
        if (!message || !authorName) return false;

        setPostingRootComment(true);
        setError(null);

        try {
            await createFlowRootComment({
                flowId: flow.id,
                authorName,
                authorUserId: user.id,
                authorAvatarUrl: commenterAvatarUrl,
                message,
                anchor: pendingComment.anchor,
            });

            setPendingComment(null);
            setNewCommentText('');
            await refresh();
            return true;
        } catch (createError) {
            console.error('Error creating canvas comment:', createError);
            setError('Could not post this comment. Please try again.');
            return false;
        } finally {
            setPostingRootComment(false);
        }
    }, [commenterAvatarUrl, commenterName, flow.id, newCommentText, pendingComment, refresh, user]);

    const setReplyDraft = useCallback((threadId: string, value: string) => {
        setReplyDrafts((current) => ({ ...current, [threadId]: value }));
    }, []);

    const submitReply = useCallback(
        async (threadId: string) => {
            if (!flow.id || !user) return false;

            const targetThread = threads.find((thread) => thread.id === threadId) || null;
            if (!targetThread || targetThread.root.status === 'resolved') return false;

            const message = (replyDrafts[threadId] || '').trim();
            const authorName = commenterName.trim();
            if (!message || !authorName) return false;

            setPostingReplyThreadId(threadId);
            setError(null);

            try {
                await replyToFlowComment({
                    flowId: flow.id,
                    parentId: threadId,
                    authorName,
                    authorUserId: user.id,
                    authorAvatarUrl: commenterAvatarUrl,
                    message,
                });

                setReplyDrafts((current) => ({ ...current, [threadId]: '' }));
                setActiveThreadId(threadId);
                await refresh();
                return true;
            } catch (replyError) {
                console.error('Error replying to canvas comment:', replyError);
                setError('Could not post reply. Please try again.');
                return false;
            } finally {
                setPostingReplyThreadId(null);
            }
        },
        [commenterAvatarUrl, commenterName, flow.id, refresh, replyDrafts, threads, user]
    );

    const startEditingComment = useCallback((comment: FlowComment) => {
        setEditingCommentId(comment.id);
        setEditDraft(comment.message);
        setError(null);
    }, []);

    const cancelEditingComment = useCallback(() => {
        setEditingCommentId(null);
        setEditDraft('');
    }, []);

    const saveEditingComment = useCallback(
        async (commentId: string) => {
            const message = editDraft.trim();
            if (!message) return false;

            setSavingEditCommentId(commentId);
            setError(null);

            try {
                await updateFlowCommentMessage({ commentId, message });
                setEditingCommentId(null);
                setEditDraft('');
                await refresh();
                return true;
            } catch (editError) {
                console.error('Error editing canvas comment:', editError);
                setError('Could not save your edit. Please try again.');
                return false;
            } finally {
                setSavingEditCommentId(null);
            }
        },
        [editDraft, refresh]
    );

    const toggleThreadStatus = useCallback(
        async (thread: FlowCommentThread, nextStatus: 'open' | 'resolved') => {
            if (thread.root.status === nextStatus) return true;

            setUpdatingStatusThreadId(thread.id);
            setError(null);

            try {
                await updateFlowCommentStatus({
                    commentId: thread.root.id,
                    status: nextStatus,
                });
                await refresh();
                return true;
            } catch (statusError) {
                console.error('Error updating canvas comment status:', statusError);
                setError(
                    nextStatus === 'resolved'
                        ? 'Could not resolve this thread. Please try again.'
                        : 'Could not reopen this thread. Please try again.'
                );
                return false;
            } finally {
                setUpdatingStatusThreadId(null);
            }
        },
        [refresh]
    );

    const deleteCommentFromThread = useCallback(
        async (thread: FlowCommentThread, comment: FlowComment) => {
            setDeletingCommentId(comment.id);
            setError(null);

            try {
                await deleteFlowComment({ commentId: comment.id });
                if (comment.id === thread.root.id) {
                    setActiveThreadId((current) => (current === thread.id ? null : current));
                }
                if (editingCommentId === comment.id) {
                    setEditingCommentId(null);
                    setEditDraft('');
                }
                await refresh();
                return true;
            } catch (deleteError) {
                console.error('Error deleting canvas comment:', deleteError);
                setError(
                    comment.id === thread.root.id
                        ? 'Could not delete this thread. Please try again.'
                        : 'Could not delete this reply. Please try again.'
                );
                return false;
            } finally {
                setDeletingCommentId(null);
            }
        },
        [editingCommentId, refresh]
    );

    const moveThreadAnchor = useCallback(
        async (threadId: string, anchor: FlowCommentCanvasAnchor) => {
            const thread = threads.find((candidate) => candidate.id === threadId) || null;
            if (!thread) return false;

            const previousRoot = thread.root;
            const requestId = ++moveRequestSequenceRef.current;
            latestMoveRequestByThreadRef.current[threadId] = requestId;
            setMovingThreadId(threadId);
            setError(null);
            setThreads((current) =>
                current.map((candidate) =>
                    candidate.id === threadId
                        ? {
                              ...candidate,
                              root: applyCanvasAnchorToRootComment(candidate.root, anchor),
                          }
                        : candidate
                )
            );

            try {
                await updateFlowCommentPin({
                    commentId: thread.root.id,
                    anchor,
                });

                if (latestMoveRequestByThreadRef.current[threadId] === requestId) {
                    setThreads((current) =>
                        current.map((candidate) =>
                            candidate.id === threadId
                                ? {
                                      ...candidate,
                                      root: {
                                          ...candidate.root,
                                          updated_at: new Date().toISOString(),
                                      },
                                  }
                                : candidate
                        )
                    );
                }

                return true;
            } catch (moveError) {
                console.error('Error moving canvas comment pin:', moveError);

                if (latestMoveRequestByThreadRef.current[threadId] !== requestId) {
                    return true;
                }

                setThreads((current) =>
                    current.map((candidate) =>
                        candidate.id === threadId
                            ? {
                                  ...candidate,
                                  root: previousRoot,
                              }
                            : candidate
                    )
                );
                setError('Could not move comment pin. Please try again.');
                return false;
            } finally {
                if (latestMoveRequestByThreadRef.current[threadId] === requestId) {
                    setMovingThreadId(null);
                }
            }
        },
        [threads]
    );

    return {
        threads: sortedThreads,
        visibleThreads,
        isLoading,
        error,
        filter,
        setFilter,
        activeThreadId,
        activeThread,
        hoveredThreadId,
        pendingComment,
        newCommentText,
        setNewCommentText,
        replyDrafts,
        editingCommentId,
        editDraft,
        setEditDraft,
        postingRootComment,
        postingReplyThreadId,
        savingEditCommentId,
        updatingStatusThreadId,
        deletingCommentId,
        movingThreadId,
        isAuthLoading,
        userCanComment,
        pendingRevealThreadId,
        startPendingComment,
        dismissPendingComment,
        dismissComposer,
        selectThread,
        setHoveredThreadId,
        markRevealHandled,
        refresh,
        submitPendingComment,
        setReplyDraft,
        submitReply,
        startEditingComment,
        cancelEditingComment,
        saveEditingComment,
        toggleThreadStatus,
        deleteComment: deleteCommentFromThread,
        moveThreadAnchor,
        canManageComment,
        canResolveThread,
        resetClosedState,
    };
};
