import type { Branch } from './types';

export const getConditionPathLabel = (
    branch: Pick<Branch, 'condition' | 'isDefault'>
): string => {
    const trimmedCondition = branch.condition?.trim();
    if (trimmedCondition) return trimmedCondition;
    return branch.isDefault ? 'Fallback' : 'Path';
};

export const getConditionRuleSummary = (
    branch: Pick<Branch, 'isDefault' | 'logic'>,
    variableFallback?: string
): string | null => {
    if (branch.isDefault) {
        return 'Anything else';
    }

    const variable = branch.logic?.variable?.trim() || variableFallback?.trim() || '';
    if (!variable) {
        return null;
    }

    const value = branch.logic?.value !== undefined ? String(branch.logic.value).trim() : '';
    return `${variable} = ${value || 'value'}`;
};

export const getConditionSelectionLabel = (
    branch: Pick<Branch, 'condition' | 'isDefault' | 'logic'>,
    variableFallback?: string
): string => {
    const pathLabel = getConditionPathLabel(branch);
    if (branch.isDefault) {
        return `${pathLabel} (Fallback)`;
    }

    const ruleSummary = getConditionRuleSummary(branch, variableFallback);
    return ruleSummary ? `${pathLabel} (${ruleSummary})` : pathLabel;
};
