import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode, type Ref } from 'react';
import { ArrowUp, Loader2, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import {
    ShellIconButton,
    ShellMenu,
    ShellMenuContent,
    ShellMenuItem,
    ShellMenuSeparator,
    ShellMenuTrigger,
    ShellTextareaAutosize,
    ShellUserAvatar,
} from '@/components/shell';
import { cn } from '@/utils/cn';

export type CommentSurfaceTone = 'default' | 'cinematicDark';

type CommentAvatarProps = {
    name: string;
    avatarUrl?: string | null;
    size: string;
    textSize: string;
    tone?: CommentSurfaceTone;
};

export const CommentAvatar = ({
    name,
    avatarUrl,
    size,
    textSize,
    tone = 'default',
}: CommentAvatarProps) => (
    <ShellUserAvatar
        name={name}
        avatarUrl={avatarUrl}
        sizeClassName={size}
        textClassName={textSize}
        tone={tone}
    />
);

const resolvedBadgeToneClasses: Record<CommentSurfaceTone, string> = {
    default: 'border border-shell-border/70 bg-shell-bg text-shell-muted',
    cinematicDark: 'border border-shell-dark-border bg-shell-dark-surface text-shell-dark-muted',
};

export const CommentResolvedBadge = ({
    tone = 'default',
}: {
    tone?: CommentSurfaceTone;
}) => (
    <span
        className={cn(
            'rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.08em]',
            resolvedBadgeToneClasses[tone]
        )}
    >
        Resolved
    </span>
);

type CommentActionsMenuProps = {
    ariaLabel: string;
    editLabel: string;
    deleteLabel?: string;
    onEdit: () => void;
    onDelete?: () => void;
    tone?: CommentSurfaceTone;
};

export const CommentActionsMenu = ({
    ariaLabel,
    editLabel,
    deleteLabel,
    onEdit,
    onDelete,
    tone = 'default',
}: CommentActionsMenuProps) => (
    <ShellMenu>
        <ShellMenuTrigger asChild>
            <ShellIconButton size="sm" tone={tone} shape="circle" aria-label={ariaLabel}>
                <MoreHorizontal size={14} />
            </ShellIconButton>
        </ShellMenuTrigger>
        <ShellMenuContent
            align="end"
            tone={tone}
            className="w-40"
            data-comment-placement-ignore="true"
        >
            <ShellMenuItem tone={tone} onSelect={onEdit}>
                <Pencil size={14} />
                <span>{editLabel}</span>
            </ShellMenuItem>
            {deleteLabel && onDelete ? (
                <>
                    <ShellMenuSeparator tone={tone} />
                    <ShellMenuItem tone={tone} variant="destructive" onSelect={onDelete}>
                        <Trash2 size={14} />
                        <span>{deleteLabel}</span>
                    </ShellMenuItem>
                </>
            ) : null}
        </ShellMenuContent>
    </ShellMenu>
);

type CommentComposerInputRowProps = {
    value: string;
    onValueChange: (value: string) => void;
    onSubmit: () => void;
    placeholder: string;
    submitAriaLabel: string;
    disabled?: boolean;
    isSubmitting?: boolean;
    textareaRef?: Ref<HTMLTextAreaElement>;
    autoFocus?: boolean;
    className?: string;
    tone?: CommentSurfaceTone;
    overlay?: ReactNode;
    onTextareaKeyDown?: (event: KeyboardEvent<HTMLTextAreaElement>) => boolean | void;
    onTextareaFocus?: () => void;
    onTextareaBlur?: () => void;
    onTextareaClick?: () => void;
    onTextareaSelect?: () => void;
    onTextareaKeyUp?: () => void;
};

const assignTextareaRef = (
    ref: Ref<HTMLTextAreaElement> | undefined,
    value: HTMLTextAreaElement | null
) => {
    if (!ref) return;

    if (typeof ref === 'function') {
        ref(value);
        return;
    }

    (ref as { current: HTMLTextAreaElement | null }).current = value;
};

export const CommentComposerInputRow = ({
    value,
    onValueChange,
    onSubmit,
    placeholder,
    submitAriaLabel,
    disabled = false,
    isSubmitting = false,
    textareaRef,
    autoFocus = false,
    className,
    tone = 'default',
    overlay,
    onTextareaKeyDown,
    onTextareaFocus,
    onTextareaBlur,
    onTextareaClick,
    onTextareaSelect,
    onTextareaKeyUp,
}: CommentComposerInputRowProps) => {
    const internalTextareaRef = useRef<HTMLTextAreaElement | null>(null);
    const [isExpanded, setIsExpanded] = useState(value.includes('\n'));
    const hasValue = value.trim().length > 0;
    const canSubmit = !disabled && hasValue && !isSubmitting;
    const showActiveButton = hasValue || isSubmitting;
    const isDarkTone = tone === 'cinematicDark';

    useEffect(() => {
        if (!autoFocus) return;

        const frameId = window.requestAnimationFrame(() => {
            internalTextareaRef.current?.focus({ preventScroll: true });
        });

        return () => window.cancelAnimationFrame(frameId);
    }, [autoFocus]);

    useEffect(() => {
        if (value.length === 0) {
            setIsExpanded(false);
        }
    }, [value]);

    return (
        <div className={cn('relative w-full max-w-[312px]', className)}>
            {overlay}
            <div
                className={cn(
                    'overflow-hidden rounded-[22px] border',
                    isDarkTone
                        ? 'border-shell-dark-border bg-shell-dark-surface/95 shadow-[0_16px_36px_rgba(0,0,0,0.22)]'
                        : 'border-shell-border bg-shell-bg/95 shadow-[0_16px_36px_rgba(15,23,42,0.12)]'
                )}
            >
                <div
                    className={cn(
                        'grid grid-cols-[minmax(0,1fr)_32px] gap-2 pl-4 pr-1.5',
                        isExpanded
                            ? 'items-start pt-3 pb-2.5'
                            : 'items-center py-1.5'
                    )}
                >
                    <ShellTextareaAutosize
                        ref={(node) => {
                            internalTextareaRef.current = node;
                            assignTextareaRef(textareaRef, node);
                        }}
                        minRows={1}
                        maxRows={5}
                        value={value}
                        onChange={(event) => onValueChange(event.target.value)}
                        onFocus={onTextareaFocus}
                        onBlur={onTextareaBlur}
                        onClick={onTextareaClick}
                        onSelect={onTextareaSelect}
                        onKeyUp={onTextareaKeyUp}
                        // Keep a small buffer so the composer doesn't flip at the wrap threshold.
                        onHeightChange={(height) =>
                            setIsExpanded((current) => (current ? height > 30 : height > 34))
                        }
                        onKeyDown={(event) => {
                            const wasHandled = onTextareaKeyDown?.(event);
                            if (wasHandled) {
                                return;
                            }

                            if (
                                event.key !== 'Enter' ||
                                event.shiftKey ||
                                event.nativeEvent.isComposing
                            ) {
                                return;
                            }

                            event.preventDefault();
                            if (!canSubmit) return;
                            onSubmit();
                        }}
                        placeholder={placeholder}
                        tone={tone}
                        variant="bare"
                        className="max-h-[132px] resize-none overflow-y-auto py-[6px] text-sm leading-5"
                    />

                    {!isExpanded ? (
                        <ShellIconButton
                            size="sm"
                            tone={tone}
                            shape="circle"
                            className={cn(
                                'h-8 w-8 shrink-0 rounded-full border transition-colors',
                                showActiveButton
                                    ? isDarkTone
                                        ? 'border-shell-dark-accent bg-shell-dark-accent text-white hover:bg-shell-dark-accent-hover hover:border-shell-dark-accent-hover'
                                        : 'border-shell-accent bg-shell-accent text-white hover:bg-shell-accent-hover hover:border-shell-accent-hover'
                                    : isDarkTone
                                        ? 'border-shell-dark-border bg-shell-dark-panel text-shell-dark-muted hover:bg-shell-dark-panel hover:text-shell-dark-text'
                                        : 'border-shell-border bg-shell-surface text-shell-muted hover:bg-shell-surface-subtle hover:text-shell-text'
                            )}
                            onClick={onSubmit}
                            disabled={!canSubmit}
                            aria-label={submitAriaLabel}
                        >
                            {isSubmitting ? (
                                <Loader2 size={13} className="animate-spin" />
                            ) : (
                                <ArrowUp size={13} />
                            )}
                        </ShellIconButton>
                    ) : (
                        <div aria-hidden="true" className="h-8 w-8 shrink-0" />
                    )}
                </div>

                {isExpanded ? (
                    <div
                        className={cn(
                            'flex items-center justify-end border-t px-3 py-2',
                            isDarkTone
                                ? 'border-[rgb(var(--shell-dark-border)/0.07)]'
                                : 'border-[rgb(var(--shell-border)/0.82)]'
                        )}
                    >
                        <ShellIconButton
                            size="sm"
                            tone={tone}
                            shape="circle"
                            className={cn(
                                'h-8 w-8 shrink-0 rounded-full border transition-colors',
                                showActiveButton
                                    ? isDarkTone
                                        ? 'border-shell-dark-accent bg-shell-dark-accent text-white hover:bg-shell-dark-accent-hover hover:border-shell-dark-accent-hover'
                                        : 'border-shell-accent bg-shell-accent text-white hover:bg-shell-accent-hover hover:border-shell-accent-hover'
                                    : isDarkTone
                                        ? 'border-shell-dark-border bg-shell-dark-panel text-shell-dark-muted hover:bg-shell-dark-panel hover:text-shell-dark-text'
                                        : 'border-shell-border bg-shell-surface text-shell-muted hover:bg-shell-surface-subtle hover:text-shell-text'
                            )}
                            onClick={onSubmit}
                            disabled={!canSubmit}
                            aria-label={submitAriaLabel}
                        >
                            {isSubmitting ? (
                                <Loader2 size={13} className="animate-spin" />
                            ) : (
                                <ArrowUp size={13} />
                            )}
                        </ShellIconButton>
                    </div>
                ) : null}
            </div>
        </div>
    );
};
