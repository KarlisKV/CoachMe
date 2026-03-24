'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { v4 as uuidv4 } from 'uuid';

export async function createRecurringBooking(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const coachId = formData.get('coach_id') as string;
  const dayOfWeek = parseInt(formData.get('day_of_week') as string);
  const startTime = formData.get('start_time') as string;
  const endTime = formData.get('end_time') as string;
  const weeks = parseInt(formData.get('weeks') as string);

  if (!coachId || dayOfWeek === undefined || !startTime || !endTime || !weeks) {
    return { error: 'Missing required fields' };
  }

  // Generate recurring booking ID
  const recurringBookingId = uuidv4();

  // Calculate dates
  const today = new Date();
  const bookingIds: string[] = [];

  for (let i = 0; i < weeks; i++) {
    // Calculate the next occurrence of the specified day
    const nextDate = new Date(today);
    const daysUntilTarget = (dayOfWeek - nextDate.getDay() + 7) % 7 || 7;
    nextDate.setDate(today.getDate() + daysUntilTarget + i * 7);

    const slotDate = nextDate.toISOString().split('T')[0];

    // Create booking using RPC
    const { data, error } = await supabase.rpc('create_booking', {
      p_client_id: user.id,
      p_coach_id: coachId,
      p_slot_date: slotDate,
      p_start_time: startTime,
      p_end_time: endTime,
    });

    if (error) {
      console.error(`Error creating booking for ${slotDate}:`, error);
      continue;
    }

    if (data) {
      bookingIds.push(data);
    }
  }

  if (bookingIds.length === 0) {
    return { error: 'Failed to create recurring bookings' };
  }

  // Update bookings to mark them as recurring
  for (const bookingId of bookingIds) {
    await supabase
      .from('bookings')
      .update({
        is_recurring: true,
        recurring_booking_id: recurringBookingId,
      })
      .eq('id', bookingId);
  }

  revalidatePath('/dashboard');
  revalidatePath(`/coaches/${coachId}`);
  return { success: true, recurringBookingId, createdCount: bookingIds.length };
}

export async function cancelRecurringBooking(recurringBookingId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  // Get all bookings with this recurring ID
  const { data: bookings } = await supabase
    .from('bookings')
    .select('id, slot_date, client_id')
    .eq('recurring_booking_id', recurringBookingId);

  if (!bookings || bookings.length === 0) {
    return { error: 'No recurring bookings found' };
  }

  // Verify user owns these bookings
  const today = new Date().toISOString().split('T')[0];
  const futureBookings = bookings.filter((b) => b.slot_date >= today && b.client_id === user.id);

  if (futureBookings.length === 0) {
    return { error: 'No future bookings to cancel' };
  }

  // Cancel future bookings
  const { error } = await supabase
    .from('bookings')
    .update({ status: 'cancelled' })
    .in('id', futureBookings.map((b) => b.id));

  if (error) return { error: error.message };

  revalidatePath('/dashboard');
  return { success: true, cancelledCount: futureBookings.length };
}
