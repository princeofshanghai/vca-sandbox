import type {
    CSSProperties,
    FocusEventHandler,
    MouseEventHandler,
} from 'react';
import { cn } from '@/utils/cn';
import {
    CommentAvatar,
    CommentResolvedBadge,
    type CommentSurfaceTone,
} from './CommentPrimitives';

const hoverPreviewToneClasses: Record<CommentSurfaceTone, {
    panel: string;
    text: string;
    muted: string;
    accent: string;
}> = {
    default: {
        panel:
            'border border-shell-border/70 bg-shell-bg/95 text-shell-text hover:text-shell-text hover:bg-shell-bg/95 shadow-[0_20px_48px_rgb(15_23_42/0.18)]',
        text: 'text-shell-text',
        muted: 'text-shell-muted',
        accent: 'text-shell-accent',
    },
    cinematicDark: {
        panel:
            'border border-shell-dark-border bg-shell-dark-panel/95 text-shell-dark-text hover:text-shell-dark-text hover:bg-shell-dark-panel/95 shadow-[0_20px_48px_rgb(0_0_0/0.38)]',
        text: 'text-shell-dark-text',
        muted: 'text-shell-dark-muted',
        accent: 'text-shell-dark-accent',
    },
};

export const COMMENT_THREAD_HOVER_PREVIEW_GAP_PX = 4;

type CommentThreadHoverPreviewProps = {
    visible: boolean;
    ariaLabel: string;
    authorName: string;
    authorAvatarUrl?: string | null;
    isResolved?: boolean;
    relativeTimeLabel: string;
    timeTitle?: string;
    previewText: string;
    detail?: string | null;
    replyCount?: number;
    tone?: CommentSurfaceTone;
    className?: string;
    style?: CSSProperties;
    onClick: MouseEventHandler<HTMLButtonElement>;
    onMouseEnter?: MouseEventHandler<HTMLButtonElement>;
    onMouseLeave?: MouseEventHandler<HTMLButtonElement>;
    onFocus?: FocusEventHandler<HTMLButtonElement>;
    onBlur?: FocusEventHandler<HTMLButtonElement>;
};

export const CommentThreadHoverPreview = ({
    visible,
    ariaLabel,
    authorName,
    authorAvatarUrl,
    isResolved = false,
    relativeTimeLabel,
    timeTitle,
    previewText,
    detail,
    replyCount = 0,
    tone = 'default',
    className,
    style,
    onClick,
    onMouseEnter,
    onMouseLeave,
    onFocus,
    onBlur,
}: CommentThreadHoverPreviewProps) => {
    const toneClasses = hoverPreviewToneClasses[tone];

    return (
        <button
            type="button"
            className={cn(
                'absolute -translate-y-1/2 h-auto min-w-[220px] max-w-[286px] rounded-[24px] px-3.5 py-3 text-left justify-start pointer-events-auto transition-all duration-150 ease-out origin-left focus-visible:ring-0 focus-visible:outline-none z-10',
                toneClasses.panel,
                visible
                    ? 'opacity-100 translate-x-0 scale-100'
                    : 'opacity-0 -translate-x-2 scale-95 pointer-events-none',
                className
            )}
            style={style}
            onClick={onClick}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            onFocus={onFocus}
            onBlur={onBlur}
            aria-label={ariaLabel}
            tabIndex={visible ? 0 : -1}
            aria-hidden={!visible}
        >
            <div className="flex items-start gap-2.5 w-full">
                <CommentAvatar
                    name={authorName}
                    avatarUrl={authorAvatarUrl}
                    size="w-7 h-7"
                    textSize="text-[9px]"
                    tone={tone}
                />
                <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                        <span className={cn('text-xs font-semibold truncate', toneClasses.text)}>
                            {authorName}
                        </span>
                        {isResolved ? <CommentResolvedBadge tone={tone} /> : null}
                        <span
                            className={cn('text-[11px] shrink-0', toneClasses.muted)}
                            title={timeTitle}
                        >
                            {relativeTimeLabel}
                        </span>
                    </div>
                    <p className={cn('mt-0.5 text-xs truncate max-w-[200px]', toneClasses.text)}>
                        {previewText}
                    </p>
                    {detail ? (
                        <p className={cn('mt-0.5 text-[10px] max-w-[200px] truncate', toneClasses.muted)}>
                            {detail}
                        </p>
                    ) : null}
                    {replyCount > 0 ? (
                        <p className={cn('mt-0.5 text-[10px]', toneClasses.accent)}>
                            {replyCount} {replyCount === 1 ? 'reply' : 'replies'}
                        </p>
                    ) : null}
                </div>
            </div>
        </button>
    );
};
