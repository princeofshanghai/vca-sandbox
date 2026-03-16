import {
    ArrowUp,
    CheckCircle2,
    Loader2,
    MoreHorizontal,
    Pencil,
    RotateCcw,
    Trash2,
    X,
} from 'lucide-react';
import {
    ShellButton,
    ShellIconButton,
    ShellMenu,
    ShellMenuContent,
    ShellMenuItem,
    ShellMenuSeparator,
    ShellMenuTrigger,
    ShellNotice,
    ShellTextarea,
} from '@/components/shell';
import { cn } from '@/utils/cn';
import { getInitialsFromName } from '@/utils/userIdentity';
import type { FlowComment, FlowCommentThread } from '../share/shareComments';
import { formatCommentDate, formatCommentRelativeTime } from './canvasComments';

type CanvasCommentPopoverProps =
    | {
          mode: 'new';
          error?: string | null;
          isAuthLoading?: boolean;
          userCanComment: boolean;
          value: string;
          isSubmitting: boolean;
          onValueChange: (value: string) => void;
          onSubmit: () => void;
          onClose: () => void;
      }
    | {
          mode: 'thread';
          error?: string | null;
          isAuthLoading?: boolean;
          userCanComment: boolean;
          thread: FlowCommentThread;
          replyDraft: string;
          onReplyDraftChange: (value: string) => void;
          onReplySubmit: () => void;
          isReplySubmitting: boolean;
          canManageComment: (comment: FlowComment) => boolean;
          canResolveThread: boolean;
          editingCommentId: string | null;
          editDraft: string;
          onStartEditing: (comment: FlowComment) => void;
          onEditDraftChange: (value: string) => void;
          onSaveEdit: (commentId: string) => void;
          onCancelEdit: () => void;
          savingEditCommentId: string | null;
          onToggleThreadStatus: () => void;
          isStatusUpdating: boolean;
          deletingCommentId: string | null;
          onDeleteComment: (comment: FlowComment) => void;
          onClose: () => void;
      };

const renderAvatar = ({
    name,
    avatarUrl,
    size,
    textSize,
}: {
    name: string;
    avatarUrl?: string | null;
    size: string;
    textSize: string;
}) => (
    <span
        className={cn(
            'rounded-full overflow-hidden border border-shell-dark-border bg-shell-dark-surface block',
            size
        )}
    >
        {avatarUrl ? (
            <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
        ) : (
            <span
                className={cn(
                    'w-full h-full flex items-center justify-center text-shell-dark-muted font-semibold',
                    textSize
                )}
            >
                {getInitialsFromName(name)}
            </span>
        )}
    </span>
);

const ResolvedBadge = () => (
    <span className="rounded-full border border-shell-dark-border bg-shell-dark-surface px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.08em] text-shell-dark-muted">
        Resolved
    </span>
);

const CommentActionsMenu = ({
    thread,
    comment,
    onStartEditing,
    onDeleteComment,
}: {
    thread: FlowCommentThread;
    comment: FlowComment;
    onStartEditing: (comment: FlowComment) => void;
    onDeleteComment: (comment: FlowComment) => void;
}) => (
    <ShellMenu>
        <ShellMenuTrigger asChild>
            <ShellIconButton
                size="sm"
                tone="cinematicDark"
                shape="circle"
                aria-label={comment.id === thread.root.id ? 'Thread actions' : 'Comment actions'}
            >
                <MoreHorizontal size={14} />
            </ShellIconButton>
        </ShellMenuTrigger>
        <ShellMenuContent align="end" tone="cinematicDark" className="w-40">
            <ShellMenuItem tone="cinematicDark" onSelect={() => onStartEditing(comment)}>
                <Pencil size={14} />
                <span>{comment.id === thread.root.id ? 'Edit comment' : 'Edit'}</span>
            </ShellMenuItem>
            <ShellMenuSeparator tone="cinematicDark" />
            <ShellMenuItem
                tone="cinematicDark"
                variant="destructive"
                onSelect={() => onDeleteComment(comment)}
            >
                <Trash2 size={14} />
                <span>{comment.id === thread.root.id ? 'Delete thread' : 'Delete reply'}</span>
            </ShellMenuItem>
        </ShellMenuContent>
    </ShellMenu>
);

function ThreadCommentBody({
    thread,
    comment,
    editingCommentId,
    editDraft,
    onStartEditing,
    onEditDraftChange,
    onSaveEdit,
    onCancelEdit,
    savingEditCommentId,
    deletingCommentId,
    canManageComment,
    onDeleteComment,
}: {
    thread: FlowCommentThread;
    comment: FlowComment;
    editingCommentId: string | null;
    editDraft: string;
    onStartEditing: (comment: FlowComment) => void;
    onEditDraftChange: (value: string) => void;
    onSaveEdit: (commentId: string) => void;
    onCancelEdit: () => void;
    savingEditCommentId: string | null;
    deletingCommentId: string | null;
    canManageComment: (comment: FlowComment) => boolean;
    onDeleteComment: (comment: FlowComment) => void;
}) {
    const isEditing = editingCommentId === comment.id;
    const isSaving = savingEditCommentId === comment.id;
    const canSaveEdit = editDraft.trim().length > 0;
    const canManage = canManageComment(comment) && thread.root.status !== 'resolved';

    return (
        <div className="px-4 py-3.5">
            <div className="flex items-start gap-2.5">
                {renderAvatar({
                    name: comment.author_name,
                    avatarUrl: comment.author_avatar_url,
                    size: 'w-7 h-7',
                    textSize: 'text-[9px]',
                })}

                <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-shell-dark-text truncate">
                                    {comment.author_name}
                                </span>
                                <span
                                    className="text-[11px] text-shell-dark-muted shrink-0"
                                    title={formatCommentDate(comment.created_at)}
                                >
                                    {formatCommentRelativeTime(comment.created_at)}
                                </span>
                            </div>
                        </div>

                        {canManage ? (
                            <CommentActionsMenu
                                thread={thread}
                                comment={comment}
                                onStartEditing={onStartEditing}
                                onDeleteComment={onDeleteComment}
                            />
                        ) : null}
                    </div>

                    {isEditing ? (
                        <div className="mt-2">
                            <ShellTextarea
                                rows={3}
                                value={editDraft}
                                onChange={(event) => onEditDraftChange(event.target.value)}
                                onKeyDown={(event) => {
                                    if (
                                        event.key !== 'Enter' ||
                                        event.shiftKey ||
                                        event.nativeEvent.isComposing
                                    ) {
                                        return;
                                    }
                                    event.preventDefault();
                                    if (!canSaveEdit || isSaving) return;
                                    onSaveEdit(comment.id);
                                }}
                                tone="cinematicDark"
                                className="min-h-[84px] max-h-[160px] resize-none rounded-2xl bg-shell-dark-surface/85 focus-visible:ring-shell-dark-accent/30"
                            />
                            <div className="mt-2 flex items-center justify-end gap-2">
                                <ShellButton
                                    size="compact"
                                    variant="ghost"
                                    className="h-8 text-[11px] text-shell-dark-muted hover:bg-shell-dark-surface hover:text-shell-dark-text"
                                    onClick={onCancelEdit}
                                    disabled={isSaving}
                                >
                                    Cancel
                                </ShellButton>
                                <ShellButton
                                    size="compact"
                                    className="h-8 text-[11px] bg-shell-dark-accent hover:bg-shell-dark-accent-hover text-shell-dark-text"
                                    onClick={() => onSaveEdit(comment.id)}
                                    disabled={isSaving || !canSaveEdit}
                                >
                                    {isSaving ? <Loader2 size={12} className="animate-spin" /> : null}
                                    Save
                                </ShellButton>
                            </div>
                        </div>
                    ) : (
                        <p className="mt-1 text-[13px] text-shell-dark-text leading-relaxed whitespace-pre-wrap break-words">
                            {comment.message}
                        </p>
                    )}

                    {deletingCommentId === comment.id ? (
                        <div className="mt-2 flex items-center gap-2 text-[11px] text-shell-dark-muted">
                            <Loader2 size={12} className="animate-spin" />
                            Removing…
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}

export function CanvasCommentPopover(props: CanvasCommentPopoverProps) {
    if (props.mode === 'new') {
        const canSubmit = props.userCanComment && props.value.trim().length > 0 && !props.isSubmitting;
        const buttonActive = props.value.trim().length > 0 || props.isSubmitting;

        return (
            <div className="space-y-2">
                {props.error ? (
                    <ShellNotice
                        tone="cinematicDark"
                        variant="error"
                        description={props.error}
                        className="w-full md:w-[400px] max-w-[calc(100vw-40px)] rounded-2xl"
                    />
                ) : null}

                {!props.userCanComment ? (
                    <div className="w-[420px] max-w-[calc(100vw-40px)] rounded-2xl border border-shell-dark-border bg-shell-dark-panel/95 px-4 py-3 shadow-2xl backdrop-blur">
                        <p className="text-xs text-shell-dark-muted leading-relaxed">
                            Sign in to leave a comment on this canvas.
                        </p>
                    </div>
                ) : (
                    <div className="w-full md:w-[400px] max-w-[calc(100vw-40px)] rounded-[26px] border border-shell-dark-border bg-shell-dark-panel/95 pl-4 pr-2 py-1.5 shadow-2xl backdrop-blur">
                        <div className="flex items-center gap-1.5">
                            <ShellTextarea
                                rows={1}
                                value={props.value}
                                onChange={(event) => props.onValueChange(event.target.value)}
                                onKeyDown={(event) => {
                                    if (
                                        event.key !== 'Enter' ||
                                        event.shiftKey ||
                                        event.nativeEvent.isComposing
                                    ) {
                                        return;
                                    }
                                    event.preventDefault();
                                    if (!canSubmit) return;
                                    props.onSubmit();
                                }}
                                placeholder="Add a comment"
                                tone="cinematicDark"
                                variant="bare"
                                className="h-[26px] max-h-[120px] resize-none"
                            />

                            <ShellIconButton
                                size="sm"
                                tone="cinematicDark"
                                shape="circle"
                                className={cn(
                                    'h-[30px] w-[30px] rounded-full transition-colors',
                                    buttonActive
                                        ? 'bg-shell-dark-accent text-white hover:bg-shell-dark-accent-hover'
                                        : 'bg-shell-dark-surface text-shell-dark-muted hover:bg-shell-dark-surface hover:text-shell-dark-muted'
                                )}
                                onClick={props.onSubmit}
                                disabled={!canSubmit}
                                aria-label="Post comment"
                            >
                                {props.isSubmitting ? (
                                    <Loader2 size={13} className="animate-spin" />
                                ) : (
                                    <ArrowUp size={13} />
                                )}
                            </ShellIconButton>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    const {
        thread,
        replyDraft,
        onReplyDraftChange,
        onReplySubmit,
        isReplySubmitting,
        userCanComment,
        canManageComment,
        canResolveThread,
        editingCommentId,
        editDraft,
        onStartEditing,
        onEditDraftChange,
        onSaveEdit,
        onCancelEdit,
        savingEditCommentId,
        onToggleThreadStatus,
        isStatusUpdating,
        deletingCommentId,
        onDeleteComment,
        onClose,
        error,
    } = props;

    const isResolved = thread.root.status === 'resolved';
    const replyButtonActive = replyDraft.trim().length > 0 || isReplySubmitting;
    const canSubmitReply = userCanComment && replyDraft.trim().length > 0 && !isReplySubmitting;

    const threadComments = [thread.root, ...thread.replies];

    return (
        <div className="w-[400px] max-w-[calc(100vw-40px)] rounded-3xl border border-shell-dark-border bg-shell-dark-panel/95 shadow-2xl backdrop-blur overflow-hidden">
            {error ? (
                <ShellNotice
                    tone="cinematicDark"
                    variant="error"
                    description={error}
                    className="rounded-none border-x-0 border-t-0"
                />
            ) : null}

            <div className="px-4 py-3 border-b border-shell-dark-border flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                    <h3 className="text-sm font-semibold text-shell-dark-text">Comment</h3>
                    {isResolved ? <ResolvedBadge /> : null}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                    {canResolveThread ? (
                        <ShellIconButton
                            size="sm"
                            tone="cinematicDark"
                            shape="circle"
                            onClick={onToggleThreadStatus}
                            disabled={isStatusUpdating}
                            aria-label={isResolved ? 'Reopen thread' : 'Resolve thread'}
                        >
                            {isStatusUpdating ? (
                                <Loader2 size={14} className="animate-spin" />
                            ) : isResolved ? (
                                <RotateCcw size={14} />
                            ) : (
                                <CheckCircle2 size={14} />
                            )}
                        </ShellIconButton>
                    ) : null}

                    <ShellIconButton
                        size="sm"
                        tone="cinematicDark"
                        shape="circle"
                        onClick={onClose}
                        aria-label="Close comment thread"
                    >
                        <X size={14} />
                    </ShellIconButton>
                </div>
            </div>

            <div className="max-h-[340px] overflow-y-auto thin-scrollbar divide-y divide-shell-dark-border">
                {threadComments.map((comment) => (
                    <ThreadCommentBody
                        key={comment.id}
                        thread={thread}
                        comment={comment}
                        editingCommentId={editingCommentId}
                        editDraft={editDraft}
                        onStartEditing={onStartEditing}
                        onEditDraftChange={onEditDraftChange}
                        onSaveEdit={onSaveEdit}
                        onCancelEdit={onCancelEdit}
                        savingEditCommentId={savingEditCommentId}
                        deletingCommentId={deletingCommentId}
                        canManageComment={canManageComment}
                        onDeleteComment={onDeleteComment}
                    />
                ))}
            </div>

            {isResolved ? (
                <div className="px-4 py-3 border-t border-shell-dark-border bg-shell-dark-surface/35">
                    <div className="text-xs text-shell-dark-muted">Resolved. Reopen to reply.</div>
                </div>
            ) : !userCanComment ? (
                <div className="px-4 py-3 border-t border-shell-dark-border text-xs text-shell-dark-muted">
                    Sign in to reply.
                </div>
            ) : (
                <div className="px-4 py-3 border-t border-shell-dark-border">
                    <div className="rounded-full border border-shell-dark-border bg-shell-dark-surface/80 pl-3 pr-1.5 py-1">
                        <div className="flex items-center gap-1.5">
                            <ShellTextarea
                                rows={1}
                                value={replyDraft}
                                onChange={(event) => onReplyDraftChange(event.target.value)}
                                onKeyDown={(event) => {
                                    if (
                                        event.key !== 'Enter' ||
                                        event.shiftKey ||
                                        event.nativeEvent.isComposing
                                    ) {
                                        return;
                                    }
                                    event.preventDefault();
                                    if (!canSubmitReply) return;
                                    onReplySubmit();
                                }}
                                placeholder="Reply"
                                tone="cinematicDark"
                                variant="bare"
                                className="h-[26px] max-h-[120px] resize-none"
                            />

                            <ShellIconButton
                                size="sm"
                                tone="cinematicDark"
                                shape="circle"
                                className={cn(
                                    'h-[30px] w-[30px] rounded-full transition-colors',
                                    replyButtonActive
                                        ? 'bg-shell-dark-accent text-white hover:bg-shell-dark-accent-hover'
                                        : 'bg-shell-dark-surface text-shell-dark-muted hover:bg-shell-dark-surface hover:text-shell-dark-muted'
                                )}
                                onClick={onReplySubmit}
                                disabled={!canSubmitReply}
                                aria-label="Post reply"
                            >
                                {isReplySubmitting ? (
                                    <Loader2 size={13} className="animate-spin" />
                                ) : (
                                    <ArrowUp size={13} />
                                )}
                            </ShellIconButton>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
