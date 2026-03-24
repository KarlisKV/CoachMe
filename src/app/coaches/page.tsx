import { createClient } from '@/lib/supabase/server';
import CoachCard from '@/components/coach/CoachCard';
import Link from 'next/link';

interface Props {
  searchParams: Promise<{ sport?: string; location?: string; q?: string }>;
}

export default async function CoachesPage({ searchParams }: Props) {
  const params = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from('coach_profiles')
    .select('*, profiles!inner(full_name, avatar_url, bio), coach_ratings(*)');

  if (params.sport) {
    query = query.ilike('sport', `%${params.sport}%`);
  }
  if (params.location) {
    query = query.ilike('location', `%${params.location}%`);
  }
  if (params.q) {
    query = query.ilike('profiles.full_name', `%${params.q}%`);
  }

  const { data: coaches } = await query;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Find a Coach</h1>
          <Link href="/" className="text-blue-600 hover:underline text-sm">Back to Home</Link>
        </div>

        {/* Filters */}
        <form className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              name="q"
              defaultValue={params.q || ''}
              placeholder="Search by name..."
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
            <input
              name="sport"
              defaultValue={params.sport || ''}
              placeholder="Sport (e.g., Tennis)"
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
            <input
              name="location"
              defaultValue={params.location || ''}
              placeholder="Location"
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Search
            </button>
          </div>
        </form>

        {/* Results */}
        {coaches && coaches.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {coaches.map((coach) => (
              <CoachCard key={coach.id} coach={coach} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-500">
            <p className="text-lg">No coaches found</p>
            <p className="text-sm mt-2">Try adjusting your search filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
