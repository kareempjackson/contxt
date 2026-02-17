'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FadeUp } from '../components/FadeUp';
import Link from 'next/link';
import { createClient } from '../../lib/supabase/client';

export default function AuthPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleGitHubLogin() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    const supabase = createClient();

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        setError(error.message);
      } else {
        setSuccessMsg('Check your email to confirm your account.');
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    }

    setLoading(false);
  }

  return (
    <div className="h-screen flex bg-bg overflow-hidden">
      <div className="w-full grid grid-cols-1 lg:grid-cols-[40%_60%] gap-0 h-full">
        {/* Left Side - Auth Form */}
        <div className="bg-white p-8 lg:p-12 flex flex-col justify-center">
          <FadeUp>
            <div className="mb-6">
              <Link href="/" className="font-bold text-[17px] tracking-tight text-text-0 inline-block mb-6">
                contxt
              </Link>
              <h1 className="font-serif text-[clamp(36px,5vw,48px)] font-normal leading-[1.1] tracking-tight mb-3">
                {isSignUp ? 'Create your account' : 'Welcome back'}
              </h1>
              <p className="text-[15px] text-text-2">
                {isSignUp
                  ? 'Start giving your AI agents persistent memory'
                  : 'Sign in to access your project contexts'}
              </p>
            </div>
          </FadeUp>

          <FadeUp delay={0.1}>
            <form className="space-y-4 mb-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-text-1 mb-2">
                  Email address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full h-12 px-4 rounded-lg border border-border bg-bg text-text-0 text-[15px] placeholder:text-text-3 focus:outline-none focus:ring-2 focus:ring-violet/20 focus:border-violet transition-all"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-text-1 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full h-12 px-4 rounded-lg border border-border bg-bg text-text-0 text-[15px] placeholder:text-text-3 focus:outline-none focus:ring-2 focus:ring-violet/20 focus:border-violet transition-all"
                  placeholder="••••••••"
                />
              </div>

              {error && <p className="text-[13px] text-red-500">{error}</p>}
              {successMsg && <p className="text-[13px] text-green-600">{successMsg}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-lg bg-bg-dark text-white font-semibold text-[15px] hover:bg-[#333] transition-colors disabled:opacity-50"
              >
                {loading ? '...' : isSignUp ? 'Create account' : 'Sign in'}
              </button>
            </form>
          </FadeUp>

          <FadeUp delay={0.2}>
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-text-3">Or continue with</span>
              </div>
            </div>

            <button
              onClick={handleGitHubLogin}
              className="w-full h-11 px-4 rounded-lg border border-border bg-white text-text-1 font-medium text-[14px] hover:bg-bg transition-colors flex items-center justify-center gap-2 mb-6"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              GitHub
            </button>

            <p className="text-center text-sm text-text-2">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                onClick={() => { setIsSignUp(!isSignUp); setError(''); setSuccessMsg(''); }}
                className="text-violet hover:text-violet-dark font-semibold transition-colors"
              >
                {isSignUp ? 'Sign in' : 'Sign up'}
              </button>
            </p>
          </FadeUp>
        </div>

        {/* Right Side - Editorial */}
        <div className="p-8 lg:p-12 flex flex-col justify-center relative bg-cover bg-center bg-no-repeat" style={{ backgroundImage: 'url(/pawel-czerwinski-prMn9KINLtI-unsplash.jpg)' }}>
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60"></div>

          <FadeUp delay={0.3}>
            <div className="relative z-10">
              <div className="mb-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm font-medium mb-5">
                  <span className="w-2 h-2 rounded-full bg-green"></span>
                  Works with all AI coding tools
                </div>
              </div>

              <h2 className="font-serif text-[clamp(32px,4vw,42px)] font-normal leading-[1.2] mb-4 text-white tracking-tight">
                Your AI remembers.<br />
                <em className="italic">Finally.</em>
              </h2>

              <p className="text-[17px] text-white/80 leading-[1.7] mb-6 max-w-[440px]">
                Stop repeating your architecture decisions every session. Contxt gives Claude Code, Cursor, and other AI agents persistent memory of your project.
              </p>

              <div className="space-y-3">
                {[
                  { title: 'Push context once', desc: 'Every AI tool you use can pull from it' },
                  { title: 'Smart context loading', desc: 'Only surfaces what\'s relevant to your task' },
                  { title: 'Git-like branching', desc: 'Experiment safely, merge when ready' },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-white font-semibold text-[15px] mb-1">{item.title}</div>
                      <div className="text-white/70 text-[14px]">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </FadeUp>
        </div>
      </div>
    </div>
  );
}
