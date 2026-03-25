import Link from 'next/link';
import type { CoachWithProfileAndRating } from '@/types/database.types';

interface Props {
  coach: CoachWithProfileAndRating;
}

export default function CoachCard({ coach }: Props) {
  const avgRating = coach.coach_ratings?.[0]?.avg_rating;
  const reviewCount = coach.coach_ratings?.[0]?.review_count;
  return (
    <Link href={`/coaches/${coach.id}`} className="block">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow p-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden shrink-0">
            {coach.profiles.avatar_url ? (
              <img src={coach.profiles.avatar_url} alt={coach.profiles.full_name}
                className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-xl font-medium">
                {coach.profiles.full_name.charAt(0)}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <h3 className="font-semibold text-lg text-gray-900">{coach.profiles.full_name}</h3>
              {avgRating && (
                <div className="flex items-center gap-1 bg-yellow-50 px-2.5 py-1.5 rounded-lg shrink-0">
                  <span className="text-yellow-400">★</span>
                  <span className="text-sm font-semibold text-gray-900">{avgRating.toFixed(1)}</span>
                  <span className="text-xs text-gray-500">({reviewCount})</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="inline-block bg-blue-100 text-blue-700 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {coach.sport}
              </span>
              {coach.specialty && (
                <span className="text-sm text-gray-500">{coach.specialty}</span>
              )}
            </div>
            {coach.location && (
              <p className="text-sm text-gray-500 mt-1">{coach.location}</p>
            )}
            {coach.description && (
              <p className="text-sm text-gray-600 mt-2 line-clamp-2">{coach.description}</p>
            )}
            <div className="flex items-center gap-4 mt-3">
              {coach.hourly_rate && (
                <span className="text-sm font-semibold text-gray-900">€{coach.hourly_rate}/hr</span>
              )}
              {coach.experience_years && (
                <span className="text-sm text-gray-500">{coach.experience_years} yrs exp.</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
