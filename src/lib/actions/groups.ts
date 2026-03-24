'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { GroupSessionStatus } from '@/types/database.types';

export async function createGroupSession(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const sport = formData.get('sport') as string;
  const maxParticipants = parseInt(formData.get('max_participants') as string);
  const pricePerPerson = parseInt(formData.get('price_per_person') as string);
  const location = formData.get('location') as string;
  const sessionDate = formData.get('session_date') as string;
  const startTime = formData.get('start_time') as string;
  const endTime = formData.get('end_time') as string;

  const { data, error } = await supabase
    .from('group_sessions')
    .insert({
      coach_id: user.id,
      title,
      description,
      sport,
      max_participants: maxParticipants,
      price_per_person: pricePerPerson,
      location,
      session_date: sessionDate,
      start_time: startTime,
      end_time: endTime,
      status: 'open',
    })
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath('/groups');
  revalidatePath('/coach/groups');
  return { success: true, sessionId: data.id };
}

export async function joinGroupSession(sessionId: string, paymentMethod: 'cash' | 'card' | null) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  // Check if already registered
  const { data: existing } = await supabase
    .from('group_session_participants')
    .select('id')
    .eq('group_session_id', sessionId)
    .eq('client_id', user.id)
    .eq('status', 'registered')
    .single();

  if (existing) {
    return { error: 'Already registered for this session' };
  }

  // Check session capacity
  const { data: session } = await supabase
    .from('group_sessions')
    .select('max_participants')
    .eq('id', sessionId)
    .single();

  if (!session) {
    return { error: 'Session not found' };
  }

  const { data: participants } = await supabase
    .from('group_session_participants')
    .select('id', { count: 'exact' })
    .eq('group_session_id', sessionId)
    .eq('status', 'registered');

  const currentCount = participants?.length || 0;
  if (currentCount >= session.max_participants) {
    // Update session status to full
    await supabase
      .from('group_sessions')
      .update({ status: 'full' })
      .eq('id', sessionId);
    return { error: 'Session is full' };
  }

  // Add participant
  const { data, error } = await supabase
    .from('group_session_participants')
    .insert({
      group_session_id: sessionId,
      client_id: user.id,
      status: 'registered',
      payment_method: paymentMethod,
    })
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath('/groups');
  revalidatePath(`/groups/${sessionId}`);
  return { success: true, participantId: data.id };
}

export async function cancelGroupSession(sessionId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  // Verify coach owns this session
  const { data: session } = await supabase
    .from('group_sessions')
    .select('coach_id')
    .eq('id', sessionId)
    .single();

  if (!session || session.coach_id !== user.id) {
    return { error: 'Unauthorized' };
  }

  const { error } = await supabase
    .from('group_sessions')
    .update({ status: 'cancelled' })
    .eq('id', sessionId);

  if (error) return { error: error.message };

  revalidatePath('/groups');
  revalidatePath('/coach/groups');
  revalidatePath(`/groups/${sessionId}`);
  return { success: true };
}

export async function leaveGroupSession(sessionId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { error } = await supabase
    .from('group_session_participants')
    .update({ status: 'cancelled' })
    .eq('group_session_id', sessionId)
    .eq('client_id', user.id)
    .eq('status', 'registered');

  if (error) return { error: error.message };

  revalidatePath('/groups');
  revalidatePath(`/groups/${sessionId}`);
  return { success: true };
}
