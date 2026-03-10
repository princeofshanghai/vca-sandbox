import { useAuth } from '@/hooks/useAuth';
import {
    ShellIconButton,
    ShellMenu,
    ShellMenuContent,
    ShellMenuItem,
    ShellMenuSeparator,
    ShellMenuSwitchItem,
    ShellMenuTrigger,
} from '@/components/shell';
import { ActionTooltip } from '@/views/studio-canvas/components/ActionTooltip';
import { useApp } from '@/contexts/AppContext';
import { getUserAvatarUrl, getUserInitials } from '@/utils/userIdentity';

export function UserMenu() {
    const { user, signOut } = useAuth();
    const { state, setTheme } = useApp();

    if (!user?.email) return null;

    const initials = getUserInitials(user);
    const avatarUrl = getUserAvatarUrl(user);
    const isDarkMode = state.theme === 'dark';

    const updateTheme = (checked: boolean) => {
        setTheme(checked ? 'dark' : 'light');
    };

    return (
        <ShellMenu>
            <ActionTooltip content={user.email} side="bottom">
                <ShellMenuTrigger asChild>
                    <ShellIconButton aria-label="Open user menu" className="h-9 w-9">
                        <div className="h-7 w-7 rounded-full overflow-hidden border border-shell-border/70 bg-shell-surface">
                            {avatarUrl ? (
                                <img
                                    src={avatarUrl}
                                    alt="Your profile photo"
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="h-full w-full bg-[radial-gradient(circle_at_18%_20%,rgb(var(--shell-accent))_0%,rgb(var(--shell-accent-hover))_45%,rgb(var(--shell-muted-strong))_100%)] flex items-center justify-center text-shell-dark-text font-bold text-[10px] tracking-wide">
                                    {initials}
                                </div>
                            )}
                        </div>
                    </ShellIconButton>
                </ShellMenuTrigger>
            </ActionTooltip>

            <ShellMenuContent align="end" size="compact" className="w-[212px]">
                <div className="px-2 py-1.5 pb-0">
                    <p className="text-[11px] font-medium text-shell-muted">Signed in as</p>
                    <p className="text-[12px] font-medium text-shell-text truncate mt-0.5">{user.email}</p>
                </div>

                <ShellMenuSeparator />

                <ShellMenuSwitchItem
                    checked={isDarkMode}
                    onCheckedChange={(checked) => updateTheme(checked === true)}
                >
                    <span>Dark mode</span>
                </ShellMenuSwitchItem>

                <ShellMenuItem
                    variant="destructive"
                    onClick={signOut}
                >
                    <span>Sign out</span>
                </ShellMenuItem>
            </ShellMenuContent>
        </ShellMenu>
    );
}
