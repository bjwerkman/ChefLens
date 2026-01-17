import { useState } from 'react';
import { supabase } from '../../utils/supabase';
import { Loader2, Mail, Lock, AlertCircle } from 'lucide-react';

export function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSignUp, setIsSignUp] = useState(false);

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (error) throw error;
                // For sign up, we might need to check if email confirmation is enabled, 
                // but for now let's assume auto-confirm or just tell them to check email.
                alert('Sign up successful! Please check your email for confirmation code if required, or sign in.');
                setIsSignUp(false);
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSocialLogin = async (provider: 'google' | 'apple') => {
        try {
            setLoading(true);
            const { error } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: `${window.location.origin}/`,
                },
            });
            if (error) throw error;
        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 flex items-center justify-center p-4">
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl w-full max-w-md p-8 border border-white/50">
                <div className="text-center mb-8">
                    <div className="bg-white p-3 rounded-2xl shadow-sm inline-block mb-4">
                        <img src="/logo.png" alt="ChefLens" className="h-12 w-auto" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to ChefLens</h1>
                    <p className="text-gray-500 text-sm">
                        {isSignUp ? 'Create an account to get started' : 'Sign in to access your recipes'}
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-6 flex items-start gap-2 animate-in fade-in slide-in-from-top-2">
                        <AlertCircle size={16} className="mt-0.5 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <div className="space-y-4">
                    {/* Social Login Buttons */}
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => handleSocialLogin('google')}
                            disabled={loading}
                            className="flex items-center justify-center px-4 py-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 text-gray-700 font-medium text-sm gap-2"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    fill="#4285F4"
                                />
                                <path
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    fill="#34A853"
                                />
                                <path
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    fill="#FBBC05"
                                />
                                <path
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    fill="#EA4335"
                                />
                            </svg>
                            Google
                        </button>
                        <button
                            onClick={() => handleSocialLogin('apple')}
                            disabled={loading}
                            className="flex items-center justify-center px-4 py-2.5 bg-black text-white rounded-xl hover:bg-gray-800 transition-all duration-200 font-medium text-sm gap-2"
                        >
                            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.35-1.09-.56-2.09-.48-3.08.02-.99.51-1.74.52-2.31-.23-.23-.3-.48-.73-.67-1.3C5.55 12.98 9.5 11.23 9.87 7.7c.05-.44.2-.87.42-1.27C11.53 4.29 13.9 4.23 13.9 4.23c.31 1.25 1.37 2.21 2.89 2.13.06-1.07-.33-2.22-1-3.05-.91-1.12-2.35-1.34-2.45-1.31-.02.01-.02.01.07.01-1.89.15-3.69 1.12-4.66 2.85-2.04 3.59-.51 8.91 1.48 11.83.99 1.45 2.08 2.86 3.53 2.91.73.02 1.56-.3 2.51-.73.91-.4 1.77-.52 2.51-.25.46.17.9.52 1.34.98.02.02.05.02.07 0 .28-.27.56-.55.84-.81.25-.24.52-.45.76-.68l.01-.01c-2.3-1.12-3.8-3.56-3.75-6.19.01-.59.08-1.17.2-1.73 1.63-.69 2.97-1.85 3.96-3.32-.01 0-2.47 14.15-2.47 14.15zM12.03 7.25c-.15 0-.29.06-.39.17-.1.11-.15.26-.14.41.02.32.19.61.45.8.27.18.6.22.9.1l.05-.02c.03-.01.06-.02.1-.02.15 0 .29-.06.39-.16.1-.11.16-.25.15-.4 0-.32-.17-.62-.44-.81-.27-.19-.6-.23-.91-.12l-.06.01c-.04.02-.07.03-.1.03z" />
                                <path d="M13.03 2.54c-.75.76-1.12 1.96-1.05 3.12 1.11.08 2.37-.58 3.06-1.42.66-.82 1.05-2.04.85-3.04-1.05-.08-2.12.58-2.86 1.34z" />
                            </svg>
                            Apple
                        </button>
                    </div>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white/80 px-2 text-gray-400 backdrop-blur-xl">Or continue with email</span>
                        </div>
                    </div>

                    <form onSubmit={handleEmailAuth} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-700 ml-1">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-sm"
                                    placeholder="your@email.com"
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-700 ml-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-sm"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-200"
                        >
                            {loading && <Loader2 className="animate-spin" size={18} />}
                            {isSignUp ? 'Create Account' : 'Sign In'}
                        </button>
                    </form>

                    <div className="text-center mt-6">
                        <button
                            onClick={() => setIsSignUp(!isSignUp)}
                            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium hover:underline"
                        >
                            {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
