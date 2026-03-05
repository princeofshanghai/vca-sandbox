import { useState, useEffect, useRef } from 'react';
import { cn } from '@/utils/cn';
import { FlowPreview } from './FlowPreview';
import { Flow } from './types';
import { Button } from '@/components/ui/button';
import { PreviewSettingsMenu } from './PreviewSettingsMenu';
import { ShareDialog } from './components/ShareDialog';
import { RotateCcw, X, Monitor, Smartphone } from 'lucide-react';
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
    const [simulationVariables, setSimulationVariables] = useState<Record<string, string>>({});

    const debounceTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);

    const handleRestart = () => {
        // 1. Cancel any pending debounce updates to prevent race conditions
        if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

        // 2. Sync immediately to latest data
        setActiveFlow(flow);

        // 3. Reset simulation variables so required path choices appear again.
        setSimulationVariables({});

        // 4. Trigger reset
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


            {/* Drawer Container (Right Aligned) */}
            <div className={cn(
                "relative h-full transition-transform duration-300 ease-out pointer-events-auto",
                isOpen ? "translate-x-0" : "translate-x-full"
            )}>
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
                            <ShareDialog
                                flow={activeFlow}
                                enabledLinkTypes={['studio', 'prototype']}
                                linkLabelOverrides={{ studio: 'Copy link' }}
                            >
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
                            topControl={(
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 gap-2 border-shell-border/70 bg-shell-bg px-3 text-xs font-medium text-shell-muted-strong shadow-sm hover:bg-shell-surface hover:text-shell-text"
                                    onClick={handleRestart}
                                >
                                    <RotateCcw size={14} />
                                    Restart
                                </Button>
                            )}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
