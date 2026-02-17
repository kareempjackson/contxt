'use client';

import { createClient } from '../../lib/supabase/client';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useState } from 'react';

function LoginForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const redirectTo = searchParams.get('redirectTo') || '/dashboard';

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  async function handleGitHubLogin() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
      },
    });
  }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    const supabase = createClient();

    if (mode === 'signin') {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
      } else {
        router.push(redirectTo);
        router.refresh();
      }
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
        },
      });
      if (error) {
        setError(error.message);
      } else {
        setSuccessMsg('Check your email to confirm your account.');
      }
    }

    setLoading(false);
  }

  return (
    <div className="h-screen flex bg-[#F6F6F6] items-center justify-center">
      <div className="w-full max-w-[400px] bg-white rounded-[18px] p-10 shadow-[0_2px_24px_rgba(0,0,0,0.07)]">
        <div className="mb-8">
          <a href="/" className="font-bold text-[17px] tracking-tight text-text-0 inline-block mb-6">
            contxt
          </a>
          <h1 className="text-[28px] font-bold tracking-tight text-text-0 mb-2">
            {mode === 'signin' ? 'Sign in' : 'Create account'}
          </h1>
          <p className="text-[14px] text-text-2">
            Access your project contexts and memory entries.
          </p>
        </div>

        {/* GitHub */}
        <button
          onClick={handleGitHubLogin}
          className="w-full h-11 rounded-[10px] bg-bg-dark text-white font-semibold text-[14px] hover:bg-[#333] transition-colors flex items-center justify-center gap-2.5 mb-4"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
          Continue with GitHub
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-[#E8E8E8]" />
          <span className="text-[12px] text-text-3">or</span>
          <div className="flex-1 h-px bg-[#E8E8E8]" />
        </div>

        {/* Email / Password */}
        <form onSubmit={handleEmailSubmit} className="space-y-3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full h-10 rounded-lg border border-[#E8E8E8] px-3 text-[13.5px] text-text-0 outline-none focus:border-text-2 transition-colors"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full h-10 rounded-lg border border-[#E8E8E8] px-3 text-[13.5px] text-text-0 outline-none focus:border-text-2 transition-colors"
          />

          {error && (
            <p className="text-[12.5px] text-red-500">{error}</p>
          )}

          {successMsg && (
            <p className="text-[12.5px] text-green-600">{successMsg}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-10 rounded-lg bg-violet-600 text-white font-semibold text-[13.5px] hover:bg-violet-700 transition-colors disabled:opacity-50"
          >
            {loading ? '...' : mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        {/* Toggle mode */}
        <p className="text-center text-[12.5px] text-text-3 mt-4">
          {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); setSuccessMsg(''); }}
            className="text-text-1 underline hover:text-text-0 transition-colors"
          >
            {mode === 'signin' ? 'Sign up' : 'Sign in'}
          </button>
        </p>

        <p className="text-center text-[12px] text-text-3 mt-4">
          By signing in, you agree to our{' '}
          <a href="/terms" className="text-text-2 underline hover:text-text-0 transition-colors">Terms</a>{' '}
          and{' '}
          <a href="/privacy" className="text-text-2 underline hover:text-text-0 transition-colors">Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
