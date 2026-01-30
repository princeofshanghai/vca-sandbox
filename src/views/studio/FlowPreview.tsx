// ... (imports)
import { useState, useEffect, useRef } from 'react';
import { Flow } from './types';
import { Container } from '@/components/vca-components/container/Container';
import { Message } from '@/components/vca-components/messages';
import { InfoMessage } from '@/components/vca-components/info-message/InfoMessage';
import { ActionCard } from '@/components/vca-components/action-card/ActionCard';
import { PromptGroup } from '@/components/vca-components/prompt-group/PromptGroup';
import { PhoneFrame } from '@/components/component-library/PhoneFrame';
import { MarkdownRenderer } from '@/components/vca-components/markdown-renderer/Markdown';
import { Settings, Check } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Button } from '@/components/ui/button';

interface FlowPreviewProps {
    flow: Flow;
    onUpdateFlow: (flow: Flow) => void;
    isPremium: boolean;
    isMobile: boolean;
    onTogglePremium: () => void;
    onToggleMobile: () => void;
    variables: Record<string, string>;
    updateVariable: (key: string, value: string) => void;
    usedVariables: string[];
}

export const FlowPreview = ({
    flow,
    onUpdateFlow,
    isPremium,
    isMobile,
    onTogglePremium,
    onToggleMobile,
    variables,
    updateVariable,
    usedVariables
}: FlowPreviewProps) => {
    // Shared composer state
    const [composerValue, setComposerValue] = useState('');
    const [handleSendRef, setHandleSendRef] = useState<(() => void) | undefined>(undefined);

    const settings = flow.settings || { showDisclaimer: true, simulateThinking: true };

    const toggleSetting = (key: 'showDisclaimer' | 'simulateThinking') => {
        const currentSettings = flow.settings || { showDisclaimer: true, simulateThinking: true };
        onUpdateFlow({
            ...flow,
            settings: {
                ...currentSettings,
                [key]: !currentSettings[key]
            }
        });
    };

    const displaySettingsButton = (
        <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="bg-white border-gray-200 text-gray-600 hover:text-gray-900 shadow-sm transition-all flex items-center gap-2 pointer-events-auto"
                >
                    <Settings size={16} strokeWidth={2} />
                    Display
                </Button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
                <DropdownMenu.Content
                    align="start"
                    sideOffset={8}
                    className="min-w-[260px] bg-white rounded-lg shadow-lg border border-gray-200 p-2 z-[1001] animate-in fade-in-0 zoom-in-95 cursor-default"
                >
                    <DropdownMenu.Label className="text-xs font-semibold text-gray-400 px-2 py-1 mb-1">
                        Preview mode
                    </DropdownMenu.Label>

                    {/* Desktop Option */}
                    <DropdownMenu.CheckboxItem
                        className="flex items-center justify-between gap-4 px-2 py-2 text-sm text-gray-700 rounded hover:bg-gray-100 cursor-default outline-none"
                        checked={!isMobile}
                        onCheckedChange={() => !isMobile || onToggleMobile()}
                    >
                        <span>Desktop</span>
                        {!isMobile && <Check size={14} className="text-blue-600 shrink-0" />}
                    </DropdownMenu.CheckboxItem>

                    {/* Mobile Option */}
                    <DropdownMenu.CheckboxItem
                        className="flex items-center justify-between gap-4 px-2 py-2 text-sm text-gray-700 rounded hover:bg-gray-100 cursor-default outline-none"
                        checked={isMobile}
                        onCheckedChange={() => isMobile || onToggleMobile()}
                    >
                        <span>Mobile</span>
                        {isMobile && <Check size={14} className="text-blue-600 shrink-0" />}
                    </DropdownMenu.CheckboxItem>

                    <div className="h-px bg-gray-100 my-1"></div>

                    {/* Premium Branding */}
                    <DropdownMenu.CheckboxItem
                        className="flex items-center justify-between gap-4 px-2 py-2 text-sm text-gray-700 rounded hover:bg-gray-100 cursor-default outline-none"
                        checked={isPremium}
                        onCheckedChange={onTogglePremium}
                    >
                        <span>LinkedIn Premium branding</span>
                        {isPremium && <Check size={14} className="text-blue-600 shrink-0" />}
                    </DropdownMenu.CheckboxItem>

                    {/* Show Disclaimer */}
                    <DropdownMenu.CheckboxItem
                        className="flex items-center justify-between gap-4 px-2 py-2 text-sm text-gray-700 rounded hover:bg-gray-100 cursor-default outline-none"
                        checked={settings.showDisclaimer}
                        onCheckedChange={() => toggleSetting('showDisclaimer')}
                    >
                        <span>Show disclaimer</span>
                        {settings.showDisclaimer && <Check size={14} className="text-blue-600 shrink-0" />}
                    </DropdownMenu.CheckboxItem>

                    {/* Simulate Thinking */}
                    <DropdownMenu.CheckboxItem
                        className="flex items-center justify-between gap-4 px-2 py-2 text-sm text-gray-700 rounded hover:bg-gray-100 cursor-default outline-none"
                        checked={settings.simulateThinking}
                        onCheckedChange={() => toggleSetting('simulateThinking')}
                    >
                        <span>Simulate thinking</span>
                        {settings.simulateThinking && <Check size={14} className="text-blue-600 shrink-0" />}
                    </DropdownMenu.CheckboxItem>
                    {/* Simulation Variables Section */}
                    <>
                        <div className="h-px bg-gray-100 my-1"></div>
                        <DropdownMenu.Label className="text-xs font-semibold text-gray-400 px-2 py-1 mb-1 mt-1">
                            Simulation Context
                        </DropdownMenu.Label>
                        {usedVariables.length === 0 ? (
                            <div className="px-2 py-2 text-xs text-gray-500 italic text-center bg-gray-50 rounded mx-2 border border-dashed border-gray-200">
                                No variables defined in logic
                            </div>
                        ) : (
                            usedVariables.map(variable => (
                                <div key={variable} className="px-2 py-1">
                                    <div className="text-[10px] text-gray-500 mb-0.5 ml-1">{variable}</div>
                                    <input
                                        type="text"
                                        value={variables[variable] || ''}
                                        onChange={(e) => updateVariable(variable, e.target.value)}
                                        className="w-full text-xs bg-gray-50 border border-gray-200 rounded px-2 py-1 focus:border-blue-500 focus:outline-none placeholder:italic"
                                        placeholder="Value..."
                                        onClick={(e) => e.stopPropagation()} // Prevent menu closing
                                        onKeyDown={(e) => e.stopPropagation()}
                                    />
                                </div>
                            ))
                        )}
                    </>

                </DropdownMenu.Content>
            </DropdownMenu.Portal>
        </DropdownMenu.Root>
    );

    return (
        <div className="h-full w-full flex flex-col relative bg-transparent pointer-events-none">
            <style>{`
                @keyframes shimmer {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                }
                .skeleton-shimmer {
                    background: #e5e7eb;
                    background-image: linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%);
                    background-size: 200% 100%;
                    animation: shimmer 2s infinite linear;
                }
                .skeleton-shimmer-prompt {
                    background: rgba(255, 255, 255, 0.2);
                    background-image: linear-gradient(90deg, rgba(255, 255, 255, 0.2) 25%, rgba(255, 255, 255, 0.4) 50%, rgba(255, 255, 255, 0.2) 75%);
                    background-size: 200% 100%;
                    animation: shimmer 2s infinite linear;
                }
            `}</style>
            <div className="flex-1 flex flex-col items-end justify-center p-4 pr-6 overflow-y-auto thin-scrollbar">
                {isMobile ? (
                    <div className="relative w-[334px] h-[726px] shrink-0 flex items-center justify-center mt-8 pointer-events-auto">
                        {/* Option B: Unscaled button above scaled phone */}
                        <div className="absolute -top-12 left-0 z-10">
                            {displaySettingsButton}
                        </div>
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
                                >
                                    <PreviewContent
                                        flow={flow}
                                        variables={variables}
                                        onRegisterSend={(fn) => setHandleSendRef(() => fn)}
                                        onComposerReset={() => setComposerValue('')}
                                        composerValue={composerValue}
                                    />
                                </Container>
                            </PhoneFrame>
                        </div>
                    </div>
                ) : (
                    <div className="relative pointer-events-auto">
                        <div className="absolute -top-12 left-0 z-10">
                            {displaySettingsButton}
                        </div>
                        <Container
                            headerTitle="Help"
                            className="shadow-xl bg-white"
                            viewport="desktop"
                            showHeaderPremiumIcon={isPremium}
                            showPremiumBorder={isPremium}
                            composerValue={composerValue}
                            onComposerChange={setComposerValue}
                            onComposerSend={() => handleSendRef?.()}
                        >
                            <PreviewContent
                                flow={flow}
                                variables={variables}
                                onRegisterSend={(fn) => setHandleSendRef(() => fn)}
                                onComposerReset={() => setComposerValue('')}
                                composerValue={composerValue}
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
    onRegisterSend,
    onComposerReset,
    composerValue
}: {
    flow: Flow,
    variables?: Record<string, string>,
    onRegisterSend: (fn: () => void) => void,
    onComposerReset: () => void,
    composerValue: string
}) => {
    // State to track the conversation history (visited nodes)
    const [history, setHistory] = useState<import('./types').Step[]>([]);

    // NEW: Delivery Queue & Visibility
    const [deliveryQueue, setDeliveryQueue] = useState<import('./types').Step[]>([]);
    const [visibleComponentIds, setVisibleComponentIds] = useState<Set<string>>(new Set());
    const [isThinking, setIsThinking] = useState(false);
    const [isProcessingQueue, setIsProcessingQueue] = useState(false);
    const [streamingComponentId, setStreamingComponentId] = useState<string | null>(null);

    const simulateThinking = flow.settings?.simulateThinking;
    const variablesString = JSON.stringify(variables);
    const historyRef = useRef(history); // Ref to access latest history in callbacks
    const currentRunId = useRef(0); // Track active delivery run

    useEffect(() => {
        historyRef.current = history;
    }, [history]);

    // Initialize history with the start node
    useEffect(() => {
        if (!flow.steps || flow.steps.length === 0) return;

        // Start a new run
        const newRunId = Date.now();
        currentRunId.current = newRunId;
        setIsProcessingQueue(false); // Reset lock for new run

        // Reset all states when flow changes (if needed) - or just initialize
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

        if (initialHistory.length === 0) {
            const firstTurn = flow.steps.find(s =>
                s.type === 'turn' && (s as import('./types').Turn).phase === 'welcome'
            ) || flow.steps[0];
            if (firstTurn) initialHistory = [firstTurn];
        }

        if (simulateThinking) {
            // Queue them instead of direct history
            setDeliveryQueue(initialHistory);
            setHistory([]);
            setVisibleComponentIds(new Set());
        } else {
            // Instant delivery
            setHistory(initialHistory);
            // All components visible
            const allIds = new Set<string>();
            initialHistory.forEach(step => {
                if (step.type === 'turn') step.components.forEach(c => allIds.add(c.id));
            });
            setVisibleComponentIds(allIds);
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
                setIsThinking(false);

                // 2. Add to history
                setHistory(prev => [...prev, nextStep]);

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
        const nodesToAdd: import('./types').Step[] = [];

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
                let selectedBranchId = null;

                // 1. Check for specific matches
                for (const branch of branches) {
                    // Skip the "Else" branch during specific value matching
                    // (It should only be taken as a fallback if no other rules match)
                    if (branch.isDefault) continue;

                    if (branch.logic && branch.logic.variable) {
                        const { variable, value } = branch.logic;

                        // PRIORITY: Variable Map > Simulated Input (User Text)
                        // Smart Binding: If variable not in map, assume input maps to this variable
                        let simulatedVal = variables?.[variable];
                        if (simulatedVal === undefined && inputForBinding !== undefined) {
                            simulatedVal = inputForBinding;
                        }

                        if (simulatedVal !== undefined) {
                            simulatedVal = String(simulatedVal).trim().toLowerCase();
                            const targetVal = String(value).trim().toLowerCase();
                            // Relaxed equality check (case-insensitive)
                            if (simulatedVal === targetVal) {
                                selectedBranchId = branch.id;
                                break;
                            }
                        }
                    }
                }

                // 2. Fallback to Default (Else) or First
                if (!selectedBranchId) {
                    const defaultBranch = branches.find(b => b.isDefault);
                    if (defaultBranch) {
                        selectedBranchId = defaultBranch.id;
                    } else {
                        // Legacy: Default to first if no specific default
                        selectedBranchId = branches[0]?.id;
                    }
                }

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
    }, [composerValue, history, flow.connections, flow.steps, simulateThinking]);


    // Render logic
    return (
        <div className="space-y-4">
            {/* Disclaimer (Global) */}
            {flow.settings?.showDisclaimer && <Message variant="disclaimer" />}

            {history.map((step, historyIndex) => {
                const isLast = historyIndex === history.length - 1;

                // 1. AI Turn
                if (step.type === 'turn') {
                    const components = step.components;

                    return (
                        <div key={`${step.id}-${historyIndex}`} className="flex flex-col gap-4">
                            {components.map((component) => {
                                // Respect Visibility
                                if (!visibleComponentIds.has(component.id)) return null;

                                if (component.type === 'message') {
                                    const text = (component.content as import('./types').AIMessageContent).text;
                                    return (
                                        <Message
                                            key={component.id}
                                            variant="ai"
                                            defaultText={
                                                text ? (
                                                    streamingComponentId === component.id ? (
                                                        <StreamingText text={text} />
                                                    ) : (
                                                        <MarkdownRenderer>{text}</MarkdownRenderer>
                                                    )
                                                ) : <div className="w-48 h-3 rounded my-1 skeleton-shimmer" />
                                            }
                                        />
                                    );
                                }
                                if (component.type === 'infoMessage') {
                                    const info = component.content as import('./types').AIInfoContent;
                                    return (
                                        <InfoMessage
                                            key={component.id}
                                            title={info.title || (<div className="w-32 h-4 rounded skeleton-shimmer" /> as unknown as string)}
                                            sources={info.sources?.map((s: { text?: string; url?: string }) => ({
                                                text: s.text || ((<div className="w-24 h-2.5 rounded inline-block skeleton-shimmer" />) as unknown as string),
                                                href: s.url
                                            }))}
                                            onFeedbackChange={() => { }}
                                        >
                                            {info.body ? (
                                                streamingComponentId === component.id ? (
                                                    <StreamingText text={info.body} />
                                                ) : (
                                                    <MarkdownRenderer>{info.body}</MarkdownRenderer>
                                                )
                                            ) : (
                                                <div className="w-full h-16 rounded skeleton-shimmer" />
                                            )}
                                        </InfoMessage>
                                    );
                                }
                                if (component.type === 'actionCard') {
                                    const actionContent = component.content as import('./types').AIActionContent;
                                    return (
                                        <div key={component.id} className="py-2">
                                            <SimulatedAction
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
                                return null;
                            })}

                            {/* Render Prompts Group */}
                            {(() => {
                                // 1. Gather Explicit Prompts
                                const explicitPrompts = components.filter(c => c.type === 'prompt' && visibleComponentIds.has(c.id)).map(p => ({
                                    id: p.id,
                                    text: (p.content as import('./types').PromptContent).text,
                                    showAiIcon: (p.content as import('./types').PromptContent).showAiIcon,
                                    isSmart: false,
                                    onClick: () => handlePromptClick(step.id, p.id, (p.content as import('./types').PromptContent).text)
                                }));

                                const promptsToRender = explicitPrompts;

                                // 2. Smart Suggestions (Lookahead) - DISABLED for now
                                /*
                                if (isLast && explicitPrompts.length === 0) {
                                    // ...
                                }
                                */

                                if (promptsToRender.length > 0) {
                                    // Hide history prompts unless they are the last one (standard chat behavior)
                                    if (!isLast) return null;

                                    return (
                                        <PromptGroup
                                            prompts={promptsToRender.map(p => ({
                                                text: p.text || (<div className="w-20 h-2.5 rounded-sm skeleton-shimmer-prompt" /> as unknown as string),
                                                showAiIcon: p.showAiIcon,
                                                onClick: p.onClick
                                            }))}
                                        />
                                    );
                                }
                            })()}
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
        </div>
    );
};

// HELPERS

const StreamingText = ({ text, onComplete }: { text: string; onComplete?: () => void }) => {
    const [displayedText, setDisplayedText] = useState('');
    const [index, setIndex] = useState(0);

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
const SimulatedAction = ({
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
        <ActionCard
            status={status === 'in-progress' ? 'in-progress' : (status === 'success' ? 'success' : 'failure')}
            title={title}
        >
            {description ? <MarkdownRenderer>{description}</MarkdownRenderer> : (
                status !== 'in-progress' ? <div className="w-40 h-3 rounded skeleton-shimmer" /> : ''
            )}
        </ActionCard>
    );
};
