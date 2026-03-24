import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Explore Cities | CoachMe',
  description: 'Find coaches in your city. Browse by location to discover verified sports coaches.',
};

export default async function ExploreMainPage() {
  const supabase = await createClient();

  // Get all unique locations from coach profiles
  const { data: coachProfiles } = await supabase
    .from('coach_profiles')
    .select('location')
    .not('location', 'is', null);

  // Group by location
  const locationMap = new Map<string, number>();
  coachProfiles?.forEach((profile) => {
    if (profile.location) {
      const count = locationMap.get(profile.location) || 0;
      locationMap.set(profile.location, count + 1);
    }
  });

  const locations = Array.from(locationMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Find Coaches by City</h1>
          <p className="text-gray-600 text-lg">
            Browse verified sports coaches in your area
          </p>
        </div>

        {locations.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {locations.map((location) => (
              <Link
                key={location.name}
                href={`/explore/${encodeURIComponent(location.name)}`}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
              >
                <h3 className="text-lg font-semibold text-gray-900">
                  {location.name}
                </h3>
                <p className="text-gray-600 text-sm mt-1">
                  {location.count} coach{location.count !== 1 ? 'es' : ''}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-500">
            <p>No coaches available yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
