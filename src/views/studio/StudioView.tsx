import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { PreviewDrawer } from './PreviewDrawer';
import { CanvasCommentsDrawer } from './CanvasCommentsDrawer';
import { CanvasEditor } from '../studio-canvas/CanvasEditor';
import { useStudioFlow } from './hooks/useStudioFlow';
import { useFlowHistory } from './hooks/useFlowHistory';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { useCanvasCommentsController } from './useCanvasCommentsController';

type StudioRightPanelMode = 'preview' | 'comments' | null;

export const StudioView = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    // Custom hook handles loading and persistence
    const { flow, setFlow, isLoading } = useStudioFlow(id);
    const { setFlowWithHistory, undo, redo } = useFlowHistory(flow, setFlow);

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

    const [isPremium, setIsPremium] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [showComments, setShowComments] = useState(true);
    const [isCommentModeActive, setIsCommentModeActive] = useState(false);
    const [rightPanelMode, setRightPanelMode] = useState<StudioRightPanelMode>(null);

    const handleBack = () => {
        navigate('/');
    };

    const isPreviewOpen = rightPanelMode === 'preview';
    const isCommentsOpen = rightPanelMode === 'comments';
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

    if (isLoading) return <LoadingScreen fullScreen />;

    return (
        <div
            className="flex h-screen overflow-hidden flex-col bg-shell-surface"
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
                    showCommentsToggle={{
                        checked: showComments,
                        onCheckedChange: handleShowCommentsChange,
                    }}
                    isCommentsPanelOpen={isCommentsOpen}
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
            />
        </div>
    );
};

export default StudioView;
