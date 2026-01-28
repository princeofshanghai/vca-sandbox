import { useState, useEffect } from 'react';
import { Settings, Check } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { cn } from '@/utils/cn';
import { FlowPreview } from './FlowPreview';
import { Flow } from './types';
import { Button } from '@/components/ui/button';

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
    const [shouldRender, setShouldRender] = useState(isOpen);
    const [simulationVariables, setSimulationVariables] = useState<Record<string, string>>({});

    // Extract variables used in conditions
    const usedVariables = Array.from(new Set(
        flow.steps
            ?.filter(s => s.type === 'condition')
            .flatMap(s => (s as import('./types').Condition).branches)
            .map(b => b.logic?.variable)
            .filter((v): v is string => !!v)
        || []
    ));

    const usedVariablesString = JSON.stringify(usedVariables);

    useEffect(() => {
        // Initialize new variables with empty string if not present
        setSimulationVariables(prev => {
            const next = { ...prev };
            let changed = false;
            usedVariables.forEach(v => {
                if (!(v in next)) {
                    next[v] = '';
                    changed = true;
                }
            });
            return changed ? next : prev;
        });
    }, [usedVariablesString, usedVariables]);

    const updateVariable = (key: string, value: string) => {
        setSimulationVariables(prev => ({
            ...prev,
            [key]: value
        }));
    };

    useEffect(() => {
        if (isOpen) {
            setShouldRender(true);
        } else {
            const timer = setTimeout(() => setShouldRender(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!shouldRender) return null;

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
        <div className={cn(
            "fixed right-3 top-[64px] bottom-[64px] w-[480px] bg-white shadow-lg z-50 rounded-2xl flex flex-col border border-gray-200 duration-300 fill-mode-forwards",
            isOpen ? "animate-in slide-in-from-right" : "animate-out slide-out-to-right"
        )}>
            {/* Floating Display Settings Button */}
            <div className="absolute bottom-[calc(100%+12px)] left-0 z-10">
                <DropdownMenu.Root>
                    <DropdownMenu.Trigger asChild>
                        <Button
                            variant="outline"
                            size="sm"
                            className="bg-white border-gray-200 text-gray-600 hover:text-gray-900 transition-all flex items-center gap-2"
                        >
                            <Settings size={16} strokeWidth={2} />
                            Display
                        </Button>
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
                            {/* Simulation Variables Section */}
                            <>
                                <div className="h-px bg-gray-100 my-1"></div>
                                <DropdownMenu.Label className="text-xs font-semibold text-gray-400 px-2 py-1 mb-1 mt-1">
                                    Simulation Context
                                </DropdownMenu.Label>
                                {usedVariables.length === 0 ? (
                                    <div className="px-2 py-2 text-xs text-gray-500 italic text-center bg-gray-50 rounded mx-2 border border-dashed border-gray-200">
                                        No variables defined in logic
                                    </div>
                                ) : (
                                    usedVariables.map(variable => (
                                        <div key={variable} className="px-2 py-1">
                                            <div className="text-[10px] text-gray-500 mb-0.5 ml-1">{variable}</div>
                                            <input
                                                type="text"
                                                value={simulationVariables[variable] || ''}
                                                onChange={(e) => updateVariable(variable, e.target.value)}
                                                className="w-full text-xs bg-gray-50 border border-gray-200 rounded px-2 py-1 focus:border-blue-500 focus:outline-none"
                                                placeholder="Value..."
                                                onClick={(e) => e.stopPropagation()} // Prevent menu closing
                                                onKeyDown={(e) => e.stopPropagation()}
                                            />
                                        </div>
                                    ))
                                )}
                            </>

                        </DropdownMenu.Content>
                    </DropdownMenu.Portal>
                </DropdownMenu.Root>
            </div>

            {/* Preview Content */}
            <div className="flex-1 overflow-hidden">
                <FlowPreview
                    flow={flow}
                    isPremium={isPremium}
                    isMobile={isMobile}
                    variables={simulationVariables}
                />
            </div>
        </div >
    );
}
