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
import type { CommentSurfaceTone } from '@/components/comments/CommentPrimitives';

interface CanvasCommentsDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    comments: CanvasCommentsController;
    onRequestSignIn?: () => void;
    desktopPresentation?: 'drawer' | 'card';
    tone?: CommentSurfaceTone;
}

const renderAvatar = ({
    name,
    avatarUrl,
    tone = 'default',
}: {
    name: string;
    avatarUrl?: string | null;
    tone?: CommentSurfaceTone;
}) => (
    <span
        className={cn(
            'h-7 w-7 shrink-0 overflow-hidden rounded-full border',
            tone === 'cinematicDark'
                ? 'border-shell-dark-border bg-shell-dark-surface'
                : 'border-shell-border/70 bg-shell-bg'
        )}
    >
        {avatarUrl ? (
            <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
        ) : (
            <span
                className={cn(
                    'flex h-full w-full items-center justify-center text-[10px] font-semibold',
                    tone === 'cinematicDark' ? 'text-shell-dark-muted' : 'text-shell-muted'
                )}
            >
                {getInitialsFromName(name)}
            </span>
        )}
    </span>
);

const ResolvedBadge = ({ tone = 'default' }: { tone?: CommentSurfaceTone }) => (
    <span
        className={cn(
            'rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.08em]',
            tone === 'cinematicDark'
                ? 'border-shell-dark-border bg-shell-dark-surface text-shell-dark-muted'
                : 'border-shell-border/70 bg-shell-bg text-shell-muted'
        )}
    >
        Resolved
    </span>
);

export function CanvasCommentsDrawer({
    isOpen,
    onClose,
    comments,
    onRequestSignIn,
    desktopPresentation = 'drawer',
    tone = 'default',
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
    const isDarkTone = tone === 'cinematicDark';
    const panelSurfaceClass = isDarkTone
        ? 'bg-shell-dark-panel/95'
        : isDesktopCard
            ? 'bg-shell-bg/95'
            : 'bg-shell-surface';
    const emptyStateSurfaceClass = isDarkTone
        ? 'bg-shell-dark-surface/35'
        : isDesktopCard
            ? 'bg-shell-surface'
            : 'bg-shell-bg';
    const borderClass = isDarkTone ? 'border-shell-dark-border' : 'border-shell-border/70';
    const titleTextClass = isDarkTone ? 'text-shell-dark-text' : 'text-shell-text';
    const mutedTextClass = isDarkTone ? 'text-shell-dark-muted' : 'text-shell-muted';
    const replyAccentClass = isDarkTone ? 'text-shell-dark-accent' : 'text-shell-accent';

    if (!shouldRender) return null;

    const panelContent = (
        <>
            <div className={cn(
                'h-14 border-b flex items-center justify-between pl-2 pr-4 shrink-0 z-20 sticky top-0 backdrop-blur-sm',
                borderClass,
                panelSurfaceClass
            )}>
                <div className="flex items-center gap-2">
                    <ShellIconButton onClick={onClose} aria-label="Close comments panel" tone={tone}>
                        <X size={20} />
                    </ShellIconButton>
                    <span className={cn('text-sm font-medium', titleTextClass)}>Comments</span>
                </div>

                <ShellSelect
                    value={comments.filter}
                    onValueChange={(value) => comments.setFilter(value as typeof comments.filter)}
                >
                    <ShellSelectTrigger size="compact" tone={tone} className="w-[96px]">
                        <ShellSelectValue />
                    </ShellSelectTrigger>
                    <ShellSelectContent tone={tone} className="min-w-[96px]">
                        <ShellSelectItem size="compact" tone={tone} value="open">Open</ShellSelectItem>
                        <ShellSelectItem size="compact" tone={tone} value="all">All</ShellSelectItem>
                        <ShellSelectItem size="compact" tone={tone} value="resolved">Resolved</ShellSelectItem>
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
                            tone={tone}
                            action={onRequestSignIn ? (
                                <ShellButton
                                    size="compact"
                                    className={cn(
                                        'h-8 text-[11px]',
                                        isDarkTone
                                            ? 'bg-shell-dark-accent text-shell-dark-text hover:bg-shell-dark-accent-hover'
                                            : undefined
                                    )}
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
                            tone={tone}
                        />
                    ) : null}

                    {comments.isLoading ? (
                        <div className={cn('flex h-48 items-center justify-center gap-2 text-xs', mutedTextClass)}>
                            <Loader2 size={14} className="animate-spin" />
                            Loading comments...
                        </div>
                    ) : comments.visibleThreads.length === 0 ? (
                        <div className={cn(
                            'rounded-xl border border-dashed px-4 py-10 text-center',
                            borderClass,
                            emptyStateSurfaceClass
                        )}>
                            <div className={cn('text-sm font-medium', titleTextClass)}>{emptyState.title}</div>
                            <p className={cn('mt-1 text-xs leading-relaxed', mutedTextClass)}>
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
                                        tone={tone}
                                        onClick={() => comments.selectThread(thread.id, { reveal: true })}
                                    >
                                        {renderAvatar({
                                            name: thread.root.author_name,
                                            avatarUrl: thread.root.author_avatar_url,
                                            tone,
                                        })}

                                        <div className="min-w-0 flex-1">
                                            <div className="mb-1 flex items-start justify-between gap-2">
                                                <span className={cn('truncate text-xs font-medium', titleTextClass)}>
                                                    {thread.root.author_name}
                                                </span>
                                                <div className="flex items-center gap-2 shrink-0">
                                                    {thread.root.status === 'resolved' ? <ResolvedBadge tone={tone} /> : null}
                                                    <span className={cn('text-[10px]', mutedTextClass)}>
                                                        {formatCommentRelativeTime(thread.latestActivityAt)}
                                                    </span>
                                                </div>
                                            </div>

                                            <p className={cn('text-xs leading-relaxed truncate', isDarkTone ? 'text-shell-dark-text/90' : 'text-shell-text/90')}>
                                                {getCommentExcerpt(thread.root.message)}
                                            </p>

                                            {thread.replies.length > 0 ? (
                                                <p className={cn('mt-1.5 text-[10px]', replyAccentClass)}>
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
                            className={cn(
                                'w-[380px] h-full shadow-2xl flex flex-col border-l',
                                isDarkTone
                                    ? 'bg-shell-dark-panel/95 border-shell-dark-border'
                                    : 'bg-shell-surface border-shell-border/70'
                            )}
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
                            className={cn(
                                'h-full overflow-hidden rounded-2xl border backdrop-blur-sm flex flex-col',
                                isDarkTone
                                    ? 'border-shell-dark-border bg-shell-dark-panel/95 shadow-[0_24px_56px_rgba(0,0,0,0.34)]'
                                    : 'border-shell-border/70 bg-shell-bg/95 shadow-[0_24px_56px_rgba(15,23,42,0.22)]'
                            )}
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
