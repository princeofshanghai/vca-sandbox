import { Settings, Check } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { FlowPreview } from './FlowPreview';
import { Flow } from './types';

interface PreviewDrawerProps {
    isOpen: boolean;
    flow: Flow;
    onUpdateFlow: (flow: Flow) => void;
    isPremium: boolean;
    isMobile: boolean;
    onTogglePremium: () => void;
    onToggleMobile: () => void;
}

export function PreviewDrawer({
    isOpen,
    flow,
    onUpdateFlow,
    isPremium,
    isMobile,
    onTogglePremium,
    onToggleMobile,
}: PreviewDrawerProps) {
    if (!isOpen) return null;

    const settings = flow.settings || { showDisclaimer: false, simulateThinking: false };

    const toggleSetting = (key: 'showDisclaimer' | 'simulateThinking') => {
        const currentSettings = flow.settings || { showDisclaimer: false, simulateThinking: false };
        onUpdateFlow({
            ...flow,
            settings: {
                ...currentSettings,
                [key]: !currentSettings[key]
            }
        });
    };

    return (
        <div className="fixed right-3 top-[64px] bottom-[64px] w-[480px] bg-white shadow-lg z-50 rounded-2xl flex flex-col animate-in slide-in-from-right duration-300 overflow-hidden border border-gray-200">
            {/* Floating Display Settings Button */}
            <div className="absolute top-3 right-3 z-10">
                <DropdownMenu.Root>
                    <DropdownMenu.Trigger asChild>
                        <button className="flex items-center justify-center p-2 text-gray-400 hover:text-gray-900 transition-colors cursor-default">
                            <Settings size={18} />
                        </button>
                    </DropdownMenu.Trigger>

                    <DropdownMenu.Portal>
                        <DropdownMenu.Content
                            align="end"
                            sideOffset={8}
                            className="min-w-[260px] bg-white rounded-lg shadow-lg border border-gray-200 p-2 z-[60] animate-in fade-in-0 zoom-in-95 cursor-default"
                        >
                            <DropdownMenu.Label className="text-xs font-semibold text-gray-400 px-2 py-1 mb-1">
                                Preview mode
                            </DropdownMenu.Label>

                            {/* Desktop Option */}
                            <DropdownMenu.CheckboxItem
                                className="flex items-center justify-between gap-4 px-2 py-2 text-sm text-gray-700 rounded hover:bg-gray-100 cursor-default outline-none"
                                checked={!isMobile}
                                onCheckedChange={() => !isMobile || onToggleMobile()}
                            >
                                <span>Desktop</span>
                                {!isMobile && <Check size={14} className="text-blue-600 shrink-0" />}
                            </DropdownMenu.CheckboxItem>

                            {/* Mobile Option */}
                            <DropdownMenu.CheckboxItem
                                className="flex items-center justify-between gap-4 px-2 py-2 text-sm text-gray-700 rounded hover:bg-gray-100 cursor-default outline-none"
                                checked={isMobile}
                                onCheckedChange={() => isMobile || onToggleMobile()}
                            >
                                <span>Mobile</span>
                                {isMobile && <Check size={14} className="text-blue-600 shrink-0" />}
                            </DropdownMenu.CheckboxItem>

                            <div className="h-px bg-gray-100 my-1"></div>

                            {/* Premium Branding */}
                            <DropdownMenu.CheckboxItem
                                className="flex items-center justify-between gap-4 px-2 py-2 text-sm text-gray-700 rounded hover:bg-gray-100 cursor-default outline-none"
                                checked={isPremium}
                                onCheckedChange={onTogglePremium}
                            >
                                <span>LinkedIn Premium branding</span>
                                {isPremium && <Check size={14} className="text-blue-600 shrink-0" />}
                            </DropdownMenu.CheckboxItem>

                            {/* Show Disclaimer */}
                            <DropdownMenu.CheckboxItem
                                className="flex items-center justify-between gap-4 px-2 py-2 text-sm text-gray-700 rounded hover:bg-gray-100 cursor-default outline-none"
                                checked={settings.showDisclaimer}
                                onCheckedChange={() => toggleSetting('showDisclaimer')}
                            >
                                <span>Show disclaimer</span>
                                {settings.showDisclaimer && <Check size={14} className="text-blue-600 shrink-0" />}
                            </DropdownMenu.CheckboxItem>

                            {/* Simulate Thinking */}
                            <DropdownMenu.CheckboxItem
                                className="flex items-center justify-between gap-4 px-2 py-2 text-sm text-gray-700 rounded hover:bg-gray-100 cursor-default outline-none"
                                checked={settings.simulateThinking}
                                onCheckedChange={() => toggleSetting('simulateThinking')}
                            >
                                <span>Simulate thinking</span>
                                {settings.simulateThinking && <Check size={14} className="text-blue-600 shrink-0" />}
                            </DropdownMenu.CheckboxItem>
                        </DropdownMenu.Content>
                    </DropdownMenu.Portal>
                </DropdownMenu.Root>
            </div>

            {/* Preview Content */}
            <div className="flex-1 overflow-hidden">
                <FlowPreview flow={flow} isPremium={isPremium} isMobile={isMobile} />
            </div>
        </div>
    );
}
