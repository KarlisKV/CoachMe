'use server';

import { createClient } from '@/lib/supabase/server';

export async function updateCoachProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const profileData = {
    full_name: formData.get('full_name') as string,
    bio: formData.get('bio') as string,
  };

  // Handle sports array
  const sportsInput = formData.get('sports') as string;
  const sports = sportsInput
    ? sportsInput.split(',').map((s) => s.trim()).filter(Boolean)
    : [];

  const coachData = {
    sport: formData.get('sport') as string,
    sports,
    specialty: formData.get('specialty') as string,
    description: formData.get('description') as string,
    hourly_rate: formData.get('hourly_rate') ? Number(formData.get('hourly_rate')) : null,
    contact_email: formData.get('contact_email') as string,
    contact_phone: formData.get('contact_phone') as string,
    location: formData.get('location') as string,
    experience_years: formData.get('experience_years') ? Number(formData.get('experience_years')) : null,
    payment_methods: (formData.get('payment_methods') as string) || 'both',
  };

  const { error: profileError } = await supabase
    .from('profiles')
    .update(profileData)
    .eq('id', user.id);

  if (profileError) return { error: profileError.message };

  const { error: coachError } = await supabase
    .from('coach_profiles')
    .update(coachData)
    .eq('id', user.id);

  if (coachError) return { error: coachError.message };

  return { success: true };
}

export async function uploadAvatar(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const file = formData.get('avatar') as File;
  if (!file || file.size === 0) return { error: 'No file provided' };

  const ext = file.name.split('.').pop();
  const filePath = `${user.id}/avatar.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, { upsert: true });

  if (uploadError) return { error: uploadError.message };

  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath);

  await supabase
    .from('profiles')
    .update({ avatar_url: publicUrl })
    .eq('id', user.id);

  return { success: true, url: publicUrl };
}
