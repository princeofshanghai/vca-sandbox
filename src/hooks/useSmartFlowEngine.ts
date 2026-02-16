
import { useState, useEffect, useRef } from 'react';
import { Flow, Step, Branch, Connection, UserTurn, Condition } from '@/views/studio/types';

// Types for local history extension
export type HistoryStep = Step | {
    type: 'feedback',
    id: string,
    variant: 'neutral',
    message: string
} | {
    type: 'interceptor',
    id: string,
    variableName: string,
    branches: Branch[],
    stepId: string // To resume from
};

interface UseSmartFlowEngineProps {
    flow: Flow;
    variables?: Record<string, string>;
    onVariableUpdate?: (key: string, value: string) => void;
}

export const useSmartFlowEngine = ({
    flow,
    variables,
    onVariableUpdate
}: UseSmartFlowEngineProps) => {
    // State to track the conversation history (visited nodes)
    const [history, setHistory] = useState<HistoryStep[]>([]);

    // Delivery Queue & Visibility
    const [deliveryQueue, setDeliveryQueue] = useState<HistoryStep[]>([]);
    const [visibleComponentIds, setVisibleComponentIds] = useState<Set<string>>(new Set());
    const [isThinking, setIsThinking] = useState(false);
    const [isProcessingQueue, setIsProcessingQueue] = useState(false);

    // NEW: Text Streaming State
    const [streamingComponentId, setStreamingComponentId] = useState<string | null>(null);
    const [currentStreamingText, setCurrentStreamingText] = useState<string>('');

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
    const isInitializedRef = useRef(false);




    // --- DELIVERY ENGINE (STREAMING) ---
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
                        textToStream = (component.content as any).text || '';
                    } else if (component.type === 'infoMessage') {
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

                        // Small pause for visual digest, but very fast for prompts
                        const pause = component.type === 'prompt' ? 100 : 400;
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
    }, [deliveryQueue, isProcessingQueue, simulateThinking]);

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

    const findBestMatch = (input: string, possibleNodeIds: string[]): string | undefined => {
        const normalizedInput = input.toLowerCase().trim();
        const inputTokens = normalizedInput.split(/\s+/);

        let bestMatchId: string | undefined;
        let bestScore = 0;

        possibleNodeIds.forEach(nodeId => {
            const node = flow.steps?.find(s => s.id === nodeId) as UserTurn;
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
            const targetText = `${label} ${trigger}`;
            const targetTokens = targetText.split(/\s+/).filter(t => t.length > 2);

            let matchedTokens = 0;
            targetTokens.forEach(token => {
                // Fuzzy check each token
                if (inputTokens.some(inputToken =>
                    inputToken.includes(token) ||
                    token.includes(inputToken) ||
                    getLevenshteinDistance(inputToken, token) <= 1
                )) {
                    matchedTokens++;
                }
            });

            const score = targetTokens.length > 0 ? (matchedTokens / targetTokens.length) : 0;

            if (score > bestScore) {
                bestScore = score;
                bestMatchId = nodeId;
            }
        });

        return bestScore >= 0.3 ? bestMatchId : undefined;
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
                    if (nextStep && nextStep.type === 'user-turn') {
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

                // CHECK: Do any branches reference a variable that's undefined?
                const undefinedVariable = branches.find(b => {
                    if (b.isDefault) return false;
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
                    break;
                }

                // No undefined variables, proceed normally
                const selectedBranchId = getConditionBranch(branches, variables || {}, inputForBinding);

                currentHandle = selectedBranchId || undefined;
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
                s.type === 'turn' && (s as any).phase === 'welcome'
            ) || flow.steps[0];

            if (firstTurn) {
                // Manually add the first turn step
                if (simulateThinking) {
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
    }, [flow.steps, flow.connections, variablesString, simulateThinking]);


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
            const delay = simulateThinking ? 500 : 100;
            setTimeout(() => {
                traverse(lastRealStep.id, undefined, input);
            }, delay);
        }
    };

    const resolveInterceptor = (stepId: string, variableName: string, value: string, branches: Branch[], interceptorStepId: string) => {
        // 1. Handle "Use Default" special case
        if (value === '__USE_DEFAULT__') {
            setHistory(prev => prev.filter(s => s.id !== interceptorStepId));
            const defaultBranch = branches.find(b => b.isDefault);
            const selectedBranch = defaultBranch?.id || branches[0]?.id;
            setTimeout(() => { traverse(stepId, selectedBranch || undefined); }, 50);
            return;
        }

        // 2. Normal case
        onVariableUpdate?.(variableName, value);
        setHistory(prev => prev.filter(s => s.id !== interceptorStepId));

        const tempVars = { ...(variables || {}), [variableName]: value };
        const selectedBranch = getConditionBranch(branches, tempVars);

        setTimeout(() => {
            traverse(stepId, selectedBranch || undefined);
        }, 50);
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
        resolveInterceptor,
        setHistory
    };
};
