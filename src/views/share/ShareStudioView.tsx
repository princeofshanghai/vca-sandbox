import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AlertCircle, Loader2 } from 'lucide-react';
import { CanvasEditor } from '@/views/studio-canvas/CanvasEditor';
import { Flow } from '@/views/studio/types';
import { INITIAL_FLOW } from '@/utils/flowStorage';
import { supabase } from '@/lib/supabase';
import { PreviewDrawer } from '@/views/studio/PreviewDrawer';
import { CanvasCommentsDrawer } from '@/views/studio/CanvasCommentsDrawer';
import { useCanvasCommentsController } from '@/views/studio/useCanvasCommentsController';
import { ShellButton } from '@/components/shell';
import { toast } from 'sonner';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/hooks/useAuth';
import { startGoogleSignInRedirect } from '@/utils/authRedirect';
import {
    buildShareDuplicateRedirectUrl,
    clearPendingShareDuplicateFromCurrentUrl,
    duplicateSharedFlowForCurrentUser,
    hasPendingShareDuplicate,
    markProjectDuplicatedToastPending,
} from '@/utils/projectDuplication';

type ShareStudioRightPanelMode = 'preview' | 'comments' | null;

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
    const [isDuplicatingProject, setIsDuplicatingProject] = useState(false);
    const hasHandledPendingDuplicateRef = useRef(false);

    useEffect(() => {
        hasHandledPendingDuplicateRef.current = false;
    }, [id]);

    useEffect(() => {
        const fetchFlow = async () => {
            if (!id) {
                setError('Missing flow id.');
                setLoading(false);
                return;
            }

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
                    is_public: data.is_public,
                    lastModified: new Date(data.updated_at).getTime(),
                };

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

    const isPreviewOpen = rightPanelMode === 'preview';
    const isCommentsOpen = rightPanelMode === 'comments';
    const commentTone = state.theme === 'dark' ? 'cinematicDark' : 'default';
    const areCanvasCommentsVisible = !!flow && (showComments || isCommentsOpen || isCommentModeActive);
    const canvasComments = useCanvasCommentsController({
        flow: flow ?? INITIAL_FLOW,
        isVisible: areCanvasCommentsVisible,
    });

    const handleTogglePreview = () => {
        setRightPanelMode((currentMode) => (currentMode === 'preview' ? null : 'preview'));
        setIsCommentModeActive(false);
        canvasComments.resetClosedState();
    };

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
        if (params.get('comments') !== '1') return;

        setShowComments(true);
        setRightPanelMode('comments');

        const nextUrl = new URL(window.location.href);
        nextUrl.searchParams.delete('comments');
        const nextSearch = nextUrl.search ? nextUrl.search : '';
        window.history.replaceState({}, '', `${nextUrl.pathname}${nextSearch}${nextUrl.hash}`);
    }, []);

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
            <CanvasEditor
                flow={flow}
                onUpdateFlow={setFlow}
                onBack={() => navigate(user ? '/' : '/login')}
                backItemLabel={user ? 'Go to dashboard' : 'Sign in to dashboard'}
                onPreview={handleTogglePreview}
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
                mode="share-commentable"
                menuActionItems={[{
                    label: isDuplicatingProject ? 'Duplicating...' : 'Duplicate project',
                    onSelect: () => {
                        void handleDuplicateProject();
                    },
                    disabled: isDuplicatingProject,
                }]}
                useSectionedUserMenu
                onCommentSignIn={handleCommentSignIn}
            />

            <PreviewDrawer
                isOpen={isPreviewOpen}
                onClose={() => setRightPanelMode(null)}
                flow={flow}
                onUpdateFlow={setFlow}
                isPremium={isPremium}
                isMobile={isMobile}
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
