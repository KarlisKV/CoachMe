import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import BookingCard from '@/components/booking/BookingCard';

export default async function ClientDashboardPage() {
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
    .select('*, coach_profiles!inner(*, profiles!inner(full_name, avatar_url))')
    .eq('client_id', user.id)
    .gte('slot_date', today)
    .order('slot_date')
    .order('start_time');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">My Dashboard</h1>
            <p className="text-gray-500 mt-1">Welcome back, {profile?.full_name}</p>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <Link href="/coaches"
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow text-center">
            <div className="text-2xl mb-1">&#128269;</div>
            <span className="font-medium text-gray-700">Find a Coach</span>
          </Link>
          <Link href="/dashboard/profile"
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow text-center">
            <div className="text-2xl mb-1">&#128100;</div>
            <span className="font-medium text-gray-700">Edit Profile</span>
          </Link>
        </div>

        {/* Upcoming Sessions */}
        <h2 className="text-lg font-semibold mb-4">Upcoming Sessions</h2>
        {bookings && bookings.length > 0 ? (
          <div className="space-y-3">
            {bookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                otherPartyName={booking.coach_profiles.profiles.full_name}
                role="client"
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-500">
            <p>No upcoming sessions</p>
            <Link href="/coaches" className="text-blue-600 hover:underline text-sm mt-2 block">
              Find a coach and book your first session
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
