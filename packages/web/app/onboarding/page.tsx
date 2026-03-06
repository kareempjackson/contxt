import { createClient } from '../../lib/supabase/server';
import { OnboardingClient } from './onboarding-client';

export default async function OnboardingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Pre-fill name from GitHub OAuth metadata or existing profile
  const initialName = (
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.user_metadata?.user_name ||
    ''
  ) as string;

  return <OnboardingClient initialName={initialName} />;
}
