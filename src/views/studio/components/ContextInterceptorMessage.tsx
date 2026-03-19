import { Branch } from '@/views/studio/types';
import { Split } from 'lucide-react';
import { cn } from '@/utils/cn';
import { ShellButton } from '@/components/shell';
import { getConditionPathLabel, getConditionQuestionLabel, getConditionRuleSummary } from '../conditionBranchLabels';

export type ContextInterceptorResolution = { type: 'branch'; branchId: string };

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
    const resolvedQuestionLabel = getConditionQuestionLabel(question);
    const questionLabel = resolvedQuestionLabel || 'Condition';

    const pathChoices = branches.map((branch) => {
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
                                    {showRuleSummary && ruleSummary && (
                                        <span className="mt-0.5 block text-[12px] leading-snug break-words text-shell-muted-strong">
                                            {ruleSummary}
                                        </span>
                                    )}
                                </span>
                            </ShellButton>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
