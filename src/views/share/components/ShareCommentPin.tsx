import { cn } from '@/utils/cn';
import { getInitialsFromName } from '@/utils/userIdentity';
import type { CommentSurfaceTone } from '@/components/comments/CommentPrimitives';

export type ShareCommentPinTone = 'default' | 'selected' | 'resolved' | 'pending';

export const SHARE_COMMENT_PIN_WIDTH_PX = 42;
export const SHARE_COMMENT_PIN_HEIGHT_PX = 42;
export const SHARE_COMMENT_PIN_TIP_X_OFFSET_PX = 8;
export const SHARE_COMMENT_PIN_TIP_OFFSET_PX = 31;
export const SHARE_COMMENT_PIN_TIP_TO_CENTER_OFFSET_PX = 13;
export const SHARE_COMMENT_PIN_HEAD_CENTER_OFFSET_PX =
    SHARE_COMMENT_PIN_TIP_OFFSET_PX - SHARE_COMMENT_PIN_TIP_TO_CENTER_OFFSET_PX;
export const SHARE_COMMENT_PIN_VISUAL_RADIUS_PX = 13;
export const SHARE_COMMENT_PIN_TIP_TO_LEFT_EDGE_OFFSET_PX = 0;
export const SHARE_COMMENT_PIN_TIP_TO_RIGHT_EDGE_OFFSET_PX = 30;

const BODY_CENTER_X_PX = 23;
const BODY_CENTER_Y_PX = SHARE_COMMENT_PIN_HEAD_CENTER_OFFSET_PX;
const PIN_SHELL_PATH =
    'M19.071 16.2425C15.5404 19.7731 7.94677 19.5334 5.49594 19.3538C5.28128 19.3234 5.08232 19.2241 4.92902 19.0708C4.77572 18.9175 4.67639 18.7185 4.646 18.5039C4.46639 16.053 4.22668 8.45941 7.75727 4.92883C9.25756 3.42854 11.2924 2.58568 13.4141 2.58568C15.5359 2.58568 17.5707 3.42854 19.071 4.92883C20.5713 6.42912 21.4141 8.46395 21.4141 10.5857C21.4141 12.7074 20.5713 14.7422 19.071 16.2425Z';
const AVATAR_SIZE_PX = 21;
const AVATAR_TOP_PX = BODY_CENTER_Y_PX - AVATAR_SIZE_PX / 2;
const AVATAR_LEFT_PX = BODY_CENTER_X_PX - AVATAR_SIZE_PX / 2;
const PIN_STROKE_WIDTH = 1.35;

type ShareCommentPinStyle = {
    fill: string;
    stroke: string;
    avatarBackgroundClassName: string;
    labelClassName: string;
    glowStroke?: string;
};

const pinStyles: Record<CommentSurfaceTone, Record<ShareCommentPinTone, ShareCommentPinStyle>> = {
    default: {
        default: {
            fill: 'rgb(var(--shell-bg))',
            stroke: 'rgb(var(--shell-border) / 0.92)',
            avatarBackgroundClassName: 'border border-shell-accent-border/80 bg-shell-accent-soft',
            labelClassName: 'text-shell-accent-text',
        },
        selected: {
            fill: 'rgb(var(--shell-accent))',
            stroke: 'rgb(var(--shell-accent) / 0.9)',
            avatarBackgroundClassName: 'bg-[rgb(var(--shell-accent-hover)/1)]',
            labelClassName: 'text-white',
            glowStroke: 'rgb(var(--shell-accent) / 0.22)',
        },
        resolved: {
            fill: 'rgb(var(--shell-surface))',
            stroke: 'rgb(var(--shell-border) / 0.96)',
            avatarBackgroundClassName: 'border border-shell-accent-border/80 bg-shell-accent-soft',
            labelClassName: 'text-shell-accent-text',
        },
        pending: {
            fill: 'rgb(var(--shell-accent))',
            stroke: 'rgb(var(--shell-accent) / 0.9)',
            avatarBackgroundClassName: 'bg-[rgb(var(--shell-accent-hover)/1)]',
            labelClassName: 'text-white',
            glowStroke: 'rgb(var(--shell-accent) / 0.24)',
        },
    },
    cinematicDark: {
        default: {
            fill: 'rgb(var(--shell-dark-panel))',
            stroke: 'rgb(var(--shell-dark-border) / 0.35)',
            avatarBackgroundClassName: 'border border-shell-dark-accent/30 bg-shell-dark-accent-soft',
            labelClassName: 'text-shell-dark-accent-text',
        },
        selected: {
            fill: 'rgb(var(--shell-dark-accent))',
            stroke: 'rgb(var(--shell-dark-accent) / 0.88)',
            avatarBackgroundClassName: 'bg-[rgb(var(--shell-dark-accent-hover)/1)]',
            labelClassName: 'text-white',
            glowStroke: 'rgb(var(--shell-dark-accent) / 0.3)',
        },
        resolved: {
            fill: 'rgb(var(--shell-dark-surface))',
            stroke: 'rgb(var(--shell-dark-border) / 0.55)',
            avatarBackgroundClassName: 'border border-shell-dark-accent/30 bg-shell-dark-accent-soft',
            labelClassName: 'text-shell-dark-accent-text',
        },
        pending: {
            fill: 'rgb(var(--shell-dark-accent))',
            stroke: 'rgb(var(--shell-dark-accent) / 0.88)',
            avatarBackgroundClassName: 'bg-[rgb(var(--shell-dark-accent-hover)/1)]',
            labelClassName: 'text-white',
            glowStroke: 'rgb(var(--shell-dark-accent) / 0.32)',
        },
    },
};

type ShareCommentPinProps = {
    name: string;
    avatarUrl?: string | null;
    tone?: ShareCommentPinTone;
    pending?: boolean;
    className?: string;
    surfaceTone?: CommentSurfaceTone;
};

export function ShareCommentPin({
    name,
    avatarUrl,
    tone = 'default',
    pending = false,
    className,
    surfaceTone = 'default',
}: ShareCommentPinProps) {
    const pinStyle = pinStyles[surfaceTone][tone];
    const shadow = surfaceTone === 'cinematicDark'
        ? 'drop-shadow(0 16px 32px rgba(0, 0, 0, 0.38))'
        : 'drop-shadow(0 14px 28px rgba(15, 23, 42, 0.18))';

    return (
        <span
            className={cn('relative block shrink-0', className)}
            style={{
                width: SHARE_COMMENT_PIN_WIDTH_PX,
                height: SHARE_COMMENT_PIN_HEIGHT_PX,
                filter: shadow,
            }}
        >
            <svg
                viewBox="0 0 24 24"
                className="absolute inset-0 h-full w-full overflow-visible"
                aria-hidden="true"
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'block',
                }}
            >
                {pinStyle.glowStroke ? (
                    <path
                        d={PIN_SHELL_PATH}
                        fill="none"
                        stroke={pinStyle.glowStroke}
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        vectorEffect="non-scaling-stroke"
                    />
                ) : null}
                <path
                    d={PIN_SHELL_PATH}
                    fill={pinStyle.fill}
                    stroke={pinStyle.stroke}
                    strokeWidth={PIN_STROKE_WIDTH}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                />
            </svg>

            {!pending ? (
                <span
                    className={cn(
                        'absolute flex items-center justify-center overflow-hidden rounded-full text-[10px] font-semibold leading-none',
                        pinStyle.avatarBackgroundClassName,
                        pinStyle.labelClassName
                    )}
                    style={{
                        top: AVATAR_TOP_PX,
                        left: AVATAR_LEFT_PX,
                        width: AVATAR_SIZE_PX,
                        height: AVATAR_SIZE_PX,
                    }}
                >
                    {avatarUrl ? (
                        <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                        <span>{getInitialsFromName(name)}</span>
                    )}
                </span>
            ) : null}
        </span>
    );
}
