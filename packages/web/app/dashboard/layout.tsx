import { redirect } from 'next/navigation';
import { createClient } from '../../lib/supabase/server';
import { SupabaseDatabase } from '@mycontxt/adapters/supabase';
import { getPlan, type PlanId } from '@mycontxt/core/plans';
import { DashboardSidebar } from './sidebar';
import { RealtimeSync } from './realtime-sync';
import { UserDropdown } from './user-dropdown';

async function getLayoutData() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');
  const { data: { session } } = await supabase.auth.getSession();

  const db = new SupabaseDatabase({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    accessToken: session?.access_token,
  });

  const [projects, drafts, profile, subResult] = await Promise.all([
    db.getProjects(user.id).catch(() => []),
    db.getDrafts(user.id).catch(() => []),
    db.getUserProfile(user.id).catch(() => null),
    supabase.from('subscriptions').select('plan_id, status').eq('user_id', user.id).single(),
  ]);

  const sub = subResult.data;
  const subPlan = (sub?.status === 'active' && sub?.plan_id !== 'free') ? sub.plan_id as PlanId : null;
  const planId = subPlan || (profile?.plan_id as PlanId) || 'free';
  const plan = getPlan(planId);

  return { user, projects, draftCount: drafts.length, planId, plan };
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, projects, draftCount, planId, plan } = await getLayoutData();

  const displayName = (user.user_metadata?.full_name as string) || user.email?.split('@')[0] || 'User';
  const initials = displayName[0]?.toUpperCase() ?? 'U';

  return (
    <div className="h-screen flex bg-[#F6F6F6]">
      <RealtimeSync userId={user.id} />
      <DashboardSidebar
        projects={projects}
        draftCount={draftCount}
        user={{ name: displayName, email: user.email ?? '', initials }}
        planId={planId}
        planName={plan.name}
        maxProjects={plan.limits.maxProjects}
        maxEntries={plan.limits.maxTotalEntries}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Nav */}
        <nav className="h-[52px] flex items-center px-8 bg-[#F6F6F6] sticky top-0 z-10">
          <div className="flex items-center gap-1.5 text-[13px]">
            <span className="text-text-0 font-semibold">Projects</span>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <a href="/docs" className="text-[13px] text-text-2 font-medium hover:text-text-0 transition-colors">
              Docs
            </a>
            <UserDropdown initials={initials} />
          </div>
        </nav>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-8 pt-4 pb-20 max-w-[1080px]">{children}</div>
        </div>
      </main>
    </div>
  );
}
