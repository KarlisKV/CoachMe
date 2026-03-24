'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import type { UserRole } from '@/types/database.types';

export async function signUp(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const fullName = formData.get('full_name') as string;
  const role = formData.get('role') as UserRole;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error || !data.user) {
    return { error: error?.message || 'Signup failed' };
  }

  // Create profile
  const { error: profileError } = await supabase.from('profiles').insert({
    id: data.user.id,
    role,
    full_name: fullName,
  });

  if (profileError) {
    return { error: profileError.message };
  }

  // Create role-specific profile
  if (role === 'coach') {
    await supabase.from('coach_profiles').insert({ id: data.user.id, sport: '' });
  } else {
    await supabase.from('client_profiles').insert({ id: data.user.id });
  }

  // Set role cookie for middleware
  const cookieStore = await cookies();
  cookieStore.set('user_role', role, {
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    httpOnly: true,
    sameSite: 'lax',
  });

  redirect(role === 'coach' ? '/coach/dashboard' : '/dashboard');
}

export async function signIn(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  // Fetch role
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'User not found' };

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile) return { error: 'Profile not found' };

  // Set role cookie
  const cookieStore = await cookies();
  cookieStore.set('user_role', profile.role, {
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
    httpOnly: true,
    sameSite: 'lax',
  });

  redirect(profile.role === 'coach' ? '/coach/dashboard' : '/dashboard');
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();

  const cookieStore = await cookies();
  cookieStore.delete('user_role');

  redirect('/');
}
