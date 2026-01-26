import * as HoverCard from '@radix-ui/react-hover-card';
import * as Popover from '@radix-ui/react-popover';
import { MessageSquare, MessageCirclePlus, MessageSquareText, Zap } from 'lucide-react';
import type { ComponentType } from '../../studio/types';
import { Message } from '@/components/vca-components/messages/Message';
import { PromptGroup } from '@/components/vca-components/prompt-group/PromptGroup';
import { InfoMessage } from '@/components/vca-components/info-message/InfoMessage';
import { ActionCard } from '@/components/vca-components/action-card/ActionCard';

interface ComponentOption {
    type: ComponentType;
    icon: React.ReactNode;
    name: string;
    previewComponent: React.ReactNode;
    description: string;
}

const componentOptions: ComponentOption[] = [
    {
        type: 'message',
        icon: <MessageSquare className="w-5 h-5" />,
        name: 'Message',
        description: 'Best for conversational chitchat',
        previewComponent: (
            <div className="w-[280px]">
                <Message
                    variant="ai"
                    defaultText="This is a basic AI message."
                />
            </div>
        ),
    },
    {
        type: 'prompt',
        icon: <MessageCirclePlus className="w-5 h-5" />,
        name: 'Prompt',
        description: 'Suggested user actions',
        previewComponent: (
            <div className="w-[280px]">
                <PromptGroup
                    prompts={[
                        { text: 'View team members' },
                        { text: 'Add a user' },
                        { text: 'Remove a user' },
                    ]}
                />
            </div>
        ),
    },
    {
        type: 'infoMessage',
        icon: <MessageSquareText className="w-5 h-5" />,
        name: 'Info Message',
        description: 'Long-form answers with sources',
        previewComponent: (
            <div className="w-[300px]">
                <InfoMessage
                    title="Info message"
                    sources={[{ text: 'Source', href: '#' }]}
                >
                    Use this for AI messages that contain detailed explanations and citations.
                </InfoMessage>
            </div>
        ),
    },
    {
        type: 'actionCard',
        icon: <Zap className="w-5 h-5" />,
        name: 'Action Card',
        description: 'Visualize tool usage or processes',
        previewComponent: (
            <div className="w-[300px]">
                <ActionCard
                    status="success"
                    title="Action Completed"
                >
                    Additional context about the action.
                </ActionCard>
            </div>
        ),
    },
];

const ComponentOptionCard = ({
    option,
    onClick,
    side
}: {
    option: ComponentOption;
    onClick: () => void;
    side: 'left' | 'right';
}) => (
    <HoverCard.Root openDelay={200} closeDelay={100}>
        <HoverCard.Trigger asChild>
            <button
                onClick={onClick}
                className="flex items-center gap-2 p-3 rounded-lg border border-gray-800 bg-gray-900/50 hover:bg-blue-600/20 hover:border-blue-500/50 transition-colors text-left w-full group cursor-default"
            >
                <span className="text-gray-400 group-hover:text-blue-400 transition-colors">
                    {option.icon}
                </span>
                <span className="text-sm font-medium text-gray-300 group-hover:text-blue-400">
                    {option.name}
                </span>
            </button>
        </HoverCard.Trigger>
        <HoverCard.Portal>
            <HoverCard.Content
                className="w-[320px] bg-gray-900 rounded-xl shadow-2xl border border-gray-800 p-0 z-[1002] animate-in fade-in zoom-in-95 overflow-hidden"
                sideOffset={12}
                side={side}
            >
                <div className="flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 bg-gray-800/50 border-b border-gray-800">
                        <span className="text-xs font-bold text-white">
                            {option.name}
                        </span>
                        <span className="text-[10px] uppercase tracking-wider font-medium text-gray-500">
                            Preview
                        </span>
                    </div>

                    {/* Content Area */}
                    <div className="p-4 space-y-4">
                        {/* Scaled Preview Wrapper */}
                        <div className="relative w-full flex justify-center py-4 min-h-[140px] items-center bg-white/5 rounded-lg border border-dashed border-gray-800">
                            <div className="origin-center scale-[0.85] transform-gpu pointer-events-none select-none w-full flex justify-center">
                                {option.previewComponent}
                            </div>
                        </div>

                        <p className="text-xs text-center text-gray-400 leading-relaxed px-4">
                            {option.description}
                        </p>
                    </div>
                </div>
                <HoverCard.Arrow className="fill-gray-900" />
            </HoverCard.Content>
        </HoverCard.Portal>
    </HoverCard.Root>
);

export function AddComponentContent({ onAdd }: { onAdd: (type: ComponentType) => void }) {
    return (
        <Popover.Content
            side="top"
            sideOffset={12}
            align="center"
            onOpenAutoFocus={(e) => e.preventDefault()}
            className="bg-gray-900 border border-gray-800 rounded-xl shadow-2xl p-4 w-[380px] z-[1001] animate-in fade-in zoom-in-95 duration-200 ease-out"
        >
            <div className="grid grid-cols-2 gap-2.5">
                {componentOptions.map((option, index) => (
                    <ComponentOptionCard
                        key={option.type}
                        option={option}
                        onClick={() => onAdd(option.type)}
                        side={index % 2 === 0 ? 'left' : 'right'}
                    />
                ))}
            </div>
            <Popover.Arrow className="fill-gray-900 stroke-gray-800" />
        </Popover.Content>
    );
}

