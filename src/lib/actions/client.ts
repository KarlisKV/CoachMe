'use server';

import { createClient } from '@/lib/supabase/server';
import { uploadAvatar } from './coach';

export { uploadAvatar };

export async function updateClientProfile(formData: FormData) {
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

  const { error: profileError } = await supabase
    .from('profiles')
    .update(profileData)
    .eq('id', user.id);

  if (profileError) return { error: profileError.message };

  const { error: clientError } = await supabase
    .from('client_profiles')
    .update(clientData)
    .eq('id', user.id);

  if (clientError) return { error: clientError.message };

  return { success: true };
}
