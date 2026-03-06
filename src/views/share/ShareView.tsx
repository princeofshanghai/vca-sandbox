import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Flow } from '@/views/studio/types';
import { FlowPreview } from '@/views/studio/FlowPreview';
import { PreviewSettingsMenu } from '@/views/studio/PreviewSettingsMenu';
import {
    AlertCircle,
    ArrowUp,
    Home,
    Loader2,
    MessageSquare,
    Monitor,
    RotateCcw,
    Smartphone,
    X,
} from 'lucide-react';
import { INITIAL_FLOW } from '@/utils/flowStorage';
import { Button } from '@/components/ui/button';
import { ShareDialog } from '../studio/components/ShareDialog';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/utils/cn';
import { ActionTooltip } from '@/views/studio-canvas/components/ActionTooltip';
import { ToolbarPill } from '@/components/ui/toolbar-pill';
import { useAuth } from '@/hooks/useAuth';
import {
    getInitialsFromName,
    getUserAvatarUrl,
    getUserDisplayName,
} from '@/utils/userIdentity';
import {
    type FlowComment,
    type FlowCommentThread,
    buildFlowCommentThreads,
    createFlowRootComment,
    listFlowComments,
    replyToFlowComment,
    updateFlowCommentPin,
} from './shareComments';

type CommentMode = 'off' | 'placing';

type PinPoint = {
    x: number;
    y: number;
};

type ComposerSide = 'left' | 'right';

type ComposerPlacement = {
    left: number;
    top: number;
    side: ComposerSide;
};

type DragState = {
    threadId: string;
    commentId: string;
    pointerId: number;
    startClientX: number;
    startClientY: number;
    movedPx: number;
    originPin: PinPoint;
    draftPin: PinPoint;
};

const PIN_VISUAL_RADIUS_PX = 18;
const PIN_TO_POPOVER_GAP_PX = 8;
const COMPOSER_GAP_PX = PIN_VISUAL_RADIUS_PX + PIN_TO_POPOVER_GAP_PX;
const COMPOSER_EDGE_PADDING_PX = 12;
const DEFAULT_COMPOSER_WIDTH_PX = 400;
const DEFAULT_NEW_COMMENT_HEIGHT_PX = 88;
const DEFAULT_THREAD_HEIGHT_PX = 320;
const DRAG_THRESHOLD_PX = 5;
const NEW_COMMENT_COMPOSER_GAP_PX = PIN_VISUAL_RADIUS_PX + PIN_TO_POPOVER_GAP_PX;
const PIN_TIP_TO_CIRCLE_CENTER_OFFSET_PX = 14;

const clampValue = (value: number, min: number, max: number) => {
    if (max < min) return min;
    return Math.min(Math.max(value, min), max);
};

const getAnchoredPopoverPosition = ({
    surfaceRect,
    anchor,
    popoverWidth,
    popoverHeight,
    gapPx = COMPOSER_GAP_PX,
    anchorOffsetYPx = 0,
}: {
    surfaceRect: DOMRect;
    anchor: PinPoint;
    popoverWidth: number;
    popoverHeight: number;
    gapPx?: number;
    anchorOffsetYPx?: number;
}): ComposerPlacement => {
    const anchorX = (anchor.x / 100) * surfaceRect.width;
    const anchorY = (anchor.y / 100) * surfaceRect.height + anchorOffsetYPx;

    const canPlaceRight =
        anchorX + gapPx + popoverWidth + COMPOSER_EDGE_PADDING_PX <= surfaceRect.width;
    const side: ComposerSide = canPlaceRight ? 'right' : 'left';

    const rawLeft = canPlaceRight
        ? anchorX + gapPx
        : anchorX - gapPx - popoverWidth;
    const maxLeft = Math.max(
        COMPOSER_EDGE_PADDING_PX,
        surfaceRect.width - popoverWidth - COMPOSER_EDGE_PADDING_PX
    );
    const left = clampValue(rawLeft, COMPOSER_EDGE_PADDING_PX, maxLeft);

    const rawTop = anchorY - popoverHeight / 2;
    const maxTop = Math.max(
        COMPOSER_EDGE_PADDING_PX,
        surfaceRect.height - popoverHeight - COMPOSER_EDGE_PADDING_PX
    );
    const top = clampValue(rawTop, COMPOSER_EDGE_PADDING_PX, maxTop);

    return { left, top, side };
};

const friendlyCommentsError = (error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);

    if (
        (message.includes('flow_comments') && message.includes('does not exist')) ||
        (message.includes('flow_comments') && message.includes('schema cache'))
    ) {
        return 'Comments are not set up in this environment yet.';
    }

    if (message.includes('permission denied') || message.includes('violates row-level security')) {
        return 'You can view comments, but sign in is required to write comments.';
    }

    return 'Could not load comments right now.';
};

const formatCommentDate = (isoDate: string) =>
    new Date(isoDate).toLocaleString([], {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });

const formatCommentRelativeTime = (isoDate: string) => {
    const createdAt = new Date(isoDate);
    if (Number.isNaN(createdAt.getTime())) return '';

    const diffMs = Date.now() - createdAt.getTime();
    if (diffMs <= 0) return 'now';

    const minutes = Math.floor(diffMs / 60000);
    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;

    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;

    const weeks = Math.floor(days / 7);
    if (weeks < 5) return `${weeks}w ago`;

    const months = Math.floor(days / 30);
    if (months < 12) return `${months}mo ago`;

    const years = Math.floor(days / 365);
    return `${years}y ago`;
};

const hasValidPin = (comment: FlowComment) =>
    typeof comment.pin_x === 'number' && typeof comment.pin_y === 'number';

const getPreviewText = (message: string) => {
    const trimmed = message.trim().replace(/\s+/g, ' ');
    if (trimmed.length <= 80) return trimmed;
    return `${trimmed.slice(0, 80)}...`;
};

const clampPercent = (value: number) => Math.min(100, Math.max(0, value));

const autoResizeTextarea = (textarea: HTMLTextAreaElement | null, maxHeight = 120) => {
    if (!textarea) return;

    textarea.style.height = 'auto';
    const nextHeight = Math.min(textarea.scrollHeight, maxHeight);

    textarea.style.height = `${nextHeight}px`;
    textarea.style.overflowY = textarea.scrollHeight > maxHeight ? 'auto' : 'hidden';
};

export const ShareView = () => {
    const { user, isLoading: isAuthLoading } = useAuth();
    const { id } = useParams<{ id: string }>();

    const [flow, setFlow] = useState<Flow | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Display State
    const [isMobile, setIsMobile] = useState(false);
    const [isPremium, setIsPremium] = useState(false);
    const [resetKey, setResetKey] = useState(0);
    const [isNarrowViewport, setIsNarrowViewport] = useState(() =>
        typeof window !== 'undefined' ? window.innerWidth < 768 : false
    );

    // Comments State
    const [threads, setThreads] = useState<FlowCommentThread[]>([]);
    const [commentsLoading, setCommentsLoading] = useState(false);
    const [commentsError, setCommentsError] = useState<string | null>(null);
    const [hasLoadedCommentsOnce, setHasLoadedCommentsOnce] = useState(false);

    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [commentMode, setCommentMode] = useState<CommentMode>('off');

    const [pendingPin, setPendingPin] = useState<PinPoint | null>(null);
    const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
    const [hoveredThreadId, setHoveredThreadId] = useState<string | null>(null);

    const [newCommentText, setNewCommentText] = useState('');

    const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});

    const [isPostingComment, setIsPostingComment] = useState(false);
    const [activeReplyThreadId, setActiveReplyThreadId] = useState<string | null>(null);
    const [desktopComposerPlacement, setDesktopComposerPlacement] = useState<ComposerPlacement | null>(
        null
    );
    const [dragState, setDragState] = useState<DragState | null>(null);
    const [isSavingDragPin, setIsSavingDragPin] = useState(false);

    const commentSurfaceRef = useRef<HTMLDivElement | null>(null);
    const composerCardRef = useRef<HTMLDivElement | null>(null);
    const newCommentTextareaRef = useRef<HTMLTextAreaElement | null>(null);
    const replyTextareaRef = useRef<HTMLTextAreaElement | null>(null);
    const commentsRequestSeqRef = useRef(0);
    const hasHandledInitialPanelVisibilityRef = useRef(false);

    const commenterName = useMemo(() => getUserDisplayName(user), [user]);
    const commenterAvatarUrl = useMemo(() => getUserAvatarUrl(user), [user]);

    const openCommentsWorkspace = useCallback(() => {
        hasHandledInitialPanelVisibilityRef.current = true;
        setIsPanelOpen(true);
        setCommentMode('placing');
        setPendingPin(null);
        setActiveThreadId(null);
        setCommentsError(null);
    }, []);

    const closeCommentsWorkspace = useCallback(() => {
        hasHandledInitialPanelVisibilityRef.current = true;
        setIsPanelOpen(false);
        setCommentMode('off');
        setPendingPin(null);
        setActiveThreadId(null);
        setHoveredThreadId(null);
        setNewCommentText('');
        setReplyDrafts({});
        setCommentsError(null);
    }, []);

    const toggleCommentsWorkspace = useCallback(() => {
        const isCommentsWorkspaceActive = isPanelOpen || commentMode === 'placing';
        if (isCommentsWorkspaceActive) {
            closeCommentsWorkspace();
            return;
        }

        openCommentsWorkspace();
    }, [commentMode, isPanelOpen, closeCommentsWorkspace, openCommentsWorkspace]);

    const loadComments = useCallback(
        async (flowId: string, options?: { showLoader?: boolean }) => {
            const showLoader = options?.showLoader ?? false;
            const requestId = ++commentsRequestSeqRef.current;

            if (showLoader) setCommentsLoading(true);
            setCommentsError(null);

            try {
                const comments = await listFlowComments(flowId);

                if (requestId !== commentsRequestSeqRef.current) return;
                setThreads(buildFlowCommentThreads(comments));
            } catch (commentsLoadError: unknown) {
                if (requestId !== commentsRequestSeqRef.current) return;
                console.error('Error loading comments:', commentsLoadError);
                setCommentsError(friendlyCommentsError(commentsLoadError));
                setThreads([]);
            } finally {
                if (requestId === commentsRequestSeqRef.current) {
                    if (showLoader) {
                        setCommentsLoading(false);
                    }
                    setHasLoadedCommentsOnce(true);
                }
            }
        },
        []
    );

    useEffect(() => {
        const onResize = () => setIsNarrowViewport(window.innerWidth < 768);
        onResize();
        window.addEventListener('resize', onResize);

        return () => window.removeEventListener('resize', onResize);
    }, []);

    useEffect(() => {
        const fetchFlow = async () => {
            if (!id) return;

            try {
                const { data, error: fetchError } = await supabase
                    .from('flows')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (fetchError) throw fetchError;
                if (!data) throw new Error('Flow not found');

                const loadedFlow: Flow = {
                    ...INITIAL_FLOW,
                    id: data.id,
                    title: data.title,
                    blocks: data.content?.blocks || [],
                    steps: data.content?.steps || [],
                    connections: data.content?.connections || [],
                    settings: data.content?.settings || INITIAL_FLOW.settings,
                    lastModified: new Date(data.updated_at).getTime(),
                };

                setFlow(loadedFlow);
            } catch (loadFlowError: unknown) {
                console.error('Error loading shared flow:', loadFlowError);
                setError(
                    loadFlowError instanceof Error
                        ? loadFlowError.message
                        : 'This flow is either private or does not exist.'
                );
            } finally {
                setLoading(false);
            }
        };

        fetchFlow();
    }, [id]);

    useEffect(() => {
        if (!id) return;
        hasHandledInitialPanelVisibilityRef.current = false;
        setHasLoadedCommentsOnce(false);
        void loadComments(id, { showLoader: true });
    }, [id, loadComments]);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('comments') !== '1') return;

        openCommentsWorkspace();
    }, [openCommentsWorkspace]);

    useEffect(() => {
        if (!id || !isPanelOpen) return;

        const poll = () => {
            if (document.visibilityState !== 'visible') return;
            loadComments(id);
        };

        const intervalId = window.setInterval(poll, 5000);

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                loadComments(id);
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            window.clearInterval(intervalId);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [id, isPanelOpen, loadComments]);

    const listThreads = useMemo(() => threads.filter((thread) => hasValidPin(thread.root)), [threads]);

    useEffect(() => {
        if (!id || !hasLoadedCommentsOnce) return;
        if (hasHandledInitialPanelVisibilityRef.current) return;

        const params = new URLSearchParams(window.location.search);
        if (params.get('comments') === '1') {
            hasHandledInitialPanelVisibilityRef.current = true;
            return;
        }

        if (listThreads.length > 0) {
            setIsPanelOpen(true);
            setCommentMode('off');
        }

        hasHandledInitialPanelVisibilityRef.current = true;
    }, [id, hasLoadedCommentsOnce, listThreads.length]);

    useEffect(() => {
        if (!activeThreadId) return;
        if (listThreads.some((thread) => thread.id === activeThreadId)) return;

        setActiveThreadId(null);
    }, [activeThreadId, listThreads]);

    const activeThread = useMemo(
        () => listThreads.find((thread) => thread.id === activeThreadId) || null,
        [listThreads, activeThreadId]
    );

    const composerAnchor = useMemo<PinPoint | null>(() => {
        if (pendingPin) return pendingPin;
        if (!activeThread || !hasValidPin(activeThread.root)) return null;

        return {
            x: activeThread.root.pin_x as number,
            y: activeThread.root.pin_y as number,
        };
    }, [pendingPin, activeThread]);

    const isComposerForNewComment = !!pendingPin;
    const isComposerOpen = !!composerAnchor;
    // Keep comment interactions tied to actual sandbox viewport constraints,
    // not the preview mode (desktop/mobile simulation).
    const shouldUseBottomSheetComposer = isNarrowViewport;
    const isDesktopAnchoredComposer = !shouldUseBottomSheetComposer && isComposerOpen;
    const canDragPins = !shouldUseBottomSheetComposer && !!user && isPanelOpen;

    const dismissComposer = useCallback(() => {
        setPendingPin(null);
        setNewCommentText('');
        setActiveThreadId(null);
        setHoveredThreadId(null);
        setReplyDrafts({});
        setActiveReplyThreadId(null);
        setCommentMode(isPanelOpen ? 'placing' : 'off');
    }, [isPanelOpen]);

    useEffect(() => {
        if (!isComposerOpen) return;

        const handlePointerDown = (event: PointerEvent) => {
            const target = event.target as Node | null;
            if (!target) return;
            if (composerCardRef.current?.contains(target)) return;
            if ((target as HTMLElement).closest?.('[data-comment-pin-id]')) return;
            dismissComposer();
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key !== 'Escape') return;
            dismissComposer();
        };

        window.addEventListener('pointerdown', handlePointerDown, true);
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('pointerdown', handlePointerDown, true);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isComposerOpen, dismissComposer]);

    useEffect(() => {
        if (!isDesktopAnchoredComposer || !composerAnchor) {
            setDesktopComposerPlacement(null);
            return;
        }

        const updatePlacement = () => {
            const surface = commentSurfaceRef.current;
            if (!surface) return;

            const surfaceRect = surface.getBoundingClientRect();
            if (surfaceRect.width <= 0 || surfaceRect.height <= 0) return;

            const popoverRect = composerCardRef.current?.getBoundingClientRect();
            const popoverWidth = popoverRect?.width || DEFAULT_COMPOSER_WIDTH_PX;
            const popoverHeight =
                popoverRect?.height ||
                (isComposerForNewComment ? DEFAULT_NEW_COMMENT_HEIGHT_PX : DEFAULT_THREAD_HEIGHT_PX);
            const gapPx = isComposerForNewComment ? NEW_COMMENT_COMPOSER_GAP_PX : COMPOSER_GAP_PX;
            const anchorOffsetYPx = isComposerForNewComment ? -PIN_TIP_TO_CIRCLE_CENTER_OFFSET_PX : 0;

            setDesktopComposerPlacement(
                getAnchoredPopoverPosition({
                    surfaceRect,
                    anchor: composerAnchor,
                    popoverWidth,
                    popoverHeight,
                    gapPx,
                    anchorOffsetYPx,
                })
            );
        };

        updatePlacement();

        window.addEventListener('resize', updatePlacement);

        const resizeObserver =
            typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(updatePlacement);
        if (resizeObserver) {
            if (commentSurfaceRef.current) resizeObserver.observe(commentSurfaceRef.current);
            if (composerCardRef.current) resizeObserver.observe(composerCardRef.current);
        }

        return () => {
            window.removeEventListener('resize', updatePlacement);
            resizeObserver?.disconnect();
        };
    }, [
        activeThreadId,
        commentsError,
        composerAnchor,
        isComposerForNewComment,
        isDesktopAnchoredComposer,
        isAuthLoading,
        newCommentText,
        replyDrafts,
        user,
    ]);

    useEffect(() => {
        if (!shouldUseBottomSheetComposer) return;
        setHoveredThreadId(null);
    }, [shouldUseBottomSheetComposer]);

    useEffect(() => {
        if (canDragPins) return;
        setDragState(null);
        setIsSavingDragPin(false);
    }, [canDragPins]);

    const handleCommentSignIn = async () => {
        setCommentsError(null);

        try {
            const redirectTo = `${window.location.origin}${window.location.pathname}?comments=1`;
            const { error: signInError } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                    },
                    redirectTo,
                },
            });

            if (signInError) throw signInError;
        } catch (signInError: unknown) {
            console.error('Error signing in for comments:', signInError);
            setCommentsError('Could not start sign-in. Please try again.');
        }
    };

    const handleCanvasPlaceComment = (event: React.MouseEvent<HTMLDivElement>) => {
        if (commentMode !== 'placing') return;

        const surface = commentSurfaceRef.current;
        if (!surface) return;

        const rect = surface.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) return;

        const x = clampPercent(((event.clientX - rect.left) / rect.width) * 100);
        const y = clampPercent(((event.clientY - rect.top) / rect.height) * 100);

        setPendingPin({ x: Number(x.toFixed(2)), y: Number(y.toFixed(2)) });
        setActiveThreadId(null);
        setCommentMode('off');
    };

    const handleSelectThread = useCallback((threadId: string) => {
        setPendingPin(null);
        setActiveThreadId(threadId);
        setCommentMode('off');
        setIsPanelOpen(true);
        setHoveredThreadId(null);
    }, []);

    const getPinPointFromClient = useCallback((clientX: number, clientY: number): PinPoint | null => {
        const surface = commentSurfaceRef.current;
        if (!surface) return null;

        const rect = surface.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) return null;

        const x = clampPercent(((clientX - rect.left) / rect.width) * 100);
        const y = clampPercent(((clientY - rect.top) / rect.height) * 100);

        return { x: Number(x.toFixed(2)), y: Number(y.toFixed(2)) };
    }, []);

    const handlePinPointerDown = useCallback(
        (
            event: React.PointerEvent<HTMLButtonElement>,
            threadId: string,
            commentId: string,
            originPin: PinPoint
        ) => {
            if (!canDragPins || isSavingDragPin) return;
            if (event.pointerType === 'touch') return;
            if (event.button !== 0) return;

            event.preventDefault();
            event.stopPropagation();

            event.currentTarget.setPointerCapture(event.pointerId);
            setHoveredThreadId(threadId);
            setDragState({
                threadId,
                commentId,
                pointerId: event.pointerId,
                startClientX: event.clientX,
                startClientY: event.clientY,
                movedPx: 0,
                originPin,
                draftPin: originPin,
            });
        },
        [canDragPins, isSavingDragPin]
    );

    const handlePinPointerMove = useCallback(
        (event: React.PointerEvent<HTMLButtonElement>, threadId: string) => {
            setDragState((prev) => {
                if (!prev || prev.threadId !== threadId) return prev;
                if (prev.pointerId !== event.pointerId) return prev;

                const deltaX = event.clientX - prev.startClientX;
                const deltaY = event.clientY - prev.startClientY;
                const movedPx = Math.hypot(deltaX, deltaY);

                if (movedPx < DRAG_THRESHOLD_PX) {
                    if (prev.movedPx === movedPx) return prev;
                    return { ...prev, movedPx };
                }

                const nextPin = getPinPointFromClient(event.clientX, event.clientY);
                if (!nextPin) return { ...prev, movedPx };

                if (
                    prev.draftPin.x === nextPin.x &&
                    prev.draftPin.y === nextPin.y &&
                    prev.movedPx === movedPx
                ) {
                    return prev;
                }

                return {
                    ...prev,
                    movedPx,
                    draftPin: nextPin,
                };
            });
        },
        [getPinPointFromClient]
    );

    const handlePinPointerCancel = useCallback(
        (event: React.PointerEvent<HTMLButtonElement>, threadId: string) => {
            const activeDrag = dragState;
            if (!activeDrag || activeDrag.threadId !== threadId) return;
            if (activeDrag.pointerId !== event.pointerId) return;

            if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                event.currentTarget.releasePointerCapture(event.pointerId);
            }

            setDragState(null);
        },
        [dragState]
    );

    const handlePinPointerUp = useCallback(
        async (event: React.PointerEvent<HTMLButtonElement>, threadId: string) => {
            const activeDrag = dragState;
            if (!activeDrag || activeDrag.threadId !== threadId) return;
            if (activeDrag.pointerId !== event.pointerId) return;

            if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                event.currentTarget.releasePointerCapture(event.pointerId);
            }

            event.preventDefault();
            event.stopPropagation();

            const wasDrag = activeDrag.movedPx >= DRAG_THRESHOLD_PX;
            const targetThreadId = activeDrag.threadId;
            const nextPin = activeDrag.draftPin;
            const originPin = activeDrag.originPin;
            const commentId = activeDrag.commentId;

            if (!wasDrag) {
                setDragState(null);
                handleSelectThread(targetThreadId);
                return;
            }

            if (!id) {
                setDragState(null);
                return;
            }

            const optimisticUpdatedAt = new Date().toISOString();
            setThreads((prev) =>
                prev.map((thread) =>
                    thread.id === targetThreadId
                        ? {
                            ...thread,
                            root: {
                                ...thread.root,
                                pin_x: nextPin.x,
                                pin_y: nextPin.y,
                                updated_at: optimisticUpdatedAt,
                            },
                        }
                        : thread
                )
            );
            setDragState(null);

            setIsSavingDragPin(true);
            setCommentsError(null);

            try {
                await updateFlowCommentPin({
                    commentId,
                    pinX: nextPin.x,
                    pinY: nextPin.y,
                });
                await loadComments(id);
            } catch (dragError: unknown) {
                console.error('Error moving comment pin:', dragError);
                setThreads((prev) =>
                    prev.map((thread) =>
                        thread.id === targetThreadId
                            ? {
                                ...thread,
                                root: {
                                    ...thread.root,
                                    pin_x: originPin.x,
                                    pin_y: originPin.y,
                                    updated_at: new Date().toISOString(),
                                },
                            }
                            : thread
                    )
                );
                setCommentsError('Could not move comment pin. Please try again.');
            } finally {
                setIsSavingDragPin(false);
            }
        },
        [dragState, handleSelectThread, id, loadComments]
    );

    const handleCreateComment = async () => {
        if (!id || !pendingPin || !user) return;

        const message = newCommentText.trim();
        const authorName = commenterName.trim();

        if (!message || !authorName) return;

        setIsPostingComment(true);
        setCommentsError(null);

        try {
            const createdComment = await createFlowRootComment({
                flowId: id,
                authorName,
                authorUserId: user.id,
                authorAvatarUrl: commenterAvatarUrl,
                message,
                pinX: pendingPin.x,
                pinY: pendingPin.y,
            });

            setNewCommentText('');
            setPendingPin(null);
            setActiveThreadId(createdComment.id);

            await loadComments(id);
        } catch (createError: unknown) {
            console.error('Error creating comment:', createError);
            setCommentsError('Could not post this comment. Please try again.');
        } finally {
            setIsPostingComment(false);
        }
    };

    const handleReplyChange = (threadId: string, value: string) => {
        setReplyDrafts((prev) => ({ ...prev, [threadId]: value }));
    };

    const handleReplySubmit = async (threadId: string) => {
        if (!id || !user) return;

        const message = (replyDrafts[threadId] || '').trim();
        const authorName = commenterName.trim();

        if (!message || !authorName) return;

        setActiveReplyThreadId(threadId);
        setCommentsError(null);

        try {
            await replyToFlowComment({
                flowId: id,
                parentId: threadId,
                authorName,
                authorUserId: user.id,
                authorAvatarUrl: commenterAvatarUrl,
                message,
            });

            setReplyDrafts((prev) => ({ ...prev, [threadId]: '' }));
            setActiveThreadId(threadId);
            window.requestAnimationFrame(() => autoResizeTextarea(replyTextareaRef.current));
            await loadComments(id);
        } catch (replyError: unknown) {
            console.error('Error replying to comment:', replyError);
            setCommentsError('Could not post reply. Please try again.');
        } finally {
            setActiveReplyThreadId(null);
        }
    };

    const renderAvatar = ({
        name,
        avatarUrl,
        size,
        textSize,
    }: {
        name: string;
        avatarUrl?: string | null;
        size: string;
        textSize: string;
    }) => (
        <span className={cn('rounded-full overflow-hidden border border-shell-dark-border bg-shell-dark-surface block', size)}>
            {avatarUrl ? (
                <img src={avatarUrl} alt={`${name} avatar`} className="w-full h-full object-cover" />
            ) : (
                <span className={cn('w-full h-full flex items-center justify-center text-shell-dark-muted font-semibold', textSize)}>
                    {getInitialsFromName(name)}
                </span>
            )}
        </span>
    );

    const renderCommentComposerContent = () => {
        if (!composerAnchor) return null;

        if (isComposerForNewComment) {
            const canSubmitComment = newCommentText.trim().length > 0;
            const isCreateDisabled = isPostingComment || !canSubmitComment;
            const isCreateButtonActiveVisual = isPostingComment || canSubmitComment;

            if (!user) {
                return (
                    <div className="w-[420px] max-w-[calc(100vw-40px)] rounded-2xl border border-shell-dark-border bg-shell-dark-panel/95 px-4 py-3 shadow-2xl backdrop-blur">
                        <p className="text-xs text-shell-dark-muted leading-relaxed">
                            Sign in to leave a comment on this prototype.
                        </p>
                        <div className="mt-3 flex justify-end">
                            <Button
                                size="sm"
                                className="h-8 text-[11px] bg-shell-dark-accent hover:bg-shell-dark-accent-hover text-shell-dark-text"
                                onClick={handleCommentSignIn}
                                disabled={isAuthLoading}
                            >
                                {isAuthLoading ? <Loader2 size={12} className="animate-spin" /> : null}
                                Sign in
                            </Button>
                        </div>
                    </div>
                );
            }

            return (
                <div className="w-full md:w-[400px] max-w-[calc(100vw-40px)] rounded-[26px] border border-shell-dark-border bg-shell-dark-panel/95 pl-4 pr-2 py-1.5 shadow-2xl backdrop-blur">
                    <div className="flex items-center gap-1.5">
                        <Textarea
                            ref={(textarea) => {
                                newCommentTextareaRef.current = textarea;
                                autoResizeTextarea(textarea);
                            }}
                            rows={1}
                            value={newCommentText}
                            onChange={(event) => {
                                setNewCommentText(event.target.value);
                                autoResizeTextarea(event.currentTarget);
                            }}
                            onFocus={(event) => autoResizeTextarea(event.currentTarget)}
                            onBlur={(event) => {
                                if (!event.currentTarget.value.trim()) {
                                    autoResizeTextarea(event.currentTarget);
                                }
                            }}
                            onKeyDown={(event) => {
                                if (event.key !== 'Enter' || event.shiftKey || event.nativeEvent.isComposing) {
                                    return;
                                }
                                event.preventDefault();
                                if (isCreateDisabled) return;
                                void handleCreateComment();
                            }}
                            placeholder="Add a comment"
                            className={cn(
                                'h-[26px] min-h-0 max-h-[120px] resize-none border-0 shadow-none focus-visible:ring-0 focus-visible:border-0 bg-transparent text-sm text-shell-dark-text placeholder:text-shell-dark-muted px-0 py-1 leading-5'
                            )}
                        />
                        <div className="shrink-0">
                            <Button
                                size="icon"
                                className={cn(
                                    'h-[30px] w-[30px] rounded-full transition-colors',
                                    isCreateButtonActiveVisual
                                        ? 'bg-shell-dark-accent text-white hover:bg-shell-dark-accent-hover'
                                        : 'bg-shell-dark-surface text-shell-dark-muted hover:bg-shell-dark-surface'
                                )}
                                onClick={handleCreateComment}
                                disabled={isCreateDisabled}
                                aria-label="Post comment"
                            >
                                {isPostingComment ? (
                                    <Loader2 size={13} className="animate-spin" />
                                ) : (
                                    <ArrowUp size={13} />
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            );
        }

        if (!activeThread) return null;

        const replyText = replyDrafts[activeThread.id] || '';
        const canSubmitReply = replyText.trim().length > 0;
        const isReplyPosting = activeReplyThreadId === activeThread.id;
        const isReplyDisabled = isReplyPosting || !canSubmitReply;
        const isReplyButtonActiveVisual = isReplyPosting || canSubmitReply;

        return (
            <div className="w-full md:w-[400px] max-w-[calc(100vw-40px)] rounded-3xl border border-shell-dark-border bg-shell-dark-panel/95 shadow-2xl backdrop-blur overflow-hidden">
                <div className="px-4 py-3 border-b border-shell-dark-border">
                    <h3 className="text-sm font-semibold text-shell-dark-text">Comment</h3>
                </div>

                <div className="max-h-[340px] overflow-y-auto thin-scrollbar divide-y divide-shell-dark-border">
                    <div className="px-4 py-4 space-y-2.5">
                        <div className="flex items-start gap-2.5">
                            {renderAvatar({
                                name: activeThread.root.author_name,
                                avatarUrl: activeThread.root.author_avatar_url,
                                size: 'w-7 h-7',
                                textSize: 'text-[9px]',
                            })}
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-medium text-shell-dark-text truncate">
                                        {activeThread.root.author_name}
                                    </span>
                                    <span
                                        className="text-[11px] text-shell-dark-muted shrink-0"
                                        title={formatCommentDate(activeThread.root.created_at)}
                                    >
                                        {formatCommentRelativeTime(activeThread.root.created_at)}
                                    </span>
                                </div>
                                    <p className="mt-1 text-[13px] text-shell-dark-text leading-relaxed whitespace-pre-wrap break-words">
                                        {activeThread.root.message}
                                    </p>
                                </div>
                            </div>
                        </div>

                    {activeThread.replies.map((reply) => (
                        <div key={reply.id} className="px-4 py-3.5">
                            <div className="flex items-start gap-2.5">
                                {renderAvatar({
                                    name: reply.author_name,
                                    avatarUrl: reply.author_avatar_url,
                                    size: 'w-7 h-7',
                                    textSize: 'text-[9px]',
                                })}
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-medium text-shell-dark-text truncate">
                                            {reply.author_name}
                                        </span>
                                        <span
                                            className="text-[11px] text-shell-dark-muted shrink-0"
                                            title={formatCommentDate(reply.created_at)}
                                        >
                                            {formatCommentRelativeTime(reply.created_at)}
                                        </span>
                                    </div>
                                    <p className="mt-1 text-[13px] text-shell-dark-text leading-relaxed whitespace-pre-wrap break-words">
                                        {reply.message}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {!user ? (
                    <div className="px-4 py-3 border-t border-shell-dark-border flex items-center justify-between gap-3">
                        <div className="text-xs text-shell-dark-muted">Sign in to reply.</div>
                        <Button
                            size="sm"
                            className="h-8 text-[11px] bg-shell-dark-accent hover:bg-shell-dark-accent-hover text-shell-dark-text"
                            onClick={handleCommentSignIn}
                            disabled={isAuthLoading}
                        >
                            {isAuthLoading ? <Loader2 size={12} className="animate-spin" /> : null}
                            Sign in
                        </Button>
                    </div>
                ) : (
                    <div className="px-4 py-3 border-t border-shell-dark-border">
                        <div className="rounded-full border border-shell-dark-border bg-shell-dark-surface/80 pl-3 pr-1.5 py-1">
                            <div className="flex items-center gap-1.5">
                                <Textarea
                                    ref={(textarea) => {
                                        replyTextareaRef.current = textarea;
                                        autoResizeTextarea(textarea);
                                    }}
                                    rows={1}
                                    value={replyText}
                                    onChange={(event) => {
                                        handleReplyChange(activeThread.id, event.target.value);
                                        autoResizeTextarea(event.currentTarget);
                                    }}
                                    onFocus={(event) => autoResizeTextarea(event.currentTarget)}
                                    onBlur={(event) => {
                                        if (!event.currentTarget.value.trim()) {
                                            autoResizeTextarea(event.currentTarget);
                                        }
                                    }}
                                    onKeyDown={(event) => {
                                        if (event.key !== 'Enter' || event.shiftKey || event.nativeEvent.isComposing) {
                                            return;
                                        }
                                        event.preventDefault();
                                        if (isReplyDisabled) return;
                                        void handleReplySubmit(activeThread.id);
                                    }}
                                    placeholder="Reply"
                                    className={cn(
                                        'h-[26px] min-h-0 max-h-[120px] resize-none border-0 shadow-none focus-visible:ring-0 focus-visible:border-0 bg-transparent text-sm text-shell-dark-text placeholder:text-shell-dark-muted px-0 py-1 leading-5'
                                    )}
                                />
                                <div className="shrink-0">
                                    <Button
                                        size="icon"
                                        className={cn(
                                            'h-[30px] w-[30px] rounded-full transition-colors',
                                            isReplyButtonActiveVisual
                                                ? 'bg-shell-dark-accent text-white hover:bg-shell-dark-accent-hover'
                                                : 'bg-shell-dark-surface text-shell-dark-muted hover:bg-shell-dark-surface'
                                        )}
                                        onClick={() => handleReplySubmit(activeThread.id)}
                                        disabled={isReplyDisabled}
                                        aria-label="Post reply"
                                    >
                                        {isReplyPosting ? (
                                            <Loader2 size={13} className="animate-spin" />
                                        ) : (
                                            <ArrowUp size={13} />
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const renderComposer = () => {
        if (!composerAnchor) return null;

        const content = renderCommentComposerContent();
        if (!content) return null;

        if (shouldUseBottomSheetComposer) {
            return (
                <div className="absolute inset-x-2 bottom-2 z-[70] md:inset-x-3 md:bottom-3">
                    <div
                        ref={composerCardRef}
                        id="share-comment-popover"
                        aria-expanded={isComposerOpen}
                        className="max-h-[72vh] overflow-y-auto thin-scrollbar"
                    >
                        {content}
                    </div>
                </div>
            );
        }

        const placement = desktopComposerPlacement;
        return (
            <div
                className="absolute z-[70] pointer-events-auto"
                style={{
                    left: `${placement?.left ?? COMPOSER_EDGE_PADDING_PX}px`,
                    top: `${placement?.top ?? COMPOSER_EDGE_PADDING_PX}px`,
                }}
            >
                <div
                    ref={composerCardRef}
                    id="share-comment-popover"
                    aria-expanded={isComposerOpen}
                    data-side={placement?.side ?? 'right'}
                    className={cn(
                        'transition-all duration-150 ease-out',
                        placement?.side === 'left' ? 'origin-right' : 'origin-left'
                    )}
                >
                    {content}
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-shell-dark-bg">
                <Loader2 className="w-8 h-8 animate-spin text-shell-dark-muted" />
            </div>
        );
    }

    if (error || !flow) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-shell-dark-bg p-4">
                <div className="bg-shell-dark-panel p-8 rounded-2xl shadow-xl border border-shell-dark-border max-w-md w-full text-center">
                    <div className="w-12 h-12 bg-shell-dark-danger-soft rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-6 h-6 text-shell-dark-danger" />
                    </div>
                    <h1 className="text-xl font-semibold text-shell-dark-text mb-2">Access Denied</h1>
                    <p className="text-shell-dark-muted mb-6">{error || 'Unable to load flow.'}</p>
                    <a
                        href="/"
                        className="px-4 py-2 bg-shell-dark-text text-shell-dark-bg rounded-lg font-medium hover:bg-shell-dark-muted transition-colors"
                    >
                        Go Home
                    </a>
                </div>
            </div>
        );
    }

    const isCommentsWorkspaceActive = isPanelOpen || commentMode === 'placing';
    const showPins = isCommentsWorkspaceActive || isComposerOpen;
    const isDesktopHoverPreviewEnabled = !shouldUseBottomSheetComposer;

    return (
        <div className="flex flex-col h-screen bg-shell-dark-bg overflow-hidden text-shell-dark-text font-sans">
            <div className="h-12 bg-shell-dark-panel flex items-center justify-between px-4 shrink-0 shadow-md z-50 border-b border-shell-dark-border">
                <div className="flex items-center gap-4">
                    <a
                        href="/"
                        className="flex items-center gap-2 text-shell-dark-muted hover:text-shell-dark-text transition-colors"
                        title="Return to Home"
                    >
                        <Home size={20} />
                    </a>
                </div>

                <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
                    <span className="text-sm font-medium text-shell-dark-text">{flow.title}</span>
                </div>

                <div className="flex items-center gap-3">
                    <ActionTooltip content="Comments" side="bottom">
                        <Button
                            size="icon"
                            variant="ghost"
                            className={cn(
                                'h-7 w-7 rounded-full transition-colors',
                                isCommentsWorkspaceActive
                                    ? 'bg-shell-dark-accent-soft text-shell-dark-accent hover:bg-shell-dark-accent-soft'
                                    : 'bg-transparent text-shell-dark-muted hover:text-shell-dark-text hover:bg-shell-dark-surface'
                            )}
                            onClick={toggleCommentsWorkspace}
                            aria-label="Toggle comments"
                            aria-pressed={isCommentsWorkspaceActive}
                            aria-controls="share-comment-popover"
                        >
                            <MessageSquare size={14} />
                        </Button>
                    </ActionTooltip>

                    <ToolbarPill className="bg-transparent border-shell-dark-border-strong shadow-none [&>div.w-px]:bg-shell-dark-border">
                        <ActionTooltip content="Desktop preview" side="bottom">
                            <Button
                                size="icon"
                                variant={!isMobile ? 'secondary' : 'ghost'}
                                className={cn(
                                    'h-7 w-7 rounded-full border transition-colors',
                                    !isMobile
                                        ? 'bg-shell-dark-accent-soft border-transparent text-shell-dark-accent'
                                        : 'bg-transparent border-transparent text-shell-dark-muted hover:text-shell-dark-text hover:bg-shell-dark-surface hover:border-shell-dark-border'
                                )}
                                onClick={() => setIsMobile(false)}
                                aria-label="Desktop preview"
                            >
                                <Monitor size={13} />
                            </Button>
                        </ActionTooltip>

                        <ActionTooltip content="Mobile preview" side="bottom">
                            <Button
                                size="icon"
                                variant={isMobile ? 'secondary' : 'ghost'}
                                className={cn(
                                    'h-7 w-7 rounded-full border transition-colors',
                                    isMobile
                                        ? 'bg-shell-dark-accent-soft border-transparent text-shell-dark-accent'
                                        : 'bg-transparent border-transparent text-shell-dark-muted hover:text-shell-dark-text hover:bg-shell-dark-surface hover:border-shell-dark-border'
                                )}
                                onClick={() => setIsMobile(true)}
                                aria-label="Mobile preview"
                            >
                                <Smartphone size={13} />
                            </Button>
                        </ActionTooltip>

                        <div className="flex">
                            <PreviewSettingsMenu
                                flow={flow}
                                onUpdateFlow={setFlow}
                                isPremium={isPremium}
                                onTogglePremium={() => setIsPremium(!isPremium)}
                                darkTheme={true}
                                iconOnly={true}
                                rounded={true}
                            />
                        </div>
                    </ToolbarPill>

                    <ShareDialog
                        flow={flow}
                        title="Share prototype"
                        enabledLinkTypes={['prototype', 'studio']}
                        linkLabelOverrides={{
                            prototype: 'Copy link',
                            studio: 'Copy canvas link',
                        }}
                    >
                        <Button
                            size="sm"
                            className="bg-shell-dark-accent text-shell-dark-text hover:bg-shell-dark-accent-hover h-7 px-3 text-xs font-medium border-0"
                        >
                            Share
                        </Button>
                    </ShareDialog>
                </div>
            </div>

            <div className="flex-1 flex items-center justify-center overflow-hidden relative">
                <div ref={commentSurfaceRef} className="w-full h-full relative">
                    <div className="w-full h-full">
                        <FlowPreview
                            key={resetKey}
                            flow={flow}
                            isPremium={isPremium}
                            isMobile={isMobile}
                            variables={{}}
                            desktopPosition="center"
                            topControl={(
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 gap-2 border-shell-dark-border-strong bg-shell-dark-panel px-3 text-xs font-medium text-shell-dark-muted shadow-sm hover:bg-shell-dark-surface hover:text-shell-dark-text hover:border-shell-dark-border"
                                    onClick={() => setResetKey((prev) => prev + 1)}
                                >
                                    <RotateCcw size={14} />
                                    Restart
                                </Button>
                            )}
                        />
                    </div>

                    {commentMode === 'placing' ? (
                        <div className="absolute inset-0 z-20 cursor-crosshair" onClick={handleCanvasPlaceComment} />
                    ) : null}

                    {showPins ? (
                        <div className="absolute inset-0 z-30 pointer-events-none">
                            {listThreads.map((thread) => {
                                const root = thread.root;
                                if (!hasValidPin(root)) return null;

                                const isSelected = activeThreadId === thread.id;
                                const isDraggingThisPin = dragState?.threadId === thread.id;
                                const effectivePin = isDraggingThisPin ? dragState.draftPin : {
                                    x: root.pin_x as number,
                                    y: root.pin_y as number,
                                };
                                const isHovered = hoveredThreadId === thread.id;
                                const canShowHoverPreview =
                                    isDesktopHoverPreviewEnabled &&
                                    isHovered &&
                                    !isSelected &&
                                    !pendingPin &&
                                    !isComposerForNewComment &&
                                    !isDraggingThisPin;

                                return (
                                    <div
                                        key={thread.id}
                                        className={cn(
                                            'absolute -translate-x-1/2 -translate-y-[72%] pointer-events-none',
                                            isDraggingThisPin
                                                ? 'z-[96]'
                                                : canShowHoverPreview
                                                ? 'z-[95]'
                                                : isSelected
                                                    ? 'z-40'
                                                    : isHovered
                                                        ? 'z-35'
                                                        : 'z-30'
                                        )}
                                        style={{
                                            left: `${effectivePin.x}%`,
                                            top: `${effectivePin.y}%`,
                                        }}
                                    >
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className={cn(
                                                'relative w-11 h-11 rounded-none border-0 bg-transparent shadow-none transition-all duration-150 ease-out pointer-events-auto p-0 hover:bg-transparent focus-visible:ring-0 focus-visible:outline-none',
                                                isSelected || isHovered ? 'scale-105' : 'scale-100',
                                                canDragPins ? 'cursor-grab' : 'cursor-pointer',
                                                isDraggingThisPin ? 'cursor-grabbing scale-110 drop-shadow-2xl' : ''
                                            )}
                                            data-comment-pin-id={thread.id}
                                            onPointerDown={(event) =>
                                                handlePinPointerDown(event, thread.id, root.id, {
                                                    x: root.pin_x as number,
                                                    y: root.pin_y as number,
                                                })
                                            }
                                            onPointerMove={(event) => handlePinPointerMove(event, thread.id)}
                                            onPointerUp={(event) => void handlePinPointerUp(event, thread.id)}
                                            onPointerCancel={(event) => handlePinPointerCancel(event, thread.id)}
                                            onClick={(event) => {
                                                if (canDragPins) return;
                                                event.stopPropagation();
                                                handleSelectThread(thread.id);
                                            }}
                                            onMouseEnter={() => setHoveredThreadId(thread.id)}
                                            onMouseLeave={() => {
                                                if (isDraggingThisPin) return;
                                                setHoveredThreadId((prev) =>
                                                    prev === thread.id ? null : prev
                                                );
                                            }}
                                            onFocus={() => setHoveredThreadId(thread.id)}
                                            onBlur={(event) => {
                                                const relatedTarget = event.relatedTarget as Node | null;
                                                if (
                                                    relatedTarget &&
                                                    event.currentTarget.parentElement?.contains(relatedTarget)
                                                ) {
                                                    return;
                                                }
                                                setHoveredThreadId((prev) =>
                                                    prev === thread.id ? null : prev
                                                );
                                            }}
                                            onKeyDown={(event) => {
                                                if (event.key !== 'Enter' && event.key !== ' ') return;
                                                event.preventDefault();
                                                handleSelectThread(thread.id);
                                            }}
                                            aria-label={`Open comment by ${root.author_name}`}
                                        >
                                            <span
                                                className={cn(
                                                    'absolute bottom-[6px] left-1/2 -translate-x-1/2 w-2.5 h-2.5 rotate-45 border-r border-b',
                                                    isSelected
                                                        ? 'bg-shell-dark-accent border-shell-dark-accent/85'
                                                        : 'bg-shell-dark-panel border-shell-dark-border/35'
                                                )}
                                            />
                                            <span
                                                className={cn(
                                                    'absolute top-0 left-1/2 -translate-x-1/2 w-9 h-9 rounded-full overflow-hidden shadow-xl',
                                                    isSelected
                                                        ? 'bg-shell-dark-accent ring-2 ring-shell-dark-accent/30'
                                                        : 'bg-shell-dark-panel ring-1 ring-shell-dark-border/35'
                                                )}
                                            >
                                                <span className="absolute inset-[3px] rounded-full overflow-hidden bg-shell-dark-surface">
                                                    {root.author_avatar_url ? (
                                                        <img
                                                            src={root.author_avatar_url}
                                                            alt={`${root.author_name} avatar`}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <span className="w-full h-full flex items-center justify-center text-[10px] font-semibold text-shell-dark-text">
                                                            {getInitialsFromName(root.author_name)}
                                                        </span>
                                                    )}
                                                </span>
                                            </span>
                                        </Button>

                                        <Button
                                            variant="ghost"
                                            className={cn(
                                                'absolute left-[42px] top-1/2 -translate-y-1/2 h-auto rounded-2xl border border-shell-dark-border bg-shell-dark-panel/95 text-shell-dark-text hover:text-shell-dark-text hover:bg-shell-dark-panel/95 px-3 py-2 text-left shadow-xl justify-start pointer-events-auto transition-all duration-150 ease-out origin-left focus-visible:ring-0 focus-visible:outline-none z-10',
                                                canShowHoverPreview
                                                    ? 'opacity-100 translate-x-0 scale-100'
                                                    : 'opacity-0 -translate-x-2 scale-95 pointer-events-none'
                                            )}
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                handleSelectThread(thread.id);
                                            }}
                                            onMouseEnter={() => setHoveredThreadId(thread.id)}
                                            onMouseLeave={() =>
                                                setHoveredThreadId((prev) =>
                                                    prev === thread.id ? null : prev
                                                )
                                            }
                                            onFocus={() => setHoveredThreadId(thread.id)}
                                            onBlur={(event) => {
                                                const relatedTarget = event.relatedTarget as Node | null;
                                                if (
                                                    relatedTarget &&
                                                    event.currentTarget.parentElement?.contains(relatedTarget)
                                                ) {
                                                    return;
                                                }
                                                setHoveredThreadId((prev) =>
                                                    prev === thread.id ? null : prev
                                                );
                                            }}
                                            aria-label={`Preview thread by ${root.author_name}`}
                                            tabIndex={canShowHoverPreview ? 0 : -1}
                                            aria-hidden={!canShowHoverPreview}
                                        >
                                            <div className="flex items-start gap-2.5 min-w-[210px] max-w-[270px]">
                                                {renderAvatar({
                                                    name: root.author_name,
                                                    avatarUrl: root.author_avatar_url,
                                                    size: 'w-7 h-7',
                                                    textSize: 'text-[9px]',
                                                })}
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-xs font-semibold text-shell-dark-text truncate">
                                                            {root.author_name}
                                                        </span>
                                                        <span
                                                            className="text-[11px] text-shell-dark-muted shrink-0"
                                                            title={formatCommentDate(thread.latestActivityAt)}
                                                        >
                                                            {formatCommentRelativeTime(thread.latestActivityAt)}
                                                        </span>
                                                    </div>
                                                    <p className="mt-0.5 text-xs text-shell-dark-text/90 truncate max-w-[200px]">
                                                        {getPreviewText(root.message)}
                                                    </p>
                                                    {thread.replies.length > 0 ? (
                                                        <p className="mt-0.5 text-[10px] text-shell-dark-accent">
                                                            {thread.replies.length}{' '}
                                                            {thread.replies.length === 1
                                                                ? 'reply'
                                                                : 'replies'}
                                                        </p>
                                                    ) : null}
                                                </div>
                                            </div>
                                        </Button>
                                    </div>
                                );
                            })}

                            {pendingPin ? (
                                <div
                                    className="absolute -translate-x-1/2 -translate-y-[72%] w-11 h-11 z-50"
                                    style={{ left: `${pendingPin.x}%`, top: `${pendingPin.y}%` }}
                                >
                                    <div className="absolute bottom-[6px] left-1/2 -translate-x-1/2 w-2.5 h-2.5 rotate-45 border-r border-b border-shell-dark-accent/85 bg-shell-dark-accent" />
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-shell-dark-accent shadow-xl ring-2 ring-shell-dark-accent/35 text-white text-[14px] font-semibold flex items-center justify-center">
                                        +
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    ) : null}

                    {renderComposer()}
                </div>

                {isPanelOpen ? (
                    <>
                        <div className="hidden md:block absolute top-3 right-3 bottom-3 w-[340px] z-[60]">
                            <div className="h-full w-full bg-shell-dark-panel border border-shell-dark-border rounded-xl shadow-2xl overflow-hidden flex flex-col">
                                <div className="p-3 border-b border-shell-dark-border flex items-center justify-between gap-3">
                                    <div>
                                        <h2 className="text-sm font-medium text-shell-dark-text">Comments</h2>
                                    </div>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-7 w-7 text-shell-dark-muted hover:text-shell-dark-text hover:bg-shell-dark-surface"
                                        onClick={closeCommentsWorkspace}
                                        aria-label="Close comments panel"
                                    >
                                        <X size={13} />
                                    </Button>
                                </div>

                                {!user ? (
                                    <div className="px-3 py-2.5 border-b border-shell-dark-border bg-shell-dark-surface/35 flex items-center justify-between gap-2">
                                        <div className="text-[11px] text-shell-dark-muted leading-relaxed">
                                            Read-only mode. Sign in to comment.
                                        </div>
                                        <Button
                                            size="sm"
                                            className="h-7 text-[11px] bg-shell-dark-accent hover:bg-shell-dark-accent-hover text-shell-dark-text shrink-0"
                                            onClick={handleCommentSignIn}
                                            disabled={isAuthLoading}
                                        >
                                            {isAuthLoading ? <Loader2 size={12} className="animate-spin" /> : null}
                                            Sign in
                                        </Button>
                                    </div>
                                ) : null}

                                {commentsError ? (
                                    <div className="px-3 py-2.5 border-b border-shell-dark-danger bg-shell-dark-danger-soft/50 text-[11px] text-shell-dark-text">
                                        <div className="flex items-start gap-2">
                                            <AlertCircle size={14} className="mt-0.5 shrink-0 text-shell-dark-danger" />
                                            <span className="leading-relaxed">{commentsError}</span>
                                        </div>
                                    </div>
                                ) : null}

                                <div className="flex-1 overflow-y-auto thin-scrollbar">
                                    {commentsLoading ? (
                                        <div className="h-full flex items-center justify-center text-shell-dark-muted text-xs gap-2">
                                            <Loader2 size={14} className="animate-spin" />
                                            Loading comments...
                                        </div>
                                    ) : listThreads.length === 0 ? (
                                        <div className="h-full px-4 py-8 text-center text-shell-dark-muted">
                                            <div className="text-sm font-medium text-shell-dark-text mb-1">No comments yet</div>
                                            <p className="text-xs leading-relaxed">
                                                Click the comment icon, then click the canvas to leave feedback.
                                            </p>
                                        </div>
                                    ) : (
                                        listThreads.map((thread) => {
                                            const isSelected = activeThreadId === thread.id;

                                            return (
                                                <Button
                                                    key={thread.id}
                                                    variant="ghost"
                                                    className={cn(
                                                        'w-full h-auto rounded-none px-3 py-3 border-b border-shell-dark-border text-left flex items-start justify-start gap-2.5',
                                                        isSelected
                                                            ? 'bg-shell-dark-surface/65 hover:bg-shell-dark-surface/65'
                                                            : 'hover:bg-shell-dark-surface/35'
                                                    )}
                                                    onClick={() => handleSelectThread(thread.id)}
                                                >
                                                    {renderAvatar({
                                                        name: thread.root.author_name,
                                                        avatarUrl: thread.root.author_avatar_url,
                                                        size: 'w-7 h-7',
                                                        textSize: 'text-[10px]',
                                                    })}
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-center justify-between gap-2 mb-0.5">
                                                            <span className="text-xs font-medium text-shell-dark-text truncate">
                                                                {thread.root.author_name}
                                                            </span>
                                                            <span
                                                                className="text-[10px] text-shell-dark-muted shrink-0"
                                                                title={formatCommentDate(thread.latestActivityAt)}
                                                            >
                                                                {formatCommentRelativeTime(thread.latestActivityAt)}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-shell-dark-text/90 leading-relaxed truncate">
                                                            {getPreviewText(thread.root.message)}
                                                        </p>
                                                        {thread.replies.length > 0 ? (
                                                            <p className="text-[10px] text-shell-dark-accent mt-1">
                                                                {thread.replies.length} {thread.replies.length === 1 ? 'reply' : 'replies'}
                                                            </p>
                                                        ) : null}
                                                    </div>
                                                </Button>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="md:hidden absolute inset-x-2 top-2 h-[46%] z-[60]">
                            <div className="h-full w-full bg-shell-dark-panel border border-shell-dark-border rounded-xl shadow-2xl overflow-hidden flex flex-col">
                                <div className="p-2.5 border-b border-shell-dark-border flex items-center justify-between gap-2">
                                    <div className="text-xs font-medium text-shell-dark-text">
                                        Comments ({listThreads.length})
                                    </div>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-7 w-7 text-shell-dark-muted hover:text-shell-dark-text hover:bg-shell-dark-surface"
                                        onClick={closeCommentsWorkspace}
                                        aria-label="Close comments panel"
                                    >
                                        <X size={13} />
                                    </Button>
                                </div>

                                <div className="flex-1 overflow-y-auto thin-scrollbar">
                                    {commentsLoading ? (
                                        <div className="h-full flex items-center justify-center text-shell-dark-muted text-xs gap-2">
                                            <Loader2 size={14} className="animate-spin" />
                                            Loading comments...
                                        </div>
                                    ) : listThreads.length === 0 ? (
                                        <div className="h-full px-4 py-6 text-center text-shell-dark-muted text-xs leading-relaxed">
                                            Tap the comment icon, then tap the canvas to comment.
                                        </div>
                                    ) : (
                                        listThreads.map((thread) => (
                                            <Button
                                                key={thread.id}
                                                variant="ghost"
                                                className={cn(
                                                    'w-full h-auto rounded-none px-3 py-2.5 border-b border-shell-dark-border text-left flex items-start justify-start gap-2',
                                                    activeThreadId === thread.id
                                                        ? 'bg-shell-dark-surface/65 hover:bg-shell-dark-surface/65'
                                                        : 'hover:bg-shell-dark-surface/35'
                                                )}
                                                onClick={() => handleSelectThread(thread.id)}
                                            >
                                                {renderAvatar({
                                                    name: thread.root.author_name,
                                                    avatarUrl: thread.root.author_avatar_url,
                                                    size: 'w-6 h-6',
                                                    textSize: 'text-[9px]',
                                                })}
                                                <div className="min-w-0 flex-1">
                                                    <div className="text-[11px] font-medium text-shell-dark-text truncate">
                                                        {thread.root.author_name}
                                                    </div>
                                                    <div className="text-[10px] text-shell-dark-muted truncate">
                                                        {getPreviewText(thread.root.message)}
                                                    </div>
                                                </div>
                                            </Button>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                ) : null}
            </div>
        </div>
    );
};

export default ShareView;
