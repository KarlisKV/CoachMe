import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import FavoriteButton from '@/components/coach/FavoriteButton';

export default async function FavoritesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: favorites } = await supabase
    .from('favorites')
    .select(
      '*, coach_profiles!inner(*, profiles!inner(id, full_name, avatar_url))'
    )
    .eq('client_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Link href="/dashboard" className="text-blue-600 hover:underline text-sm mb-6 block">
          &larr; Back to dashboard
        </Link>

        <h1 className="text-2xl font-bold mb-2">Favorite Coaches</h1>
        <p className="text-gray-500 mb-8">Coaches you've marked as favorites</p>

        {favorites && favorites.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((favorite) => (
              <div key={favorite.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden shrink-0">
                      {favorite.coach_profiles.profiles.avatar_url ? (
                        <img
                          src={favorite.coach_profiles.profiles.avatar_url}
                          alt={favorite.coach_profiles.profiles.full_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 font-medium">
                          {favorite.coach_profiles.profiles.full_name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <FavoriteButton coachId={favorite.coach_id} isFavorited={true} />
                  </div>

                  <h3 className="font-semibold text-gray-900 mb-1">
                    {favorite.coach_profiles.profiles.full_name}
                  </h3>

                  <div className="flex gap-2 mb-3">
                    <span className="inline-block bg-blue-100 text-blue-700 text-xs font-medium px-2 py-1 rounded">
                      {favorite.coach_profiles.sport}
                    </span>
                    {favorite.coach_profiles.specialty && (
                      <span className="text-xs text-gray-500">
                        {favorite.coach_profiles.specialty}
                      </span>
                    )}
                  </div>

                  {favorite.coach_profiles.hourly_rate && (
                    <p className="text-lg font-bold text-gray-900 mb-4">
                      ${favorite.coach_profiles.hourly_rate}
                      <span className="text-sm font-normal text-gray-500">/hour</span>
                    </p>
                  )}

                  <Link
                    href={`/coaches/${favorite.coach_id}`}
                    className="w-full inline-block text-center bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm"
                  >
                    View Profile
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <p className="text-gray-500 mb-4">You haven't favorited any coaches yet</p>
            <Link href="/coaches" className="text-blue-600 hover:underline font-medium">
              Browse coaches and add your favorites
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
