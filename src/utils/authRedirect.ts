import { supabase } from '@/lib/supabase';

export async function startGoogleSignInRedirect(redirectTo: string) {
    const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            queryParams: {
                access_type: 'offline',
                prompt: 'consent',
            },
            redirectTo,
        },
    });

    if (error) {
        throw error;
    }
}
