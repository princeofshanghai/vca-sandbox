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

    const triggerClass = darkTheme
        ? "h-7 gap-2 px-3 text-xs font-medium bg-transparent border border-white/20 text-gray-300 hover:text-white hover:border-white/40 hover:bg-white/5 rounded-md transition-colors"
        : iconOnly
            ? cn(
                "h-8 w-8 text-gray-500 hover:text-gray-900 hover:bg-gray-50 hover:shadow-sm transition-all",
                rounded ? "rounded-full" : "rounded-md"
            )
            : "h-8 gap-2 px-3 text-xs font-medium bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900 shadow-sm rounded-md transition-all";

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

            <DropdownMenuContent align="end" className="w-[180px]">
                <DropdownMenuLabel>
                    Appearance
                </DropdownMenuLabel>

                <DropdownMenuCheckboxItem
                    className="justify-between"
                    checked={isPremium}
                    onCheckedChange={onTogglePremium}
                >
                    <span>Premium branding</span>
                </DropdownMenuCheckboxItem>

                <DropdownMenuCheckboxItem
                    className="justify-between"
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
                    className="justify-between"
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
