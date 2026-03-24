import { GroupSessionWithCoach } from '@/types/database.types';
import Link from 'next/link';

interface GroupSessionCardProps {
  session: GroupSessionWithCoach;
  participantCount: number;
}

export default function GroupSessionCard({
  session,
  participantCount,
}: GroupSessionCardProps) {
  const sessionDate = new Date(session.session_date);
  const formattedDate = sessionDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  const spotsRemaining = session.max_participants - participantCount;
  const isFull = spotsRemaining <= 0;

  return (
    <Link href={`/groups/${session.id}`}>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow h-full cursor-pointer">
        {/* Header with sport badge */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 text-white">
          <div className="flex justify-between items-start gap-2">
            <h3 className="font-semibold text-lg flex-1">{session.title}</h3>
            <span className="inline-block bg-blue-500 bg-opacity-30 text-white px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap">
              {session.sport}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Coach */}
          <div className="flex items-center gap-3">
            {session.coach_profiles.profiles.avatar_url && (
              <img
                src={session.coach_profiles.profiles.avatar_url}
                alt={session.coach_profiles.profiles.full_name}
                className="w-10 h-10 rounded-full object-cover"
              />
            )}
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {session.coach_profiles.profiles.full_name}
              </p>
              <p className="text-xs text-gray-500">Coach</p>
            </div>
          </div>

          {/* Date and Time */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>📅</span>
            <span>{formattedDate}</span>
            <span>•</span>
            <span>{session.start_time}</span>
          </div>

          {/* Location */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>📍</span>
            <span className="truncate">{session.location}</span>
          </div>

          {/* Footer with price and spots */}
          <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
            <div>
              <p className="text-xs text-gray-500 uppercase">Price per person</p>
              <p className="text-xl font-bold text-blue-600">
                €{(session.price_per_person / 100).toFixed(2)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 uppercase">
                {isFull ? 'Full' : 'Spots left'}
              </p>
              <p
                className={`text-lg font-bold ${
                  isFull ? 'text-red-600' : 'text-green-600'
                }`}
              >
                {isFull ? '0' : spotsRemaining}/{session.max_participants}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
