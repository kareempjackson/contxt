'use client';

import { useState } from 'react';
import Link from 'next/link';

type Step = 'name' | 'plan';

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Get started with the basics',
    features: [
      'Up to 3 projects',
      '1,000 memory entries',
      'Cloud sync',
      'CLI + MCP access',
    ],
    cta: 'Start for free',
    highlighted: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$29',
    period: '/month',
    description: 'For developers who ship with AI daily',
    features: [
      'Unlimited projects',
      '50,000 memory entries',
      'Semantic search',
      'Smart context suggestions',
      'Branching & time travel',
      'Priority support',
    ],
    cta: 'Start Pro',
    highlighted: true,
  },
];

export default function OnboardingPage() {
  const [step, setStep] = useState<Step>('name');
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleNameSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setNameError('Please enter your name');
      return;
    }
    setStep('plan');
  }

  async function handlePlanSelect(planId: string) {
    setLoading(true);

    // Save name + mark as onboarded
    await fetch('/api/onboarding/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim() }),
    });

    if (planId === 'free') {
      window.location.href = '/dashboard';
      return;
    }

    // Kick off Stripe Checkout for pro
    const res = await fetch('/api/billing/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planId: 'pro', billingPeriod: 'monthly' }),
    });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      // Fallback to dashboard if checkout fails
      window.location.href = '/dashboard';
    }
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-4 py-16">
      {/* Logo */}
      <Link href="/" className="font-bold text-[17px] tracking-tight text-text-0 mb-12">
        contxt
      </Link>

      {step === 'name' && (
        <div className="w-full max-w-[420px]">
          <div className="mb-8 text-center">
            <h1 className="font-serif text-[38px] font-normal leading-[1.1] tracking-tight mb-3">
              Welcome aboard.
            </h1>
            <p className="text-[15px] text-text-2">
              What should we call you?
            </p>
          </div>

          <form onSubmit={handleNameSubmit} className="space-y-4">
            <input
              type="text"
              autoFocus
              value={name}
              onChange={(e) => { setName(e.target.value); setNameError(''); }}
              placeholder="Your name"
              className="w-full h-12 px-4 rounded-[10px] border border-border bg-white text-text-0 text-[15px] placeholder:text-text-3 focus:outline-none focus:ring-2 focus:ring-violet/20 focus:border-violet transition-all"
            />
            {nameError && <p className="text-[13px] text-red-500">{nameError}</p>}
            <button
              type="submit"
              className="w-full h-12 rounded-[10px] bg-bg-dark text-white font-semibold text-[15px] hover:bg-[#333] transition-colors"
            >
              Continue
            </button>
          </form>
        </div>
      )}

      {step === 'plan' && (
        <div className="w-full max-w-[720px]">
          <div className="mb-10 text-center">
            <h1 className="font-serif text-[38px] font-normal leading-[1.1] tracking-tight mb-3">
              Choose your plan
            </h1>
            <p className="text-[15px] text-text-2">
              You can upgrade or downgrade anytime.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`relative rounded-[16px] p-6 flex flex-col ${
                  plan.highlighted
                    ? 'bg-bg-dark text-white ring-2 ring-bg-dark'
                    : 'bg-white border border-border'
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="font-mono text-[10px] font-semibold uppercase tracking-wide px-3 py-1 rounded-full bg-violet text-white">
                      Most popular
                    </span>
                  </div>
                )}

                <div className="mb-5">
                  <div className={`text-[13px] font-semibold mb-1 ${plan.highlighted ? 'text-white/60' : 'text-text-2'}`}>
                    {plan.name}
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-[36px] font-bold tracking-tight">{plan.price}</span>
                    <span className={`text-[14px] ${plan.highlighted ? 'text-white/50' : 'text-text-3'}`}>{plan.period}</span>
                  </div>
                  <p className={`text-[13px] mt-1 ${plan.highlighted ? 'text-white/60' : 'text-text-2'}`}>
                    {plan.description}
                  </p>
                </div>

                <ul className="space-y-2 mb-6 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-[13.5px]">
                      <svg
                        className={`w-4 h-4 flex-shrink-0 ${plan.highlighted ? 'text-green' : 'text-green'}`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className={plan.highlighted ? 'text-white/80' : 'text-text-1'}>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handlePlanSelect(plan.id)}
                  disabled={loading}
                  className={`w-full h-11 rounded-[10px] font-semibold text-[14px] transition-all disabled:opacity-50 ${
                    plan.highlighted
                      ? 'bg-white text-bg-dark hover:bg-white/90'
                      : 'bg-bg-dark text-white hover:bg-[#333]'
                  }`}
                >
                  {loading ? '...' : plan.cta}
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={() => setStep('name')}
            className="mt-6 mx-auto block text-[13px] text-text-3 hover:text-text-2 transition-colors"
          >
            ← Back
          </button>
        </div>
      )}
    </div>
  );
}
