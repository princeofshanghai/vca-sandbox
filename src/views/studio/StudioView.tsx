import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { PreviewDrawer } from './PreviewDrawer';
import { Flow } from './types';
import { flowStorage, INITIAL_FLOW } from '@/utils/flowStorage';
import { CanvasEditor } from '../studio-canvas/CanvasEditor';

export const StudioView = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);

    // Initial State
    const [flow, setFlow] = useState<Flow>(INITIAL_FLOW);

    // Load Flow
    useEffect(() => {
        if (id) {
            const loaded = flowStorage.getFlow(id);
            if (loaded) {
                setFlow(loaded);
            } else {
                // If not found, maybe redirect or show error? 
                // For now, let's just initialize a new one with that ID? 
                // Or better, redirect back to dashboard if invalid.
                // But to be safe let's just create a new one in memory.
                console.warn(`Flow ${id} not found, initializing empty.`);
                setFlow({ ...INITIAL_FLOW, id });
            }
        }
        setIsLoading(false);
    }, [id]);

    // Persistence
    useEffect(() => {
        if (!isLoading && flow.id) {
            flowStorage.saveFlow(flow);
        }
    }, [flow, isLoading]);

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
