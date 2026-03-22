import { useState } from 'react';
import { Flow } from './types';
import { cn } from '@/utils';
import { MoreHorizontal } from 'lucide-react';
import { ActionTooltip } from '../studio-canvas/components/ActionTooltip';
import {
    ShellButton,
    ShellIconButton,
    ShellMenu,
    ShellMenuCheckboxItem,
    ShellMenuContent,
    ShellMenuLabel,
    ShellMenuTrigger,
    ShellSegmentedControlItem,
} from '@/components/shell';

interface PreviewSettingsMenuProps {
    flow: Flow;
    onUpdateFlow: (flow: Flow) => void;
    isPremium: boolean;
    onTogglePremium: () => void;
    tone?: 'default' | 'cinematicDark';
    iconOnly?: boolean;
    size?: 'default' | 'compact';
    triggerStyle?: 'standalone' | 'segmented';
    shape?: 'rounded' | 'circle';
}

export const PreviewSettingsMenu = ({
    flow,
    onUpdateFlow,
    isPremium,
    onTogglePremium,
    tone = 'default',
    iconOnly = false,
    size = 'default',
    triggerStyle = 'standalone',
    shape = 'rounded',
}: PreviewSettingsMenuProps) => {
    const [isOpen, setIsOpen] = useState(false);

    const updateFlowSetting = (key: 'showDisclaimer' | 'simulateThinking' | 'showHotspots') => {
        onUpdateFlow({
            ...flow,
            settings: {
                ...flow.settings,
                [key]: !(flow.settings?.[key] ?? true)
            }
        });
    };

    const isDark = tone === 'cinematicDark';
    const triggerShape = shape === 'circle' ? 'circle' : 'rounded';
    const segmentedShape = shape === 'circle' ? 'pill' : 'rounded';
    const iconButtonSize = size === 'compact' ? 'sm' : 'md';

    const renderTrigger = () => {
        if (iconOnly && triggerStyle === 'segmented') {
            return (
                <ShellSegmentedControlItem
                    iconOnly
                    selected={isOpen}
                    tone={tone}
                    size={size}
                    shape={segmentedShape}
                    aria-label="Open preview options"
                >
                    <MoreHorizontal size={size === 'compact' ? 14 : 16} />
                </ShellSegmentedControlItem>
            );
        }

        if (iconOnly) {
            return (
                <ShellIconButton
                    size={iconButtonSize}
                    tone={isDark ? 'cinematicDark' : 'default'}
                    shape={triggerShape}
                    aria-label="Open preview options"
                    className={cn(
                        isDark &&
                            isOpen &&
                            'bg-shell-dark-accent-soft text-shell-dark-accent hover:bg-shell-dark-accent-soft hover:text-shell-dark-accent',
                        !isDark &&
                            isOpen &&
                            'bg-shell-accent-soft text-shell-accent-text hover:bg-shell-accent-soft hover:text-shell-accent-text'
                    )}
                >
                    <MoreHorizontal size={size === 'compact' ? 14 : 16} />
                </ShellIconButton>
            );
        }

        return (
            <ShellButton
                variant="outline"
                size={size === 'compact' ? 'compact' : 'sm'}
                className={cn(
                    size === 'compact'
                        ? 'h-7 gap-2 px-3 text-[11px] font-medium'
                        : 'h-8 gap-2 px-3 text-xs font-medium',
                    isDark
                        ? 'border border-shell-dark-border bg-transparent text-shell-dark-muted-strong hover:text-shell-dark-text hover:border-shell-dark-border-strong hover:bg-shell-dark-surface rounded-md transition-colors'
                        : 'bg-shell-bg border border-shell-border text-shell-muted-strong hover:bg-shell-surface hover:text-shell-text shadow-sm rounded-md transition-all'
                )}
            >
                <MoreHorizontal size={size === 'compact' ? 14 : 16} />
                <span>Options</span>
            </ShellButton>
        );
    };

    return (
        <ShellMenu open={isOpen} onOpenChange={setIsOpen}>
            <ActionTooltip content="More options" side="bottom" disabled={isOpen}>
                <ShellMenuTrigger asChild>
                    {renderTrigger()}
                </ShellMenuTrigger>
            </ActionTooltip>

            <ShellMenuContent align="end" tone={tone} className="w-[180px]">
                <ShellMenuLabel
                    tone={tone}
                    className={cn(size === 'compact' ? 'text-[11px]' : 'text-[13px]')}
                >
                    Appearance
                </ShellMenuLabel>

                <ShellMenuCheckboxItem
                    tone={tone}
                    size={size}
                    checked={isPremium}
                    onCheckedChange={onTogglePremium}
                >
                    <span>Premium branding</span>
                </ShellMenuCheckboxItem>

                <ShellMenuCheckboxItem
                    tone={tone}
                    size={size}
                    checked={flow.settings?.showDisclaimer ?? true}
                    onCheckedChange={() => updateFlowSetting('showDisclaimer')}
                >
                    <span>Show disclaimer</span>
                </ShellMenuCheckboxItem>

                <ShellMenuCheckboxItem
                    tone={tone}
                    size={size}
                    checked={flow.settings?.simulateThinking ?? true}
                    onCheckedChange={() => updateFlowSetting('simulateThinking')}
                >
                    <span>Simulate thinking</span>
                </ShellMenuCheckboxItem>

                <ShellMenuCheckboxItem
                    tone={tone}
                    size={size}
                    checked={flow.settings?.showHotspots ?? true}
                    onCheckedChange={() => updateFlowSetting('showHotspots')}
                >
                    <span>Show hotspots</span>
                </ShellMenuCheckboxItem>
            </ShellMenuContent>
        </ShellMenu>
    );
};
