import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import VcaLogo from '@/components/VcaLogo';
import { supabase } from '@/lib/supabase';
import { Loader2, ArrowRight } from 'lucide-react';

export const LoginView = () => {
    const { signIn } = useAuth();
    const [isEmailLoading, setIsEmailLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    // Check for error messages in the URL (from OAuth redirects)
    useEffect(() => {
        const hash = window.location.hash;
        if (hash && hash.includes('error_description')) {
            const params = new URLSearchParams(hash.substring(1)); // remove #
            const errorDescription = params.get('error_description');
            if (errorDescription) {
                setMessage(decodeURIComponent(errorDescription.replace(/\+/g, ' ')));
            }
        }
    }, []);

    const handleMagicLink = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsEmailLoading(true);
        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: window.location.origin,
            },
        });
        if (error) {
            setMessage('Error sending magic link: ' + error.message);
        } else {
            setMessage('Magic link sent to your email.');
        }
        setIsEmailLoading(false);
    };

    const handleGoogleLogin = async () => {
        try {
            const result = await signIn();
            if (result && result.error) {
                setMessage('Error: ' + result.error.message);
            }
        } catch (error) {
            console.error('Unexpected error:', error);
            setMessage('An unexpected error occurred.');
        }
    };

    return (
        <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#0A0A0A] text-white selection:bg-blue-500/30">
            {/* Background Effects */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-20%] left-[-10%] h-[150%] w-[150%] animate-spin-slow opacity-20 mix-blend-screen filter blur-[120px]">
                    <div className="absolute top-1/2 left-1/2 h-[40%] w-[40%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#1c1c1c]" />
                    <div className="absolute top-1/2 left-1/2 h-[30%] w-[30%] translate-x-[20%] translate-y-[-20%] rounded-full bg-blue-900/30" />
                </div>
                {/* Subtle Grid */}
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
                        backgroundSize: '40px 40px'
                    }}
                />
            </div>

            {/* Glass Monolith Card */}
            <div className="relative z-10 w-full max-w-[340px] animate-in fade-in zoom-in-95 duration-500">
                {/* Logo Section */}
                <div className="mb-8 flex flex-col items-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10 backdrop-blur-md shadow-2xl">
                        <VcaLogo className="h-6 w-auto opacity-90 invert brightness-0" />
                    </div>
                </div>

                {/* Main Card */}
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/40 backdrop-blur-xl shadow-2xl ring-1 ring-black/5">
                    <div className="p-6 pt-8">
                        <div className="mb-6 text-center">
                            <h1 className="text-xl font-medium tracking-tight text-white">Log in to VCA Sandbox</h1>
                        </div>

                        <div className="space-y-4">
                            <Button
                                onClick={handleGoogleLogin}
                                className="relative flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 text-xs font-medium text-white hover:bg-white/10 focus:ring-2 focus:ring-white/20 transition-all"
                            >
                                <img src="https://www.google.com/favicon.ico" alt="Google" className="h-3.5 w-3.5" />
                                <span>Continue with Google</span>
                            </Button>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-white/5" />
                                </div>
                                <div className="relative flex justify-center text-[10px] uppercase tracking-wider">
                                    <span className="bg-[#121214] px-2 text-zinc-600">Or using email</span>
                                </div>
                            </div>

                            <form onSubmit={handleMagicLink} className="space-y-3">
                                <div>
                                    <input
                                        type="email"
                                        placeholder="name@company.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-white/20 focus:bg-white/10 focus:outline-none transition-all"
                                        required
                                    />
                                </div>
                                <Button
                                    disabled={isEmailLoading}
                                    type="submit"
                                    className="flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-white/10 text-xs font-medium text-white hover:bg-white/15 focus:ring-2 focus:ring-white/20 transition-all border border-white/5"
                                >
                                    {isEmailLoading ? (
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                        <>
                                            Send link to email <ArrowRight className="h-3.5 w-3.5 opacity-50" />
                                        </>
                                    )}
                                </Button>
                            </form>
                        </div>
                    </div>

                    {/* Footer / Message Area */}
                    {message && (
                        <div className={`border-t px-6 py-3 text-center text-xs font-medium transition-colors ${message.toLowerCase().includes('error')
                            ? 'bg-red-500/10 border-red-500/20 text-red-400'
                            : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                            }`}>
                            {message}
                        </div>
                    )}
                </div>

                {/* LinkedIn Logo */}
                <div className="mt-8 flex justify-center opacity-40">
                    <img
                        src="/linkedin_logo_white.svg"
                        alt="LinkedIn"
                        className="h-5 w-auto"
                    />
                </div>

            </div>
        </div>
    );
};
