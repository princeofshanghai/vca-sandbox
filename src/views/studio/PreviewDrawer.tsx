import { useState, useEffect } from 'react';
import { cn } from '@/utils/cn';
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

    return (
        <div className={cn(
            "fixed right-0 top-0 bottom-0 w-[520px] z-50 flex flex-col duration-300 fill-mode-forwards pointer-events-none",
            isOpen ? "animate-in slide-in-from-right" : "animate-out slide-out-to-right"
        )}>
            {/* Preview Content */}
            <div className="flex-1 overflow-hidden">
                <FlowPreview
                    flow={flow}
                    onUpdateFlow={onUpdateFlow}
                    isPremium={isPremium}
                    isMobile={isMobile}
                    onTogglePremium={onTogglePremium}
                    onToggleMobile={onToggleMobile}
                    variables={simulationVariables}
                    updateVariable={updateVariable}
                    usedVariables={usedVariables}
                />
            </div>
        </div >
    );
}
