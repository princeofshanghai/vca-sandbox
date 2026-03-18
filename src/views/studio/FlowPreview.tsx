// ... (imports)
import { useState, useEffect, useRef, useCallback, useMemo, type ReactNode } from 'react';
import { Branch, Flow } from './types';
import { Composer } from '@/components/vca-components/composer';
import { Container } from '@/components/vca-components/container/Container';
import { Header } from '@/components/vca-components/header';
import { Message } from '@/components/vca-components/messages';
import { InfoMessage } from '@/components/vca-components/info-message/InfoMessage';
import { StatusCard } from '@/components/vca-components/status-card/StatusCard';
import { PromptGroup } from '@/components/vca-components/prompt-group/PromptGroup';
import { PhoneFrame } from '@/components/component-library/PhoneFrame';
import { Flag, Pencil, Split } from 'lucide-react';
import { ShellIconButton } from '@/components/shell';

import { InlineFeedback } from '@/components/vca-components/inline-feedback';
import { SelectionList } from '@/components/vca-components/selection-list/SelectionList';
import { DisplayCard } from '@/components/vca-components/confirmation-card';
import {
    CheckboxGroup,
    getCheckboxGroupPrimaryLabel,
    getCheckboxGroupSecondaryLabel,
} from '@/components/vca-components/checkbox-group/CheckboxGroup';
import {
    ContextInterceptorMessage,
    type ContextInterceptorResolution,
} from './components/ContextInterceptorMessage';
import { getConditionPathLabel, getConditionQuestionLabel } from './conditionBranchLabels';
import {
    type ConditionPathSelection,
    type SmartFlowEngineSnapshot,
    useSmartFlowEngine,
} from '@/hooks/useSmartFlowEngine';


interface FlowPreviewProps {
    flow: Flow;
    isPremium: boolean;
    isMobile: boolean;
    variables: Record<string, string>;
    onVariableUpdate?: (key: string, value: string) => void;
    desktopPosition?: 'center' | 'bottom-right';
    topControl?: ReactNode;
    reviewMode?: boolean;
    initialReviewSnapshot?: SmartFlowEngineSnapshot | null;
    onReviewStateChange?: (state: FlowPreviewReviewState) => void;
    onReviewSnapshotChange?: (snapshot: SmartFlowEngineSnapshot) => void;
    reviewPathChangeRequest?: FlowPreviewReviewPathChangeRequest | null;
    showInlinePathControls?: boolean;
    showEndOfFlowIndicator?: boolean;
}

export interface FlowPreviewReviewPathSelection {
    stepId: string;
    stepLabel: string;
    variableName: string;
    branches: Branch[];
    selectedBranchId: string;
    selectedLabel: string;
}

export interface FlowPreviewReviewDecision {
    stepId: string;
    stepLabel: string;
    variableName: string;
    branches: Branch[];
    selectedBranchId: string | null;
    selectedLabel: string;
    mode: 'selection' | 'interceptor';
}

export interface FlowPreviewReviewPathChangeRequest {
    token: number;
    stepId: string;
    branchId: string;
    mode: 'selection' | 'interceptor';
}

export interface FlowPreviewReviewState {
    pathSelections: FlowPreviewReviewPathSelection[];
    decisions: FlowPreviewReviewDecision[];
    pathSignature: string;
    historyLength: number;
}

type ComposerGuidanceState = {
    showHotspot: boolean;
    suggestions: string[];
};

type ComposerSendHandler = (overrideValue?: string) => void;

interface InteractionHotspotState {
    turnId: string;
    promptComponentIds: Set<string>;
    selectionItemIdsByComponent: Record<string, Set<string>>;
    confirmationByComponent: Record<string, { confirm: boolean; reject: boolean }>;
    checkboxByComponent: Record<string, { showOptions: boolean; primary: boolean; secondary: boolean }>;
    composer: ComposerGuidanceState;
}

interface InteractionState extends InteractionHotspotState {
    hasAnyInteractivePath: boolean;
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

const getUserTurnDisplayText = (userTurn: { triggerValue?: string; label: string }) => {
    const examples = parseTriggerExamples(userTurn.triggerValue);
    if (examples.length > 0) return examples[0];

    const triggerValue = userTurn.triggerValue?.trim();
    if (triggerValue) return triggerValue;

    return userTurn.label;
};

const buildPathSignature = (pathSelections: ConditionPathSelection[]) =>
    pathSelections.map((selection) => `${selection.stepId}:${selection.selectedBranchId}`).join('|');

const getSelectedPathDisplayLabel = (
    branches: Branch[],
    selectedBranchId: string | null | undefined,
    fallbackLabel: string
) => {
    const selectedBranch = selectedBranchId
        ? branches.find((branch) => branch.id === selectedBranchId)
        : null;

    return selectedBranch ? getConditionPathLabel(selectedBranch) : fallbackLabel;
};

const buildReviewBlockId = ({
    kind,
    stepId,
    historyIndex,
    componentId,
}: {
    kind: 'turn' | 'component' | 'decision' | 'feedback';
    stepId: string;
    historyIndex: number;
    componentId?: string | null;
}) => [kind, stepId, historyIndex, componentId || 'root'].join(':');

export const FlowPreview = ({
    flow,
    isPremium,
    isMobile,
    variables,
    onVariableUpdate,
    desktopPosition = 'center',
    topControl,
    reviewMode = false,
    initialReviewSnapshot = null,
    onReviewStateChange,
    onReviewSnapshotChange,
    reviewPathChangeRequest = null,
    showInlinePathControls = true,
    showEndOfFlowIndicator = false,
}: FlowPreviewProps) => {
    const hotspotsEnabled = flow.settings?.showHotspots ?? true;
    // Shared composer state
    const [composerValue, setComposerValue] = useState('');
    const handleSendRef = useRef<ComposerSendHandler | undefined>(undefined);
    const stopHandlerRef = useRef<(() => void) | undefined>(undefined);
    const [composerGuidance, setComposerGuidance] = useState<ComposerGuidanceState>(EMPTY_COMPOSER_GUIDANCE);

    // Lifted status state for Composer (only re-render when status changes)
    const [composerStatus, setComposerStatus] = useState<'default' | 'active' | 'stop' | 'disabled'>('default');

    const handleRegisterSend = useCallback((fn: ComposerSendHandler) => {
        handleSendRef.current = fn;
    }, []);

    const handleStatusChange = useCallback((status: 'default' | 'active' | 'stop' | 'disabled', onStop?: () => void) => {
        stopHandlerRef.current = onStop;
        setComposerStatus((prev) => (prev === status ? prev : status));
    }, []);

    const handleComposerSend = useCallback(() => {
        handleSendRef.current?.();
    }, []);

    const handleComposerHotspotUse = useCallback((value: string) => {
        const trimmedValue = value.trim();
        if (!trimmedValue) return;

        handleSendRef.current?.(trimmedValue);
    }, []);

    const handleComposerStop = useCallback(() => {
        stopHandlerRef.current?.();
    }, []);

    const [showEndOfFlowChipVisible, setShowEndOfFlowChipVisible] = useState(false);

    const previewContentProps = {
        flow,
        variables,
        onVariableUpdate,
        onRegisterSend: handleRegisterSend,
        onComposerReset: () => setComposerValue(''),
        composerValue,
        onStatusChange: handleStatusChange,
        onComposerGuidanceChange: setComposerGuidance,
        showHotspotsEnabled: hotspotsEnabled,
        reviewMode,
        initialReviewSnapshot,
        onReviewStateChange,
        onReviewSnapshotChange,
        reviewPathChangeRequest,
        showInlinePathControls,
        onEndOfFlowStateChange: setShowEndOfFlowChipVisible,
    };

    const endOfFlowChip = showEndOfFlowIndicator && showEndOfFlowChipVisible && !reviewMode ? (
        <div className="pointer-events-auto inline-flex animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-1 duration-300 ease-out items-center gap-1.5 rounded-full border border-shell-success-border bg-shell-success-soft px-3.5 py-1.5 text-[11px] font-medium text-shell-success-text shadow-sm">
            <Flag size={12} className="shrink-0 text-shell-success-text" />
            End of flow
        </div>
    ) : null;

    return (
        <div className="h-full w-full flex flex-col relative bg-transparent pointer-events-none">

            <div
                data-review-scroll-container={reviewMode ? 'true' : undefined}
                className={`flex-1 flex flex-col overflow-y-auto thin-scrollbar ${
                    reviewMode
                        ? 'items-center justify-start px-4 py-6'
                        : (isMobile || desktopPosition === 'center'
                            ? 'items-center justify-center p-4'
                            : 'items-end justify-end p-6')
                }`}
            >
                {reviewMode ? (
                    <div className="pointer-events-auto inline-flex w-full flex-col items-center gap-4">
                        {topControl ? (
                            <div className="w-full max-w-[420px]">{topControl}</div>
                        ) : null}
                        <div
                            className={`flex w-full flex-col overflow-hidden rounded-vca-sm border border-vca-border-faint bg-vca-background shadow-[0_4px_12px_0_rgba(0,0,0,0.30),0_0_1px_0_rgba(140,140,140,0.20)] ${isMobile ? 'max-w-[393px] min-h-[772px]' : 'max-w-[400px] min-h-[688px]'}`}
                        >
                            <Header
                                title="Help"
                                position="left"
                                viewport="desktop"
                                showBack={false}
                                showAction={false}
                                showClose={false}
                                showPremiumIcon={isPremium}
                                showPremiumBorder={isPremium}
                            />
                            <div className="flex-1 bg-vca-background px-vca-xxl py-vca-lg">
                                <PreviewContent {...previewContentProps} />
                            </div>
                            <Composer status="disabled" className="shrink-0" />
                        </div>
                    </div>
                ) : isMobile ? (
                    <div className="pointer-events-auto inline-flex flex-col items-center gap-5 mt-8">
                        {topControl ? (
                            <div>{topControl}</div>
                        ) : null}
                        <div className="inline-flex flex-col items-center gap-3">
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
                                            composerStatus={reviewMode ? 'disabled' : composerStatus}
                                            onStop={handleComposerStop}
                                            composerHotspotVisible={!reviewMode && hotspotsEnabled && composerGuidance.showHotspot}
                                            composerHotspotSuggestions={composerGuidance.suggestions}
                                            onComposerHotspotUse={!reviewMode ? handleComposerHotspotUse : undefined}
                                        >
                                            <PreviewContent {...previewContentProps} />
                                        </Container>
                                    </PhoneFrame>
                                </div>
                            </div>
                            {endOfFlowChip}
                        </div>
                    </div>
                ) : (
                    <div className="relative pointer-events-auto inline-flex flex-col items-center gap-5">
                        {topControl ? (
                            <div>{topControl}</div>
                        ) : null}

                        <div className="inline-flex flex-col items-center gap-3">
                            <Container
                                headerTitle="Help"
                                className="shadow-xl bg-shell-bg"
                                viewport="desktop"
                                showHeaderPremiumIcon={isPremium}
                                showPremiumBorder={isPremium}
                                composerValue={composerValue}
                                onComposerChange={setComposerValue}
                                onComposerSend={handleComposerSend}
                                composerStatus={reviewMode ? 'disabled' : composerStatus}
                                onStop={handleComposerStop}
                                composerHotspotVisible={!reviewMode && hotspotsEnabled && composerGuidance.showHotspot}
                                composerHotspotSuggestions={composerGuidance.suggestions}
                                onComposerHotspotUse={!reviewMode ? handleComposerHotspotUse : undefined}
                            >
                                <PreviewContent {...previewContentProps} />
                            </Container>
                            {endOfFlowChip}
                        </div>
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
    showHotspotsEnabled,
    reviewMode = false,
    initialReviewSnapshot = null,
    onReviewStateChange,
    onReviewSnapshotChange,
    reviewPathChangeRequest = null,
    showInlinePathControls = true,
    onEndOfFlowStateChange,
}: {
    flow: Flow,
    variables?: Record<string, string>,
    onVariableUpdate?: (key: string, value: string) => void,
    onRegisterSend: (fn: ComposerSendHandler) => void,
    onComposerReset: () => void,
    composerValue: string,
    onStatusChange?: (status: 'default' | 'active' | 'stop' | 'disabled', onStop?: () => void) => void,
    onComposerGuidanceChange?: (guidance: ComposerGuidanceState) => void,
    showHotspotsEnabled: boolean,
    reviewMode?: boolean,
    initialReviewSnapshot?: SmartFlowEngineSnapshot | null,
    onReviewStateChange?: (state: FlowPreviewReviewState) => void,
    onReviewSnapshotChange?: (snapshot: SmartFlowEngineSnapshot) => void,
    reviewPathChangeRequest?: FlowPreviewReviewPathChangeRequest | null,
    showInlinePathControls?: boolean,
    onEndOfFlowStateChange?: (isEndOfFlow: boolean) => void,
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
        handleCheckboxAction,
        resolveInterceptor,
        resolveInterceptorBranch,
        switchConditionPath,
        switchConditionPathBranch,
        lastConditionSelection,
        pathSelections,
    } = useSmartFlowEngine({
        flow,
        variables,
        onVariableUpdate,
        initialSnapshot: initialReviewSnapshot,
        reviewMode,
    });

    const [isPathPanelExpanded, setIsPathPanelExpanded] = useState(false);
    const handledReviewPathRequestRef = useRef<number | null>(null);

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

    const conditionStepLabels = useMemo(() => {
        const entries: Array<[string, string]> = (flow.steps || [])
            .filter((step): step is Extract<NonNullable<Flow['steps']>[number], { type: 'condition' }> => step.type === 'condition')
            .map((step) => [step.id, getConditionQuestionLabel(step.question, step.label)]);
        return new Map(entries);
    }, [flow.steps]);

    const overlaySelection = useMemo(() => (
        activeInterceptor
            ? {
                mode: 'interceptor' as const,
                stepLabel: conditionStepLabels.get(activeInterceptor.stepId) || 'Condition',
                variableName: activeInterceptor.variableName,
                branches: activeInterceptor.branches,
                stepId: activeInterceptor.stepId,
                interceptorId: activeInterceptor.id,
                selectedBranchId: null,
                selectedLabel: conditionStepLabels.get(activeInterceptor.stepId) || 'Condition'
            }
            : lastConditionSelection
                ? {
                    mode: 'selection' as const,
                    stepLabel: conditionStepLabels.get(lastConditionSelection.stepId) || 'Condition',
                    variableName: lastConditionSelection.variableName,
                    branches: lastConditionSelection.branches,
                    stepId: lastConditionSelection.stepId,
                    selectedBranchId: lastConditionSelection.selectedBranchId,
                    selectedLabel: lastConditionSelection.selectedLabel
                }
                : null
    ), [activeInterceptor, conditionStepLabels, lastConditionSelection]);
    const pathSignature = useMemo(() => buildPathSignature(pathSelections), [pathSelections]);
    const reviewPathSelections = useMemo<FlowPreviewReviewPathSelection[]>(
        () =>
            pathSelections.map((selection) => ({
                stepId: selection.stepId,
                stepLabel: conditionStepLabels.get(selection.stepId) || 'Condition',
                variableName: selection.variableName,
                branches: selection.branches,
                selectedBranchId: selection.selectedBranchId,
                selectedLabel: selection.selectedLabel,
            })),
        [conditionStepLabels, pathSelections]
    );
    const reviewDecisions = useMemo<FlowPreviewReviewDecision[]>(() => {
        const decisions: FlowPreviewReviewDecision[] = reviewPathSelections.map((selection) => ({
            ...selection,
            selectedBranchId: selection.selectedBranchId,
            mode: 'selection' as const,
        }));

        if (activeInterceptor) {
            decisions.push({
                stepId: activeInterceptor.stepId,
                stepLabel: conditionStepLabels.get(activeInterceptor.stepId) || 'Condition',
                variableName: activeInterceptor.variableName,
                branches: activeInterceptor.branches,
                selectedBranchId: null,
                selectedLabel: conditionStepLabels.get(activeInterceptor.stepId) || 'Condition',
                mode: 'interceptor',
            });
        }

        return decisions;
    }, [activeInterceptor, conditionStepLabels, reviewPathSelections]);

    useEffect(() => {
        onReviewStateChange?.({
            pathSelections: reviewPathSelections,
            decisions: reviewDecisions,
            pathSignature,
            historyLength: history.length,
        });
    }, [history.length, onReviewStateChange, pathSignature, reviewDecisions, reviewPathSelections]);

    useEffect(() => {
        onReviewSnapshotChange?.({
            history,
            visibleComponentIds: Array.from(visibleComponentIds),
            lastConditionSelection,
            pathSelections,
        });
    }, [history, lastConditionSelection, onReviewSnapshotChange, pathSelections, visibleComponentIds]);

    useEffect(() => {
        if (!reviewPathChangeRequest) return;
        if (handledReviewPathRequestRef.current === reviewPathChangeRequest.token) return;

        handledReviewPathRequestRef.current = reviewPathChangeRequest.token;

        const decision = reviewDecisions.find(
            (candidate) =>
                candidate.stepId === reviewPathChangeRequest.stepId &&
                candidate.mode === reviewPathChangeRequest.mode
        );

        if (!decision) return;
        if (
            reviewPathChangeRequest.mode === 'selection' &&
            decision.selectedBranchId === reviewPathChangeRequest.branchId
        ) {
            return;
        }

        const nextBranch = decision.branches.find(
            (branch) => branch.id === reviewPathChangeRequest.branchId
        );

        if (!nextBranch) return;

        if (reviewPathChangeRequest.mode === 'interceptor') {
            resolveInterceptorBranch(
                decision.stepId,
                nextBranch.id,
                decision.branches,
                `interceptor-${decision.stepId}`
            );
        } else {
            switchConditionPathBranch(
                decision.stepId,
                nextBranch.id,
                decision.branches,
            );
        }
    }, [resolveInterceptorBranch, reviewDecisions, reviewPathChangeRequest, switchConditionPathBranch]);

    const shouldShowFullPathPanel = showInlinePathControls && !reviewMode && !!overlaySelection && isPathPanelExpanded;
    const shouldShowCompactPathPill = showInlinePathControls && !reviewMode && !!overlaySelection && !isPathPanelExpanded;
    const compactPathLabel = overlaySelection
        ? overlaySelection.mode === 'interceptor'
            ? 'Choose path'
            : getSelectedPathDisplayLabel(
                overlaySelection.branches,
                overlaySelection.selectedBranchId,
                overlaySelection.selectedLabel
            )
        : '';
    const activeInteractiveTurn = useMemo(
        () => [...history].reverse().find((step) => step.type === 'turn') as import('./types').Turn | undefined || null,
        [history]
    );

    const interactionState = useMemo<InteractionState | null>(() => {
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
        const checkboxByComponent: Record<string, { showOptions: boolean; primary: boolean; secondary: boolean }> = {};

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
                const content = component.content as import('./types').ConfirmationCardContent;
                if (content.showActions === false) {
                    return;
                }
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
                const hasPrimary = hasConnectionForHandle(`handle-${component.id}`);
                const hasSecondary = hasConnectionForHandle(`handle-${component.id}-secondary`);
                if (hasPrimary || hasSecondary) {
                    checkboxByComponent[component.id] = {
                        showOptions: true,
                        primary: hasPrimary,
                        secondary: hasSecondary
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

        const hasAnyInteractivePath =
            promptComponentIds.size > 0 ||
            Object.keys(selectionItemIdsByComponent).length > 0 ||
            Object.keys(confirmationByComponent).length > 0 ||
            Object.keys(checkboxByComponent).length > 0 ||
            textTargets.length > 0;

        return {
            turnId: activeInteractiveTurn.id,
            promptComponentIds,
            selectionItemIdsByComponent,
            confirmationByComponent,
            checkboxByComponent,
            composer: {
                showHotspot: textTargets.length > 0,
                suggestions
            },
            hasAnyInteractivePath,
        };
    }, [activeInteractiveTurn, flow.connections, flow.steps, visibleComponentIds, streamingComponentId]);

    const interactionHotspots = useMemo<InteractionHotspotState | null>(() => {
        if (!showHotspotsEnabled || !interactionState) return null;

        return {
            turnId: interactionState.turnId,
            promptComponentIds: interactionState.promptComponentIds,
            selectionItemIdsByComponent: interactionState.selectionItemIdsByComponent,
            confirmationByComponent: interactionState.confirmationByComponent,
            checkboxByComponent: interactionState.checkboxByComponent,
            composer: interactionState.composer,
        };
    }, [interactionState, showHotspotsEnabled]);

    const hasInteractivePathAvailable = interactionState?.hasAnyInteractivePath ?? false;

    useEffect(() => {
        if (reviewMode || !showHotspotsEnabled || shouldShowFullPathPanel) {
            onComposerGuidanceChange?.(EMPTY_COMPOSER_GUIDANCE);
            return;
        }

        onComposerGuidanceChange?.(interactionHotspots?.composer || EMPTY_COMPOSER_GUIDANCE);
    }, [interactionHotspots, onComposerGuidanceChange, reviewMode, shouldShowFullPathPanel, showHotspotsEnabled]);

    const handleOverlayResolve = (resolution: ContextInterceptorResolution) => {
        if (!overlaySelection) return;

        if (resolution.type === 'branch') {
            if (overlaySelection.mode === 'interceptor') {
                resolveInterceptorBranch(
                    overlaySelection.stepId,
                    resolution.branchId,
                    overlaySelection.branches,
                    overlaySelection.interceptorId
                );
            } else {
                switchConditionPathBranch(
                    overlaySelection.stepId,
                    resolution.branchId,
                    overlaySelection.branches
                );
            }
        } else {
            if (overlaySelection.mode === 'interceptor') {
                resolveInterceptor(
                    overlaySelection.stepId,
                    overlaySelection.variableName,
                    resolution.value,
                    overlaySelection.branches,
                    overlaySelection.interceptorId
                );
            } else {
                switchConditionPath(
                    overlaySelection.stepId,
                    overlaySelection.variableName,
                    resolution.value,
                    overlaySelection.branches
                );
            }
        }

        setIsPathPanelExpanded(false);
    };

    const hasRenderedFlowContent = history.some(
        (step) =>
            step.type === 'turn' ||
            step.type === 'user-turn' ||
            step.type === 'condition-selection'
    );
    const lastMeaningfulStep = history
        .slice()
        .reverse()
        .find((step) => step.type !== 'feedback') || null;
    const hasReachedEndOfCurrentPath =
        !reviewMode &&
        hasRenderedFlowContent &&
        !isThinking &&
        !isProcessingQueue &&
        !streamingComponentId &&
        !activeInterceptor &&
        !hasInteractivePathAvailable &&
        !!lastMeaningfulStep &&
        (lastMeaningfulStep.type === 'turn' || lastMeaningfulStep.type === 'condition-selection');

    useEffect(() => {
        onEndOfFlowStateChange?.(hasReachedEndOfCurrentPath);
    }, [hasReachedEndOfCurrentPath, onEndOfFlowStateChange]);


    // Report Status to Parent (Container)
    useEffect(() => {
        if (reviewMode) {
            onStatusChange?.('disabled', undefined);
            return;
        }

        const isRunning = isThinking || isProcessingQueue || !!streamingComponentId;

        if (isRunning) {
            onStatusChange?.('stop', handleStop);
        } else {
            onStatusChange?.('default', undefined);
        }
    }, [handleStop, isProcessingQueue, isThinking, onStatusChange, reviewMode, streamingComponentId]);


    // REGISTER COMPOSER HANDLER
    useEffect(() => {
        if (reviewMode) {
            onRegisterSend(() => undefined);
            return;
        }

        onRegisterSend((overrideValue) => {
            const input = (overrideValue ?? composerValue).trim();
            if (!input) return;

            onComposerReset();
            handleSend(input);
        });
    }, [composerValue, handleSend, onComposerReset, onRegisterSend, reviewMode]);


    // --- AUTO-SCROLL LOGIC ---
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (reviewMode) return;
        // Scroll when history changes or thinking state toggles
        scrollToBottom();
    }, [history, isThinking, reviewMode, visibleComponentIds]);

    const getReviewBlockProps = useCallback(
        ({
            kind,
            stepId,
            historyIndex,
            componentId,
        }: {
            kind: 'turn' | 'component' | 'decision' | 'feedback';
            stepId: string;
            historyIndex: number;
            componentId?: string | null;
        }) => ({
            'data-review-block': reviewMode ? 'true' : undefined,
            'data-review-block-id': reviewMode
                ? buildReviewBlockId({ kind, stepId, historyIndex, componentId })
                : undefined,
            'data-review-anchor-kind': reviewMode ? kind : undefined,
            'data-review-step-id': reviewMode ? stepId : undefined,
            'data-review-component-id': reviewMode ? componentId || undefined : undefined,
            'data-review-history-index': reviewMode ? String(historyIndex) : undefined,
        }),
        [reviewMode]
    );

    const withRevealClass = useCallback(
        (baseClassName: string) =>
            reviewMode ? baseClassName : `${baseClassName} animate-fade-in`,
        [reviewMode]
    );

    // Render logic
    return (
        <div className="relative">
            <div className="space-y-4">
            {/* Disclaimer (Global) */}
            {flow.settings?.showDisclaimer && <Message variant="disclaimer" />}

            {history.map((step, historyIndex) => {

                // 3. Feedback Step (NEW)
                if (step.type === 'feedback') {
                    return (
                        <div
                            key={step.id}
                            className="flex flex-col gap-2"
                            {...getReviewBlockProps({
                                kind: 'feedback',
                                stepId: step.id,
                                historyIndex,
                            })}
                        >
                            <InlineFeedback
                                type="neutral"
                                message={step.message}
                                showAction={false}
                            />
                        </div>
                    );
                }

                if (step.type === 'condition-selection') {
                    if (!reviewMode) return null;

                    const questionLabel = conditionStepLabels.get(step.stepId) || 'Condition';
                    const pathLabel = getSelectedPathDisplayLabel(
                        step.branches,
                        step.selectedBranchId,
                        step.selectedLabel
                    );

                    return (
                        <div
                            key={step.id}
                            className={withRevealClass('flex justify-center')}
                            {...getReviewBlockProps({
                                kind: 'decision',
                                stepId: step.stepId,
                                historyIndex,
                            })}
                        >
                            <div className="w-full max-w-[420px]">
                                <div className="w-full inline-flex items-center gap-2 rounded-xl border border-shell-node-condition/35 bg-[rgb(var(--shell-node-condition-surface)/1)] px-3 py-2 text-left shadow-sm">
                                    <Split size={13} className="shrink-0 text-shell-node-condition" />
                                    <div className="min-w-0 flex-1">
                                        <p
                                            className="truncate text-xs font-medium text-shell-muted-strong"
                                            title={questionLabel}
                                        >
                                            {questionLabel}
                                        </p>
                                        <p className="mt-0.5 truncate text-[11px] text-shell-text" title={pathLabel}>
                                            {pathLabel}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                }

                // 4. Interceptor Step (NEW)
                if (step.type === 'interceptor') {
                    if (reviewMode) {
                        const questionLabel = conditionStepLabels.get(step.stepId) || 'Condition';

                        return (
                            <div
                                key={step.id}
                                className={withRevealClass('flex justify-center')}
                                {...getReviewBlockProps({
                                    kind: 'decision',
                                    stepId: step.stepId,
                                    historyIndex,
                                })}
                            >
                                <div className="w-full max-w-[420px] rounded-xl border border-shell-node-condition/35 bg-[rgb(var(--shell-node-condition-surface)/1)] px-3 py-2 text-left shadow-sm">
                                    <div className="inline-flex items-center gap-2">
                                        <Split size={13} className="shrink-0 text-shell-node-condition" />
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-xs font-medium text-shell-muted-strong" title={questionLabel}>
                                                {questionLabel}
                                            </p>
                                            <p className="mt-0.5 text-[11px] text-shell-text">
                                                Choose path
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    }

                    return null;
                }

                // 1. AI Turn
                if (step.type === 'turn') {
                    const components = step.components;
                    const isHotspotTurn = !reviewMode && !!interactionHotspots &&
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
                                <div
                                    key={`prompt-group-${component.id}`}
                                    className={withRevealClass('flex flex-wrap gap-2')}
                                    {...getReviewBlockProps({
                                        kind: 'component',
                                        stepId: step.id,
                                        historyIndex,
                                        componentId: component.id,
                                    })}
                                >
                                    <div className={reviewMode ? 'pointer-events-none' : undefined}>
                                        <PromptGroup
                                            prompts={groupPrompts.map((prompt) => ({
                                                ...prompt,
                                                onClick: reviewMode ? undefined : prompt.onClick,
                                                showHotspot: reviewMode ? false : prompt.showHotspot,
                                            }))}
                                        />
                                    </div>
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
                                    <div
                                        key={component.id}
                                        {...getReviewBlockProps({
                                            kind: 'component',
                                            stepId: step.id,
                                            historyIndex,
                                            componentId: component.id,
                                        })}
                                    >
                                        <Message
                                            variant="ai"
                                            defaultText={textToDisplay}
                                            className={!isStreaming && !reviewMode ? "animate-fade-in" : ""}
                                        />
                                    </div>
                                );
                            } else {
                                renderedComponents.push(
                                    <div
                                        key={component.id}
                                        className={withRevealClass('w-full h-[40px] bg-shell-surface-subtle rounded-lg border border-shell-border-subtle')}
                                        {...getReviewBlockProps({
                                            kind: 'component',
                                            stepId: step.id,
                                            historyIndex,
                                            componentId: component.id,
                                        })}
                                    />
                                );
                            }
                        }
                        else if (component.type === 'infoMessage') {
                            const content = component.content as import('./types').AIInfoContent;
                            const fullBody = content.body;
                            const bodyToDisplay = isStreaming ? currentStreamingText : fullBody;

                            if (fullBody) {
                                renderedComponents.push(
                                    <div
                                        key={component.id}
                                        {...getReviewBlockProps({
                                            kind: 'component',
                                            stepId: step.id,
                                            historyIndex,
                                            componentId: component.id,
                                        })}
                                    >
                                        <InfoMessage
                                            sources={content.sources?.map((source) => ({
                                                text: source.text,
                                                href: source.url,
                                            }))}
                                            onFeedbackChange={!isStreaming ? () => undefined : undefined}
                                            className={!isStreaming && !reviewMode ? "animate-fade-in" : ""}
                                        >
                                            {bodyToDisplay}
                                        </InfoMessage>
                                    </div>
                                );
                            } else {
                                renderedComponents.push(
                                    <div
                                        key={component.id}
                                        className={withRevealClass('w-full h-[60px] bg-shell-surface-subtle rounded-lg border border-shell-border-subtle')}
                                        {...getReviewBlockProps({
                                            kind: 'component',
                                            stepId: step.id,
                                            historyIndex,
                                            componentId: component.id,
                                        })}
                                    />
                                );
                            }
                        }
                        else if (component.type === 'statusCard') {
                            const content = component.content as import('./types').AIStatusContent;
                            renderedComponents.push(
                                <div
                                    key={component.id}
                                    {...getReviewBlockProps({
                                        kind: 'component',
                                        stepId: step.id,
                                        historyIndex,
                                        componentId: component.id,
                                    })}
                                >
                                    <SimulatedStatusCard content={content} reviewMode={reviewMode} />
                                </div>
                            );
                        }
                        else if (component.type === 'selectionList') {
                            const content = component.content as import('./types').SelectionListContent;
                            renderedComponents.push(
                                <div
                                    key={component.id}
                                    {...getReviewBlockProps({
                                        kind: 'component',
                                        stepId: step.id,
                                        historyIndex,
                                        componentId: component.id,
                                    })}
                                    >
                                        <div className={reviewMode ? 'pointer-events-none' : undefined}>
                                            <SelectionList
                                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                                items={content.items as any}
                                                layout={content.layout}
                                                className={!reviewMode ? 'animate-fade-in' : undefined}
                                                onSelect={reviewMode
                                                    ? undefined
                                                    : (item) => handleSelectionItemClick(step.id, component.id, item.id, item.title)}
                                                hotspotItemIds={reviewMode
                                                    ? []
                                                    : (isHotspotTurn
                                                        ? Array.from(interactionHotspots.selectionItemIdsByComponent[component.id] || [])
                                                        : [])}
                                            />
                                        </div>
                                    </div>
                                );
                            }
                        else if (component.type === 'confirmationCard') {
                            const content = component.content as import('./types').ConfirmationCardContent;
                            const showActions = content.showActions ?? true;
                            const safeItem = content.item || {
                                id: `candidate-${component.id}`,
                                title: 'Candidate',
                                visualType: 'none' as const
                            };
                            renderedComponents.push(
                                <div
                                    key={component.id}
                                    {...getReviewBlockProps({
                                        kind: 'component',
                                        stepId: step.id,
                                        historyIndex,
                                        componentId: component.id,
                                    })}
                                    >
                                        <div className={reviewMode ? 'pointer-events-none' : undefined}>
                                            <DisplayCard
                                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                                item={safeItem as any}
                                                showActions={showActions}
                                                confirmLabel={content.confirmLabel}
                                                rejectLabel={content.rejectLabel}
                                                className={!reviewMode ? 'animate-fade-in' : undefined}
                                                disabled={reviewMode}
                                                onConfirm={!reviewMode && showActions
                                                    ? () =>
                                                        handleConfirmationAction(
                                                            step.id,
                                                            component.id,
                                                            'confirm',
                                                            content.confirmLabel || 'Confirm'
                                                        )
                                                    : undefined}
                                                onReject={!reviewMode && showActions
                                                    ? () =>
                                                        handleConfirmationAction(
                                                            step.id,
                                                            component.id,
                                                            'reject',
                                                            content.rejectLabel || 'Cancel'
                                                        )
                                                    : undefined}
                                                showConfirmHotspot={!reviewMode && showActions && isHotspotTurn && !!interactionHotspots.confirmationByComponent[component.id]?.confirm}
                                                showRejectHotspot={!reviewMode && showActions && isHotspotTurn && !!interactionHotspots.confirmationByComponent[component.id]?.reject}
                                            />
                                        </div>
                                    </div>
                                );
                            }
                        else if (component.type === 'checkboxGroup') {
                            const content = component.content as import('./types').CheckboxGroupContent;
                            const primaryLabel = getCheckboxGroupPrimaryLabel(content);
                            const secondaryLabel = getCheckboxGroupSecondaryLabel(content);
                            renderedComponents.push(
                                <div
                                    key={component.id}
                                    {...getReviewBlockProps({
                                        kind: 'component',
                                        stepId: step.id,
                                        historyIndex,
                                        componentId: component.id,
                                    })}
                                    >
                                        <div className={reviewMode ? 'pointer-events-none' : undefined}>
                                            <CheckboxGroup
                                                options={content.options}
                                                primaryLabel={primaryLabel}
                                                secondaryLabel={secondaryLabel}
                                                className={!reviewMode ? 'animate-fade-in' : undefined}
                                                onPrimaryAction={reviewMode
                                                    ? undefined
                                                    : (selectedIds) => {
                                                        const selectedLabels = (content.options || [])
                                                            .filter((option) => selectedIds.includes(option.id))
                                                            .map((option) => option.label);

                                                        handleCheckboxAction(
                                                            step.id,
                                                            component.id,
                                                            'primary',
                                                            selectedIds,
                                                            selectedLabels,
                                                            primaryLabel
                                                        );
                                                    }}
                                                onSecondaryAction={reviewMode
                                                    ? undefined
                                                    : (selectedIds) => {
                                                        const selectedLabels = (content.options || [])
                                                            .filter((option) => selectedIds.includes(option.id))
                                                            .map((option) => option.label);

                                                        handleCheckboxAction(
                                                            step.id,
                                                            component.id,
                                                            'secondary',
                                                            selectedIds,
                                                            selectedLabels,
                                                            secondaryLabel
                                                        );
                                                    }}
                                                // Checkbox rows are selectable state, but only CTA buttons branch the flow.
                                                showOptionHotspots={false}
                                                showPrimaryHotspot={!reviewMode && isHotspotTurn && !!interactionHotspots.checkboxByComponent[component.id]?.primary}
                                                showSecondaryHotspot={!reviewMode && isHotspotTurn && !!interactionHotspots.checkboxByComponent[component.id]?.secondary}
                                            />
                                        </div>
                                    </div>
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
                        <div
                            key={`${step.id}-${historyIndex}`}
                            className={withRevealClass('flex justify-end')}
                            {...getReviewBlockProps({
                                kind: 'turn',
                                stepId: step.id,
                                historyIndex,
                            })}
                        >
                            <Message
                                variant="user"
                                userText={getUserTurnDisplayText(userTurn)}
                            />
                        </div>
                    );
                }

                return null;
            })}

            {/* Thinking Indicator */}
            {!reviewMode && isThinking && (
                <div className={withRevealClass('flex justify-start')}>
                    <Message
                        variant="ai"
                        isThinking={true}
                    />
                </div>
            )}

            </div>

            {overlaySelection && shouldShowFullPathPanel && (
                <div className="mt-2 flex justify-center px-2">
                    <ContextInterceptorMessage
                        className="w-full max-w-[420px]"
                        question={overlaySelection.stepLabel}
                        variableName={overlaySelection.variableName}
                        branches={overlaySelection.branches}
                        onResolve={handleOverlayResolve}
                        showRuleSummary={reviewMode}
                    />
                </div>
            )}

            {shouldShowCompactPathPill && (
                <div className="mt-2 flex justify-center px-2">
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
                        className="flex w-full max-w-[420px] items-center gap-2 rounded-xl border border-shell-node-condition/35 bg-[rgb(var(--shell-node-condition-surface)/1)] px-3 py-2.5 text-left shadow-sm"
                    >
                        <Split size={13} className="shrink-0 text-shell-node-condition" />
                        <div className="min-w-0 flex flex-1 items-center gap-2.5 overflow-hidden">
                            <p
                                className="min-w-0 flex-1 truncate text-[13px] font-semibold text-shell-text"
                                title={overlaySelection.stepLabel}
                            >
                                {overlaySelection.stepLabel}
                            </p>
                            <span
                                className={
                                    overlaySelection.mode === 'interceptor'
                                        ? 'inline-flex max-w-[48%] shrink-0 items-center truncate rounded-full border border-shell-node-condition/35 bg-shell-bg px-2.5 py-1 text-[11px] font-semibold text-shell-node-condition'
                                        : 'inline-flex max-w-[48%] shrink-0 items-center truncate rounded-full border border-shell-border bg-shell-bg px-2.5 py-1 text-[11px] font-medium text-shell-muted-strong'
                                }
                                title={compactPathLabel}
                            >
                                {compactPathLabel}
                            </span>
                        </div>
                        <ShellIconButton
                            type="button"
                            size="sm"
                            variant="ghost"
                            aria-label="Edit path"
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsPathPanelExpanded(true);
                            }}
                            className="shrink-0 text-shell-muted hover:text-shell-node-condition"
                        >
                            <Pencil size={14} />
                        </ShellIconButton>
                    </div>
                </div>
            )}

            <div ref={messagesEndRef} className="h-4" />
        </div>
    );
};

// --- SIMULATED COMPONENT ---
const SimulatedStatusCard = ({
    content,
    reviewMode = false,
}: {
    content: import('./types').AIStatusContent;
    reviewMode?: boolean;
}) => {
    // Local state for simulation
    const [status, setStatus] = useState<'in-progress' | 'success'>(
        reviewMode ? 'success' : 'in-progress'
    );

    useEffect(() => {
        if (reviewMode) {
            setStatus('success');
            return;
        }

        // 1. Start with in-progress
        setStatus('in-progress');

        // 2. Wait 2 seconds (simulated API delay)
        const timer = setTimeout(() => {
            setStatus('success');
        }, 2000);

        return () => clearTimeout(timer);
    }, [reviewMode]);

    // 3. Render
    return (
        <div className={reviewMode ? undefined : 'animate-fade-in'}>
            <StatusCard
                status={status}
                title={status === 'in-progress' ? (content.loadingTitle || "Processing...") : content.successTitle}
            >
                {status === 'success' && content.successDescription}
            </StatusCard>
        </div>
    );
};
