import { supabase } from '@/lib/supabase';

export async function startGoogleSignInRedirect(redirectTo: string) {
    const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo,
        },
    });

    if (error) {
        throw error;
    }
}
