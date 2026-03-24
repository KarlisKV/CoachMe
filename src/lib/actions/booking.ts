'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createBooking(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const coachId = formData.get('coach_id') as string;
  const slotDate = formData.get('slot_date') as string;
  const startTime = formData.get('start_time') as string;
  const endTime = formData.get('end_time') as string;

  const { data, error } = await supabase.rpc('create_booking', {
    p_client_id: user.id,
    p_coach_id: coachId,
    p_slot_date: slotDate,
    p_start_time: startTime,
    p_end_time: endTime,
  });

  if (error) return { error: error.message };

  revalidatePath('/dashboard');
  revalidatePath(`/coaches/${coachId}`);
  return { success: true, bookingId: data };
}

export async function updateBookingStatus(bookingId: string, status: 'confirmed' | 'cancelled') {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { error } = await supabase
    .from('bookings')
    .update({ status })
    .eq('id', bookingId);

  if (error) return { error: error.message };

  revalidatePath('/dashboard');
  revalidatePath('/coach/dashboard');
  return { success: true };
}
