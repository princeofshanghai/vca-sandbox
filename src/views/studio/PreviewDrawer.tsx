import { useState, useEffect, useRef } from 'react';
import { cn } from '@/utils/cn';
import { FlowPreview } from './FlowPreview';
import { Flow } from './types';
import { PreviewSettingsMenu } from './PreviewSettingsMenu';
import { PreviewHeaderActionButton } from './components/PreviewHeaderActionButton';
import { ShareDialog } from './components/ShareDialog';
import { RotateCcw, X, Monitor, Smartphone } from 'lucide-react';
import { ActionTooltip } from '../studio-canvas/components/ActionTooltip';
import { ShellButton, ShellIconButton, ShellSegmentedControl, ShellSegmentedControlItem } from '@/components/shell';
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
    const [shouldRender, setShouldRender] = useState(isOpen);
    const [activeFlow, setActiveFlow] = useState<Flow>(flow);
    const [resetKey, setResetKey] = useState(0);
    const [simulationVariables, setSimulationVariables] = useState<Record<string, string>>({});
    const isDarkMode = state.theme === 'dark';
    const previewControlTone = isDarkMode ? 'cinematicDark' : 'default';
    const areHotspotsVisible = flow.settings?.showHotspots ?? true;

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

    const handleToggleHotspots = () => {
        if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

        const nextFlow: Flow = {
            ...flow,
            settings: {
                ...flow.settings,
                showHotspots: !areHotspotsVisible,
            },
        };

        onUpdateFlow(nextFlow);
        setActiveFlow(nextFlow);
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
                    <div className="h-14 bg-shell-surface border-b border-shell-border/70 flex items-center justify-between pl-2 pr-4 shrink-0 z-20 sticky top-0">
                        <div className="flex items-center gap-2">
                            {/* Close Button */}
                            <ActionTooltip content="Close preview" side="bottom">
                                <ShellIconButton onClick={onClose} aria-label="Close preview">
                                    <X size={20} />
                                </ShellIconButton>
                            </ActionTooltip>

                            {/* Display Pill */}
                            <ShellSegmentedControl tone={previewControlTone} size="compact" aria-label="Preview mode">
                                <ActionTooltip content="Desktop preview" side="bottom">
                                    <ShellSegmentedControlItem
                                        iconOnly
                                        selected={!isMobile}
                                        tone={previewControlTone}
                                        size="compact"
                                        onClick={() => isMobile && onToggleMobile()}
                                    >
                                        <Monitor size={13} />
                                    </ShellSegmentedControlItem>
                                </ActionTooltip>

                                <ActionTooltip content="Mobile preview" side="bottom">
                                    <ShellSegmentedControlItem
                                        iconOnly
                                        selected={isMobile}
                                        tone={previewControlTone}
                                        size="compact"
                                        onClick={() => !isMobile && onToggleMobile()}
                                    >
                                        <Smartphone size={13} />
                                    </ShellSegmentedControlItem>
                                </ActionTooltip>

                                <div className="flex">
                                    <PreviewSettingsMenu
                                        flow={flow}
                                        onUpdateFlow={onUpdateFlow}
                                        isPremium={isPremium}
                                        onTogglePremium={onTogglePremium}
                                        tone={previewControlTone}
                                        iconOnly={true}
                                        size="compact"
                                        triggerStyle="segmented"
                                        shape="circle"
                                    />
                                </div>
                            </ShellSegmentedControl>
                        </div>

                        <div className="flex items-center gap-2">
                            <PreviewHeaderActionButton
                                tone={previewControlTone}
                                active={areHotspotsVisible}
                                onClick={handleToggleHotspots}
                                aria-pressed={areHotspotsVisible}
                            >
                                Hotspots
                            </PreviewHeaderActionButton>

                            <PreviewHeaderActionButton
                                tone={previewControlTone}
                                onClick={handleRestart}
                            >
                                <RotateCcw size={14} />
                                Restart
                            </PreviewHeaderActionButton>

                            {/* Share Button */}
                            <ShareDialog
                                flow={activeFlow}
                                enabledLinkTypes={['studio', 'prototype']}
                                linkLabelOverrides={{ studio: 'Copy link' }}
                            >
                                <ShellButton size="compact" className="h-7 px-3 text-xs">
                                    Share
                                </ShellButton>
                            </ShareDialog>
                        </div>
                    </div>

                    {/* Preview Content */}
                    <div className="flex-1 overflow-hidden relative bg-shell-surface">
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
