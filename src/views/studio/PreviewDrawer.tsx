import { useState, useEffect, useRef } from 'react';
import { cn } from '@/utils/cn';
import { FlowPreview } from './FlowPreview';
import { Flow } from './types';
import { Button } from '@/components/ui/button';
import { PreviewSettingsMenu } from './PreviewSettingsMenu';
import { ShareDialog } from './components/ShareDialog';
import { RotateCcw, Split, X, Monitor, Smartphone } from 'lucide-react';
import { SimulationContextPanel } from './components/SimulationContextPanel';
import { ActionTooltip } from '../studio-canvas/components/ActionTooltip';
import { ToolbarPill } from '@/components/ui/toolbar-pill';
import { useApp } from '@/contexts/AppContext';

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
    const { state } = useApp();
    const isDark = state.theme === 'dark';
    const [shouldRender, setShouldRender] = useState(isOpen);
    const [activeFlow, setActiveFlow] = useState<Flow>(flow);
    const [resetKey, setResetKey] = useState(0);
    const [showContextPanel, setShowContextPanel] = useState(false);
    const [simulationVariables, setSimulationVariables] = useState<Record<string, string>>({});

    const debounceTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);

    const handleRestart = () => {
        // 1. Cancel any pending debounce updates to prevent race conditions
        if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

        // 2. Sync immediately to latest data
        setActiveFlow(flow);

        // 3. Trigger reset
        setResetKey(prev => prev + 1);
    };

    // Debounced auto-sync: Update preview 1 second after editing stops
    useEffect(() => {
        // Clear any existing timer
        if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

        debounceTimerRef.current = setTimeout(() => {
            setActiveFlow(flow);
        }, 1000);

        return () => {
            if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
        };
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
            "fixed inset-0 z-[100] pointer-events-none flex justify-end",
            isOpen ? "visible" : "invisible"
        )}>


            {/* Sidecar Container (Right Aligned) */}
            <div className={cn(
                "relative h-full flex transition-transform duration-300 ease-out pointer-events-auto",
                isOpen ? "translate-x-0" : "translate-x-full"
            )}>
                {/* 1. The Context Sidecar (Slides out to the LEFT of the drawer) */}
                <div className={cn(
                    "w-[320px] bg-shell-bg border-r border-shell-border/70 shadow-2xl transition-all duration-300 ease-out overflow-hidden flex flex-col",
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
                <div className="w-[480px] h-full bg-shell-surface shadow-2xl flex flex-col border-l border-shell-border/70">
                    {/* Compact Header */}
                    <div className="h-14 bg-shell-bg border-b border-shell-border/70 flex items-center justify-between pl-2 pr-4 shrink-0 z-20 sticky top-0">
                        <div className="flex items-center gap-2">
                            {/* Close Button */}
                            <ActionTooltip content="Close preview" side="bottom">
                                <Button variant="ghost" size="icon" className="h-9 w-9 text-shell-muted hover:text-shell-text hover:bg-shell-surface" onClick={onClose}>
                                    <X size={20} />
                                </Button>
                            </ActionTooltip>

                            {/* Control Pill */}
                            <ToolbarPill>
                                <ActionTooltip content="Restart prototype" side="bottom">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-shell-muted hover:text-shell-text hover:bg-shell-surface rounded-full transition-all"
                                        onClick={handleRestart}
                                    >
                                        <RotateCcw size={16} />
                                    </Button>
                                </ActionTooltip>

                                <ActionTooltip content="Choose path" side="bottom">
                                    <Button
                                        variant={showContextPanel ? "secondary" : "ghost"}
                                        size="icon"
                                        className={cn(
                                            "h-8 w-8 transition-all relative border-transparent rounded-full",
                                            showContextPanel
                                                ? "bg-shell-accent-soft text-shell-accent-text shadow-sm border-shell-accent-border"
                                                : "text-shell-muted hover:text-shell-text hover:bg-shell-surface"
                                        )}
                                        onClick={() => setShowContextPanel(!showContextPanel)}
                                    >
                                        <Split size={16} className={showContextPanel ? "rotate-90" : ""} />
                                        {Object.keys(simulationVariables).length > 0 && (
                                            <span className="absolute top-2 right-2 flex h-1.5 w-1.5 rounded-full bg-shell-accent" />
                                        )}
                                    </Button>
                                </ActionTooltip>
                            </ToolbarPill>

                            {/* Display Pill */}
                            <ToolbarPill>
                                <ActionTooltip content="Desktop preview" side="bottom">
                                    <Button
                                        variant={!isMobile ? "secondary" : "ghost"}
                                        size="icon"
                                        className={cn(
                                            "h-8 w-8 transition-all rounded-full border-transparent",
                                            !isMobile
                                                ? "bg-shell-accent-soft text-shell-accent-text shadow-sm border-shell-accent-border"
                                                : "text-shell-muted hover:text-shell-text hover:bg-shell-surface"
                                        )}
                                        onClick={() => isMobile && onToggleMobile()}
                                    >
                                        <Monitor size={16} />
                                    </Button>
                                </ActionTooltip>

                                <ActionTooltip content="Mobile preview" side="bottom">
                                    <Button
                                        variant={isMobile ? "secondary" : "ghost"}
                                        size="icon"
                                        className={cn(
                                            "h-8 w-8 transition-all rounded-full border-transparent",
                                            isMobile
                                                ? "bg-shell-accent-soft text-shell-accent-text shadow-sm border-shell-accent-border"
                                                : "text-shell-muted hover:text-shell-text hover:bg-shell-surface"
                                        )}
                                        onClick={() => !isMobile && onToggleMobile()}
                                    >
                                        <Smartphone size={16} />
                                    </Button>
                                </ActionTooltip>

                                <div className="flex">
                                    <PreviewSettingsMenu
                                        flow={flow}
                                        onUpdateFlow={onUpdateFlow}
                                        isPremium={isPremium}
                                        onTogglePremium={onTogglePremium}
                                        darkTheme={isDark}
                                        iconOnly={true}
                                        rounded={true}
                                    />
                                </div>
                            </ToolbarPill>
                        </div>

                        <div className="flex items-center gap-1">
                            {/* Share Button */}
                            <ShareDialog flow={activeFlow}>
                                <Button size="sm" className="h-8 bg-shell-accent hover:bg-shell-accent-hover text-white text-xs font-medium px-3">
                                    Share
                                </Button>
                            </ShareDialog>
                        </div>
                    </div>

                    {/* Preview Content */}
                    <div className="flex-1 overflow-hidden relative bg-shell-surface-subtle">
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
