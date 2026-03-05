import type { User } from '@supabase/supabase-js';

export const getInitialsFromName = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return 'U';

    const parts = trimmed.split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

export const getUserDisplayName = (user: User | null): string => {
    if (!user) return '';

    const metadata = user.user_metadata || {};
    const fullName =
        typeof metadata.full_name === 'string' ? metadata.full_name.trim() : '';
    const shortName =
        typeof metadata.name === 'string' ? metadata.name.trim() : '';
    const emailPrefix = user.email ? user.email.split('@')[0].trim() : '';

    return fullName || shortName || emailPrefix || 'Signed-in user';
};

export const getUserAvatarUrl = (user: User | null): string | null => {
    if (!user) return null;

    const metadata = user.user_metadata || {};
    const avatarUrl = metadata.avatar_url || metadata.picture;

    if (typeof avatarUrl !== 'string') return null;
    const trimmed = avatarUrl.trim();
    return trimmed || null;
};

export const getUserInitials = (user: User | null) => {
    const displayName = getUserDisplayName(user);
    if (displayName) return getInitialsFromName(displayName);

    if (user?.email) return getInitialsFromName(user.email);
    return 'U';
};
