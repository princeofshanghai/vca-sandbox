import { Step } from './types';
import {
    CommentFilter,
    FlowComment,
    FlowCommentCanvasAnchor,
    FlowCommentCanvasFreeAnchor,
    FlowCommentCanvasNodeAnchor,
    FlowCommentThread,
    getFlowCommentAnchor,
    isFlowCommentCanvasAnchor,
    isFlowCommentCanvasFreeAnchor,
    isFlowCommentCanvasNodeAnchor,
} from '../share/shareComments';

export const isCanvasCommentableStep = (step: Step | null | undefined) =>
    step?.type === 'turn' ||
    step?.type === 'user-turn' ||
    step?.type === 'condition' ||
    step?.type === 'note';

export const getCanvasCommentAnchor = (comment: FlowComment): FlowCommentCanvasAnchor | null => {
    const anchor = getFlowCommentAnchor(comment);
    return isFlowCommentCanvasAnchor(anchor) ? anchor : null;
};

export const getCanvasCommentStepId = (comment: FlowComment) => {
    const anchor = getCanvasCommentAnchor(comment);
    return isFlowCommentCanvasNodeAnchor(anchor) ? anchor.anchorStepId : null;
};

export const isCanvasNodeCommentAnchor = (
    anchor: FlowCommentCanvasAnchor | null | undefined
): anchor is FlowCommentCanvasNodeAnchor => isFlowCommentCanvasNodeAnchor(anchor);

export const isCanvasFreeCommentAnchor = (
    anchor: FlowCommentCanvasAnchor | null | undefined
): anchor is FlowCommentCanvasFreeAnchor => isFlowCommentCanvasFreeAnchor(anchor);

export const isCanvasCommentThread = (thread: FlowCommentThread) =>
    !!getCanvasCommentAnchor(thread.root);

export const matchesCanvasCommentFilter = (thread: FlowCommentThread, filter: CommentFilter) => {
    if (filter === 'all') return true;
    return thread.root.status === filter;
};

export const sortCanvasCommentThreads = (threads: FlowCommentThread[]) =>
    [...threads].sort(
        (left, right) =>
            new Date(right.latestActivityAt).getTime() - new Date(left.latestActivityAt).getTime()
    );

export const friendlyCanvasCommentsError = (error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);

    if (
        (message.includes('flow_comments') && message.includes('does not exist')) ||
        (message.includes('flow_comments') && message.includes('schema cache')) ||
        message.includes('anchor_canvas_type') ||
        message.includes('anchor_canvas_x') ||
        message.includes('anchor_canvas_y')
    ) {
        return 'Comments are not set up in this environment yet.';
    }

    if (message.includes('permission denied') || message.includes('violates row-level security')) {
        return 'You can view comments, but sign in is required to write comments.';
    }

    return 'Could not load comments right now.';
};

export const formatCommentDate = (isoDate: string) =>
    new Date(isoDate).toLocaleString([], {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });

export const formatCommentRelativeTime = (isoDate: string) => {
    const createdAt = new Date(isoDate);
    if (Number.isNaN(createdAt.getTime())) return '';

    const diffMs = Date.now() - createdAt.getTime();
    if (diffMs <= 0) return 'now';

    const minuteMs = 60 * 1000;
    const hourMs = 60 * minuteMs;
    const dayMs = 24 * hourMs;

    if (diffMs < minuteMs) return 'now';
    if (diffMs < hourMs) return `${Math.floor(diffMs / minuteMs)}m ago`;
    if (diffMs < dayMs) return `${Math.floor(diffMs / hourMs)}h ago`;
    if (diffMs < dayMs * 7) return `${Math.floor(diffMs / dayMs)}d ago`;

    return createdAt.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

export const getCommentExcerpt = (message: string, maxLength = 120) => {
    const trimmed = message.trim();
    if (trimmed.length <= maxLength) return trimmed;
    return `${trimmed.slice(0, maxLength - 1).trimEnd()}…`;
};

export const getCanvasCommentsEmptyState = (filter: CommentFilter) => {
    if (filter === 'open') {
        return {
            title: 'No open comments',
            description: 'Open comments will appear here. Switch filters to review resolved feedback.',
        };
    }

    if (filter === 'resolved') {
        return {
            title: 'No resolved comments',
            description: 'Resolved comments will appear here once a thread has been closed.',
        };
    }

    return {
        title: 'No comments yet',
        description: 'Click anywhere on the canvas to add one.',
    };
};

export const getStepCommentLabel = (step: Step | null | undefined) => {
    if (!step) return 'Deleted node';

    if (step.type === 'turn') {
        return step.label?.trim() || 'AI Turn';
    }

    if (step.type === 'user-turn') {
        return step.label?.trim() || 'User Turn';
    }

    if (step.type === 'condition') {
        return step.label?.trim() || 'Condition';
    }

    if (step.type === 'note') {
        return step.label?.trim() || 'Sticky note';
    }

    return 'Canvas';
};
