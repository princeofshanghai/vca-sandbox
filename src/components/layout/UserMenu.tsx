import { useAuth } from '@/hooks/useAuth';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ShellIconButton } from '@/components/shell';
import { ActionTooltip } from '@/views/studio-canvas/components/ActionTooltip';
import { useApp } from '@/contexts/AppContext';
import { Switch } from '@/components/ui/switch';

export function UserMenu() {
    const { user, signOut } = useAuth();
    const { state, setTheme } = useApp();

    if (!user?.email) return null;

    const getInitials = () => {
        if (user.user_metadata?.full_name) {
            const names = user.user_metadata.full_name.split(' ');
            if (names.length >= 2) {
                return (names[0][0] + names[names.length - 1][0]).toUpperCase();
            }
            return names[0].slice(0, 2).toUpperCase();
        }
        return (user.email || '').slice(0, 2).toUpperCase();
    };

    const initials = getInitials();
    const isDarkMode = state.theme === 'dark';

    const updateTheme = (checked: boolean) => {
        setTheme(checked ? 'dark' : 'light');
    };

    return (
        <DropdownMenu>
            <ActionTooltip content={user.email} side="bottom">
                <DropdownMenuTrigger asChild>
                    <ShellIconButton aria-label="Open user menu" className="h-9 w-9">
                        <div className="h-7 w-7 rounded-full bg-[radial-gradient(circle_at_18%_20%,rgb(var(--shell-accent))_0%,rgb(var(--shell-accent-hover))_45%,rgb(var(--shell-muted-strong))_100%)] flex items-center justify-center text-shell-dark-text font-bold text-[10px] tracking-wide">
                            {initials}
                        </div>
                    </ShellIconButton>
                </DropdownMenuTrigger>
            </ActionTooltip>

            <DropdownMenuContent align="end" className="w-[200px] border-shell-border bg-shell-bg text-shell-text">
                <div className="px-2 py-1.5 pb-0">
                    <p className="text-xs font-medium text-shell-muted">Signed in as</p>
                    <p className="text-[13px] font-medium text-shell-text truncate mt-0.5">{user.email}</p>
                </div>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                    className="justify-between gap-3"
                    onSelect={(e) => e.preventDefault()}
                    onClick={() => updateTheme(!isDarkMode)}
                >
                    <span>Dark mode</span>
                    <Switch
                        size="sm"
                        checked={isDarkMode}
                        onCheckedChange={updateTheme}
                        onClick={(e) => e.stopPropagation()}
                        aria-label="Toggle dark mode"
                    />
                </DropdownMenuItem>

                <DropdownMenuItem
                    variant="destructive"
                    className="gap-2"
                    onClick={signOut}
                >
                    <span>Sign out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
