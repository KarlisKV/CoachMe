import { createClient } from '@/lib/supabase/server';
import CoachCard from '@/components/coach/CoachCard';
import Link from 'next/link';
import { Metadata } from 'next';

interface PageProps {
  params: {
    city: string;
    sport: string;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const city = decodeURIComponent(params.city);
  const sport = decodeURIComponent(params.sport);
  return {
    title: `${sport} Coaches in ${city} | CoachMe`,
    description: `Find and book ${sport} coaches in ${city}. Verified sports coaches ready to help you improve.`,
  };
}

export function generateStaticParams() {
  return [];
}

export default async function CityAndSportPage({ params }: PageProps) {
  const supabase = await createClient();
  const city = decodeURIComponent(params.city);
  const sport = decodeURIComponent(params.sport);

  // Fetch coaches matching both city and sport
  const { data: coachProfiles } = await supabase
    .from('coach_profiles')
    .select('*, profiles!inner(*, id, full_name, avatar_url)')
    .ilike('location', `%${city}%`)
    .eq('verification_status', 'verified');

  // Filter by sport (sports is an array field)
  const coaches = coachProfiles?.filter((coach) => {
    if (coach.sports && Array.isArray(coach.sports)) {
      return coach.sports.some(
        (s: string) => s.toLowerCase() === sport.toLowerCase()
      );
    }
    return false;
  }) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm mb-4">
            <Link
              href="/explore"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Explore
            </Link>
            <span className="text-gray-400">/</span>
            <Link
              href={`/explore/${encodeURIComponent(city)}`}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              {city}
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-600">{sport}</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {sport} Coaches in {city}
          </h1>
          <p className="text-gray-600">
            {coaches.length} verified coach{coaches.length !== 1 ? 'es' : ''} available
          </p>
        </div>

        {/* Coaches Grid */}
        {coaches.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {coaches.map((coach) => (
              <CoachCard
                key={coach.id}
                coach={coach as any}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-500">
            <p>No {sport} coaches found in {city}</p>
            <Link
              href={`/explore/${encodeURIComponent(city)}`}
              className="text-blue-600 hover:text-blue-700 text-sm mt-2 inline-block"
            >
              Browse all coaches in {city}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
