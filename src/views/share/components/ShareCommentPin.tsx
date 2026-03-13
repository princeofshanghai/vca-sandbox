import { cn } from '@/utils/cn';
import { getInitialsFromName } from '@/utils/userIdentity';

export type ShareCommentPinTone = 'default' | 'selected' | 'resolved' | 'pending';

export const SHARE_COMMENT_PIN_WIDTH_PX = 44;
export const SHARE_COMMENT_PIN_HEIGHT_PX = 56;
export const SHARE_COMMENT_PIN_TIP_OFFSET_PX = 54;
export const SHARE_COMMENT_PIN_TIP_TO_CENTER_OFFSET_PX = 32;
export const SHARE_COMMENT_PIN_HEAD_CENTER_OFFSET_PX =
    SHARE_COMMENT_PIN_TIP_OFFSET_PX - SHARE_COMMENT_PIN_TIP_TO_CENTER_OFFSET_PX;
export const SHARE_COMMENT_PIN_VISUAL_RADIUS_PX = 20;

const PIN_SHELL_PATH =
    'M22 54L8.5 33.5A18 18 0 1 1 35.5 33.5Z';
const AVATAR_SIZE_PX = 28;
const AVATAR_TOP_PX = 8;

type ShareCommentPinStyle = {
    fill: string;
    stroke: string;
    avatarBackgroundClassName: string;
    labelClassName: string;
    glowStroke?: string;
};

const pinStyles: Record<ShareCommentPinTone, ShareCommentPinStyle> = {
    default: {
        fill: 'rgb(var(--shell-dark-panel))',
        stroke: 'rgb(var(--shell-dark-border) / 0.35)',
        avatarBackgroundClassName: 'bg-shell-dark-surface',
        labelClassName: 'text-shell-dark-text',
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
        avatarBackgroundClassName: 'bg-[rgb(var(--shell-dark-panel-alt)/1)]',
        labelClassName: 'text-shell-dark-muted',
    },
    pending: {
        fill: 'rgb(var(--shell-dark-accent))',
        stroke: 'rgb(var(--shell-dark-accent) / 0.88)',
        avatarBackgroundClassName: 'bg-[rgb(var(--shell-dark-accent-hover)/1)]',
        labelClassName: 'text-white',
        glowStroke: 'rgb(var(--shell-dark-accent) / 0.32)',
    },
};

type ShareCommentPinProps = {
    name: string;
    avatarUrl?: string | null;
    tone?: ShareCommentPinTone;
    pending?: boolean;
    className?: string;
};

export function ShareCommentPin({
    name,
    avatarUrl,
    tone = 'default',
    pending = false,
    className,
}: ShareCommentPinProps) {
    const pinStyle = pinStyles[tone];

    return (
        <span
            className={cn('relative block shrink-0', className)}
            style={{
                width: SHARE_COMMENT_PIN_WIDTH_PX,
                height: SHARE_COMMENT_PIN_HEIGHT_PX,
                filter: 'drop-shadow(0 14px 28px rgba(0, 0, 0, 0.34))',
            }}
        >
            <svg
                viewBox={`0 0 ${SHARE_COMMENT_PIN_WIDTH_PX} ${SHARE_COMMENT_PIN_HEIGHT_PX}`}
                className="absolute inset-0 h-full w-full overflow-visible"
                aria-hidden="true"
            >
                {pinStyle.glowStroke ? (
                    <path
                        d={PIN_SHELL_PATH}
                        fill="none"
                        stroke={pinStyle.glowStroke}
                        strokeWidth="3"
                        strokeLinejoin="round"
                        vectorEffect="non-scaling-stroke"
                    />
                ) : null}
                <path
                    d={PIN_SHELL_PATH}
                    fill={pinStyle.fill}
                    stroke={pinStyle.stroke}
                    strokeWidth="1.25"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                />
            </svg>

            <span
                className={cn(
                    'absolute left-1/2 flex items-center justify-center overflow-hidden rounded-full text-[14px] font-semibold leading-none',
                    pinStyle.avatarBackgroundClassName,
                    pinStyle.labelClassName
                )}
                style={{
                    top: AVATAR_TOP_PX,
                    width: AVATAR_SIZE_PX,
                    height: AVATAR_SIZE_PX,
                    transform: 'translateX(-50%)',
                }}
            >
                {pending ? (
                    <span aria-hidden="true" className="translate-y-[-0.5px] text-[18px] font-semibold">
                        +
                    </span>
                ) : avatarUrl ? (
                    <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                    <span>{getInitialsFromName(name)}</span>
                )}
            </span>
        </span>
    );
}
