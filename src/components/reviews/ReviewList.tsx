import { createClient } from '@/lib/supabase/server';
import ReviewCard from './ReviewCard';
import StarRating from './StarRating';

interface Props {
  coachId: string;
}

export default async function ReviewList({ coachId }: Props) {
  const supabase = await createClient();

  // Fetch all reviews for the coach
  const { data: reviews } = await supabase
    .from('reviews')
    .select(
      `
      id,
      rating,
      comment,
      coach_response,
      created_at,
      client_id,
      client_profiles!inner(
        id,
        profiles!inner(full_name, avatar_url)
      )
      `
    )
    .eq('coach_id', coachId)
    .order('created_at', { ascending: false });

  if (!reviews || reviews.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
        <p className="text-gray-500 font-medium">No reviews yet</p>
        <p className="text-sm text-gray-400 mt-2">Complete bookings to receive reviews from clients</p>
      </div>
    );
  }

  // Calculate average rating
  const avgRating =
    reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

  return (
    <div className="space-y-6">
      {/* Average Rating */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-4">
          <div>
            <div className="text-4xl font-bold text-gray-900">{avgRating.toFixed(1)}</div>
            <p className="text-sm text-gray-500 mt-1">out of 5</p>
          </div>
          <div>
            <StarRating rating={Math.round(avgRating)} readonly size="lg" />
            <p className="text-sm text-gray-500 mt-2">{reviews.length} reviews</p>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review as any} />
        ))}
      </div>
    </div>
  );
}
