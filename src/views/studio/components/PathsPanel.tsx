import { useEffect, useMemo, useState } from 'react';
import { Check, ChevronDown, RotateCcw, Split } from 'lucide-react';
import { cn } from '@/utils/cn';
import { ShellButton, ShellNotice, ShellSelectableRow } from '@/components/shell';
import type { Branch } from '../types';
import { getConditionPathLabel } from '../conditionBranchLabels';

export interface PathsPanelDecision {
    stepId: string;
    stepLabel: string;
    variableName: string;
    branches: Branch[];
    selectedBranchId: string | null;
    selectedLabel: string;
    mode: 'selection' | 'interceptor';
}

interface PathsPanelProps {
    decisions: PathsPanelDecision[];
    onChangePath: (decision: PathsPanelDecision, branchId: string) => void;
    isLoading?: boolean;
    tone?: 'default' | 'cinematicDark';
    onResetPaths?: () => void;
    className?: string;
    variant?: 'panel' | 'popover';
}

const getSelectedPathLabel = (decision: PathsPanelDecision) => {
    const selectedBranch = decision.selectedBranchId
        ? decision.branches.find((branch) => branch.id === decision.selectedBranchId)
        : null;

    if (selectedBranch) {
        return getConditionPathLabel(selectedBranch);
    }

    return decision.mode === 'interceptor' ? 'Choose path' : decision.selectedLabel;
};

export function PathsPanel({
    decisions,
    onChangePath,
    isLoading = false,
    tone = 'default',
    onResetPaths,
    className,
    variant = 'panel',
}: PathsPanelProps) {
    const pendingDecision = useMemo(
        () => decisions.find((decision) => decision.mode === 'interceptor') || null,
        [decisions]
    );
    const chosenDecisions = useMemo(
        () => decisions.filter((decision) => decision.mode === 'selection'),
        [decisions]
    );
    const [expandedStepId, setExpandedStepId] = useState<string | null>(null);

    useEffect(() => {
        if (pendingDecision) return;
        if (!expandedStepId) return;
        if (chosenDecisions.some((decision) => decision.stepId === expandedStepId)) return;
        setExpandedStepId(null);
    }, [chosenDecisions, expandedStepId, pendingDecision]);

    const sectionLabelClassName = tone === 'cinematicDark'
        ? 'text-[11px] font-semibold uppercase tracking-[0.08em] text-shell-dark-muted'
        : 'text-[11px] font-semibold uppercase tracking-[0.08em] text-shell-muted';
    const secondaryTextClassName = tone === 'cinematicDark'
        ? 'text-shell-dark-muted'
        : 'text-shell-muted-strong';
    const pendingContainerClassName = tone === 'cinematicDark'
        ? 'rounded-xl border border-shell-dark-accent/25 bg-shell-dark-surface/55 p-3.5'
        : 'rounded-xl border border-shell-accent/20 bg-shell-surface-subtle p-3.5';
    const chipClassName = tone === 'cinematicDark'
        ? 'border-shell-dark-border bg-shell-dark-surface text-shell-dark-text'
        : 'border-shell-border bg-shell-surface-subtle text-shell-text';
    const emptyNoticeTone = tone === 'cinematicDark' ? 'cinematicDark' : 'default';
    const resetButtonClassName = tone === 'cinematicDark'
        ? 'border-shell-dark-border bg-shell-dark-surface text-shell-dark-muted hover:bg-shell-dark-surface hover:text-shell-dark-text'
        : undefined;
    const isPopover = variant === 'popover';
    const popoverChoiceClassName = 'rounded-xl border border-shell-border/70 bg-shell-bg px-3 py-1.5 shadow-none hover:border-shell-border hover:bg-shell-surface-subtle';
    const popoverSelectedChoiceClassName = 'rounded-xl border border-shell-accent/20 bg-shell-accent/5 px-3 py-1.5 shadow-none hover:border-shell-accent/20 hover:bg-shell-accent/5';
    const popoverDecisionRowClassName = 'rounded-xl border border-shell-border/70 bg-shell-bg px-3 py-2 shadow-none';
    const popoverDecisionTitleClassName = cn(
        'truncate text-[12px] font-medium',
        tone === 'cinematicDark' ? 'text-shell-dark-text' : 'text-shell-text'
    );
    const popoverSecondaryTextClassName = tone === 'cinematicDark'
        ? 'text-[10px] font-medium text-shell-dark-muted'
        : 'text-[10px] font-medium text-shell-muted-strong';
    const popoverSectionLabelClassName = tone === 'cinematicDark'
        ? 'text-[11px] font-medium text-shell-dark-muted'
        : 'text-[11px] font-medium text-shell-muted-strong';
    const shouldShowPreviousPaths = chosenDecisions.length > 0;
    const popoverActionButtonClassName = tone === 'cinematicDark'
        ? 'w-full justify-center gap-1.5 border-shell-dark-border bg-shell-dark-surface text-shell-dark-text hover:bg-shell-dark-surface'
        : 'w-full justify-center gap-1.5';
    const showPopoverActionRow = isPopover && !!onResetPaths;

    if (isLoading) {
        if (isPopover) {
            return (
                <div className={cn('px-3 py-4', className)}>
                    <p className="text-sm font-medium text-shell-muted-strong">Loading paths...</p>
                </div>
            );
        }

        return (
            <div className={cn(isPopover ? 'p-2.5' : 'p-3', className)}>
                <ShellNotice
                    tone={emptyNoticeTone}
                    size="compact"
                    description="Loading paths..."
                />
            </div>
        );
    }

    if (decisions.length === 0) {
        if (isPopover) {
            return (
                <div className={cn('space-y-1 px-3 py-4', className)}>
                    <p className="text-sm font-medium text-shell-muted-strong">No paths yet</p>
                    <p className="text-xs leading-relaxed text-shell-muted">
                        Path choices appear when your flow reaches a condition.
                    </p>
                </div>
            );
        }

        return (
            <div className={cn(isPopover ? 'p-2.5' : 'p-3', className)}>
                <ShellNotice
                    tone={emptyNoticeTone}
                    size="compact"
                    title="No paths yet"
                    description="Path choices appear when your flow reaches a condition."
                />
            </div>
        );
    }

    return (
        <div className={cn('flex h-full min-h-0 flex-col', className)}>
            <div className={cn('flex-1 overflow-y-auto thin-scrollbar', isPopover ? 'space-y-4 px-3 py-3' : 'space-y-4 p-3')}>
                {pendingDecision ? (
                    <section className={isPopover ? 'space-y-2.5' : 'space-y-2'}>
                        {!isPopover ? (
                            <div className="space-y-1">
                                <h3 className={sectionLabelClassName}>Needs a choice</h3>
                                <p className={cn('text-xs', secondaryTextClassName)}>
                                    Pick a path to keep the prototype moving.
                                </p>
                            </div>
                        ) : null}
                        {isPopover ? (
                            <div className={pendingContainerClassName}>
                                <div className="space-y-2.5">
                                    <div className="flex items-center gap-2.5">
                                        <Split
                                            size={13}
                                            className="mt-0.5 shrink-0 text-shell-node-condition/85"
                                        />
                                        <div className="min-w-0 flex-1">
                                            <p className={popoverDecisionTitleClassName}>
                                                {pendingDecision.stepLabel}
                                            </p>
                                        </div>
                                        <span
                                            className={cn('shrink-0 truncate text-right', popoverSecondaryTextClassName)}
                                            title="Choose path"
                                        >
                                            Choose path
                                        </span>
                                    </div>

                                    <div className="space-y-1.5">
                                        {pendingDecision.branches.map((branch) => {
                                            const label = getConditionPathLabel(branch);

                                            return (
                                                <ShellSelectableRow
                                                    key={branch.id}
                                                    tone={tone}
                                                    size="compact"
                                                    onClick={() => onChangePath(pendingDecision, branch.id)}
                                                    className={cn(
                                                        'items-center',
                                                        popoverChoiceClassName
                                                    )}
                                                >
                                                    <div className="flex min-w-0 flex-1 items-center">
                                                        <span className={cn('truncate text-[12px] font-medium', tone === 'cinematicDark' ? 'text-shell-dark-text' : 'text-shell-text')}>
                                                            {label}
                                                        </span>
                                                    </div>
                                                </ShellSelectableRow>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className={pendingContainerClassName}>
                                <div className="mb-2.5 flex items-start gap-2">
                                    <Split
                                        size={14}
                                        className={tone === 'cinematicDark' ? 'mt-0.5 shrink-0 text-shell-node-condition' : 'mt-0.5 shrink-0 text-shell-node-condition'}
                                    />
                                    <div className="min-w-0">
                                        <p className={cn('text-sm font-semibold', tone === 'cinematicDark' ? 'text-shell-dark-text' : 'text-shell-text')}>
                                            {pendingDecision.stepLabel}
                                        </p>
                                        <p className={cn('mt-0.5 text-xs', secondaryTextClassName)}>
                                            Choose a path
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    {pendingDecision.branches.map((branch) => {
                                        const label = getConditionPathLabel(branch);

                                        return (
                                            <ShellSelectableRow
                                                key={branch.id}
                                                tone={tone}
                                                size="compact"
                                                onClick={() => onChangePath(pendingDecision, branch.id)}
                                                className="items-center"
                                            >
                                                <div className="flex min-w-0 flex-1 items-center gap-2">
                                                    <span className={cn('truncate text-sm font-medium', tone === 'cinematicDark' ? 'text-shell-dark-text' : 'text-shell-text')}>
                                                        {label}
                                                    </span>
                                                </div>
                                            </ShellSelectableRow>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </section>
                ) : null}

                {shouldShowPreviousPaths ? (
                    <section className="space-y-2">
                        {!isPopover ? (
                            <div className="space-y-1">
                                <h3 className={sectionLabelClassName}>Chosen paths</h3>
                                <p className={cn('text-xs', secondaryTextClassName)}>
                                    Reopen any earlier decision to change it.
                                </p>
                            </div>
                        ) : (
                            <div className="px-1">
                                <h3 className={popoverSectionLabelClassName}>Previous</h3>
                            </div>
                        )}

                        <div className={isPopover ? 'space-y-1.5' : 'space-y-2'}>
                            {chosenDecisions.map((decision) => {
                                const isExpanded = expandedStepId === decision.stepId;
                                const selectedPathLabel = getSelectedPathLabel(decision);

                                return (
                                    <div key={decision.stepId} className="space-y-1.5">
                                        <ShellSelectableRow
                                            tone={tone}
                                            selected={isExpanded}
                                            onClick={() => setExpandedStepId((current) => current === decision.stepId ? null : decision.stepId)}
                                            className={cn('items-center', isPopover ? `${popoverDecisionRowClassName} hover:bg-shell-surface-subtle` : undefined)}
                                        >
                                            <Split
                                                size={13}
                                                className={tone === 'cinematicDark' ? 'mt-0.5 shrink-0 text-shell-node-condition/85' : 'mt-0.5 shrink-0 text-shell-node-condition/85'}
                                            />
                                            <div className="min-w-0 flex-1">
                                                <p className={cn(
                                                    isPopover ? 'truncate text-[11px] font-medium' : 'truncate text-sm font-medium',
                                                    !isPopover && (tone === 'cinematicDark' ? 'text-shell-dark-text' : 'text-shell-text')
                                                )}>
                                                    {decision.stepLabel}
                                                </p>
                                            </div>
                                            <span
                                                className={cn(
                                                    'inline-flex max-w-[42%] shrink-0 items-center truncate rounded-full border px-2 py-0.5 text-[10px] font-medium',
                                                    isPopover
                                                        ? (tone === 'cinematicDark'
                                                            ? 'border-shell-dark-border/70 bg-shell-dark-surface text-shell-dark-muted'
                                                            : 'border-shell-border/70 bg-shell-surface-subtle text-shell-muted-strong')
                                                        : chipClassName
                                                )}
                                                title={selectedPathLabel}
                                            >
                                                {selectedPathLabel}
                                            </span>
                                            <ChevronDown
                                                size={14}
                                                className={cn(
                                                    'shrink-0 transition-transform',
                                                    tone === 'cinematicDark' ? 'text-shell-dark-muted' : 'text-shell-muted',
                                                    isExpanded ? 'rotate-180' : ''
                                                )}
                                            />
                                        </ShellSelectableRow>

                                        {isExpanded ? (
                                            <div className={cn('space-y-1.5', isPopover ? 'pl-2.5' : 'pl-2')}>
                                                {decision.branches.map((branch) => {
                                                    const label = getConditionPathLabel(branch);
                                                    const isSelected = branch.id === decision.selectedBranchId;

                                                    return (
                                                        <ShellSelectableRow
                                                            key={branch.id}
                                                            tone={tone}
                                                            size="compact"
                                                            selected={isSelected}
                                                            onClick={() => onChangePath(decision, branch.id)}
                                                            className={cn(
                                                                'items-center',
                                                                isPopover
                                                                    ? isSelected
                                                                        ? popoverSelectedChoiceClassName
                                                                        : popoverChoiceClassName
                                                                    : undefined
                                                            )}
                                                        >
                                                            <div className="flex min-w-0 flex-1 items-center gap-2">
                                                                <span className={cn(isPopover ? 'truncate text-[12px] font-medium' : 'truncate text-sm font-medium', tone === 'cinematicDark' ? 'text-shell-dark-text' : 'text-shell-text')}>
                                                                    {label}
                                                                </span>
                                                                {isSelected ? (
                                                                    <Check
                                                                        size={13}
                                                                        className={cn(
                                                                            'ml-auto shrink-0',
                                                                            tone === 'cinematicDark' ? 'text-shell-dark-accent' : 'text-shell-accent'
                                                                        )}
                                                                    />
                                                                ) : null}
                                                            </div>
                                                        </ShellSelectableRow>
                                                    );
                                                })}
                                            </div>
                                        ) : null}
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                ) : null}
            </div>

            {showPopoverActionRow ? (
                <div className={cn('border-t p-3', tone === 'cinematicDark' ? 'border-shell-dark-border' : 'border-shell-border')}>
                    <div className="flex flex-col items-stretch gap-2">
                        {onResetPaths ? (
                            <ShellButton
                                variant="outline"
                                size="compact"
                                onClick={onResetPaths}
                                className={cn(popoverActionButtonClassName, resetButtonClassName)}
                            >
                                <RotateCcw size={12} className="shrink-0" />
                                Restart from beginning
                            </ShellButton>
                        ) : null}
                    </div>
                </div>
            ) : onResetPaths ? (
                <div className={cn('border-t p-3', tone === 'cinematicDark' ? 'border-shell-dark-border' : 'border-shell-border')}>
                    <ShellButton
                        variant="outline"
                        size="compact"
                        onClick={onResetPaths}
                        className={cn('w-full justify-center gap-1.5', resetButtonClassName)}
                    >
                        <RotateCcw size={12} className="shrink-0" />
                        Restart from beginning
                    </ShellButton>
                </div>
            ) : null}
        </div>
    );
}
