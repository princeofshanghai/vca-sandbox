import {
    CheckCircle2,
    Loader2,
    RotateCcw,
    X,
} from 'lucide-react';
import {
    ShellButton,
    ShellIconButton,
    ShellNotice,
    ShellTextarea,
} from '@/components/shell';
import {
    CommentActionsMenu,
    CommentAvatar,
    CommentComposerInputRow,
    CommentResolvedBadge,
    type CommentSurfaceTone,
} from '@/components/comments/CommentPrimitives';
import { cn } from '@/utils/cn';
import type { FlowComment, FlowCommentThread } from '../share/shareComments';
import { formatCommentDate, formatCommentRelativeTime } from './canvasComments';

type CanvasCommentPopoverProps =
    | {
      mode: 'new';
      error?: string | null;
      isAuthLoading?: boolean;
      userCanComment: boolean;
      onSignIn?: () => void;
      value: string;
      isSubmitting: boolean;
      onValueChange: (value: string) => void;
      onSubmit: () => void;
      onClose: () => void;
      surfaceTone?: CommentSurfaceTone;
      }
    | {
          mode: 'thread';
          error?: string | null;
          isAuthLoading?: boolean;
          userCanComment: boolean;
          onSignIn?: () => void;
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
          surfaceTone?: CommentSurfaceTone;
      };

const NEW_COMMENT_POPOVER_WIDTH_PX = 320;
const COMMENT_POPOVER_WIDTH_PX = 360;
const COMMENT_POPOVER_SIGN_IN_WIDTH_PX = 380;

const popoverToneClasses: Record<CommentSurfaceTone, {
    panel: string;
    signInPanel: string;
    divider: string;
    listDivider: string;
    text: string;
    muted: string;
    footerSurface: string;
    detailSurface: string;
    secondaryButton: string;
    primaryButton: string;
}> = {
    default: {
        panel: 'border-shell-border bg-shell-bg/95 shadow-[0_20px_46px_rgba(15,23,42,0.16)]',
        signInPanel: 'border-shell-border bg-shell-bg/95 shadow-[0_18px_40px_rgba(15,23,42,0.14)]',
        divider: 'border-shell-border',
        listDivider: 'divide-shell-border',
        text: 'text-shell-text',
        muted: 'text-shell-muted',
        footerSurface: 'bg-shell-surface/70',
        detailSurface: 'bg-shell-surface/80',
        secondaryButton: 'h-8 text-[11px]',
        primaryButton: 'h-8 text-[11px]',
    },
    cinematicDark: {
        panel: 'border-shell-dark-border bg-shell-dark-panel/95 shadow-2xl',
        signInPanel: 'border-shell-dark-border bg-shell-dark-panel/95 shadow-2xl',
        divider: 'border-shell-dark-border',
        listDivider: 'divide-shell-dark-border',
        text: 'text-shell-dark-text',
        muted: 'text-shell-dark-muted',
        footerSurface: 'bg-shell-dark-surface/35',
        detailSurface: 'bg-shell-dark-surface/35',
        secondaryButton: 'h-8 text-[11px] text-shell-dark-muted hover:bg-shell-dark-surface hover:text-shell-dark-text',
        primaryButton: 'h-8 text-[11px] bg-shell-dark-accent hover:bg-shell-dark-accent-hover text-shell-dark-text',
    },
};

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
    surfaceTone = 'default',
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
    surfaceTone?: CommentSurfaceTone;
}) {
    const isEditing = editingCommentId === comment.id;
    const isSaving = savingEditCommentId === comment.id;
    const canSaveEdit = editDraft.trim().length > 0;
    const canManage = canManageComment(comment) && thread.root.status !== 'resolved';
    const toneClasses = popoverToneClasses[surfaceTone];

    return (
        <div className="px-4 py-3.5">
            <div className="flex items-start gap-2.5">
                <CommentAvatar
                    name={comment.author_name}
                    avatarUrl={comment.author_avatar_url}
                    size="w-7 h-7"
                    textSize="text-[9px]"
                    tone={surfaceTone}
                />

                <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                                <span className={cn('text-xs font-medium truncate', toneClasses.text)}>
                                    {comment.author_name}
                                </span>
                                <span
                                    className={cn('text-[11px] shrink-0', toneClasses.muted)}
                                    title={formatCommentDate(comment.created_at)}
                                >
                                    {formatCommentRelativeTime(comment.created_at)}
                                </span>
                            </div>
                        </div>

                        {canManage ? (
                            <CommentActionsMenu
                                ariaLabel={comment.id === thread.root.id ? 'Thread actions' : 'Comment actions'}
                                editLabel={comment.id === thread.root.id ? 'Edit comment' : 'Edit'}
                                deleteLabel={comment.id === thread.root.id ? 'Delete thread' : 'Delete reply'}
                                onEdit={() => onStartEditing(comment)}
                                onDelete={() => onDeleteComment(comment)}
                                tone={surfaceTone}
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
                                tone={surfaceTone}
                                className="min-h-[84px] max-h-[160px] resize-none rounded-2xl"
                            />
                            <div className="mt-2 flex items-center justify-end gap-2">
                                <ShellButton
                                    size="compact"
                                    variant="ghost"
                                    className={toneClasses.secondaryButton}
                                    onClick={onCancelEdit}
                                    disabled={isSaving}
                                >
                                    Cancel
                                </ShellButton>
                                <ShellButton
                                    size="compact"
                                    className={toneClasses.primaryButton}
                                    onClick={() => onSaveEdit(comment.id)}
                                    disabled={isSaving || !canSaveEdit}
                                >
                                    {isSaving ? <Loader2 size={12} className="animate-spin" /> : null}
                                    Save
                                </ShellButton>
                            </div>
                        </div>
                    ) : (
                        <p className={cn('mt-1 text-[13px] leading-relaxed whitespace-pre-wrap break-words', toneClasses.text)}>
                            {comment.message}
                        </p>
                    )}

                    {deletingCommentId === comment.id ? (
                        <div className={cn('mt-2 flex items-center gap-2 text-[11px]', toneClasses.muted)}>
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
    const surfaceTone = props.surfaceTone ?? 'default';
    const toneClasses = popoverToneClasses[surfaceTone];

    if (props.mode === 'new') {
        const canSubmit = props.userCanComment && props.value.trim().length > 0 && !props.isSubmitting;

        return (
            <div className="space-y-2">
                {props.error ? (
                    <ShellNotice
                        tone={surfaceTone}
                        variant="error"
                        description={props.error}
                        className="w-full md:w-[360px] max-w-[calc(100vw-40px)] rounded-2xl"
                    />
                ) : null}

                {!props.userCanComment ? (
                    <div
                        className={cn(
                            'max-w-[calc(100vw-40px)] rounded-2xl border px-4 py-3 backdrop-blur',
                            toneClasses.signInPanel
                        )}
                        style={{ width: COMMENT_POPOVER_SIGN_IN_WIDTH_PX }}
                    >
                        <p className={cn('text-xs leading-relaxed', toneClasses.muted)}>
                            Sign in to leave a comment on this canvas.
                        </p>
                        {props.onSignIn ? (
                            <div className="mt-3 flex justify-end">
                                <ShellButton
                                    size="compact"
                                    className={toneClasses.primaryButton}
                                    onClick={props.onSignIn}
                                    disabled={props.isAuthLoading}
                                >
                                    {props.isAuthLoading ? <Loader2 size={12} className="animate-spin" /> : null}
                                    Sign in
                                </ShellButton>
                            </div>
                        ) : null}
                    </div>
                ) : (
                    <div
                        className="w-full max-w-[calc(100vw-40px)]"
                        style={{ width: NEW_COMMENT_POPOVER_WIDTH_PX }}
                    >
                        <CommentComposerInputRow
                            value={props.value}
                            onValueChange={props.onValueChange}
                            onSubmit={props.onSubmit}
                            placeholder="Add a comment"
                            submitAriaLabel="Post comment"
                            disabled={!canSubmit}
                            isSubmitting={props.isSubmitting}
                            autoFocus
                            className="max-w-none"
                            tone={surfaceTone}
                        />
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
        onSignIn,
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
    const canSubmitReply = userCanComment && replyDraft.trim().length > 0 && !isReplySubmitting;

    const threadComments = [thread.root, ...thread.replies];

    return (
        <div
            className={cn(
                'max-w-[calc(100vw-40px)] rounded-3xl border backdrop-blur overflow-hidden',
                toneClasses.panel
            )}
            style={{ width: COMMENT_POPOVER_WIDTH_PX }}
        >
            {error ? (
                <ShellNotice
                    tone={surfaceTone}
                    variant="error"
                    description={error}
                    className="rounded-none border-x-0 border-t-0"
                />
            ) : null}

            <div className={cn('px-4 py-3 border-b flex items-center justify-between gap-3', toneClasses.divider)}>
                <div className="flex items-center gap-2 min-w-0">
                    <h3 className={cn('text-sm font-semibold', toneClasses.text)}>Comment</h3>
                    {isResolved ? <CommentResolvedBadge tone={surfaceTone} /> : null}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                    {canResolveThread ? (
                        <ShellIconButton
                            size="sm"
                            tone={surfaceTone}
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
                        tone={surfaceTone}
                        shape="circle"
                        onClick={onClose}
                        aria-label="Close comment thread"
                    >
                        <X size={14} />
                    </ShellIconButton>
                </div>
            </div>

            <div className={cn('max-h-[340px] overflow-y-auto thin-scrollbar divide-y', toneClasses.listDivider)}>
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
                        surfaceTone={surfaceTone}
                    />
                ))}
            </div>

            {isResolved ? (
                <div className={cn('px-4 py-3 border-t', toneClasses.divider, toneClasses.footerSurface)}>
                    <div className={cn('text-xs', toneClasses.muted)}>Resolved. Reopen to reply.</div>
                </div>
            ) : !userCanComment ? (
                <div className={cn('px-4 py-3 border-t flex items-center justify-between gap-3', toneClasses.divider)}>
                    <div className={cn('text-xs', toneClasses.muted)}>Sign in to reply.</div>
                    {onSignIn ? (
                        <ShellButton
                            size="compact"
                            className={toneClasses.primaryButton}
                            onClick={onSignIn}
                            disabled={props.isAuthLoading}
                        >
                            {props.isAuthLoading ? <Loader2 size={12} className="animate-spin" /> : null}
                            Sign in
                        </ShellButton>
                    ) : null}
                </div>
            ) : (
                <div className={cn('px-4 py-3 border-t', toneClasses.divider)}>
                    <CommentComposerInputRow
                        value={replyDraft}
                        onValueChange={onReplyDraftChange}
                        onSubmit={onReplySubmit}
                        placeholder="Reply"
                        submitAriaLabel="Post reply"
                        disabled={!canSubmitReply}
                        isSubmitting={isReplySubmitting}
                        tone={surfaceTone}
                    />
                </div>
            )}
        </div>
    );
}
