import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/vca-components/container';
import { Message } from '@/components/vca-components/messages';
import { PromptGroup } from '@/components/vca-components/prompt-group';
import { FlowEngine, Flow, FlowMessage } from '@/utils/flowEngine';

interface PreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    flowData: Flow | null;
}

export const PreviewModal = ({ isOpen, onClose, flowData }: PreviewModalProps) => {
    const [messages, setMessages] = useState<FlowMessage[]>([]);
    const [composerValue, setComposerValue] = useState('');
    const flowEngineRef = useRef<FlowEngine>(new FlowEngine());
    const contentRef = useRef<HTMLDivElement>(null);

    // Initialize flow when modal opens or flowData changes
    useEffect(() => {
        if (isOpen && flowData) {
            flowEngineRef.current.loadFlow(flowData);
            setMessages([...flowEngineRef.current.getMessages()]);
        } else {
            setMessages([]);
        }
    }, [isOpen, flowData]);

    // Auto-scroll
    useEffect(() => {
        if (contentRef.current) {
            contentRef.current.scrollTop = contentRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = () => {
        if (!composerValue.trim()) return;

        // Add user message
        const userMsg: FlowMessage = {
            stepId: `user-${Date.now()}`,
            type: 'user-message',
            text: composerValue,
        };

        // In a real engine, we'd pass this to the engine to decide next steps
        // For now, just show it. The engine in this project is simple and driven by buttons mostly.
        // If we wanted text input to trigger something, we'd need to update FlowEngine.

        setMessages(prev => [...prev, userMsg]);
        setComposerValue('');
    };

    const handleOptionClick = (label: string) => {
        flowEngineRef.current.handleButtonClick(label);
        setMessages([...flowEngineRef.current.getMessages()]);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md h-[600px] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white">
                    <h3 className="font-semibold text-gray-900">Preview Flow</h3>
                    <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
                        <X size={18} />
                    </Button>
                </div>

                {/* Chat Container */}
                <div className="flex-1 overflow-hidden relative bg-stone-50">
                    <Container
                        headerTitle="Preview"
                        viewport="mobile"
                        contentRef={contentRef}
                        composerValue={composerValue}
                        onComposerChange={setComposerValue}
                        onComposerSend={handleSendMessage}
                        hideHeader={true} // We have our own modal header
                    >
                        <div className="flex flex-col gap-4 px-4 py-4">
                            {messages.map((msg, index) => {
                                if (msg.type === 'ai-message') {
                                    return (
                                        <div key={index} className="flex flex-col gap-2">
                                            <Message type="ai" defaultText={msg.text} />
                                            {msg.buttons && msg.buttons.length > 0 && (
                                                <PromptGroup
                                                    prompts={msg.buttons.map(btn => ({
                                                        text: btn.label,
                                                        showAiIcon: false,
                                                        onClick: () => handleOptionClick(btn.label)
                                                    }))}
                                                />
                                            )}
                                        </div>
                                    );
                                }
                                if (msg.type === 'user-message') {
                                    return <Message key={index} type="user" userText={msg.text} />;
                                }
                                return null;
                            })}
                        </div>
                    </Container>
                </div>
            </div>
        </div>
    );
};
