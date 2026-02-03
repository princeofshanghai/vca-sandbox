import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as Tooltip from '@radix-ui/react-tooltip';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export function UserMenu() {
    const { user, signOut } = useAuth();

    if (!user?.email) return null;

    const initial = user.email.charAt(0).toUpperCase();

    return (
        <DropdownMenu.Root>
            <Tooltip.Provider delayDuration={300}>
                <Tooltip.Root>
                    <Tooltip.Trigger asChild>
                        <DropdownMenu.Trigger asChild>
                            <button className="h-9 w-9 rounded-md hover:bg-gray-100 flex items-center justify-center transition-colors outline-none cursor-pointer">
                                <div className="h-7 w-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-medium text-xs">
                                    {initial}
                                </div>
                            </button>
                        </DropdownMenu.Trigger>
                    </Tooltip.Trigger>
                    <Tooltip.Portal>
                        <Tooltip.Content
                            side="bottom"
                            align="end"
                            sideOffset={5}
                            className="z-50 px-2 py-1 text-xs text-white bg-gray-900 rounded shadow-sm animate-in fade-in zoom-in-95 duration-200"
                        >
                            {user.email}
                            <Tooltip.Arrow className="fill-gray-900" />
                        </Tooltip.Content>
                    </Tooltip.Portal>
                </Tooltip.Root>
            </Tooltip.Provider>

            <DropdownMenu.Portal>
                <DropdownMenu.Content
                    align="end"
                    sideOffset={8}
                    className="z-50 min-w-[160px] bg-white rounded-lg shadow-lg border border-gray-100 p-1 animate-in fade-in zoom-in-95 duration-200"
                >
                    <div className="px-2 py-1.5 border-b border-gray-50 mb-1">
                        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Signed in as</p>
                        <p className="text-xs font-medium text-gray-900 truncate max-w-[140px]">{user.email}</p>
                    </div>

                    <DropdownMenu.Item
                        className="flex items-center gap-2 px-2 py-1.5 text-xs text-red-600 rounded hover:bg-red-50 cursor-pointer outline-none transition-colors"
                        onClick={signOut}
                    >
                        <LogOut size={12} />
                        Sign out
                    </DropdownMenu.Item>
                </DropdownMenu.Content>
            </DropdownMenu.Portal>
        </DropdownMenu.Root>
    );
}
