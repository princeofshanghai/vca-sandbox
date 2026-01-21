import { useRef } from 'react';
import { createPortal } from 'react-dom';
import * as HoverCard from '@radix-ui/react-hover-card';
import { MessageSquare, SquareStack, MessageSquareText, Zap, Circle, Edit3 } from 'lucide-react';
import type { ComponentType } from '../../studio/types';
import { Message } from '@/components/vca-components/messages/Message';
import { PromptGroup } from '@/components/vca-components/prompt-group/PromptGroup';
import { InfoMessage } from '@/components/vca-components/info-message/InfoMessage';
import { ActionCard } from '@/components/vca-components/action-card/ActionCard';

interface AddComponentPopoverProps {
    onAdd: (type: ComponentType) => void;
    onClose: () => void;
    anchorEl: HTMLElement | null;
}

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
        icon: <SquareStack className="w-5 h-5" />,
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
    {
        type: 'buttons',
        icon: <Circle className="w-5 h-5" />,
        name: 'Buttons',
        description: 'User response options',
        previewComponent: (
            <div className="text-sm text-gray-500 px-4 py-2">
                Multiple choice buttons (not yet implemented in preview)
            </div>
        ),
    },
    {
        type: 'input',
        icon: <Edit3 className="w-5 h-5" />,
        name: 'Input',
        description: 'Text input field',
        previewComponent: (
            <div className="text-sm text-gray-500 px-4 py-2">
                User input field (not yet implemented in preview)
            </div>
        ),
    },
];

const ComponentOptionCard = ({ option, onClick }: { option: ComponentOption; onClick: () => void }) => (
    <HoverCard.Root openDelay={200} closeDelay={100}>
        <HoverCard.Trigger asChild>
            <button
                onClick={onClick}
                className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 hover:bg-blue-50 hover:border-blue-300 transition-colors text-left w-full group cursor-default"
            >
                <span className="text-gray-600 group-hover:text-blue-600 transition-colors">
                    {option.icon}
                </span>
                <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">
                    {option.name}
                </span>
            </button>
        </HoverCard.Trigger>
        <HoverCard.Portal>
            <HoverCard.Content
                className="w-[320px] bg-white rounded-xl shadow-xl border border-gray-200 p-0 z-50 animate-in fade-in zoom-in-95 overflow-hidden"
                sideOffset={8}
                side="right"
            >
                <div className="flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 bg-gray-50/50 border-b border-gray-200">
                        <span className="text-xs font-bold text-gray-900">
                            {option.name}
                        </span>
                        <span className="text-[10px] uppercase tracking-wider font-medium text-gray-400">
                            Preview
                        </span>
                    </div>

                    {/* Content Area */}
                    <div className="p-4 space-y-4">
                        {/* Scaled Preview Wrapper */}
                        <div className="relative w-full flex justify-center py-4 min-h-[140px] items-center bg-gray-50/50 rounded-lg border border-dashed border-gray-200">
                            <div className="origin-center scale-[0.85] transform-gpu pointer-events-none select-none w-full flex justify-center">
                                {option.previewComponent}
                            </div>
                        </div>

                        <p className="text-xs text-center text-gray-500 leading-relaxed px-4">
                            {option.description}
                        </p>
                    </div>
                </div>
                <HoverCard.Arrow className="fill-white" />
            </HoverCard.Content>
        </HoverCard.Portal>
    </HoverCard.Root>
);

export function AddComponentPopover({ onAdd, onClose, anchorEl }: AddComponentPopoverProps) {
    const popoverRef = useRef<HTMLDivElement>(null);

    // Position popover below anchor element
    const getPopoverStyle = (): React.CSSProperties => {
        if (!anchorEl) return {};

        const rect = anchorEl.getBoundingClientRect();
        const spacing = 8;

        return {
            position: 'fixed',
            top: rect.bottom + spacing,
            left: rect.left,
            zIndex: 50,
        };
    };

    const handleAdd = (type: ComponentType) => {
        onAdd(type);
        onClose();
    };

    return createPortal(
        <div
            ref={popoverRef}
            style={getPopoverStyle()}
            className="bg-white border border-gray-200 rounded-lg shadow-xl p-3 w-[340px]"
        >
            <div className="grid grid-cols-2 gap-2">
                {componentOptions.map((option) => (
                    <ComponentOptionCard
                        key={option.type}
                        option={option}
                        onClick={() => handleAdd(option.type)}
                    />
                ))}
            </div>
        </div>,
        document.body
    );
}
