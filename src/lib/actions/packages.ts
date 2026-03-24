'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createPackage(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const sport = formData.get('sport') as string;
  const sessionCount = parseInt(formData.get('session_count') as string);
  const price = parseInt(formData.get('price') as string);

  const { data, error } = await supabase
    .from('packages')
    .insert({
      coach_id: user.id,
      title,
      description,
      sport,
      session_count: sessionCount,
      price,
      is_active: true,
    })
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath('/coach/packages');
  return { success: true, packageId: data.id };
}

export async function updatePackage(packageId: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  // Verify coach owns this package
  const { data: pkg } = await supabase
    .from('packages')
    .select('coach_id')
    .eq('id', packageId)
    .single();

  if (!pkg || pkg.coach_id !== user.id) {
    return { error: 'Unauthorized' };
  }

  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const sport = formData.get('sport') as string;
  const sessionCount = parseInt(formData.get('session_count') as string);
  const price = parseInt(formData.get('price') as string);

  const { error } = await supabase
    .from('packages')
    .update({
      title,
      description,
      sport,
      session_count: sessionCount,
      price,
    })
    .eq('id', packageId);

  if (error) return { error: error.message };

  revalidatePath('/coach/packages');
  return { success: true };
}

export async function togglePackageActive(packageId: string, isActive: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  // Verify coach owns this package
  const { data: pkg } = await supabase
    .from('packages')
    .select('coach_id')
    .eq('id', packageId)
    .single();

  if (!pkg || pkg.coach_id !== user.id) {
    return { error: 'Unauthorized' };
  }

  const { error } = await supabase
    .from('packages')
    .update({ is_active: isActive })
    .eq('id', packageId);

  if (error) return { error: error.message };

  revalidatePath('/coach/packages');
  return { success: true };
}

export async function purchasePackage(packageId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  // Get package details
  const { data: pkg } = await supabase
    .from('packages')
    .select('session_count')
    .eq('id', packageId)
    .single();

  if (!pkg) {
    return { error: 'Package not found' };
  }

  const { data, error } = await supabase
    .from('package_purchases')
    .insert({
      package_id: packageId,
      client_id: user.id,
      sessions_remaining: pkg.session_count,
    })
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath('/dashboard');
  return { success: true, purchaseId: data.id };
}

export async function usePackageSession(purchaseId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  // Verify user owns this purchase
  const { data: purchase } = await supabase
    .from('package_purchases')
    .select('client_id, sessions_remaining')
    .eq('id', purchaseId)
    .single();

  if (!purchase || purchase.client_id !== user.id) {
    return { error: 'Unauthorized' };
  }

  if (purchase.sessions_remaining <= 0) {
    return { error: 'No sessions remaining in package' };
  }

  const { error } = await supabase
    .from('package_purchases')
    .update({
      sessions_remaining: purchase.sessions_remaining - 1,
    })
    .eq('id', purchaseId);

  if (error) return { error: error.message };

  revalidatePath('/dashboard');
  return { success: true };
}
