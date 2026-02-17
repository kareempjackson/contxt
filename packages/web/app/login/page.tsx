'use client';

import { createClient } from '../../lib/supabase/client';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function LoginForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/dashboard';

  async function handleGitHubLogin() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
      },
    });
  }

  return (
    <div className="h-screen flex bg-[#F6F6F6] items-center justify-center">
      <div className="w-full max-w-[400px] bg-white rounded-[18px] p-10 shadow-[0_2px_24px_rgba(0,0,0,0.07)]">
        <div className="mb-8">
          <a href="/" className="font-bold text-[17px] tracking-tight text-text-0 inline-block mb-6">
            contxt
          </a>
          <h1 className="text-[28px] font-bold tracking-tight text-text-0 mb-2">
            Sign in
          </h1>
          <p className="text-[14px] text-text-2">
            Access your project contexts and memory entries.
          </p>
        </div>

        <button
          onClick={handleGitHubLogin}
          className="w-full h-11 rounded-[10px] bg-bg-dark text-white font-semibold text-[14px] hover:bg-[#333] transition-colors flex items-center justify-center gap-2.5 mb-6"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
          Continue with GitHub
        </button>

        <p className="text-center text-[12.5px] text-text-3">
          By signing in, you agree to our{' '}
          <a href="/terms" className="text-text-2 underline hover:text-text-0 transition-colors">
            Terms
          </a>{' '}
          and{' '}
          <a href="/privacy" className="text-text-2 underline hover:text-text-0 transition-colors">
            Privacy Policy
          </a>
          .
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
