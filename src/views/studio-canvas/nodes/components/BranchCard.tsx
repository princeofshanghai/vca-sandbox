import { memo, forwardRef } from 'react';
import { StudioCard } from './StudioCard';
import { Branch } from '../../../studio/types';
import { CARD_EDGE_OUTPUT_HANDLE_OFFSET_PX } from './handleOffsets';
import { getConditionPathLabel, getConditionRuleSummary } from '../../../studio/conditionBranchLabels';
import { cn } from '@/utils/cn';

interface BranchCardProps extends React.HTMLAttributes<HTMLDivElement> {
    branch: Branch;
    isSelected: boolean;
    readOnly?: boolean;
    onCardClick: (anchorEl: HTMLElement) => void;
    stopPropagationOnClick?: boolean;
}

export const BranchCard = memo(forwardRef<HTMLDivElement, BranchCardProps>(({
    branch,
    isSelected,
    readOnly,
    onCardClick,
    stopPropagationOnClick = true,
    className,
    ...props
}, ref) => {
    const pathLabel = getConditionPathLabel(branch);
    const ruleSummary = getConditionRuleSummary(branch);
    const variable = branch.logic?.variable?.trim() || '';
    const value = branch.logic?.value !== undefined ? String(branch.logic.value).trim() : '';
    const hasRuleChips = !branch.isDefault && Boolean(variable || value);
    const hasBranchDetail = branch.isDefault || hasRuleChips || Boolean(ruleSummary);

    const chipClassName = cn(
        'inline-flex items-center rounded-lg border border-shell-node-condition/30 bg-[rgb(var(--shell-node-condition-surface)/0.82)] px-2.5 py-1',
        'font-mono text-[11px] font-medium leading-none text-shell-node-condition shadow-[0_1px_1px_rgb(15_23_42/0.03)]'
    );

    const renderContent = () => {
        if (branch.isDefault) {
            return (
                <div className="flex flex-col gap-1">
                    <div
                        className="text-sm leading-snug break-words text-shell-muted-strong"
                        title={ruleSummary || undefined}
                    >
                        {ruleSummary || 'Use when none of the others match'}
                    </div>
                </div>
            );
        }

        if (hasRuleChips) {
            return (
                <div className="flex flex-wrap items-center gap-1.5">
                    <span className={chipClassName}>{variable || 'Variable'}</span>
                    <span className="text-[12px] font-medium leading-none text-shell-muted-strong">is</span>
                    <span className={chipClassName}>{value || 'Value'}</span>
                </div>
            );
        }

        if (!ruleSummary) {
            return null;
        }

        return (
            <div className="flex flex-col gap-1">
                <div
                    className="text-sm leading-snug break-words text-shell-muted-strong"
                    title={ruleSummary}
                >
                    {ruleSummary}
                </div>
            </div>
        );
    };

    return (
        <div
            ref={ref}
            id={`component-${branch.id}`}
            className={cn('relative z-20', className)}
            {...props}
        >
            <StudioCard
                icon={null}
                title={pathLabel}
                theme="amber"
                selected={isSelected}
                onClick={(event) => onCardClick(event.currentTarget as HTMLElement)}
                stopPropagationOnClick={stopPropagationOnClick}
                showOutputHandle={true}
                outputHandleId={branch.id}
                outputHandleOffsetPx={CARD_EDGE_OUTPUT_HANDLE_OFFSET_PX}
                compactWhenBodyEmpty={true}
                className={cn(
                    'rounded-none border-0 bg-transparent shadow-none',
                    readOnly ? 'cursor-default' : 'cursor-pointer'
                )}
                headerClassName={cn(
                    'border-b-0 bg-transparent px-4',
                    hasBranchDetail ? 'pb-1.5 pt-3.5' : 'py-3.5'
                )}
                bodyClassName="bg-transparent px-4 pb-3.5 pt-0"
            >
                {renderContent()}
            </StudioCard>
        </div>
    );
}));

BranchCard.displayName = 'BranchCard';
