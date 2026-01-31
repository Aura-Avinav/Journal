import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Loader2 } from 'lucide-react';

export function AuthPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [isSent, setIsSent] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: {
                    emailRedirectTo: window.location.origin,
                },
            });
            if (error) throw error;
            setIsSent(true);
        } catch (error) {
            alert(error instanceof Error ? error.message : 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in duration-500">
                <div className="text-center space-y-2">
                    <div className="flex justify-center mb-6">
                        <img src="/ituts-logo.png" alt="Logo" className="h-16 w-auto" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-primary">
                        Welcome Back
                    </h1>
                    <p className="text-secondary">
                        Sign in to your high-performance journal
                    </p>
                </div>

                <div className="bg-surface/30 border border-surfaceHighlight rounded-2xl p-8 backdrop-blur-md shadow-xl">
                    {isSent ? (
                        <div className="text-center space-y-4">
                            <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto text-3xl">
                                📬
                            </div>
                            <h3 className="text-xl font-medium text-foreground">Check your email</h3>
                            <p className="text-secondary">
                                We sent a magic link to <span className="text-white font-medium">{email}</span>.
                                <br />Click it to sign in instantly.
                            </p>
                            <button
                                onClick={() => setIsSent(false)}
                                className="text-sm text-accent hover:underline mt-4"
                            >
                                Use a different email
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleLogin} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-secondary" htmlFor="email">
                                    Email Address
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-3 bg-surfaceHighlight/30 border border-surfaceHighlight rounded-xl text-foreground placeholder:text-secondary/50 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-3 px-4 bg-primary text-background font-bold rounded-xl hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95 flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Sending Link...
                                    </>
                                ) : (
                                    'Send Magic Link'
                                )}
                            </button>
                        </form>
                    )}
                </div>

                <p className="text-center text-xs text-secondary/50">
                    By signing in, you agree to our Terms of Service and Privacy Policy.
                </p>
            </div>
        </div>
    );
}
