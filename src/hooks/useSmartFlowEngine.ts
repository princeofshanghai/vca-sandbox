
import { useState, useEffect, useRef } from 'react';
import { Flow, Step, Branch, Connection, UserTurn, Condition } from '@/views/studio/types';
import { getConditionSelectionLabel } from '@/views/studio/conditionBranchLabels';

// Types for local history extension
export type HistoryStep = Step | {
    type: 'feedback',
    id: string,
    variant: 'neutral',
    message: string
} | {
    type: 'condition-selection',
    id: string,
    stepId: string,
    variableName: string,
    branches: Branch[],
    selectedBranchId: string,
    selectedLabel: string,
    selectedValue: string
} | {
    type: 'interceptor',
    id: string,
    variableName: string,
    branches: Branch[],
    stepId: string // To resume from
};

export interface ConditionPathSelection {
    stepId: string;
    variableName: string;
    branches: Branch[];
    selectedBranchId: string;
    selectedLabel: string;
    selectedValue: string;
}

interface UseSmartFlowEngineProps {
    flow: Flow;
    variables?: Record<string, string>;
    onVariableUpdate?: (key: string, value: string) => void;
    initialSnapshot?: SmartFlowEngineSnapshot | null;
    reviewMode?: boolean;
}

export interface SmartFlowEngineSnapshot {
    history: HistoryStep[];
    visibleComponentIds: string[];
    lastConditionSelection: ConditionPathSelection | null;
    pathSelections: ConditionPathSelection[];
}

export const useSmartFlowEngine = ({
    flow,
    variables,
    onVariableUpdate,
    initialSnapshot,
    reviewMode = false,
}: UseSmartFlowEngineProps) => {
    // State to track the conversation history (visited nodes)
    const [history, setHistory] = useState<HistoryStep[]>(() => initialSnapshot?.history || []);

    // Delivery Queue & Visibility
    const [deliveryQueue, setDeliveryQueue] = useState<HistoryStep[]>([]);
    const [visibleComponentIds, setVisibleComponentIds] = useState<Set<string>>(
        () => new Set(initialSnapshot?.visibleComponentIds || [])
    );
    const [isThinking, setIsThinking] = useState(false);
    const [isProcessingQueue, setIsProcessingQueue] = useState(false);

    // NEW: Text Streaming State
    const [streamingComponentId, setStreamingComponentId] = useState<string | null>(null);
    const [currentStreamingText, setCurrentStreamingText] = useState<string>('');
    const [lastConditionSelection, setLastConditionSelection] = useState<ConditionPathSelection | null>(
        initialSnapshot?.lastConditionSelection || null
    );
    const [pathSelections, setPathSelections] = useState<ConditionPathSelection[]>(
        () => initialSnapshot?.pathSelections || []
    );

    const simulateThinking = flow.settings?.simulateThinking;
    const shouldSimulateThinking = !reviewMode && simulateThinking;
    const variablesString = JSON.stringify(variables);
    const historyRef = useRef(history); // Ref to access latest history in callbacks
    const pathSelectionsRef = useRef(pathSelections);
    const currentRunId = useRef(0); // Track active delivery run
    const hasAttemptedReviewSeedRef = useRef(false);
    const traverseRef = useRef<
        ((currentNodeId: string, sourceHandle?: string, simulatedInput?: string) => void) | null
    >(null);

    // Track streaming text content for truncation
    const currentStreamingTextRef = useRef<string>('');
    const streamingComponentIdRef = useRef<string | null>(null);
    const stopRequestedRef = useRef(false);

    useEffect(() => {
        historyRef.current = history;
    }, [history]);

    useEffect(() => {
        pathSelectionsRef.current = pathSelections;
    }, [pathSelections]);

    useEffect(() => {
        streamingComponentIdRef.current = streamingComponentId;
    }, [streamingComponentId]);

    // Keep ref in sync for instant access during stop/tick
    useEffect(() => {
        currentStreamingTextRef.current = currentStreamingText;
    }, [currentStreamingText]);

    const handleStop = () => {
        stopRequestedRef.current = true;

        // 1. Cancel Queue & Thinking
        setDeliveryQueue([]);
        setIsThinking(false);
        setIsProcessingQueue(false);

        // 2. Handle Streaming Truncation
        const activeId = streamingComponentIdRef.current;
        if (activeId) {
            setHistory(prev => {
                // Find the step containing the streaming component
                return prev.map(step => {
                    if (step.type === 'turn') {
                        // Check if this step has the streaming component
                        const hasComponent = step.components.some(c => c.id === activeId);
                        if (hasComponent) {
                            // Deep clone and update
                            const newComponents = step.components.map(c => {
                                if (c.id === activeId) {
                                    // Truncate content
                                    if (c.type === 'message') {
                                        return { ...c, content: { ...c.content, text: currentStreamingTextRef.current } };
                                    }
                                    if (c.type === 'infoMessage') {
                                        return { ...c, content: { ...c.content, body: currentStreamingTextRef.current } };
                                    }
                                }
                                return c;
                            });
                            return { ...step, components: newComponents };
                        }
                    }
                    return step;
                });
            });
            setStreamingComponentId(null);
            setCurrentStreamingText('');
        }

        // 3. Add Feedback Step
        const feedbackStep: HistoryStep = {
            type: 'feedback',
            id: `feedback-${Date.now()}`,
            variant: 'neutral',
            message: 'Response stopped'
        };
        setHistory(prev => [...prev, feedbackStep]);

        // 4. Force new run ID to invalidate any pending promises
        currentRunId.current = Date.now();
    };


    // Initialize history with the start node
    const isInitializedRef = useRef(Boolean(initialSnapshot?.history?.length));




    // --- DELIVERY ENGINE (STREAMING) ---
    useEffect(() => {
        if (!shouldSimulateThinking || deliveryQueue.length === 0 || isProcessingQueue) return;

        const deliverNext = async () => {
            const runId = currentRunId.current;
            setIsProcessingQueue(true);
            const nextStep = deliveryQueue[0];
            setDeliveryQueue(prev => prev.slice(1));

            // Deliver based on type
            if (nextStep.type === 'turn') {
                // 1. Initial Thinking (The "Digest" pause)
                setIsThinking(true);
                await new Promise((r) => setTimeout(r as TimerHandler, 1000));

                if (currentRunId.current !== runId) return; // Abort if reset
                stopRequestedRef.current = false; // Reset stop flag before starting components
                setIsThinking(false);

                // 2. Add to history
                setHistory(prev => [...prev, nextStep as Step]);

                const components = nextStep.components;

                // 3. Reveal/Stream components one-by-one in order
                for (let i = 0; i < components.length; i++) {
                    // Check before component processing
                    if (currentRunId.current !== runId) return;

                    const component = components[i];

                    // A. Setup Streaming Target
                    const canStream = (component.type === 'message' || component.type === 'infoMessage');
                    let textToStream = '';

                    if (component.type === 'message') {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        textToStream = (component.content as any).text || '';
                    } else if (component.type === 'infoMessage') {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        textToStream = (component.content as any).body || '';
                    }

                    if (canStream && textToStream) {
                        // START STREAMING
                        setStreamingComponentId(component.id);
                        setCurrentStreamingText(''); // Start empty

                        setVisibleComponentIds(prev => new Set([...prev, component.id]));

                        // Tick Loop
                        const chars = textToStream.split('');
                        let currentText = '';

                        // Using a simple async loop for "typing"
                        for (let charIndex = 0; charIndex < chars.length; charIndex++) {
                            if (currentRunId.current !== runId) return;
                            if (stopRequestedRef.current) break;

                            currentText += chars[charIndex];

                            setCurrentStreamingText(currentText);

                            // Updated Typing Speed: Ultra-fast (2ms - 6ms)
                            const delay = Math.random() * 4 + 2;
                            await new Promise(r => setTimeout(r, delay));
                        }

                        setStreamingComponentId(null);
                        setCurrentStreamingText('');

                    } else {
                        // NON-STREAMING (Cards, Prompts, etc.)
                        setVisibleComponentIds(prev => new Set([...prev, component.id]));

                        // Keep status cards on screen long enough to reach success before continuing.
                        const pause = component.type === 'statusCard'
                            ? 2000
                            : (component.type === 'prompt' ? 100 : 400);
                        await new Promise((r) => setTimeout(r as TimerHandler, pause));
                    }

                    // Pause between components (The "Breath" pause)
                    if (i < components.length - 1) {
                        const nextComponent = components[i + 1];
                        const isSequenceOfPrompts = component.type === 'prompt' && nextComponent.type === 'prompt';

                        // Don't "Think" between prompts, just flow.
                        if (!isSequenceOfPrompts) {
                            setIsThinking(true);
                            await new Promise((r) => setTimeout(r as TimerHandler, 400));
                            if (currentRunId.current !== runId) return;
                            setIsThinking(false);
                        }
                    }
                }
            } else {
                // User Turn - Instant
                setHistory(prev => [...prev, nextStep]);
            }

            if (currentRunId.current === runId) {
                setIsProcessingQueue(false);
            }
        };

        deliverNext();
    }, [deliveryQueue, isProcessingQueue, shouldSimulateThinking]);

    // --- SMART MATCHING LOGIC ---
    const getLevenshteinDistance = (a: string, b: string) => {
        if (a.length === 0) return b.length;
        if (b.length === 0) return a.length;

        const matrix = [];

        for (let i = 0; i <= b.length; i++) {
            matrix[i] = [i];
        }

        for (let j = 0; j <= a.length; j++) {
            matrix[0][j] = j;
        }

        for (let i = 1; i <= b.length; i++) {
            for (let j = 1; j <= a.length; j++) {
                if (b.charAt(i - 1) == a.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
                    );
                }
            }
        }

        return matrix[b.length][a.length];
    };

    const STOP_WORDS = new Set([
        'the', 'a', 'an', 'to', 'for', 'on', 'in', 'at', 'of', 'and', 'or',
        'is', 'are', 'am', 'be', 'do', 'does', 'did', 'please', 'hi', 'hello', 'hey'
    ]);

    const normalizeForMatch = (value: string) =>
        value
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();

    const tokenizeForMatch = (value: string) =>
        normalizeForMatch(value)
            .split(' ')
            .filter((token) => token.length > 1 && !STOP_WORDS.has(token));

    const parseTriggerExamples = (triggerValue?: string) =>
        (triggerValue || '')
            .split(/\n+|[;|]/g)
            .map((line) => line.replace(/^\s*[-*•]\s*/, '').trim())
            .filter(Boolean);

    const getPhraseMatchScore = (
        normalizedInput: string,
        inputTokens: string[],
        phrase: string
    ) => {
        const normalizedPhrase = normalizeForMatch(phrase);
        if (!normalizedPhrase) return 0;

        if (normalizedInput === normalizedPhrase) return 1;

        const phraseTokens = tokenizeForMatch(phrase);
        if (phraseTokens.length === 0) return 0;

        // Reward strong substring matches when users type short-but-meaningful phrases.
        if (
            normalizedInput.length >= 4 &&
            (normalizedInput.includes(normalizedPhrase) || normalizedPhrase.includes(normalizedInput))
        ) {
            return 0.92;
        }

        let tokenScore = 0;
        let hardMatches = 0;

        for (const targetToken of phraseTokens) {
            let bestTokenScore = 0;

            for (const inputToken of inputTokens) {
                if (inputToken === targetToken) {
                    bestTokenScore = Math.max(bestTokenScore, 1);
                    continue;
                }

                if (inputToken.includes(targetToken) || targetToken.includes(inputToken)) {
                    bestTokenScore = Math.max(bestTokenScore, 0.78);
                    continue;
                }

                const distance = getLevenshteinDistance(inputToken, targetToken);
                if (targetToken.length >= 7 && distance <= 2) {
                    bestTokenScore = Math.max(bestTokenScore, 0.6);
                    continue;
                }
                if (targetToken.length >= 4 && distance <= 1) {
                    bestTokenScore = Math.max(bestTokenScore, 0.68);
                }
            }

            tokenScore += bestTokenScore;
            if (bestTokenScore >= 0.78) {
                hardMatches++;
            }
        }

        const coverage = tokenScore / phraseTokens.length;
        const precision = inputTokens.length > 0 ? Math.min(1, hardMatches / inputTokens.length) : 0;

        return coverage * 0.8 + precision * 0.2;
    };

    const findBestMatch = (input: string, possibleNodeIds: string[]): string | undefined => {
        const normalizedInput = normalizeForMatch(input);
        const inputTokens = tokenizeForMatch(input);
        if (!normalizedInput) return undefined;

        let bestMatchId: string | undefined;
        let bestScore = 0;

        possibleNodeIds.forEach(nodeId => {
            const node = flow.steps?.find(s => s.id === nodeId) as UserTurn;
            if (!node || node.type !== 'user-turn') return;

            const triggerExamples = parseTriggerExamples(node.triggerValue);
            const candidatePhrases = triggerExamples.length > 0
                ? triggerExamples
                : (node.triggerValue ? [node.triggerValue] : []);

            let score = 0;

            for (const phrase of candidatePhrases) {
                score = Math.max(score, getPhraseMatchScore(normalizedInput, inputTokens, phrase));
            }

            // Label helps as a fallback signal but shouldn't dominate examples.
            if (node.label) {
                const labelScore = getPhraseMatchScore(normalizedInput, inputTokens, node.label) * 0.55;
                score = Math.max(score, labelScore);
            }

            if (score > bestScore) {
                bestScore = score;
                bestMatchId = nodeId;
            }
        });

        const threshold = inputTokens.length <= 2 ? 0.52 : 0.42;
        return bestScore >= threshold ? bestMatchId : undefined;
    };


    // Helper for Condition Logic
    const getConditionBranch = (branches: Branch[], vars: Record<string, string>, input?: string) => {
        let selectedBranchId = null;

        // 1. Check for specific matches
        for (const branch of branches) {
            if (branch.isDefault) continue;

            if (branch.logic && branch.logic.variable) {
                const { variable, value } = branch.logic;

                let simulatedVal = vars[variable];

                if (simulatedVal === undefined && input !== undefined) {
                    simulatedVal = input;
                }

                if (simulatedVal !== undefined) {
                    simulatedVal = String(simulatedVal).trim().toLowerCase();
                    const targetVal = String(value).trim().toLowerCase();
                    if (simulatedVal === targetVal) {
                        selectedBranchId = branch.id;
                        break;
                    }
                }
            }
        }

        // 2. Fallback
        if (!selectedBranchId) {
            const defaultBranch = branches.find(b => b.isDefault);
            selectedBranchId = defaultBranch ? defaultBranch.id : branches[0]?.id;
        }

        return selectedBranchId;
    };

    const getPreferredReviewBranchId = (branches: Branch[]) =>
        branches.find((branch) => !branch.isDefault)?.id ||
        branches.find((branch) => branch.isDefault)?.id ||
        branches[0]?.id ||
        '';

    const getMergedSelectionVariables = (
        selections: ConditionPathSelection[],
        extraSelection?: ConditionPathSelection
    ) => {
        const merged = { ...(variables || {}) };
        const selectionsToApply = extraSelection ? mergePathSelections(selections, extraSelection) : selections;

        selectionsToApply.forEach((selection) => {
            if (selection.selectedValue === '__USE_DEFAULT__') return;
            merged[selection.variableName] = selection.selectedValue;
        });

        return merged;
    };

    const getConditionSelectionMeta = (
        stepId: string,
        variableName: string,
        value: string,
        branches: Branch[],
    ): ConditionPathSelection => {
        const selectedBranchId = value === '__USE_DEFAULT__'
            ? (branches.find((branch) => branch.isDefault)?.id || branches[0]?.id || '')
            : (getConditionBranch(branches, { ...(variables || {}), [variableName]: value }) || '');

        const selectedBranch = branches.find((branch) => branch.id === selectedBranchId);
        const selectedLabel = selectedBranch
            ? getConditionSelectionLabel(selectedBranch, variableName)
            : 'Path';

        return {
            stepId,
            variableName,
            branches,
            selectedBranchId,
            selectedLabel,
            selectedValue: value,
        };
    };

    const getConditionVariableName = (branches: Branch[], stepId: string) =>
        branches.find((branch) => branch.logic?.variable)?.logic?.variable || `condition:${stepId}`;

    const getConditionSelectionMetaForBranch = ({
        stepId,
        branches,
        selectedBranchId,
        selectedValue,
        variableName,
    }: {
        stepId: string;
        branches: Branch[];
        selectedBranchId: string;
        selectedValue: string;
        variableName?: string;
    }): ConditionPathSelection => {
        const resolvedVariableName = variableName || getConditionVariableName(branches, stepId);
        const selectedBranch = branches.find((branch) => branch.id === selectedBranchId);
        const selectedLabel = selectedBranch
            ? getConditionSelectionLabel(selectedBranch, resolvedVariableName)
            : 'Path';

        return {
            stepId,
            variableName: resolvedVariableName,
            branches,
            selectedBranchId,
            selectedLabel,
            selectedValue,
        };
    };

    const mergePathSelections = (
        currentSelections: ConditionPathSelection[],
        nextSelection: ConditionPathSelection
    ) => {
        const existingIndex = currentSelections.findIndex(
            (selection) => selection.stepId === nextSelection.stepId
        );

        if (existingIndex >= 0) {
            return [...currentSelections.slice(0, existingIndex), nextSelection];
        }

        return [...currentSelections, nextSelection];
    };

    const buildConditionSelectionStep = (
        selection: ConditionPathSelection
    ): Extract<HistoryStep, { type: 'condition-selection' }> => ({
        type: 'condition-selection',
        id: `condition-selection-${selection.stepId}-${Date.now()}`,
        stepId: selection.stepId,
        variableName: selection.variableName,
        branches: selection.branches,
        selectedBranchId: selection.selectedBranchId,
        selectedLabel: selection.selectedLabel,
        selectedValue: selection.selectedValue,
    });

    const buildVisibleComponentSet = (steps: HistoryStep[]) => {
        const next = new Set<string>();
        steps.forEach((step) => {
            if (step.type === 'turn') {
                step.components.forEach((component) => next.add(component.id));
            }
        });
        return next;
    };

    const applyConditionSelection = ({
        stepId,
        variableName,
        value,
        branches,
        interceptorStepId,
        replayFromCondition,
    }: {
        stepId: string;
        variableName: string;
        value: string;
        branches: Branch[];
        interceptorStepId?: string;
        replayFromCondition?: boolean;
    }) => {
        const selectionMeta = getConditionSelectionMeta(stepId, variableName, value, branches);
        applyResolvedConditionSelection({
            stepId,
            selectionMeta,
            interceptorStepId,
            replayFromCondition,
        });
    };

    const applyResolvedConditionSelection = ({
        stepId,
        selectionMeta,
        interceptorStepId,
        replayFromCondition,
    }: {
        stepId: string;
        selectionMeta: ConditionPathSelection;
        interceptorStepId?: string;
        replayFromCondition?: boolean;
    }) => {
        const selectionStep = buildConditionSelectionStep(selectionMeta);
        const nextSelections = mergePathSelections(pathSelectionsRef.current, selectionMeta);

        setLastConditionSelection(selectionMeta);
        pathSelectionsRef.current = nextSelections;
        setPathSelections(nextSelections);

        if (selectionMeta.selectedValue !== '__USE_DEFAULT__') {
            onVariableUpdate?.(selectionMeta.variableName, selectionMeta.selectedValue);
        }

        if (replayFromCondition) {
            stopRequestedRef.current = true;
            currentRunId.current = Date.now();
            setDeliveryQueue([]);
            setIsThinking(false);
            setIsProcessingQueue(false);
            setStreamingComponentId(null);
            setCurrentStreamingText('');

            const baselineHistory = interceptorStepId
                ? historyRef.current.filter((step) => step.id !== interceptorStepId)
                : historyRef.current;

            let cutoffIndex = -1;
            for (let i = baselineHistory.length - 1; i >= 0; i--) {
                const historyStep = baselineHistory[i];
                if (
                    historyStep.type === 'condition-selection' &&
                    historyStep.stepId === stepId
                ) {
                    cutoffIndex = i;
                    break;
                }
            }

            const truncatedHistory = cutoffIndex >= 0
                ? baselineHistory.slice(0, cutoffIndex)
                : baselineHistory;

            const nextHistory = [...truncatedHistory, selectionStep];

            setHistory(nextHistory);
            setVisibleComponentIds(buildVisibleComponentSet(nextHistory));
        } else if (interceptorStepId) {
            setHistory((prev) => [
                ...prev.filter((step) => step.id !== interceptorStepId),
                selectionStep,
            ]);
        } else {
            setHistory((prev) => [...prev, selectionStep]);
        }

        setTimeout(() => {
            traverse(stepId, selectionMeta.selectedBranchId || undefined);
        }, 50);
    };

    const applyConditionBranchSelection = ({
        stepId,
        branchId,
        branches,
        interceptorStepId,
        replayFromCondition,
    }: {
        stepId: string;
        branchId: string;
        branches: Branch[];
        interceptorStepId?: string;
        replayFromCondition?: boolean;
    }) => {
        const selectedBranch = branches.find((branch) => branch.id === branchId);
        if (!selectedBranch) return;

        const selectedValue = selectedBranch.isDefault
            ? '__USE_DEFAULT__'
            : String(selectedBranch.logic?.value ?? '');
        const resolvedVariableName =
            selectedBranch.logic?.variable ||
            getConditionVariableName(branches, stepId);
        const selectionMeta = getConditionSelectionMetaForBranch({
            stepId,
            branches,
            selectedBranchId: branchId,
            selectedValue,
            variableName: resolvedVariableName,
        });

        applyResolvedConditionSelection({
            stepId,
            selectionMeta,
            interceptorStepId,
            replayFromCondition,
        });
    };


    // Helper to find the next node based on a source handle
    const traverse = (currentNodeId: string, sourceHandle?: string, simulatedInput?: string) => {
        let currentId = currentNodeId;
        let currentHandle = sourceHandle;
        const inputForBinding = simulatedInput; // Persist input for logic evaluation
        const nodesToAdd: HistoryStep[] = [];

        // Max iterations to prevent infinite loops
        for (let i = 0; i < 20; i++) {
            let connection: Connection | undefined = undefined;

            if (simulatedInput && !sourceHandle) {
                // Special Case: "Free Intent" Traversal
                const outgoingConnections = flow.connections?.filter(c => c.source === currentId) || [];
                const targetNodeIds = outgoingConnections.map(c => c.target);

                // Run the matcher
                const matchedNodeId = findBestMatch(simulatedInput, targetNodeIds);

                if (matchedNodeId) {
                    connection = outgoingConnections.find(c => c.target === matchedNodeId);
                } else {
                    break;
                }
            } else {
                // Standard Deterministic Traversal
                connection = flow.connections?.find(c =>
                    c.source === currentId &&
                    (currentHandle ? c.sourceHandle === currentHandle : true)
                );
            }

            if (!connection) break;

            const nextNode = flow.steps?.find(s => s.id === connection.target);
            if (!nextNode) break;

            // Don't duplicate "User Bubble" if simulation already showed it
            const shouldHide = nextNode.type === 'user-turn' && !!inputForBinding;

            if (!shouldHide) {
                nodesToAdd.push(nextNode);
            }

            currentId = nextNode.id;
            currentHandle = undefined;
            simulatedInput = undefined;

            // Determine if we should continue traversing
            if (nextNode.type === 'turn') {
                // Auto-advance unless the next step waits for user input
                const outgoing = flow.connections?.find(c => c.source === nextNode.id);
                if (outgoing) {
                    const nextStep = flow.steps?.find(s => s.id === outgoing.target);
                    if (nextStep && nextStep.type === 'user-turn' && !reviewMode) {
                        break;
                    }
                } else {
                    break;
                }
            } else if (nextNode.type === 'user-turn') {
                continue;
            } else if (nextNode.type === 'condition') {
                // Evaluate Condition
                const branches = (nextNode as Condition).branches || [];
                const effectiveVariables = getMergedSelectionVariables(pathSelectionsRef.current);

                // CHECK: Do any branches reference a variable that's undefined?
                const undefinedVariable = branches.find(b => {
                    if (b.isDefault) return false;
                    if (b.logic?.variable && effectiveVariables[b.logic.variable] === undefined) {
                        return true;
                    }
                    return false;
                });

                if (undefinedVariable?.logic?.variable) {
                    if (reviewMode) {
                        const selectedBranchId = getPreferredReviewBranchId(branches);
                        const selectedValue =
                            branches.find((branch) => branch.id === selectedBranchId)?.logic?.value ??
                            '__USE_DEFAULT__';
                        const selectionMeta = getConditionSelectionMetaForBranch({
                            stepId: nextNode.id,
                            branches,
                            selectedBranchId,
                            selectedValue,
                            variableName: getConditionVariableName(branches, nextNode.id),
                        });
                        const nextSelections = mergePathSelections(pathSelectionsRef.current, selectionMeta);

                        setLastConditionSelection(selectionMeta);
                        pathSelectionsRef.current = nextSelections;
                        setPathSelections(nextSelections);
                        nodesToAdd.push(buildConditionSelectionStep(selectionMeta));
                        currentHandle = selectedBranchId || undefined;
                        continue;
                    }

                    // PAUSE: Trigger Interceptor
                    const interceptorStep: HistoryStep = {
                        id: `interceptor-${nextNode.id}`,
                        type: 'interceptor',
                        variableName: undefinedVariable.logic.variable,
                        branches: branches,
                        stepId: nextNode.id,
                    };
                    nodesToAdd.push(interceptorStep);
                    break;
                }

                // No undefined variables, proceed normally
                const selectedBranchId = reviewMode
                    ? getConditionBranch(branches, effectiveVariables, inputForBinding) || getPreferredReviewBranchId(branches)
                    : getConditionBranch(branches, effectiveVariables, inputForBinding);
                const selectedValue =
                    branches.find((branch) => branch.id === selectedBranchId)?.logic?.value ??
                    '__USE_DEFAULT__';
                const selectionMeta = getConditionSelectionMetaForBranch({
                    stepId: nextNode.id,
                    branches,
                    selectedBranchId: selectedBranchId || '',
                    selectedValue,
                });

                setLastConditionSelection(selectionMeta);
                const nextSelections = mergePathSelections(pathSelectionsRef.current, selectionMeta);
                pathSelectionsRef.current = nextSelections;
                setPathSelections(nextSelections);
                nodesToAdd.push(buildConditionSelectionStep(selectionMeta));

                currentHandle = selectedBranchId || undefined;
            }
        }

        if (nodesToAdd.length > 0) {
            if (shouldSimulateThinking) {
                setDeliveryQueue(prev => [...prev, ...nodesToAdd]);
            } else {
                setHistory(prev => [...prev, ...nodesToAdd]);
                // Ensure visibility for instant delivery
                setVisibleComponentIds(prev => {
                    const next = new Set(prev);
                    nodesToAdd.forEach(step => {
                        if (step.type === 'turn') step.components.forEach(c => next.add(c.id));
                    });
                    return next;
                });
            }
        }
    };

    traverseRef.current = traverse;



    // Initialize history with the flow using traversal (Moved here to access traverse)
    useEffect(() => {
        if (!isInitializedRef.current) {
            // First run logic
            if (!flow.steps || flow.steps.length === 0) return;

            isInitializedRef.current = true;
            // Start a new run
            currentRunId.current = Date.now();
            setIsProcessingQueue(false);

            // 1. Try starting from Start Node
            const startNode = flow.steps.find(s => s.type === 'start');
            if (startNode) {
                traverse(startNode.id);
                return;
            }

            // 2. Fallback: Find first turn manually
            const firstTurn = flow.steps.find(s =>
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                s.type === 'turn' && (s as any).phase === 'welcome'
            ) || flow.steps[0];

            if (firstTurn) {
                // Manually add the first turn step
                if (shouldSimulateThinking) {
                    setDeliveryQueue([firstTurn]);
                } else {
                    setHistory([firstTurn]);
                    // Add visibility
                    const allIds = new Set<string>();
                    if (firstTurn.type === 'turn') {
                        firstTurn.components.forEach(c => allIds.add(c.id));
                    }
                    setVisibleComponentIds(allIds);
                }

                // Then traverse from it to catch subsequent nodes
                traverse(firstTurn.id);
            }
        } else {
            // UPDATE LOGIC: Patch existing history with new flow data
            setHistory(prevHistory => {
                const updatedHistory = prevHistory.map(step => {
                    if (step.type === 'feedback') return step;
                    if (step.type === 'condition-selection') return step;
                    if (step.type === 'user-turn') {
                        const realNode = flow.steps?.find(s => s.id === step.id);
                        return realNode ? realNode as Step : step;
                    }
                    const updatedNode = flow.steps?.find(s => s.id === step.id);
                    return updatedNode ? (updatedNode as Step) : null;
                }).filter(Boolean) as HistoryStep[];

                return updatedHistory;
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [flow.steps, flow.connections, reviewMode, shouldSimulateThinking, variablesString]);

    useEffect(() => {
        if (!reviewMode) {
            hasAttemptedReviewSeedRef.current = false;
            return;
        }

        if (hasAttemptedReviewSeedRef.current) return;
        if (history.length === 0) return;

        const hasPlayedRun = history.some((step) => step.type === 'user-turn');
        const hasPathChoices = history.some(
            (step) => step.type === 'condition-selection' || step.type === 'interceptor'
        );

        if (hasPlayedRun || hasPathChoices) {
            hasAttemptedReviewSeedRef.current = true;
            return;
        }

        const lastTurn = [...history]
            .reverse()
            .find((step): step is Step => step.type === 'turn' || step.type === 'start');

        if (!lastTurn) {
            hasAttemptedReviewSeedRef.current = true;
            return;
        }

        const outgoingConnections = (flow.connections || []).filter(
            (connection) => connection.source === lastTurn.id
        );
        const nextSteps = outgoingConnections
            .map((connection) => flow.steps?.find((step) => step.id === connection.target))
            .filter(Boolean);
        const shouldSeedReviewPath = nextSteps.some(
            (step) => step?.type === 'user-turn' || step?.type === 'condition'
        );

        hasAttemptedReviewSeedRef.current = true;

        if (!shouldSeedReviewPath) return;

        traverseRef.current?.(lastTurn.id);
    }, [flow.connections, flow.steps, history, reviewMode]);


    const handlePromptClick = (stepId: string, promptComponentId: string, text?: string) => {
        const handleId = `handle-${promptComponentId}`;

        // 1. Visual: Add User Bubble
        if (text) {
            const mockUserStep: UserTurn = {
                id: `temp-${Date.now()}`,
                type: 'user-turn',
                label: text,
                inputType: 'text'
            };
            setHistory(prev => [...prev, mockUserStep]);
        }

        // 2. Traversal
        traverse(stepId, handleId, text);
    };

    const handleSelectionItemClick = (stepId: string, componentId: string, itemId: string, title?: string) => {
        const handleId = `handle-${componentId}-${itemId}`;

        // Mirror prompt-click UX: show selected choice as the user bubble.
        if (title) {
            const mockUserStep: UserTurn = {
                id: `temp-${Date.now()}`,
                type: 'user-turn',
                label: title,
                inputType: 'button'
            };
            setHistory(prev => [...prev, mockUserStep]);
        }

        traverse(stepId, handleId, title);
    };

    const handleConfirmationAction = (
        stepId: string,
        componentId: string,
        action: 'confirm' | 'reject',
        label?: string
    ) => {
        const handleId = `handle-${componentId}-${action}`;

        if (label) {
            const mockUserStep: UserTurn = {
                id: `temp-${Date.now()}`,
                type: 'user-turn',
                label,
                inputType: 'button'
            };
            setHistory(prev => [...prev, mockUserStep]);
        }

        traverse(stepId, handleId, label);
    };

    const handleSend = (input: string) => {
        if (!input) return;

        // 1. Add User Bubble immediately
        const mockUserStep: UserTurn = {
            id: `temp-${Date.now()}`,
            type: 'user-turn',
            label: input,
            inputType: 'text'
        };
        setHistory(prev => [...prev, mockUserStep]);

        // 2. Trigger Traversal from the LAST ACTUAL NODE in history
        const lastRealStep = historyRef.current.slice().reverse().find(s => s.type === 'turn' || s.type === 'start');

        if (lastRealStep) {
            const delay = shouldSimulateThinking ? 500 : 0;
            setTimeout(() => {
                traverse(lastRealStep.id, undefined, input);
            }, delay);
        }
    };

    const handleCheckboxAction = (
        stepId: string,
        componentId: string,
        action: 'primary' | 'secondary',
        selectedIds: string[],
        selectedLabels: string[],
        actionLabel?: string
    ) => {
        const handleId = action === 'secondary'
            ? `handle-${componentId}-secondary`
            : `handle-${componentId}`;
        const trimmedLabels = selectedLabels.map((label) => label.trim()).filter(Boolean);

        let userLabel = actionLabel || (action === 'secondary' ? 'Cancel' : 'Save');
        if (action === 'primary' && trimmedLabels.length > 0) {
            const previewLabels = trimmedLabels.slice(0, 2).join(', ');
            const remaining = trimmedLabels.length - 2;
            userLabel = remaining > 0
                ? `${previewLabels} +${remaining} more`
                : previewLabels;
        } else if (action === 'primary' && selectedIds.length > 0) {
            userLabel = `${selectedIds.length} selected`;
        }

        const mockUserStep: UserTurn = {
            id: `temp-${Date.now()}`,
            type: 'user-turn',
            label: userLabel,
            inputType: 'button'
        };
        setHistory(prev => [...prev, mockUserStep]);

        const traversalInput = action === 'primary'
            ? trimmedLabels.join(', ')
            : userLabel;

        traverse(stepId, handleId, traversalInput);
    };

    const resolveInterceptor = (stepId: string, variableName: string, value: string, branches: Branch[], interceptorStepId: string) => {
        applyConditionSelection({
            stepId,
            variableName,
            value,
            branches,
            interceptorStepId,
            replayFromCondition: false,
        });
    };

    const resolveInterceptorBranch = (stepId: string, branchId: string, branches: Branch[], interceptorStepId: string) => {
        applyConditionBranchSelection({
            stepId,
            branchId,
            branches,
            interceptorStepId,
            replayFromCondition: false,
        });
    };

    const switchConditionPath = (stepId: string, variableName: string, value: string, branches: Branch[]) => {
        applyConditionSelection({
            stepId,
            variableName,
            value,
            branches,
            replayFromCondition: true,
        });
    };

    const switchConditionPathBranch = (stepId: string, branchId: string, branches: Branch[]) => {
        applyConditionBranchSelection({
            stepId,
            branchId,
            branches,
            replayFromCondition: true,
        });
    };

    return {
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
        setHistory
    };
};
