import { LucideIcon, Wand2 } from 'lucide-react';
import {
    ShellButton,
    ShellMenu,
    ShellMenuContent,
    ShellMenuItem,
    ShellMenuTrigger,
} from '@/components/shell';
import { cn } from '@/utils/cn';

interface EditorActionMenuItem {
    label: string;
    onSelect: () => void;
    disabled?: boolean;
    variant?: 'default' | 'destructive';
}

interface EditorActionMenuProps {
    label: string;
    items: EditorActionMenuItem[];
    icon?: LucideIcon;
    disabled?: boolean;
    className?: string;
    contentClassName?: string;
}

export function EditorActionMenu({
    label,
    items,
    icon: Icon = Wand2,
    disabled = false,
    className,
    contentClassName,
}: EditorActionMenuProps) {
    return (
        <ShellMenu>
            <ShellMenuTrigger asChild>
                <ShellButton
                    type="button"
                    variant="ghost"
                    size="compact"
                    disabled={disabled}
                    className={cn(
                        "h-7 gap-1.5 px-2 text-[11px] text-shell-accent hover:bg-shell-accent-soft hover:text-shell-accent-text",
                        className
                    )}
                >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{label}</span>
                </ShellButton>
            </ShellMenuTrigger>
            <ShellMenuContent
                align="end"
                size="compact"
                className={cn("w-48", contentClassName)}
                data-editor-keep-open
            >
                {items.map((item) => (
                    <ShellMenuItem
                        key={item.label}
                        disabled={item.disabled}
                        variant={item.variant}
                        onSelect={() => item.onSelect()}
                    >
                        {item.label}
                    </ShellMenuItem>
                ))}
            </ShellMenuContent>
        </ShellMenu>
    );
}
