// ... (imports)
import { useState, useEffect, useRef, useCallback, useMemo, type ReactNode } from 'react';
import { Flow } from './types';
import { Container } from '@/components/vca-components/container/Container';
import { Message } from '@/components/vca-components/messages';
import { InfoMessage } from '@/components/vca-components/info-message/InfoMessage';
import { StatusCard } from '@/components/vca-components/status-card/StatusCard';
import { PromptGroup } from '@/components/vca-components/prompt-group/PromptGroup';
import { PhoneFrame } from '@/components/component-library/PhoneFrame';
import { Split } from 'lucide-react';

import { InlineFeedback } from '@/components/vca-components/inline-feedback';
import { SelectionList } from '@/components/vca-components/selection-list/SelectionList';
import { ConfirmationCard } from '@/components/vca-components/confirmation-card';
import { CheckboxGroup } from '@/components/vca-components/checkbox-group/CheckboxGroup';
import { ContextInterceptorMessage } from './components/ContextInterceptorMessage';
import { useSmartFlowEngine } from '@/hooks/useSmartFlowEngine';


interface FlowPreviewProps {
    flow: Flow;
    isPremium: boolean;
    isMobile: boolean;
    variables: Record<string, string>;
    onVariableUpdate?: (key: string, value: string) => void;
    desktopPosition?: 'center' | 'bottom-right';
    topControl?: ReactNode;
}

type ComposerGuidanceState = {
    showHotspot: boolean;
    suggestions: string[];
};

interface InteractionHotspotState {
    turnId: string;
    promptComponentIds: Set<string>;
    selectionItemIdsByComponent: Record<string, Set<string>>;
    confirmationByComponent: Record<string, { confirm: boolean; reject: boolean }>;
    checkboxByComponent: Record<string, { showOptions: boolean; showSave: boolean }>;
    composer: ComposerGuidanceState;
}

const EMPTY_COMPOSER_GUIDANCE: ComposerGuidanceState = {
    showHotspot: false,
    suggestions: []
};

const parseTriggerExamples = (triggerValue?: string) =>
    (triggerValue || '')
        .split(/\n+|[;|]/g)
        .map((line) => line.replace(/^\s*[-*]\s*/, '').trim())
        .filter(Boolean);

export const FlowPreview = ({
    flow,
    isPremium,
    isMobile,
    variables,
    onVariableUpdate,
    desktopPosition = 'center',
    topControl
}: FlowPreviewProps) => {
    const hotspotsEnabled = flow.settings?.showHotspots ?? true;
    // Shared composer state
    const [composerValue, setComposerValue] = useState('');
    const handleSendRef = useRef<(() => void) | undefined>(undefined);
    const stopHandlerRef = useRef<(() => void) | undefined>(undefined);
    const [composerGuidance, setComposerGuidance] = useState<ComposerGuidanceState>(EMPTY_COMPOSER_GUIDANCE);

    // Lifted status state for Composer (only re-render when status changes)
    const [composerStatus, setComposerStatus] = useState<'default' | 'active' | 'stop'>('default');

    const handleRegisterSend = useCallback((fn: () => void) => {
        handleSendRef.current = fn;
    }, []);

    const handleStatusChange = useCallback((status: 'default' | 'active' | 'stop', onStop?: () => void) => {
        stopHandlerRef.current = onStop;
        setComposerStatus((prev) => (prev === status ? prev : status));
    }, []);

    const handleComposerSend = useCallback(() => {
        handleSendRef.current?.();
    }, []);

    const handleComposerStop = useCallback(() => {
        stopHandlerRef.current?.();
    }, []);

    return (
        <div className="h-full w-full flex flex-col relative bg-transparent pointer-events-none">

            <div className={`flex-1 flex flex-col overflow-y-auto thin-scrollbar ${isMobile || desktopPosition === 'center' ? 'items-center justify-center p-4' : 'items-end justify-end p-6'}`}>
                {isMobile ? (
                    <div className="pointer-events-auto inline-flex flex-col items-center gap-5 mt-8">
                        {topControl ? (
                            <div>{topControl}</div>
                        ) : null}
                        <div className="relative w-[334px] h-[726px] shrink-0 flex items-center justify-center">
                            <div className="scale-[0.85] origin-center">
                                <PhoneFrame showStatusBar={true} dimBackground={false}>
                                    <Container
                                        headerTitle="Help"
                                        className="bg-shell-bg h-[772px] w-[393px]"
                                        viewport="mobile"
                                        showHeaderPremiumIcon={isPremium}
                                        showPremiumBorder={isPremium}
                                        composerValue={composerValue}
                                        onComposerChange={setComposerValue}
                                        onComposerSend={handleComposerSend}
                                        composerStatus={composerStatus}
                                        onStop={handleComposerStop}
                                        composerHotspotVisible={hotspotsEnabled && composerGuidance.showHotspot}
                                        composerHotspotSuggestions={composerGuidance.suggestions}
                                        onComposerHotspotUse={setComposerValue}
                                    >
                                        <PreviewContent
                                            flow={flow}
                                            variables={variables}
                                            onRegisterSend={handleRegisterSend}
                                            onComposerReset={() => setComposerValue('')}
                                            composerValue={composerValue}
                                            onStatusChange={handleStatusChange}
                                            onVariableUpdate={onVariableUpdate}
                                            onComposerGuidanceChange={setComposerGuidance}
                                            showHotspotsEnabled={hotspotsEnabled}
                                        />
                                    </Container>
                                </PhoneFrame>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="relative pointer-events-auto inline-flex flex-col items-center gap-5">
                        {topControl ? (
                            <div>{topControl}</div>
                        ) : null}

                        <Container
                            headerTitle="Help"
                            className="shadow-xl bg-shell-bg"
                            viewport="desktop"
                            showHeaderPremiumIcon={isPremium}
                            showPremiumBorder={isPremium}
                            composerValue={composerValue}
                            onComposerChange={setComposerValue}
                            onComposerSend={handleComposerSend}
                            composerStatus={composerStatus}
                            onStop={handleComposerStop}
                            composerHotspotVisible={hotspotsEnabled && composerGuidance.showHotspot}
                            composerHotspotSuggestions={composerGuidance.suggestions}
                            onComposerHotspotUse={setComposerValue}
                        >
                            <PreviewContent
                                flow={flow}
                                variables={variables}
                                onVariableUpdate={onVariableUpdate}
                                onRegisterSend={handleRegisterSend}
                                onComposerReset={() => setComposerValue('')}
                                composerValue={composerValue}
                                onStatusChange={handleStatusChange}
                                onComposerGuidanceChange={setComposerGuidance}
                                showHotspotsEnabled={hotspotsEnabled}
                            />
                        </Container>
                    </div>
                )}
            </div>
        </div>
    );
};

// Interactive Preview Content
const PreviewContent = ({
    flow,
    variables,
    onVariableUpdate,
    onRegisterSend,
    onComposerReset,
    composerValue,
    // New prop to report status up
    onStatusChange,
    onComposerGuidanceChange,
    showHotspotsEnabled
}: {
    flow: Flow,
    variables?: Record<string, string>,
    onVariableUpdate?: (key: string, value: string) => void,
    onRegisterSend: (fn: () => void) => void,
    onComposerReset: () => void,
    composerValue: string,
    onStatusChange?: (status: 'default' | 'active' | 'stop', onStop?: () => void) => void,
    onComposerGuidanceChange?: (guidance: ComposerGuidanceState) => void,
    showHotspotsEnabled: boolean
}) => {

    // USE SMART FLOW ENGINE
    const {
        history,
        visibleComponentIds,
        isThinking,
        isProcessingQueue,
        streamingComponentId,
        currentStreamingText,
        handleStop,
        handleSend,
        handlePromptClick,
        handleSelectionItemClick,
        handleConfirmationAction,
        handleCheckboxSave,
        resolveInterceptor,
        switchConditionPath,
        lastConditionSelection
    } = useSmartFlowEngine({
        flow,
        variables,
        onVariableUpdate
    });

    const [isPathPanelExpanded, setIsPathPanelExpanded] = useState(false);

    const activeInterceptor = [...history]
        .reverse()
        .find((step) => step.type === 'interceptor') as ({
            variableName: string,
            branches: import('./types').Branch[],
            stepId: string,
            id: string
        } | undefined);

    useEffect(() => {
        if (activeInterceptor) {
            setIsPathPanelExpanded(true);
        }
    }, [activeInterceptor]);

    useEffect(() => {
        if (!activeInterceptor && !lastConditionSelection) {
            setIsPathPanelExpanded(false);
        }
    }, [activeInterceptor, lastConditionSelection]);

    const overlaySelection = useMemo(() => (
        activeInterceptor
            ? {
                mode: 'interceptor' as const,
                variableName: activeInterceptor.variableName,
                branches: activeInterceptor.branches,
                stepId: activeInterceptor.stepId,
                interceptorId: activeInterceptor.id,
                selectedLabel: 'Choose a path to continue'
            }
            : lastConditionSelection
                ? {
                    mode: 'selection' as const,
                    variableName: lastConditionSelection.variableName,
                    branches: lastConditionSelection.branches,
                    stepId: lastConditionSelection.stepId,
                    selectedLabel: lastConditionSelection.selectedLabel
                }
                : null
    ), [activeInterceptor, lastConditionSelection]);

    const listBottomPaddingClass = isPathPanelExpanded
        ? 'pb-28'
        : overlaySelection
            ? 'pb-14'
            : '';

    const shouldShowFullPathPanel = !!overlaySelection && isPathPanelExpanded;
    const shouldShowCompactPathPill = !!overlaySelection && !isPathPanelExpanded;
    const activeInteractiveTurn = useMemo(
        () => [...history].reverse().find((step) => step.type === 'turn') as import('./types').Turn | undefined || null,
        [history]
    );

    const interactionHotspots = useMemo<InteractionHotspotState | null>(() => {
        if (!showHotspotsEnabled) return null;
        if (!activeInteractiveTurn) return null;

        const outgoingConnections = (flow.connections || []).filter(
            (connection) => connection.source === activeInteractiveTurn.id
        );
        const stepById = new Map((flow.steps || []).map((step) => [step.id, step]));
        const hasConnectionForHandle = (handleId: string) =>
            outgoingConnections.some((connection) => connection.sourceHandle === handleId);

        const visibleComponents = activeInteractiveTurn.components.filter((component) =>
            visibleComponentIds.has(component.id) || streamingComponentId === component.id
        );

        const promptComponentIds = new Set<string>();
        const selectionItemIdsByComponent: Record<string, Set<string>> = {};
        const confirmationByComponent: Record<string, { confirm: boolean; reject: boolean }> = {};
        const checkboxByComponent: Record<string, { showOptions: boolean; showSave: boolean }> = {};

        visibleComponents.forEach((component) => {
            if (component.type === 'prompt' && hasConnectionForHandle(`handle-${component.id}`)) {
                promptComponentIds.add(component.id);
            }

            if (component.type === 'selectionList') {
                const content = component.content as import('./types').SelectionListContent;
                const connectedItemIds = (content.items || [])
                    .filter((item) => hasConnectionForHandle(`handle-${component.id}-${item.id}`))
                    .map((item) => item.id);

                if (connectedItemIds.length > 0) {
                    selectionItemIdsByComponent[component.id] = new Set(connectedItemIds);
                }
            }

            if (component.type === 'confirmationCard') {
                const hasConfirm = hasConnectionForHandle(`handle-${component.id}-confirm`);
                const hasReject = hasConnectionForHandle(`handle-${component.id}-reject`);
                if (hasConfirm || hasReject) {
                    confirmationByComponent[component.id] = {
                        confirm: hasConfirm,
                        reject: hasReject
                    };
                }
            }

            if (component.type === 'checkboxGroup') {
                const isConnected = hasConnectionForHandle(`handle-${component.id}`);
                if (isConnected) {
                    checkboxByComponent[component.id] = {
                        showOptions: true,
                        showSave: true
                    };
                }
            }
        });

        // Keep composer hotspot logic aligned with how typed traversal actually works:
        // free-text matching considers all outgoing targets from this turn.
        const textTargets = outgoingConnections
            .map((connection) => stepById.get(connection.target))
            .filter(
                (step): step is import('./types').UserTurn =>
                    !!step && step.type === 'user-turn' && step.inputType === 'text'
            );

        const suggestions = Array.from(
            new Set(
                textTargets.flatMap((step) => {
                    const examples = parseTriggerExamples(step.triggerValue);
                    if (examples.length > 0) return examples;
                    const triggerValue = step.triggerValue?.trim();
                    return triggerValue ? [triggerValue] : [];
                })
            )
        );

        return {
            turnId: activeInteractiveTurn.id,
            promptComponentIds,
            selectionItemIdsByComponent,
            confirmationByComponent,
            checkboxByComponent,
            composer: {
                showHotspot: textTargets.length > 0,
                suggestions
            }
        };
    }, [activeInteractiveTurn, flow.connections, flow.steps, showHotspotsEnabled, visibleComponentIds, streamingComponentId]);

    useEffect(() => {
        if (!showHotspotsEnabled || shouldShowFullPathPanel) {
            onComposerGuidanceChange?.(EMPTY_COMPOSER_GUIDANCE);
            return;
        }

        onComposerGuidanceChange?.(interactionHotspots?.composer || EMPTY_COMPOSER_GUIDANCE);
    }, [interactionHotspots, onComposerGuidanceChange, shouldShowFullPathPanel, showHotspotsEnabled]);

    const handleOverlayResolve = (value: string) => {
        if (!overlaySelection) return;

        if (overlaySelection.mode === 'interceptor') {
            resolveInterceptor(
                overlaySelection.stepId,
                overlaySelection.variableName,
                value,
                overlaySelection.branches,
                overlaySelection.interceptorId
            );
        } else {
            switchConditionPath(
                overlaySelection.stepId,
                overlaySelection.variableName,
                value,
                overlaySelection.branches
            );
        }

        setIsPathPanelExpanded(false);
    };


    // Report Status to Parent (Container)
    useEffect(() => {
        const isRunning = isThinking || isProcessingQueue || !!streamingComponentId;

        if (isRunning) {
            onStatusChange?.('stop', handleStop);
        } else {
            onStatusChange?.('default', undefined);
        }
    }, [isThinking, isProcessingQueue, streamingComponentId, onStatusChange, handleStop]);


    // REGISTER COMPOSER HANDLER
    useEffect(() => {
        onRegisterSend(() => {
            const input = composerValue.trim();
            if (!input) return;

            onComposerReset();
            handleSend(input);
        });
    }, [composerValue, handleSend, onComposerReset, onRegisterSend]);


    // --- AUTO-SCROLL LOGIC ---
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        // Scroll when history changes or thinking state toggles
        scrollToBottom();
    }, [history, isThinking, visibleComponentIds]);

    // Render logic
    return (
        <div className="relative">
            <div className={`space-y-4 ${listBottomPaddingClass}`}>
            {/* Disclaimer (Global) */}
            {flow.settings?.showDisclaimer && <Message variant="disclaimer" />}

            {history.map((step, historyIndex) => {

                // 3. Feedback Step (NEW)
                if (step.type === 'feedback') {
                    return (
                        <div key={step.id} className="flex flex-col gap-2">
                            <InlineFeedback
                                type="neutral"
                                message={step.message}
                                showAction={false}
                            />
                        </div>
                    );
                }

                // 4. Interceptor Step (NEW)
                if (step.type === 'interceptor') {
                    return null;
                }

                // 1. AI Turn
                if (step.type === 'turn') {
                    const components = step.components;
                    const isHotspotTurn = !!interactionHotspots &&
                        interactionHotspots.turnId === step.id &&
                        !shouldShowFullPathPanel;

                    // Filter components that should be visible
                    const visibleComponents = components.filter(c =>
                        visibleComponentIds.has(c.id) || streamingComponentId === c.id
                    );

                    const renderedComponents: React.ReactNode[] = [];
                    let i = 0;

                    while (i < visibleComponents.length) {
                        const component = visibleComponents[i];
                        const isStreaming = streamingComponentId === component.id;

                        // GROUPING LOGIC FOR PROMPTS
                        if (component.type === 'prompt') {
                            const groupPrompts = [];
                            let j = i;

                            // Look ahead and collect consecutive prompts
                            while (j < visibleComponents.length && visibleComponents[j].type === 'prompt') {
                                const pComp = visibleComponents[j];
                                const content = pComp.content as import('./types').PromptContent;
                                groupPrompts.push({
                                    text: content.text || '\u00A0',
                                    showAiIcon: content.showAiIcon,
                                    onClick: () => handlePromptClick(step.id, pComp.id, content.text),
                                    className: !content.text ? "min-w-[120px]" : undefined,
                                    showHotspot: isHotspotTurn && interactionHotspots.promptComponentIds.has(pComp.id)
                                });
                                j++;
                            }

                            // Render the collected group
                            renderedComponents.push(
                                <div key={`prompt-group-${component.id}`} className="flex flex-wrap gap-2 animate-fade-in">
                                    <PromptGroup prompts={groupPrompts} />
                                </div>
                            );

                            // Advance the main index past the grouped prompts
                            i = j;
                            continue;
                        }

                        // STANDARD RENDERING FOR OTHER COMPONENTS
                        if (component.type === 'message') {
                            const fullText = (component.content as import('./types').AIMessageContent).text;
                            const textToDisplay = isStreaming ? currentStreamingText : fullText;

                            if (fullText) {
                                renderedComponents.push(
                                    <Message
                                        key={component.id}
                                        variant="ai"
                                        defaultText={textToDisplay}
                                        className={!isStreaming ? "animate-fade-in" : ""}
                                    />
                                );
                            } else {
                                renderedComponents.push(
                                    <div key={component.id} className="animate-fade-in w-full h-[40px] bg-shell-surface-subtle rounded-lg border border-shell-border-subtle" />
                                );
                            }
                        }
                        else if (component.type === 'infoMessage') {
                            const content = component.content as import('./types').AIInfoContent;
                            const fullBody = content.body;
                            const bodyToDisplay = isStreaming ? currentStreamingText : fullBody;

                            if (fullBody) {
                                renderedComponents.push(
                                    <InfoMessage
                                        key={component.id}
                                        sources={content.sources?.map(s => ({ text: s.text, url: s.url }))}
                                        className={!isStreaming ? "animate-fade-in" : ""}
                                    >
                                        {bodyToDisplay}
                                    </InfoMessage>
                                );
                            } else {
                                renderedComponents.push(
                                    <div key={component.id} className="animate-fade-in w-full h-[60px] bg-shell-surface-subtle rounded-lg border border-shell-border-subtle" />
                                );
                            }
                        }
                        else if (component.type === 'statusCard') {
                            const content = component.content as import('./types').AIStatusContent;
                            renderedComponents.push(<SimulatedStatusCard key={component.id} content={content} />);
                        }
                        else if (component.type === 'selectionList') {
                            const content = component.content as import('./types').SelectionListContent;
                            renderedComponents.push(
                                <SelectionList
                                    key={component.id}
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    items={content.items as any}
                                    layout={content.layout}
                                    className="animate-fade-in"
                                    onSelect={(item) => handleSelectionItemClick(step.id, component.id, item.id, item.title)}
                                    hotspotItemIds={isHotspotTurn
                                        ? Array.from(interactionHotspots.selectionItemIdsByComponent[component.id] || [])
                                        : []}
                                />
                            );
                        }
                        else if (component.type === 'confirmationCard') {
                            const content = component.content as import('./types').ConfirmationCardContent;
                            const safeItem = content.item || {
                                id: `candidate-${component.id}`,
                                title: 'Candidate',
                                visualType: 'none' as const
                            };
                            renderedComponents.push(
                                <ConfirmationCard
                                    key={component.id}
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    item={safeItem as any}
                                    confirmLabel={content.confirmLabel}
                                    rejectLabel={content.rejectLabel}
                                    className="animate-fade-in"
                                    onConfirm={() =>
                                        handleConfirmationAction(
                                            step.id,
                                            component.id,
                                            'confirm',
                                            content.confirmLabel || 'Yes, confirm'
                                        )
                                    }
                                    onReject={() =>
                                        handleConfirmationAction(
                                            step.id,
                                            component.id,
                                            'reject',
                                            content.rejectLabel || 'No, not this person'
                                        )
                                    }
                                    showConfirmHotspot={isHotspotTurn && !!interactionHotspots.confirmationByComponent[component.id]?.confirm}
                                    showRejectHotspot={isHotspotTurn && !!interactionHotspots.confirmationByComponent[component.id]?.reject}
                                />
                            );
                        }
                        else if (component.type === 'checkboxGroup') {
                            const content = component.content as import('./types').CheckboxGroupContent;
                            renderedComponents.push(
                                <CheckboxGroup
                                    key={component.id}
                                    title={content.title}
                                    description={content.description}
                                    options={content.options}
                                    saveLabel={content.saveLabel}
                                    className="animate-fade-in"
                                    onSave={(selectedIds) => {
                                        const selectedLabels = (content.options || [])
                                            .filter((option) => selectedIds.includes(option.id))
                                            .map((option) => option.label);

                                        handleCheckboxSave(
                                            step.id,
                                            component.id,
                                            selectedIds,
                                            selectedLabels,
                                            content.saveLabel
                                        );
                                    }}
                                    showOptionHotspots={isHotspotTurn && !!interactionHotspots.checkboxByComponent[component.id]?.showOptions}
                                    showSaveHotspot={isHotspotTurn && !!interactionHotspots.checkboxByComponent[component.id]?.showSave}
                                />
                            );
                        }

                        i++;
                    }

                    return (
                        <div key={`${step.id}-${historyIndex}`} className="flex flex-col gap-4">
                            {renderedComponents}
                        </div>
                    );
                }

                // 2. User Turn (Visual Bubble)
                if (step.type === 'user-turn') {
                    // Safe cast
                    const userTurn = step as import('./types').UserTurn;
                    return (
                        <div key={`${step.id}-${historyIndex}`} className="flex justify-end animate-fade-in">
                            <Message
                                variant="user"
                                userText={userTurn.label}
                            />
                        </div>
                    );
                }

                return null;
            })}

            {/* Thinking Indicator */}
            {isThinking && (
                <div className="flex justify-start animate-fade-in">
                    <Message
                        variant="ai"
                        isThinking={true}
                    />
                </div>
            )}

            <div ref={messagesEndRef} className="h-4" />
            </div>

            {overlaySelection && shouldShowFullPathPanel && (
                <div className="pointer-events-none absolute inset-x-0 bottom-2 z-30 flex justify-center px-2">
                    <ContextInterceptorMessage
                        className="pointer-events-auto w-full max-w-[360px]"
                        variableName={overlaySelection.variableName}
                        branches={overlaySelection.branches}
                        onResolve={handleOverlayResolve}
                    />
                </div>
            )}

            {shouldShowCompactPathPill && (
                <div className="pointer-events-none absolute inset-x-0 bottom-2 z-20 flex justify-center px-2">
                    <div
                        role="button"
                        tabIndex={0}
                        onClick={() => setIsPathPanelExpanded(true)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                setIsPathPanelExpanded(true);
                            }
                        }}
                        className="pointer-events-auto inline-flex max-w-[360px] items-center gap-2 rounded-xl border border-shell-node-condition/35 bg-[rgb(var(--shell-node-condition-surface)/1)] px-3 py-1.5 text-left shadow-sm"
                    >
                        <Split size={13} className="shrink-0 text-shell-node-condition" />
                        <div className="min-w-0">
                            <p className="text-[10px] font-medium uppercase tracking-wide text-shell-muted">
                                {overlaySelection.mode === 'interceptor' ? 'Preview paused' : 'Preview path'}
                            </p>
                            <p
                                className="max-w-[170px] truncate text-xs font-medium text-shell-muted-strong"
                                title={overlaySelection.selectedLabel}
                            >
                                {overlaySelection.selectedLabel}
                            </p>
                        </div>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsPathPanelExpanded(true);
                            }}
                            className="ml-1 text-[11px] font-medium text-shell-accent-text hover:text-shell-accent"
                        >
                            {overlaySelection.mode === 'interceptor' ? 'Open' : 'Change'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- SIMULATED COMPONENT ---
const SimulatedStatusCard = ({ content }: { content: import('./types').AIStatusContent }) => {
    // Local state for simulation
    const [status, setStatus] = useState<'in-progress' | 'success'>('in-progress');

    useEffect(() => {
        // 1. Start with in-progress
        setStatus('in-progress');

        // 2. Wait 2 seconds (simulated API delay)
        const timer = setTimeout(() => {
            setStatus('success');
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    // 3. Render
    return (
        <div className="animate-fade-in">
            <StatusCard
                status={status}
                title={status === 'in-progress' ? (content.loadingTitle || "Processing...") : content.successTitle}
            >
                {status === 'success' && content.successDescription}
            </StatusCard>
        </div>
    );
};
