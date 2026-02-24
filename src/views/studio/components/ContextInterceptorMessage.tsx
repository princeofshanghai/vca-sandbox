import { useState } from 'react';
import { Branch } from '@/views/studio/types';
import { Plus, Split } from 'lucide-react';
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
    const [isCustom, setIsCustom] = useState(false);

    const relevantBranches = branches.filter((branch) => (
        branch.isDefault ||
        (branch.logic?.variable === variableName && branch.logic?.value !== undefined)
    ));

    const pathChoices = relevantBranches.map((branch) => ({
        id: branch.id,
        label: branch.condition || (branch.logic?.value !== undefined ? String(branch.logic.value) : 'Default'),
        value: branch.isDefault
            ? '__USE_DEFAULT__'
            : String(branch.logic?.value ?? ''),
        isDefault: !!branch.isDefault
    }));

    const labelCounts = pathChoices.reduce((acc, choice) => {
        const key = choice.label.trim().toLowerCase();
        acc.set(key, (acc.get(key) || 0) + 1);
        return acc;
    }, new Map<string, number>());

    const defaultBranchLabel = branches.find(b => b.isDefault)?.condition || 'Default path';
    const shouldShowInputFirst = pathChoices.length === 0;

    return (
        <div className={cn('animate-in fade-in slide-in-from-bottom-2 duration-300', className)}>
            <div className="rounded-xl border border-shell-border bg-[rgb(var(--shell-node-condition-surface)/1)] p-3 shadow-[0_12px_28px_rgb(15_23_42/0.14)]">
                <div className="mb-2.5 flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-md border border-shell-border bg-shell-bg/80">
                        <Split size={13} className="text-shell-node-condition" />
                    </div>
                    <p className="truncate text-[13px] font-medium text-shell-text">
                        Which path do you want to preview?
                    </p>
                </div>

                <div className="space-y-2">
                    {!isCustom && pathChoices.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {pathChoices.map(({ id, value, label, isDefault }) => {
                                const hasDuplicateLabel = (labelCounts.get(label.trim().toLowerCase()) || 0) > 1;
                                const shouldShowValueHint = !isDefault && hasDuplicateLabel && value;
                                return (
                                <Button
                                    key={id}
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onResolve(value)}
                                    className={cn(
                                        'h-7 border-shell-border bg-shell-bg px-2.5 text-xs text-shell-text hover:bg-shell-surface',
                                        isDefault && 'text-shell-muted-strong'
                                    )}
                                >
                                    {shouldShowValueHint
                                        ? `${label} (${value})`
                                        : (label || (isDefault ? defaultBranchLabel : value))}
                                </Button>
                                );
                            })}
                        </div>
                    )}

                    {isCustom || shouldShowInputFirst ? (
                        <div className="flex gap-2 animate-in fade-in zoom-in-95">
                            <Input
                                autoFocus
                                value={customValue}
                                onChange={(e) => setCustomValue(e.target.value)}
                                placeholder={`Type a value for ${variableName}`}
                                className="h-7 border-shell-border bg-shell-bg text-xs focus-visible:border-shell-accent focus-visible:ring-shell-accent/30"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && customValue.trim()) {
                                        onResolve(customValue.trim());
                                    }
                                }}
                            />
                            <Button
                                size="sm"
                                onClick={() => customValue.trim() && onResolve(customValue.trim())}
                                className="h-7 border-0 bg-shell-accent px-3 text-xs text-white hover:bg-shell-accent-hover"
                            >
                                Continue
                            </Button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setIsCustom(true)}
                            className="flex items-center gap-1 text-xs font-medium text-shell-muted-strong transition-colors hover:text-shell-text"
                        >
                            <Plus size={12} />
                            Type a different value
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
