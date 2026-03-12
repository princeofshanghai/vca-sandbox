import { ReactNode } from 'react';
import { Plus } from 'lucide-react';
import { ShellButton } from '@/components/shell';
import { cn } from '@/utils/cn';

interface EditorAddButtonProps {
    children: ReactNode;
    onClick: () => void;
    disabled?: boolean;
    className?: string;
    icon?: ReactNode;
}

export function EditorAddButton({
    children,
    onClick,
    disabled = false,
    className,
    icon,
}: EditorAddButtonProps) {
    return (
        <ShellButton
            type="button"
            variant="outline"
            onClick={onClick}
            disabled={disabled}
            className={cn(
                "h-9 w-full justify-center gap-1.5 border-dashed bg-transparent text-xs text-shell-muted shadow-none",
                "hover:border-shell-accent-border hover:bg-shell-accent-soft hover:text-shell-accent",
                className
            )}
        >
            {icon ?? <Plus className="h-3.5 w-3.5" />}
            <span>{children}</span>
        </ShellButton>
    );
}
