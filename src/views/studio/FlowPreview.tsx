// ... (imports)
import { useState, useEffect, useRef } from 'react';
import { Flow } from './types';
import { Container } from '@/components/vca-components/container/Container';
import { Message } from '@/components/vca-components/messages';
import { InfoMessage } from '@/components/vca-components/info-message/InfoMessage';
import { StatusCard } from '@/components/vca-components/status-card/StatusCard';
import { PromptGroup } from '@/components/vca-components/prompt-group/PromptGroup';
import { PhoneFrame } from '@/components/component-library/PhoneFrame';
import { MarkdownRenderer } from '@/components/vca-components/markdown-renderer/Markdown';
import { InlineFeedback } from '@/components/vca-components/inline-feedback';
import { SelectionList } from '@/components/vca-components/selection-list/SelectionList';
import { CheckboxGroup } from '@/components/vca-components/checkbox-group/CheckboxGroup';
import { ContextInterceptorMessage } from './components/ContextInterceptorMessage';



interface FlowPreviewProps {
    flow: Flow;
    isPremium: boolean;
    isMobile: boolean;
    variables: Record<string, string>;
    onVariableUpdate?: (key: string, value: string) => void;
    desktopPosition?: 'center' | 'bottom-right';
}

export const FlowPreview = ({
    flow,
    isPremium,
    isMobile,
    variables,
    onVariableUpdate,
    desktopPosition = 'center'
}: FlowPreviewProps) => {
    // Shared composer state
    const [composerValue, setComposerValue] = useState('');
    const [handleSendRef, setHandleSendRef] = useState<(() => void) | undefined>(undefined);

    // NEW: Lifted status state for Composer
    const [statusData, setStatusData] = useState<{
        status: 'default' | 'active' | 'stop',
        onStop?: () => void
    }>({ status: 'default' });

    return (
        <div className="h-full w-full flex flex-col relative bg-transparent pointer-events-none">

            <div className={`flex-1 flex flex-col overflow-y-auto thin-scrollbar ${isMobile || desktopPosition === 'center' ? 'items-center justify-center p-4' : 'items-end justify-end p-6'}`}>
                {isMobile ? (
                    <div className="relative w-[334px] h-[726px] shrink-0 flex items-center justify-center mt-8 pointer-events-auto">
                        {/* Option B: Unscaled button above scaled phone */}

                        <div className="scale-[0.85] origin-right">
                            <PhoneFrame showStatusBar={true} dimBackground={false}>
                                <Container
                                    headerTitle="Help"
                                    className="bg-white h-[772px] w-[393px]"
                                    viewport="mobile"
                                    showHeaderPremiumIcon={isPremium}
                                    showPremiumBorder={isPremium}
                                    composerValue={composerValue}
                                    onComposerChange={setComposerValue}
                                    onComposerSend={() => handleSendRef?.()}
                                    // STOP LOGIC MAPPING
                                    composerStatus={statusData.status}
                                    onStop={statusData.onStop}
                                >
                                    <PreviewContent
                                        flow={flow}
                                        variables={variables}
                                        onRegisterSend={(fn) => setHandleSendRef(() => fn)}
                                        onComposerReset={() => setComposerValue('')}
                                        composerValue={composerValue}
                                        onStatusChange={(status, onStop) => setStatusData({ status, onStop })}
                                    />
                                </Container>
                            </PhoneFrame>
                        </div>
                    </div>
                ) : (
                    <div className="relative pointer-events-auto">

                        <Container
                            headerTitle="Help"
                            className="shadow-xl bg-white"
                            viewport="desktop"
                            showHeaderPremiumIcon={isPremium}
                            showPremiumBorder={isPremium}
                            composerValue={composerValue}
                            onComposerChange={setComposerValue}
                            onComposerSend={() => handleSendRef?.()}
                            // STOP LOGIC MAPPING
                            composerStatus={statusData.status}
                            onStop={statusData.onStop}
                        >
                            <PreviewContent
                                flow={flow}
                                variables={variables}
                                onVariableUpdate={onVariableUpdate}
                                onRegisterSend={(fn) => setHandleSendRef(() => fn)}
                                onComposerReset={() => setComposerValue('')}
                                composerValue={composerValue}
                                onStatusChange={(status, onStop) => setStatusData({ status, onStop })}
                            />
                        </Container>
                    </div>
                )}
            </div>
        </div>
    );
};

// Types for local history extension
type HistoryStep = import('./types').Step | {
    type: 'feedback',
    id: string,
    variant: 'neutral',
    message: string
} | {
    type: 'interceptor',
    id: string,
    variableName: string,
    branches: import('./types').Branch[],
    stepId: string // To resume from
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
    onStatusChange
}: {
    flow: Flow,
    variables?: Record<string, string>,
    onVariableUpdate?: (key: string, value: string) => void,
    onRegisterSend: (fn: () => void) => void,
    onComposerReset: () => void,
    composerValue: string,
    onStatusChange?: (status: 'default' | 'active' | 'stop', onStop?: () => void) => void
}) => {
    // State to track the conversation history (visited nodes)
    const [history, setHistory] = useState<HistoryStep[]>([]);

    // NEW: Delivery Queue & Visibility
    const [deliveryQueue, setDeliveryQueue] = useState<HistoryStep[]>([]);
    const [visibleComponentIds, setVisibleComponentIds] = useState<Set<string>>(new Set());
    const [isThinking, setIsThinking] = useState(false);
    const [isProcessingQueue, setIsProcessingQueue] = useState(false);
    const [streamingComponentId, setStreamingComponentId] = useState<string | null>(null);

    const simulateThinking = flow.settings?.simulateThinking;
    const variablesString = JSON.stringify(variables);
    const historyRef = useRef(history); // Ref to access latest history in callbacks
    const currentRunId = useRef(0); // Track active delivery run

    // Track streaming text content for truncation
    const currentStreamingTextRef = useRef<string>('');
    const streamingComponentIdRef = useRef<string | null>(null);
    const stopRequestedRef = useRef(false);

    useEffect(() => {
        historyRef.current = history;
    }, [history]);

    useEffect(() => {
        streamingComponentIdRef.current = streamingComponentId;
    }, [streamingComponentId]);

    // Report Status to Parent (Container)
    useEffect(() => {
        const isRunning = isThinking || isProcessingQueue || !!streamingComponentId;

        if (isRunning) {
            onStatusChange?.('stop', handleStop);
        } else {
            onStatusChange?.('default', undefined);
        }
    }, [isThinking, isProcessingQueue, streamingComponentId, onStatusChange]);

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
    const isInitializedRef = useRef(false);
    const flowRef = useRef(flow); // Track previous flow for diffing

    useEffect(() => {
        flowRef.current = flow;
    }, [flow]);

    // PRESERVE HISTORY ON UPDATE
    useEffect(() => {
        if (!isInitializedRef.current) {
            // First run logic (same as before)
            if (!flow.steps || flow.steps.length === 0) return;

            isInitializedRef.current = true;
            // Start a new run
            const newRunId = Date.now();
            currentRunId.current = newRunId;
            setIsProcessingQueue(false);

            // Find starting point
            const startNode = flow.steps.find(s => s.type === 'start');
            let initialHistory: import('./types').Step[] = [];

            if (startNode) {
                const connection = flow.connections?.find(c => c.source === startNode.id);
                if (connection) {
                    const firstStep = flow.steps.find(s => s.id === connection.target);
                    if (firstStep) {
                        initialHistory = [firstStep];
                    }
                }
            }

            // Fallback if no start node
            if (initialHistory.length === 0) {
                const firstTurn = flow.steps.find(s =>
                    s.type === 'turn' && (s as import('./types').Turn).phase === 'welcome'
                ) || flow.steps[0];
                if (firstTurn) initialHistory = [firstTurn];
            }

            if (simulateThinking) {
                setDeliveryQueue(initialHistory);
                setHistory([]);
                setVisibleComponentIds(new Set());
            } else {
                setHistory(initialHistory);
                const allIds = new Set<string>();
                initialHistory.forEach(step => {
                    if (step.type === 'turn') step.components.forEach(c => allIds.add(c.id));
                });
                setVisibleComponentIds(allIds);
            }
        } else {
            // UPDATE LOGIC: Patch existing history with new flow data
            setHistory(prevHistory => {
                // Map over existing history items and try to find their up-to-date versions in the new flow
                const updatedHistory = prevHistory.map(step => {
                    // Feedback items don't exist in the flow, preserve them
                    if (step.type === 'feedback') return step;

                    // User turns (generated on fly) don't exist in flow steps usually (unless hardcoded), allow preservation
                    if (step.type === 'user-turn') {
                        // If it corresponds to a real node, try to find it, otherwise keep as is
                        const realNode = flow.steps?.find(s => s.id === step.id);
                        return realNode ? realNode as import('./types').Step : step;
                    }

                    // For AI turns and others, find by ID
                    const updatedNode = flow.steps?.find(s => s.id === step.id);

                    // If node still exists, return new version. If not, return null (to be filtered)
                    // Note: We'll filter nulls afterwards
                    return updatedNode ? (updatedNode as import('./types').Step) : null;
                }).filter(Boolean) as HistoryStep[]; // remove nulls

                // If history got truncated because a node was deleted, that's fine.
                // If the flow structure changed significantly (e.g. connections rewired), 
                // the existing history might be "impossible" now, but for a preview during editing,
                // showing the "ghost" of the previous path with updated content is usually better than a full reset.
                // Ideally, we could check if the path is still valid, but that's complex.
                // Simple patching is usually enough for "Modify text -> See update" workflow.

                return updatedHistory;
            });
        }
    }, [flow.steps, flow.connections, variablesString, simulateThinking]);


    // --- DELIVERY ENGINE ---
    useEffect(() => {
        if (!simulateThinking || deliveryQueue.length === 0 || isProcessingQueue) return;

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
                setHistory(prev => [...prev, nextStep as import('./types').Step]);

                const components = nextStep.components;
                const nonPromptComponents = components.filter(c => c.type !== 'prompt');
                const promptComponents = components.filter(c => c.type === 'prompt');

                // 3. Reveal non-prompt components one-by-one
                for (let i = 0; i < nonPromptComponents.length; i++) {
                    // Check before component processing
                    if (currentRunId.current !== runId) return;

                    const component = nonPromptComponents[i];

                    // Start streaming
                    setStreamingComponentId(component.id);
                    setVisibleComponentIds(prev => new Set([...prev, component.id]));

                    // Wait for it to reveal (estimate time based on length)
                    let revealTime = 800;
                    if (component.type === 'message' || component.type === 'infoMessage') {
                        const content = component.content as { text?: string; body?: string };
                        const text = component.type === 'message' ? content.text : content.body;
                        revealTime = Math.min(Math.max((text || '').length * 12, 600), 2000);
                    }

                    await new Promise((r) => setTimeout(r as TimerHandler, revealTime));

                    if (currentRunId.current !== runId) return; // Abort
                    setStreamingComponentId(null);

                    // Pause between components (The "Breath" pause)
                    if (i < nonPromptComponents.length - 1) {
                        setIsThinking(true);
                        await new Promise((r) => setTimeout(r as TimerHandler, 400));
                        if (currentRunId.current !== runId) return;
                        setIsThinking(false);
                    }
                }

                // 4. Reveal all prompts at once at the end (The "Pop")
                if (promptComponents.length > 0) {
                    if (currentRunId.current !== runId) return;
                    setVisibleComponentIds(prev => {
                        const next = new Set(prev);
                        promptComponents.forEach(p => next.add(p.id));
                        return next;
                    });
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
    }, [deliveryQueue, isProcessingQueue, simulateThinking]);

    // --- SMART MATCHING LOGIC (Level 2) ---
    const findBestMatch = (input: string, possibleNodeIds: string[]): string | undefined => {
        const normalizedInput = input.toLowerCase().trim();
        const inputTokens = normalizedInput.split(/\s+/);

        let bestMatchId: string | undefined;
        let bestScore = 0;

        possibleNodeIds.forEach(nodeId => {
            const node = flow.steps?.find(s => s.id === nodeId) as import('./types').UserTurn;
            if (!node || node.type !== 'user-turn') return;

            // Gather matchable text
            const label = (node.label || '').toLowerCase();
            const trigger = (node.triggerValue || '').toLowerCase();

            // 1. Exact Input Match (Highest Priority)
            if (normalizedInput === label || normalizedInput === trigger) {
                if (bestScore < 1.0) { bestScore = 1.0; bestMatchId = nodeId; }
                return;
            }

            // 2. Token Overlap Score
            // Check how many words from the node's label/trigger are present in the user's input
            const targetText = `${label} ${trigger}`;
            const targetTokens = targetText.split(/\s+/).filter(t => t.length > 2); // Ignore short words

            let matchedTokens = 0;
            targetTokens.forEach(token => {
                // Fuzzy check each token
                if (inputTokens.some(inputToken =>
                    inputToken.includes(token) ||
                    token.includes(inputToken) ||
                    getLevenshteinDistance(inputToken, token) <= 1 // Allow 1 character typo
                )) {
                    matchedTokens++;
                }
            });

            // Calculate score based on % of target tokens matched
            const score = targetTokens.length > 0 ? (matchedTokens / targetTokens.length) : 0;

            // Boost score if the input implies the intent strongly
            if (score > bestScore) {
                bestScore = score;
                bestMatchId = nodeId;
            }
        });

        // Threshold for "understanding"
        // If we found a decent match (e.g. at least one significant keyword matched)
        return bestScore >= 0.3 ? bestMatchId : undefined;
    };

    // Simple Levenshtein Distance for typos
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


    // Helper to find the next node based on a source handle
    const traverse = (currentNodeId: string, sourceHandle?: string, simulatedInput?: string) => {
        let currentId = currentNodeId;
        let currentHandle = sourceHandle;
        const inputForBinding = simulatedInput; // Persist input for logic evaluation
        const nodesToAdd: HistoryStep[] = [];

        // Max iterations to prevent infinite loops
        for (let i = 0; i < 20; i++) {
            // Find connection
            let connection = undefined;

            if (simulatedInput && !sourceHandle) {
                // Special Case: "Free Intent" Traversal
                // Look for ALL connections from the current AI node
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

            // VISUAL LOGIC: 
            // If we are "simulating input" (user typed), we ALREADY added a bubble for what they typed.
            // So if we match a User Turn node, we should SKIP adding it to the history list
            // to avoid showing a duplicate "double bubble".
            const shouldHide = nextNode.type === 'user-turn' && !!inputForBinding;

            if (!shouldHide) {
                nodesToAdd.push(nextNode);
            }

            currentId = nextNode.id;
            currentHandle = undefined; // Reset handle/input for next hop
            simulatedInput = undefined; // Consumed after first hop (for intent matching)

            // Determine if we should continue traversing
            if (nextNode.type === 'turn') {
                // AI Turn is a stopping point (it waits for user interaction)
                break;
            } else if (nextNode.type === 'user-turn') {
                // User turn is just a message bubble (or logic container), continue to next
                continue;
            } else if (nextNode.type === 'condition') {
                // Evaluate Condition
                const branches = (nextNode as import('./types').Condition).branches || [];

                // CHECK: Do any branches reference a variable that's undefined?
                const undefinedVariable = branches.find(b => {
                    if (b.isDefault) return false; // Skip ELSE branches
                    if (b.logic?.variable && variables?.[b.logic.variable] === undefined) {
                        return true;
                    }
                    return false;
                });

                if (undefinedVariable?.logic?.variable) {
                    // PAUSE: Trigger Interceptor
                    const interceptorStep: HistoryStep = {
                        id: `interceptor-${nextNode.id}`,
                        type: 'interceptor',
                        variableName: undefinedVariable.logic.variable,
                        branches: branches,
                        stepId: nextNode.id,
                    };
                    nodesToAdd.push(interceptorStep);
                    break; // Stop traversal until user resolves
                }

                // No undefined variables, proceed normally
                const selectedBranchId = getConditionBranch(branches, variables || {}, inputForBinding);

                currentHandle = selectedBranchId || undefined;
                // Continue loop with this handle
            }
        }

        if (nodesToAdd.length > 0) {
            if (simulateThinking) {
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

    // Helper for Condition Logic
    const getConditionBranch = (branches: import('./types').Branch[], vars: Record<string, string>, input?: string) => {
        let selectedBranchId = null;

        // 1. Check for specific matches
        for (const branch of branches) {
            if (branch.isDefault) continue;

            if (branch.logic && branch.logic.variable) {
                const { variable, value } = branch.logic;

                // PRIORITY: Variable Map > Simulated Input (User Text)
                let simulatedVal = vars[variable];

                // Note: Interceptor check happens in traverse loop purely based on undefined check
                // Here we assume we have values or are just checking what matches.

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

    const handlePromptClick = (stepId: string, promptComponentId: string, text?: string) => {
        const handleId = `handle-${promptComponentId}`;

        // 1. Visual: Add User Bubble with valid text
        if (text) {
            const mockUserStep: import('./types').UserTurn = {
                id: `temp-${Date.now()}`,
                type: 'user-turn',
                label: text,
                inputType: 'text'
            };
            setHistory(prev => [...prev, mockUserStep]);
        }

        // 2. Traversal: Pass text as simulatedInput so traverse() skips the real UserTurnNode
        traverse(stepId, handleId, text);
    };

    // REGISTER COMPOSER HANDLER
    useEffect(() => {
        onRegisterSend(() => {
            const input = composerValue.trim();
            if (!input) return;

            // 1. Add User Bubble immediately (Visual feedback)
            const mockUserStep: import('./types').UserTurn = {
                id: `temp-${Date.now()}`,
                type: 'user-turn',
                label: input,
                inputType: 'text'
            };
            setHistory(prev => [...prev, mockUserStep]);
            onComposerReset();

            // 2. Trigger Traversal from the LAST ACTUAL NODE in history
            // We need to find the last "AI Turn" we were at to branch off from.
            const lastRealStep = historyRef.current.slice().reverse().find(s => s.type === 'turn' || s.type === 'start');

            if (lastRealStep) {
                // Wait a tick for visual effect then traverse
                const delay = simulateThinking ? 500 : 100;
                setTimeout(() => {
                    traverse(lastRealStep.id, undefined, input);
                }, delay);
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [composerValue, history, flow.connections, flow.steps, simulateThinking]);


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
        <div className="space-y-4">
            {/* Disclaimer (Global) */}
            {flow.settings?.showDisclaimer && <Message variant="disclaimer" />}

            {history.map((step, historyIndex) => {
                const isLast = historyIndex === history.length - 1;

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
                    // Force cast for TS ease
                    const interceptor = step as unknown as {
                        variableName: string,
                        branches: import('./types').Branch[],
                        stepId: string
                    };

                    return (
                        <ContextInterceptorMessage
                            key={step.id}
                            variableName={interceptor.variableName}
                            branches={interceptor.branches}
                            onResolve={(value) => {
                                // 1. Handle "Use Default" special case
                                if (value === '__USE_DEFAULT__') {
                                    // Don't save this to variables, just pick the default branch
                                    // Remove interceptor from history
                                    setHistory(prev => prev.filter(s => s.id !== step.id));

                                    // Find and use the default/ELSE branch
                                    const defaultBranch = interceptor.branches.find(b => b.isDefault);
                                    const selectedBranch = defaultBranch?.id || interceptor.branches[0]?.id;

                                    // Resume without setting the variable
                                    setTimeout(() => {
                                        traverse(interceptor.stepId, selectedBranch || undefined);
                                    }, 50);
                                    return;
                                }

                                // 2. Normal case: Set the variable with the provided value
                                onVariableUpdate?.(interceptor.variableName, value);

                                // 3. Remove this interceptor from history
                                setHistory(prev => prev.filter(s => s.id !== step.id));

                                // 4. Smart Resume
                                // Determine which branch to take based on the NEW value
                                const tempVars = { ...(variables || {}), [interceptor.variableName]: value };
                                const selectedBranch = getConditionBranch(interceptor.branches, tempVars);

                                // Resume Traversal from the Condition Node's ID, but forcing the specific branch handle
                                setTimeout(() => {
                                    traverse(interceptor.stepId, selectedBranch || undefined);
                                }, 50);
                            }}
                        />
                    );
                }

                // 1. AI Turn
                if (step.type === 'turn') {
                    const components = step.components;

                    return (
                        <div key={`${step.id}-${historyIndex}`} className="flex flex-col gap-4">
                            {components.map((component, idx) => {
                                // Respect Visibility
                                if (!visibleComponentIds.has(component.id)) return null;

                                if (component.type === 'message') {
                                    const text = (component.content as import('./types').AIMessageContent).text;
                                    return (
                                        <Message
                                            key={component.id}
                                            variant="ai"
                                            defaultText={
                                                text && streamingComponentId === component.id ? (
                                                    <StreamingText
                                                        text={text}
                                                        onProgress={(t) => currentStreamingTextRef.current = t}
                                                    />
                                                ) : text ? (
                                                    <MarkdownRenderer>{text}</MarkdownRenderer>
                                                ) : undefined
                                            }
                                        />
                                    );
                                }
                                if (component.type === 'infoMessage') {
                                    const info = component.content as import('./types').AIInfoContent;
                                    return (
                                        <InfoMessage
                                            key={component.id}
                                            title={info.title || ''}
                                            sources={info.sources?.filter(s => s.text).map((s: { text?: string; url?: string }) => ({
                                                text: s.text!,
                                                href: s.url
                                            }))}
                                            onFeedbackChange={() => { }}
                                        >
                                            {info.body && streamingComponentId === component.id ? (
                                                <StreamingText
                                                    text={info.body}
                                                    onProgress={(t) => currentStreamingTextRef.current = t}
                                                />
                                            ) : info.body ? (
                                                <MarkdownRenderer>{info.body}</MarkdownRenderer>
                                            ) : null}
                                        </InfoMessage>
                                    );
                                }
                                if (component.type === 'statusCard') {
                                    const actionContent = component.content as import('./types').AIStatusContent;
                                    return (
                                        <div key={component.id} className="py-2">
                                            <SimulatedStatusCard
                                                loadingTitle={actionContent.loadingTitle}
                                                successTitle={actionContent.successTitle}
                                                successDescription={actionContent.successDescription}
                                                failureTitle={actionContent.failureTitle}
                                                failureDescription={actionContent.failureDescription}
                                            // If we are currently "deliver-streaming" this action card, we can skip the artificial delay?
                                            // Or better, let it do its thing.
                                            />
                                        </div>
                                    );
                                }
                                if (component.type === 'selectionList') {
                                    // Cast to correct type
                                    const selectionContent = component.content as import('./types').SelectionListContent;

                                    // Check if this component has already been "interacted" with in history?
                                    // For now, we allow re-selection. Interaction adds a new user step which pushes new history.

                                    return (
                                        <div key={component.id} className="py-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                            {selectionContent.title && (
                                                <div className="mb-2 text-sm font-medium text-gray-900">
                                                    {selectionContent.title}
                                                </div>
                                            )}
                                            <SelectionList
                                                items={selectionContent.items.map(item => ({
                                                    id: item.id,
                                                    title: item.title,
                                                    subtitle: item.subtitle,
                                                    imageUrl: item.imageUrl,
                                                    iconName: item.iconName as import('@/components/vca-components/icons').VcaIconName,
                                                    disabled: item.disabled || !isLast // Disable if not last step
                                                }))}
                                                layout={selectionContent.layout}
                                                onSelect={(item) => {
                                                    // Simulate user clicking this item
                                                    if (isLast) {
                                                        const handleId = `handle-${component.id}-${item.id}`;

                                                        // 1. Visual: Add User Bubble
                                                        const mockUserStep: import('./types').UserTurn = {
                                                            id: `temp-${Date.now()}`,
                                                            type: 'user-turn',
                                                            label: item.title,
                                                            inputType: 'button'
                                                        };
                                                        setHistory(prev => [...prev, mockUserStep]);

                                                        // 2. Traverse
                                                        traverse(step.id, handleId, item.title);
                                                    }
                                                }}
                                            />
                                        </div>
                                    );
                                }
                                if (component.type === 'checkboxGroup') {
                                    const groupContent = component.content as import('./types').CheckboxGroupContent;

                                    return (
                                        <div key={component.id} className="py-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                            <CheckboxGroup
                                                title={groupContent.title}
                                                description={groupContent.description}
                                                options={groupContent.options.map((opt) => ({
                                                    ...opt,
                                                    disabled: opt.disabled || !isLast
                                                }))}
                                                saveLabel={groupContent.saveLabel}
                                                onSave={(selectedIds) => {
                                                    if (!isLast) return;

                                                    // 1. Visual: Add User Bubble
                                                    const selectedLabels = groupContent.options
                                                        .filter((o) => selectedIds.includes(o.id))
                                                        .map((o) => o.label)
                                                        .join(', ');

                                                    const text = selectedLabels
                                                        ? `Selected: ${selectedLabels}`
                                                        : 'Saved with no selection';

                                                    const mockUserStep: import('./types').UserTurn = {
                                                        id: `temp-${Date.now()}`,
                                                        type: 'user-turn',
                                                        label: text,
                                                        inputType: 'button'
                                                    };
                                                    setHistory(prev => [...prev, mockUserStep]);

                                                    // 2. Traversal
                                                    // Pass the single submit handle
                                                    traverse(step.id, `handle-${component.id}`);
                                                }}
                                            />
                                        </div>
                                    );
                                }
                                if (component.type === 'prompt') {
                                    // Hide prompts in history (only show on last turn)
                                    if (!isLast) return null;

                                    // Check if this is the start of a consecutive prompt group
                                    const isStartOfGroup = idx === 0 || components[idx - 1].type !== 'prompt';
                                    if (!isStartOfGroup) return null; // Skip if already rendered in a group

                                    // Gather consecutive prompts
                                    const promptGroup = [];
                                    for (let i = idx; i < components.length; i++) {
                                        if (components[i].type === 'prompt' && visibleComponentIds.has(components[i].id)) {
                                            promptGroup.push(components[i]);
                                        } else {
                                            break;
                                        }
                                    }

                                    return (
                                        <PromptGroup
                                            key={`prompt-group-${component.id}`}
                                            prompts={promptGroup
                                                .filter(p => (p.content as import('./types').PromptContent).text)
                                                .map(p => ({
                                                    text: (p.content as import('./types').PromptContent).text!,
                                                    showAiIcon: (p.content as import('./types').PromptContent).showAiIcon,
                                                    onClick: () => handlePromptClick(step.id, p.id, (p.content as import('./types').PromptContent).text)
                                                }))}
                                        />
                                    );
                                }
                                return null;
                            })}


                        </div>
                    );
                }

                // 2. User Turn
                if (step.type === 'user-turn') {
                    return (
                        <div key={`${step.id}-${historyIndex}`} className="flex justify-end">
                            <Message
                                variant="user"
                                userText={step.label || "Selected option"}
                            />
                        </div>
                    );
                }

                return null;
            })}

            {/* Thinking Indicator */}
            {isThinking && <Message variant="ai" isThinking={true} />}

            {/* Scroll Anchor */}
            <div ref={messagesEndRef} />
        </div>
    );
};

// HELPERS

const StreamingText = ({ text, onComplete, onProgress }: { text: string; onComplete?: () => void; onProgress?: (text: string) => void }) => {
    const [displayedText, setDisplayedText] = useState('');
    const [index, setIndex] = useState(0);

    useEffect(() => {
        // Report progress immediately when text updates
        onProgress?.(displayedText);
    }, [displayedText, onProgress]);

    useEffect(() => {
        // Simple word-by-word streaming for speed and logic
        const words = text.split(' ');
        if (index < words.length) {
            const timeout = setTimeout(() => {
                setDisplayedText(prev => prev + (prev ? ' ' : '') + words[index]);
                setIndex(prev => prev + 1);
            }, 30); // Accelerated word-by-word
            return () => clearTimeout(timeout);
        } else {
            onComplete?.();
        }
    }, [index, text, onComplete]);

    return <MarkdownRenderer>{displayedText}</MarkdownRenderer>;
};

// Simulated Action Component
const SimulatedStatusCard = ({
    loadingTitle,
    successTitle,
    successDescription,
    failureTitle,
    failureDescription,
}: {
    loadingTitle: string,
    successTitle: string,
    successDescription?: string,
    failureTitle?: string,
    failureDescription?: string,
}) => {
    const [status, setStatus] = useState<'in-progress' | 'success' | 'failure'>('in-progress');

    // Auto-transition effect - always transitions to success
    useEffect(() => {
        setStatus('in-progress');
        const timer = setTimeout(() => {
            setStatus('success');
        }, 2000);

        return () => clearTimeout(timer);
    }, [loadingTitle, successTitle, failureTitle]);

    // Determine content based on final status
    const title = status === 'in-progress' ? loadingTitle
        : status === 'success' ? successTitle
            : (failureTitle || "Action failed");

    const description = status === 'success' ? successDescription
        : status === 'failure' ? failureDescription
            : undefined;

    return (
        <StatusCard
            status={status === 'in-progress' ? 'in-progress' : (status === 'success' ? 'complete' : 'failure')}
            title={title}
        >
            {description ? <MarkdownRenderer>{description}</MarkdownRenderer> : null}
        </StatusCard>
    );
};
