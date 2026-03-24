import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { signOut } from '@/lib/actions/auth';
import { cookies } from 'next/headers';

export default async function Navbar() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const cookieStore = await cookies();
  const role = cookieStore.get('user_role')?.value;

  let profile = null;
  let unreadCount = 0;
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('full_name, avatar_url')
      .eq('id', user.id)
      .single();
    profile = data;

    // Get unread message count
    const { data: unreadMessages } = await supabase
      .from('messages')
      .select('id')
      .eq('receiver_id', user.id)
      .eq('read', false);
    unreadCount = unreadMessages?.length || 0;
  }

  const dashboardUrl = role === 'coach' ? '/coach/dashboard' : '/dashboard';

  return (
    <nav className="bg-white border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-xl font-bold text-blue-600">
            CoachMe
          </Link>
          <Link href="/coaches" className="text-sm text-gray-600 hover:text-gray-900">
            Browse Coaches
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {user && profile ? (
            <>
              <Link href={dashboardUrl} className="text-sm text-gray-600 hover:text-gray-900">
                Dashboard
              </Link>
              <Link href="/messages" className="text-sm text-gray-600 hover:text-gray-900 relative">
                Messages
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-3 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                      {profile.full_name.charAt(0)}
                    </div>
                  )}
                </div>
                <form action={signOut}>
                  <button type="submit" className="text-sm text-gray-500 hover:text-gray-700">
                    Sign Out
                  </button>
                </form>
              </div>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900">
                Sign In
              </Link>
              <Link href="/signup"
                className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
