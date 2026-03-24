'use server';

import { createClient } from '@/lib/supabase/server';
import type { Goal } from '@/types/database.types';

export async function createGoal(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const coachId = formData.get('coach_id') as string | null;

  if (!title) throw new Error('Title is required');

  const { data, error } = await supabase
    .from('goals')
    .insert({
      client_id: user.id,
      coach_id: coachId || null,
      title,
      description: description || null,
      status: 'in_progress',
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Goal;
}

export async function updateGoalStatus(
  goalId: string,
  status: 'in_progress' | 'achieved'
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  // Check goal ownership (either client or coach can update)
  const { data: goal, error: fetchError } = await supabase
    .from('goals')
    .select('client_id, coach_id')
    .eq('id', goalId)
    .single();

  if (fetchError || !goal) throw new Error('Goal not found');
  if (goal.client_id !== user.id && goal.coach_id !== user.id) {
    throw new Error('Unauthorized');
  }

  const updateData: any = { status };
  if (status === 'achieved') {
    updateData.achieved_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('goals')
    .update(updateData)
    .eq('id', goalId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Goal;
}

export async function deleteGoal(goalId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  // Check goal ownership (only client can delete)
  const { data: goal, error: fetchError } = await supabase
    .from('goals')
    .select('client_id')
    .eq('id', goalId)
    .single();

  if (fetchError || !goal) throw new Error('Goal not found');
  if (goal.client_id !== user.id) {
    throw new Error('Unauthorized');
  }

  const { error } = await supabase
    .from('goals')
    .delete()
    .eq('id', goalId);

  if (error) throw new Error(error.message);
}

export async function getClientGoals() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data, error } = await supabase
    .from('goals')
    .select('*, coach_profiles!inner(*, profiles!inner(full_name))')
    .eq('client_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
}
