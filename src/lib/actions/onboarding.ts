'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function completeCoachOnboarding(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const profileData = {
    full_name: formData.get('full_name') as string,
    bio: formData.get('bio') as string,
  };

  const coachData = {
    sport: formData.get('sport') as string,
    specialty: formData.get('specialty') as string,
    location: formData.get('location') as string,
    hourly_rate: formData.get('hourly_rate') ? Number(formData.get('hourly_rate')) : null,
    description: formData.get('description') as string,
    contact_email: formData.get('contact_email') as string,
    contact_phone: formData.get('contact_phone') as string,
  };

  // Update profile
  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      ...profileData,
      onboarding_completed: true,
    })
    .eq('id', user.id);

  if (profileError) return { error: profileError.message };

  // Update coach profile
  const { error: coachError } = await supabase
    .from('coach_profiles')
    .update(coachData)
    .eq('id', user.id);

  if (coachError) return { error: coachError.message };

  revalidatePath('/coach/dashboard');
  return { success: true };
}

export async function completeClientOnboarding(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const profileData = {
    full_name: formData.get('full_name') as string,
    bio: formData.get('bio') as string,
  };

  const clientData = {
    skill_level: formData.get('skill_level') as string || null,
    sports_interests: (formData.get('sports_interests') as string)
      ?.split(',')
      .map(s => s.trim())
      .filter(Boolean) || [],
  };

  // Update profile
  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      ...profileData,
      onboarding_completed: true,
    })
    .eq('id', user.id);

  if (profileError) return { error: profileError.message };

  // Update client profile
  const { error: clientError } = await supabase
    .from('client_profiles')
    .update(clientData)
    .eq('id', user.id);

  if (clientError) return { error: clientError.message };

  revalidatePath('/dashboard');
  return { success: true };
}
