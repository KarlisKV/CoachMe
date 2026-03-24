import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import CoachProfileForm from '@/components/coach/ProfileForm';

export default async function CoachProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  const { data: coachProfile } = await supabase
    .from('coach_profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile || !coachProfile) redirect('/login');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Edit Your Profile</h1>
        <CoachProfileForm profile={profile} coachProfile={coachProfile} />
      </div>
    </div>
  );
}
