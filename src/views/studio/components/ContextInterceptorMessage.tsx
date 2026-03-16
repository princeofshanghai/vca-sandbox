import { useState } from 'react';
import { Branch } from '@/views/studio/types';
import { Split } from 'lucide-react';
import { cn } from '@/utils/cn';
import { ShellButton, ShellInput } from '@/components/shell';
import { getConditionPathLabel, getConditionQuestionLabel, getConditionRuleSummary } from '../conditionBranchLabels';

export type ContextInterceptorResolution =
    | { type: 'branch'; branchId: string }
    | { type: 'value'; value: string };

interface ContextInterceptorMessageProps {
    question?: string;
    variableName: string;
    branches: Branch[];
    onResolve: (resolution: ContextInterceptorResolution) => void;
    className?: string;
    showRuleSummary?: boolean;
}

export function ContextInterceptorMessage({
    question,
    variableName,
    branches,
    onResolve,
    className,
    showRuleSummary = false,
}: ContextInterceptorMessageProps) {
    const [customValue, setCustomValue] = useState('');
    const resolvedQuestionLabel = getConditionQuestionLabel(question);
    const questionLabel = resolvedQuestionLabel || 'Condition';

    const relevantBranches = branches.filter((branch) => (
        branch.isDefault ||
        (branch.logic?.value !== undefined && String(branch.logic.value).trim() !== '')
    ));

    const pathChoices = relevantBranches.map((branch) => {
        const isDefault = !!branch.isDefault;
        const pathLabel = getConditionPathLabel(branch);
        const ruleSummary = getConditionRuleSummary(branch, variableName);

        return {
            id: branch.id,
            isDefault,
            pathLabel,
            ruleSummary
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
                            {questionLabel}
                        </p>
                    </div>
                </div>

                <div className="space-y-2">
                    {pathChoices.length > 0 && (
                        <div className="max-h-[220px] space-y-2 overflow-y-auto pr-1 thin-scrollbar">
                            {pathChoices.map(({ id, pathLabel, ruleSummary, isDefault }) => (
                                <ShellButton
                                    key={id}
                                    variant="outline"
                                    onClick={() => onResolve({ type: 'branch', branchId: id })}
                                    className={cn(
                                        'h-auto w-full items-start justify-start border-shell-border bg-shell-bg px-3 py-2.5 text-left shadow-sm hover:border-shell-node-condition/60 hover:bg-shell-surface',
                                        isDefault ? 'text-shell-muted-strong' : 'text-shell-text'
                                    )}
                                >
                                    <span className="w-full min-w-0">
                                        <span className="block text-[13px] font-semibold leading-snug break-words">{pathLabel}</span>
                                        {showRuleSummary && (
                                            isDefault ? (
                                                <span className="mt-0.5 block text-[12px] text-shell-muted-strong leading-snug break-words">
                                                    {ruleSummary}
                                                </span>
                                            ) : (
                                                <span className="mt-0.5 block text-[12px] leading-snug break-words text-shell-muted-strong">
                                                    {ruleSummary || `${variableName} is value`}
                                                </span>
                                            )
                                        )}
                                    </span>
                                </ShellButton>
                            ))}
                        </div>
                    )}

                    {shouldShowInputFirst && (
                        <div className="flex gap-2 animate-in fade-in zoom-in-95">
                            <ShellInput
                                autoFocus
                                size="compact"
                                value={customValue}
                                onChange={(e) => setCustomValue(e.target.value)}
                                placeholder={resolvedQuestionLabel ? 'Enter a value to continue' : 'Enter a value'}
                                className="text-xs focus-visible:border-shell-node-condition focus-visible:ring-shell-node-condition/20"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && customValue.trim()) {
                                        onResolve({ type: 'value', value: customValue.trim() });
                                    }
                                }}
                            />
                            <ShellButton
                                size="compact"
                                variant="outline"
                                onClick={() => customValue.trim() && onResolve({ type: 'value', value: customValue.trim() })}
                                className="border-shell-node-condition/50 bg-shell-bg px-3 text-xs text-shell-text hover:bg-shell-surface"
                            >
                                Continue
                            </ShellButton>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
