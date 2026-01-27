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
}

export const FlowPreview = ({ flow, isPremium, isMobile }: FlowPreviewProps) => {
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
                                    <PreviewContent flow={flow} />
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
                        <PreviewContent flow={flow} />
                    </Container>
                )}
            </div>
        </div>
    );
};


// Interactive Preview Content
const PreviewContent = ({ flow }: { flow: Flow }) => {
    // State to track the conversation history (visited nodes)
    const [history, setHistory] = useState<import('./types').Step[]>([]);

    // Initialize history with the start node
    useEffect(() => {
        if (!flow.steps || flow.steps.length === 0) return;

        // Find start node (Welcome phase or first node)
        const startNode = flow.steps.find(s =>
            s.type === 'turn' && (s as import('./types').Turn).phase === 'welcome'
        ) || flow.steps[0];

        setHistory([startNode]);
    }, [flow.steps]); // Reset when graph structure changes substantially? 
    // actually we might want to be careful resetting on every edit. 
    // For now, simple reset is safer to avoid invalid states.

    // Helper to find the next node based on a source handle
    const traverse = (currentNodeId: string, sourceHandle?: string) => {
        // Find connection
        const connection = flow.connections?.find(c =>
            c.source === currentNodeId &&
            (sourceHandle ? c.sourceHandle === sourceHandle : true)
        );

        if (!connection) return;

        const nextNode = flow.steps?.find(s => s.id === connection.target);
        if (!nextNode) return;

        // Add the next node (User Turn)
        const newHistory = [...history, nextNode];

        // If the next node is a User Turn, it acts as a passthrough to the next AI Turn
        // So we should try to double-jump if possible
        if (nextNode.type === 'user-turn' || nextNode.type === 'condition') { // Conditions might need evaluation logic later
            const nextConnection = flow.connections?.find(c => c.source === nextNode.id);
            if (nextConnection) {
                const destNode = flow.steps?.find(s => s.id === nextConnection.target);
                if (destNode) {
                    newHistory.push(destNode);
                }
            }
        }

        setHistory(newHistory);
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
