import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AlertCircle, Loader2 } from 'lucide-react';
import { CanvasEditor } from '@/views/studio-canvas/CanvasEditor';
import { Flow } from '@/views/studio/types';
import { flowStorage, INITIAL_FLOW } from '@/utils/flowStorage';
import { PreviewDrawer } from '@/views/studio/PreviewDrawer';
import { CanvasCommentsDrawer } from '@/views/studio/CanvasCommentsDrawer';
import { useCanvasCommentsController } from '@/views/studio/useCanvasCommentsController';
import { ShellButton } from '@/components/shell';
import { toast } from 'sonner';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/hooks/useAuth';
import {
    buildProjectDocumentTitle,
    buildProjectLoadingDocumentTitle,
    buildProjectUnavailableDocumentTitle,
    useDocumentTitle,
} from '@/hooks/useDocumentTitle';
import { startGoogleSignInRedirect } from '@/utils/authRedirect';
import {
    buildShareDuplicateRedirectUrl,
    clearPendingShareDuplicateFromCurrentUrl,
    duplicateSharedFlowForCurrentUser,
    hasPendingShareDuplicate,
    markProjectDuplicatedToastPending,
} from '@/utils/projectDuplication';
import { claimFlowEditLock, releaseFlowEditLock, type FlowEditLockState } from './shareEditing';

type ShareStudioRightPanelMode = 'preview' | 'comments' | null;
const SHARED_STUDIO_PLAY_HINT_DISMISSED_KEY = 'shared-studio-play-hint-dismissed';

type PreviewEntryRequest = {
    stepId: string | null;
    token: number;
};

type SharedBannerState = {
    title: string;
    description: string;
    primaryActionLabel?: string;
    onPrimaryAction?: () => void;
    secondaryActionLabel?: string;
    onSecondaryAction?: () => void;
    secondaryActionDisabled?: boolean;
};

export const ShareStudioView = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { state } = useApp();
    const { user, isLoading: isAuthLoading } = useAuth();

    const [flow, setFlow] = useState<Flow | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isPremium, setIsPremium] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [showComments, setShowComments] = useState(true);
    const [isCommentModeActive, setIsCommentModeActive] = useState(false);
    const [rightPanelMode, setRightPanelMode] = useState<ShareStudioRightPanelMode>(null);
    const [previewEntryRequest, setPreviewEntryRequest] = useState<PreviewEntryRequest | null>(null);
    const [isDuplicatingProject, setIsDuplicatingProject] = useState(false);
    const [editLockState, setEditLockState] = useState<FlowEditLockState | null>(null);
    const [isCheckingEditAccess, setIsCheckingEditAccess] = useState(false);
    const [isPlayHintDismissed, setIsPlayHintDismissed] = useState(() => {
        if (typeof window === 'undefined') return false;

        try {
            return window.localStorage.getItem(SHARED_STUDIO_PLAY_HINT_DISMISSED_KEY) === '1';
        } catch {
            return false;
        }
    });
    const hasHandledPendingDuplicateRef = useRef(false);
    const pendingDeepLinkThreadIdRef = useRef<string | null>(null);
    const hasShownSharedSaveErrorRef = useRef(false);
    const documentTitle = loading
        ? buildProjectLoadingDocumentTitle()
        : error
            ? buildProjectUnavailableDocumentTitle()
            : buildProjectDocumentTitle(flow?.title, 'shared');

    useDocumentTitle(documentTitle);

    useEffect(() => {
        hasHandledPendingDuplicateRef.current = false;
        setEditLockState(null);
        hasShownSharedSaveErrorRef.current = false;
    }, [id]);

    useEffect(() => {
        const fetchFlow = async () => {
            if (!id) {
                setError('Missing flow id.');
                setLoading(false);
                return;
            }

            try {
                const loadedFlow = await flowStorage.getFlow(id);
                if (!loadedFlow) throw new Error('Flow not found');
                setFlow(loadedFlow);
            } catch (loadFlowError: unknown) {
                console.error('Error loading shared studio flow:', loadFlowError);
                setError(
                    loadFlowError instanceof Error
                        ? loadFlowError.message
                        : 'This flow is either private or does not exist.'
                );
            } finally {
                setLoading(false);
            }
        };

        void fetchFlow();
    }, [id]);

    useEffect(() => {
        const html = document.documentElement;
        const body = document.body;
        const previousHtmlOverscrollX = html.style.overscrollBehaviorX;
        const previousBodyOverscrollX = body.style.overscrollBehaviorX;

        html.style.overscrollBehaviorX = 'none';
        body.style.overscrollBehaviorX = 'none';

        return () => {
            html.style.overscrollBehaviorX = previousHtmlOverscrollX;
            body.style.overscrollBehaviorX = previousBodyOverscrollX;
        };
    }, []);

    const refreshEditLock = useCallback(async (quiet: boolean = false) => {
        if (!id || !user) {
            setEditLockState(null);
            return null;
        }

        if (!quiet) {
            setIsCheckingEditAccess(true);
        }

        try {
            const nextLockState = await claimFlowEditLock(id);
            setEditLockState(nextLockState);
            return nextLockState;
        } catch (lockError) {
            console.error('Error claiming shared flow edit lock:', lockError);
            if (!quiet) {
                toast.error('Could not confirm edit access. Please try again.');
            }
            setEditLockState({
                granted: false,
                reason: 'unknown',
                holderUserId: null,
                holderDisplayName: null,
                holderAvatarUrl: null,
                expiresAt: null,
            });
            return null;
        } finally {
            if (!quiet) {
                setIsCheckingEditAccess(false);
            }
        }
    }, [id, user]);

    const isPreviewOpen = rightPanelMode === 'preview';
    const isCommentsOpen = rightPanelMode === 'comments';
    const commentTone = state.theme === 'dark' ? 'cinematicDark' : 'default';
    const areCanvasCommentsVisible = !!flow && (showComments || isCommentsOpen || isCommentModeActive);
    const canvasComments = useCanvasCommentsController({
        flow: flow ?? INITIAL_FLOW,
        isVisible: areCanvasCommentsVisible,
    });

    const openPreview = useCallback((stepId: string | null) => {
        setPreviewEntryRequest({
            stepId,
            token: Date.now() + Math.random(),
        });
        setRightPanelMode('preview');
        setIsCommentModeActive(false);
        canvasComments.resetClosedState();
    }, [canvasComments]);

    const handleTogglePreview = useCallback(() => {
        setRightPanelMode((currentMode) => (currentMode === 'preview' ? null : 'preview'));

        if (!isPreviewOpen) {
            openPreview(null);
            return;
        }

        setIsCommentModeActive(false);
        canvasComments.resetClosedState();
    }, [canvasComments, isPreviewOpen, openPreview]);

    const handlePreviewFromTurn = useCallback((turnId: string) => {
        openPreview(turnId);
    }, [openPreview]);

    const dismissPlayHint = useCallback(() => {
        setIsPlayHintDismissed(true);

        try {
            window.localStorage.setItem(SHARED_STUDIO_PLAY_HINT_DISMISSED_KEY, '1');
        } catch {
            // Ignore storage failures so the shared experience still works.
        }
    }, []);

    const handleToggleCommentsWorkspace = () => {
        if (isCommentsOpen || isCommentModeActive) {
            setRightPanelMode((currentMode) => (currentMode === 'comments' ? null : currentMode));
            setIsCommentModeActive(false);
            canvasComments.resetClosedState();
            return;
        }

        setShowComments(true);
        canvasComments.resetClosedState();
        setRightPanelMode('comments');
        setIsCommentModeActive(canvasComments.userCanComment);
    };

    const handleOpenCommentsPanel = () => {
        setShowComments(true);
        setRightPanelMode('comments');
    };

    const handleShowCommentsChange = (checked: boolean) => {
        setShowComments(checked);

        if (checked) {
            return;
        }

        setIsCommentModeActive(false);
        setRightPanelMode((currentMode) => (currentMode === 'comments' ? null : currentMode));
        canvasComments.resetClosedState();
    };

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const threadId = params.get('thread');
        const shouldOpenComments = params.get('comments') === '1' || !!threadId;
        if (!shouldOpenComments) return;

        setShowComments(true);
        setRightPanelMode('comments');
        pendingDeepLinkThreadIdRef.current = threadId;
    }, []);

    useEffect(() => {
        const pendingThreadId = pendingDeepLinkThreadIdRef.current;
        if (!pendingThreadId || canvasComments.isLoading) return;

        const hasTargetThread = canvasComments.threads.some((thread) => thread.id === pendingThreadId);
        if (!hasTargetThread) {
            pendingDeepLinkThreadIdRef.current = null;
            return;
        }

        setShowComments(true);
        setRightPanelMode('comments');
        canvasComments.selectThread(pendingThreadId, { reveal: true });
        pendingDeepLinkThreadIdRef.current = null;
    }, [canvasComments, canvasComments.isLoading, canvasComments.threads]);

    useEffect(() => {
        if (loading || isAuthLoading || !flow?.id || !user) {
            if (!user) {
                setEditLockState(null);
            }
            return;
        }

        void refreshEditLock();
    }, [flow?.id, isAuthLoading, loading, refreshEditLock, user]);

    useEffect(() => {
        if (!id || !user || !editLockState?.granted) return;

        const intervalId = window.setInterval(() => {
            void refreshEditLock(true);
        }, 30000);

        return () => {
            window.clearInterval(intervalId);
        };
    }, [editLockState?.granted, id, refreshEditLock, user]);

    useEffect(() => {
        if (!id || !user || !editLockState?.granted) return;

        return () => {
            void releaseFlowEditLock(id).catch((releaseError) => {
                console.error('Error releasing shared flow edit lock:', releaseError);
            });
        };
    }, [editLockState?.granted, id, user]);

    const canEditSharedFlow = !!user && editLockState?.granted === true;

    useEffect(() => {
        if (loading || !flow || !canEditSharedFlow) return;

        const saveDebounce = window.setTimeout(() => {
            void flowStorage.saveFlow(flow).then((didSave) => {
                if (didSave) {
                    hasShownSharedSaveErrorRef.current = false;
                    return;
                }

                if (!hasShownSharedSaveErrorRef.current) {
                    toast.error('Could not save shared changes. Please refresh and try again.');
                    hasShownSharedSaveErrorRef.current = true;
                }
            });
        }, 1000);

        return () => {
            window.clearTimeout(saveDebounce);
        };
    }, [canEditSharedFlow, flow, loading]);

    const handleCommentSignIn = async () => {
        try {
            const redirectUrl = new URL(window.location.href);
            redirectUrl.searchParams.set('comments', '1');

            await startGoogleSignInRedirect(redirectUrl.toString());
        } catch (signInError: unknown) {
            console.error('Error signing in for shared studio comments:', signInError);
            toast.error('Could not start sign-in. Please try again.');
        }
    };

    const handleEditSignIn = useCallback(async () => {
        try {
            await startGoogleSignInRedirect(window.location.href);
        } catch (signInError: unknown) {
            console.error('Error starting sign-in for shared editing:', signInError);
            toast.error('Could not start sign-in. Please try again.');
        }
    }, []);

    const completeProjectDuplication = useCallback(async () => {
        if (!flow || isDuplicatingProject) return;

        setIsDuplicatingProject(true);
        if (hasPendingShareDuplicate()) {
            clearPendingShareDuplicateFromCurrentUrl();
        }

        try {
            await duplicateSharedFlowForCurrentUser(flow);
            markProjectDuplicatedToastPending();
            navigate('/', { replace: true });
        } catch (duplicateError: unknown) {
            console.error('Error duplicating shared studio project:', duplicateError);
            toast.error('Failed to duplicate project. Please try again.');
        } finally {
            setIsDuplicatingProject(false);
        }
    }, [flow, isDuplicatingProject, navigate]);

    const handleDuplicateProject = useCallback(async () => {
        if (!flow || isDuplicatingProject) return;

        if (!user) {
            try {
                await startGoogleSignInRedirect(buildShareDuplicateRedirectUrl(window.location.href));
            } catch (signInError: unknown) {
                console.error('Error starting sign-in for project duplication:', signInError);
                toast.error('Could not start sign-in. Please try again.');
            }
            return;
        }

        await completeProjectDuplication();
    }, [completeProjectDuplication, flow, isDuplicatingProject, user]);

    useEffect(() => {
        if (isAuthLoading) return;
        if (user) return;
        if (!hasPendingShareDuplicate()) return;

        clearPendingShareDuplicateFromCurrentUrl();
    }, [isAuthLoading, user]);

    useEffect(() => {
        if (hasHandledPendingDuplicateRef.current) return;
        if (!flow || isAuthLoading || !user) return;
        if (!hasPendingShareDuplicate()) return;

        hasHandledPendingDuplicateRef.current = true;
        void completeProjectDuplication();
    }, [completeProjectDuplication, flow, isAuthLoading, user]);

    const isEmptyFlow = useMemo(() => {
        if (!flow) return false;
        return (flow.steps?.length || 0) === 0 && (flow.blocks?.length || 0) === 0;
    }, [flow]);

    useEffect(() => {
        if (!isPreviewOpen || isPlayHintDismissed) return;
        dismissPlayHint();
    }, [dismissPlayHint, isPlayHintDismissed, isPreviewOpen]);

    const sharedBanner: SharedBannerState | null = !user && !isAuthLoading
        ? {
              title: 'Sign in to edit this shared project',
              description: 'Anyone with the edit link can change the shared file after signing in.',
              primaryActionLabel: 'Sign in to edit',
              onPrimaryAction: () => {
                  void handleEditSignIn();
              },
          }
        : isCheckingEditAccess && !editLockState
            ? {
                  title: 'Checking edit access',
                  description: 'One person can edit at a time, so we are confirming whether this file is free.',
              }
            : !canEditSharedFlow
                ? {
                      title:
                          editLockState?.reason === 'locked'
                              ? `${editLockState.holderDisplayName || 'Another editor'} is editing right now`
                              : 'This shared project is currently view-only',
                      description:
                          editLockState?.reason === 'locked'
                              ? 'You can still review the canvas, but editing will unlock after they leave or the lock expires.'
                              : 'Refresh to try claiming the edit lock again, or duplicate the project into your own workspace.',
                      primaryActionLabel: 'Refresh edit access',
                      onPrimaryAction: () => {
                          void refreshEditLock();
                      },
                      secondaryActionLabel: isDuplicatingProject ? 'Duplicating...' : 'Duplicate project',
                      onSecondaryAction: () => {
                          void handleDuplicateProject();
                      },
                      secondaryActionDisabled: isDuplicatingProject,
                  }
                : null;

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-shell-surface">
                <Loader2 className="w-8 h-8 animate-spin text-shell-muted" />
            </div>
        );
    }

    if (error || !flow) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-shell-surface p-4">
                <div className="bg-shell-bg p-8 rounded-2xl shadow-xl border border-shell-border max-w-md w-full text-center">
                    <div className="w-12 h-12 bg-shell-danger-soft rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-6 h-6 text-shell-danger" />
                    </div>
                    <h1 className="text-xl font-semibold text-shell-text mb-2">Access Denied</h1>
                    <p className="text-shell-muted mb-6">{error || 'Unable to load flow.'}</p>
                    <ShellButton
                        onClick={() => navigate('/')}
                    >
                        Go Home
                    </ShellButton>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen w-full relative">
            {sharedBanner ? (
                <div className="absolute left-1/2 top-[70px] z-[70] w-[min(720px,calc(100%-2rem))] -translate-x-1/2">
                    <div className="rounded-2xl border border-shell-border bg-shell-bg/95 px-5 py-4 shadow-xl backdrop-blur-sm">
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-shell-text">{sharedBanner.title}</p>
                                <p className="mt-1 text-sm text-shell-muted">{sharedBanner.description}</p>
                            </div>
                            <div className="flex shrink-0 items-center gap-2">
                                {sharedBanner.onSecondaryAction ? (
                                    <ShellButton
                                        variant="outline"
                                        size="sm"
                                        onClick={sharedBanner.onSecondaryAction}
                                        disabled={sharedBanner.secondaryActionDisabled}
                                    >
                                        {sharedBanner.secondaryActionLabel}
                                    </ShellButton>
                                ) : null}
                                {sharedBanner.onPrimaryAction ? (
                                    <ShellButton size="sm" onClick={sharedBanner.onPrimaryAction}>
                                        {sharedBanner.primaryActionLabel}
                                    </ShellButton>
                                ) : (
                                    <div className="flex items-center gap-2 rounded-full bg-shell-surface px-3 py-1.5 text-xs text-shell-muted">
                                        <Loader2 size={12} className="animate-spin" />
                                        <span>Checking…</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ) : null}

            <CanvasEditor
                flow={flow}
                onUpdateFlow={setFlow}
                onBack={() => navigate(user ? '/' : '/login')}
                backItemLabel={user ? 'Go to dashboard' : 'Sign in to dashboard'}
                onPreview={handleTogglePreview}
                onPreviewFromTurn={handlePreviewFromTurn}
                isPreviewActive={isPreviewOpen}
                onToggleComments={handleToggleCommentsWorkspace}
                onOpenCommentsPanel={handleOpenCommentsPanel}
                isCommentModeActive={isCommentModeActive}
                isCommentsPanelOpen={isCommentsOpen}
                comments={areCanvasCommentsVisible ? canvasComments : null}
                commentSurfaceTone={commentTone}
                showCommentsToggle={{
                    checked: showComments,
                    onCheckedChange: handleShowCommentsChange,
                }}
                mode={canEditSharedFlow ? 'edit' : 'share-commentable'}
                menuActionItems={[{
                    label: isDuplicatingProject ? 'Duplicating...' : 'Duplicate project',
                    onSelect: () => {
                        void handleDuplicateProject();
                    },
                    disabled: isDuplicatingProject,
                }]}
                useSectionedUserMenu
                onCommentSignIn={handleCommentSignIn}
                previewCoachmark={
                    !isEmptyFlow && !isPreviewOpen && !isPlayHintDismissed
                        ? {
                              message: 'Click here to play prototype',
                              onDismiss: dismissPlayHint,
                          }
                        : undefined
                }
            />

            <PreviewDrawer
                isOpen={isPreviewOpen}
                onClose={() => setRightPanelMode(null)}
                flow={flow}
                onUpdateFlow={setFlow}
                isPremium={isPremium}
                isMobile={isMobile}
                previewEntryRequest={previewEntryRequest}
                onTogglePremium={() => setIsPremium((prev) => !prev)}
                onToggleMobile={() => setIsMobile((prev) => !prev)}
            />

            <CanvasCommentsDrawer
                isOpen={isCommentsOpen}
                onClose={() => {
                    setRightPanelMode(null);
                    setIsCommentModeActive(false);
                    canvasComments.resetClosedState();
                }}
                comments={canvasComments}
                onRequestSignIn={canvasComments.userCanComment ? undefined : handleCommentSignIn}
                desktopPresentation="card"
                tone={commentTone}
            />

            {isEmptyFlow ? (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="bg-shell-bg/90 border border-shell-border rounded-xl px-5 py-4 shadow-lg backdrop-blur-sm">
                        <p className="text-sm font-medium text-shell-text">No canvas nodes yet</p>
                        <p className="text-xs text-shell-muted mt-1">
                            This shared studio flow is currently empty.
                        </p>
                    </div>
                </div>
            ) : null}
        </div>
    );
};

export default ShareStudioView;
