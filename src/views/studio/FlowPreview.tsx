import { useState, useEffect } from 'react';
import { Flow } from './types';
import { Container } from '@/components/vca-components/container/Container';
import { Message } from '@/components/vca-components/messages';
import { InfoMessage } from '@/components/vca-components/info-message/InfoMessage';
import { ActionStatus } from '@/components/vca-components/action-status/ActionStatus';
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
        {flow.settings?.showDisclaimer && <Message type="disclaimer" />}



        {flow.blocks.map((block) => {
            // 1. AI Message Variants
            if (block.type === 'message') {
                let messageContent;

                if (block.variant === 'info') {
                    messageContent = (
                        <InfoMessage
                            title={block.content.title}
                            message={<MarkdownRenderer>{block.content.body || ''}</MarkdownRenderer>}
                            showRating={block.content.showFeedback !== false}
                            showSources={!!block.content.sources?.length}
                            sources={block.content.sources?.map(s => ({
                                text: s.text,
                                href: s.url
                            }))}
                        />
                    );
                } else {
                    // Standard
                    messageContent = (
                        <Message
                            type="ai"
                            defaultText={<MarkdownRenderer>{block.content.text || ''}</MarkdownRenderer>}
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

            // 2. Action (Simulated System Status)
            if (block.type === 'action') {
                return (
                    <div key={block.id} className="py-2">
                        <SimulatedAction
                            loadingTitle={block.content.loadingTitle}
                            successTitle={block.content.successTitle}
                            successDescription={block.content.successDescription}
                        />
                    </div>
                );
            }

            // 3. User Input
            if (block.type === 'user-input') {
                return (
                    <div key={block.id} className="flex justify-end">
                        <Message
                            type="user"
                            userText={typeof block.content === 'string' ? block.content : ''}
                        />
                    </div>
                );
            }

            // 4. Handoff
            if (block.type === 'handoff') {
                return (
                    <div key={block.id} className="my-6 flex flex-col items-center justify-center p-6 bg-gray-50 border border-gray-200 rounded-xl text-center space-y-2">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 mb-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </div>
                        <h4 className="font-semibold text-gray-900 text-sm">Transferred to Support</h4>
                        <p className="text-xs text-gray-500 max-w-[200px]">{block.content as string || "Connecting you to an agent..."}</p>
                    </div>
                );
            }
            return null;
        })}

        {/* Thinking Indicator (Global) */}
        {flow.settings?.simulateThinking && (
            <Message
                type="ai"
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
        <ActionStatus
            status={status}
            title={status === 'in-progress' ? loadingTitle : successTitle}
            description={
                status === 'success' && successDescription ? (
                    <MarkdownRenderer>{successDescription}</MarkdownRenderer>
                ) : ''
            }
        />
    );
};
