import { useState, useEffect } from 'react';
import { cn } from '@/utils/cn';
import { FlowPreview } from './FlowPreview';
import { Flow } from './types';
import { Button } from '@/components/ui/button';
import { PreviewSettingsMenu } from './PreviewSettingsMenu';
import { ShareDialog } from './components/ShareDialog';

interface PreviewDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    flow: Flow;
    onUpdateFlow: (flow: Flow) => void;
    isPremium: boolean;
    isMobile: boolean;
    onTogglePremium: () => void;
    onToggleMobile: () => void;
}

export function PreviewDrawer({
    isOpen,
    onClose,
    flow,
    onUpdateFlow,
    isPremium,
    isMobile,
    onTogglePremium,
    onToggleMobile,
}: PreviewDrawerProps) {
    const [shouldRender, setShouldRender] = useState(isOpen);
    const [activeFlow, setActiveFlow] = useState<Flow>(flow);

    // Debounced auto-sync: Update preview 2 seconds after editing stops
    useEffect(() => {
        const timer = setTimeout(() => {
            setActiveFlow(flow);
        }, 2000);

        return () => clearTimeout(timer);
    }, [flow]);

    useEffect(() => {
        if (isOpen) {
            setShouldRender(true);
        } else {
            const timer = setTimeout(() => setShouldRender(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!shouldRender) return null;

    return (
        <div className={cn(
            "fixed right-0 top-0 bottom-0 w-[520px] z-50 flex flex-col bg-slate-50 border-l shadow-2xl duration-300 fill-mode-forwards",
            isOpen ? "animate-in slide-in-from-right" : "animate-out slide-out-to-right pointer-events-none"
        )}>
            {/* Simulation Toolbar */}
            <div className="h-14 bg-white border-b flex items-center justify-between px-4 shrink-0 z-20 sticky top-0">
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 -ml-2 text-gray-500 hover:text-gray-900"
                        onClick={onClose}
                    >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 4L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M4 4L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </Button>
                    <div className="w-px h-4 bg-gray-200 mr-1" />

                    <div className="text-base font-semibold text-gray-900">Preview</div>
                </div>

                <div className="flex items-center gap-2">

                    {/* Display Settings Dropdown */}
                    <PreviewSettingsMenu
                        flow={flow}
                        onUpdateFlow={onUpdateFlow}
                        isPremium={isPremium}
                        onTogglePremium={onTogglePremium}
                        isMobile={isMobile}
                        onToggleMobile={onToggleMobile}
                    />

                    {/* Share Button matched with CanvasEditor */}
                    <ShareDialog flow={flow}>
                        <Button
                            size="sm"
                            className="bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                        >
                            Share
                        </Button>
                    </ShareDialog>
                </div>
            </div>

            {/* Preview Content */}
            <div className="flex-1 overflow-hidden relative">
                <FlowPreview
                    flow={activeFlow}
                    isPremium={isPremium}
                    isMobile={isMobile}
                    variables={{}}
                />
            </div>
        </div >
    );
}
