import * as HoverCard from '@radix-ui/react-hover-card';
import { MessageSquare, MessageCirclePlus, MessageSquareText, Zap, LayoutList, CheckSquare, IdCard } from 'lucide-react';
import { ShellButton, ShellPopoverContent } from '@/components/shell';
import type { ComponentType } from '../../studio/types';
import { CheckboxGroup } from '@/components/vca-components/checkbox-group/CheckboxGroup';
import { DisplayCard } from '@/components/vca-components/confirmation-card/ConfirmationCard';
import { Message } from '@/components/vca-components/messages/Message';
import { PromptGroup } from '@/components/vca-components/prompt-group/PromptGroup';
import { InfoMessage } from '@/components/vca-components/info-message/InfoMessage';
import { SelectionList } from '@/components/vca-components/selection-list/SelectionList';
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

const peopleSelectionPreviewItems = [
    {
        id: 'sarah-jenkins',
        title: 'Sarah Jenkins',
        subtitle: 'sjenkins@flexis.com',
        visualType: 'avatar' as const,
    },
    {
        id: 'michael-chen',
        title: 'Michael Chen',
        subtitle: 'mchen@flexis.com',
        visualType: 'avatar' as const,
    },
];

const peopleDisplayCardPreviewItem = {
    id: 'sarah-jenkins',
    title: 'Sarah Jenkins',
    subtitle: 'sjenkins@flexis.com',
    visualType: 'avatar' as const,
};

const peopleCheckboxPreviewOptions = [
    {
        id: 'sarah-jenkins',
        label: 'Sarah Jenkins',
        description: 'sjenkins@flexis.com',
    },
    {
        id: 'michael-chen',
        label: 'Michael Chen',
        description: 'mchen@flexis.com',
    },
    {
        id: 'alex-rivera',
        label: 'Alex Rivera',
        description: 'arivera@flexis.com',
    },
];

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
        name: 'Select Cards',
        description: 'Choose one card from a set',
        previewComponent: (
            <div className="w-[300px] px-2">
                <SelectionList
                    items={peopleSelectionPreviewItems}
                    maxDisplayed={2}
                />
            </div>
        ),
    },
    {
        type: 'confirmationCard',
        icon: <IdCard className="w-4 h-4" />,
        name: 'Display Card',
        description: 'Rich content card with optional actions',
        previewComponent: (
            <div className="w-[300px] px-2">
                <DisplayCard
                    item={peopleDisplayCardPreviewItem}
                    confirmLabel="View profile"
                    rejectLabel="Skip"
                />
            </div>
        ),
    },
    {
        type: 'checkboxGroup',
        icon: <CheckSquare className="w-4 h-4" />,
        name: 'Checkbox Group',
        description: 'Select multiple options with primary and secondary actions',
        previewComponent: (
            <div className="w-[300px] px-2">
                <CheckboxGroup
                    options={peopleCheckboxPreviewOptions}
                    value={['sarah-jenkins']}
                    primaryLabel="Invite selected"
                    secondaryLabel="Cancel"
                />
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
            <ShellButton
                onClick={onClick}
                type="button"
                variant="ghost"
                size="compact"
                className="group h-auto w-full justify-start gap-2.5 rounded-lg px-2.5 py-2 text-left text-shell-text transition-colors hover:bg-shell-surface focus-visible:ring-shell-accent/20"
            >
                <div className="text-shell-muted transition-colors group-hover:text-shell-text">
                    {option.icon}
                </div>
                <span className="text-xs font-medium text-shell-text transition-colors">
                    {option.name}
                </span>
            </ShellButton>
        </HoverCard.Trigger>
        <HoverCard.Portal>
            <HoverCard.Content
                data-canvas-shell-zoom-blocker="true"
                className="max-w-[calc(100vw-2rem)] rounded-xl border border-shell-border bg-shell-bg p-0 text-shell-text shadow-2xl z-[1002] animate-in fade-in zoom-in-95 overflow-hidden"
                style={{ width: `${HOVER_CARD_WIDTH_PX}px` }}
                sideOffset={8}
                side={side}
            >
                <div className="flex flex-col">
                    {/* Content Area */}
                    <div className="p-3 space-y-3">
                        <div
                            className="relative w-full flex justify-center py-3 items-center rounded-lg border border-shell-border bg-shell-surface-subtle shadow-sm"
                            style={{ minHeight: `${HOVER_CARD_PREVIEW_MIN_HEIGHT_PX}px` }}
                        >
                            <div
                                className="origin-center transform-gpu pointer-events-none select-none w-full flex justify-center"
                                style={{ transform: `scale(${HOVER_CARD_PREVIEW_SCALE})` }}
                            >
                                {option.previewComponent}
                            </div>
                        </div>

                        <p className="px-2 text-xs text-left text-shell-muted leading-relaxed">
                            {option.description}
                        </p>
                    </div>
                </div>
                <HoverCard.Arrow className="fill-shell-bg stroke-shell-border" />
            </HoverCard.Content>
        </HoverCard.Portal>
    </HoverCard.Root>
);

interface AddComponentContentProps {
    onAdd: (type: ComponentType) => void;
    side?: 'top' | 'right' | 'bottom' | 'left';
    align?: 'start' | 'center' | 'end';
    previewSide?: 'left' | 'right';
}

export function AddComponentContent({
    onAdd,
    side = 'bottom',
    align = 'end',
    previewSide = 'right',
}: AddComponentContentProps) {
    return (
        <ShellPopoverContent
            data-canvas-shell-zoom-blocker="true"
            side={side}
            sideOffset={8}
            align={align}
            onOpenAutoFocus={(e: Event) => e.preventDefault()}
            className="w-[220px] p-2 z-[1001] duration-200 ease-out"
        >
            <div className="flex flex-col">
                {componentSections.map((section, sectionIndex) => (
                    <div
                        key={section.label}
                        className={sectionIndex === 0 ? '' : 'mt-3 pt-3 border-t border-shell-border'}
                    >
                        <div className="px-2.5 pb-1.5 text-[11px] font-semibold text-shell-muted">
                            {section.label}
                        </div>
                        <div className="flex flex-col gap-0.5">
                            {section.options.map((option) => (
                                <ComponentOptionCard
                                    key={option.type}
                                    option={option}
                                    onClick={() => onAdd(option.type)}
                                    side={previewSide}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </ShellPopoverContent>
    );
}
