'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function addSessionNote(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const bookingId = formData.get('booking_id') as string;
  const note = formData.get('note') as string;

  if (!note || note.trim().length === 0) {
    return { error: 'Note cannot be empty' };
  }

  const { data: existingNote } = await supabase
    .from('session_notes')
    .select('id')
    .eq('booking_id', bookingId)
    .eq('coach_id', user.id)
    .single();

  if (existingNote) {
    return { error: 'Note already exists for this session' };
  }

  const { error } = await supabase
    .from('session_notes')
    .insert({
      booking_id: bookingId,
      coach_id: user.id,
      note: note.trim(),
    });

  if (error) return { error: error.message };

  revalidatePath('/coach/dashboard');
  revalidatePath(`/bookings/${bookingId}`);
  return { success: true };
}

export async function updateSessionNote(noteId: string, note: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  if (!note || note.trim().length === 0) {
    return { error: 'Note cannot be empty' };
  }

  const { error } = await supabase
    .from('session_notes')
    .update({ note: note.trim(), updated_at: new Date().toISOString() })
    .eq('id', noteId)
    .eq('coach_id', user.id);

  if (error) return { error: error.message };

  revalidatePath('/coach/dashboard');
  return { success: true };
}

export async function markSessionCompleted(bookingId: string, role: 'coach' | 'client') {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const updateData: Record<string, boolean | string> = {
    ...(role === 'coach' ? { completed_by_coach: true } : { completed_by_client: true }),
  };

  const { data: booking, error: fetchError } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', bookingId)
    .single();

  if (fetchError || !booking) return { error: 'Booking not found' };

  const willBothComplete =
    (role === 'coach' && booking.completed_by_client) ||
    (role === 'client' && booking.completed_by_coach);

  if (willBothComplete) {
    updateData.status = 'completed';
    updateData.completed_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from('bookings')
    .update(updateData)
    .eq('id', bookingId);

  if (error) return { error: error.message };

  revalidatePath('/dashboard');
  revalidatePath('/coach/dashboard');
  return { success: true };
}
