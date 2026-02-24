import * as HoverCard from '@radix-ui/react-hover-card';
import * as Popover from '@radix-ui/react-popover';
import { MessageSquare, MessageCirclePlus, MessageSquareText, Zap, LayoutList, CheckSquare } from 'lucide-react';
import { toast } from 'sonner';
import type { ComponentType } from '../../studio/types';
import { Message } from '@/components/vca-components/messages/Message';
import { PromptGroup } from '@/components/vca-components/prompt-group/PromptGroup';
import { InfoMessage } from '@/components/vca-components/info-message/InfoMessage';
import { StatusCard } from '@/components/vca-components/status-card/StatusCard';

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
        icon: <MessageSquare className="w-4 h-4" />,
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
        icon: <MessageCirclePlus className="w-4 h-4" />,
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
        icon: <MessageSquareText className="w-4 h-4" />,
        name: 'Info Message',
        description: 'Long-form answers with sources',
        previewComponent: (
            <div className="w-[300px]">
                <InfoMessage
                    sources={[{ text: 'Source', href: '#' }]}
                >
                    Use this for AI messages that contain detailed explanations and citations.
                </InfoMessage>
            </div>
        ),
    },
    {
        type: 'statusCard',
        icon: <Zap className="w-4 h-4" />,
        name: 'Status Card',
        description: 'Visualize tool usage or processes',
        previewComponent: (
            <div className="w-[300px]">
                <StatusCard
                    status="success"
                    title="Action Completed"
                >
                    Additional context about the action.
                </StatusCard>
            </div>
        ),
    },
    {
        type: 'selectionList',
        icon: <LayoutList className="w-4 h-4" />,
        name: 'Selection List',
        description: 'User selection from a list (users, accounts)',
        previewComponent: (
            <div className="w-[300px] flex flex-col gap-2 p-2">
                <div className="flex items-center gap-2 p-2 rounded border border-shell-border bg-shell-bg">
                    <div className="w-6 h-6 rounded-full bg-shell-surface" />
                    <div className="flex-1 h-2 bg-shell-surface rounded w-2/3" />
                </div>
                <div className="flex items-center gap-2 p-2 rounded border border-shell-border bg-shell-bg">
                    <div className="w-6 h-6 rounded-full bg-shell-surface" />
                    <div className="flex-1 h-2 bg-shell-surface rounded w-2/3" />
                </div>
            </div>
        ),
    },
    {
        type: 'checkboxGroup',
        icon: <CheckSquare className="w-4 h-4" />,
        name: 'Checkbox Group',
        description: 'Multiple selection (e.g. "Select all that apply")',
        previewComponent: (
            <div className="w-[300px] flex flex-col gap-2 p-2">
                <div className="text-xs font-bold mb-1">Select topics:</div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 border border-shell-border rounded-[2px]" />
                    <div className="text-xs text-shell-muted">Option 1</div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 border border-shell-accent rounded-[2px] bg-shell-accent" />
                    <div className="text-xs text-shell-text">Option 2</div>
                </div>
                <div className="w-16 h-6 bg-shell-accent rounded text-center text-[10px] text-white flex items-center justify-center mt-2">
                    Save
                </div>
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
    <HoverCard.Root openDelay={100} closeDelay={50}>
        <HoverCard.Trigger asChild>
            <button
                onClick={onClick}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-shell-surface-subtle transition-colors text-left w-full group cursor-pointer"
            >
                <div className="text-shell-muted group-hover:text-shell-accent transition-colors">
                    {option.icon}
                </div>
                <span className="text-xs font-medium text-shell-muted-strong group-hover:text-shell-text transition-colors">
                    {option.name}
                </span>
            </button>
        </HoverCard.Trigger>
        <HoverCard.Portal>
            <HoverCard.Content
                className="w-[240px] bg-shell-bg rounded-xl shadow-2xl border border-shell-border p-0 z-[1002] animate-in fade-in zoom-in-95 overflow-hidden"
                sideOffset={8}
                side={side}
            >
                <div className="flex flex-col">
                    {/* Content Area */}
                    <div className="p-3 space-y-3">
                        <div className="relative w-full flex justify-center py-3 min-h-[100px] items-center bg-shell-surface-subtle rounded-lg border border-shell-border shadow-sm">
                            <div className="origin-center scale-[0.7] transform-gpu pointer-events-none select-none w-full flex justify-center">
                                {option.previewComponent}
                            </div>
                        </div>

                        <p className="text-[10px] text-center text-shell-muted leading-relaxed px-2 italic">
                            {option.description}
                        </p>
                    </div>
                </div>
                <HoverCard.Arrow className="fill-shell-bg stroke-shell-border" />
            </HoverCard.Content>
        </HoverCard.Portal>
    </HoverCard.Root>
);

export function AddComponentContent({ onAdd }: { onAdd: (type: ComponentType) => void }) {
    return (
        <Popover.Content
            side="top"
            sideOffset={8}
            align="center"
            onOpenAutoFocus={(e: Event) => e.preventDefault()}
            className="bg-shell-bg border border-shell-border rounded-xl shadow-2xl p-1 w-[200px] z-[1001] animate-in fade-in zoom-in-95 duration-200 ease-out"
        >
            <div className="flex flex-col">
                {componentOptions.map((option) => (
                    <ComponentOptionCard
                        key={option.type}
                        option={option}
                        onClick={() => {
                            onAdd(option.type);
                            toast(`Added ${option.name}`);
                        }}
                        side="right"
                    />
                ))}
            </div>
            <Popover.Arrow className="fill-shell-bg stroke-shell-border" />
        </Popover.Content>
    );
}
