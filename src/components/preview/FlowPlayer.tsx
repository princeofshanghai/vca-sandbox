import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { Container, ContainerViewport } from '@/components/vca-components/container';
import { Button } from '@/components/ui/button';
import { AppIcon } from '@/components/app-shell/AppIcon';
import { PhoneFrame } from '@/components/component-library/PhoneFrame';
import { Message } from '@/components/vca-components/messages';
import { PromptGroup } from '@/components/vca-components/prompt-group';
import { AgentStatus } from '@/components/vca-components/agent-status';
import { Divider } from '@/components/vca-components/divider';
import { ThinkingIndicator } from '@/components/vca-components/thinking-indicator';
import { FlowEngine, type Flow, type FlowMessage } from '@/utils/flowEngine';
import { SmartFlowEngine, EngineMessage } from '@/utils/smartFlowEngine';
import { detectAgentIntent } from '@/utils/flowSimulation';
import { Node, Edge } from '@xyflow/react';

interface FlowPlayerProps {
    flowData?: Flow | null; // Legacy support
    nodes?: Node[]; // New Smart Flow support
    edges?: Edge[];
    viewport?: ContainerViewport;
    onViewportChange?: (viewport: ContainerViewport) => void;
    initialMessages?: FlowMessage[];
    onRestart?: () => void;
    className?: string;
    isMobile?: boolean;
}

export const FlowPlayer = ({
    flowData,
    nodes,
    edges,
    viewport = 'desktop',
    initialMessages = [],
    onRestart,
    className = ''
}: FlowPlayerProps) => {
    const [displayedMessages, setDisplayedMessages] = useState<FlowMessage[]>([]);
    const [flowMessages, setFlowMessages] = useState<FlowMessage[]>([]);
    const [isThinking, setIsThinking] = useState(false);
    const [hasInteracted, setHasInteracted] = useState(false);
    const [composerValue, setComposerValue] = useState('');
    const [isFlowActive, setIsFlowActive] = useState(false);


    // We can use either engine. For Concept B, we prioritize SmartFlowEngine if nodes are present.
    const smartEngineRef = useRef<SmartFlowEngine | null>(null);
    // Legacy engine ref (keeping just in case needed for fallback, but ideally we switch)
    const legacyEngineRef = useRef<FlowEngine>(new FlowEngine());

    const contentRef = useRef<HTMLDivElement>(null);
    const isRevealingRef = useRef(false);

    // Progressive reveal: Show messages one at a time with delays
    const revealMessagesProgressively = async (allMessages: FlowMessage[], startFrom: number = 0) => {
        // Prevent multiple reveals at once
        if (isRevealingRef.current) return;
        isRevealingRef.current = true;

        for (let i = startFrom; i < allMessages.length; i++) {
            const message = allMessages[i];

            // Show thinking indicator before non-user messages
            if (message.type !== 'user-message') {
                setIsThinking(true);
                // Wait a bit (simulate typing) - Faster now (500ms)
                await new Promise(resolve => setTimeout(resolve, 500));
                setIsThinking(false);
            }

            // Add this message to displayed messages
            setDisplayedMessages(allMessages.slice(0, i + 1));

            // Special timing for agent-status-connecting: wait 1.5 seconds (was 2.5s)
            if (message.type === 'agent-status-connecting') {
                await new Promise(resolve => setTimeout(resolve, 1500));
            } else if (i < allMessages.length - 1) {
                // Small pause before next message (was 300ms)
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }

        isRevealingRef.current = false;
    };



    // Initialize (Unified Effect)
    useEffect(() => {
        // Reset
        setIsThinking(false);
        isRevealingRef.current = false;
        setIsFlowActive(false);
        setDisplayedMessages([]);
        setFlowMessages([]);

        if (nodes && edges && nodes.length > 0) {
            // Smart Flow Mode
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            smartEngineRef.current = new SmartFlowEngine(nodes as any, edges);
            const startMsgs = smartEngineRef.current.start();
            setFlowMessages(mapSmartMessagesToFlowMessages(startMsgs));
        }
        else if (flowData) {
            // Legacy Mode
            legacyEngineRef.current.loadFlow(flowData);
            setFlowMessages(legacyEngineRef.current.getMessages());
        }
        else {
            setDisplayedMessages(initialMessages);
        }
    }, [nodes, edges, flowData, initialMessages]);

    // Helper to map EngineMessage (Smart) -> FlowMessage (Legacy UI)
    const mapSmartMessagesToFlowMessages = (msgs: EngineMessage[]): FlowMessage[] => {
        return msgs.map(m => ({
            stepId: m.id,
            type: m.component ? 'ai-message' : 'ai-message', // Simplify for now, usually ai-message
            text: m.text || '',
            // If component is present, we might want to render it specially. 
            // For now, FlowPlayer is expecting text/buttons.
            // If component is InfoMessage, we might put it in text or need a new Type.
            // Let's assume text for now or hack it.
            // Actually, we can pass `component` through if we extend FlowMessage type or handle it in UI.
            buttons: m.buttons?.map(b => ({ label: b.label, nextStep: '' }))
        }));
    };

    // Reveal new messages when flowMessages changes
    useEffect(() => {
        if (flowMessages.length > displayedMessages.length) {
            revealMessagesProgressively(flowMessages, displayedMessages.length);
        }
    }, [flowMessages, displayedMessages.length]);

    // Auto-scroll using useLayoutEffect to prevent flickering (scrolls before paint)
    useLayoutEffect(() => {
        if (contentRef.current) {
            contentRef.current.scrollTop = contentRef.current.scrollHeight;
        }
    }, [displayedMessages, isThinking]);

    // Handle interactions
    const handleFlowButtonClick = (buttonLabel: string) => {
        setHasInteracted(true);

        if (smartEngineRef.current) {
            // Smart Engine Button Click (treat as input)
            const msgs = smartEngineRef.current.handleInput(buttonLabel);
            const mapped = mapSmartMessagesToFlowMessages(msgs);
            // Append? Smart Engine `handleInput` returns NEW messages.
            // We need to keep track of history or append.
            // `setFlowMessages` in `useEffect` for reveal handles diffing?
            // Actually `revealMessagesProgressively` expects the FULL list or we append.
            // Legacy engine `getMessages()` returns FULL list.
            // My SmartEngine implementation `handleInput` returned only NEW messages.
            // I should stick to one pattern. 
            // Let's update SmartEngine locally or accumulate here.
            setFlowMessages(prev => [...prev, ...mapped]);
        }
        else if (flowData) {
            legacyEngineRef.current.handleButtonClick(buttonLabel);
            setFlowMessages([...legacyEngineRef.current.getMessages()]);
        } else {
            // Fallback for "hardcoded" playground behavior if we aren't using a real Flow object yet
            // In the original code, it just triggered next steps. 
            // For the unified studio, we assume we ARE using Flow objects mostly.
            // But for the "Connect to live agent" demo which might be hardcoded in 'flowSimulation', we need to handle it.
            // For now, let's assume if flowData is null, we can't really do much unless we implement the hardcoded logic here.
            // I will keep the hardcoded logic for the demo flow if it's not passed as flowData.

            // Actually, the original 'connect-to-live-agent' flow was NOT in JSON, it was hardcoded in `handleFlowButtonClick`?
            // Wait, looking at `FlowPreviewView.tsx`:
            // It says `flowEngineRef.current.handleButtonClick(buttonLabel)`
            // This implies `connect-to-live-agent` WAS loaded into the engine?
            // Let's check `FlowPreviewView` again.
            // `useEffect` -> `setDisplayedMessages(initialMessages)`
            // It does NOT seem to load a flow into engine for the default case!
            // The default case seems to be just the initial messages?
            // And `handleFlowButtonClick` calls `flowEngineRef.current.handleButtonClick`.
            // If `flowEngineRef` is empty, it does nothing.
            // The original code `FlowPreviewView.tsx` L126 calls `flowEngineRef.current.handleButtonClick`.
            // But I don't see where `loadFlow` is called in `FlowPreviewView.tsx`!
            // The engine might be empty!
            // Ah, `FlowPreviewView.tsx` L83 sets `initialMessages`.
            // It seems the "Connect to live agent" flow is purely "User types something -> Agent connects".
            // The buttons in `initialMessages` (L93) just have `nextStep: ''`.
            // So clicking them might do nothing in the engine?
            // Let's assume for the Studio we mostly care about the engine, but I'll add the manual "SendMessage" logic below.
        }
    };

    const handleSendMessage = async () => {
        if (!composerValue.trim() || isRevealingRef.current) return;

        const userMessage = composerValue.trim();
        setComposerValue('');
        setHasInteracted(true);

        // Add user message to chat
        const newUserMessage: FlowMessage = {
            stepId: `user-${Date.now()}`,
            type: 'user-message',
            text: userMessage,
        };

        setDisplayedMessages(prev => [...prev, newUserMessage]);

        // Auto-scroll after user message
        setTimeout(() => {
            if (contentRef.current) {
                contentRef.current.scrollTop = contentRef.current.scrollHeight;
            }
        }, 100);

        // If we have a Flow loaded, we might want to check if it reacts to text (not implemented in FlowEngine yet).
        // But the "Connect to Agent" logic was manual. I will preserve it here.

        // Check if asking for agent (Global Override)
        if (detectAgentIntent(userMessage) && !isFlowActive) {
            setIsFlowActive(true);

            // Wait a moment, then start showing connecting status
            await new Promise(resolve => setTimeout(resolve, 500));

            // Show disclaimer first
            const disclaimerMsg: FlowMessage = {
                stepId: 'disclaimer',
                type: 'disclaimer',
                text: '',
            };
            setDisplayedMessages(prev => [...prev, disclaimerMsg]);
            await new Promise(resolve => setTimeout(resolve, 300));

            // Auto-scroll
            setTimeout(() => { if (contentRef.current) contentRef.current.scrollTop = contentRef.current.scrollHeight; }, 100);

            // Show connecting status
            const connectingMsg: FlowMessage = {
                stepId: 'connecting',
                type: 'agent-status-connecting',
                text: "You're next in line",
                description: "A member of our team will join the chat soon.",
            };
            setDisplayedMessages(prev => [...prev, connectingMsg]);

            setTimeout(() => { if (contentRef.current) contentRef.current.scrollTop = contentRef.current.scrollHeight; }, 100);

            // Wait for connection (2.5 seconds)
            await new Promise(resolve => setTimeout(resolve, 2500));

            // Show connected status
            const connectedMsg: FlowMessage = {
                stepId: 'connected',
                type: 'agent-status-connected',
                text: "Sarah has joined the chat",
                agentName: "Sarah, LinkedIn Support",
            };
            setDisplayedMessages(prev => [...prev, connectedMsg]);

            setTimeout(() => { if (contentRef.current) contentRef.current.scrollTop = contentRef.current.scrollHeight; }, 100);

            await new Promise(resolve => setTimeout(resolve, 500));

            // Show agent's first message
            const agentMsg: FlowMessage = {
                stepId: 'agent-message',
                type: 'human-agent-message',
                text: "Hi! I'm Sarah, how can I help you today?",
                agentName: "Sarah, LinkedIn Support",
                timestamp: "2:34 PM",
            };
            setDisplayedMessages(prev => [...prev, agentMsg]);

            setTimeout(() => { if (contentRef.current) contentRef.current.scrollTop = contentRef.current.scrollHeight; }, 100);

        } else if (smartEngineRef.current) {
            const msgs = smartEngineRef.current.handleInput(userMessage);
            const mapped = mapSmartMessagesToFlowMessages(msgs);
            setFlowMessages(prev => [...prev, ...mapped]);
        } else if (flowData) {
            // Attempt to handle input via Logic Engine
            const handled = legacyEngineRef.current.handleUserInput(userMessage);
            if (handled) {
                setFlowMessages([...legacyEngineRef.current.getMessages()]);
            } else {
                // Fallback if not handled by flow keywords
                // Maybe show a generic "I didn't understand" or just silence?
                // For legacy parity, we check isFlowActive override above.
                // If we are here, no keyword matched. 
                setIsThinking(true);
                await new Promise(resolve => setTimeout(resolve, 1000));
                setIsThinking(false);

                const aiResponse: FlowMessage = {
                    stepId: `fallback-${Date.now()}`,
                    type: 'ai-message',
                    text: "I didn't catch that. Try using one of the keywords defined in the flow, or ask to speak to an agent.",
                };
                setDisplayedMessages(prev => [...prev, aiResponse]);
                setTimeout(() => { if (contentRef.current) contentRef.current.scrollTop = contentRef.current.scrollHeight; }, 100);
            }
        } else if (!isFlowActive && !flowData) {
            // Generic AI response for non-agent queries (only if NO flow loaded)
            setIsThinking(true);
            await new Promise(resolve => setTimeout(resolve, 1000));
            setIsThinking(false);

            const aiResponse: FlowMessage = {
                stepId: `ai-${Date.now()}`,
                type: 'ai-message',
                text: "I understand you have a question. I'm here to help with Premium products. If you'd like to speak with a live agent, just let me know!",
            };

            setDisplayedMessages(prev => [...prev, aiResponse]);

            setTimeout(() => { if (contentRef.current) contentRef.current.scrollTop = contentRef.current.scrollHeight; }, 100);
        }
    };

    const handleManualRestart = () => {
        // Reset local state
        setHasInteracted(false);
        setIsThinking(false);
        setComposerValue('');
        setIsFlowActive(false);
        isRevealingRef.current = false;
        setFlowMessages([]);

        // Reset displayed messages
        if (smartEngineRef.current) {
            // Restart Smart Engine
            const msgs = smartEngineRef.current.start();
            setFlowMessages(mapSmartMessagesToFlowMessages(msgs));
            setDisplayedMessages([]);
        }
        else if (flowData) {
            // If flow data, reload it
            legacyEngineRef.current.loadFlow(flowData);
            // This will trigger the useEffect to setFlowMessages -> reveal
            setFlowMessages(legacyEngineRef.current.getMessages());
            setDisplayedMessages([]); // Clear so reveal happens
        } else {
            // If no flow data, use initial messages
            setDisplayedMessages(initialMessages);
        }

        if (onRestart) onRestart();
    };

    const renderChatContent = () => {
        // Separate disclaimers from other messages - disclaimers go first
        const disclaimers = displayedMessages.filter(msg => msg.type === 'disclaimer');
        let otherMessages = displayedMessages.filter(msg => msg.type !== 'disclaimer');

        // If agent is connected, hide the connecting message (only show minimal connected state)
        const hasConnectedMessage = otherMessages.some(msg => msg.type === 'agent-status-connected');
        if (hasConnectedMessage) {
            otherMessages = otherMessages.filter(msg => msg.type !== 'agent-status-connecting');
        }

        return (
            <div className="flex flex-col gap-vca-lg px-vca-lg">
                {disclaimers.map((_msg, index) => (
                    <Message key={`disclaimer-${index}`} type="disclaimer" />
                ))}

                {otherMessages.map((msg, index) => {
                    if (msg.type === 'ai-message') {
                        return (
                            <div key={index} className="flex flex-col gap-vca-s">
                                <Message type="ai" defaultText={msg.text} />
                                {msg.buttons && msg.buttons.length > 0 && (
                                    <PromptGroup
                                        prompts={msg.buttons.map(btn => ({
                                            text: btn.label,
                                            showAiIcon: false,
                                            onClick: () => handleFlowButtonClick(btn.label)
                                        }))}
                                    />
                                )}
                            </div>
                        );
                    }

                    if (msg.type === 'user-message') {
                        return <Message key={index} type="user" userText={msg.text} />;
                    }

                    if (msg.type === 'human-agent-message') {
                        return (
                            <Message
                                key={index}
                                type="human-agent"
                                humanAgentText={msg.text}
                                showTimestamp={true}
                                agentTimestampText={msg.agentName && msg.timestamp ? `${msg.agentName}  ${msg.timestamp}` : undefined}
                            />
                        );
                    }

                    if (msg.type === 'agent-status-connecting') {
                        return (
                            <AgentStatus
                                key={index}
                                state="connecting"
                                statusLabel={msg.text}
                                description={msg.description}
                                showDescription={true}
                                showAction={true}
                                actionLabel="Cancel"
                            />
                        );
                    }

                    if (msg.type === 'agent-status-connected') {
                        const firstName = msg.agentName?.split(',')[0] || 'Agent';
                        return (
                            <div key={index} className="flex flex-col gap-vca-lg">
                                <Divider text="LIVE CHAT" />
                                <AgentStatus
                                    state="success"
                                    agentName={firstName}
                                />
                            </div>
                        );
                    }

                    if (msg.type === 'agent-status') {
                        return <AgentStatus key={index} statusLabel={msg.text} />;
                    }
                    return null;
                })}

                {isThinking && (
                    <div className="flex items-start gap-vca-s">
                        <ThinkingIndicator />
                    </div>
                )}
            </div>
        );
    };

    const RestartButton = () => (
        (hasInteracted || displayedMessages.length > initialMessages.length) ? (
            <Button onClick={handleManualRestart} variant="outline" size="sm" className="mb-2">
                <AppIcon icon="restart" size="sm" />
                Restart
            </Button>
        ) : null
    );

    // Mobile View
    if (viewport === 'mobile') {
        return (
            <div className={`w-full h-full flex items-center justify-center ${className}`}>
                <div className="flex flex-col items-center gap-2">
                    <RestartButton />
                    <div className="scale-[0.85] origin-top">
                        <PhoneFrame showStatusBar={true} dimBackground={true}>
                            <Container
                                headerTitle="Help"
                                viewport="mobile"
                                contentRef={contentRef}
                                composerValue={composerValue}
                                onComposerChange={setComposerValue}
                                onComposerSend={handleSendMessage}
                            >
                                {renderChatContent()}
                            </Container>
                        </PhoneFrame>
                    </div>
                </div>
            </div>
        );
    }

    // Desktop View
    // If we are in "Preview Mode" of builder, we might not want the "absolute bottom-4 right-4" positioning 
    // if we want it centered. But "Flow Preview" page had it bottom-right.
    // The user requested: "When I preview it... toggle between Desktop vs. Mobile".
    // For desktop, it should probably look like the actual widget on desktop (bottom right).
    // But inside a "Preview Mode" container, maybe we just want it to sit there?
    // Let's keep the positioning logic flexible.
    // I will make the container mostly fill the space, and the chat widget position absolute within it.

    return (
        <div className={`relative w-full h-full ${className}`}>
            <div className="absolute bottom-10 right-10 flex flex-col items-center gap-3">
                <RestartButton />
                <Container
                    headerTitle="Help"
                    viewport="desktop"
                    contentRef={contentRef}
                    composerValue={composerValue}
                    onComposerChange={setComposerValue}
                    onComposerSend={handleSendMessage}
                >
                    {renderChatContent()}
                </Container>
            </div>
        </div>
    );
};
