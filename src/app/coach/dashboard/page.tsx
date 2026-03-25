import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import BookingCard from '@/components/booking/BookingCard';

export default async function CoachDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  const today = new Date().toISOString().split('T')[0];

  const { data: coachProfile } = await supabase
    .from('coach_profiles')
    .select('cancellation_hours, subscription_status, subscription_ends_at, sport, location')
    .eq('id', user.id)
    .single();

  const { data: bookings } = await supabase
    .from('bookings')
    .select('*, client_profiles!inner(*, profiles!inner(full_name, avatar_url))')
    .eq('coach_id', user.id)
    .gte('slot_date', today)
    .order('slot_date')
    .order('start_time');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Coach Dashboard</h1>
            <p className="text-gray-500 mt-1">Welcome back, {profile?.full_name}</p>
          </div>
        </div>

        {/* Subscription Status Banner */}
        {coachProfile?.subscription_status && (
          <div className="mb-8 rounded-xl border p-4 flex items-center justify-between" style={{
            backgroundColor: coachProfile.subscription_status === 'active' ? '#dcfce7' : coachProfile.subscription_status === 'trial' ? '#fef3c7' : '#fee2e2',
            borderColor: coachProfile.subscription_status === 'active' ? '#86efac' : coachProfile.subscription_status === 'trial' ? '#fcd34d' : '#fca5a5'
          }}>
            <div>
              {coachProfile.subscription_status === 'active' && (
                <p className="text-green-800 font-medium">✓ Subscription Active</p>
              )}
              {coachProfile.subscription_status === 'trial' && (
                <p className="text-yellow-800 font-medium">🎉 Free Trial Active</p>
              )}
              {coachProfile.subscription_status === 'inactive' && (
                <p className="text-red-800 font-medium">⏸️ Subscription Inactive</p>
              )}
              {coachProfile.subscription_status === 'cancelled' && (
                <p className="text-red-800 font-medium">❌ Subscription Cancelled</p>
              )}
            </div>
            <Link href="/coach/subscription" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
              Manage →
            </Link>
          </div>
        )}

        {/* Quick Links */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
          <Link href="/coach/profile"
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow text-center">
            <div className="text-2xl mb-1">👤</div>
            <span className="font-medium text-gray-700">Edit Profile</span>
          </Link>
          <Link href="/coach/availability"
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow text-center">
            <div className="text-2xl mb-1">📅</div>
            <span className="font-medium text-gray-700">Availability</span>
          </Link>
          <Link href="/coach/groups"
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow text-center">
            <div className="text-2xl mb-1">👥</div>
            <span className="font-medium text-gray-700">Group Sessions</span>
          </Link>
          <Link href="/coach/packages"
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow text-center">
            <div className="text-2xl mb-1">📦</div>
            <span className="font-medium text-gray-700">Packages</span>
          </Link>
        </div>

        {/* Upcoming Bookings */}
        <h2 className="text-lg font-semibold mb-4">Upcoming Bookings</h2>
        {bookings && bookings.length > 0 ? (
          <div className="space-y-3">
            {bookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                otherPartyName={booking.client_profiles.profiles.full_name}
                otherPartySport={coachProfile?.sport}
                role="coach"
                cancellationHours={coachProfile?.cancellation_hours}
                location={coachProfile?.location || undefined}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-500">
            <p>No upcoming bookings yet</p>
            <p className="text-sm mt-1">Set up your availability to start receiving bookings</p>
          </div>
        )}
      </div>
    </div>
  );
}
