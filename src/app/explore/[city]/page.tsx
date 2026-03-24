import { createClient } from '@/lib/supabase/server';
import CoachCard from '@/components/coach/CoachCard';
import Link from 'next/link';
import { Metadata } from 'next';

interface PageProps {
  params: {
    city: string;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const city = decodeURIComponent(params.city);
  return {
    title: `Coaches in ${city} | CoachMe`,
    description: `Find and book verified sports coaches in ${city}. Browse available coaches and their specialties.`,
  };
}

export function generateStaticParams() {
  return [];
}

export default async function CityPage({ params }: PageProps) {
  const supabase = await createClient();
  const city = decodeURIComponent(params.city);

  // Fetch coaches in this city
  const { data: coaches } = await supabase
    .from('coach_profiles')
    .select('*, profiles!inner(*, id, full_name, avatar_url)')
    .ilike('location', `%${city}%`)
    .eq('verification_status', 'verified');

  // Get all sports from these coaches
  const sportsSet = new Set<string>();
  coaches?.forEach((coach) => {
    if (coach.sports && Array.isArray(coach.sports)) {
      coach.sports.forEach((sport: string) => sportsSet.add(sport));
    }
  });
  const sports = Array.from(sportsSet).sort();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/explore"
            className="text-blue-600 hover:text-blue-700 text-sm font-medium mb-4 inline-block"
          >
            ← Back to Cities
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Coaches in {city}
          </h1>
          <p className="text-gray-600">
            {coaches?.length || 0} verified coach{coaches?.length !== 1 ? 'es' : ''} available
          </p>
        </div>

        {/* Sports Filter */}
        {sports.length > 0 && (
          <div className="mb-8">
            <p className="text-sm font-medium text-gray-700 mb-3">Sports Available</p>
            <div className="flex flex-wrap gap-2">
              {sports.map((sport) => (
                <Link
                  key={sport}
                  href={`/explore/${encodeURIComponent(city)}/${encodeURIComponent(sport)}`}
                  className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium hover:bg-blue-200 transition-colors"
                >
                  {sport}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Coaches Grid */}
        {coaches && coaches.length > 0 ? (
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
            <p>No coaches found in {city}</p>
          </div>
        )}
      </div>
    </div>
  );
}
