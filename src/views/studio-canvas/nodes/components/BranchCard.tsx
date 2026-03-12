import { memo, forwardRef } from 'react';
import { StudioCard } from './StudioCard';
import { Branch } from '../../../studio/types';
import { CARD_EDGE_OUTPUT_HANDLE_OFFSET_PX } from './handleOffsets';
import { getConditionPathLabel } from '../../../studio/conditionBranchLabels';

interface BranchCardProps extends React.HTMLAttributes<HTMLDivElement> {
    branch: Branch;
    isSelected: boolean;
    readOnly?: boolean;
    onCardClick: (anchorEl: HTMLElement) => void;
}

export const BranchCard = memo(forwardRef<HTMLDivElement, BranchCardProps>(({
    branch,
    isSelected,
    onCardClick,
    ...props
}, ref) => {
    const pathLabel = getConditionPathLabel(branch);

    const renderContent = () => {
        return (
            <div className="flex flex-col gap-1.5">
                {branch.isDefault ? (
                    <div className="text-sm text-shell-muted-strong">
                        Anything else
                    </div>
                ) : branch.logic?.variable ? (
                    <div className="flex flex-wrap gap-1 items-center">
                        <span
                            className="truncate max-w-[120px] rounded border px-1.5 py-0.5 font-mono text-sm border-[rgb(var(--shell-node-condition)/0.22)] bg-[rgb(var(--shell-node-condition-surface)/0.9)] text-[rgb(var(--shell-note-muted)/1)] dark:border-[rgb(var(--shell-node-condition)/0.28)] dark:bg-[rgb(var(--shell-node-condition-surface)/1)] dark:text-[rgb(var(--shell-node-condition)/0.78)]"
                            title={branch.logic.variable}
                        >
                            {branch.logic.variable}
                        </span>
                        <span className="text-sm text-shell-muted-strong font-mono bg-shell-surface px-1.5 py-0.5 rounded border border-shell-border shrink-0">
                            =
                        </span>
                        <span
                            className="truncate max-w-[120px] rounded border px-1.5 py-0.5 font-mono text-sm border-[rgb(var(--shell-node-condition)/0.22)] bg-[rgb(var(--shell-node-condition-surface)/0.9)] text-[rgb(var(--shell-note-muted)/1)] dark:border-[rgb(var(--shell-node-condition)/0.28)] dark:bg-[rgb(var(--shell-node-condition-surface)/1)] dark:text-[rgb(var(--shell-node-condition)/0.78)]"
                            title={String(branch.logic.value)}
                        >
                            {String(branch.logic.value)}
                        </span>
                    </div>
                ) : (
                    <div className="text-sm text-shell-muted-strong">
                        Rule not set
                    </div>
                )}
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
