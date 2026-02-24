import { ReactNode } from 'react';
import { LucideIcon, X } from 'lucide-react';
import { cn } from '@/utils/cn';

interface EditorHeaderProps {
    icon?: LucideIcon;
    title: string;
    onClose?: () => void;
    className?: string;
    actions?: ReactNode;
}

export function EditorHeader({ title, onClose, className, actions }: EditorHeaderProps) {
    return (
        <div className={cn("flex items-center justify-between px-5 py-4 border-b border-shell-border-subtle shrink-0", className)}>
            <div className="flex items-center gap-2.5 overflow-hidden">
                <h3 className="text-sm font-semibold text-shell-text truncate">
                    Edit {title}
                </h3>
            </div>

            <div className="flex items-center gap-2">
                {actions}
                {onClose && (
                    <button
                        onClick={onClose}
                        className="p-1.5 text-shell-muted hover:text-shell-text hover:bg-shell-surface-subtle rounded-md transition-colors"
                    >
                        <X size={16} />
                    </button>
                )}
            </div>
        </div>
    );
}
