import { redirect } from 'next/navigation';
import { createClient } from '../../../lib/supabase/server';
import { SupabaseDatabase } from '@mycontxt/adapters/supabase';
import type { ActivityItem } from '@mycontxt/core';

async function getActivity(): Promise<ActivityItem[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const db = new SupabaseDatabase({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  });
  return (db.getActivity(user.id, { limit: 50 }) as Promise<ActivityItem[]>).catch(() => []);
}

const TYPE_DOTS: Record<string, string> = {
  push: 'bg-blue',
  session: 'bg-violet',
  draft: 'bg-amber',
  edit: 'bg-teal',
  archive: 'bg-text-3',
  branch: 'bg-rose',
};

function timeAgo(date: Date): string {
  const secs = Math.floor((Date.now() - date.getTime()) / 1000);
  if (secs < 60) return `${secs}s ago`;
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  return `${Math.floor(secs / 86400)}d ago`;
}

export default async function ActivityPage() {
  const activities = await getActivity();

  return (
    <>
      <div className="flex items-center justify-between mb-8 mt-1">
        <h1 className="text-[20px] font-bold tracking-[-0.5px]">Activity</h1>
      </div>

      {activities.length === 0 && (
        <div className="bg-white rounded-[14px] p-10 text-center shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
          <div className="text-[14px] font-semibold text-text-0 mb-1">No activity yet</div>
          <p className="text-[12.5px] text-text-2 mb-3">Push your first context to see your timeline:</p>
          <pre className="text-[12px] font-mono text-text-1 bg-[#F6F6F6] rounded-[10px] px-4 py-2.5 inline-block">
            contxt push
          </pre>
        </div>
      )}

      <div className="space-y-1">
        {activities.map((item) => (
          <div
            key={item.id}
            className="flex items-start gap-3 px-4 py-3.5 bg-white rounded-[12px] shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
          >
            <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${TYPE_DOTS[item.type] ?? 'bg-text-3'}`} />
            <div className="flex-1 min-w-0">
              <div className="text-[13.5px] font-semibold text-text-0 truncate">{item.description}</div>
              <div className="text-[12px] text-text-3 mt-0.5">
                {item.projectName} · {item.actor}
              </div>
            </div>
            <div className="text-[11.5px] text-text-3 flex-shrink-0">
              {timeAgo(item.createdAt)}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
