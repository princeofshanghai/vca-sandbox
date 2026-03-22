import { flowStorage } from '@/utils/flowStorage';
import { Flow } from '@/views/studio/types';

const DASHBOARD_DUPLICATED_TOAST_KEY = 'dashboard-toast:project-duplicated';
const SHARE_DUPLICATE_QUERY_PARAM = 'duplicateProject';

export function getDuplicateBaseTitle(title: string): string {
    const trimmedTitle = title.trim() || 'Untitled';
    const copyPatternMatch = trimmedTitle.match(/^(.*) \(Copy(?: \d+)?\)$/i);
    if (!copyPatternMatch?.[1]) return trimmedTitle;
    return copyPatternMatch[1].trim() || 'Untitled';
}

export function getDuplicateTitle(baseTitle: string, existingTitles: string[]): string {
    const normalizedExistingTitles = new Set(
        existingTitles.map((title) => title.trim().toLowerCase())
    );
    const normalizedBaseTitle = getDuplicateBaseTitle(baseTitle);
    const firstDuplicateTitle = `${normalizedBaseTitle} (Copy)`;

    if (!normalizedExistingTitles.has(firstDuplicateTitle.toLowerCase())) {
        return firstDuplicateTitle;
    }

    let copyIndex = 2;
    while (
        normalizedExistingTitles.has(
            `${normalizedBaseTitle} (Copy ${copyIndex})`.toLowerCase()
        )
    ) {
        copyIndex += 1;
    }

    return `${normalizedBaseTitle} (Copy ${copyIndex})`;
}

type DuplicateFlowForCurrentUserParams = {
    sourceFlow: Flow;
    sourceTitle: string;
    existingTitles: string[];
    folderId?: string;
};

export async function duplicateFlowForCurrentUser({
    sourceFlow,
    sourceTitle,
    existingTitles,
    folderId,
}: DuplicateFlowForCurrentUserParams) {
    const duplicatedFlow: Flow = {
        ...sourceFlow,
        id: crypto.randomUUID(),
        title: getDuplicateTitle(sourceTitle, existingTitles),
        lastModified: Date.now(),
        is_public: false,
        metadata: sourceFlow.metadata
            ? {
                ...sourceFlow.metadata,
                thumbnailPath: undefined,
                thumbnailUpdatedAt: undefined,
            }
            : undefined,
    };

    await flowStorage.saveFlow({
        ...duplicatedFlow,
        folderId,
    });

    const savedFlow = await flowStorage.getFlow(duplicatedFlow.id);
    if (!savedFlow) {
        throw new Error('Could not save duplicated project.');
    }

    return duplicatedFlow;
}

export async function duplicateSharedFlowForCurrentUser(sourceFlow: Flow) {
    const existingFlows = await flowStorage.getAllFlows();

    return duplicateFlowForCurrentUser({
        sourceFlow,
        sourceTitle: sourceFlow.title,
        existingTitles: existingFlows.map((flow) => flow.title),
    });
}

export function buildShareDuplicateRedirectUrl(currentUrl: string) {
    const redirectUrl = new URL(currentUrl);
    redirectUrl.searchParams.set(SHARE_DUPLICATE_QUERY_PARAM, '1');
    return redirectUrl.toString();
}

export function hasPendingShareDuplicate() {
    if (typeof window === 'undefined') return false;

    return new URLSearchParams(window.location.search).get(SHARE_DUPLICATE_QUERY_PARAM) === '1';
}

export function clearPendingShareDuplicateFromCurrentUrl() {
    if (typeof window === 'undefined') return;

    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.delete(SHARE_DUPLICATE_QUERY_PARAM);
    const nextSearch = nextUrl.search ? nextUrl.search : '';
    window.history.replaceState({}, '', `${nextUrl.pathname}${nextSearch}${nextUrl.hash}`);
}

export function markProjectDuplicatedToastPending() {
    if (typeof window === 'undefined') return;

    window.sessionStorage.setItem(DASHBOARD_DUPLICATED_TOAST_KEY, '1');
}

export function consumeProjectDuplicatedToastPending() {
    if (typeof window === 'undefined') return false;

    const hasPendingToast =
        window.sessionStorage.getItem(DASHBOARD_DUPLICATED_TOAST_KEY) === '1';

    if (hasPendingToast) {
        window.sessionStorage.removeItem(DASHBOARD_DUPLICATED_TOAST_KEY);
    }

    return hasPendingToast;
}
