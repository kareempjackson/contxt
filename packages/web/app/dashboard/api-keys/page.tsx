'use client';

import { useState } from 'react';

export default function DashboardAPIKeys() {
  const [showKey1, setShowKey1] = useState(false);
  const [showKey2, setShowKey2] = useState(false);
  const [copiedKey, setCopiedKey] = useState<number | null>(null);

  const apiKeys = [
    {
      id: 1,
      name: 'Production API',
      key: 'ctx_live_8d7f9a2b4c6e1f3a5b9c0d2e4f6a8b1c',
      maskedKey: 'ctx_live_••••••••••••••••••••••••8b1c',
      createdAt: 'Created 2 weeks ago',
      lastUsed: 'Last used 2 hours ago',
    },
    {
      id: 2,
      name: 'Development',
      key: 'ctx_test_3a1b5c7d9e2f4a6b8c0d1e3f5a7b9c1d',
      maskedKey: 'ctx_test_••••••••••••••••••••••••9c1d',
      createdAt: 'Created 1 month ago',
      lastUsed: 'Last used 3 days ago',
    },
  ];

  const copyToClipboard = (key: string, id: number) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <>
      {/* Page Top */}
      <div className="flex items-center justify-between mb-8 mt-1">
        <h1 className="text-[20px] font-bold tracking-[-0.5px]">API Keys</h1>
        <button className="h-9 px-4 flex items-center justify-center gap-2 rounded-[9px] bg-blue text-white font-semibold text-[13px] hover:bg-[#0070E0] transition-all shadow-[0_1px_3px_rgba(10,132,255,0.2)] hover:shadow-[0_3px_12px_rgba(10,132,255,0.25)]">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Create key
        </button>
      </div>

      <div className="max-w-[800px] space-y-6">
        {/* Info Card */}
        <div className="p-4 bg-blue-bg border border-blue/20 rounded-[12px]">
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <div className="text-[13.5px] font-semibold text-text-0 mb-1">Keep your API keys secure</div>
              <div className="text-[12.5px] text-text-2 leading-relaxed">
                Your API keys carry all permissions, so keep them secure. Don&apos;t share them in public repositories or
                client-side code.
              </div>
            </div>
          </div>
        </div>

        {/* API Keys List */}
        <div className="space-y-3">
          {apiKeys.map((apiKey) => (
            <div key={apiKey.id} className="bg-white rounded-[14px] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="text-[15px] font-bold text-text-0 mb-1">{apiKey.name}</div>
                  <div className="flex items-center gap-3 text-[12px] text-text-3">
                    <span>{apiKey.createdAt}</span>
                    <span>·</span>
                    <span>{apiKey.lastUsed}</span>
                  </div>
                </div>
                <button className="h-8 px-3 text-[12.5px] font-semibold text-rose bg-rose-soft rounded-[9px] hover:bg-rose/10 transition-all">
                  Revoke
                </button>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    readOnly
                    value={apiKey.id === 1 && showKey1 ? apiKey.key : apiKey.id === 2 && showKey2 ? apiKey.key : apiKey.maskedKey}
                    className="w-full h-10 px-3.5 pr-20 font-mono text-[12px] text-text-0 bg-bg border border-border rounded-[9px] outline-none"
                  />
                  <button
                    onClick={() => {
                      if (apiKey.id === 1) setShowKey1(!showKey1);
                      if (apiKey.id === 2) setShowKey2(!showKey2);
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[11.5px] font-medium text-text-3 hover:text-text-1 transition-colors"
                  >
                    {(apiKey.id === 1 && showKey1) || (apiKey.id === 2 && showKey2) ? 'Hide' : 'Show'}
                  </button>
                </div>
                <button
                  onClick={() => copyToClipboard(apiKey.key, apiKey.id)}
                  className="h-10 px-3.5 flex items-center gap-2 text-[12.5px] font-semibold text-text-1 bg-bg border border-border rounded-[9px] hover:bg-white hover:shadow-[0_4px_24px_rgba(0,0,0,0.05)] transition-all"
                >
                  {copiedKey === apiKey.id ? (
                    <>
                      <svg className="w-3.5 h-3.5 text-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      Copied
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                      Copy
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Usage Stats */}
        <div className="bg-white rounded-[14px] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
          <h2 className="text-[16px] font-bold text-text-0 mb-4">API Usage</h2>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-1.5">
                <span className="text-[13px] font-medium text-text-1">Requests this month</span>
                <span className="font-mono text-[12px] font-medium text-text-0">1,284 / 10,000</span>
              </div>
              <div className="h-2 bg-black/[0.04] rounded-full overflow-hidden">
                <div className="h-full bg-blue rounded-full transition-all duration-500" style={{ width: '12.84%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1.5">
                <span className="text-[13px] font-medium text-text-1">Tokens consumed</span>
                <span className="font-mono text-[12px] font-medium text-text-0">45.2K / 500K</span>
              </div>
              <div className="h-2 bg-black/[0.04] rounded-full overflow-hidden">
                <div className="h-full bg-blue rounded-full transition-all duration-500" style={{ width: '9.04%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Documentation Link */}
        <div className="p-4 bg-bg rounded-[12px] border border-border">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[13.5px] font-semibold text-text-0 mb-0.5">API Documentation</div>
              <div className="text-[12px] text-text-2">Learn how to integrate MemoCore into your workflow</div>
            </div>
            <a
              href="/docs/api"
              className="h-8 px-3.5 flex items-center gap-1.5 text-[12.5px] font-semibold text-blue bg-white rounded-[9px] border border-border hover:shadow-[0_4px_24px_rgba(0,0,0,0.05)] transition-all"
            >
              View docs
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
