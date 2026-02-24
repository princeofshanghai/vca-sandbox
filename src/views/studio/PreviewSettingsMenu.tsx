import { useState } from 'react';
import { Flow } from './types';
import { cn } from '@/utils';
import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ActionTooltip } from '../studio-canvas/components/ActionTooltip';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuCheckboxItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface PreviewSettingsMenuProps {
    flow: Flow;
    onUpdateFlow: (flow: Flow) => void;
    isPremium: boolean;
    onTogglePremium: () => void;
    darkTheme?: boolean;
    iconOnly?: boolean;
    rounded?: boolean;
}

export const PreviewSettingsMenu = ({
    flow,
    onUpdateFlow,
    isPremium,
    onTogglePremium,
    darkTheme = false,
    iconOnly = false,
    rounded = false
}: PreviewSettingsMenuProps) => {

    const [isOpen, setIsOpen] = useState(false);

    const darkMenuClass = darkTheme
        ? "border-shell-dark-border bg-shell-dark-panel text-shell-dark-text shadow-shell-lg"
        : undefined;
    const darkMenuLabelClass = darkTheme
        ? "text-shell-dark-muted"
        : undefined;
    const darkMenuItemClass = darkTheme
        ? "text-shell-dark-text data-[highlighted]:bg-shell-dark-surface data-[highlighted]:text-shell-dark-text [&_svg]:text-shell-dark-accent"
        : undefined;

    const triggerClass = darkTheme
        ? "h-7 gap-2 px-3 text-xs font-medium bg-transparent border border-shell-dark-border text-shell-dark-muted hover:text-shell-dark-text hover:border-shell-dark-border-strong hover:bg-shell-dark-surface rounded-md transition-colors"
        : iconOnly
            ? cn(
                "h-8 w-8 text-shell-muted hover:text-shell-text hover:bg-shell-surface hover:shadow-sm transition-all",
                rounded ? "rounded-full" : "rounded-md"
            )
            : "h-8 gap-2 px-3 text-xs font-medium bg-shell-bg border border-shell-border text-shell-muted-strong hover:bg-shell-surface hover:text-shell-text shadow-sm rounded-md transition-all";

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <ActionTooltip content="More options" side="bottom" disabled={isOpen}>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className={triggerClass}>
                        <MoreHorizontal size={16} />
                        {!iconOnly && <span>Options</span>}
                    </Button>
                </DropdownMenuTrigger>
            </ActionTooltip>

            <DropdownMenuContent align="end" className={cn("w-[180px]", darkMenuClass)}>
                <DropdownMenuLabel className={darkMenuLabelClass}>
                    Appearance
                </DropdownMenuLabel>

                <DropdownMenuCheckboxItem
                    className={cn("justify-between", darkMenuItemClass)}
                    checked={isPremium}
                    onCheckedChange={onTogglePremium}
                >
                    <span>Premium branding</span>
                </DropdownMenuCheckboxItem>

                <DropdownMenuCheckboxItem
                    className={cn("justify-between", darkMenuItemClass)}
                    checked={flow.settings?.showDisclaimer ?? true}
                    onCheckedChange={() => {
                        const newFlow = {
                            ...flow,
                            settings: {
                                ...flow.settings,
                                showDisclaimer: !(flow.settings?.showDisclaimer ?? true)
                            }
                        };
                        onUpdateFlow(newFlow);
                    }}
                >
                    <span>Show disclaimer</span>
                </DropdownMenuCheckboxItem>

                <DropdownMenuCheckboxItem
                    className={cn("justify-between", darkMenuItemClass)}
                    checked={flow.settings?.simulateThinking ?? true}
                    onCheckedChange={() => {
                        const newFlow = {
                            ...flow,
                            settings: {
                                ...flow.settings,
                                simulateThinking: !(flow.settings?.simulateThinking ?? true)
                            }
                        };
                        onUpdateFlow(newFlow);
                    }}
                >
                    <span>Simulate thinking</span>
                </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
