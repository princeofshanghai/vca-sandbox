import { Flow } from './types';
import { Settings, Smartphone, Monitor, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuCheckboxItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface PreviewSettingsMenuProps {
    flow: Flow;
    onUpdateFlow: (flow: Flow) => void;
    isPremium: boolean;
    onTogglePremium: () => void;
    isMobile: boolean;
    onToggleMobile: () => void;
    darkTheme?: boolean;
    iconOnly?: boolean;
}

export const PreviewSettingsMenu = ({
    flow,
    onUpdateFlow,
    isPremium,
    onTogglePremium,
    isMobile,
    onToggleMobile,
    darkTheme = false,
    iconOnly = false
}: PreviewSettingsMenuProps) => {

    const triggerClass = darkTheme
        ? "h-7 gap-2 px-3 text-xs font-medium bg-transparent border border-white/20 text-gray-300 hover:text-white hover:border-white/40 hover:bg-white/5 rounded-md transition-colors"
        : iconOnly
            ? "h-8 w-8 text-gray-500 hover:text-gray-900 hover:bg-gray-100"
            : "h-8 gap-2 px-3 text-xs font-medium bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900 shadow-sm rounded-md transition-all";

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className={triggerClass}>
                    <Settings size={14} />
                    {!iconOnly && <span>Display</span>}
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-[240px]">
                <DropdownMenuLabel>
                    Device preview
                </DropdownMenuLabel>

                <DropdownMenuItem
                    className="justify-between"
                    onClick={() => isMobile && onToggleMobile()}
                >
                    <div className="flex items-center gap-2">
                        <Monitor size={14} className="text-gray-500" />
                        <span>Desktop</span>
                    </div>
                    {!isMobile && <Check size={14} className="text-blue-600" />}
                </DropdownMenuItem>

                <DropdownMenuItem
                    className="justify-between"
                    onClick={() => !isMobile && onToggleMobile()}
                >
                    <div className="flex items-center gap-2">
                        <Smartphone size={14} className="text-gray-500" />
                        <span>Mobile</span>
                    </div>
                    {isMobile && <Check size={14} className="text-blue-600" />}
                </DropdownMenuItem>

                <DropdownMenuSeparator />

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
