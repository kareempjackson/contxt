'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../../lib/supabase/client';

interface SettingsClientProps {
  user: { id: string; name: string; email: string };
  planId: string;
  planName: string;
  planPrice: number | null;
  justUpgraded: boolean;
  preferences: Record<string, unknown>;
}

export function SettingsClient({ user, planId, planName, planPrice, justUpgraded, preferences }: SettingsClientProps) {
  const router = useRouter();
  const [name, setName] = useState(user.name);
  const [autoSync, setAutoSync] = useState((preferences.autoSync as boolean) ?? true);
  const [notifications, setNotifications] = useState((preferences.notifications as boolean) ?? true);
  const [defaultBranch, setDefaultBranch] = useState((preferences.defaultBranch as string) ?? 'main');
  const [tokenBudget, setTokenBudget] = useState((preferences.tokenBudget as number) ?? 4000);
  const [syncInterval, setSyncInterval] = useState((preferences.syncInterval as string) ?? '5');

  const [billingLoading, setBillingLoading] = useState(false);
  const [billingError, setBillingError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleSave() {
    setSaving(true);
    setSaveSuccess(false);
    try {
      const supabase = createClient();
      await Promise.all([
        supabase.auth.updateUser({ data: { full_name: name.trim() } }),
        supabase.from('user_profiles').update({
          metadata: { autoSync, notifications, defaultBranch, tokenBudget: Number(tokenBudget), syncInterval },
        }).eq('id', user.id),
      ]);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } finally {
      setSaving(false);
    }
  }

  async function handleUpgrade() {
    setBillingLoading(true);
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: 'pro', billingPeriod: 'monthly' }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } finally {
      setBillingLoading(false);
    }
  }

  async function handleManage() {
    setBillingLoading(true);
    setBillingError('');
    try {
      const res = await fetch('/api/billing/portal', { method: 'POST' });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setBillingError('Could not open billing portal. Please try again or contact support.');
      }
    } catch {
      setBillingError('Could not open billing portal. Please try again.');
    } finally {
      setBillingLoading(false);
    }
  }

  async function handleSync() {
    setSyncing(true);
    router.refresh();
    setTimeout(() => setSyncing(false), 1500);
  }

  async function handleExport() {
    setExportLoading(true);
    try {
      const res = await fetch('/api/user/export');
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'contxt-export.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      setExportLoading(false);
    }
  }

  async function handleDelete() {
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      return;
    }
    setDeleting(true);
    try {
      await fetch('/api/user/delete', { method: 'POST' });
      window.location.href = '/';
    } finally {
      setDeleting(false);
    }
  }

  const isPaid = planId !== 'free';
  const planDescription = isPaid
    ? `$${planPrice}/month · Unlimited projects`
    : '3 projects · 1,000 entries';

  return (
    <>
      {/* Page Top */}
      <div className="mb-8 mt-1">
        <h1 className="text-[20px] font-bold tracking-[-0.5px]">Settings</h1>
      </div>

      {justUpgraded && isPaid && (
        <div className="mb-6 px-4 py-3 bg-green/10 border border-green/20 rounded-[10px] text-[13.5px] font-semibold text-green">
          You&apos;re now on {planName}. Welcome!
        </div>
      )}
      {justUpgraded && !isPaid && (
        <div className="mb-6 px-4 py-3 bg-amber/10 border border-amber/20 rounded-[10px] text-[13.5px] font-semibold text-amber-600">
          Your upgrade is processing — this page will reflect your new plan shortly.
        </div>
      )}

      <div className="max-w-[680px] space-y-6">
        {/* Account Settings */}
        <div className="bg-white rounded-[14px] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
          <h2 className="text-[16px] font-bold text-text-0 mb-4">Account</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-[13px] font-semibold text-text-1 mb-2">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-10 px-3.5 text-[13px] text-text-0 bg-bg border border-border rounded-[9px] outline-none transition-all focus:border-blue/30 focus:shadow-[0_0_0_3px_rgba(10,132,255,0.07)]"
              />
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-text-1 mb-2">Email</label>
              <input
                type="email"
                defaultValue={user.email}
                readOnly
                className="w-full h-10 px-3.5 text-[13px] text-text-0 bg-bg border border-border rounded-[9px] outline-none opacity-60 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-text-1 mb-2">Plan</label>
              <div className="flex items-center justify-between h-10 px-3.5 bg-bg border border-border rounded-[9px]">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[9px] font-semibold uppercase tracking-wide px-[7px] py-[3px] rounded-full bg-bg-dark text-text-inv">
                    {planName}
                  </span>
                  <span className="text-[13px] text-text-2">{planDescription}</span>
                </div>
                {isPaid ? (
                  <button
                    onClick={handleManage}
                    disabled={billingLoading}
                    className="text-[12.5px] font-semibold text-blue hover:text-[#0070E0] transition-colors disabled:opacity-50"
                  >
                    {billingLoading ? '...' : 'Manage'}
                  </button>
                ) : (
                  <button
                    onClick={handleUpgrade}
                    disabled={billingLoading}
                    className="text-[12.5px] font-semibold text-violet hover:text-violet-dark transition-colors disabled:opacity-50"
                  >
                    {billingLoading ? '...' : 'Upgrade →'}
                  </button>
                )}
              </div>
            </div>
            {billingError && (
              <p className="text-[12px] text-rose mt-2">{billingError}</p>
            )}
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-white rounded-[14px] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
          <h2 className="text-[16px] font-bold text-text-0 mb-4">Preferences</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[13.5px] font-semibold text-text-0 mb-0.5">Auto-sync</div>
                <div className="text-[12px] text-text-2">Automatically push changes to cloud</div>
              </div>
              <button
                onClick={() => setAutoSync(!autoSync)}
                className={`relative w-11 h-6 rounded-full transition-all ${
                  autoSync ? 'bg-blue' : 'bg-black/[0.1]'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                    autoSync ? 'translate-x-5' : 'translate-x-0'
                  }`}
                ></span>
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[13.5px] font-semibold text-text-0 mb-0.5">Notifications</div>
                <div className="text-[12px] text-text-2">Email notifications for activity</div>
              </div>
              <button
                onClick={() => setNotifications(!notifications)}
                className={`relative w-11 h-6 rounded-full transition-all ${
                  notifications ? 'bg-blue' : 'bg-black/[0.1]'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                    notifications ? 'translate-x-5' : 'translate-x-0'
                  }`}
                ></span>
              </button>
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-text-1 mb-2">Default branch</label>
              <select
                value={defaultBranch}
                onChange={(e) => setDefaultBranch(e.target.value)}
                className="w-full h-10 px-3.5 text-[13px] text-text-0 bg-bg border border-border rounded-[9px] outline-none transition-all focus:border-blue/30 focus:shadow-[0_0_0_3px_rgba(10,132,255,0.07)]"
              >
                <option value="main">main</option>
                <option value="develop">develop</option>
                <option value="staging">staging</option>
              </select>
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-text-1 mb-2">Token budget (per query)</label>
              <input
                type="number"
                value={tokenBudget}
                onChange={(e) => setTokenBudget(Number(e.target.value))}
                className="w-full h-10 px-3.5 text-[13px] text-text-0 bg-bg border border-border rounded-[9px] outline-none transition-all focus:border-blue/30 focus:shadow-[0_0_0_3px_rgba(10,132,255,0.07)]"
              />
              <div className="text-[11.5px] text-text-3 mt-1.5">Maximum tokens to load per context query</div>
            </div>
          </div>
        </div>

        {/* Sync Settings */}
        <div className="bg-white rounded-[14px] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
          <h2 className="text-[16px] font-bold text-text-0 mb-4">Sync</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3.5 bg-bg rounded-[10px]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-[9px] bg-green/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <div className="text-[13.5px] font-semibold text-text-0">All synced</div>
                  <div className="text-[12px] text-text-2">Data refreshed from cloud</div>
                </div>
              </div>
              <button
                onClick={handleSync}
                disabled={syncing}
                className="h-8 px-3.5 text-[12.5px] font-semibold text-text-1 bg-white rounded-[9px] border border-border hover:shadow-[0_4px_24px_rgba(0,0,0,0.05)] transition-all disabled:opacity-50"
              >
                {syncing ? 'Syncing…' : 'Sync now'}
              </button>
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-text-1 mb-2">Sync interval</label>
              <select
                value={syncInterval}
                onChange={(e) => setSyncInterval(e.target.value)}
                className="w-full h-10 px-3.5 text-[13px] text-text-0 bg-bg border border-border rounded-[9px] outline-none transition-all focus:border-blue/30 focus:shadow-[0_0_0_3px_rgba(10,132,255,0.07)]"
              >
                <option value="5">Every 5 minutes</option>
                <option value="15">Every 15 minutes</option>
                <option value="30">Every 30 minutes</option>
                <option value="manual">Manual only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-[14px] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)] border border-rose/20">
          <h2 className="text-[16px] font-bold text-rose mb-4">Danger Zone</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3.5 bg-rose-soft rounded-[10px]">
              <div>
                <div className="text-[13.5px] font-semibold text-text-0 mb-0.5">Export all data</div>
                <div className="text-[12px] text-text-2">Download all projects and entries as JSON</div>
              </div>
              <button
                onClick={handleExport}
                disabled={exportLoading}
                className="h-8 px-3.5 text-[12.5px] font-semibold text-text-1 bg-white rounded-[9px] border border-border hover:shadow-[0_4px_24px_rgba(0,0,0,0.05)] transition-all disabled:opacity-50"
              >
                {exportLoading ? 'Exporting…' : 'Export'}
              </button>
            </div>
            <div className="flex items-center justify-between p-3.5 bg-rose-soft rounded-[10px]">
              <div>
                <div className="text-[13.5px] font-semibold text-rose mb-0.5">Delete account</div>
                <div className="text-[12px] text-text-2">
                  {deleteConfirm
                    ? 'This cannot be undone. Click confirm to permanently delete.'
                    : 'Permanently delete your account and all data'}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {deleteConfirm && (
                  <button
                    onClick={() => setDeleteConfirm(false)}
                    className="h-8 px-3.5 text-[12.5px] font-semibold text-text-2 bg-white rounded-[9px] border border-border hover:shadow-[0_4px_24px_rgba(0,0,0,0.05)] transition-all"
                  >
                    Cancel
                  </button>
                )}
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="h-8 px-3.5 text-[12.5px] font-semibold text-white bg-rose rounded-[9px] hover:bg-[#C91840] transition-all disabled:opacity-50"
                >
                  {deleting ? 'Deleting…' : deleteConfirm ? 'Confirm delete' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-end gap-3">
          {saveSuccess && (
            <span className="text-[12.5px] text-green font-medium">Saved</span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="h-10 px-6 text-[13.5px] font-semibold text-white bg-blue rounded-[9px] shadow-[0_1px_3px_rgba(10,132,255,0.2)] hover:shadow-[0_3px_12px_rgba(10,132,255,0.25)] hover:bg-[#0070E0] transition-all disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </div>
    </>
  );
}
