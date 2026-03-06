import * as HoverCard from '@radix-ui/react-hover-card';
import * as Popover from '@radix-ui/react-popover';
import { MessageSquare, MessageCirclePlus, MessageSquareText, Zap, LayoutList, CheckSquare, User } from 'lucide-react';
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

interface ComponentSection {
    label: 'Messages' | 'Actions';
    options: ComponentOption[];
}

const HOVER_CARD_WIDTH_PX = 320;
const HOVER_CARD_PREVIEW_MIN_HEIGHT_PX = 140;
const HOVER_CARD_PREVIEW_SCALE = 0.85;
const HOVER_CARD_PREVIEW_BACKGROUND = '#f3f4f6';

const componentOptions: ComponentOption[] = [
    {
        type: 'message',
        icon: <MessageSquare className="w-4 h-4" />,
        name: 'Message',
        description: 'Basic AI text message',
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
        description: 'Suggested quick actions',
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
        description: 'Long form AI message with sources',
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
        description: 'Shows progress bar for an agent action',
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
        description: 'Select one from a list of options',
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
        type: 'confirmationCard',
        icon: <User className="w-4 h-4" />,
        name: 'Confirmation Card',
        description: 'Displays rich content cards with CTAs',
        previewComponent: (
            <div className="w-[300px] flex flex-col gap-2 p-2">
                <div className="flex items-center gap-2 p-2 rounded border border-shell-border bg-shell-bg">
                    <div className="w-6 h-6 rounded-full bg-shell-surface" />
                    <div className="flex-1 h-2 bg-shell-surface rounded w-2/3" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <div className="h-7 rounded bg-shell-accent/20 border border-shell-accent/40" />
                    <div className="h-7 rounded bg-shell-surface border border-shell-border" />
                </div>
            </div>
        ),
    },
    {
        type: 'checkboxGroup',
        icon: <CheckSquare className="w-4 h-4" />,
        name: 'Checkbox Group',
        description: 'Select multiple options in a list',
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

const componentOptionByType = new Map<ComponentType, ComponentOption>(
    componentOptions.map((option) => [option.type, option])
);

const messageSectionOptions: ComponentOption[] = (['message', 'infoMessage'] as const)
    .map((type) => componentOptionByType.get(type))
    .filter((option): option is ComponentOption => Boolean(option));

const actionSectionOptions: ComponentOption[] = componentOptions
    .filter((option) => option.type !== 'message' && option.type !== 'infoMessage')
    .sort((a, b) => a.name.localeCompare(b.name));

const componentSections: ComponentSection[] = [
    { label: 'Messages', options: messageSectionOptions },
    { label: 'Actions', options: actionSectionOptions },
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
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-shell-accent focus-visible:bg-shell-accent transition-colors text-left w-full group cursor-pointer"
            >
                <div className="text-shell-dark-muted group-hover:text-white transition-colors">
                    {option.icon}
                </div>
                <span className="text-xs font-medium text-shell-dark-text group-hover:text-white transition-colors">
                    {option.name}
                </span>
            </button>
        </HoverCard.Trigger>
        <HoverCard.Portal>
            <HoverCard.Content
                className="max-w-[calc(100vw-2rem)] bg-shell-dark-panel rounded-xl shadow-2xl border border-shell-dark-border p-0 z-[1002] animate-in fade-in zoom-in-95 overflow-hidden"
                style={{ width: `${HOVER_CARD_WIDTH_PX}px` }}
                sideOffset={8}
                side={side}
            >
                <div className="flex flex-col">
                    {/* Content Area */}
                    <div className="p-3 space-y-3">
                        <div
                            className="relative w-full flex justify-center py-3 items-center rounded-lg border border-shell-border shadow-sm"
                            style={{
                                minHeight: `${HOVER_CARD_PREVIEW_MIN_HEIGHT_PX}px`,
                                backgroundColor: HOVER_CARD_PREVIEW_BACKGROUND,
                            }}
                        >
                            <div
                                className="origin-center transform-gpu pointer-events-none select-none w-full flex justify-center"
                                style={{ transform: `scale(${HOVER_CARD_PREVIEW_SCALE})` }}
                            >
                                {option.previewComponent}
                            </div>
                        </div>

                        <p className="text-xs text-left text-shell-dark-muted leading-relaxed px-2">
                            {option.description}
                        </p>
                    </div>
                </div>
                <HoverCard.Arrow className="fill-shell-dark-panel stroke-shell-dark-border" />
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
            className="bg-shell-dark-panel border border-shell-dark-border rounded-xl shadow-2xl p-2 w-[220px] z-[1001] animate-in fade-in zoom-in-95 duration-200 ease-out"
        >
            <div className="flex flex-col">
                {componentSections.map((section, sectionIndex) => (
                    <div
                        key={section.label}
                        className={sectionIndex === 0 ? '' : 'mt-3 pt-3 border-t border-shell-dark-border'}
                    >
                        <div className="px-2.5 pb-1.5 text-[11px] font-semibold text-shell-dark-muted">
                            {section.label}
                        </div>
                        <div className="flex flex-col gap-0.5">
                            {section.options.map((option) => (
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
                    </div>
                ))}
            </div>
            <Popover.Arrow className="fill-shell-dark-panel stroke-shell-dark-border" />
        </Popover.Content>
    );
}
