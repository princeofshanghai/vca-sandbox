import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Flow } from '@/views/studio/types';
import { FlowPreview } from '@/views/studio/FlowPreview';
import { PreviewSettingsMenu } from '@/views/studio/PreviewSettingsMenu';
import {
    AlertCircle,
    ArrowUp,
    CheckCircle2,
    Home,
    Loader2,
    MessageSquare,
    Monitor,
    MoreHorizontal,
    Pencil,
    RotateCcw,
    Smartphone,
    Trash2,
    X,
} from 'lucide-react';
import { INITIAL_FLOW } from '@/utils/flowStorage';
import { ShareDialog } from '../studio/components/ShareDialog';
import { PreviewHeaderActionButton } from '../studio/components/PreviewHeaderActionButton';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    ShellButton,
    ShellDialogActions,
    ShellIconButton,
    ShellMenu,
    ShellMenuContent,
    ShellMenuItem,
    ShellMenuSeparator,
    ShellNotice,
    ShellSegmentedControl,
    ShellSegmentedControlItem,
    ShellMenuTrigger,
    ShellSelectableRow,
    ShellSelect,
    ShellSelectContent,
    ShellSelectItem,
    ShellSelectTrigger,
    ShellSelectValue,
    ShellTextarea,
} from '@/components/shell';
import { cn } from '@/utils/cn';
import { ActionTooltip } from '@/views/studio-canvas/components/ActionTooltip';
import { useAuth } from '@/hooks/useAuth';
import {
    getInitialsFromName,
    getUserAvatarUrl,
    getUserDisplayName,
} from '@/utils/userIdentity';
import {
    type CommentFilter,
    type FlowComment,
    type FlowCommentThread,
    buildFlowCommentThreads,
    createFlowRootComment,
    deleteFlowComment,
    listFlowComments,
    replyToFlowComment,
    updateFlowCommentMessage,
    updateFlowCommentPin,
    updateFlowCommentStatus,
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

type PendingDeleteState = {
    commentId: string;
    threadId: string;
    isRoot: boolean;
    replyCount: number;
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

const matchesCommentFilter = (thread: FlowCommentThread, filter: CommentFilter) =>
    filter === 'all' || thread.root.status === filter;

const getCommentEmptyState = (filter: CommentFilter) => {
    if (filter === 'open') {
        return {
            title: 'No open comments',
            description: 'Open comments will appear here. Switch filters to review resolved feedback.',
        };
    }

    if (filter === 'resolved') {
        return {
            title: 'No resolved comments',
            description: 'Resolved threads will appear here once feedback has been closed out.',
        };
    }

    return {
        title: 'No comments yet',
        description: 'Click the comment icon, then click the canvas to leave feedback.',
    };
};

export const ShareView = () => {
    const { user, isLoading: isAuthLoading } = useAuth();
    const { id } = useParams<{ id: string }>();

    const [flow, setFlow] = useState<Flow | null>(null);
    const [flowOwnerId, setFlowOwnerId] = useState<string | null>(null);
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
    const [commentFilter, setCommentFilter] = useState<CommentFilter>('open');

    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [commentMode, setCommentMode] = useState<CommentMode>('off');

    const [pendingPin, setPendingPin] = useState<PinPoint | null>(null);
    const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
    const [hoveredThreadId, setHoveredThreadId] = useState<string | null>(null);

    const [newCommentText, setNewCommentText] = useState('');

    const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
    const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
    const [editDraft, setEditDraft] = useState('');
    const [isSavingEditCommentId, setIsSavingEditCommentId] = useState<string | null>(null);
    const [threadStatusPendingId, setThreadStatusPendingId] = useState<string | null>(null);
    const [pendingDelete, setPendingDelete] = useState<PendingDeleteState | null>(null);
    const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);

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
    const editTextareaRef = useRef<HTMLTextAreaElement | null>(null);
    const commentsRequestSeqRef = useRef(0);
    const hasHandledInitialPanelVisibilityRef = useRef(false);

    const commenterName = useMemo(() => getUserDisplayName(user), [user]);
    const commenterAvatarUrl = useMemo(() => getUserAvatarUrl(user), [user]);
    const areHotspotsVisible = flow?.settings?.showHotspots ?? true;

    const openCommentsWorkspace = useCallback(() => {
        hasHandledInitialPanelVisibilityRef.current = true;
        setIsPanelOpen(true);
        setCommentMode('placing');
        setPendingPin(null);
        setActiveThreadId(null);
        setEditingCommentId(null);
        setEditDraft('');
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
        setEditingCommentId(null);
        setEditDraft('');
        setThreadStatusPendingId(null);
        setPendingDelete(null);
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

    const toggleHotspots = useCallback(() => {
        setFlow((currentFlow) => {
            if (!currentFlow) return currentFlow;

            return {
                ...currentFlow,
                settings: {
                    ...currentFlow.settings,
                    showHotspots: !(currentFlow.settings?.showHotspots ?? true),
                },
            };
        });
    }, []);

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
                setFlowOwnerId(typeof data.user_id === 'string' ? data.user_id : null);
            } catch (loadFlowError: unknown) {
                console.error('Error loading shared flow:', loadFlowError);
                setFlowOwnerId(null);
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

    useEffect(() => {
        if (!id || !isPanelOpen) return;
        void loadComments(id);
    }, [id, isPanelOpen, loadComments]);

    const allPinnedThreads = useMemo(
        () => threads.filter((thread) => hasValidPin(thread.root)),
        [threads]
    );

    const visibleThreads = useMemo(
        () => allPinnedThreads.filter((thread) => matchesCommentFilter(thread, commentFilter)),
        [allPinnedThreads, commentFilter]
    );

    const isFlowOwner = !!user && user.id === flowOwnerId;

    const canManageComment = useCallback(
        (comment: FlowComment) => !!user && (comment.author_user_id === user.id || isFlowOwner),
        [isFlowOwner, user]
    );

    const canResolveThread = useCallback(
        (thread: FlowCommentThread) => canManageComment(thread.root),
        [canManageComment]
    );

    useEffect(() => {
        if (!id || !hasLoadedCommentsOnce) return;
        if (hasHandledInitialPanelVisibilityRef.current) return;

        const params = new URLSearchParams(window.location.search);
        if (params.get('comments') === '1') {
            hasHandledInitialPanelVisibilityRef.current = true;
            return;
        }

        if (allPinnedThreads.length > 0) {
            setIsPanelOpen(true);
            setCommentMode('off');
        }

        hasHandledInitialPanelVisibilityRef.current = true;
    }, [allPinnedThreads.length, hasLoadedCommentsOnce, id]);

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

    const activeThread = useMemo(
        () => visibleThreads.find((thread) => thread.id === activeThreadId) || null,
        [activeThreadId, visibleThreads]
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
    const canUsePinDrag = !shouldUseBottomSheetComposer && !!user && isPanelOpen;

    const canDragThreadPin = useCallback(
        (thread: FlowCommentThread) =>
            canUsePinDrag &&
            !isSavingDragPin &&
            thread.root.status === 'open' &&
            canManageComment(thread.root),
        [canManageComment, canUsePinDrag, isSavingDragPin]
    );

    const dismissComposer = useCallback(() => {
        setPendingPin(null);
        setNewCommentText('');
        setActiveThreadId(null);
        setHoveredThreadId(null);
        setReplyDrafts({});
        setEditingCommentId(null);
        setEditDraft('');
        setActiveReplyThreadId(null);
        setCommentMode('off');
    }, []);

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
    }, [dismissComposer, isComposerOpen]);

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
        editDraft,
        editingCommentId,
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
        if (canUsePinDrag) return;
        setDragState(null);
        setIsSavingDragPin(false);
    }, [canUsePinDrag]);

    useEffect(() => {
        if (!editingCommentId) return;
        if (!activeThread || activeThread.root.status === 'resolved') {
            setEditingCommentId(null);
            setEditDraft('');
            return;
        }

        const activeComments = [activeThread.root, ...activeThread.replies];
        if (activeComments.some((comment) => comment.id === editingCommentId)) return;

        setEditingCommentId(null);
        setEditDraft('');
    }, [activeThread, editingCommentId]);

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

    const handleCommentFilterChange = useCallback((value: CommentFilter) => {
        setCommentFilter(value);
        setPendingPin(null);
        setHoveredThreadId(null);
        setCommentMode('off');
    }, []);

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
        setEditingCommentId(null);
        setEditDraft('');
        setCommentMode('off');
    };

    const handleSelectThread = useCallback((threadId: string) => {
        setPendingPin(null);
        setActiveThreadId(threadId);
        setEditingCommentId(null);
        setEditDraft('');
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

    const handleStartEditComment = useCallback((comment: FlowComment) => {
        setCommentsError(null);
        setEditingCommentId(comment.id);
        setEditDraft(comment.message);
        window.requestAnimationFrame(() => autoResizeTextarea(editTextareaRef.current, 160));
    }, []);

    const handleCancelCommentEdit = useCallback(() => {
        setEditingCommentId(null);
        setEditDraft('');
    }, []);

    const handleSaveCommentEdit = useCallback(
        async (commentId: string) => {
            if (!id) return;

            const message = editDraft.trim();
            if (!message) return;

            setIsSavingEditCommentId(commentId);
            setCommentsError(null);

            try {
                const updatedComment = await updateFlowCommentMessage({ commentId, message });
                setThreads((prev) =>
                    prev.map((thread) => {
                        if (thread.root.id === commentId) {
                            return {
                                ...thread,
                                root: {
                                    ...thread.root,
                                    ...updatedComment,
                                },
                            };
                        }

                        return {
                            ...thread,
                            replies: thread.replies.map((reply) =>
                                reply.id === commentId ? { ...reply, ...updatedComment } : reply
                            ),
                        };
                    })
                );
                setEditingCommentId(null);
                setEditDraft('');
                await loadComments(id);
            } catch (editError: unknown) {
                console.error('Error editing comment:', editError);
                setCommentsError('Could not save your edit. Please try again.');
            } finally {
                setIsSavingEditCommentId(null);
            }
        },
        [editDraft, id, loadComments]
    );

    const openDeleteDialog = useCallback((thread: FlowCommentThread, comment: FlowComment) => {
        setCommentsError(null);
        setPendingDelete({
            commentId: comment.id,
            threadId: thread.id,
            isRoot: comment.id === thread.root.id,
            replyCount: thread.replies.length,
        });
    }, []);

    const handleConfirmDeleteComment = useCallback(async () => {
        if (!id || !pendingDelete) return;

        setDeletingCommentId(pendingDelete.commentId);
        setCommentsError(null);

        try {
            await deleteFlowComment({ commentId: pendingDelete.commentId });

            if (pendingDelete.isRoot) {
                setActiveThreadId((prev) => (prev === pendingDelete.threadId ? null : prev));
            }
            if (editingCommentId === pendingDelete.commentId) {
                setEditingCommentId(null);
                setEditDraft('');
            }

            setPendingDelete(null);
            await loadComments(id);
        } catch (deleteError: unknown) {
            console.error('Error deleting comment:', deleteError);
            setCommentsError(
                pendingDelete.isRoot
                    ? 'Could not delete this thread. Please try again.'
                    : 'Could not delete this reply. Please try again.'
            );
        } finally {
            setDeletingCommentId(null);
        }
    }, [editingCommentId, id, loadComments, pendingDelete]);

    const handleThreadStatusChange = useCallback(
        async (thread: FlowCommentThread, nextStatus: 'open' | 'resolved') => {
            if (!id) return;

            const previousStatus = thread.root.status;
            if (previousStatus === nextStatus) return;

            setThreadStatusPendingId(thread.id);
            setCommentsError(null);
            setEditingCommentId(null);
            setEditDraft('');
            setThreads((prev) =>
                prev.map((currentThread) =>
                    currentThread.id === thread.id
                        ? {
                            ...currentThread,
                            root: {
                                ...currentThread.root,
                                status: nextStatus,
                                updated_at: new Date().toISOString(),
                            },
                        }
                        : currentThread
                )
            );

            try {
                await updateFlowCommentStatus({
                    commentId: thread.root.id,
                    status: nextStatus,
                });
                await loadComments(id);
            } catch (statusError: unknown) {
                console.error('Error updating comment status:', statusError);
                setThreads((prev) =>
                    prev.map((currentThread) =>
                        currentThread.id === thread.id
                            ? {
                                ...currentThread,
                                root: {
                                    ...currentThread.root,
                                    status: previousStatus,
                                    updated_at: new Date().toISOString(),
                                },
                            }
                            : currentThread
                    )
                );
                setCommentsError(
                    nextStatus === 'resolved'
                        ? 'Could not resolve this thread. Please try again.'
                        : 'Could not reopen this thread. Please try again.'
                );
            } finally {
                setThreadStatusPendingId(null);
            }
        },
        [id, loadComments]
    );

    const handlePinPointerDown = useCallback(
        (
            event: React.PointerEvent<HTMLButtonElement>,
            threadId: string,
            commentId: string,
            originPin: PinPoint,
            canDragPin: boolean
        ) => {
            if (!canDragPin || isSavingDragPin) return;
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
        [isSavingDragPin]
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

        const targetThread = threads.find((thread) => thread.id === threadId) || null;
        if (targetThread?.root.status === 'resolved') return;

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

    const renderResolvedBadge = () => (
        <span className="rounded-full border border-shell-dark-border bg-shell-dark-surface px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.08em] text-shell-dark-muted">
            Resolved
        </span>
    );

    const renderCommentMenu = ({
        thread,
        comment,
        isThreadMenu = false,
    }: {
        thread: FlowCommentThread;
        comment: FlowComment;
        isThreadMenu?: boolean;
    }) => {
        if (!canManageComment(comment) || thread.root.status === 'resolved') return null;

        return (
            <ShellMenu>
                <ShellMenuTrigger asChild>
                    <ShellIconButton
                        size="sm"
                        tone="cinematicDark"
                        shape="circle"
                        aria-label={isThreadMenu ? 'Thread actions' : 'Comment actions'}
                    >
                        <MoreHorizontal size={14} />
                    </ShellIconButton>
                </ShellMenuTrigger>
                <ShellMenuContent align="end" tone="cinematicDark" className="w-40">
                    <ShellMenuItem
                        tone="cinematicDark"
                        onSelect={() => handleStartEditComment(comment)}
                    >
                        <Pencil size={14} />
                        <span>{isThreadMenu ? 'Edit comment' : 'Edit'}</span>
                    </ShellMenuItem>
                    <ShellMenuSeparator tone="cinematicDark" />
                    <ShellMenuItem
                        tone="cinematicDark"
                        variant="destructive"
                        onSelect={() => openDeleteDialog(thread, comment)}
                    >
                        <Trash2 size={14} />
                        <span>{comment.id === thread.root.id ? 'Delete thread' : 'Delete reply'}</span>
                    </ShellMenuItem>
                </ShellMenuContent>
            </ShellMenu>
        );
    };

    const renderCommentBody = ({
        thread,
        comment,
        isRoot = false,
    }: {
        thread: FlowCommentThread;
        comment: FlowComment;
        isRoot?: boolean;
    }) => {
        const isEditing = editingCommentId === comment.id;
        const canSaveEdit = editDraft.trim().length > 0;
        const isSavingEdit = isSavingEditCommentId === comment.id;

        return (
            <div key={comment.id} className={cn(isRoot ? 'px-4 py-4' : 'px-4 py-3.5')}>
                <div className="flex items-start gap-2.5">
                    {renderAvatar({
                        name: comment.author_name,
                        avatarUrl: comment.author_avatar_url,
                        size: 'w-7 h-7',
                        textSize: 'text-[9px]',
                    })}
                    <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-medium text-shell-dark-text truncate">
                                        {comment.author_name}
                                    </span>
                                    <span
                                        className="text-[11px] text-shell-dark-muted shrink-0"
                                        title={formatCommentDate(comment.created_at)}
                                    >
                                        {formatCommentRelativeTime(comment.created_at)}
                                    </span>
                                </div>
                            </div>
                            {renderCommentMenu({ thread, comment })}
                        </div>

                        {isEditing ? (
                            <div className="mt-2">
                                <ShellTextarea
                                    ref={(textarea) => {
                                        editTextareaRef.current = textarea;
                                        autoResizeTextarea(textarea, 160);
                                    }}
                                    rows={3}
                                    value={editDraft}
                                    onChange={(event) => {
                                        setEditDraft(event.target.value);
                                        autoResizeTextarea(event.currentTarget, 160);
                                    }}
                                    onKeyDown={(event) => {
                                        if (event.key !== 'Enter' || event.shiftKey || event.nativeEvent.isComposing) {
                                            return;
                                        }
                                        event.preventDefault();
                                        if (!canSaveEdit || isSavingEdit) return;
                                        void handleSaveCommentEdit(comment.id);
                                    }}
                                    tone="cinematicDark"
                                    className="min-h-[84px] max-h-[160px] resize-none rounded-2xl bg-shell-dark-surface/85 focus-visible:ring-shell-dark-accent/30"
                                />
                                <div className="mt-2 flex items-center justify-end gap-2">
                                    <ShellButton
                                        size="compact"
                                        variant="ghost"
                                        className="h-8 text-[11px] text-shell-dark-muted hover:bg-shell-dark-surface hover:text-shell-dark-text"
                                        onClick={handleCancelCommentEdit}
                                        disabled={isSavingEdit}
                                    >
                                        Cancel
                                    </ShellButton>
                                    <ShellButton
                                        size="compact"
                                        className="h-8 text-[11px] bg-shell-dark-accent hover:bg-shell-dark-accent-hover text-shell-dark-text"
                                        onClick={() => void handleSaveCommentEdit(comment.id)}
                                        disabled={isSavingEdit || !canSaveEdit}
                                    >
                                        {isSavingEdit ? <Loader2 size={12} className="animate-spin" /> : null}
                                        Save
                                    </ShellButton>
                                </div>
                            </div>
                        ) : (
                            <p className="mt-1 text-[13px] text-shell-dark-text leading-relaxed whitespace-pre-wrap break-words">
                                {comment.message}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const renderThreadListItem = ({
        thread,
        compact = false,
    }: {
        thread: FlowCommentThread;
        compact?: boolean;
    }) => {
        const isSelected = activeThreadId === thread.id;

        return (
            <ShellSelectableRow
                key={thread.id}
                tone="cinematicDark"
                size={compact ? 'compact' : 'default'}
                selected={isSelected}
                onClick={() => handleSelectThread(thread.id)}
            >
                {renderAvatar({
                    name: thread.root.author_name,
                    avatarUrl: thread.root.author_avatar_url,
                    size: compact ? 'w-6 h-6' : 'w-7 h-7',
                    textSize: compact ? 'text-[9px]' : 'text-[10px]',
                })}
                <div className="min-w-0 flex-1">
                    <div className={cn('flex items-start justify-between gap-2', compact ? 'mb-0.5' : 'mb-1')}>
                        <span className={cn(compact ? 'text-[11px]' : 'text-xs', 'font-medium text-shell-dark-text truncate')}>
                            {thread.root.author_name}
                        </span>
                        <div className="flex items-center justify-end gap-2 shrink-0">
                            {thread.root.status === 'resolved' ? renderResolvedBadge() : null}
                            <span
                                className={cn(compact ? 'text-[10px]' : 'text-[10px]', 'text-shell-dark-muted shrink-0')}
                                title={formatCommentDate(thread.latestActivityAt)}
                            >
                                {formatCommentRelativeTime(thread.latestActivityAt)}
                            </span>
                        </div>
                    </div>
                    <p className={cn(compact ? 'text-[10px]' : 'text-xs', 'text-shell-dark-text/90 leading-relaxed truncate')}>
                        {getPreviewText(thread.root.message)}
                    </p>
                    {thread.replies.length > 0 ? (
                        <p className={cn(compact ? 'mt-1 text-[10px]' : 'mt-1.5 text-[10px]', 'text-shell-dark-accent')}>
                            {thread.replies.length} {thread.replies.length === 1 ? 'reply' : 'replies'}
                        </p>
                    ) : null}
                </div>
            </ShellSelectableRow>
        );
    };

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
                            <ShellButton
                                size="compact"
                                className="h-8 text-[11px] bg-shell-dark-accent hover:bg-shell-dark-accent-hover text-shell-dark-text"
                                onClick={handleCommentSignIn}
                                disabled={isAuthLoading}
                            >
                                {isAuthLoading ? <Loader2 size={12} className="animate-spin" /> : null}
                                Sign in
                            </ShellButton>
                        </div>
                    </div>
                );
            }

            return (
                <div className="w-full md:w-[400px] max-w-[calc(100vw-40px)] rounded-[26px] border border-shell-dark-border bg-shell-dark-panel/95 pl-4 pr-2 py-1.5 shadow-2xl backdrop-blur">
                    <div className="flex items-center gap-1.5">
                        <ShellTextarea
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
                            tone="cinematicDark"
                            variant="bare"
                            className="h-[26px] max-h-[120px] resize-none"
                        />
                        <div className="shrink-0">
                            <ShellIconButton
                                size="sm"
                                tone="cinematicDark"
                                shape="circle"
                                className={cn(
                                    'h-[30px] w-[30px] rounded-full transition-colors',
                                    isCreateButtonActiveVisual
                                        ? 'bg-shell-dark-accent text-white hover:bg-shell-dark-accent-hover'
                                        : 'bg-shell-dark-surface text-shell-dark-muted hover:bg-shell-dark-surface hover:text-shell-dark-muted'
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
                            </ShellIconButton>
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
        const canToggleThreadStatus = canResolveThread(activeThread);
        const isStatusPending = threadStatusPendingId === activeThread.id;
        const isResolved = activeThread.root.status === 'resolved';

        return (
            <div className="w-full md:w-[400px] max-w-[calc(100vw-40px)] rounded-3xl border border-shell-dark-border bg-shell-dark-panel/95 shadow-2xl backdrop-blur overflow-hidden">
                <div className="px-4 py-3 border-b border-shell-dark-border flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                        <h3 className="text-sm font-semibold text-shell-dark-text">Comment</h3>
                        {isResolved ? renderResolvedBadge() : null}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                        {!isResolved ? renderCommentMenu({
                            thread: activeThread,
                            comment: activeThread.root,
                            isThreadMenu: true,
                        }) : null}
                        {canToggleThreadStatus ? (
                            <ShellIconButton
                                size="sm"
                                tone="cinematicDark"
                                shape="circle"
                                onClick={() =>
                                    void handleThreadStatusChange(
                                        activeThread,
                                        isResolved ? 'open' : 'resolved'
                                    )
                                }
                                disabled={isStatusPending}
                                aria-label={isResolved ? 'Reopen thread' : 'Resolve thread'}
                            >
                                {isStatusPending ? (
                                    <Loader2 size={14} className="animate-spin" />
                                ) : isResolved ? (
                                    <RotateCcw size={14} />
                                ) : (
                                    <CheckCircle2 size={14} />
                                )}
                            </ShellIconButton>
                        ) : null}
                        <ShellIconButton
                            size="sm"
                            tone="cinematicDark"
                            shape="circle"
                            onClick={dismissComposer}
                            aria-label="Close comment thread"
                        >
                            <X size={14} />
                        </ShellIconButton>
                    </div>
                </div>

                <div className="max-h-[340px] overflow-y-auto thin-scrollbar divide-y divide-shell-dark-border">
                    {renderCommentBody({
                        thread: activeThread,
                        comment: activeThread.root,
                        isRoot: true,
                    })}

                    {activeThread.replies.map((reply) =>
                        renderCommentBody({
                            thread: activeThread,
                            comment: reply,
                        })
                    )}
                </div>

                {isResolved ? (
                    <div className="px-4 py-3 border-t border-shell-dark-border bg-shell-dark-surface/35">
                        <div className="text-xs text-shell-dark-muted">
                            Resolved. Reopen to reply.
                        </div>
                    </div>
                ) : !user ? (
                    <div className="px-4 py-3 border-t border-shell-dark-border flex items-center justify-between gap-3">
                        <div className="text-xs text-shell-dark-muted">Sign in to reply.</div>
                        <ShellButton
                            size="compact"
                            className="h-8 text-[11px] bg-shell-dark-accent hover:bg-shell-dark-accent-hover text-shell-dark-text"
                            onClick={handleCommentSignIn}
                            disabled={isAuthLoading}
                        >
                            {isAuthLoading ? <Loader2 size={12} className="animate-spin" /> : null}
                            Sign in
                        </ShellButton>
                    </div>
                ) : (
                    <div className="px-4 py-3 border-t border-shell-dark-border">
                        <div className="rounded-full border border-shell-dark-border bg-shell-dark-surface/80 pl-3 pr-1.5 py-1">
                            <div className="flex items-center gap-1.5">
                                <ShellTextarea
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
                                    tone="cinematicDark"
                                    variant="bare"
                                    className="h-[26px] max-h-[120px] resize-none"
                                />
                                <div className="shrink-0">
                                    <ShellIconButton
                                        size="sm"
                                        tone="cinematicDark"
                                        shape="circle"
                                        className={cn(
                                            'h-[30px] w-[30px] rounded-full transition-colors',
                                            isReplyButtonActiveVisual
                                                ? 'bg-shell-dark-accent text-white hover:bg-shell-dark-accent-hover'
                                                : 'bg-shell-dark-surface text-shell-dark-muted hover:bg-shell-dark-surface hover:text-shell-dark-muted'
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
                                    </ShellIconButton>
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
    const commentsEmptyState = getCommentEmptyState(commentFilter);
    const renderCommentsReadOnlyBanner = () =>
        !user ? (
            <ShellNotice
                tone="cinematicDark"
                size="compact"
                description="Read-only mode. Sign in to comment."
                action={(
                    <ShellButton
                        size="compact"
                        className="h-7 shrink-0 bg-shell-dark-accent text-shell-dark-text hover:bg-shell-dark-accent-hover text-[11px]"
                        onClick={handleCommentSignIn}
                        disabled={isAuthLoading}
                    >
                        {isAuthLoading ? (
                            <Loader2 size={12} className="animate-spin" />
                        ) : null}
                        Sign in
                    </ShellButton>
                )}
                className="rounded-none border-x-0 border-t-0"
            />
        ) : null;
    const renderCommentsErrorBanner = () =>
        commentsError ? (
            <ShellNotice
                tone="cinematicDark"
                variant="error"
                size="compact"
                icon={<AlertCircle size={14} />}
                description={commentsError}
                className="rounded-none border-x-0 border-t-0"
            />
        ) : null;

    return (
        <>
            <div className="flex flex-col h-screen bg-shell-dark-bg overflow-hidden text-shell-dark-text font-sans">
                <div className="h-12 bg-shell-dark-panel flex items-center justify-between px-4 shrink-0 shadow-md z-50 border-b border-shell-dark-border">
                    <div className="flex items-center gap-4">
                        <ShellIconButton asChild tone="cinematicDark" shape="circle" aria-label="Return to home">
                            <a href="/" title="Return to Home">
                                <Home size={20} />
                            </a>
                        </ShellIconButton>
                    </div>

                    <div className="absolute left-1/2 flex max-w-[34vw] -translate-x-1/2 items-center gap-2 px-4">
                        <span className="truncate text-sm font-medium text-shell-dark-text">{flow.title}</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <ActionTooltip content="Comments" side="bottom">
                            <ShellIconButton
                                size="sm"
                                tone="cinematicDark"
                                shape="circle"
                                className={cn(
                                    isCommentsWorkspaceActive &&
                                        'bg-shell-dark-accent-soft text-shell-dark-accent hover:bg-shell-dark-accent-soft hover:text-shell-dark-accent'
                                )}
                                onClick={toggleCommentsWorkspace}
                                aria-label="Toggle comments"
                                aria-pressed={isCommentsWorkspaceActive}
                                aria-controls="share-comment-popover"
                            >
                                <MessageSquare size={14} />
                            </ShellIconButton>
                        </ActionTooltip>

                        <ShellSegmentedControl tone="cinematicDark" size="compact" aria-label="Preview mode">
                            <ActionTooltip content="Desktop preview" side="bottom">
                                <ShellSegmentedControlItem
                                    iconOnly
                                    selected={!isMobile}
                                    tone="cinematicDark"
                                    size="compact"
                                    onClick={() => setIsMobile(false)}
                                    aria-label="Desktop preview"
                                >
                                    <Monitor size={13} />
                                </ShellSegmentedControlItem>
                            </ActionTooltip>

                            <ActionTooltip content="Mobile preview" side="bottom">
                                <ShellSegmentedControlItem
                                    iconOnly
                                    selected={isMobile}
                                    tone="cinematicDark"
                                    size="compact"
                                    onClick={() => setIsMobile(true)}
                                    aria-label="Mobile preview"
                                >
                                    <Smartphone size={13} />
                                </ShellSegmentedControlItem>
                            </ActionTooltip>

                            <div className="flex">
                                <PreviewSettingsMenu
                                    flow={flow}
                                    onUpdateFlow={setFlow}
                                    isPremium={isPremium}
                                    onTogglePremium={() => setIsPremium(!isPremium)}
                                    tone="cinematicDark"
                                    iconOnly={true}
                                    size="compact"
                                    triggerStyle="segmented"
                                    shape="circle"
                                />
                            </div>
                        </ShellSegmentedControl>

                        <div className="flex items-center gap-2">
                            <PreviewHeaderActionButton
                                tone="cinematicDark"
                                active={areHotspotsVisible}
                                onClick={toggleHotspots}
                                aria-pressed={areHotspotsVisible}
                            >
                                Hotspots
                            </PreviewHeaderActionButton>

                            <PreviewHeaderActionButton
                                tone="cinematicDark"
                                onClick={() => setResetKey((prev) => prev + 1)}
                            >
                                <RotateCcw size={14} />
                                Restart
                            </PreviewHeaderActionButton>
                        </div>

                        <ShareDialog
                            flow={flow}
                            title="Share prototype"
                            enabledLinkTypes={['prototype', 'studio']}
                            linkLabelOverrides={{
                                prototype: 'Copy link',
                                studio: 'Copy canvas link',
                            }}
                        >
                            <ShellButton
                                size="compact"
                                className="bg-shell-dark-accent text-shell-dark-text hover:bg-shell-dark-accent-hover h-7 px-3 text-xs font-medium border-0"
                            >
                                Share
                            </ShellButton>
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
                            />
                        </div>

                        {commentMode === 'placing' ? (
                            <div
                                className="absolute inset-0 z-20 cursor-crosshair"
                                onClick={handleCanvasPlaceComment}
                            />
                        ) : null}

                        {showPins ? (
                            <div className="absolute inset-0 z-30 pointer-events-none">
                                {visibleThreads.map((thread) => {
                                    const root = thread.root;
                                    if (!hasValidPin(root)) return null;

                                    const isSelected = activeThreadId === thread.id;
                                    const isDraggingThisPin = dragState?.threadId === thread.id;
                                    const effectivePin = isDraggingThisPin
                                        ? dragState.draftPin
                                        : {
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
                                    const canDragPin = canDragThreadPin(thread);
                                    const isResolvedThread = root.status === 'resolved';

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
                                            <ShellButton
                                                size="compact"
                                                variant="ghost"
                                                className={cn(
                                                    'relative w-11 h-11 rounded-none border-0 bg-transparent shadow-none transition-all duration-150 ease-out pointer-events-auto p-0 hover:bg-transparent focus-visible:ring-0 focus-visible:outline-none',
                                                    isSelected || isHovered ? 'scale-105' : 'scale-100',
                                                    canDragPin ? 'cursor-grab' : 'cursor-pointer',
                                                    isDraggingThisPin ? 'cursor-grabbing scale-110 drop-shadow-2xl' : '',
                                                    isResolvedThread && !isSelected ? 'opacity-90' : ''
                                                )}
                                                data-comment-pin-id={thread.id}
                                                onPointerDown={(event) =>
                                                    handlePinPointerDown(
                                                        event,
                                                        thread.id,
                                                        root.id,
                                                        {
                                                            x: root.pin_x as number,
                                                            y: root.pin_y as number,
                                                        },
                                                        canDragPin
                                                    )
                                                }
                                                onPointerMove={(event) => handlePinPointerMove(event, thread.id)}
                                                onPointerUp={(event) => void handlePinPointerUp(event, thread.id)}
                                                onPointerCancel={(event) =>
                                                    handlePinPointerCancel(event, thread.id)
                                                }
                                                onClick={(event) => {
                                                    if (canDragPin) return;
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
                                                            : isResolvedThread
                                                              ? 'bg-shell-dark-surface border-shell-dark-border/55'
                                                              : 'bg-shell-dark-panel border-shell-dark-border/35'
                                                    )}
                                                />
                                                <span
                                                    className={cn(
                                                        'absolute top-0 left-1/2 -translate-x-1/2 w-9 h-9 rounded-full overflow-hidden shadow-[0_14px_28px_rgb(0_0_0/0.34)]',
                                                        isSelected
                                                            ? 'bg-shell-dark-accent ring-2 ring-shell-dark-accent/30'
                                                            : isResolvedThread
                                                              ? 'bg-shell-dark-surface ring-1 ring-shell-dark-border/55'
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
                                            </ShellButton>

                                            <ShellButton
                                                variant="ghost"
                                                className={cn(
                                                    'absolute left-[44px] top-1/2 -translate-y-1/2 h-auto min-w-[220px] max-w-[286px] rounded-[24px] border border-shell-dark-border/50 bg-shell-dark-panel/96 text-shell-dark-text hover:text-shell-dark-text hover:bg-shell-dark-panel/96 px-3.5 py-3 text-left shadow-[0_20px_48px_rgb(0_0_0/0.38)] backdrop-blur-md justify-start pointer-events-auto transition-all duration-150 ease-out origin-left focus-visible:ring-0 focus-visible:outline-none z-10',
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
                                                <div className="flex items-start gap-2.5 w-full">
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
                                                            {isResolvedThread ? renderResolvedBadge() : null}
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
                                                                {thread.replies.length === 1 ? 'reply' : 'replies'}
                                                            </p>
                                                        ) : null}
                                                    </div>
                                                </div>
                                            </ShellButton>
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
                                        <div className="flex items-center gap-2 min-w-0">
                                            <h2 className="text-sm font-medium text-shell-dark-text">Comments</h2>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <ShellSelect
                                                value={commentFilter}
                                                onValueChange={(value) =>
                                                    handleCommentFilterChange(value as CommentFilter)
                                                }
                                            >
                                                <ShellSelectTrigger tone="cinematicDark" size="compact" className="w-[88px]">
                                                    <ShellSelectValue />
                                                </ShellSelectTrigger>
                                                <ShellSelectContent tone="cinematicDark" className="min-w-[88px]">
                                                    <ShellSelectItem tone="cinematicDark" size="compact" value="open">Open</ShellSelectItem>
                                                    <ShellSelectItem tone="cinematicDark" size="compact" value="all">All</ShellSelectItem>
                                                    <ShellSelectItem tone="cinematicDark" size="compact" value="resolved">Resolved</ShellSelectItem>
                                                </ShellSelectContent>
                                            </ShellSelect>
                                            <ShellIconButton
                                                size="sm"
                                                tone="cinematicDark"
                                                onClick={closeCommentsWorkspace}
                                                aria-label="Close comments panel"
                                            >
                                                <X size={13} />
                                            </ShellIconButton>
                                        </div>
                                    </div>

                                    {renderCommentsReadOnlyBanner()}

                                    {renderCommentsErrorBanner()}

                                    <div className="flex-1 overflow-y-auto thin-scrollbar">
                                        {commentsLoading ? (
                                            <div className="h-full flex items-center justify-center text-shell-dark-muted text-xs gap-2">
                                                <Loader2 size={14} className="animate-spin" />
                                                Loading comments...
                                            </div>
                                        ) : visibleThreads.length === 0 ? (
                                            <div className="h-full px-4 py-8 text-center text-shell-dark-muted">
                                                <div className="text-sm font-medium text-shell-dark-text mb-1">
                                                    {commentsEmptyState.title}
                                                </div>
                                                <p className="text-xs leading-relaxed">
                                                    {commentsEmptyState.description}
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="px-2 py-2 space-y-1.5">
                                                {visibleThreads.map((thread) =>
                                                    renderThreadListItem({ thread })
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="md:hidden absolute inset-x-2 top-2 h-[46%] z-[60]">
                                <div className="h-full w-full bg-shell-dark-panel border border-shell-dark-border rounded-xl shadow-2xl overflow-hidden flex flex-col">
                                    <div className="p-2.5 border-b border-shell-dark-border flex items-center justify-between gap-2">
                                        <div className="text-xs font-medium text-shell-dark-text">
                                            Comments ({visibleThreads.length})
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <ShellSelect
                                                value={commentFilter}
                                                onValueChange={(value) =>
                                                    handleCommentFilterChange(value as CommentFilter)
                                                }
                                            >
                                                <ShellSelectTrigger tone="cinematicDark" size="compact" className="w-[84px]">
                                                    <ShellSelectValue />
                                                </ShellSelectTrigger>
                                                <ShellSelectContent tone="cinematicDark" className="min-w-[84px]">
                                                    <ShellSelectItem tone="cinematicDark" size="compact" value="open">Open</ShellSelectItem>
                                                    <ShellSelectItem tone="cinematicDark" size="compact" value="all">All</ShellSelectItem>
                                                    <ShellSelectItem tone="cinematicDark" size="compact" value="resolved">Resolved</ShellSelectItem>
                                                </ShellSelectContent>
                                            </ShellSelect>
                                            <ShellIconButton
                                                size="sm"
                                                tone="cinematicDark"
                                                onClick={closeCommentsWorkspace}
                                                aria-label="Close comments panel"
                                            >
                                                <X size={13} />
                                            </ShellIconButton>
                                        </div>
                                    </div>

                                    {renderCommentsReadOnlyBanner()}

                                    {renderCommentsErrorBanner()}

                                    <div className="flex-1 overflow-y-auto thin-scrollbar">
                                        {commentsLoading ? (
                                            <div className="h-full flex items-center justify-center text-shell-dark-muted text-xs gap-2">
                                                <Loader2 size={14} className="animate-spin" />
                                                Loading comments...
                                            </div>
                                        ) : visibleThreads.length === 0 ? (
                                            <div className="h-full px-4 py-6 text-center text-shell-dark-muted text-xs leading-relaxed">
                                                <div className="text-shell-dark-text font-medium mb-1">
                                                    {commentsEmptyState.title}
                                                </div>
                                                <div>{commentsEmptyState.description}</div>
                                            </div>
                                        ) : (
                                            <div className="px-2 py-2 space-y-1">
                                                {visibleThreads.map((thread) =>
                                                    renderThreadListItem({ thread, compact: true })
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : null}
                </div>
            </div>

            <Dialog
                open={!!pendingDelete}
                onOpenChange={(open) => {
                    if (!open && !deletingCommentId) {
                        setPendingDelete(null);
                    }
                }}
            >
                <DialogContent
                    hideClose
                    className="max-w-[360px] gap-0 border-shell-dark-border bg-shell-dark-panel text-shell-dark-text shadow-2xl"
                >
                    <DialogHeader className="text-left">
                        <DialogTitle className="text-base text-shell-dark-text">
                            {pendingDelete?.isRoot ? 'Delete thread?' : 'Delete reply?'}
                        </DialogTitle>
                        <DialogDescription className="text-shell-dark-muted">
                            {pendingDelete?.isRoot
                                ? pendingDelete.replyCount > 0
                                    ? 'This will permanently remove the pinned comment and all replies in this thread.'
                                    : 'This will permanently remove the pinned comment from the prototype.'
                                : 'This will permanently remove this reply from the thread.'}
                        </DialogDescription>
                    </DialogHeader>
                    <ShellDialogActions tone="cinematicDark">
                        <ShellButton
                            size="compact"
                            variant="ghost"
                            className="text-shell-dark-muted hover:bg-shell-dark-surface hover:text-shell-dark-text"
                            onClick={() => setPendingDelete(null)}
                            disabled={!!deletingCommentId}
                        >
                            Cancel
                        </ShellButton>
                        <ShellButton
                            size="compact"
                            variant="destructive"
                            className="bg-shell-dark-danger text-white hover:bg-shell-dark-danger"
                            onClick={() => void handleConfirmDeleteComment()}
                            disabled={!!deletingCommentId}
                        >
                            {deletingCommentId ? <Loader2 size={14} className="animate-spin" /> : null}
                            {pendingDelete?.isRoot ? 'Delete thread' : 'Delete reply'}
                        </ShellButton>
                    </ShellDialogActions>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default ShareView;
