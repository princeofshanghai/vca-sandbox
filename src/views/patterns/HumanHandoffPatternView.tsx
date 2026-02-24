import { useState, useEffect, useRef } from 'react';
import { PatternPage, PatternSection, GuidelineGrid, ExampleShowcase } from './components';
import { Message } from '@/components/vca-components/messages';
import { Container } from '@/components/vca-components/container/Container';
import { AgentStatus } from '@/components/vca-components/agent-status/AgentStatus';
import { AgentBanner } from '@/components/vca-components/agent-banner/AgentBanner';
import { PromptGroup } from '@/components/vca-components/prompt-group/PromptGroup';
import { Divider } from '@/components/vca-components/divider/Divider';
import { ThinkingIndicator } from '@/components/vca-components/thinking-indicator/ThinkingIndicator';


const HumanHandoffPatternView = () => {
    return (
        <PatternPage
            title="Connecting to a Live Agent"
            description="When AI hits its limit, we don't just stop—we elevate. The handoff to a human agent should feel like a seamless continuation of the conversation, not a jarring restart."
            relatedComponents={[
                { label: 'Agent Status', path: '/components/agent-status' },
                { label: 'Agent Banner', path: '/components/agent-banner' },
                { label: 'Message', path: '/components/message' },
                { label: 'Container', path: '/components/container' }
            ]}
        >
            {/* 1. The Handoff Lifecycle */}
            <div className="border-b border-shell-border pb-16">
                <h2 id="lifecycle" className="scroll-mt-24 mb-4">The Handoff Lifecycle</h2>
                <p className="text-shell-muted mb-10 max-w-3xl text-lg">
                    Moving from AI to a human involves three critical moments: Confirmation, Waiting, and Connection. Each step needs to reassure the user they're still on the right path.
                </p>

                <div className="space-y-16">
                    <PatternSection
                        title="1. Confirm Intent"
                        description="Connecting to a human is 'expensive' for the user (wait times) and the business. Always verify they actually want a human before queueing them."
                    >
                        <></>
                    </PatternSection>
                    <PatternSection
                        title="2. Manage Expectations"
                        description="Once verified, show them we're working on it. The Agent Status component acts as a bridge, letting them know they are in line."
                    >
                        <></>
                    </PatternSection>
                    <PatternSection
                        title="3. Establish Presence"
                        description="When the agent joins, the UI changes state. The Agent Banner pins to the top to remind the user: 'You are now speaking to a real person.'"
                    >
                        <></>
                    </PatternSection>
                </div>
            </div>

            {/* 2. Realistic Example */}
            <div className="border-b border-shell-border pb-16">
                <h2 id="example" className="scroll-mt-24 mb-4">In Practice</h2>
                <p className="text-shell-muted mb-10 max-w-3xl text-lg">
                    Here's how those pieces come together in a real conversation.
                </p>

                <ExampleShowcase
                    title="EXAMPLE: HUMAN HANDOFF FLOW"
                    rationale={[
                        "Confirms intent before connecting.",
                        "Uses Agent Status to show queue progress.",
                        "Pins Agent Banner to top once connected so the mode is clear.",
                        "Agent introduces themselves naturally."
                    ]}
                >
                    <LiveAgentDemo />
                </ExampleShowcase>
            </div>

            {/* 3. Guidelines */}
            <div>
                <h2 id="guidelines" className="scroll-mt-24 mb-4">Guidelines</h2>
                <div className="mt-8">
                    <GuidelineGrid
                        dos={[
                            "Always confirm the user wants a human before connecting.",
                            "Use the Agent Status component to show system state.",
                            "Keep the chat history visible so the agent has context.",
                            "Clearly mark the start and end of the live session."
                        ]}
                        donts={[
                            "Don't blindly transfer users based on keywords like 'person'.",
                            "Don't leave the user guessing if they are connected or not.",
                            "Don't make the user repeat information they just told the AI."
                        ]}
                    />
                </div>
            </div>
        </PatternPage>
    );
};

// Interactive Demo Component
const LiveAgentDemo = () => {
    const [step, setStep] = useState<'initial' | 'confirming' | 'connecting' | 'connected'>('initial');
    const [inputValue, setInputValue] = useState('');

    const [isThinking, setIsThinking] = useState(false);
    const [messages, setMessages] = useState<Record<string, unknown>[]>([
        { variant: 'ai', defaultText: "Hi there. With the help of AI, I can answer questions about Recruiter solutions or connect you to our team." },
        { variant: 'ai', defaultText: "Not sure where to start? You can try:" },
        {
            type: 'prompts',
            items: [
                { text: "How do I find my InMail credits?" },
                { text: "How can admins manage permissions for other admins?" },
                { text: "Help me remove a user" }
            ]
        }
    ]);
    const bottomRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }, [messages, step, isThinking]);

    // Handle user input from Composer
    const handleSend = () => {
        if (!inputValue.trim()) return;

        const userText = inputValue;
        setInputValue(''); // Clear input

        // Add user message immediately
        setMessages(prev => [
            ...prev,
            { variant: 'user', userText: userText, className: "flex justify-end" }
        ]);

        // Logic for keyword detection
        const lowerText = userText.toLowerCase();

        // 1. Check for intent to talk to human
        if (step === 'initial' && (lowerText.includes('agent') || lowerText.includes('human') || lowerText.includes('person') || lowerText.includes('support') || lowerText.includes('speak') || lowerText.includes('talk'))) {
            setIsThinking(true);
            setTimeout(() => {
                setIsThinking(false);
                setStep('confirming');
                setMessages(prev => [
                    ...prev,
                    { variant: 'ai', defaultText: "Would you like to speak with a member of our team?" }
                ]);
            }, 1000);
            return;
        }

        // 2. Check for confirmation (yes/sure/ok)
        if (step === 'confirming' && (lowerText.includes('yes') || lowerText.includes('sure') || lowerText.includes('ok') || lowerText.includes('please') || lowerText.includes('connect'))) {
            handleConfirm();
            return;
        }

        // Default fallback if no keyword match
        if (step === 'initial') {
            setIsThinking(true);
            setTimeout(() => {
                setIsThinking(false);
                setMessages(prev => [
                    ...prev,
                    { variant: 'ai', defaultText: "I can help with that. But if you'd prefer, I can connect you to a live agent. Just let me know if you'd like to speak to a person." }
                ]);
            }, 1000);
        }
    };



    const handleConfirm = () => {
        setStep('connecting');
        setMessages(prev => [
            ...prev,
            { variant: 'user', userText: "Yes, connect me", className: "flex justify-end" },
            // We don't add a text message here, the AgentStatus will appear
        ]);

        // Simulate connection delay
        setTimeout(() => {
            setStep('connected');
            setMessages(prev => [
                ...prev,
                {
                    variant: 'human-agent',
                    humanAgentText: "Hi there! My name is John. I see you're having some trouble. How can I help you today?",
                    agentName: "John",
                    agentTimestamp: "10:42 AM"
                }
            ]);
        }, 3000);
    };

    const resetDemo = () => {
        setStep('initial');
        setMessages([
            { variant: 'ai', defaultText: "Hi there. With the help of AI, I can answer questions about Recruiter solutions or connect you to our team." },
            { variant: 'ai', defaultText: "Not sure where to start? You can try:" },
            {
                type: 'prompts',
                items: [
                    { text: "How do I find my InMail credits?" },
                    { text: "How can admins manage permissions for other admins?" },
                    { text: "Help me remove a user" }
                ]
            }
        ]);
    };

    return (
        <div className="flex flex-col">
            <Container
                headerTitle="Help"
                className="shadow-sm relative overflow-hidden flex flex-col"
                viewport="desktop"
                composerValue={inputValue}
                onComposerChange={setInputValue}
                onComposerSend={handleSend}
            >
                {/* Agent Banner - Only visible when connected */}
                {step === 'connected' && (
                    <div className="absolute top-[57px] left-0 right-0 z-10 animate-slide-down border-t border-vca-border-faint">
                        <AgentBanner
                            agentName="John"
                            onEndChat={resetDemo}
                            className="border-b border-vca-border-faint"
                        />
                    </div>
                )}

                <div className={`flex-1 overflow-y-auto ${step === 'connected' ? 'pt-[72px]' : ''}`}>
                    <div className="space-y-vca-lg px-4 pt-4 pb-4">
                        <Message variant="disclaimer" />

                        {/* Messages before success status */}
                        {/* Messages before success status */}
                        {messages.slice(0, messages.length - (step === 'connected' ? 1 : 0)).map((msg, idx) => {
                            if (msg.type === 'prompts') {
                                return (
                                    <div key={idx} className="-mt-4 mb-4">
                                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                        <PromptGroup prompts={msg.items as any} />
                                    </div>
                                );
                            }
                            return <Message key={idx} {...msg} />;
                        })}

                        {/* Thinking Indicator */}
                        {isThinking && (
                            <Message variant="ai" defaultText={<ThinkingIndicator />} />
                        )}

                        {/* Connected Status (Success) - appears before the agent message */}
                        {step === 'connected' && (
                            <div className="mb-6 animate-fade-in">
                                <Divider text="LIVE CHAT" className="mb-6" />
                                <AgentStatus
                                    state="success"
                                    agentName="John"
                                />
                            </div>
                        )}

                        {/* Agent message (last message if connected) */}
                        {step === 'connected' && (
                            <Message {...messages[messages.length - 1]} />
                        )}

                        {/* Interactive Steps */}

                        {/* 2. Confirmation options */}
                        {step === 'confirming' && (
                            <div className="animate-fade-in -mt-4 mb-4">
                                <PromptGroup
                                    prompts={[
                                        { text: "Yes, please connect me", onClick: handleConfirm },
                                        { text: "No, keep chatting with AI" }
                                    ]}
                                />
                            </div>
                        )}

                        {/* 3. Connecting Status */}
                        {step === 'connecting' && (
                            <div className="animate-fade-in">
                                <AgentStatus
                                    state="connecting"
                                    statusLabel="You are next in line"
                                    description="A member of our team will be with you shortly."
                                />
                            </div>
                        )}



                        {/* Scroll anchor */}
                        <div ref={bottomRef} />

                    </div>
                </div>
            </Container>

            {/* Reset Controls */}
            <div className="text-center mt-4">
                <button
                    onClick={resetDemo}
                    className="text-xs text-shell-muted hover:text-shell-muted underline"
                >
                    Reset Demo
                </button>
            </div>
        </div>
    );
};

export default HumanHandoffPatternView;
