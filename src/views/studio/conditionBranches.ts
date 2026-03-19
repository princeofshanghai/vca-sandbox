import type { Branch } from './types';

export const getDefaultConditionPathLabel = (index: number): string => `Path ${index}`;

export const getNextConditionPathLabel = (branches: Branch[]): string =>
    getDefaultConditionPathLabel(branches.length + 1);

export const createConditionBranch = (overrides: Partial<Branch> = {}): Branch => ({
    id: `branch-${crypto.randomUUID()}`,
    condition: overrides.condition ?? '',
    logic: overrides.logic,
    isDefault: overrides.isDefault ?? false,
    nextStepId: overrides.nextStepId,
});

export const createDefaultConditionBranches = (): Branch[] => ([
    createConditionBranch({ condition: getDefaultConditionPathLabel(1) }),
    createConditionBranch({ condition: getDefaultConditionPathLabel(2) }),
]);
