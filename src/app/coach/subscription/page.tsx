import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import SubscriptionCard from '@/components/coach/SubscriptionCard';

export default async function SubscriptionPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: coachProfile } = await supabase
    .from('coach_profiles')
    .select('subscription_status, subscription_ends_at, stripe_customer_id')
    .eq('id', user.id)
    .single();

  if (!coachProfile) {
    redirect('/coach/profile');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Subscription</h1>
          <p className="text-gray-600 mt-1">Manage your coaching subscription</p>
        </div>

        <SubscriptionCard
          status={coachProfile.subscription_status}
          endsAt={coachProfile.subscription_ends_at}
          customerId={coachProfile.stripe_customer_id}
        />

        {coachProfile.subscription_status === 'inactive' && (
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-blue-900 mb-2">
              Why subscribe?
            </h2>
            <ul className="text-blue-800 space-y-2">
              <li className="flex items-start gap-3">
                <span className="text-xl">✓</span>
                <span>List your coaching profile on our marketplace</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-xl">✓</span>
                <span>Receive booking requests from clients</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-xl">✓</span>
                <span>Create group sessions and packages</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-xl">✓</span>
                <span>First month free with 30-day trial</span>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
