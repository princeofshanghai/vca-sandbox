import type { ReactElement } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
    ShellIconButton,
    ShellMenu,
    ShellMenuContent,
    ShellMenuItem,
    ShellMenuSeparator,
    ShellMenuSwitchItem,
    ShellMenuTrigger,
    ShellUserAvatar,
} from '@/components/shell';
import { ActionTooltip } from '@/views/studio-canvas/components/ActionTooltip';
import { useApp } from '@/contexts/AppContext';
import { getUserAvatarUrl, getUserInitials } from '@/utils/userIdentity';

type UserMenuBackItem = {
    label: string;
    onSelect: () => void;
};

type UserMenuSwitchItemConfig = {
    label: string;
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
};

type UserMenuProps = {
    trigger?: ReactElement;
    backItem?: UserMenuBackItem;
    switchItems?: UserMenuSwitchItemConfig[];
    contentAlign?: 'start' | 'center' | 'end';
    showAccountDetails?: boolean;
};

export function UserMenu({
    trigger,
    backItem,
    switchItems = [],
    contentAlign = 'end',
    showAccountDetails = true,
}: UserMenuProps) {
    const { user, signOut } = useAuth();
    const { state, setTheme } = useApp();

    if (!user?.email && !trigger) return null;

    const userEmail = user?.email ?? '';
    const initials = getUserInitials(user);
    const avatarUrl = getUserAvatarUrl(user);
    const isDarkMode = state.theme === 'dark';
    const shouldShowAccountDetails = Boolean(user?.email) && showAccountDetails;
    const showSignOut = Boolean(user);

    const updateTheme = (checked: boolean) => {
        setTheme(checked ? 'dark' : 'light');
    };

    return (
        <ShellMenu>
            {trigger ? (
                <ShellMenuTrigger asChild>
                    {trigger}
                </ShellMenuTrigger>
            ) : (
                <ActionTooltip content={userEmail} side="bottom">
                    <ShellMenuTrigger asChild>
                        <ShellIconButton aria-label="Open user menu" className="h-9 w-9">
                            <ShellUserAvatar
                                name={userEmail || 'Signed-in user'}
                                avatarUrl={avatarUrl}
                                alt="Your profile photo"
                                fallbackLabel={initials}
                                sizeClassName="h-7 w-7"
                                textClassName="text-[10px]"
                            />
                        </ShellIconButton>
                    </ShellMenuTrigger>
                </ActionTooltip>
            )}

            <ShellMenuContent align={contentAlign} size="compact" className="w-[212px]">
                {shouldShowAccountDetails ? (
                    <div className="px-2 py-1.5 pb-0">
                        <p className="text-[11px] font-medium text-shell-muted">Signed in as</p>
                        <p className="text-[12px] font-medium text-shell-text truncate mt-0.5">{userEmail}</p>
                    </div>
                ) : null}

                {shouldShowAccountDetails ? <ShellMenuSeparator /> : null}

                {backItem ? (
                    <ShellMenuItem onClick={backItem.onSelect}>
                        <span>{backItem.label}</span>
                    </ShellMenuItem>
                ) : null}

                {switchItems.map((item) => (
                    <ShellMenuSwitchItem
                        key={item.label}
                        checked={item.checked}
                        onCheckedChange={(checked) => item.onCheckedChange(checked === true)}
                    >
                        {item.label}
                    </ShellMenuSwitchItem>
                ))}

                <ShellMenuSwitchItem
                    checked={isDarkMode}
                    onCheckedChange={(checked) => updateTheme(checked === true)}
                >
                    Dark mode
                </ShellMenuSwitchItem>

                {showSignOut ? (
                    <ShellMenuItem
                        variant="destructive"
                        onClick={signOut}
                    >
                        <span>Sign out</span>
                    </ShellMenuItem>
                ) : null}
            </ShellMenuContent>
        </ShellMenu>
    );
}
