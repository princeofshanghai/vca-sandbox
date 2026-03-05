import { useState } from 'react';
import { Branch } from '@/views/studio/types';
import { Split } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/utils/cn';

interface ContextInterceptorMessageProps {
    variableName: string;
    branches: Branch[];
    onResolve: (value: string) => void;
    className?: string;
}

export function ContextInterceptorMessage({
    variableName,
    branches,
    onResolve,
    className
}: ContextInterceptorMessageProps) {
    const [customValue, setCustomValue] = useState('');

    const relevantBranches = branches.filter((branch) => (
        branch.isDefault ||
        (branch.logic?.variable === variableName && branch.logic?.value !== undefined)
    ));

    const pathChoices = relevantBranches.map((branch) => {
        const isDefault = !!branch.isDefault;
        const pathLabel = branch.condition?.trim() || (isDefault ? 'Default' : 'Path');
        const ruleVariable = branch.logic?.variable || variableName;
        const ruleValue = branch.logic?.value !== undefined ? String(branch.logic.value) : '';

        return {
            id: branch.id,
            value: isDefault ? '__USE_DEFAULT__' : ruleValue,
            isDefault,
            pathLabel,
            ruleVariable,
            ruleValue
        };
    });

    const shouldShowInputFirst = pathChoices.length === 0;

    return (
        <div className={cn('animate-in fade-in slide-in-from-bottom-2 duration-300', className)}>
            <div className="rounded-xl border border-shell-node-condition/35 bg-[rgb(var(--shell-node-condition-surface)/1)] p-3 shadow-sm">
                <div className="mb-2.5 flex items-center gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                        <Split size={14} className="shrink-0 text-shell-node-condition" />
                        <p className="truncate text-[13px] font-medium text-shell-muted-strong">
                            Select path
                        </p>
                    </div>
                </div>

                <div className="space-y-2">
                    {pathChoices.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {pathChoices.map(({ id, value, pathLabel, ruleVariable, ruleValue, isDefault }) => (
                                <Button
                                    key={id}
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onResolve(value)}
                                    className={cn(
                                        'h-8 min-w-0 max-w-[170px] border-shell-border bg-shell-bg px-2 text-xs text-shell-text shadow-sm hover:border-shell-node-condition/60 hover:bg-shell-surface',
                                        isDefault && 'text-shell-muted-strong'
                                    )}
                                >
                                    <span className="truncate text-[13px] font-medium">{pathLabel}</span>
                                    {isDefault ? (
                                        <span className="ml-1 truncate font-mono text-[13px] text-shell-muted-strong">Fallback</span>
                                    ) : (
                                        <span className="ml-1 inline-flex min-w-0 items-center gap-0.5 font-mono text-[13px]">
                                            <span className="truncate text-shell-muted-strong">{ruleVariable || variableName}</span>
                                            <span className="text-shell-muted">=</span>
                                            <span className="truncate font-semibold text-shell-accent-text">{ruleValue || 'value'}</span>
                                        </span>
                                    )}
                                </Button>
                            ))}
                        </div>
                    )}

                    {shouldShowInputFirst && (
                        <div className="flex gap-2 animate-in fade-in zoom-in-95">
                            <Input
                                autoFocus
                                value={customValue}
                                onChange={(e) => setCustomValue(e.target.value)}
                                placeholder={`Type a value for ${variableName}`}
                                className="h-7 border-shell-border bg-shell-bg text-xs text-shell-text placeholder:text-shell-muted focus-visible:border-shell-node-condition focus-visible:ring-shell-node-condition/20"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && customValue.trim()) {
                                        onResolve(customValue.trim());
                                    }
                                }}
                            />
                            <Button
                                size="sm"
                                onClick={() => customValue.trim() && onResolve(customValue.trim())}
                                className="h-7 border border-shell-node-condition/50 bg-shell-bg px-3 text-xs text-shell-text hover:bg-shell-surface"
                            >
                                Continue
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
