// ... (imports)
import { useState, useEffect } from 'react';
import { Flow } from './types';
import { Container } from '@/components/vca-components/container/Container';
import { Message } from '@/components/vca-components/messages';
import { InfoMessage } from '@/components/vca-components/info-message/InfoMessage';
import { ActionCard } from '@/components/vca-components/action-card/ActionCard';
import { PromptGroup } from '@/components/vca-components/prompt-group/PromptGroup';
import { PhoneFrame } from '@/components/component-library/PhoneFrame';
import { MarkdownRenderer } from '@/components/vca-components/markdown-renderer/Markdown';

interface FlowPreviewProps {
    flow: Flow;
    isPremium: boolean;
    isMobile: boolean;
    variables?: Record<string, string>;
}

export const FlowPreview = ({ flow, isPremium, isMobile, variables }: FlowPreviewProps) => {
    return (
        <div className="h-full flex flex-col relative bg-white">
            <div className="flex-1 flex flex-col items-center justify-center p-4 overflow-y-auto thin-scrollbar">
                {isMobile ? (
                    <div className="w-[334px] h-[726px] shrink-0 flex items-center justify-center">
                        <div className="scale-[0.85] origin-center">
                            <PhoneFrame showStatusBar={true} dimBackground={false}>
                                <Container
                                    headerTitle="Help"
                                    className="bg-white h-[772px] w-[393px]"
                                    viewport="mobile"
                                    showHeaderPremiumIcon={isPremium}
                                    showPremiumBorder={isPremium}
                                >
                                    <PreviewContent flow={flow} variables={variables} />
                                </Container>
                            </PhoneFrame>
                        </div>
                    </div>
                ) : (
                    <Container
                        headerTitle="Help"
                        className="shadow-xl bg-white"
                        viewport="desktop"
                        showHeaderPremiumIcon={isPremium}
                        showPremiumBorder={isPremium}
                    >
                        <PreviewContent flow={flow} variables={variables} />
                    </Container>
                )}
            </div>
        </div>
    );
};


// Interactive Preview Content
const PreviewContent = ({ flow, variables }: { flow: Flow, variables?: Record<string, string> }) => {
    // State to track the conversation history (visited nodes)
    const [history, setHistory] = useState<import('./types').Step[]>([]);
    const variablesString = JSON.stringify(variables);

    // Initialize history with the start node
    useEffect(() => {
        if (!flow.steps || flow.steps.length === 0) return;

        // Initialize with Start Node traversal
        const startNode = flow.steps.find(s => s.type === 'start');

        if (startNode) {
            // Find what the start node connects to
            const connection = flow.connections?.find(c => c.source === startNode.id);
            if (connection) {
                const firstStep = flow.steps.find(s => s.id === connection.target);
                if (firstStep) {
                    setHistory([firstStep]);
                    return;
                }
            }
        }

        // Fallback: Find Welcome phase or first node if no start node logic works
        const firstTurn = flow.steps.find(s =>
            s.type === 'turn' && (s as import('./types').Turn).phase === 'welcome'
        ) || flow.steps[0];

        if (firstTurn) {
            setHistory([firstTurn]);
        }
    }, [flow.steps, flow.connections, variablesString]); // Reset when structure or context changes 
    // actually we might want to be careful resetting on every edit. 
    // For now, simple reset is safer to avoid invalid states.

    // Helper to find the next node based on a source handle
    const traverse = (currentNodeId: string, sourceHandle?: string) => {
        let currentId = currentNodeId;
        let currentHandle = sourceHandle;
        const nodesToAdd: import('./types').Step[] = [];

        // Loop to traverse through "passthrough" nodes (UserTurns, Conditions)
        // Max iterations to prevent infinite loops
        for (let i = 0; i < 20; i++) {
            // Find connection
            const connection = flow.connections?.find(c =>
                c.source === currentId &&
                (currentHandle ? c.sourceHandle === currentHandle : true)
            );

            if (!connection) break;

            const nextNode = flow.steps?.find(s => s.id === connection.target);
            if (!nextNode) break;

            nodesToAdd.push(nextNode);
            currentId = nextNode.id;
            currentHandle = undefined; // Reset handle for next hop

            // Determine if we should continue traversing
            if (nextNode.type === 'turn') {
                // AI Turn is a stopping point (it waits for user interaction)
                break;
            } else if (nextNode.type === 'user-turn') {
                // User turn is just a message bubble, continue to next
                continue;
            } else if (nextNode.type === 'condition') {
                // Evaluate Condition
                const branches = (nextNode as import('./types').Condition).branches || [];
                let selectedBranchId = branches[0]?.id; // Default to first

                // Find matching branch
                if (variables) {
                    for (const branch of branches) {
                        if (branch.logic && branch.logic.variable) {
                            const { variable, value } = branch.logic;

                            const simulatedVal = String(variables[variable] || '').trim().toLowerCase();
                            const targetVal = String(value).trim().toLowerCase();

                            // Relaxed equality check (case-insensitive)
                            if (simulatedVal === targetVal) {
                                selectedBranchId = branch.id;
                                break;
                            }
                        }
                    }
                }

                currentHandle = selectedBranchId;
                // Continue loop with this handle
            }
        }

        if (nodesToAdd.length > 0) {
            setHistory(prev => [...prev, ...nodesToAdd]);
        }
    };

    const handlePromptClick = (stepId: string, promptComponentId: string) => {
        // Find the handle ID for this prompt
        // In SimpleComponentCard we used `handle-${component.id}`
        const handleId = `handle-${promptComponentId}`;
        traverse(stepId, handleId);
    };

    // Render logic
    return (
        <div className="space-y-4 px-4 pt-4 pb-20">
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
                                if (component.type === 'message') {
                                    return (
                                        <Message
                                            key={component.id}
                                            variant="ai"
                                            defaultText={<MarkdownRenderer>{(component.content as import('./types').AIMessageContent).text || ''}</MarkdownRenderer>}
                                        />
                                    );
                                }
                                if (component.type === 'infoMessage') {
                                    const info = component.content as import('./types').AIInfoContent;
                                    return (
                                        <InfoMessage
                                            key={component.id}
                                            title={info.title}
                                            sources={info.sources?.map(s => ({ text: s.text, href: s.url }))}
                                        >
                                            <MarkdownRenderer>{info.body || ''}</MarkdownRenderer>
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
                                            />
                                        </div>
                                    );
                                }
                                if (component.type === 'prompt') {
                                    // Group prompts?
                                    // For simplicity in this iteration, let's render individual prompts 
                                    // OR better: gather them first like before.
                                    return null; // Handled by grouping below
                                }
                                return null;
                            })}

                            {/* Render Prompts Group */}
                            {(() => {
                                const prompts = components.filter(c => c.type === 'prompt');
                                if (prompts.length > 0) {
                                    // Only show prompts interactions if this is the LAST node in history
                                    // Previous prompts should be hidden or disabled? 
                                    // Standard chat UX: Previous prompts usually disappear or become disabled.
                                    // Let's hide them for a clean "history" look, showing only the User's choice bubble.
                                    if (!isLast) return null;

                                    return (
                                        <PromptGroup
                                            prompts={prompts.map(p => ({
                                                text: (p.content as import('./types').PromptContent).text,
                                                showAiIcon: (p.content as import('./types').PromptContent).showAiIcon,
                                                onClick: () => handlePromptClick(step.id, p.id)
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
            {flow.settings?.simulateThinking && <Message variant="ai" isThinking={true} />}
        </div>
    );
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
            {description ? <MarkdownRenderer>{description}</MarkdownRenderer> : ''}
        </ActionCard>
    );
};
