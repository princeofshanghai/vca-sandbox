import { useState, useEffect } from 'react';
import { cn } from '@/utils/cn';
import { FlowPreview } from './FlowPreview';
import { Flow } from './types';
import { Button } from '@/components/ui/button';
import { PreviewSettingsMenu } from './PreviewSettingsMenu';
import { ShareDialog } from './components/ShareDialog';
import { RotateCcw, Split, X } from 'lucide-react';
import { SimulationContextPanel } from './components/SimulationContextPanel';
import { ActionTooltip } from '../studio-canvas/components/ActionTooltip';

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
    const [resetKey, setResetKey] = useState(0);
    const [showContextPanel, setShowContextPanel] = useState(false);
    const [simulationVariables, setSimulationVariables] = useState<Record<string, string>>({});

    const handleRestart = () => {
        setResetKey(prev => prev + 1);
    };

    // Debounced auto-sync: Update preview 1 second after editing stops
    useEffect(() => {
        const timer = setTimeout(() => {
            setActiveFlow(flow);
        }, 1000);

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
            "fixed inset-0 z-50 pointer-events-none flex justify-end",
            isOpen ? "visible" : "invisible"
        )}>


            {/* Sidecar Container (Right Aligned) */}
            <div className={cn(
                "relative h-full flex transition-transform duration-300 ease-out pointer-events-auto",
                isOpen ? "translate-x-0" : "translate-x-full"
            )}>
                {/* 1. The Context Sidecar (Slides out to the LEFT of the drawer) */}
                <div className={cn(
                    "w-[320px] bg-white border-r shadow-2xl transition-all duration-300 ease-out overflow-hidden flex flex-col",
                    showContextPanel ? "translate-x-0 opacity-100" : "translate-x-[50px] opacity-0 w-0 border-none"
                )}>
                    <SimulationContextPanel
                        flow={activeFlow}
                        variables={simulationVariables}
                        onUpdateVariables={setSimulationVariables}
                        onClose={() => setShowContextPanel(false)}
                    />
                </div>

                {/* 2. The Main Preview Drawer */}
                <div className="w-[480px] h-full bg-slate-50 shadow-2xl flex flex-col border-l border-white/20">
                    {/* Compact Header */}
                    <div className="h-14 bg-white border-b flex items-center justify-between px-4 shrink-0 z-20 sticky top-0">
                        <div className="flex items-center gap-3">
                            <h2 className="font-semibold text-sm text-gray-900">Preview</h2>
                        </div>

                        <div className="flex items-center gap-1">
                            {/* Restart */}
                            <ActionTooltip content="Restart prototype" side="bottom">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                                    onClick={handleRestart}
                                >
                                    <RotateCcw size={16} />
                                </Button>
                            </ActionTooltip>

                            {/* Context Toggle (Sidecar) */}
                            <ActionTooltip content="Choose path" side="bottom">
                                <Button
                                    variant={showContextPanel ? "secondary" : "ghost"}
                                    size="icon"
                                    className={cn(
                                        "h-8 w-8 transition-all relative",
                                        showContextPanel ? "bg-amber-50 text-amber-600" : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                                    )}
                                    onClick={() => setShowContextPanel(!showContextPanel)}
                                >
                                    <Split size={16} className={showContextPanel ? "rotate-90" : ""} />
                                    {/* Dot indicator if variables set */}
                                    {Object.keys(simulationVariables).length > 0 && (
                                        <span className="absolute top-2 right-2 flex h-1.5 w-1.5 rounded-full bg-blue-600" />
                                    )}
                                </Button>
                            </ActionTooltip>

                            {/* Settings (Icon Only) */}
                            <ActionTooltip content="Display settings" side="bottom">
                                <div className="flex">
                                    <PreviewSettingsMenu
                                        flow={flow}
                                        onUpdateFlow={onUpdateFlow}
                                        isPremium={isPremium}
                                        onTogglePremium={onTogglePremium}
                                        isMobile={isMobile}
                                        onToggleMobile={onToggleMobile}
                                        iconOnly={true}
                                    />
                                </div>
                            </ActionTooltip>

                            <div className="w-px h-4 bg-gray-200 mx-1" />

                            {/* Share Button */}
                            <ShareDialog flow={activeFlow}>
                                <Button size="sm" className="h-8 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3">
                                    Share
                                </Button>
                            </ShareDialog>

                            {/* Close Button */}
                            <ActionTooltip content="Close preview" side="bottom">
                                <Button variant="ghost" size="icon" className="h-8 w-8 ml-1 text-gray-400 hover:text-gray-800" onClick={onClose}>
                                    <X size={18} />
                                </Button>
                            </ActionTooltip>
                        </div>
                    </div>

                    {/* Preview Content */}
                    <div className="flex-1 overflow-hidden relative bg-slate-50/50">
                        <FlowPreview
                            key={resetKey}
                            flow={activeFlow}
                            isPremium={isPremium}
                            isMobile={isMobile}
                            variables={simulationVariables}
                            onVariableUpdate={(key, val) => setSimulationVariables(prev => ({ ...prev, [key]: val }))}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
