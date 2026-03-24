import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Browse Sports | CoachMe',
  description: 'Find coaches for your favorite sports. Browse all available sports and discover coaches.',
};

export default async function SportsPage() {
  const supabase = await createClient();

  // Get all coaches to extract sports
  const { data: coaches } = await supabase
    .from('coach_profiles')
    .select('sports')
    .eq('verification_status', 'verified');

  // Count coaches per sport
  const sportMap = new Map<string, number>();
  coaches?.forEach((coach) => {
    if (coach.sports && Array.isArray(coach.sports)) {
      coach.sports.forEach((sport) => {
        const count = sportMap.get(sport) || 0;
        sportMap.set(sport, count + 1);
      });
    }
  });

  const sports = Array.from(sportMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Sports & Coaches</h1>
          <p className="text-gray-600 text-lg">
            Find expert coaches for your favorite sports
          </p>
        </div>

        {sports.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sports.map((sport) => (
              <Link
                key={sport.name}
                href={`/sports/${encodeURIComponent(sport.name)}`}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
              >
                <h3 className="text-lg font-semibold text-gray-900">
                  {sport.name}
                </h3>
                <p className="text-gray-600 text-sm mt-1">
                  {sport.count} coach{sport.count !== 1 ? 'es' : ''}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-500">
            <p>No sports available yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
