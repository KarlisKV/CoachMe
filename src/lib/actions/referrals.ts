'use server';

import { createClient } from '@/lib/supabase/server';

export async function applyReferralCode(code: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  // Check if code already applied to this user
  const { data: existingReferral } = await supabase
    .from('referrals')
    .select('id')
    .eq('referee_id', user.id)
    .single();

  if (existingReferral) {
    throw new Error('You have already used a referral code');
  }

  // Validate code exists
  const { data: referrerProfile, error: fetchError } = await supabase
    .from('profiles')
    .select('id')
    .eq('referral_code', code)
    .single();

  if (fetchError || !referrerProfile) {
    throw new Error('Invalid referral code');
  }

  if (referrerProfile.id === user.id) {
    throw new Error('Cannot use your own referral code');
  }

  // Create referral record
  const { error: referralError } = await supabase
    .from('referrals')
    .insert({
      referrer_id: referrerProfile.id,
      referee_id: user.id,
      referral_code: code,
      status: 'pending',
    });

  if (referralError) throw new Error(referralError.message);

  // Update referred_by on profile
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ referred_by: referrerProfile.id })
    .eq('id', user.id);

  if (profileError) throw new Error(profileError.message);
}

export async function getReferralStats() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  // Get user's profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('referral_code')
    .eq('id', user.id)
    .single();

  if (profileError) throw new Error(profileError.message);

  // Count successful referrals
  const { data: referrals, error: referralError } = await supabase
    .from('referrals')
    .select('id')
    .eq('referrer_id', user.id)
    .eq('status', 'completed');

  if (referralError) throw new Error(referralError.message);

  return {
    referralCode: profile?.referral_code,
    successfulReferrals: referrals?.length || 0,
  };
}

export async function generateReferralCode() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  // Check if already has code
  const { data: profile } = await supabase
    .from('profiles')
    .select('referral_code')
    .eq('id', user.id)
    .single();

  if (profile?.referral_code) {
    return profile.referral_code;
  }

  // Generate unique code
  const code = 'REF-' + Math.random().toString(36).substring(2, 10).toUpperCase();

  const { error } = await supabase
    .from('profiles')
    .update({ referral_code: code })
    .eq('id', user.id);

  if (error) throw new Error(error.message);

  return code;
}
