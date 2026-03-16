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
    onCardClick,
    stopPropagationOnClick = true,
    ...props
}, ref) => {
    const pathLabel = getConditionPathLabel(branch);
    const ruleSummary = getConditionRuleSummary(branch);
    const variable = branch.logic?.variable?.trim() || '';
    const value = branch.logic?.value !== undefined ? String(branch.logic.value).trim() : '';
    const hasRuleChips = !branch.isDefault && Boolean(variable || value);

    const chipClassName = cn(
        'inline-flex items-center rounded-full border border-shell-border bg-shell-surface px-2.5 py-1',
        'text-[11px] font-medium leading-none text-shell-muted-strong shadow-[0_1px_1px_rgb(15_23_42/0.03)]'
    );

    const renderContent = () => {
        if (branch.isDefault) {
            return (
                <div className="flex flex-col gap-1">
                    <div
                        className="text-sm leading-snug break-words text-shell-muted-strong"
                        title={ruleSummary || undefined}
                    >
                        {ruleSummary || 'Used if nothing else matches'}
                    </div>
                </div>
            );
        }

        if (hasRuleChips) {
            return (
                <div className="flex flex-wrap items-center gap-1.5">
                    <span className={chipClassName}>{variable || 'Field'}</span>
                    <span className="text-[12px] font-medium leading-none text-shell-muted-strong">is</span>
                    <span className={chipClassName}>{value || 'Value'}</span>
                </div>
            );
        }

        return (
            <div className="flex flex-col gap-1">
                <div
                    className={`text-sm leading-snug break-words ${ruleSummary ? 'text-shell-muted-strong' : 'text-shell-muted'}`}
                    title={ruleSummary || undefined}
                >
                    {ruleSummary || 'Choose field + value'}
                </div>
            </div>
        );
    };

    return (
        <div
            ref={ref}
            id={`component-${branch.id}`}
            className="relative z-20 mb-2"
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
            >
                {renderContent()}
            </StudioCard>
        </div>
    );
}));

BranchCard.displayName = 'BranchCard';
