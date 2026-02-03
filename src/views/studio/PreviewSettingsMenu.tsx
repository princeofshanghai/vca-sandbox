import { Flow } from './types';
import { Settings, Smartphone, Monitor, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

interface PreviewSettingsMenuProps {
    flow: Flow;
    onUpdateFlow: (flow: Flow) => void;
    isPremium: boolean;
    onTogglePremium: () => void;
    isMobile: boolean;
    onToggleMobile: () => void;
    darkTheme?: boolean; // Prop to support dark theme styling (for ShareView)
}

export const PreviewSettingsMenu = ({
    flow,
    onUpdateFlow,
    isPremium,
    onTogglePremium,
    isMobile,
    onToggleMobile,
    darkTheme = false
}: PreviewSettingsMenuProps) => {

    const triggerClass = darkTheme
        ? "h-7 gap-2 px-3 text-xs font-medium bg-transparent border border-white/20 text-gray-300 hover:text-white hover:border-white/40 hover:bg-white/5 rounded-md transition-colors"
        : "h-8 gap-2 px-3 text-xs font-medium bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900 shadow-sm rounded-md transition-all";

    return (
        <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
                <Button variant="ghost" className={triggerClass}>
                    <Settings size={14} />
                    <span>Display</span>
                </Button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
                <DropdownMenu.Content
                    align="end"
                    sideOffset={8}
                    className="min-w-[240px] bg-white rounded-lg shadow-xl ring-1 ring-black/5 p-2 z-[1001] animate-in fade-in-0 zoom-in-95"
                >
                    <DropdownMenu.Label className="text-xs font-semibold text-gray-400 px-2 py-1.5 mb-1">
                        Device Preview
                    </DropdownMenu.Label>

                    <DropdownMenu.Item
                        className="flex items-center justify-between gap-4 px-2 py-2 text-sm text-gray-700 rounded hover:bg-gray-100 cursor-pointer outline-none"
                        onClick={() => isMobile && onToggleMobile()}
                    >
                        <div className="flex items-center gap-2">
                            <Monitor size={14} className="text-gray-400" />
                            <span>Desktop Mode</span>
                        </div>
                        {!isMobile && <Check size={14} className="text-blue-600" />}
                    </DropdownMenu.Item>

                    <DropdownMenu.Item
                        className="flex items-center justify-between gap-4 px-2 py-2 text-sm text-gray-700 rounded hover:bg-gray-100 cursor-pointer outline-none"
                        onClick={() => !isMobile && onToggleMobile()}
                    >
                        <div className="flex items-center gap-2">
                            <Smartphone size={14} className="text-gray-400" />
                            <span>Mobile Mode</span>
                        </div>
                        {isMobile && <Check size={14} className="text-blue-600" />}
                    </DropdownMenu.Item>

                    <div className="h-px bg-gray-100 my-1" />
                    <DropdownMenu.Label className="text-xs font-semibold text-gray-400 px-2 py-1.5 mb-1">
                        Appearance
                    </DropdownMenu.Label>

                    <DropdownMenu.CheckboxItem
                        className="flex items-center justify-between gap-4 px-2 py-2 text-sm text-gray-700 rounded hover:bg-gray-100 cursor-pointer outline-none"
                        checked={isPremium}
                        onCheckedChange={onTogglePremium}
                    >
                        <span>Premium Branding</span>
                        <DropdownMenu.ItemIndicator>
                            <Check size={14} className="text-blue-600" />
                        </DropdownMenu.ItemIndicator>
                    </DropdownMenu.CheckboxItem>

                    <DropdownMenu.CheckboxItem
                        className="flex items-center justify-between gap-4 px-2 py-2 text-sm text-gray-700 rounded hover:bg-gray-100 cursor-pointer outline-none"
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
                        <span>Show Disclaimer</span>
                        <DropdownMenu.ItemIndicator>
                            <Check size={14} className="text-blue-600" />
                        </DropdownMenu.ItemIndicator>
                    </DropdownMenu.CheckboxItem>

                    <DropdownMenu.CheckboxItem
                        className="flex items-center justify-between gap-4 px-2 py-2 text-sm text-gray-700 rounded hover:bg-gray-100 cursor-pointer outline-none"
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
                        <span>Simulate Thinking</span>
                        <DropdownMenu.ItemIndicator>
                            <Check size={14} className="text-blue-600" />
                        </DropdownMenu.ItemIndicator>
                    </DropdownMenu.CheckboxItem>
                </DropdownMenu.Content>
            </DropdownMenu.Portal>
        </DropdownMenu.Root>
    );
};
