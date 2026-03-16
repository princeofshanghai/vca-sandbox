import type { Branch } from './types';

export const createConditionBranch = (overrides: Partial<Branch> = {}): Branch => ({
    id: `branch-${crypto.randomUUID()}`,
    condition: overrides.isDefault ? (overrides.condition ?? 'Fallback') : (overrides.condition ?? ''),
    logic: overrides.isDefault ? undefined : overrides.logic,
    isDefault: overrides.isDefault ?? false,
    nextStepId: overrides.nextStepId,
});

export const createDefaultConditionBranches = (): Branch[] => ([
    createConditionBranch(),
    createConditionBranch({ isDefault: true }),
]);
