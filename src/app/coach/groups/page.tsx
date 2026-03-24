import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import CreateGroupSessionForm from '@/components/groups/CreateGroupSessionForm';

export default async function CoachGroupsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: sessions } = await supabase
    .from('group_sessions')
    .select('*')
    .eq('coach_id', user.id)
    .order('session_date');

  const today = new Date().toISOString().split('T')[0];
  const upcomingSessions = (sessions || []).filter((s) => s.session_date >= today);
  const pastSessions = (sessions || []).filter((s) => s.session_date < today);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Group Sessions</h1>
            <p className="text-gray-600 mt-1">Manage your group coaching sessions</p>
          </div>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            onClick={() => document.getElementById('create-form')?.scrollIntoView({ behavior: 'smooth' })}
          >
            + Create Session
          </button>
        </div>

        {/* Create Form */}
        <div id="create-form" className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">Create New Group Session</h2>
          <CreateGroupSessionForm />
        </div>

        {/* Upcoming Sessions */}
        {upcomingSessions.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Upcoming Sessions</h2>
            <div className="space-y-4">
              {upcomingSessions.map((session) => (
                <SessionRow key={session.id} session={session} />
              ))}
            </div>
          </div>
        )}

        {/* Past Sessions */}
        {pastSessions.length > 0 && (
          <div>
            <h2 className="text-xl font-bold mb-4 text-gray-600">Past Sessions</h2>
            <div className="space-y-4 opacity-75">
              {pastSessions.map((session) => (
                <SessionRow key={session.id} session={session} />
              ))}
            </div>
          </div>
        )}

        {sessions && sessions.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <p className="text-gray-500 text-lg">No group sessions yet</p>
            <p className="text-gray-400 text-sm mt-2">Create your first group session above</p>
          </div>
        )}
      </div>
    </div>
  );
}

function SessionRow({ session }: { session: any }) {
  const sessionDate = new Date(session.session_date);
  const formattedDate = sessionDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Link href={`/groups/${session.id}`}>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow cursor-pointer">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{session.title}</h3>
            <div className="flex items-center gap-4 mt-2 text-gray-600 text-sm">
              <span>{session.sport}</span>
              <span>•</span>
              <span>{formattedDate}</span>
              <span>•</span>
              <span>{session.start_time}</span>
            </div>
          </div>
          <div className="text-right">
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
              session.status === 'cancelled'
                ? 'bg-red-100 text-red-700'
                : session.status === 'full'
                ? 'bg-orange-100 text-orange-700'
                : 'bg-green-100 text-green-700'
            }`}>
              {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
