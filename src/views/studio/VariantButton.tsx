import { AIBlockVariant } from './types';
import { cn } from '@/utils/cn';
import * as HoverCard from '@radix-ui/react-hover-card';
import { Message } from '@/components/vca-components/messages/Message';
import { InfoMessage } from '@/components/vca-components/info-message/InfoMessage';
import { StatusCard } from '@/components/vca-components/status-card/StatusCard';

interface VariantButtonProps {
    variant: AIBlockVariant;
    isSelected: boolean;
    onClick: () => void;
}

export const VariantButton = ({ variant, isSelected, onClick }: VariantButtonProps) => {
    return (
        <HoverCard.Root openDelay={200} closeDelay={100}>
            <HoverCard.Trigger asChild>
                <button
                    onClick={onClick}
                    className={cn(
                        "flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-full border transition-all whitespace-nowrap",
                        isSelected
                            ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                            : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300"
                    )}
                >
                    <span className="capitalize">
                        {variant === 'info' ? 'Info message' :
                            variant === 'status' ? 'Status card' :
                                variant}
                    </span>
                </button>
            </HoverCard.Trigger>
            <HoverCard.Portal>
                <HoverCard.Content
                    className="w-[300px] bg-white rounded-xl shadow-xl border border-gray-200 p-0 z-50 animate-in fade-in zoom-in-95 overflow-hidden"
                    sideOffset={8}
                    side="top"
                >
                    <div className="flex flex-col">
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 bg-gray-50/50 border-b border-gray-200">
                            <span className="text-xs font-bold text-gray-900 capitalize">
                                {variant === 'message' && "Message"}
                                {variant === 'info' && "InfoMessage"}
                                {variant === 'status' && "StatusCard"}
                            </span>
                            <span className="text-[10px] uppercase tracking-wider font-medium text-gray-400">Preview</span>
                        </div>

                        {/* Content Area */}
                        <div className="p-4 space-y-4">
                            {/* Scaled Preview Wrapper */}
                            <div className="relative w-full flex justify-center py-4 min-h-[140px] items-center bg-gray-50/50 rounded-lg border border-dashed border-gray-200">
                                <div className="origin-center scale-[0.85] transform-gpu pointer-events-none select-none w-full flex justify-center">
                                    {variant === 'message' && (
                                        <div className="w-[280px]">
                                            <Message
                                                defaultText="This is a basic AI message."
                                                showTimestamp={true}
                                                agentName="Agent"
                                                agentTimestamp="Just now"
                                                isThinking={false}
                                            />
                                        </div>
                                    )}
                                    {variant === 'info' && (
                                        <div className="w-[300px]">
                                            <InfoMessage
                                                title="Info message"
                                                sources={[{ text: 'Source', href: '#' }]}
                                            >
                                                Use this for AI messages that contain detailed explanations.
                                            </InfoMessage>
                                        </div>
                                    )}
                                    {variant === 'status' && (
                                        <div className="w-[300px]">
                                            <StatusCard
                                                status="success"
                                                title="Action Completed"
                                            >
                                                Additional context about the action.
                                            </StatusCard>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <p className="text-xs text-center text-gray-500 leading-relaxed px-4">
                                {variant === 'message' && "Best for conversational chitchat."}
                                {variant === 'info' && "Best for long-form answers, context, and sources."}
                                {variant === 'status' && "Visualize process status or outcomes."}
                            </p>
                        </div>
                    </div>
                    <HoverCard.Arrow className="fill-white" />
                </HoverCard.Content>
            </HoverCard.Portal>
        </HoverCard.Root>
    );
};
