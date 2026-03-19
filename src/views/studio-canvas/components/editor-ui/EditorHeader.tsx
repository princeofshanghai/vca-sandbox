import { ReactNode } from 'react';
import { LucideIcon, Trash2, X } from 'lucide-react';
import { ShellIconButton } from '@/components/shell';
import { cn } from '@/utils/cn';

interface EditorHeaderProps {
    icon?: LucideIcon;
    title: string;
    titlePrefix?: string | null;
    onClose?: () => void;
    onDelete?: () => void;
    deleteLabel?: string;
    deleteDisabled?: boolean;
    className?: string;
    actions?: ReactNode;
}

export function EditorHeader({
    icon,
    title,
    titlePrefix = 'Edit',
    onClose,
    onDelete,
    deleteLabel,
    deleteDisabled = false,
    className,
    actions,
}: EditorHeaderProps) {
    const Icon = icon;
    const resolvedDeleteLabel = deleteLabel || `Remove ${title}`;
    const headingText = titlePrefix ? `${titlePrefix} ${title}` : title;

    return (
        <div className={cn("flex items-center justify-between border-b border-shell-border-subtle px-6 py-4 shrink-0", className)}>
            <div className="flex items-center gap-3 overflow-hidden">
                {Icon && (
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-shell-border-subtle bg-shell-surface-subtle text-shell-muted shrink-0">
                        <Icon size={16} />
                    </div>
                )}
                <h3 className="text-sm font-semibold text-shell-text truncate">
                    {headingText}
                </h3>
            </div>

            <div className="flex items-center gap-2">
                {actions}
                {onDelete && (
                    <ShellIconButton
                        onClick={onDelete}
                        type="button"
                        size="sm"
                        aria-label={resolvedDeleteLabel}
                        title={resolvedDeleteLabel}
                        disabled={deleteDisabled}
                        className="hover:bg-shell-danger-soft hover:text-shell-danger"
                    >
                        <Trash2 size={16} />
                    </ShellIconButton>
                )}
                {onClose && (
                    <ShellIconButton
                        onClick={onClose}
                        type="button"
                        data-editor-close
                        size="sm"
                        aria-label={`Close ${title} editor`}
                    >
                        <X size={16} />
                    </ShellIconButton>
                )}
            </div>
        </div>
    );
}
