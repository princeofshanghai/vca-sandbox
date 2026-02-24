import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { ShellInput } from '@/components/shell';
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
        <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-shell-dark-bg text-shell-dark-text selection:bg-shell-dark-accent-soft">
            {/* Background Effects */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-20%] left-[-10%] h-[150%] w-[150%] animate-spin-slow opacity-20 mix-blend-screen filter blur-[120px]">
                    <div className="absolute top-1/2 left-1/2 h-[40%] w-[40%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-shell-dark-orb" />
                    <div className="absolute top-1/2 left-1/2 h-[30%] w-[30%] translate-x-[20%] translate-y-[-20%] rounded-full bg-shell-dark-accent-soft" />
                </div>
                {/* Subtle Grid */}
                <div
                    className="absolute inset-0 opacity-[0.03] text-shell-dark-text"
                    style={{
                        backgroundImage: 'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)',
                        backgroundSize: '40px 40px'
                    }}
                />
            </div>

            {/* Glass Monolith Card */}
            <div className="relative z-10 w-full max-w-[340px] animate-in fade-in zoom-in-95 duration-500">
                {/* Logo Section */}
                <div className="mb-8 flex flex-col items-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-shell-dark-panel ring-1 ring-shell-dark-border backdrop-blur-md shadow-shell-lg">
                        <VcaLogo className="h-6 w-auto opacity-90 invert brightness-0" />
                    </div>
                </div>

                {/* Main Card */}
                <div className="overflow-hidden rounded-2xl border border-shell-dark-border bg-shell-dark-card backdrop-blur-xl shadow-shell-lg ring-1 ring-shell-dark-border">
                    <div className="p-6 pt-8">
                        <div className="mb-6 text-center">
                            <h1 className="text-xl font-medium tracking-tight text-shell-dark-text">Log in to VCA Sandbox</h1>
                        </div>

                        <div className="space-y-4">
                            <Button
                                onClick={handleGoogleLogin}
                                className="relative flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-shell-dark-border bg-shell-dark-panel text-xs font-medium text-shell-dark-text hover:bg-shell-dark-surface focus:ring-2 focus:ring-shell-dark-border-strong transition-all"
                            >
                                <img src="https://www.google.com/favicon.ico" alt="Google" className="h-3.5 w-3.5" />
                                <span>Continue with Google</span>
                            </Button>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-shell-dark-border" />
                                </div>
                                <div className="relative flex justify-center text-[10px] uppercase tracking-wider">
                                    <span className="bg-shell-dark-panel-alt px-2 text-shell-dark-muted">Or using email</span>
                                </div>
                            </div>

                            <form onSubmit={handleMagicLink} className="space-y-3">
                                <div>
                                    <ShellInput
                                        type="email"
                                        placeholder="name@company.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="h-9 w-full rounded-lg border-shell-dark-border bg-shell-dark-panel px-3 py-2 text-sm text-shell-dark-text placeholder:text-shell-dark-muted transition-all focus-visible:border-shell-dark-border-strong focus-visible:bg-shell-dark-surface focus-visible:ring-shell-dark-border-strong"
                                        required
                                    />
                                </div>
                                <Button
                                    disabled={isEmailLoading}
                                    type="submit"
                                    className="flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-shell-dark-surface text-xs font-medium text-shell-dark-text hover:bg-shell-dark-panel focus:ring-2 focus:ring-shell-dark-border-strong transition-all border border-shell-dark-border"
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
                            ? 'bg-shell-dark-danger-soft border-shell-dark-danger text-shell-dark-danger'
                            : 'bg-shell-dark-success-soft border-shell-dark-success text-shell-dark-success'
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
