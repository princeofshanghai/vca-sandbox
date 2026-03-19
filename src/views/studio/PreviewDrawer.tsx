import { useState, useEffect, useRef, useCallback } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { cn } from '@/utils/cn';
import { FlowPreview, type FlowPreviewReviewPathChangeRequest, type FlowPreviewReviewState } from './FlowPreview';
import { Flow } from './types';
import { PreviewSettingsMenu } from './PreviewSettingsMenu';
import { PreviewHeaderActionButton } from './components/PreviewHeaderActionButton';
import { ShareDialog } from './components/ShareDialog';
import { RotateCcw, Split, X, Monitor, Smartphone } from 'lucide-react';
import { ActionTooltip } from '../studio-canvas/components/ActionTooltip';
import {
    ShellButton,
    ShellIconButton,
    ShellPopoverContent,
    ShellSegmentedControl,
    ShellSegmentedControlItem,
} from '@/components/shell';
import { useApp } from '@/contexts/AppContext';
import { usePreventBrowserPinchZoom } from '@/hooks/usePreventBrowserPinchZoom';
import { PathsPanel } from './components/PathsPanel';

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
    const [lastRestartedModifiedAt, setLastRestartedModifiedAt] = useState(flow.lastModified);
    const [reviewState, setReviewState] = useState<FlowPreviewReviewState>({
        pathSelections: [],
        decisions: [],
        pathSignature: '',
        historyLength: 0,
    });
    const [reviewPathChangeRequest, setReviewPathChangeRequest] =
        useState<FlowPreviewReviewPathChangeRequest | null>(null);
    const [isPathsPanelOpen, setIsPathsPanelOpen] = useState(false);
    const isDarkMode = state.theme === 'dark';
    const previewControlTone = isDarkMode ? 'cinematicDark' : 'default';
    const debounceTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);
    const latestFlowModifiedAtRef = useRef(flow.lastModified);
    const lastAutoOpenPendingRequestKeyRef = useRef<string | null>(null);
    const drawerRef = useRef<HTMLDivElement | null>(null);

    usePreventBrowserPinchZoom(drawerRef, shouldRender);

    useEffect(() => {
        latestFlowModifiedAtRef.current = flow.lastModified;
    }, [flow.lastModified]);

    const shouldShowRestartIndicator = flow.lastModified > lastRestartedModifiedAt;
    const hasPathDecisions = reviewState.decisions.length > 0;
    const pendingPathDecision = reviewState.decisions.find((decision) => decision.mode === 'interceptor') || null;

    const handlePathChange = useCallback((stepId: string, branchId: string, mode: 'selection' | 'interceptor') => {
        setReviewPathChangeRequest({
            token: Date.now() + Math.random(),
            stepId,
            branchId,
            mode,
        });
        if (mode === 'interceptor') {
            setIsPathsPanelOpen(false);
        }
    }, []);

    const handleRestart = useCallback(() => {
        // 1. Cancel any pending debounce updates to prevent race conditions
        if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

        // 2. Sync immediately to latest data
        setActiveFlow(flow);

        // 3. Reset simulation variables so required path choices appear again.
        setSimulationVariables({});
        setReviewPathChangeRequest(null);

        // 4. Mark the preview as replayed against the latest flow revision.
        setLastRestartedModifiedAt(flow.lastModified);

        // 5. Trigger reset
        setResetKey(prev => prev + 1);
    }, [flow]);

    const handlePreviewFlowUpdate = useCallback((nextFlow: Flow) => {
        if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
        onUpdateFlow(nextFlow);
        setActiveFlow(nextFlow);
    }, [onUpdateFlow]);

    useEffect(() => {
        if (!pendingPathDecision) {
            lastAutoOpenPendingRequestKeyRef.current = null;
            return;
        }

        const pendingRequestKey = [
            pendingPathDecision.stepId,
            reviewState.pathSignature,
            reviewState.historyLength,
        ].join('|');

        if (lastAutoOpenPendingRequestKeyRef.current === pendingRequestKey) return;
        lastAutoOpenPendingRequestKeyRef.current = pendingRequestKey;
        setIsPathsPanelOpen(true);
    }, [pendingPathDecision, reviewState.historyLength, reviewState.pathSignature]);

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
            setLastRestartedModifiedAt(latestFlowModifiedAtRef.current);
        } else {
            const timer = setTimeout(() => setShouldRender(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) return;
        setIsPathsPanelOpen(false);
        setReviewPathChangeRequest(null);
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.defaultPrevented || event.repeat) return;
            if (event.metaKey || event.ctrlKey || event.altKey) return;

            const target = event.target as HTMLElement | null;
            if (
                target &&
                (
                    target instanceof HTMLInputElement ||
                    target instanceof HTMLTextAreaElement ||
                    target instanceof HTMLSelectElement ||
                    target.isContentEditable
                )
            ) {
                return;
            }

            if (event.key.toLowerCase() !== 'r') return;

            event.preventDefault();
            handleRestart();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleRestart, isOpen]);

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
                <div
                    ref={drawerRef}
                    className="w-[480px] h-full bg-shell-surface shadow-2xl flex flex-col border-l border-shell-border/70"
                >
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
                                        onUpdateFlow={handlePreviewFlowUpdate}
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
                            <Popover.Root open={isPathsPanelOpen} onOpenChange={setIsPathsPanelOpen}>
                                <Popover.Trigger asChild>
                                    <PreviewHeaderActionButton
                                        tone={previewControlTone}
                                        active={isPathsPanelOpen || !!pendingPathDecision}
                                        aria-expanded={isPathsPanelOpen}
                                    >
                                        <Split size={14} />
                                        Paths
                                    </PreviewHeaderActionButton>
                                </Popover.Trigger>

                                <ShellPopoverContent
                                    tone="default"
                                    side="bottom"
                                    align="end"
                                    sideOffset={10}
                                    collisionPadding={12}
                                    className="w-[344px] border-shell-border bg-shell-bg p-0"
                                >
                                    <PathsPanel
                                        decisions={reviewState.decisions}
                                        tone="default"
                                        variant="popover"
                                        onChangePath={(decision, branchId) =>
                                            handlePathChange(decision.stepId, branchId, decision.mode)
                                        }
                                        onResetPaths={hasPathDecisions ? handleRestart : undefined}
                                        className="max-h-[min(68vh,520px)]"
                                    />
                                </ShellPopoverContent>
                            </Popover.Root>

                            <ActionTooltip content="Restart" shortcut="R" side="bottom">
                                <div className="relative">
                                    <PreviewHeaderActionButton
                                        tone={previewControlTone}
                                        onClick={handleRestart}
                                        aria-keyshortcuts="R"
                                    >
                                        <RotateCcw size={14} />
                                        Restart
                                    </PreviewHeaderActionButton>
                                    {shouldShowRestartIndicator && (
                                        <span
                                            aria-hidden="true"
                                            className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full border-2 border-shell-surface bg-shell-danger"
                                        />
                                    )}
                                </div>
                            </ActionTooltip>

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
                            onReviewStateChange={setReviewState}
                            reviewPathChangeRequest={reviewPathChangeRequest}
                            showInlinePathControls={false}
                            showEndOfFlowIndicator={true}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
