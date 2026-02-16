import { useAuth } from '@/hooks/useAuth';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ActionTooltip } from '@/views/studio-canvas/components/ActionTooltip';

export function UserMenu() {
    const { user, signOut } = useAuth();

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

    return (
        <DropdownMenu>
            <ActionTooltip content={user.email} side="bottom">
                <DropdownMenuTrigger asChild>
                    <button className="h-8 w-8 rounded-md hover:bg-gray-100 flex items-center justify-center transition-colors outline-none cursor-pointer">
                        <div className="h-6 w-6 rounded-full bg-gradient-to-br from-blue-200 via-indigo-100 to-purple-200 flex items-center justify-center text-gray-900 font-bold text-[9px] tracking-wide shadow-sm">
                            {initials}
                        </div>
                    </button>
                </DropdownMenuTrigger>
            </ActionTooltip>

            <DropdownMenuContent align="end" className="w-[200px]">
                <div className="px-2 py-1.5 pb-0">
                    <p className="text-xs font-medium text-gray-500">Signed in as</p>
                    <p className="text-[13px] font-medium text-gray-900 truncate mt-0.5">{user.email}</p>
                </div>

                <DropdownMenuSeparator />

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
