'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function toggleFavorite(coachId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  // Check if favorite already exists
  const { data: existing } = await supabase
    .from('favorites')
    .select('id')
    .eq('client_id', user.id)
    .eq('coach_id', coachId)
    .single();

  if (existing) {
    // Remove favorite
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('id', existing.id);

    if (error) return { error: error.message };
    revalidatePath('/dashboard/favorites');
    revalidatePath(`/coaches/${coachId}`);
    return { success: true, favorited: false };
  } else {
    // Add favorite
    const { error } = await supabase
      .from('favorites')
      .insert({
        client_id: user.id,
        coach_id: coachId,
      });

    if (error) return { error: error.message };
    revalidatePath('/dashboard/favorites');
    revalidatePath(`/coaches/${coachId}`);
    return { success: true, favorited: true };
  }
}

export async function getFavorites() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('favorites')
    .select(
      '*, coach_profiles!inner(*, profiles!inner(id, full_name, avatar_url))'
    )
    .eq('client_id', user.id)
    .order('created_at', { ascending: false });

  if (error) return { error: error.message };
  return { data: data || [] };
}

export async function isFavorited(coachId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .from('favorites')
    .select('id')
    .eq('client_id', user.id)
    .eq('coach_id', coachId)
    .single();

  return !!data;
}
