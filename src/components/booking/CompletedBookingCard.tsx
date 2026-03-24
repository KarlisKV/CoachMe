'use client';

import { useState } from 'react';
import type { BookingWithCoach, Review } from '@/types/database.types';
import ReviewForm from '@/components/reviews/ReviewForm';
import ReviewCard from '@/components/reviews/ReviewCard';

interface Props {
  booking: BookingWithCoach;
  existingReview?: Review | null;
}

export default function CompletedBookingCard({ booking, existingReview }: Props) {
  const [showReviewForm, setShowReviewForm] = useState(false);

  const coachName = booking.coach_profiles.profiles.full_name;
  const coachAvatar = booking.coach_profiles.profiles.avatar_url;
  const bookingDate = new Date(booking.slot_date).toLocaleDateString();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
      {/* Booking Info */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden shrink-0">
            {coachAvatar ? (
              <img src={coachAvatar} alt={coachName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm font-medium">
                {coachName.charAt(0)}
              </div>
            )}
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">{coachName}</h4>
            <p className="text-sm text-gray-500">
              {booking.coach_profiles.sport && <span>{booking.coach_profiles.sport} • </span>}
              {bookingDate} at {booking.start_time.slice(0, 5)}
            </p>
          </div>
        </div>
        <span className="inline-block bg-green-100 text-green-700 text-xs font-medium px-3 py-1 rounded-full">
          Completed
        </span>
      </div>

      {/* Existing Review or Form */}
      {existingReview ? (
        <div>
          <h5 className="text-sm font-semibold text-gray-700 mb-3">Your Review</h5>
          <ReviewCard review={existingReview as any} />
        </div>
      ) : (
        <>
          {showReviewForm ? (
            <div>
              <h5 className="text-sm font-semibold text-gray-700 mb-3">Leave a Review</h5>
              <ReviewForm
                bookingId={booking.id}
                coachId={booking.coach_id}
                onSuccess={() => {
                  setShowReviewForm(false);
                  // Force page reload to show updated review
                  window.location.reload();
                }}
              />
            </div>
          ) : (
            <button
              onClick={() => setShowReviewForm(true)}
              className="text-sm text-blue-600 hover:underline font-medium"
            >
              Leave a Review
            </button>
          )}
        </>
      )}
    </div>
  );
}
