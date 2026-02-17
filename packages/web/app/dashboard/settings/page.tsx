'use client';

import { useState } from 'react';

export default function DashboardSettings() {
  const [autoSync, setAutoSync] = useState(true);
  const [notifications, setNotifications] = useState(true);

  return (
    <>
      {/* Page Top */}
      <div className="mb-8 mt-1">
        <h1 className="text-[20px] font-bold tracking-[-0.5px]">Settings</h1>
      </div>

      <div className="max-w-[680px] space-y-6">
        {/* Account Settings */}
        <div className="bg-white rounded-[14px] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
          <h2 className="text-[16px] font-bold text-text-0 mb-4">Account</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-[13px] font-semibold text-text-1 mb-2">Name</label>
              <input
                type="text"
                defaultValue="Kareem"
                className="w-full h-10 px-3.5 text-[13px] text-text-0 bg-bg border border-border rounded-[9px] outline-none transition-all focus:border-blue/30 focus:shadow-[0_0_0_3px_rgba(10,132,255,0.07)]"
              />
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-text-1 mb-2">Email</label>
              <input
                type="email"
                defaultValue="kareem@ghostsavvy.com"
                className="w-full h-10 px-3.5 text-[13px] text-text-0 bg-bg border border-border rounded-[9px] outline-none transition-all focus:border-blue/30 focus:shadow-[0_0_0_3px_rgba(10,132,255,0.07)]"
              />
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-text-1 mb-2">Plan</label>
              <div className="flex items-center justify-between h-10 px-3.5 bg-bg border border-border rounded-[9px]">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[9px] font-semibold uppercase tracking-wide px-[7px] py-[3px] rounded-full bg-bg-dark text-text-inv">
                    Pro
                  </span>
                  <span className="text-[13px] text-text-2">$12/month · Unlimited projects</span>
                </div>
                <button className="text-[12.5px] font-semibold text-blue hover:text-[#0070E0] transition-colors">
                  Manage
                </button>
              </div>
            </div>
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
              <select className="w-full h-10 px-3.5 text-[13px] text-text-0 bg-bg border border-border rounded-[9px] outline-none transition-all focus:border-blue/30 focus:shadow-[0_0_0_3px_rgba(10,132,255,0.07)]">
                <option>main</option>
                <option>develop</option>
                <option>staging</option>
              </select>
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-text-1 mb-2">Token budget (per query)</label>
              <input
                type="number"
                defaultValue="4000"
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
                  <div className="text-[12px] text-text-2">Last sync: 2 minutes ago</div>
                </div>
              </div>
              <button className="h-8 px-3.5 text-[12.5px] font-semibold text-text-1 bg-white rounded-[9px] border border-border hover:shadow-[0_4px_24px_rgba(0,0,0,0.05)] transition-all">
                Sync now
              </button>
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-text-1 mb-2">Sync interval</label>
              <select className="w-full h-10 px-3.5 text-[13px] text-text-0 bg-bg border border-border rounded-[9px] outline-none transition-all focus:border-blue/30 focus:shadow-[0_0_0_3px_rgba(10,132,255,0.07)]">
                <option>Every 5 minutes</option>
                <option>Every 15 minutes</option>
                <option>Every 30 minutes</option>
                <option>Manual only</option>
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
                <div className="text-[12px] text-text-2">Download all projects and entries</div>
              </div>
              <button className="h-8 px-3.5 text-[12.5px] font-semibold text-text-1 bg-white rounded-[9px] border border-border hover:shadow-[0_4px_24px_rgba(0,0,0,0.05)] transition-all">
                Export
              </button>
            </div>
            <div className="flex items-center justify-between p-3.5 bg-rose-soft rounded-[10px]">
              <div>
                <div className="text-[13.5px] font-semibold text-rose mb-0.5">Delete account</div>
                <div className="text-[12px] text-text-2">Permanently delete your account and all data</div>
              </div>
              <button className="h-8 px-3.5 text-[12.5px] font-semibold text-white bg-rose rounded-[9px] hover:bg-[#C91840] transition-all">
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button className="h-10 px-6 text-[13.5px] font-semibold text-white bg-blue rounded-[9px] shadow-[0_1px_3px_rgba(10,132,255,0.2)] hover:shadow-[0_3px_12px_rgba(10,132,255,0.25)] hover:bg-[#0070E0] transition-all">
            Save changes
          </button>
        </div>
      </div>
    </>
  );
}
