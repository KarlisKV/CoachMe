import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import GroupSessionCard from '@/components/groups/GroupSessionCard';

export default async function GroupsPage({
  searchParams,
}: {
  searchParams: { sport?: string };
}) {
  const supabase = await createClient();

  const today = new Date().toISOString().split('T')[0];
  let query = supabase
    .from('group_sessions')
    .select(
      '*, coach_profiles!inner(*, profiles!inner(full_name, avatar_url))'
    )
    .eq('status', 'open')
    .gte('session_date', today)
    .order('session_date')
    .order('start_time');

  if (searchParams.sport) {
    query = query.eq('sport', searchParams.sport);
  }

  const { data: sessions } = await query;

  // Get all sports for filter
  const { data: allSessions } = await supabase
    .from('group_sessions')
    .select('sport')
    .eq('status', 'open')
    .gte('session_date', today);

  const sports = Array.from(
    new Set((allSessions || []).map((s) => s.sport).filter(Boolean))
  ).sort();

  // Get participant counts
  const sessionIds = (sessions || []).map((s) => s.id);
  let participantCounts: Record<string, number> = {};

  if (sessionIds.length > 0) {
    const { data: participants } = await supabase
      .from('group_session_participants')
      .select('group_session_id')
      .in('group_session_id', sessionIds)
      .eq('status', 'registered');

    sessionIds.forEach((id) => {
      participantCounts[id] = (participants || []).filter(
        (p) => p.group_session_id === id
      ).length;
    });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Group Sessions</h1>
          <p className="text-gray-600">
            Join coaching sessions with other athletes
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-wrap gap-2">
          <Link
            href="/groups"
            className={`px-4 py-2 rounded-full font-medium transition-colors ${
              !searchParams.sport
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            All Sports
          </Link>
          {sports.map((sport) => (
            <Link
              key={sport}
              href={`/groups?sport=${encodeURIComponent(sport)}`}
              className={`px-4 py-2 rounded-full font-medium transition-colors ${
                searchParams.sport === sport
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {sport}
            </Link>
          ))}
        </div>

        {/* Sessions Grid */}
        {sessions && sessions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sessions.map((session) => (
              <GroupSessionCard
                key={session.id}
                session={session}
                participantCount={participantCounts[session.id] || 0}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <p className="text-gray-500 text-lg">
              {searchParams.sport
                ? `No sessions available for ${searchParams.sport}`
                : 'No group sessions available yet'}
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Check back soon or try a different sport
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
