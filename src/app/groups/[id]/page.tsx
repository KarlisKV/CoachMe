import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Booking } from '@/components/groups/BookingForm';

export default async function GroupSessionDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: session } = await supabase
    .from('group_sessions')
    .select(
      '*, coach_profiles!inner(*, profiles!inner(full_name, avatar_url, bio))'
    )
    .eq('id', params.id)
    .single();

  if (!session) {
    redirect('/groups');
  }

  // Get participant count
  const { data: participants } = await supabase
    .from('group_session_participants')
    .select('id')
    .eq('group_session_id', params.id)
    .eq('status', 'registered');

  const participantCount = participants?.length || 0;
  const isFull = participantCount >= session.max_participants;

  // Check if user is already registered
  let isUserRegistered = false;
  if (user) {
    const { data: userRegistration } = await supabase
      .from('group_session_participants')
      .select('id')
      .eq('group_session_id', params.id)
      .eq('client_id', user.id)
      .eq('status', 'registered')
      .single();

    isUserRegistered = !!userRegistration;
  }

  const sessionDate = new Date(session.session_date);
  const formattedDate = sessionDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Link
          href="/groups"
          className="text-blue-600 hover:text-blue-700 font-medium mb-6 inline-block"
        >
          ← Back to Sessions
        </Link>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-8">
            <h1 className="text-3xl font-bold mb-2">{session.title}</h1>
            <div className="flex items-center gap-4">
              <span className="inline-block bg-blue-500 bg-opacity-30 text-white px-3 py-1 rounded-full text-sm font-medium">
                {session.sport}
              </span>
              <span className="text-blue-100">
                {participantCount} / {session.max_participants} registered
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            {session.description && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold mb-2">About</h2>
                <p className="text-gray-700">{session.description}</p>
              </div>
            )}

            {/* Session Details */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
                  Date & Time
                </h3>
                <p className="text-lg font-semibold">{formattedDate}</p>
                <p className="text-gray-600">
                  {session.start_time} - {session.end_time}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
                  Location
                </h3>
                <p className="text-lg font-semibold">{session.location}</p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
                  Price Per Person
                </h3>
                <p className="text-2xl font-bold text-blue-600">
                  €{(session.price_per_person / 100).toFixed(2)}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
                  Spots Available
                </h3>
                <p className="text-lg font-semibold">
                  {Math.max(0, session.max_participants - participantCount)} /{' '}
                  {session.max_participants}
                </p>
              </div>
            </div>

            {/* Coach Info */}
            <div className="border-t border-gray-200 pt-8">
              <h2 className="text-lg font-semibold mb-4">Coach</h2>
              <div className="flex items-start gap-4">
                {session.coach_profiles.profiles.avatar_url && (
                  <img
                    src={session.coach_profiles.profiles.avatar_url}
                    alt={session.coach_profiles.profiles.full_name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">
                    {session.coach_profiles.profiles.full_name}
                  </h3>
                  {session.coach_profiles.profiles.bio && (
                    <p className="text-gray-600 text-sm mt-1">
                      {session.coach_profiles.profiles.bio}
                    </p>
                  )}
                  <Link
                    href={`/coaches/${session.coach_id}`}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-2 inline-block"
                  >
                    View Profile →
                  </Link>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="border-t border-gray-200 pt-8 mt-8">
              {user ? (
                isUserRegistered ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-green-800 font-medium">
                      ✓ You're registered for this session
                    </p>
                  </div>
                ) : isFull ? (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <p className="text-gray-800 font-medium">
                      This session is full
                    </p>
                  </div>
                ) : (
                  <Booking
                    sessionId={params.id}
                    maxParticipants={session.max_participants}
                  />
                )
              ) : (
                <Link
                  href="/login"
                  className="w-full block text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  Sign in to Join
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
