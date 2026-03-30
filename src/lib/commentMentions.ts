import { supabase } from '@/lib/supabase';

export interface MentionCandidate {
    userId: string;
    displayName: string;
    email: string | null;
    avatarUrl: string | null;
}

export interface CommentDraftMention extends MentionCandidate {
    token: string;
}

const DEFAULT_MENTION_LIMIT = 8;

const sanitizeMentionQuery = (query: string) => query.trim().replace(/[%_]/g, '');

const normalizeMentionCandidate = (profile: Record<string, unknown>): MentionCandidate | null => {
    const userId = typeof profile.user_id === 'string' ? profile.user_id : '';
    const displayName = typeof profile.display_name === 'string' ? profile.display_name.trim() : '';
    const email = typeof profile.email === 'string' ? profile.email.trim() : '';
    const avatarUrl = typeof profile.avatar_url === 'string' ? profile.avatar_url.trim() : '';

    if (!userId) return null;

    return {
        userId,
        displayName: displayName || email || 'Signed-in user',
        email: email || null,
        avatarUrl: avatarUrl || null,
    };
};

export const createMentionToken = (
    candidate: Pick<MentionCandidate, 'displayName' | 'email' | 'userId'>,
    existingMentions: CommentDraftMention[] = []
) => {
    const baseToken = `@${candidate.displayName}`;
    const hasConflict = existingMentions.some(
        (mention) => mention.userId !== candidate.userId && mention.token === baseToken
    );

    if (hasConflict && candidate.email) {
        return `@${candidate.displayName} (${candidate.email})`;
    }

    return baseToken;
};

export const pruneCommentDraftMentions = (
    value: string,
    mentions: CommentDraftMention[]
): CommentDraftMention[] => {
    const seen = new Set<string>();

    return mentions.filter((mention) => {
        if (!value.includes(mention.token)) return false;
        if (seen.has(mention.userId)) return false;

        seen.add(mention.userId);
        return true;
    });
};

export const searchMentionCandidates = async ({
    query,
    currentUserId,
    limit = DEFAULT_MENTION_LIMIT,
}: {
    query: string;
    currentUserId: string;
    limit?: number;
}): Promise<MentionCandidate[]> => {
    const sanitizedQuery = sanitizeMentionQuery(query);

    let request = supabase
        .from('profiles')
        .select('user_id, display_name, email, avatar_url, last_sign_in_at')
        .not('last_sign_in_at', 'is', null)
        .neq('user_id', currentUserId)
        .order('last_sign_in_at', { ascending: false, nullsFirst: false })
        .limit(limit);

    if (sanitizedQuery) {
        request = request.or(
            `display_name.ilike.%${sanitizedQuery}%,email.ilike.%${sanitizedQuery}%`
        );
    }

    const { data, error } = await request;
    if (error) throw error;

    return (data || [])
        .map((profile) => normalizeMentionCandidate(profile as Record<string, unknown>))
        .filter((candidate): candidate is MentionCandidate => !!candidate);
};
