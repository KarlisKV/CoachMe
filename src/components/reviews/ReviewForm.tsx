'use client';

import { useState } from 'react';
import { submitReview } from '@/lib/actions/reviews';
import StarRating from './StarRating';

interface Props {
  bookingId: string;
  coachId: string;
  onSuccess?: () => void;
}

export default function ReviewForm({ bookingId, coachId, onSuccess }: Props) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('booking_id', bookingId);
    formData.append('coach_id', coachId);
    formData.append('rating', String(rating));
    formData.append('comment', comment);

    const result = await submitReview(formData);
    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      onSuccess?.();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Rating
        </label>
        <StarRating rating={rating} onRate={setRating} />
        {rating === 0 && (
          <p className="text-xs text-gray-500 mt-2">Click a star to rate</p>
        )}
      </div>

      <div>
        <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
          Comment (Optional)
        </label>
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 placeholder:text-gray-500"
          placeholder="Share your experience..."
        />
      </div>

      <button
        type="submit"
        disabled={loading || rating === 0}
        className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
      >
        {loading ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  );
}
