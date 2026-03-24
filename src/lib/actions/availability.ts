'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function addAvailabilitySlot(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const dayOfWeek = Number(formData.get('day_of_week'));
  const startTime = formData.get('start_time') as string;
  const endTime = formData.get('end_time') as string;

  if (startTime >= endTime) {
    return { error: 'End time must be after start time' };
  }

  const { error } = await supabase.from('availability_slots').insert({
    coach_id: user.id,
    day_of_week: dayOfWeek,
    start_time: startTime,
    end_time: endTime,
    is_recurring: true,
  });

  if (error) return { error: error.message };

  revalidatePath('/coach/availability');
  return { success: true };
}

export async function deleteAvailabilitySlot(slotId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { error } = await supabase
    .from('availability_slots')
    .delete()
    .eq('id', slotId)
    .eq('coach_id', user.id);

  if (error) return { error: error.message };

  revalidatePath('/coach/availability');
  return { success: true };
}
