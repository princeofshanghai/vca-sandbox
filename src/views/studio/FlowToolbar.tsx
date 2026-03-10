
import { Download, Upload, Settings } from 'lucide-react';
import { Flow } from './types';
import { useRef } from 'react';
import {
    ShellButton,
    ShellIconButton,
    ShellMenu,
    ShellMenuCheckboxItem,
    ShellMenuContent,
    ShellMenuLabel,
    ShellMenuSeparator,
    ShellMenuTrigger,
} from '@/components/shell';

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
            } catch (_err) {
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


            <ShellIconButton
                onClick={handleImportClick}
                variant="ghost"
                className="text-shell-muted hover:text-shell-accent hover:bg-shell-accent-soft"
                title="Import JSON"
                aria-label="Import JSON"
            >
                <Upload size={18} />
            </ShellIconButton>
            <ShellIconButton
                onClick={handleExport}
                variant="ghost"
                className="text-shell-muted hover:text-shell-accent hover:bg-shell-accent-soft"
                title="Export JSON"
                aria-label="Export JSON"
            >
                <Download size={18} />
            </ShellIconButton>

            <div className="w-px h-6 bg-shell-border mx-1"></div>

            <ShellMenu>
                <ShellMenuTrigger asChild>
                    <ShellButton
                        variant="outline"
                        size="sm"
                        className="h-8 gap-2 px-3 text-xs text-shell-muted-strong shadow-sm"
                        title="Display Settings"
                    >
                        <Settings size={16} />
                        <span>Display</span>
                    </ShellButton>
                </ShellMenuTrigger>

                <ShellMenuContent align="end" sideOffset={8} className="min-w-[260px]">
                    <ShellMenuLabel className="mb-1 text-xs font-semibold uppercase tracking-wider text-shell-muted">
                        Display settings
                    </ShellMenuLabel>

                    <ShellMenuCheckboxItem
                        checked={settings.showDisclaimer}
                        onCheckedChange={() => toggleSetting('showDisclaimer')}
                    >
                        <span>Show Disclaimer</span>
                    </ShellMenuCheckboxItem>

                    <ShellMenuCheckboxItem
                        checked={settings.simulateThinking}
                        onCheckedChange={() => toggleSetting('simulateThinking')}
                    >
                        <span>Simulate Thinking</span>
                    </ShellMenuCheckboxItem>

                    <ShellMenuSeparator />

                    <ShellMenuCheckboxItem checked={isMobile} onCheckedChange={onToggleMobile}>
                        <span>View as Mobile</span>
                    </ShellMenuCheckboxItem>

                    <ShellMenuCheckboxItem checked={isPremium} onCheckedChange={onTogglePremium}>
                        <span>View as LinkedIn Premium member</span>
                    </ShellMenuCheckboxItem>
                </ShellMenuContent>
            </ShellMenu>
        </div>
    );
};
