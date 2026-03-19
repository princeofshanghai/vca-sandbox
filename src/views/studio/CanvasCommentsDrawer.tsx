import { useEffect, useRef, useState } from 'react';
import { AlertCircle, Loader2, X } from 'lucide-react';
import {
    ShellButton,
    ShellIconButton,
    ShellNotice,
    ShellSelectableRow,
    ShellSelect,
    ShellSelectContent,
    ShellSelectItem,
    ShellSelectTrigger,
    ShellSelectValue,
} from '@/components/shell';
import { cn } from '@/utils/cn';
import { getInitialsFromName } from '@/utils/userIdentity';
import {
    formatCommentRelativeTime,
    getCanvasCommentsEmptyState,
    getCommentExcerpt,
} from './canvasComments';
import {
    DESKTOP_CANVAS_COMMENTS_CARD_BOTTOM_OFFSET_PX,
    DESKTOP_CANVAS_COMMENTS_CARD_RIGHT_OFFSET_PX,
    DESKTOP_CANVAS_COMMENTS_CARD_TOP_OFFSET_PX,
    DESKTOP_CANVAS_COMMENTS_CARD_WIDTH_PX,
} from './canvasCommentsLayout';
import { usePreventBrowserPinchZoom } from '@/hooks/usePreventBrowserPinchZoom';
import type { CanvasCommentsController } from './useCanvasCommentsController';

interface CanvasCommentsDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    comments: CanvasCommentsController;
    onRequestSignIn?: () => void;
    desktopPresentation?: 'drawer' | 'card';
}

const renderAvatar = ({
    name,
    avatarUrl,
}: {
    name: string;
    avatarUrl?: string | null;
}) => (
    <span className="h-7 w-7 shrink-0 overflow-hidden rounded-full border border-shell-border/70 bg-shell-bg">
        {avatarUrl ? (
            <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
        ) : (
            <span className="flex h-full w-full items-center justify-center text-[10px] font-semibold text-shell-muted">
                {getInitialsFromName(name)}
            </span>
        )}
    </span>
);

const ResolvedBadge = () => (
    <span className="rounded-full border border-shell-border/70 bg-shell-bg px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.08em] text-shell-muted">
        Resolved
    </span>
);

export function CanvasCommentsDrawer({
    isOpen,
    onClose,
    comments,
    onRequestSignIn,
    desktopPresentation = 'drawer',
}: CanvasCommentsDrawerProps) {
    const [shouldRender, setShouldRender] = useState(isOpen);
    const drawerRef = useRef<HTMLDivElement | null>(null);
    const desktopCardRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (isOpen) {
            setShouldRender(true);
            return;
        }

        const timer = setTimeout(() => setShouldRender(false), 300);
        return () => clearTimeout(timer);
    }, [isOpen]);

    usePreventBrowserPinchZoom(drawerRef, shouldRender);
    usePreventBrowserPinchZoom(desktopCardRef, shouldRender && desktopPresentation === 'card');

    const emptyState = getCanvasCommentsEmptyState(comments.filter);
    const isDesktopCard = desktopPresentation === 'card';
    const panelSurfaceClass = isDesktopCard ? 'bg-shell-bg/95' : 'bg-shell-surface';
    const emptyStateSurfaceClass = isDesktopCard ? 'bg-shell-surface' : 'bg-shell-bg';

    if (!shouldRender) return null;

    const panelContent = (
        <>
            <div className={cn(
                'h-14 border-b border-shell-border/70 flex items-center justify-between pl-2 pr-4 shrink-0 z-20 sticky top-0 backdrop-blur-sm',
                panelSurfaceClass
            )}>
                <div className="flex items-center gap-2">
                    <ShellIconButton onClick={onClose} aria-label="Close comments panel">
                        <X size={20} />
                    </ShellIconButton>
                    <span className="text-sm font-medium text-shell-text">Comments</span>
                </div>

                <ShellSelect
                    value={comments.filter}
                    onValueChange={(value) => comments.setFilter(value as typeof comments.filter)}
                >
                    <ShellSelectTrigger size="compact" className="w-[96px]">
                        <ShellSelectValue />
                    </ShellSelectTrigger>
                    <ShellSelectContent className="min-w-[96px]">
                        <ShellSelectItem size="compact" value="open">Open</ShellSelectItem>
                        <ShellSelectItem size="compact" value="all">All</ShellSelectItem>
                        <ShellSelectItem size="compact" value="resolved">Resolved</ShellSelectItem>
                    </ShellSelectContent>
                </ShellSelect>
            </div>

            <div className={cn('flex-1 overflow-y-auto thin-scrollbar', panelSurfaceClass)}>
                <div className="p-3 space-y-3">
                    {!comments.userCanComment && !comments.isAuthLoading ? (
                        <ShellNotice
                            icon={<AlertCircle size={14} />}
                            title="Sign in required to write comments"
                            description="You can browse existing feedback here, but posting new comments requires a signed-in editor session."
                            action={onRequestSignIn ? (
                                <ShellButton
                                    size="compact"
                                    className="h-8 text-[11px]"
                                    onClick={onRequestSignIn}
                                >
                                    Sign in
                                </ShellButton>
                            ) : undefined}
                        />
                    ) : null}

                    {comments.error && !comments.pendingComment && !comments.activeThread ? (
                        <ShellNotice
                            icon={<AlertCircle size={14} />}
                            variant="error"
                            title="Comments unavailable"
                            description={comments.error}
                        />
                    ) : null}

                    {comments.isLoading ? (
                        <div className="flex h-48 items-center justify-center gap-2 text-xs text-shell-muted">
                            <Loader2 size={14} className="animate-spin" />
                            Loading comments...
                        </div>
                    ) : comments.visibleThreads.length === 0 ? (
                        <div className={cn(
                            'rounded-xl border border-dashed border-shell-border/70 px-4 py-10 text-center',
                            emptyStateSurfaceClass
                        )}>
                            <div className="text-sm font-medium text-shell-text">{emptyState.title}</div>
                            <p className="mt-1 text-xs leading-relaxed text-shell-muted">
                                {emptyState.description}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {comments.visibleThreads.map((thread) => {
                                const isSelected = comments.activeThreadId === thread.id;

                                return (
                                    <ShellSelectableRow
                                        key={thread.id}
                                        selected={isSelected}
                                        onClick={() => comments.selectThread(thread.id, { reveal: true })}
                                    >
                                        {renderAvatar({
                                            name: thread.root.author_name,
                                            avatarUrl: thread.root.author_avatar_url,
                                        })}

                                        <div className="min-w-0 flex-1">
                                            <div className="mb-1 flex items-start justify-between gap-2">
                                                <span className="truncate text-xs font-medium text-shell-text">
                                                    {thread.root.author_name}
                                                </span>
                                                <div className="flex items-center gap-2 shrink-0">
                                                    {thread.root.status === 'resolved' ? <ResolvedBadge /> : null}
                                                    <span className="text-[10px] text-shell-muted">
                                                        {formatCommentRelativeTime(thread.latestActivityAt)}
                                                    </span>
                                                </div>
                                            </div>

                                            <p className="text-xs leading-relaxed text-shell-text/90 truncate">
                                                {getCommentExcerpt(thread.root.message)}
                                            </p>

                                            {thread.replies.length > 0 ? (
                                                <p className="mt-1.5 text-[10px] text-shell-accent">
                                                    {thread.replies.length}{' '}
                                                    {thread.replies.length === 1 ? 'reply' : 'replies'}
                                                </p>
                                            ) : null}
                                        </div>
                                    </ShellSelectableRow>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </>
    );

    if (isDesktopCard) {
        return (
            <>
                <div
                    className={cn(
                        'fixed inset-0 z-[130] pointer-events-none flex justify-end md:hidden',
                        isOpen ? 'visible' : 'invisible'
                    )}
                >
                    <div
                        className={cn(
                            'relative h-full transition-transform duration-300 ease-out pointer-events-auto',
                            isOpen ? 'translate-x-0' : 'translate-x-full'
                        )}
                    >
                        <div
                            ref={drawerRef}
                            className="w-[380px] h-full bg-shell-surface shadow-2xl flex flex-col border-l border-shell-border/70"
                        >
                            {panelContent}
                        </div>
                    </div>
                </div>

                <div
                    className={cn(
                        'absolute inset-0 z-[130] pointer-events-none hidden md:block',
                        isOpen ? 'visible' : 'invisible'
                    )}
                    aria-hidden={!isOpen}
                >
                    <div
                        className={cn(
                            'absolute pointer-events-auto transition-transform duration-300 ease-out',
                            isOpen ? 'translate-x-0' : 'translate-x-[calc(100%+16px)]'
                        )}
                        style={{
                            top: `${DESKTOP_CANVAS_COMMENTS_CARD_TOP_OFFSET_PX}px`,
                            right: `${DESKTOP_CANVAS_COMMENTS_CARD_RIGHT_OFFSET_PX}px`,
                            bottom: `${DESKTOP_CANVAS_COMMENTS_CARD_BOTTOM_OFFSET_PX}px`,
                            width: `${DESKTOP_CANVAS_COMMENTS_CARD_WIDTH_PX}px`,
                        }}
                    >
                        <div
                            ref={desktopCardRef}
                            className="h-full overflow-hidden rounded-2xl border border-shell-border/70 bg-shell-bg/95 shadow-[0_24px_56px_rgba(15,23,42,0.22)] backdrop-blur-sm flex flex-col"
                        >
                            {panelContent}
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <div
            className={cn(
                'fixed inset-0 z-[100] pointer-events-none flex justify-end',
                isOpen ? 'visible' : 'invisible'
            )}
        >
            <div
                className={cn(
                    'relative h-full transition-transform duration-300 ease-out pointer-events-auto',
                    isOpen ? 'translate-x-0' : 'translate-x-full'
                )}
            >
                <div
                    ref={drawerRef}
                    className="w-[380px] h-full bg-shell-surface shadow-2xl flex flex-col border-l border-shell-border/70"
                >
                    {panelContent}
                </div>
            </div>
        </div>
    );
}
