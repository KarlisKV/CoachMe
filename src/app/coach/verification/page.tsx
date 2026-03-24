import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import VerificationForm from '@/components/coach/VerificationForm';

export default async function CoachVerificationPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Fetch coach profile
  const { data: coachProfile } = await supabase
    .from('coach_profiles')
    .select('verification_status')
    .eq('id', user.id)
    .single();

  if (!coachProfile) redirect('/coach/dashboard');

  // Fetch latest verification request if exists
  const { data: latestRequest } = await supabase
    .from('verification_requests')
    .select('*')
    .eq('coach_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Identity Verification</h1>
          <p className="text-gray-600 mt-1">Verify your identity to build trust with potential clients</p>
        </div>

        <VerificationForm
          currentStatus={coachProfile.verification_status}
          existingRequest={latestRequest || null}
        />
      </div>
    </div>
  );
}
