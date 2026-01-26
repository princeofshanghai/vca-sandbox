import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { PreviewDrawer } from './PreviewDrawer';
import { CanvasEditor } from '../studio-canvas/CanvasEditor';
import { useStudioFlow } from './hooks/useStudioFlow';

export const StudioView = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    // Custom hook handles loading and persistence
    const { flow, setFlow, isLoading } = useStudioFlow(id);

    const [isPremium, setIsPremium] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    const handleBack = () => {
        navigate('/');
    };

    if (isLoading) return <div className="h-full flex items-center justify-center">Loading...</div>;

    return (
        <div className="flex h-full overflow-hidden flex-col bg-white">


            {/* Canvas Editor - Full Width */}
            <div className="flex-1 overflow-hidden bg-white">
                <CanvasEditor
                    flow={flow}
                    onUpdateFlow={setFlow}
                    onBack={handleBack}
                    onPreview={() => setIsPreviewOpen(!isPreviewOpen)}
                    isPreviewActive={isPreviewOpen}
                />
            </div>

            {/* Preview Drawer */}
            <PreviewDrawer
                isOpen={isPreviewOpen}
                flow={flow}
                onUpdateFlow={setFlow}
                isPremium={isPremium}
                isMobile={isMobile}
                onTogglePremium={() => setIsPremium(!isPremium)}
                onToggleMobile={() => setIsMobile(!isMobile)}
            />
        </div>
    );
};

export default StudioView;
