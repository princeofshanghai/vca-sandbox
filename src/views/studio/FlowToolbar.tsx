
import { Download, Upload, Settings, Check } from 'lucide-react';
import { Flow } from './types';
import { useRef } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

interface FlowToolbarProps {
    flow: Flow;
    onLoadFlow: (flow: Flow) => void;
    onUpdateFlow: (flow: Flow) => void;
    isPremium: boolean;
    onTogglePremium: () => void;
    isMobile: boolean;
    onToggleMobile: () => void;
}

export const FlowToolbar = ({ flow, onLoadFlow, onUpdateFlow, isPremium, onTogglePremium, isMobile, onToggleMobile }: FlowToolbarProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleExport = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(flow, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `${flow.title.replace(/\s+/g, '_').toLowerCase() || "flow"}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const json = JSON.parse(event.target?.result as string);
                // Basic validation
                if (json.id && Array.isArray(json.blocks)) {
                    // Ensure backward compatibility or validation here
                    onLoadFlow(json);
                } else {
                    alert("Invalid flow file");
                }
            } catch (err) {
                alert("Error reading file");
            }
        };
        reader.readAsText(file);
        // Reset input
        e.target.value = '';
    };

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

    const settings = flow.settings || { showDisclaimer: false, simulateThinking: false };

    return (
        <div className="flex items-center gap-2">
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".json"
                onChange={handleFileChange}
            />


            <button
                onClick={handleImportClick}
                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                title="Import JSON"
            >
                <Upload size={18} />
            </button>
            <button
                onClick={handleExport}
                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                title="Export JSON"
            >
                <Download size={18} />
            </button>

            <div className="w-px h-6 bg-gray-200 mx-1"></div>

            <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                    <button
                        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                        title="Display Settings"
                    >
                        <Settings size={16} />
                        <span>Display</span>
                    </button>
                </DropdownMenu.Trigger>

                <DropdownMenu.Portal>
                    <DropdownMenu.Content
                        align="end"
                        sideOffset={8}
                        className="min-w-[260px] bg-white rounded-lg shadow-lg border border-gray-200 p-2 z-50 animate-in fade-in-0 zoom-in-95 data-[side=bottom]:slide-in-from-top-2"
                    >
                        <DropdownMenu.Label className="text-xs font-semibold text-gray-400 px-2 py-1 uppercase tracking-wider mb-1">
                            Display settings
                        </DropdownMenu.Label>

                        <DropdownMenu.CheckboxItem
                            className="flex items-center justify-between gap-4 px-2 py-2 text-sm text-gray-700 rounded hover:bg-gray-100 cursor-pointer outline-none"
                            checked={settings.showDisclaimer}
                            onCheckedChange={() => toggleSetting('showDisclaimer')}
                        >
                            <span>Show Disclaimer</span>
                            {settings.showDisclaimer && <Check size={14} className="text-blue-600 shrink-0" />}
                        </DropdownMenu.CheckboxItem>

                        <DropdownMenu.CheckboxItem
                            className="flex items-center justify-between gap-4 px-2 py-2 text-sm text-gray-700 rounded hover:bg-gray-100 cursor-pointer outline-none"
                            checked={settings.simulateThinking}
                            onCheckedChange={() => toggleSetting('simulateThinking')}
                        >
                            <span>Simulate Thinking</span>
                            {settings.simulateThinking && <Check size={14} className="text-blue-600 shrink-0" />}
                        </DropdownMenu.CheckboxItem>

                        <div className="h-px bg-gray-100 my-1"></div>

                        <DropdownMenu.CheckboxItem
                            className="flex items-center justify-between gap-4 px-2 py-2 text-sm text-gray-700 rounded hover:bg-gray-100 cursor-pointer outline-none"
                            checked={isMobile}
                            onCheckedChange={onToggleMobile}
                        >
                            <span>View as Mobile</span>
                            {isMobile && <Check size={14} className="text-blue-600 shrink-0" />}
                        </DropdownMenu.CheckboxItem>

                        <DropdownMenu.CheckboxItem
                            className="flex items-center justify-between gap-4 px-2 py-2 text-sm text-gray-700 rounded hover:bg-gray-100 cursor-pointer outline-none"
                            checked={isPremium}
                            onCheckedChange={onTogglePremium}
                        >
                            <span>View as LinkedIn Premium member</span>
                            {isPremium && <Check size={14} className="text-blue-600 shrink-0" />}
                        </DropdownMenu.CheckboxItem>
                    </DropdownMenu.Content>
                </DropdownMenu.Portal>
            </DropdownMenu.Root>
        </div>
    );
};
