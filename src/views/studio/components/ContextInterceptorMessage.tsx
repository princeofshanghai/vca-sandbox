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
    onHide?: () => void;
    className?: string;
}

export function ContextInterceptorMessage({
    variableName,
    branches,
    onResolve,
    onHide,
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
            <div className="rounded-xl border border-shell-dark-border bg-shell-dark-panel p-3 shadow-2xl backdrop-blur-sm">
                <div className="mb-2.5 flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                        <Split size={14} className="shrink-0 text-shell-node-condition" />
                        <p className="truncate text-[13px] font-medium text-shell-dark-text">
                            Select path
                        </p>
                    </div>
                    {onHide && (
                        <button
                            onClick={onHide}
                            className="shrink-0 text-[11px] font-medium text-shell-dark-muted hover:text-shell-dark-text"
                        >
                            Hide
                        </button>
                    )}
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
                                        'h-8 max-w-full border-shell-dark-border bg-shell-dark-bg px-2.5 text-xs text-shell-dark-text hover:bg-shell-dark-surface',
                                        isDefault && 'text-shell-dark-muted'
                                    )}
                                >
                                    <span className="truncate">{pathLabel}</span>
                                    <span className="text-shell-dark-muted">(</span>
                                    {isDefault ? (
                                        <span className="font-mono text-[10px] text-shell-dark-muted">Fallback</span>
                                    ) : (
                                        <span className="inline-flex min-w-0 items-center gap-1 font-mono text-[10px]">
                                            <span className="truncate text-shell-dark-muted">{ruleVariable || variableName}</span>
                                            <span className="text-shell-dark-muted">=</span>
                                            <span className="truncate text-shell-accent-text">{ruleValue || 'value'}</span>
                                        </span>
                                    )}
                                    <span className="text-shell-dark-muted">)</span>
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
                                className="h-7 border-shell-dark-border bg-shell-dark-bg text-xs text-shell-dark-text placeholder:text-shell-dark-muted focus-visible:border-shell-accent focus-visible:ring-shell-accent/30"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && customValue.trim()) {
                                        onResolve(customValue.trim());
                                    }
                                }}
                            />
                            <Button
                                size="sm"
                                onClick={() => customValue.trim() && onResolve(customValue.trim())}
                                className="h-7 border-0 bg-shell-accent px-3 text-xs text-shell-dark-text hover:bg-shell-accent-hover"
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
