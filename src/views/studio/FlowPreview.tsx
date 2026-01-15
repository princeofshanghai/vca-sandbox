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
        <div className="h-full flex flex-col relative bg-gray-100">
            {/* No local Toolbar Overlay anymore - controlled by Main Toolbar */}

            <div className="flex-1 flex flex-col items-center justify-center p-8 overflow-auto">
                {isMobile ? (
                    // Mobile View - Wrapped in Shared PhoneFrame
                    // Scale down slightly to ensure it fits on smaller laptop screens
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
                ) : (
                    // Desktop
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


// Extracted content helper to avoid code duplication across viewports
const PreviewContent = ({ flow }: { flow: Flow }) => (
    <div className="space-y-4 px-4 pt-4">
        {/* Disclaimer (Global) */}
        {flow.settings?.showDisclaimer && <Message variant="disclaimer" />}

        {flow.blocks.map((block) => {
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
                    // Action is now a variant of AI block
                    const content = block.content as import('./types').AIActionContent;
                    return (
                        <div key={block.id} className="py-2">
                            <SimulatedAction
                                loadingTitle={content.loadingTitle}
                                successTitle={content.successTitle}
                                successDescription={content.successDescription}
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
                // Reverted to simple string access for compatibility with old types.ts
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

// Simulated Action Component
// Handles the visual transition from "In Progress" -> "Success"
const SimulatedAction = ({ loadingTitle, successTitle, successDescription }: {
    loadingTitle: string,
    successTitle: string,
    successDescription?: string
}) => {
    const [status, setStatus] = useState<'in-progress' | 'success'>('in-progress');

    // Auto-transition effect
    useEffect(() => {
        // Reset to in-progress when props change (re-run simulation)
        setStatus('in-progress');

        const timer = setTimeout(() => {
            setStatus('success');
        }, 2500); // 2.5s simulated delay

        return () => clearTimeout(timer);
    }, [loadingTitle, successTitle]);

    return (
        <ActionCard
            status={status}
            title={status === 'in-progress' ? loadingTitle : successTitle}
        >
            {
                status === 'success' && successDescription ? (
                    <MarkdownRenderer>{successDescription}</MarkdownRenderer>
                ) : ''
            }
        </ActionCard>
    );
};
