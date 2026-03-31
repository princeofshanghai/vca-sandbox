import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { PreviewDrawer } from './PreviewDrawer';
import { CanvasCommentsDrawer } from './CanvasCommentsDrawer';
import { CanvasEditor } from '../studio-canvas/CanvasEditor';
import { useStudioFlow } from './hooks/useStudioFlow';
import { useFlowHistory } from './hooks/useFlowHistory';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { useCanvasCommentsController } from './useCanvasCommentsController';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/hooks/useAuth';
import {
    buildProjectDocumentTitle,
    buildProjectLoadingDocumentTitle,
    useDocumentTitle,
} from '@/hooks/useDocumentTitle';
import { flowStorage } from '@/utils/flowStorage';
import {
    duplicateFlowForCurrentUser,
    markProjectDuplicatedToastPending,
} from '@/utils/projectDuplication';
import { toast } from 'sonner';

type StudioRightPanelMode = 'preview' | 'comments' | null;

export const StudioView = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { state } = useApp();
    const { user } = useAuth();

    // Custom hook handles loading and persistence
    const { flow, setFlow, isLoading } = useStudioFlow(id, user?.id);
    const { setFlowWithHistory, undo, redo } = useFlowHistory(flow, setFlow);
    const documentTitle = isLoading
        ? buildProjectLoadingDocumentTitle()
        : buildProjectDocumentTitle(flow.title);

    useDocumentTitle(documentTitle);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
                if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

                e.preventDefault();
                if (e.shiftKey) {
                    redo();
                } else {
                    undo();
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [undo, redo]);

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

    useEffect(() => {
        if (isLoading || !id || !user || !flow.ownerUserId) return;
        if (flow.ownerUserId === user.id) return;

        navigate(`/share/studio/${id}`, { replace: true });
    }, [flow.ownerUserId, id, isLoading, navigate, user]);

    const [isPremium, setIsPremium] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [showComments, setShowComments] = useState(true);
    const [isCommentModeActive, setIsCommentModeActive] = useState(false);
    const [rightPanelMode, setRightPanelMode] = useState<StudioRightPanelMode>(null);
    const [isDuplicatingProject, setIsDuplicatingProject] = useState(false);

    const handleBack = () => {
        navigate('/');
    };

    const isPreviewOpen = rightPanelMode === 'preview';
    const isCommentsOpen = rightPanelMode === 'comments';
    const commentTone = state.theme === 'dark' ? 'cinematicDark' : 'default';
    const areCanvasCommentsVisible = showComments || isCommentsOpen || isCommentModeActive;
    const canvasComments = useCanvasCommentsController({
        flow,
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
        setIsCommentModeActive(true);
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

    const handleDuplicateProject = useCallback(async () => {
        if (isDuplicatingProject) return;

        setIsDuplicatingProject(true);

        try {
            const [existingFlows, folders] = await Promise.all([
                flowStorage.getAllFlows(),
                flowStorage.getAllFolders(),
            ]);
            const sourceMetadata = existingFlows.find((existingFlow) => existingFlow.id === flow.id);
            const duplicateFolderId =
                sourceMetadata?.folderId && folders.some((folder) => folder.id === sourceMetadata.folderId)
                    ? sourceMetadata.folderId
                    : undefined;

            await duplicateFlowForCurrentUser({
                sourceFlow: flow,
                sourceTitle: sourceMetadata?.title ?? flow.title,
                existingTitles: existingFlows.map((existingFlow) => existingFlow.title),
                folderId: duplicateFolderId,
            });

            markProjectDuplicatedToastPending();
            navigate('/', { replace: true });
        } catch (duplicateError: unknown) {
            console.error('Error duplicating studio project:', duplicateError);
            toast.error('Failed to duplicate project. Please try again.');
        } finally {
            setIsDuplicatingProject(false);
        }
    }, [flow, isDuplicatingProject, navigate]);

    if (isLoading) return <LoadingScreen fullScreen />;

    return (
        <div
            className="relative flex h-screen overflow-hidden flex-col bg-shell-surface"
            style={{ overscrollBehaviorX: 'none' }}
        >


            {/* Canvas Editor - Full Width */}
            <div className="flex-1 overflow-hidden bg-shell-surface">
                <CanvasEditor
                    flow={flow}
                    onUpdateFlow={setFlowWithHistory}
                    onBack={handleBack}
                    onPreview={handleTogglePreview}
                    isPreviewActive={isPreviewOpen}
                    onToggleComments={handleToggleCommentsWorkspace}
                    onOpenCommentsPanel={handleOpenCommentsPanel}
                    isCommentModeActive={isCommentModeActive}
                    comments={areCanvasCommentsVisible ? canvasComments : null}
                    commentSurfaceTone={commentTone}
                    showCommentsToggle={{
                        checked: showComments,
                        onCheckedChange: handleShowCommentsChange,
                    }}
                    isCommentsPanelOpen={isCommentsOpen}
                    menuActionItems={[{
                        label: isDuplicatingProject ? 'Duplicating...' : 'Duplicate project',
                        onSelect: () => {
                            void handleDuplicateProject();
                        },
                        disabled: isDuplicatingProject,
                    }]}
                    useSectionedUserMenu
                />
            </div>

            {/* Preview Drawer */}
            <PreviewDrawer
                isOpen={isPreviewOpen}
                onClose={() => setRightPanelMode(null)}
                flow={flow}
                onUpdateFlow={setFlowWithHistory}
                isPremium={isPremium}
                isMobile={isMobile}
                onTogglePremium={() => setIsPremium(!isPremium)}
                onToggleMobile={() => setIsMobile(!isMobile)}
            />

            <CanvasCommentsDrawer
                isOpen={isCommentsOpen}
                onClose={() => {
                    setRightPanelMode(null);
                    setIsCommentModeActive(false);
                    canvasComments.resetClosedState();
                }}
                comments={canvasComments}
                desktopPresentation="card"
                tone={commentTone}
            />
        </div>
    );
};

export default StudioView;
