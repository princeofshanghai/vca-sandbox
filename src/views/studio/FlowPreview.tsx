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
import { cn } from '@/utils/cn';

interface FlowPreviewProps {
    flow: Flow;
    isPremium: boolean;
    isMobile: boolean;
}

export const FlowPreview = ({ flow, isPremium, isMobile }: FlowPreviewProps) => {
    // Global Scenario state for the preview session
    const [activeScenario, setActiveScenario] = useState<'success' | 'failure'>('success');

    return (
        <div className="h-full flex flex-col relative bg-gray-100">
            {/* Scenario Controller Overlay */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-white/90 backdrop-blur border border-gray-200 shadow-sm rounded-full p-1 flex items-center gap-1">
                <button
                    onClick={() => setActiveScenario('success')}
                    className={cn(
                        "px-3 py-1 rounded-full text-xs font-semibold transition-all",
                        activeScenario === 'success' ? "bg-green-100 text-green-700" : "text-gray-500 hover:bg-gray-100"
                    )}
                >
                    Success
                </button>
                <div className="w-px h-3 bg-gray-200"></div>
                <button
                    onClick={() => setActiveScenario('failure')}
                    className={cn(
                        "px-3 py-1 rounded-full text-xs font-semibold transition-all",
                        activeScenario === 'failure' ? "bg-amber-100 text-amber-700" : "text-gray-500 hover:bg-gray-100"
                    )}
                >
                    Failure
                </button>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center p-8 overflow-auto">
                {isMobile ? (
                    <div className="scale-[0.85] origin-center">
                        <PhoneFrame showStatusBar={true} dimBackground={false}>
                            <Container
                                headerTitle="Help"
                                className="bg-white h-[772px] w-[393px]"
                                viewport="mobile"
                                showHeaderPremiumIcon={isPremium}
                                showPremiumBorder={isPremium}
                            >
                                <PreviewContent flow={flow} activeScenario={activeScenario} />
                            </Container>
                        </PhoneFrame>
                    </div>
                ) : (
                    <Container
                        headerTitle="Help"
                        className="shadow-xl bg-white"
                        viewport="desktop"
                        showHeaderPremiumIcon={isPremium}
                        showPremiumBorder={isPremium}
                    >
                        <PreviewContent flow={flow} activeScenario={activeScenario} />
                    </Container>
                )}
            </div>
        </div>
    );
};


// Extracted content helper to avoid code duplication across viewports
const PreviewContent = ({ flow, activeScenario }: { flow: Flow, activeScenario: 'success' | 'failure' }) => {
    // Use new steps[] if available, otherwise fall back to old blocks[]
    const steps = flow.steps || [];
    const blocks = flow.blocks || [];

    // Render function for a single component
    const renderComponent = (component: import('./types').Component, key: string) => {
        const { type, content } = component;

        if (type === 'message') {
            const messageContent = content as import('./types').AIMessageContent;
            return (
                <Message
                    key={key}
                    variant="ai"
                    defaultText={<MarkdownRenderer>{messageContent.text || ''}</MarkdownRenderer>}
                />
            );
        }

        if (type === 'infoMessage') {
            const infoContent = content as import('./types').AIInfoContent;
            return (
                <InfoMessage
                    key={key}
                    title={infoContent.title}
                    sources={infoContent.sources?.map(s => ({
                        text: s.text,
                        href: s.url
                    }))}
                    onFeedbackChange={infoContent.showFeedback !== false ? () => { } : undefined}
                >
                    <MarkdownRenderer>{infoContent.body || ''}</MarkdownRenderer>
                </InfoMessage>
            );
        }

        if (type === 'actionCard') {
            const actionContent = content as import('./types').AIActionContent;
            return (
                <div key={key} className="py-2">
                    <SimulatedAction
                        loadingTitle={actionContent.loadingTitle}
                        successTitle={actionContent.successTitle}
                        successDescription={actionContent.successDescription}
                        failureTitle={actionContent.failureTitle}
                        failureDescription={actionContent.failureDescription}
                        scenario={activeScenario}
                    />
                </div>
            );
        }

        if (type === 'promptGroup') {
            const promptContent = content as import('./types').AIPromptGroupContent;
            return (
                <div key={key}>
                    {promptContent.title && (
                        <div className="text-sm text-gray-700 mb-2">
                            <MarkdownRenderer>{promptContent.title}</MarkdownRenderer>
                        </div>
                    )}
                    <PromptGroup
                        prompts={promptContent.prompts || []}
                    />
                </div>
            );
        }

        return null;
    };

    return (
        <div className="space-y-4 px-4 pt-4">
            {/* Disclaimer (Global) */}
            {flow.settings?.showDisclaimer && <Message variant="disclaimer" />}

            {/* Render from new steps[] structure */}
            {steps.length > 0 && steps.map((step) => {
                if (step.type === 'turn') {
                    const components = step.components;
                    // Group consecutive prompts together
                    const groupedComponents: Array<import('./types').Component | import('./types').Component[]> = [];
                    let currentPromptGroup: import('./types').Component[] = [];

                    components.forEach((component) => {
                        if (component.type === 'prompt') {
                            currentPromptGroup.push(component);
                        } else {
                            if (currentPromptGroup.length > 0) {
                                groupedComponents.push(currentPromptGroup);
                                currentPromptGroup = [];
                            }
                            groupedComponents.push(component);
                        }
                    });

                    // Don't forget the last group if it ends with prompts
                    if (currentPromptGroup.length > 0) {
                        groupedComponents.push(currentPromptGroup);
                    }

                    return (
                        <div key={step.id} className="flex flex-col gap-4">
                            {groupedComponents.map((item, index) => {
                                // If it's an array, it's a group of prompts
                                if (Array.isArray(item)) {
                                    const prompts = item.map(comp => {
                                        const promptContent = comp.content as import('./types').PromptContent;
                                        return {
                                            text: promptContent.text,
                                            showAiIcon: promptContent.showAiIcon
                                        };
                                    });
                                    return (
                                        <PromptGroup
                                            key={`prompt-group-${step.id}-${index}`}
                                            prompts={prompts}
                                        />
                                    );
                                }
                                // Otherwise render the single component
                                return renderComponent(item, `${step.id}-${index}`);
                            })}
                        </div>
                    );
                }
                return null;
            })}

            {/* Fallback: Render from old blocks[] structure */}
            {steps.length === 0 && blocks.map((block) => {
                // 1. AI Message Variants
                if (block.type === 'ai') {
                    const variant = block.variant;
                    let messageContent;

                    if (variant === 'info') {
                        const content = block.content as import('./types').AIInfoContent;
                        messageContent = (
                            <InfoMessage
                                title={content.title}
                                sources={content.sources?.map(s => ({
                                    text: s.text,
                                    href: s.url
                                }))}
                                onFeedbackChange={content.showFeedback !== false ? () => { } : undefined}
                            >
                                <MarkdownRenderer>{content.body || ''}</MarkdownRenderer>
                            </InfoMessage>
                        );
                    } else if (variant === 'action') {
                        const content = block.content as import('./types').AIActionContent;
                        return (
                            <div key={block.id} className="py-2">
                                <SimulatedAction
                                    loadingTitle={content.loadingTitle}
                                    successTitle={content.successTitle}
                                    successDescription={content.successDescription}
                                    failureTitle={content.failureTitle}
                                    failureDescription={content.failureDescription}
                                    scenario={activeScenario}
                                />
                            </div>
                        );

                    } else {
                        // Standard Message
                        const content = block.content as import('./types').AIMessageContent;
                        messageContent = (
                            <Message
                                variant="ai"
                                defaultText={<MarkdownRenderer>{content.text || ''}</MarkdownRenderer>}
                            />
                        );
                    }

                    return (
                        <div key={block.id} className="space-y-4">
                            {messageContent}
                            {block.metadata?.prompts && block.metadata.prompts.length > 0 && (
                                <PromptGroup
                                    prompts={block.metadata.prompts.map(p => ({ text: p }))}
                                />
                            )}
                        </div>
                    );
                }

                // 3. User Input
                if (block.type === 'user') {
                    const text = block.content;
                    return (
                        <div key={block.id} className="flex justify-end">
                            <Message
                                variant="user"
                                userText={text}
                            />
                        </div>
                    );
                }

                return null;
            })}

            {/* Thinking Indicator (Global) */}
            {flow.settings?.simulateThinking && (
                <Message
                    variant="ai"
                    isThinking={true}
                />
            )}
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
    scenario
}: {
    loadingTitle: string,
    successTitle: string,
    successDescription?: string,
    failureTitle?: string,
    failureDescription?: string,
    scenario: 'success' | 'failure'
}) => {
    const [status, setStatus] = useState<'in-progress' | 'success' | 'failure'>('in-progress');

    // Auto-transition effect
    useEffect(() => {
        setStatus('in-progress');
        const timer = setTimeout(() => {
            // Transition to the status dictated by the global scenario
            setStatus(scenario);
        }, 2000);

        return () => clearTimeout(timer);
    }, [scenario, loadingTitle, successTitle, failureTitle]);

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
