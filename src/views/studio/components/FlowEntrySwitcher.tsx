import type { Flow } from '../types';
import { Play } from 'lucide-react';
import {
    ShellSelect,
    ShellSelectContent,
    ShellSelectItem,
    ShellSelectTrigger,
    ShellSelectValue,
} from '@/components/shell';
import {
    getFlowStartNodes,
    getStartNodeDisplayLabel,
    hasOutgoingConnectionFromStart,
    resolveStartStepId,
} from '../startNodes';

interface FlowEntrySwitcherProps {
    flow: Flow;
    value: string | null;
    onValueChange: (value: string) => void;
    tone?: 'default' | 'cinematicDark';
    triggerClassName?: string;
    contentClassName?: string;
    showStartIcon?: boolean;
}

export function FlowEntrySwitcher({
    flow,
    value,
    onValueChange,
    tone = 'default',
    triggerClassName,
    contentClassName,
    showStartIcon = false,
}: FlowEntrySwitcherProps) {
    const startNodes = getFlowStartNodes(flow);
    if (startNodes.length <= 1) {
        return null;
    }

    const selectedValue = resolveStartStepId(flow, value);
    const defaultStartStepId = resolveStartStepId(flow);

    const getDisplayLabel = (startNode: (typeof startNodes)[number]) => {
        const suffixes: string[] = [];
        if (startNode.id === defaultStartStepId) {
            suffixes.push('Default');
        }
        if (!hasOutgoingConnectionFromStart(flow, startNode.id)) {
            suffixes.push('Not connected');
        }

        const label = getStartNodeDisplayLabel(startNode);
        return suffixes.length > 0 ? `${label} (${suffixes.join(', ')})` : label;
    };

    const selectedStartNode = startNodes.find((startNode) => startNode.id === selectedValue) || null;

    return (
        <ShellSelect
            value={selectedValue || undefined}
            onValueChange={onValueChange}
        >
            <ShellSelectTrigger
                tone={tone}
                size="compact"
                aria-label="Select flow entry"
                className={triggerClassName}
            >
                {showStartIcon && selectedStartNode ? (
                    <div className="flex min-w-0 items-center gap-1.5">
                        <Play
                            size={12}
                            className="shrink-0 fill-current text-[rgb(var(--shell-node-start)/1)]"
                        />
                        <span className="truncate">
                            {getDisplayLabel(selectedStartNode)}
                        </span>
                    </div>
                ) : (
                    <ShellSelectValue placeholder="Select flow" />
                )}
            </ShellSelectTrigger>
            <ShellSelectContent tone={tone} className={contentClassName}>
                {startNodes.map((startNode) => {
                    const displayLabel = getDisplayLabel(startNode);

                    return (
                        <ShellSelectItem
                            key={startNode.id}
                            tone={tone}
                            size="compact"
                            value={startNode.id}
                        >
                            {showStartIcon ? (
                                <div className="flex min-w-0 items-center gap-1.5">
                                    <Play
                                        size={12}
                                        className="shrink-0 fill-current text-[rgb(var(--shell-node-start)/1)]"
                                    />
                                    <span className="truncate">{displayLabel}</span>
                                </div>
                            ) : (
                                displayLabel
                            )}
                        </ShellSelectItem>
                    );
                })}
            </ShellSelectContent>
        </ShellSelect>
    );
}
