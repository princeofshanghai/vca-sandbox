import type { UserTurn } from './types';

const USER_TURN_FALLBACK_LABEL = 'User Turn';

export const getAutoUserTurnLabel = (sourceText: string): string => `User clicks ${sourceText.trim()}`;
export const getAutoUserTurnTextLabel = (sourceText: string): string => `User says ${sourceText.trim()}`;

export const parseUserTurnTriggerExamples = (triggerValue?: string): string[] =>
    (triggerValue || '')
        .split(/\n+|[;|]/g)
        .map((line) => line.replace(/^\s*[-*]\s*/, '').trim())
        .filter(Boolean);

export const getPrimaryUserTurnTriggerText = (triggerValue?: string): string => {
    const examples = parseUserTurnTriggerExamples(triggerValue);
    if (examples.length > 0) {
        return examples[0];
    }

    return triggerValue?.trim() || '';
};

export const getUserTurnDisplayText = (userTurn: Pick<UserTurn, 'triggerValue' | 'label'>): string => {
    const triggerText = getPrimaryUserTurnTriggerText(userTurn.triggerValue);
    return triggerText || userTurn.label;
};

export const getVisibleUserTurnLabel = (
    userTurn: Pick<UserTurn, 'label' | 'labelMode' | 'autoLabel'>
): string => {
    const baseLabel = userTurn.label?.trim() || USER_TURN_FALLBACK_LABEL;

    if (userTurn.labelMode === 'custom') {
        return baseLabel;
    }

    const autoLabel = userTurn.autoLabel?.trim() || '';
    return autoLabel || baseLabel;
};
