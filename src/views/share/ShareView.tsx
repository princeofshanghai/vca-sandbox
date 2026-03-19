import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Flow } from '@/views/studio/types';
import {
    type FlowPreviewReviewDecision,
    type FlowPreviewReviewPathChangeRequest,
    type FlowPreviewReviewState,
    FlowPreview,
} from '@/views/studio/FlowPreview';
import { PreviewSettingsMenu } from '@/views/studio/PreviewSettingsMenu';
import { PathsPanel } from '@/views/studio/components/PathsPanel';
import {
    AlertCircle,
    CheckCircle2,
    Home,
    Loader2,
    MessageSquare,
    Monitor,
    Pencil,
    RotateCcw,
    Split,
    Smartphone,
    X,
} from 'lucide-react';
import { INITIAL_FLOW } from '@/utils/flowStorage';
import { ShareDialog } from '../studio/components/ShareDialog';
import { PreviewHeaderActionButton } from '../studio/components/PreviewHeaderActionButton';
import {
    ShareCommentPin,
    SHARE_COMMENT_PIN_HEIGHT_PX,
    SHARE_COMMENT_PIN_HEAD_CENTER_OFFSET_PX,
    SHARE_COMMENT_PIN_TIP_TO_LEFT_EDGE_OFFSET_PX,
    SHARE_COMMENT_PIN_TIP_TO_RIGHT_EDGE_OFFSET_PX,
    SHARE_COMMENT_PIN_TIP_X_OFFSET_PX,
    SHARE_COMMENT_PIN_TIP_OFFSET_PX,
    SHARE_COMMENT_PIN_TIP_TO_CENTER_OFFSET_PX,
    SHARE_COMMENT_PIN_WIDTH_PX,
} from './components/ShareCommentPin';
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
    ShellHeaderRail,
    ShellHeaderRailItem,
    ShellIconButton,
    ShellMenu,
    ShellMenuContent,
    ShellMenuItem,
    ShellMenuSeparator,
    ShellMenuTrigger,
    ShellNotice,
    ShellSegmentedControl,
    ShellSegmentedControlItem,
    ShellSelectableRow,
    ShellSelect,
    ShellSelectContent,
    ShellSelectItem,
    ShellSelectTrigger,
    ShellSelectValue,
    ShellTextarea,
} from '@/components/shell';
import {
    CommentActionsMenu,
    CommentAvatar,
    CommentComposerInputRow,
    CommentResolvedBadge,
} from '@/components/comments/CommentPrimitives';
import {
    CommentThreadHoverPreview,
    COMMENT_THREAD_HOVER_PREVIEW_GAP_PX,
} from '@/components/comments/CommentThreadHoverPreview';
import { cn } from '@/utils/cn';
import { CANVAS_DEFAULT_CURSOR, COMMENT_PLACEMENT_CURSOR } from '@/utils/commentPlacementCursor';
import { ActionTooltip } from '@/views/studio-canvas/components/ActionTooltip';
import { useAuth } from '@/hooks/useAuth';
import { type SmartFlowEngineSnapshot } from '@/hooks/useSmartFlowEngine';
import { getUserAvatarUrl, getUserDisplayName } from '@/utils/userIdentity';
import {
    type CommentFilter,
    type FlowCommentReviewAnchor,
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

type PointerPlacementState = {
    pointerId: number;
    startClientX: number;
    startClientY: number;
    movedPx: number;
};

type ReviewThreadStatus = 'visible' | 'other-path' | 'outdated' | 'rail-only';

type ReviewThreadRenderState = {
    thread: FlowCommentThread;
    pin: PinPoint | null;
    status: ReviewThreadStatus;
    detail: string | null;
};

type ParsedPathSelection = {
    stepId: string;
    branchId: string;
};

type PendingThreadPathNavigation = {
    threadId: string;
    targetSelections: ParsedPathSelection[];
};

const PIN_TO_POPOVER_GAP_PX = 8;
const COMPOSER_EDGE_PADDING_PX = 12;
const DEFAULT_NEW_COMMENT_WIDTH_PX = 320;
const DEFAULT_THREAD_COMPOSER_WIDTH_PX = 360;
const DEFAULT_NEW_COMMENT_HEIGHT_PX = 72;
const DEFAULT_THREAD_HEIGHT_PX = 320;
const COMMENT_POPOVER_SIGN_IN_WIDTH_PX = 380;
const DRAG_THRESHOLD_PX = 5;
const PIN_TIP_TO_CIRCLE_CENTER_OFFSET_PX = SHARE_COMMENT_PIN_TIP_TO_CENTER_OFFSET_PX;
const COMMENT_PLACE_THRESHOLD_PX = 8;
const COMMENT_SURFACE_TONE = 'cinematicDark' as const;

const createEmptyReviewState = (): FlowPreviewReviewState => ({
    pathSelections: [],
    decisions: [],
    pathSignature: '',
    historyLength: 0,
});

const getReviewSnapshotStorageKey = (flowId: string) => `share-review-snapshot:${flowId}`;

const readStoredReviewSnapshot = (flowId: string | undefined) => {
    if (!flowId || typeof window === 'undefined') return null;

    try {
        const raw = window.sessionStorage.getItem(getReviewSnapshotStorageKey(flowId));
        if (!raw) return null;
        return JSON.parse(raw) as SmartFlowEngineSnapshot;
    } catch (error) {
        console.warn('Could not restore review snapshot:', error);
        return null;
    }
};

const writeStoredReviewSnapshot = (
    flowId: string | undefined,
    snapshot: SmartFlowEngineSnapshot | null
) => {
    if (!flowId || typeof window === 'undefined') return;

    try {
        if (!snapshot) {
            window.sessionStorage.removeItem(getReviewSnapshotStorageKey(flowId));
            return;
        }

        window.sessionStorage.setItem(
            getReviewSnapshotStorageKey(flowId),
            JSON.stringify(snapshot)
        );
    } catch (error) {
        console.warn('Could not persist review snapshot:', error);
    }
};

const isReviewComment = (comment: FlowComment) => comment.anchor_mode === 'review';

const parseReviewPathSignature = (pathSignature: string | null | undefined): ParsedPathSelection[] =>
    (pathSignature || '')
        .split('|')
        .map((entry) => entry.trim())
        .filter(Boolean)
        .map((entry) => {
            const separatorIndex = entry.indexOf(':');
            if (separatorIndex <= 0 || separatorIndex === entry.length - 1) return null;

            return {
                stepId: entry.slice(0, separatorIndex),
                branchId: entry.slice(separatorIndex + 1),
            };
        })
        .filter((entry): entry is ParsedPathSelection => !!entry);

const escapeReviewSelector = (value: string) =>
    typeof CSS !== 'undefined' && typeof CSS.escape === 'function'
        ? CSS.escape(value)
        : value.replace(/["\\]/g, '\\$&');

const clampValue = (value: number, min: number, max: number) => {
    if (max < min) return min;
    return Math.min(Math.max(value, min), max);
};

const getAnchoredPopoverPosition = ({
    surfaceRect,
    anchor,
    popoverWidth,
    popoverHeight,
    gapPx = PIN_TO_POPOVER_GAP_PX,
    anchorOffsetYPx = 0,
    anchorClearanceLeftPx = 0,
    anchorClearanceRightPx = 0,
}: {
    surfaceRect: DOMRect;
    anchor: PinPoint;
    popoverWidth: number;
    popoverHeight: number;
    gapPx?: number;
    anchorOffsetYPx?: number;
    anchorClearanceLeftPx?: number;
    anchorClearanceRightPx?: number;
}): ComposerPlacement => {
    const anchorX = (anchor.x / 100) * surfaceRect.width;
    const anchorY = (anchor.y / 100) * surfaceRect.height + anchorOffsetYPx;

    const canPlaceRight =
        anchorX +
            anchorClearanceRightPx +
            gapPx +
            popoverWidth +
            COMPOSER_EDGE_PADDING_PX <=
        surfaceRect.width;
    const side: ComposerSide = canPlaceRight ? 'right' : 'left';

    const rawLeft = canPlaceRight
        ? anchorX + anchorClearanceRightPx + gapPx
        : anchorX - anchorClearanceLeftPx - gapPx - popoverWidth;
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
        description: 'Press Comments, then click anywhere on the review transcript to leave feedback.',
    };
};

export const ShareView = () => {
    const { user, isLoading: isAuthLoading } = useAuth();
    const navigate = useNavigate();
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
    const [reviewState, setReviewState] = useState<FlowPreviewReviewState>(createEmptyReviewState);
    const [reviewSnapshot, setReviewSnapshot] = useState<SmartFlowEngineSnapshot | null>(() =>
        readStoredReviewSnapshot(id)
    );
    const [reviewPathChangeRequest, setReviewPathChangeRequest] =
        useState<FlowPreviewReviewPathChangeRequest | null>(null);
    const [isPathsPanelOpen, setIsPathsPanelOpen] = useState(false);
    const [reviewLayoutVersion, setReviewLayoutVersion] = useState(0);

    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [commentMode, setCommentMode] = useState<CommentMode>('off');
    const [pendingThreadPathNavigation, setPendingThreadPathNavigation] =
        useState<PendingThreadPathNavigation | null>(null);
    const [pendingThreadRevealId, setPendingThreadRevealId] = useState<string | null>(null);

    const [pendingPin, setPendingPin] = useState<PinPoint | null>(null);
    const [pendingReviewAnchor, setPendingReviewAnchor] = useState<FlowCommentReviewAnchor | null>(null);
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
    const editTextareaRef = useRef<HTMLTextAreaElement | null>(null);
    const commentsRequestSeqRef = useRef(0);
    const hasHandledInitialPanelVisibilityRef = useRef(false);
    const commentPlacementRef = useRef<PointerPlacementState | null>(null);
    const suppressedPlacementPointerIdRef = useRef<number | null>(null);
    const lastAutoPathRequestKeyRef = useRef<string | null>(null);
    const lastAutoOpenPendingPathRequestKeyRef = useRef<string | null>(null);

    const commenterName = useMemo(() => getUserDisplayName(user), [user]);
    const commenterAvatarUrl = useMemo(() => getUserAvatarUrl(user), [user]);

    const openCommentsWorkspace = useCallback(() => {
        hasHandledInitialPanelVisibilityRef.current = true;
        setIsPanelOpen(true);
        setCommentMode('placing');
        setReviewPathChangeRequest(null);
        setPendingThreadPathNavigation(null);
        setPendingThreadRevealId(null);
        setPendingPin(null);
        setPendingReviewAnchor(null);
        setActiveThreadId(null);
        setEditingCommentId(null);
        setEditDraft('');
        setCommentsError(null);
    }, []);

    const closeCommentsWorkspace = useCallback(() => {
        hasHandledInitialPanelVisibilityRef.current = true;
        setIsPanelOpen(false);
        setCommentMode('off');
        setReviewPathChangeRequest(null);
        setPendingThreadPathNavigation(null);
        setPendingThreadRevealId(null);
        setPendingPin(null);
        setPendingReviewAnchor(null);
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

    const togglePathsPanel = useCallback(() => {
        setIsPathsPanelOpen((current) => !current);
    }, []);

    const handleReviewBranchChange = useCallback(
        (decision: FlowPreviewReviewDecision, branchId: string) => {
            if (decision.selectedBranchId === branchId) return;

            setPendingThreadPathNavigation(null);
            setPendingThreadRevealId(null);
            setPendingPin(null);
            setPendingReviewAnchor(null);
            setNewCommentText('');
            setHoveredThreadId(null);
            setReviewPathChangeRequest({
                token: Date.now() + Math.random(),
                stepId: decision.stepId,
                branchId,
                mode: decision.mode,
            });
        },
        []
    );

    const handleRestart = useCallback(() => {
        setResetKey((prev) => prev + 1);
        setReviewState(createEmptyReviewState());
        setReviewSnapshot(null);
        setReviewPathChangeRequest(null);
        setPendingThreadPathNavigation(null);
        setPendingThreadRevealId(null);
        writeStoredReviewSnapshot(id, null);
    }, [id]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.defaultPrevented || event.repeat) return;
            if (event.metaKey || event.ctrlKey || event.altKey) return;

            const target = event.target as HTMLElement | null;
            if (
                target &&
                (
                    target instanceof HTMLInputElement ||
                    target instanceof HTMLTextAreaElement ||
                    target instanceof HTMLSelectElement ||
                    target.isContentEditable
                )
            ) {
                return;
            }

            const key = event.key.toLowerCase();

            if (key === 'c') {
                event.preventDefault();
                toggleCommentsWorkspace();
                return;
            }

            if (key === 'r') {
                event.preventDefault();
                handleRestart();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleRestart, toggleCommentsWorkspace]);

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
        setReviewSnapshot(readStoredReviewSnapshot(id));
        setReviewState(createEmptyReviewState());
        setReviewPathChangeRequest(null);
        setIsPathsPanelOpen(false);
        void loadComments(id, { showLoader: true });
    }, [id, loadComments]);

    useEffect(() => {
        writeStoredReviewSnapshot(id, reviewSnapshot);
    }, [id, reviewSnapshot]);

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

    const reviewThreads = useMemo(
        () => threads.filter((thread) => isReviewComment(thread.root)),
        [threads]
    );

    const visibleThreads = useMemo(
        () => reviewThreads.filter((thread) => matchesCommentFilter(thread, commentFilter)),
        [reviewThreads, commentFilter]
    );

    const isFlowOwner = !!user && user.id === flowOwnerId;
    const dashboardMenuLabel = user ? 'Go to dashboard' : 'Sign in to dashboard';
    const editorMenuLabel = isFlowOwner ? 'Open in editor' : 'Open in canvas';

    const canManageComment = useCallback(
        (comment: FlowComment) => !!user && (comment.author_user_id === user.id || isFlowOwner),
        [isFlowOwner, user]
    );

    const canResolveThread = useCallback(
        (thread: FlowCommentThread) => canManageComment(thread.root),
        [canManageComment]
    );

    const handleDashboardNavigation = useCallback(() => {
        navigate(user ? '/' : '/login');
    }, [navigate, user]);

    const handleCanvasNavigation = useCallback(() => {
        if (!id) return;

        navigate(isFlowOwner ? `/studio/${id}` : `/share/studio/${id}`);
    }, [id, isFlowOwner, navigate]);

    const getPinPointFromClient = useCallback((clientX: number, clientY: number): PinPoint | null => {
        const surface = commentSurfaceRef.current;
        if (!surface) return null;

        const rect = surface.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) return null;

        const x = clampPercent(((clientX - rect.left) / rect.width) * 100);
        const y = clampPercent(((clientY - rect.top) / rect.height) * 100);

        return { x: Number(x.toFixed(2)), y: Number(y.toFixed(2)) };
    }, []);

    const getPinPointForElement = useCallback(
        (element: HTMLElement, localX: number, localY: number): PinPoint | null => {
            const surface = commentSurfaceRef.current;
            if (!surface) return null;

            const surfaceRect = surface.getBoundingClientRect();
            const rect = element.getBoundingClientRect();
            if (
                surfaceRect.width <= 0 ||
                surfaceRect.height <= 0 ||
                rect.width <= 0 ||
                rect.height <= 0
            ) {
                return null;
            }

            const x = clampPercent(
                ((rect.left - surfaceRect.left + rect.width * (localX / 100)) / surfaceRect.width) * 100
            );
            const y = clampPercent(
                ((rect.top - surfaceRect.top + rect.height * (localY / 100)) / surfaceRect.height) * 100
            );

            return { x: Number(x.toFixed(2)), y: Number(y.toFixed(2)) };
        },
        []
    );

    const resolveReviewAnchorFromClient = useCallback(
        (clientX: number, clientY: number) => {
            const surface = commentSurfaceRef.current;
            if (!surface) return null;

            const blocks = Array.from(
                surface.querySelectorAll<HTMLElement>('[data-review-block="true"]')
            ).filter((element) => {
                const rect = element.getBoundingClientRect();
                return rect.width > 0 && rect.height > 0;
            });

            if (blocks.length === 0) return null;

            let bestMatch: HTMLElement | null = null;
            let bestDistance = Number.POSITIVE_INFINITY;

            blocks.forEach((element) => {
                const rect = element.getBoundingClientRect();
                const dx =
                    clientX < rect.left ? rect.left - clientX : clientX > rect.right ? clientX - rect.right : 0;
                const dy =
                    clientY < rect.top ? rect.top - clientY : clientY > rect.bottom ? clientY - rect.bottom : 0;
                const distance = Math.hypot(dx, dy);

                if (distance < bestDistance) {
                    bestDistance = distance;
                    bestMatch = element;
                }
            });

            if (!bestMatch) return null;
            const matchedBlock = bestMatch as HTMLElement;

            const rect = matchedBlock.getBoundingClientRect();
            const localX = clampPercent(((clientX - rect.left) / rect.width) * 100);
            const localY = clampPercent(((clientY - rect.top) / rect.height) * 100);

            return {
                pin: getPinPointFromClient(clientX, clientY),
                reviewAnchor: {
                    anchorMode: 'review' as const,
                    anchorKind:
                        (matchedBlock.dataset.reviewAnchorKind as FlowCommentReviewAnchor['anchorKind']) ||
                        'component',
                    anchorBlockId: matchedBlock.dataset.reviewBlockId || '',
                    anchorStepId: matchedBlock.dataset.reviewStepId || '',
                    anchorComponentId: matchedBlock.dataset.reviewComponentId || null,
                    anchorHistoryIndex: Number.parseInt(matchedBlock.dataset.reviewHistoryIndex || '0', 10),
                    anchorLocalX: Number(localX.toFixed(2)),
                    anchorLocalY: Number(localY.toFixed(2)),
                    pathSignature: reviewState.pathSignature || '',
                },
            };
        },
        [getPinPointFromClient, reviewState.pathSignature]
    );

    const resolveRenderedReviewBlocks = useCallback((comment: FlowComment) => {
        const surface = commentSurfaceRef.current;
        if (!surface) {
            return {
                exactBlock: null as HTMLElement | null,
                fallbackBlock: null as HTMLElement | null,
                localX: comment.anchor_local_x ?? 50,
                localY: comment.anchor_local_y ?? 50,
            };
        }

        const localX = comment.anchor_local_x ?? 50;
        const localY = comment.anchor_local_y ?? 50;

        const exactBlock = comment.anchor_block_id
            ? surface.querySelector<HTMLElement>(
                `[data-review-block-id="${escapeReviewSelector(comment.anchor_block_id)}"]`
            )
            : null;

        let fallbackBlock: HTMLElement | null = null;

        if (!exactBlock && comment.anchor_step_id) {
            const matches = Array.from(
                surface.querySelectorAll<HTMLElement>(
                    `[data-review-step-id="${escapeReviewSelector(comment.anchor_step_id)}"]`
                )
            );

            if (matches.length > 0) {
                if (comment.anchor_history_index == null) {
                    fallbackBlock = matches[0];
                } else {
                    fallbackBlock = matches.sort((left, right) => {
                        const leftIndex = Number.parseInt(left.dataset.reviewHistoryIndex || '0', 10);
                        const rightIndex = Number.parseInt(right.dataset.reviewHistoryIndex || '0', 10);

                        return (
                            Math.abs(leftIndex - comment.anchor_history_index!) -
                            Math.abs(rightIndex - comment.anchor_history_index!)
                        );
                    })[0];
                }
            }
        }

        return { exactBlock, fallbackBlock, localX, localY };
    }, []);

    const reviewThreadEntries = useMemo<ReviewThreadRenderState[]>(() => {
        void reviewLayoutVersion;
        const surface = commentSurfaceRef.current;
        if (!surface) {
            return visibleThreads.map((thread) => ({
                thread,
                pin: null,
                status: 'rail-only',
                detail: 'Comment anchor not available yet.',
            }));
        }

        const currentPathSignature = reviewState.pathSignature || '';

        return visibleThreads.map((thread) => {
            const root = thread.root;
            const commentPathSignature = root.path_signature || '';
            const { exactBlock, fallbackBlock, localX, localY } = resolveRenderedReviewBlocks(root);

            if (exactBlock) {
                return {
                    thread,
                    pin: getPinPointForElement(exactBlock, localX, localY),
                    status: 'visible',
                    detail: null,
                };
            }

            if (fallbackBlock) {
                return {
                    thread,
                    pin: getPinPointForElement(fallbackBlock, localX, Math.min(localY, 12)),
                    status: 'outdated',
                    detail: 'Comment anchor changed after this flow updated.',
                };
            }

            if (commentPathSignature !== currentPathSignature) {
                return {
                    thread,
                    pin: null,
                    status: 'other-path',
                    detail: 'Comment was left on another review path.',
                };
            }

            return {
                thread,
                pin: null,
                status: 'rail-only',
                detail: 'Comment anchor is no longer available in this path.',
            };
        });
    }, [
        getPinPointForElement,
        resolveRenderedReviewBlocks,
        reviewLayoutVersion,
        reviewState.pathSignature,
        visibleThreads,
    ]);

    useEffect(() => {
        if (!id || !hasLoadedCommentsOnce) return;
        if (hasHandledInitialPanelVisibilityRef.current) return;

        const params = new URLSearchParams(window.location.search);
        if (params.get('comments') === '1') {
            hasHandledInitialPanelVisibilityRef.current = true;
            return;
        }

        hasHandledInitialPanelVisibilityRef.current = true;
    }, [hasLoadedCommentsOnce, id]);

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

    useEffect(() => {
        if (!pendingThreadPathNavigation) {
            lastAutoPathRequestKeyRef.current = null;
            return;
        }

        const threadEntry = reviewThreadEntries.find(
            (entry) => entry.thread.id === pendingThreadPathNavigation.threadId
        );

        if (threadEntry && threadEntry.status !== 'other-path') {
            setPendingThreadPathNavigation(null);
            lastAutoPathRequestKeyRef.current = null;
            return;
        }

        const currentSelections = new Map(
            reviewState.pathSelections.map((selection) => [selection.stepId, selection.selectedBranchId])
        );

        for (const targetSelection of pendingThreadPathNavigation.targetSelections) {
            if (currentSelections.get(targetSelection.stepId) === targetSelection.branchId) continue;

            const matchingDecision = reviewState.decisions.find(
                (decision) => decision.stepId === targetSelection.stepId
            );

            if (!matchingDecision) return;

            const requestKey = [
                pendingThreadPathNavigation.threadId,
                reviewState.pathSignature || '',
                targetSelection.stepId,
                targetSelection.branchId,
            ].join('|');

            if (lastAutoPathRequestKeyRef.current === requestKey) return;
            lastAutoPathRequestKeyRef.current = requestKey;

            setReviewPathChangeRequest({
                token: Date.now() + Math.random(),
                stepId: matchingDecision.stepId,
                branchId: targetSelection.branchId,
                mode: matchingDecision.mode,
            });
            return;
        }

        setPendingThreadPathNavigation(null);
        lastAutoPathRequestKeyRef.current = null;
    }, [
        pendingThreadPathNavigation,
        reviewState.decisions,
        reviewState.pathSelections,
        reviewState.pathSignature,
        reviewThreadEntries,
    ]);

    const activeThreadEntry = useMemo(
        () => reviewThreadEntries.find((entry) => entry.thread.id === activeThreadId) || null,
        [activeThreadId, reviewThreadEntries]
    );
    const activeThread = activeThreadEntry?.thread || null;

    useEffect(() => {
        const pendingDecision = reviewState.decisions.find((decision) => decision.mode === 'interceptor') || null;

        if (!pendingDecision) {
            lastAutoOpenPendingPathRequestKeyRef.current = null;
            return;
        }

        const pendingRequestKey = [
            pendingDecision.stepId,
            reviewState.pathSignature,
            reviewState.historyLength,
        ].join('|');

        if (lastAutoOpenPendingPathRequestKeyRef.current === pendingRequestKey) return;
        lastAutoOpenPendingPathRequestKeyRef.current = pendingRequestKey;
        setIsPathsPanelOpen(true);
    }, [reviewState.decisions, reviewState.historyLength, reviewState.pathSignature]);

    useEffect(() => {
        if (!pendingThreadRevealId) return;

        const threadEntry = reviewThreadEntries.find((entry) => entry.thread.id === pendingThreadRevealId);
        if (!threadEntry || threadEntry.status === 'other-path') return;

        const { exactBlock, fallbackBlock } = resolveRenderedReviewBlocks(threadEntry.thread.root);
        const targetBlock = exactBlock || fallbackBlock;

        if (!targetBlock) {
            setPendingThreadRevealId(null);
            return;
        }

        targetBlock.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
        setPendingThreadRevealId(null);
    }, [pendingThreadRevealId, resolveRenderedReviewBlocks, reviewThreadEntries]);

    const composerAnchor = useMemo<PinPoint | null>(() => {
        if (pendingPin) return pendingPin;
        if (!activeThreadEntry?.pin) return null;
        return activeThreadEntry.pin;
    }, [activeThreadEntry, pendingPin]);

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

    const restorePlacementMode = useCallback(() => {
        setCommentMode(isPanelOpen ? 'placing' : 'off');
    }, [isPanelOpen]);

    const dismissComposer = useCallback(() => {
        setPendingPin(null);
        setPendingReviewAnchor(null);
        setNewCommentText('');
        setActiveThreadId(null);
        setHoveredThreadId(null);
        setReplyDrafts({});
        setEditingCommentId(null);
        setEditDraft('');
        setActiveReplyThreadId(null);
        restorePlacementMode();
    }, [restorePlacementMode]);

    useEffect(() => {
        if (!isComposerOpen) return;

        const handlePointerDown = (event: PointerEvent) => {
            const target = event.target as Node | null;
            if (!target) return;
            if (composerCardRef.current?.contains(target)) return;
            if ((target as HTMLElement).closest?.('[data-comment-pin-id]')) return;
            suppressedPlacementPointerIdRef.current = event.pointerId;
            commentPlacementRef.current = null;
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
            const popoverWidth =
                popoverRect?.width ||
                (isComposerForNewComment
                    ? DEFAULT_NEW_COMMENT_WIDTH_PX
                    : DEFAULT_THREAD_COMPOSER_WIDTH_PX);
            const popoverHeight =
                popoverRect?.height ||
                (isComposerForNewComment ? DEFAULT_NEW_COMMENT_HEIGHT_PX : DEFAULT_THREAD_HEIGHT_PX);
            const gapPx = PIN_TO_POPOVER_GAP_PX;
            const anchorOffsetYPx = -PIN_TIP_TO_CIRCLE_CENTER_OFFSET_PX;

            setDesktopComposerPlacement(
                getAnchoredPopoverPosition({
                    surfaceRect,
                    anchor: composerAnchor,
                    popoverWidth,
                    popoverHeight,
                    gapPx,
                    anchorOffsetYPx,
                    anchorClearanceLeftPx: SHARE_COMMENT_PIN_TIP_TO_LEFT_EDGE_OFFSET_PX,
                    anchorClearanceRightPx: SHARE_COMMENT_PIN_TIP_TO_RIGHT_EDGE_OFFSET_PX,
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
        const surface = commentSurfaceRef.current;
        if (!surface) return;

        const scrollContainer = surface.querySelector<HTMLElement>('[data-review-scroll-container="true"]');
        if (!scrollContainer) return;

        let frameId = 0;
        const syncLayout = () => {
            window.cancelAnimationFrame(frameId);
            frameId = window.requestAnimationFrame(() => {
                setReviewLayoutVersion((version) => version + 1);
            });
        };

        syncLayout();
        scrollContainer.addEventListener('scroll', syncLayout, { passive: true });
        window.addEventListener('resize', syncLayout);

        const resizeObserver =
            typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(syncLayout);
        resizeObserver?.observe(surface);
        resizeObserver?.observe(scrollContainer);

        return () => {
            window.cancelAnimationFrame(frameId);
            scrollContainer.removeEventListener('scroll', syncLayout);
            window.removeEventListener('resize', syncLayout);
            resizeObserver?.disconnect();
        };
    }, [commentMode, isPanelOpen, resetKey, reviewState.pathSignature]);

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
        setPendingThreadPathNavigation(null);
        setPendingThreadRevealId(null);
        setPendingPin(null);
        setPendingReviewAnchor(null);
        setHoveredThreadId(null);
        setCommentMode('off');
    }, []);

    const finalizePlacedComment = useCallback(
        (clientX: number, clientY: number) => {
            const placement = resolveReviewAnchorFromClient(clientX, clientY);
            if (!placement?.pin) {
                setCommentsError('Could not place a comment here. Try again on the transcript.');
                return;
            }

            setPendingPin(placement.pin);
            setPendingReviewAnchor(placement.reviewAnchor);
            setActiveThreadId(null);
            setEditingCommentId(null);
            setEditDraft('');
            setCommentMode('off');
        },
        [resolveReviewAnchorFromClient]
    );

    const handleCommentSurfacePointerDown = useCallback(
        (event: React.PointerEvent<HTMLDivElement>) => {
            if (commentMode !== 'placing') return;
            if (event.button !== 0) return;
            if (suppressedPlacementPointerIdRef.current === event.pointerId) return;
            if ((event.target as HTMLElement).closest?.('[data-comment-placement-ignore="true"]')) return;
            if ((event.target as HTMLElement).closest?.('[data-comment-pin-id]')) return;
            if ((event.target as HTMLElement).closest?.('#share-comment-popover')) return;

            commentPlacementRef.current = {
                pointerId: event.pointerId,
                startClientX: event.clientX,
                startClientY: event.clientY,
                movedPx: 0,
            };
        },
        [commentMode]
    );

    const handleCommentSurfacePointerMove = useCallback(
        (event: React.PointerEvent<HTMLDivElement>) => {
            if (suppressedPlacementPointerIdRef.current === event.pointerId) {
                suppressedPlacementPointerIdRef.current = null;
                commentPlacementRef.current = null;
                return;
            }

            const activePlacement = commentPlacementRef.current;
            if (!activePlacement || activePlacement.pointerId !== event.pointerId) return;

            activePlacement.movedPx = Math.hypot(
                event.clientX - activePlacement.startClientX,
                event.clientY - activePlacement.startClientY
            );
        },
        []
    );

    const handleCommentSurfacePointerUp = useCallback(
        (event: React.PointerEvent<HTMLDivElement>) => {
            const activePlacement = commentPlacementRef.current;
            if (!activePlacement || activePlacement.pointerId !== event.pointerId) return;

            commentPlacementRef.current = null;

            if (activePlacement.movedPx >= COMMENT_PLACE_THRESHOLD_PX) return;

            finalizePlacedComment(event.clientX, event.clientY);
        },
        [finalizePlacedComment]
    );

    const handleCommentSurfacePointerCancel = useCallback((event?: React.PointerEvent<HTMLDivElement>) => {
        if (event && suppressedPlacementPointerIdRef.current === event.pointerId) {
            suppressedPlacementPointerIdRef.current = null;
        }
        commentPlacementRef.current = null;
    }, []);

    const handleSelectThread = useCallback((threadId: string) => {
        setPendingThreadPathNavigation(null);
        setPendingPin(null);
        setPendingReviewAnchor(null);
        setActiveThreadId(threadId);
        setEditingCommentId(null);
        setEditDraft('');
        setCommentMode('off');
        setIsPanelOpen(true);
        setHoveredThreadId(null);
    }, []);

    const handleSelectThreadFromRail = useCallback((entry: ReviewThreadRenderState) => {
        setPendingPin(null);
        setPendingReviewAnchor(null);
        setActiveThreadId(entry.thread.id);
        setEditingCommentId(null);
        setEditDraft('');
        setCommentMode('off');
        setIsPanelOpen(true);
        setHoveredThreadId(null);
        setPendingThreadRevealId(entry.thread.id);

        if (entry.status === 'other-path') {
            const targetSelections = parseReviewPathSignature(entry.thread.root.path_signature);
            if (targetSelections.length > 0) {
                setPendingThreadPathNavigation({
                    threadId: entry.thread.id,
                    targetSelections,
                });
                return;
            }
        }

        setPendingThreadPathNavigation(null);
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
            const originalThread = threads.find((thread) => thread.id === targetThreadId) || null;
            const nextPlacement = resolveReviewAnchorFromClient(event.clientX, event.clientY);
            const nextReviewAnchor = nextPlacement?.reviewAnchor;

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
                                anchor_mode: nextReviewAnchor?.anchorMode || thread.root.anchor_mode,
                                anchor_kind: nextReviewAnchor?.anchorKind || thread.root.anchor_kind,
                                anchor_block_id: nextReviewAnchor?.anchorBlockId || thread.root.anchor_block_id,
                                anchor_step_id: nextReviewAnchor?.anchorStepId || thread.root.anchor_step_id,
                                anchor_component_id:
                                    nextReviewAnchor?.anchorComponentId || thread.root.anchor_component_id,
                                anchor_history_index:
                                    nextReviewAnchor?.anchorHistoryIndex ?? thread.root.anchor_history_index,
                                anchor_local_x:
                                    nextReviewAnchor?.anchorLocalX ?? thread.root.anchor_local_x,
                                anchor_local_y:
                                    nextReviewAnchor?.anchorLocalY ?? thread.root.anchor_local_y,
                                path_signature: nextReviewAnchor?.pathSignature || thread.root.path_signature,
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
                    anchor: nextReviewAnchor || {
                        anchorMode: 'review',
                        anchorKind:
                            (originalThread?.root.anchor_kind as FlowCommentReviewAnchor['anchorKind']) ||
                            'component',
                        canvasAnchorType: null,
                        anchorBlockId: originalThread?.root.anchor_block_id || '',
                        anchorStepId: originalThread?.root.anchor_step_id || '',
                        anchorComponentId: originalThread?.root.anchor_component_id || null,
                        anchorHistoryIndex: originalThread?.root.anchor_history_index ?? 0,
                        anchorLocalX: originalThread?.root.anchor_local_x ?? 50,
                        anchorLocalY: originalThread?.root.anchor_local_y ?? 50,
                        pathSignature: originalThread?.root.path_signature || '',
                    },
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
                                anchor_mode: originalThread?.root.anchor_mode || thread.root.anchor_mode,
                                anchor_kind: originalThread?.root.anchor_kind || thread.root.anchor_kind,
                                anchor_block_id:
                                    originalThread?.root.anchor_block_id || thread.root.anchor_block_id,
                                anchor_step_id:
                                    originalThread?.root.anchor_step_id || thread.root.anchor_step_id,
                                anchor_component_id:
                                    originalThread?.root.anchor_component_id || thread.root.anchor_component_id,
                                anchor_history_index:
                                    originalThread?.root.anchor_history_index ?? thread.root.anchor_history_index,
                                anchor_local_x:
                                    originalThread?.root.anchor_local_x ?? thread.root.anchor_local_x,
                                anchor_local_y:
                                    originalThread?.root.anchor_local_y ?? thread.root.anchor_local_y,
                                path_signature:
                                    originalThread?.root.path_signature || thread.root.path_signature,
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
        [dragState, handleSelectThread, id, loadComments, resolveReviewAnchorFromClient, threads]
    );

    const handleCreateComment = async () => {
        if (!id || !pendingPin || !pendingReviewAnchor || !user) return;

        const message = newCommentText.trim();
        const authorName = commenterName.trim();

        if (!message || !authorName) return;

        setIsPostingComment(true);
        setCommentsError(null);

        try {
            await createFlowRootComment({
                flowId: id,
                authorName,
                authorUserId: user.id,
                authorAvatarUrl: commenterAvatarUrl,
                message,
                pinX: pendingPin.x,
                pinY: pendingPin.y,
                anchor: pendingReviewAnchor,
            });

            setNewCommentText('');
            setPendingPin(null);
            setPendingReviewAnchor(null);
            setActiveThreadId(null);
            setHoveredThreadId(null);
            restorePlacementMode();

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
            await loadComments(id);
        } catch (replyError: unknown) {
            console.error('Error replying to comment:', replyError);
            setCommentsError('Could not post reply. Please try again.');
        } finally {
            setActiveReplyThreadId(null);
        }
    };

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
            <CommentActionsMenu
                ariaLabel={isThreadMenu ? 'Thread actions' : 'Comment actions'}
                editLabel={isThreadMenu ? 'Edit comment' : 'Edit'}
                deleteLabel={comment.id === thread.root.id ? 'Delete thread' : 'Delete reply'}
                onEdit={() => handleStartEditComment(comment)}
                onDelete={() => openDeleteDialog(thread, comment)}
                tone={COMMENT_SURFACE_TONE}
            />
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
                    <CommentAvatar
                        name={comment.author_name}
                        avatarUrl={comment.author_avatar_url}
                        size="w-7 h-7"
                        textSize="text-[9px]"
                        tone={COMMENT_SURFACE_TONE}
                    />
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
        entry,
        compact = false,
    }: {
        entry: ReviewThreadRenderState;
        compact?: boolean;
    }) => {
        const { thread } = entry;
        const isSelected = activeThreadId === thread.id;

        return (
            <ShellSelectableRow
                key={thread.id}
                tone="cinematicDark"
                size={compact ? 'compact' : 'default'}
                selected={isSelected}
                onClick={() => handleSelectThreadFromRail(entry)}
            >
                <CommentAvatar
                    name={thread.root.author_name}
                    avatarUrl={thread.root.author_avatar_url}
                    size={compact ? 'w-6 h-6' : 'w-7 h-7'}
                    textSize={compact ? 'text-[9px]' : 'text-[10px]'}
                    tone={COMMENT_SURFACE_TONE}
                />
                <div className="min-w-0 flex-1">
                    <div className={cn('flex items-start justify-between gap-2', compact ? 'mb-0.5' : 'mb-1')}>
                        <span className={cn(compact ? 'text-[11px]' : 'text-xs', 'font-medium text-shell-dark-text truncate')}>
                            {thread.root.author_name}
                        </span>
                        <div className="flex items-center justify-end gap-2 shrink-0">
                            {thread.root.status === 'resolved' ? <CommentResolvedBadge tone={COMMENT_SURFACE_TONE} /> : null}
                            {entry.status === 'other-path' ? (
                                <span className="rounded-full border border-shell-node-condition/35 bg-[rgb(var(--shell-node-condition-surface)/1)] px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.08em] text-shell-muted">
                                    Another path
                                </span>
                            ) : null}
                            {entry.status === 'outdated' || entry.status === 'rail-only' ? (
                                <span className="rounded-full border border-shell-dark-border bg-shell-dark-surface px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.08em] text-shell-dark-muted">
                                    Outdated
                                </span>
                            ) : null}
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
                    {entry.detail ? (
                        <p className={cn(compact ? 'mt-1 text-[10px]' : 'mt-1.5 text-[10px]', 'text-shell-dark-muted')}>
                            {entry.detail}
                        </p>
                    ) : null}
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
        if (isComposerForNewComment) {
            if (!composerAnchor) return null;
            const canSubmitComment = newCommentText.trim().length > 0;
            const isCreateDisabled = isPostingComment || !canSubmitComment;

            if (!user) {
                return (
                    <div
                        className="max-w-[calc(100vw-40px)] rounded-2xl border border-shell-dark-border bg-shell-dark-panel/95 px-4 py-3 shadow-2xl backdrop-blur"
                        style={{ width: COMMENT_POPOVER_SIGN_IN_WIDTH_PX }}
                    >
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
                <div
                    className="w-full max-w-[calc(100vw-40px)]"
                    style={{ width: DEFAULT_NEW_COMMENT_WIDTH_PX }}
                >
                    <CommentComposerInputRow
                        value={newCommentText}
                        onValueChange={setNewCommentText}
                        onSubmit={() => void handleCreateComment()}
                        placeholder="Add a comment"
                        submitAriaLabel="Post comment"
                        disabled={isCreateDisabled}
                        isSubmitting={isPostingComment}
                        autoFocus
                        className="max-w-none"
                        tone={COMMENT_SURFACE_TONE}
                    />
                </div>
            );
        }

        if (!activeThread) return null;

        const replyText = replyDrafts[activeThread.id] || '';
        const canSubmitReply = replyText.trim().length > 0;
        const isReplyPosting = activeReplyThreadId === activeThread.id;
        const isReplyDisabled = isReplyPosting || !canSubmitReply;
        const canToggleThreadStatus = canResolveThread(activeThread);
        const isStatusPending = threadStatusPendingId === activeThread.id;
        const isResolved = activeThread.root.status === 'resolved';
        const threadDetail = activeThreadEntry?.detail || null;

        return (
            <div
                className="w-full max-w-[calc(100vw-40px)] rounded-3xl border border-shell-dark-border bg-shell-dark-panel/95 shadow-2xl backdrop-blur overflow-hidden"
                style={{ width: DEFAULT_THREAD_COMPOSER_WIDTH_PX }}
            >
                <div className="px-4 py-3 border-b border-shell-dark-border flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                        <h3 className="text-sm font-semibold text-shell-dark-text">Comment</h3>
                        {isResolved ? <CommentResolvedBadge tone={COMMENT_SURFACE_TONE} /> : null}
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

                {threadDetail ? (
                    <div className="px-4 py-2 border-b border-shell-dark-border bg-shell-dark-surface/35 text-[11px] text-shell-dark-muted">
                        {threadDetail}
                    </div>
                ) : null}

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
                        <CommentComposerInputRow
                            value={replyText}
                            onValueChange={(value) => handleReplyChange(activeThread.id, value)}
                            onSubmit={() => handleReplySubmit(activeThread.id)}
                            placeholder="Reply"
                            submitAriaLabel="Post reply"
                            disabled={isReplyDisabled}
                            isSubmitting={isReplyPosting}
                            tone={COMMENT_SURFACE_TONE}
                        />
                    </div>
                )}
            </div>
        );
    };

    const renderComposer = () => {
        const content = renderCommentComposerContent();
        if (!content) return null;
        const isFallbackThreadComposer =
            !composerAnchor &&
            !!activeThread &&
            !isComposerForNewComment &&
            !pendingThreadPathNavigation;

        if (!composerAnchor && !isFallbackThreadComposer) return null;

        if (shouldUseBottomSheetComposer) {
            return (
                <div className="absolute inset-x-2 bottom-2 z-[70] md:inset-x-3 md:bottom-3">
                    <div
                        ref={composerCardRef}
                        id="share-comment-popover"
                        aria-expanded={isComposerOpen}
                        className={cn(
                            'max-h-[72vh] overflow-y-auto thin-scrollbar',
                            isComposerForNewComment ? 'comment-drop-composer-enter' : null
                        )}
                    >
                        {content}
                    </div>
                </div>
            );
        }

        if (isFallbackThreadComposer) {
            return (
                <div className="absolute top-4 right-4 md:right-[356px] z-[70] pointer-events-auto">
                    <div
                        ref={composerCardRef}
                        id="share-comment-popover"
                        aria-expanded={isComposerOpen}
                        className="transition-all duration-150 ease-out"
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
                        isComposerForNewComment ? 'comment-drop-composer-enter' : null,
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
    const snapshotHistoryLength = reviewSnapshot?.history.length ?? 0;
    const snapshotPathSelectionCount = reviewSnapshot?.pathSelections.length ?? 0;
    const hasLiveReviewState = reviewState.historyLength > 0;
    const hasSnapshotPathChoices = snapshotPathSelectionCount > 0;
    const hasPathChoices = hasLiveReviewState
        ? reviewState.decisions.length > 0
        : reviewState.decisions.length > 0 || hasSnapshotPathChoices;
    const isPathPanelLoading = !hasLiveReviewState && (!snapshotHistoryLength || hasSnapshotPathChoices);
    const isPathsWorkspaceActive = isPathsPanelOpen;
    const hasDesktopPathsPanel = isPathsWorkspaceActive && !isNarrowViewport;
    const hasDesktopCommentsPanel = isCommentsWorkspaceActive && !isNarrowViewport;
    const commentsWorkspacePaddingClass =
        hasDesktopPathsPanel && hasDesktopCommentsPanel
            ? 'md:pl-[356px] md:pr-[356px]'
            : '';
    const commentsWorkspaceSurfaceStyle =
        hasDesktopPathsPanel && !hasDesktopCommentsPanel
            ? {
                  paddingLeft: '356px',
                  paddingRight: 'clamp(0px, calc(100vw - 756px), 356px)',
              }
            : !hasDesktopPathsPanel && hasDesktopCommentsPanel
                ? {
                      paddingLeft: 'clamp(0px, calc(100vw - 756px), 356px)',
                      paddingRight: '356px',
                  }
                : undefined;
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
    const renderPathSelectionControls = ({ compact = false }: { compact?: boolean } = {}) => {
        return (
            <PathsPanel
                decisions={reviewState.decisions}
                isLoading={isPathPanelLoading}
                tone="cinematicDark"
                onChangePath={(decision, branchId) => handleReviewBranchChange(decision, branchId)}
                onResetPaths={hasPathChoices ? handleRestart : undefined}
                className={compact ? 'max-h-[320px]' : 'min-h-0 flex-1'}
            />
        );
    };

    return (
        <>
            <div className="flex flex-col h-screen bg-shell-dark-bg overflow-hidden text-shell-dark-text font-sans">
                <div className="h-12 bg-shell-dark-panel flex items-center justify-between pr-4 shrink-0 shadow-md z-50 border-b border-shell-dark-border overflow-visible">
                    <div className="flex self-stretch items-stretch">
                        <ShellHeaderRail tone="cinematicDark" aria-label="Share navigation">
                            <ShellMenu>
                                <ActionTooltip content="Navigation" side="bottom">
                                    <ShellMenuTrigger asChild>
                                        <ShellHeaderRailItem
                                            tone="cinematicDark"
                                            iconOnly
                                            aria-label="Open navigation menu"
                                        >
                                            <Home />
                                        </ShellHeaderRailItem>
                                    </ShellMenuTrigger>
                                </ActionTooltip>

                                <ShellMenuContent
                                    tone="cinematicDark"
                                    size="compact"
                                    align="start"
                                    side="bottom"
                                    sideOffset={6}
                                    className="w-[196px]"
                                >
                                    <ShellMenuItem onClick={handleDashboardNavigation}>
                                        <Home size={14} className="text-current opacity-70" />
                                        <span>{dashboardMenuLabel}</span>
                                    </ShellMenuItem>
                                    <ShellMenuSeparator />
                                    <ShellMenuItem onClick={handleCanvasNavigation}>
                                        {isFlowOwner ? (
                                            <Pencil size={14} className="text-current opacity-70" />
                                        ) : (
                                            <Monitor size={14} className="text-current opacity-70" />
                                        )}
                                        <span>{editorMenuLabel}</span>
                                    </ShellMenuItem>
                                </ShellMenuContent>
                            </ShellMenu>

                            <ActionTooltip content="Comments" shortcut="C" side="bottom">
                                <ShellHeaderRailItem
                                    tone="cinematicDark"
                                    iconOnly
                                    active={isCommentsWorkspaceActive}
                                    onClick={toggleCommentsWorkspace}
                                    aria-label="Toggle comments"
                                    aria-keyshortcuts="C"
                                    aria-pressed={isCommentsWorkspaceActive}
                                    aria-controls="share-comment-popover"
                                >
                                    <MessageSquare />
                                </ShellHeaderRailItem>
                            </ActionTooltip>

                            <ActionTooltip content="Paths" side="bottom">
                                <ShellHeaderRailItem
                                    tone="cinematicDark"
                                    iconOnly
                                    active={isPathsWorkspaceActive}
                                    onClick={togglePathsPanel}
                                    aria-label="Toggle paths"
                                    aria-pressed={isPathsWorkspaceActive}
                                >
                                    <Split />
                                </ShellHeaderRailItem>
                            </ActionTooltip>
                        </ShellHeaderRail>
                    </div>

                    <div className="absolute left-1/2 flex max-w-[34vw] -translate-x-1/2 items-center gap-2 px-4">
                        <span className="truncate text-sm font-medium text-shell-dark-text">{flow.title}</span>
                    </div>

                    <div className="flex items-center gap-2">
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
                            <ActionTooltip content="Restart" shortcut="R" side="bottom">
                                <PreviewHeaderActionButton
                                    tone="cinematicDark"
                                    onClick={handleRestart}
                                    aria-keyshortcuts="R"
                                >
                                    <RotateCcw size={14} />
                                    Restart
                                </PreviewHeaderActionButton>
                            </ActionTooltip>
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

                <div
                    className={cn(
                        'flex-1 flex items-center justify-center overflow-hidden relative',
                        commentsWorkspacePaddingClass
                    )}
                    style={commentsWorkspaceSurfaceStyle}
                >
                    <div ref={commentSurfaceRef} className="w-full h-full relative">
                        {isPathsWorkspaceActive ? (
                            <div className="md:hidden absolute top-2 left-2 right-2 z-[55] max-w-[calc(100%-1rem)] pointer-events-none">
                                <div
                                    data-comment-placement-ignore="true"
                                    className={cn(
                                        'pointer-events-auto inline-flex max-w-full flex-col items-stretch rounded-2xl border border-shell-dark-border bg-shell-dark-panel/95 shadow-xl backdrop-blur'
                                    )}
                                >
                                    <div className="p-3 border-b border-shell-dark-border flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <Split size={14} className="shrink-0 text-shell-node-condition" />
                                            <h2 className="text-sm font-medium text-shell-dark-text">Paths</h2>
                                        </div>
                                        <ShellIconButton
                                            size="sm"
                                            tone="cinematicDark"
                                            onClick={() => setIsPathsPanelOpen(false)}
                                            aria-label="Close paths panel"
                                        >
                                            <X size={14} />
                                        </ShellIconButton>
                                    </div>
                                    <div className="max-h-[320px] overflow-y-auto thin-scrollbar">
                                        {renderPathSelectionControls({ compact: true })}
                                    </div>
                                </div>
                            </div>
                        ) : null}

                        <div
                            className="w-full h-full"
                            onPointerDown={handleCommentSurfacePointerDown}
                            onPointerMove={handleCommentSurfacePointerMove}
                            onPointerUp={handleCommentSurfacePointerUp}
                            onPointerCancel={handleCommentSurfacePointerCancel}
                            style={
                                commentMode === 'placing'
                                    ? { touchAction: 'pan-y', cursor: COMMENT_PLACEMENT_CURSOR }
                                    : undefined
                            }
                        >
                            <FlowPreview
                                key={resetKey}
                                flow={flow}
                                isPremium={isPremium}
                                isMobile={isMobile}
                                variables={{}}
                                desktopPosition="center"
                                reviewMode={isCommentsWorkspaceActive}
                                initialReviewSnapshot={reviewSnapshot}
                                onReviewStateChange={setReviewState}
                                onReviewSnapshotChange={setReviewSnapshot}
                                reviewPathChangeRequest={reviewPathChangeRequest}
                                showInlinePathControls={false}
                                showEndOfFlowIndicator={true}
                            />
                        </div>

                        {showPins ? (
                            <div className="absolute inset-0 z-30 pointer-events-none">
                                {reviewThreadEntries.map((entry) => {
                                    const { thread, pin } = entry;
                                    const root = thread.root;
                                    if (!pin) return null;

                                    const isSelected = activeThreadId === thread.id;
                                    const isDraggingThisPin = dragState?.threadId === thread.id;
                                    const effectivePin = isDraggingThisPin
                                        ? dragState.draftPin
                                        : pin;
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
                                    const pinTone = isSelected
                                        ? 'selected'
                                        : isResolvedThread
                                          ? 'resolved'
                                          : 'default';

                                    return (
                                        <div
                                            key={thread.id}
                                            className={cn(
                                                'absolute pointer-events-none',
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
                                                top: `calc(${effectivePin.y}% - ${SHARE_COMMENT_PIN_TIP_OFFSET_PX}px)`,
                                                transform: `translateX(-${SHARE_COMMENT_PIN_TIP_X_OFFSET_PX}px)`,
                                            }}
                                        >
                                            <ShellButton
                                                size="compact"
                                                variant="ghost"
                                                className={cn(
                                                    'relative rounded-none border-0 bg-transparent shadow-none transition-all duration-150 ease-out pointer-events-auto p-0 hover:bg-transparent focus-visible:ring-0 focus-visible:outline-none',
                                                    isSelected || isHovered ? 'scale-105' : 'scale-100',
                                                    isDraggingThisPin ? 'scale-110 drop-shadow-2xl' : '',
                                                    isResolvedThread && !isSelected ? 'opacity-90' : ''
                                                )}
                                                style={{
                                                    width: SHARE_COMMENT_PIN_WIDTH_PX,
                                                    height: SHARE_COMMENT_PIN_HEIGHT_PX,
                                                    cursor: CANVAS_DEFAULT_CURSOR,
                                                }}
                                                data-comment-pin-id={thread.id}
                                                onPointerDown={(event) =>
                                                    handlePinPointerDown(
                                                        event,
                                                        thread.id,
                                                        root.id,
                                                        pin,
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
                                                <ShareCommentPin
                                                    name={root.author_name}
                                                    avatarUrl={root.author_avatar_url}
                                                    tone={pinTone}
                                                    surfaceTone={COMMENT_SURFACE_TONE}
                                                />
                                            </ShellButton>

                                            <CommentThreadHoverPreview
                                                visible={canShowHoverPreview}
                                                ariaLabel={`Preview thread by ${root.author_name}`}
                                                authorName={root.author_name}
                                                authorAvatarUrl={root.author_avatar_url}
                                                isResolved={isResolvedThread}
                                                relativeTimeLabel={formatCommentRelativeTime(thread.latestActivityAt)}
                                                timeTitle={formatCommentDate(thread.latestActivityAt)}
                                                previewText={getPreviewText(root.message)}
                                                detail={entry.detail}
                                                replyCount={thread.replies.length}
                                                tone={COMMENT_SURFACE_TONE}
                                                style={{
                                                    left:
                                                        SHARE_COMMENT_PIN_WIDTH_PX -
                                                        SHARE_COMMENT_PIN_TIP_X_OFFSET_PX +
                                                        COMMENT_THREAD_HOVER_PREVIEW_GAP_PX,
                                                    top: SHARE_COMMENT_PIN_HEAD_CENTER_OFFSET_PX,
                                                }}
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
                                            />
                                        </div>
                                    );
                                })}

                                {pendingPin ? (
                                    <div
                                        className="absolute z-50"
                                        style={{
                                            left: `${pendingPin.x}%`,
                                            top: `calc(${pendingPin.y}% - ${SHARE_COMMENT_PIN_TIP_OFFSET_PX}px)`,
                                            transform: `translateX(-${SHARE_COMMENT_PIN_TIP_X_OFFSET_PX}px)`,
                                        }}
                                    >
                                        <div className="comment-drop-pin-enter">
                                            <ShareCommentPin
                                                name="New comment"
                                                tone="pending"
                                                pending={true}
                                                surfaceTone={COMMENT_SURFACE_TONE}
                                            />
                                        </div>
                                    </div>
                                ) : null}
                            </div>
                        ) : null}

                        {renderComposer()}
                    </div>

                    {isPathsWorkspaceActive ? (
                        <div className="hidden md:block absolute top-3 left-3 bottom-3 w-[340px] z-[60]">
                            <div className="h-full w-full bg-shell-dark-panel border border-shell-dark-border rounded-xl shadow-2xl overflow-hidden flex flex-col">
                                <div className="p-3 border-b border-shell-dark-border flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <Split size={14} className="shrink-0 text-shell-node-condition" />
                                        <h2 className="text-sm font-medium text-shell-dark-text">Paths</h2>
                                    </div>
                                    <ShellIconButton
                                        size="sm"
                                        tone="cinematicDark"
                                        onClick={() => setIsPathsPanelOpen(false)}
                                        aria-label="Close paths panel"
                                    >
                                        <X size={14} />
                                    </ShellIconButton>
                                </div>

                                <div className="flex-1 overflow-y-auto thin-scrollbar">
                                    {renderPathSelectionControls()}
                                </div>
                            </div>
                        </div>
                    ) : null}

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
                                                <p className="text-xs leading-relaxed text-shell-dark-muted">
                                                    {commentsEmptyState.description}
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="px-2 py-2 space-y-1.5">
                                                {reviewThreadEntries.map((entry) =>
                                                    renderThreadListItem({ entry })
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
                                                <p className="text-shell-dark-muted">
                                                    {commentsEmptyState.description}
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="px-2 py-2 space-y-1">
                                                {reviewThreadEntries.map((entry) =>
                                                    renderThreadListItem({ entry, compact: true })
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
