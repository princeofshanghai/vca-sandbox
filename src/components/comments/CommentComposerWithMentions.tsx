import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { Loader2 } from 'lucide-react';
import {
    CommentAvatar,
    CommentComposerInputRow,
    type CommentSurfaceTone,
} from './CommentPrimitives';
import { ShellSelectableRow } from '@/components/shell';
import { cn } from '@/utils/cn';
import {
    createMentionToken,
    pruneCommentDraftMentions,
    searchMentionCandidates,
    type CommentDraftMention,
    type MentionCandidate,
} from '@/lib/commentMentions';

type ActiveMentionQuery = {
    query: string;
    start: number;
    end: number;
};

type CommentComposerWithMentionsProps = {
    value: string;
    onValueChange: (value: string) => void;
    mentions: CommentDraftMention[];
    onMentionsChange: (mentions: CommentDraftMention[]) => void;
    onSubmit: () => void;
    placeholder: string;
    submitAriaLabel: string;
    disabled?: boolean;
    isSubmitting?: boolean;
    autoFocus?: boolean;
    className?: string;
    tone?: CommentSurfaceTone;
    currentUserId?: string | null;
};

const queryBoundaryPattern = /[\s([{'"`]/;

const dropdownToneClasses: Record<CommentSurfaceTone, string> = {
    default:
        'border-shell-border bg-shell-bg shadow-[0_16px_36px_rgba(15,23,42,0.16)]',
    cinematicDark:
        'border-shell-dark-border bg-shell-dark-panel shadow-[0_18px_40px_rgba(0,0,0,0.32)]',
};

const dropdownMutedTextClasses: Record<CommentSurfaceTone, string> = {
    default: 'text-shell-muted',
    cinematicDark: 'text-shell-dark-muted',
};

const dropdownTitleTextClasses: Record<CommentSurfaceTone, string> = {
    default: 'text-shell-text',
    cinematicDark: 'text-shell-dark-text',
};

const getActiveMentionQuery = (
    value: string,
    selectionStart: number | null | undefined
): ActiveMentionQuery | null => {
    const caret = typeof selectionStart === 'number' ? selectionStart : value.length;
    const textBeforeCaret = value.slice(0, caret);
    const atIndex = textBeforeCaret.lastIndexOf('@');

    if (atIndex < 0) return null;

    const previousCharacter = atIndex === 0 ? '' : textBeforeCaret[atIndex - 1];
    if (previousCharacter && !queryBoundaryPattern.test(previousCharacter)) {
        return null;
    }

    const query = textBeforeCaret.slice(atIndex + 1);
    if (!/^[A-Za-z0-9._-]*$/.test(query)) {
        return null;
    }

    return {
        query,
        start: atIndex,
        end: caret,
    };
};

export function CommentComposerWithMentions({
    value,
    onValueChange,
    mentions,
    onMentionsChange,
    onSubmit,
    placeholder,
    submitAriaLabel,
    disabled = false,
    isSubmitting = false,
    autoFocus = false,
    className,
    tone = 'default',
    currentUserId,
}: CommentComposerWithMentionsProps) {
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    const blurTimeoutRef = useRef<number | null>(null);
    const [activeQuery, setActiveQuery] = useState<ActiveMentionQuery | null>(null);
    const [candidates, setCandidates] = useState<MentionCandidate[]>([]);
    const [isLoadingCandidates, setIsLoadingCandidates] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(0);

    const syncActiveQuery = useCallback(
        (nextValue = value) => {
            const nextQuery = getActiveMentionQuery(
                nextValue,
                textareaRef.current?.selectionStart ?? nextValue.length
            );
            setActiveQuery(nextQuery);
            setHighlightedIndex(0);
        },
        [value]
    );

    useEffect(() => {
        const nextMentions = pruneCommentDraftMentions(value, mentions);
        if (nextMentions.length !== mentions.length) {
            onMentionsChange(nextMentions);
        }
    }, [mentions, onMentionsChange, value]);

    useEffect(() => {
        if (!currentUserId || !activeQuery || disabled) {
            setCandidates([]);
            setIsLoadingCandidates(false);
            return;
        }

        let isCancelled = false;
        setIsLoadingCandidates(true);

        const timerId = window.setTimeout(async () => {
            try {
                const nextCandidates = await searchMentionCandidates({
                    query: activeQuery.query,
                    currentUserId,
                });
                if (!isCancelled) {
                    setCandidates(nextCandidates);
                    setHighlightedIndex(0);
                }
            } catch (error) {
                console.error('Error loading mention candidates:', error);
                if (!isCancelled) {
                    setCandidates([]);
                }
            } finally {
                if (!isCancelled) {
                    setIsLoadingCandidates(false);
                }
            }
        }, 120);

        return () => {
            isCancelled = true;
            window.clearTimeout(timerId);
        };
    }, [activeQuery, currentUserId, disabled]);

    useEffect(
        () => () => {
            if (blurTimeoutRef.current) {
                window.clearTimeout(blurTimeoutRef.current);
            }
        },
        []
    );

    const hideDropdown = useCallback(() => {
        setActiveQuery(null);
        setCandidates([]);
        setIsLoadingCandidates(false);
        setHighlightedIndex(0);
    }, []);

    const selectCandidate = useCallback(
        (candidate: MentionCandidate) => {
            if (!activeQuery) return;

            const token = createMentionToken(candidate, mentions);
            const nextValue = [
                value.slice(0, activeQuery.start),
                `${token} `,
                value.slice(activeQuery.end),
            ].join('');

            const nextMentions = pruneCommentDraftMentions(nextValue, [
                ...mentions.filter((mention) => mention.userId !== candidate.userId),
                {
                    ...candidate,
                    token,
                },
            ]);

            onMentionsChange(nextMentions);
            onValueChange(nextValue);
            hideDropdown();

            window.requestAnimationFrame(() => {
                if (!textareaRef.current) return;
                const nextCaretPosition = activeQuery.start + token.length + 1;
                textareaRef.current.focus({ preventScroll: true });
                textareaRef.current.setSelectionRange(nextCaretPosition, nextCaretPosition);
            });
        },
        [activeQuery, hideDropdown, mentions, onMentionsChange, onValueChange, value]
    );

    const highlightedCandidate = candidates[highlightedIndex] || null;
    const showDropdown = Boolean(activeQuery && currentUserId && !disabled);
    const showNoMatches = showDropdown && !isLoadingCandidates && candidates.length === 0;

    const handleTextareaKeyDown = useCallback(
        (event: KeyboardEvent<HTMLTextAreaElement>) => {
            if (!showDropdown) return false;

            if (event.key === 'ArrowDown') {
                event.preventDefault();
                if (candidates.length === 0) return true;
                setHighlightedIndex((current) => (current + 1) % candidates.length);
                return true;
            }

            if (event.key === 'ArrowUp') {
                event.preventDefault();
                if (candidates.length === 0) return true;
                setHighlightedIndex((current) =>
                    current === 0 ? candidates.length - 1 : current - 1
                );
                return true;
            }

            if ((event.key === 'Enter' || event.key === 'Tab') && highlightedCandidate) {
                event.preventDefault();
                selectCandidate(highlightedCandidate);
                return true;
            }

            if (event.key === 'Escape') {
                event.preventDefault();
                hideDropdown();
                return true;
            }

            return false;
        },
        [candidates.length, hideDropdown, highlightedCandidate, selectCandidate, showDropdown]
    );

    const scheduleSync = useCallback(
        (nextValue = value) => {
            window.requestAnimationFrame(() => {
                syncActiveQuery(nextValue);
            });
        },
        [syncActiveQuery, value]
    );

    const dropdownContent = useMemo(() => {
        if (!showDropdown) return null;

        return (
            <div
                className={cn(
                    'absolute bottom-full left-0 right-0 z-20 mb-2 overflow-hidden rounded-[22px] border backdrop-blur-sm',
                    dropdownToneClasses[tone]
                )}
            >
                <div className="max-h-64 overflow-y-auto p-2 thin-scrollbar">
                    {isLoadingCandidates ? (
                        <div
                            className={cn(
                                'flex items-center justify-center gap-2 px-3 py-4 text-xs',
                                dropdownMutedTextClasses[tone]
                            )}
                        >
                            <Loader2 size={14} className="animate-spin" />
                            Searching teammates...
                        </div>
                    ) : showNoMatches ? (
                        <div
                            className={cn(
                                'px-3 py-4 text-xs',
                                dropdownMutedTextClasses[tone]
                            )}
                        >
                            No teammates found.
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {candidates.map((candidate, index) => (
                                <ShellSelectableRow
                                    key={candidate.userId}
                                    size="compact"
                                    tone={tone}
                                    selected={index === highlightedIndex}
                                    onMouseDown={(event) => {
                                        event.preventDefault();
                                        selectCandidate(candidate);
                                    }}
                                >
                                    <CommentAvatar
                                        name={candidate.displayName}
                                        avatarUrl={candidate.avatarUrl}
                                        size="h-7 w-7 shrink-0"
                                        textSize="text-[10px]"
                                        tone={tone}
                                    />

                                    <div className="min-w-0 flex-1">
                                        <div
                                            className={cn(
                                                'truncate text-xs font-medium',
                                                dropdownTitleTextClasses[tone]
                                            )}
                                        >
                                            {candidate.displayName}
                                        </div>
                                        {candidate.email ? (
                                            <div
                                                className={cn(
                                                    'truncate text-[11px]',
                                                    dropdownMutedTextClasses[tone]
                                                )}
                                            >
                                                {candidate.email}
                                            </div>
                                        ) : null}
                                    </div>
                                </ShellSelectableRow>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    }, [
        candidates,
        highlightedIndex,
        isLoadingCandidates,
        selectCandidate,
        showDropdown,
        showNoMatches,
        tone,
    ]);

    return (
        <CommentComposerInputRow
            value={value}
            onValueChange={(nextValue) => {
                onValueChange(nextValue);
                scheduleSync(nextValue);
            }}
            onSubmit={onSubmit}
            placeholder={placeholder}
            submitAriaLabel={submitAriaLabel}
            disabled={disabled}
            isSubmitting={isSubmitting}
            textareaRef={textareaRef}
            autoFocus={autoFocus}
            className={className}
            tone={tone}
            overlay={dropdownContent}
            onTextareaKeyDown={handleTextareaKeyDown}
            onTextareaFocus={() => {
                if (blurTimeoutRef.current) {
                    window.clearTimeout(blurTimeoutRef.current);
                    blurTimeoutRef.current = null;
                }
                scheduleSync();
            }}
            onTextareaBlur={() => {
                blurTimeoutRef.current = window.setTimeout(() => {
                    hideDropdown();
                }, 120);
            }}
            onTextareaClick={() => scheduleSync()}
            onTextareaSelect={() => scheduleSync()}
            onTextareaKeyUp={() => scheduleSync()}
        />
    );
}
