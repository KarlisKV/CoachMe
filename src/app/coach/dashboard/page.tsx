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

        {/* Quick Links */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Link href="/coach/profile"
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow text-center">
            <div className="text-2xl mb-1">&#128100;</div>
            <span className="font-medium text-gray-700">Edit Profile</span>
          </Link>
          <Link href="/coach/availability"
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow text-center">
            <div className="text-2xl mb-1">&#128197;</div>
            <span className="font-medium text-gray-700">Manage Availability</span>
          </Link>
          <Link href={`/coaches/${user.id}`}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow text-center">
            <div className="text-2xl mb-1">&#128065;</div>
            <span className="font-medium text-gray-700">View Public Profile</span>
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
                role="coach"
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
