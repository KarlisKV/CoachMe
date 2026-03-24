'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function submitReview(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const bookingId = formData.get('booking_id') as string;
  const coachId = formData.get('coach_id') as string;
  const rating = Number(formData.get('rating') as string);
  const comment = formData.get('comment') as string;

  if (!bookingId || !coachId || !rating) {
    return { error: 'Missing required fields' };
  }

  if (rating < 1 || rating > 5) {
    return { error: 'Rating must be between 1 and 5' };
  }

  // Verify booking exists and belongs to this client
  const { data: booking } = await supabase
    .from('bookings')
    .select('id, status, client_id')
    .eq('id', bookingId)
    .single();

  if (!booking) return { error: 'Booking not found' };
  if (booking.client_id !== user.id) return { error: 'Not authorized' };
  if (booking.status !== 'completed') return { error: 'Can only review completed bookings' };

  // Check if review already exists
  const { data: existingReview } = await supabase
    .from('reviews')
    .select('id')
    .eq('booking_id', bookingId)
    .single();

  if (existingReview) return { error: 'Review already submitted for this booking' };

  // Create review
  const { error: reviewError } = await supabase
    .from('reviews')
    .insert({
      booking_id: bookingId,
      client_id: user.id,
      coach_id: coachId,
      rating,
      comment: comment || null,
    });

  if (reviewError) return { error: reviewError.message };

  revalidatePath(`/coaches/${coachId}`);
  revalidatePath('/dashboard');
  return { success: true };
}

export async function respondToReview(reviewId: string, response: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  // Get review to check coach_id
  const { data: review } = await supabase
    .from('reviews')
    .select('coach_id')
    .eq('id', reviewId)
    .single();

  if (!review) return { error: 'Review not found' };
  if (review.coach_id !== user.id) return { error: 'Not authorized' };

  // Update review with coach response
  const { error: updateError } = await supabase
    .from('reviews')
    .update({ coach_response: response })
    .eq('id', reviewId);

  if (updateError) return { error: updateError.message };

  revalidatePath(`/coaches/${user.id}`);
  return { success: true };
}
