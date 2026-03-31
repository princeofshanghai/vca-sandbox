import type { Flow, StartNode } from './types';

export const START_NODE_LABEL_BASE = 'Flow';

const normalizeLabel = (value: string) => value.trim().toLowerCase();

const getNextGeneratedStartLabel = (usedLabels: Set<string>) => {
    let labelIndex = 1;

    while (usedLabels.has(normalizeLabel(`${START_NODE_LABEL_BASE} ${labelIndex}`))) {
        labelIndex += 1;
    }

    const nextLabel = `${START_NODE_LABEL_BASE} ${labelIndex}`;
    usedLabels.add(normalizeLabel(nextLabel));
    return nextLabel;
};

export const getFlowStartNodes = (flow: Pick<Flow, 'steps'> | null | undefined): StartNode[] =>
    (flow?.steps || []).filter((step): step is StartNode => step.type === 'start');

export const getStartNodeDisplayLabel = (
    startNode: Pick<StartNode, 'label'> | null | undefined
): string => {
    const label = startNode?.label?.trim();
    return label || START_NODE_LABEL_BASE;
};

export const resolveStartStepId = (
    flow: Pick<Flow, 'steps' | 'startStepId'> | null | undefined,
    preferredStartStepId?: string | null
): string | null => {
    const startNodes = getFlowStartNodes(flow);
    if (startNodes.length === 0) {
        return null;
    }

    const candidateIds = [preferredStartStepId, flow?.startStepId];
    for (const candidateId of candidateIds) {
        if (!candidateId) {
            continue;
        }

        if (startNodes.some((startNode) => startNode.id === candidateId)) {
            return candidateId;
        }
    }

    return startNodes[0].id;
};

export const resolvePreviewEntryStepId = (
    flow: Pick<Flow, 'steps' | 'startStepId'> | null | undefined,
    preferredEntryStepId?: string | null
): string | null => {
    if (!preferredEntryStepId) {
        return resolveStartStepId(flow);
    }

    const matchingStep = (flow?.steps || []).find((step) => step.id === preferredEntryStepId);
    if (matchingStep) {
        return matchingStep.id;
    }

    return resolveStartStepId(flow);
};

export const hasOutgoingConnectionFromStart = (
    flow: Pick<Flow, 'connections'> | null | undefined,
    startStepId: string
): boolean =>
    (flow?.connections || []).some((connection) => connection.source === startStepId);

export const normalizeFlowStartNodes = (flow: Flow): Flow => {
    const startNodes = getFlowStartNodes(flow);
    if (startNodes.length === 0) {
        if (!flow.startStepId) {
            return flow;
        }

        return {
            ...flow,
            startStepId: undefined,
        };
    }

    const usedLabels = new Set(
        startNodes
            .map((startNode) => startNode.label?.trim())
            .filter((label): label is string => Boolean(label))
            .map(normalizeLabel)
    );

    let didChange = false;
    const nextSteps = (flow.steps || []).map((step) => {
        if (step.type !== 'start') {
            return step;
        }

        const trimmedLabel = step.label?.trim();
        if (trimmedLabel) {
            if (trimmedLabel !== step.label) {
                didChange = true;
                return {
                    ...step,
                    label: trimmedLabel,
                };
            }

            return step;
        }

        didChange = true;
        return {
            ...step,
            label: getNextGeneratedStartLabel(usedLabels),
        };
    });

    const nextStartStepId = resolveStartStepId(
        {
            steps: nextSteps,
            startStepId: flow.startStepId,
        }
    );

    if ((flow.startStepId ?? null) !== nextStartStepId) {
        didChange = true;
    }

    if (!didChange) {
        return flow;
    }

    return {
        ...flow,
        steps: nextSteps,
        startStepId: nextStartStepId || undefined,
    };
};
