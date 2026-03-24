import StarRating from './StarRating';
import type { Review } from '@/types/database.types';

interface Props {
  review: Review & {
    client_profiles?: {
      profiles: {
        full_name: string;
        avatar_url: string | null;
      };
    };
  };
}

export default function ReviewCard({ review }: Props) {
  const clientName = review.client_profiles?.profiles.full_name || 'Anonymous';
  const clientAvatar = review.client_profiles?.profiles.avatar_url;
  const createdDate = new Date(review.created_at).toLocaleDateString();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
      {/* Review Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden shrink-0">
            {clientAvatar ? (
              <img src={clientAvatar} alt={clientName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm font-medium">
                {clientName.charAt(0)}
              </div>
            )}
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">{clientName}</h4>
            <p className="text-sm text-gray-500">{createdDate}</p>
          </div>
        </div>
        <StarRating rating={review.rating} readonly size="sm" />
      </div>

      {/* Review Comment */}
      {review.comment && (
        <p className="text-gray-600 text-sm">{review.comment}</p>
      )}

      {/* Coach Response */}
      {review.coach_response && (
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 ml-4 mt-4">
          <p className="text-xs font-semibold text-blue-900 mb-2">Coach's Response</p>
          <p className="text-sm text-blue-800">{review.coach_response}</p>
        </div>
      )}
    </div>
  );
}
