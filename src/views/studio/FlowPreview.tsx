// ... (imports)
import { useState, useEffect, useRef } from 'react';
import { Flow } from './types';
import { Container } from '@/components/vca-components/container/Container';
import { Message } from '@/components/vca-components/messages';
import { InfoMessage } from '@/components/vca-components/info-message/InfoMessage';
import { StatusCard } from '@/components/vca-components/status-card/StatusCard';
import { PromptGroup } from '@/components/vca-components/prompt-group/PromptGroup';
import { PhoneFrame } from '@/components/component-library/PhoneFrame';

import { InlineFeedback } from '@/components/vca-components/inline-feedback';
import { SelectionList } from '@/components/vca-components/selection-list/SelectionList';
import { CheckboxGroup } from '@/components/vca-components/checkbox-group/CheckboxGroup';
import { ContextInterceptorMessage } from './components/ContextInterceptorMessage';
import { useSmartFlowEngine } from '@/hooks/useSmartFlowEngine';


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
                        <div className="scale-[0.85] origin-center">
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
                                        onVariableUpdate={onVariableUpdate}
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
        resolveInterceptor
    } = useSmartFlowEngine({
        flow,
        variables,
        onVariableUpdate
    });


    // Report Status to Parent (Container)
    useEffect(() => {
        const isRunning = isThinking || isProcessingQueue || !!streamingComponentId;

        if (isRunning) {
            onStatusChange?.('stop', handleStop);
        } else {
            onStatusChange?.('default', undefined);
        }
    }, [isThinking, isProcessingQueue, streamingComponentId, onStatusChange, handleStop]);


    // REGISTER COMPOSER HANDLER
    useEffect(() => {
        onRegisterSend(() => {
            const input = composerValue.trim();
            if (!input) return;

            onComposerReset();
            handleSend(input);
        });
    }, [composerValue, handleSend, onComposerReset, onRegisterSend]);


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
                        stepId: string,
                        id: string
                    };

                    return (
                        <ContextInterceptorMessage
                            key={step.id}
                            variableName={interceptor.variableName}
                            branches={interceptor.branches}
                            onResolve={(value) => resolveInterceptor(
                                interceptor.stepId,
                                interceptor.variableName,
                                value,
                                interceptor.branches,
                                interceptor.id
                            )}
                        />
                    );
                }

                // 1. AI Turn
                if (step.type === 'turn') {
                    const components = step.components;

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
                                    className: !content.text ? "min-w-[120px]" : undefined
                                });
                                j++;
                            }

                            // Render the collected group
                            renderedComponents.push(
                                <div key={`prompt-group-${component.id}`} className="flex flex-wrap gap-2 animate-fade-in">
                                    <PromptGroup prompts={groupPrompts} />
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
                                    <Message
                                        key={component.id}
                                        variant="ai"
                                        defaultText={textToDisplay}
                                        className={!isStreaming ? "animate-fade-in" : ""}
                                    />
                                );
                            } else {
                                renderedComponents.push(
                                    <div key={component.id} className="animate-fade-in w-full h-[40px] bg-slate-100 rounded-lg border border-slate-200/50" />
                                );
                            }
                        }
                        else if (component.type === 'infoMessage') {
                            const content = component.content as import('./types').AIInfoContent;
                            const fullBody = content.body;
                            const bodyToDisplay = isStreaming ? currentStreamingText : fullBody;

                            if (fullBody || content.title) {
                                renderedComponents.push(
                                    <InfoMessage
                                        key={component.id}
                                        title={content.title}
                                        sources={content.sources?.map(s => ({ text: s.text, url: s.url }))}
                                        className={!isStreaming ? "animate-fade-in" : ""}
                                    >
                                        {bodyToDisplay}
                                    </InfoMessage>
                                );
                            } else {
                                renderedComponents.push(
                                    <div key={component.id} className="animate-fade-in w-full h-[60px] bg-slate-100 rounded-lg border border-slate-200/50" />
                                );
                            }
                        }
                        else if (component.type === 'statusCard') {
                            const content = component.content as import('./types').AIStatusContent;
                            renderedComponents.push(<SimulatedStatusCard key={component.id} content={content} />);
                        }
                        else if (component.type === 'selectionList') {
                            const content = component.content as import('./types').SelectionListContent;
                            renderedComponents.push(
                                <SelectionList
                                    key={component.id}
                                    items={content.items as any}
                                    layout={content.layout}
                                    className="animate-fade-in"
                                />
                            );
                        }
                        else if (component.type === 'checkboxGroup') {
                            const content = component.content as import('./types').CheckboxGroupContent;
                            renderedComponents.push(
                                <CheckboxGroup
                                    key={component.id}
                                    title={content.title}
                                    description={content.description}
                                    options={content.options}
                                    saveLabel={content.saveLabel}
                                    className="animate-fade-in"
                                />
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
                        <div key={`${step.id}-${historyIndex}`} className="flex justify-end animate-fade-in">
                            <Message
                                variant="user"
                                userText={userTurn.label}
                            />
                        </div>
                    );
                }

                return null;
            })}

            {/* Thinking Indicator */}
            {isThinking && (
                <div className="flex justify-start animate-fade-in">
                    <Message
                        variant="ai"
                        isThinking={true}
                    />
                </div>
            )}

            <div ref={messagesEndRef} className="h-4" />
        </div>
    );
};

// --- SIMULATED COMPONENT ---
const SimulatedStatusCard = ({ content }: { content: import('./types').AIStatusContent }) => {
    // Local state for simulation
    const [status, setStatus] = useState<'in-progress' | 'success'>('in-progress');

    useEffect(() => {
        // 1. Start with in-progress
        setStatus('in-progress');

        // 2. Wait 2 seconds (simulated API delay)
        const timer = setTimeout(() => {
            setStatus('success');
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    // 3. Render
    return (
        <div className="animate-fade-in">
            <StatusCard
                status={status}
                title={status === 'in-progress' ? (content.loadingTitle || "Processing...") : content.successTitle}
            >
                {status === 'success' && content.successDescription}
            </StatusCard>
        </div>
    );
};
