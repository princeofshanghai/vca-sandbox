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
                            ? "bg-shell-accent border-shell-accent text-white shadow-sm"
                            : "bg-shell-bg border-shell-border text-shell-muted-strong hover:bg-shell-surface-subtle hover:border-shell-accent-border"
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
                    className="w-[300px] bg-shell-bg rounded-xl shadow-xl border border-shell-border p-0 z-50 animate-in fade-in zoom-in-95 overflow-hidden"
                    sideOffset={8}
                    side="top"
                >
                    <div className="flex flex-col">
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 bg-shell-surface-subtle border-b border-shell-border">
                            <span className="text-xs font-bold text-shell-text capitalize">
                                {variant === 'message' && "Message"}
                                {variant === 'info' && "InfoMessage"}
                                {variant === 'status' && "StatusCard"}
                            </span>
                            <span className="text-[10px] uppercase tracking-wider font-medium text-shell-muted">Preview</span>
                        </div>

                        {/* Content Area */}
                        <div className="p-4 space-y-4">
                            {/* Scaled Preview Wrapper */}
                            <div className="relative w-full flex justify-center py-4 min-h-[140px] items-center bg-shell-surface-subtle rounded-lg border border-dashed border-shell-border">
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

                            <p className="text-xs text-center text-shell-muted leading-relaxed px-4">
                                {variant === 'message' && "Best for conversational chitchat."}
                                {variant === 'info' && "Best for long-form answers, context, and sources."}
                                {variant === 'status' && "Visualize process status or outcomes."}
                            </p>
                        </div>
                    </div>
                    <HoverCard.Arrow className="fill-shell-bg stroke-shell-border" />
                </HoverCard.Content>
            </HoverCard.Portal>
        </HoverCard.Root>
    );
};
