import type { Condition } from './types';

export const CONDITION_FALLBACK_LABEL = 'Condition';

export const getAutoConditionLabel = (question: string): string => question.trim();

export const getVisibleConditionLabel = (
    condition: Pick<Condition, 'label' | 'labelMode' | 'autoLabel'>
): string => {
    const baseLabel = condition.label?.trim() || CONDITION_FALLBACK_LABEL;

    if (condition.labelMode === 'custom') {
        return baseLabel;
    }

    const autoLabel = condition.autoLabel?.trim() || '';
    return autoLabel || baseLabel;
};
