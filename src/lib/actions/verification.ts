'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { sendEmail } from '@/lib/email/resend';
import { verificationStatusEmail } from '@/lib/email/templates';

export async function submitVerification(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const file = formData.get('id_document') as File;
  if (!file || file.size === 0) return { error: 'ID document is required' };

  const certificationUrls = formData.get('certification_urls') as string;
  const notes = formData.get('notes') as string;

  // Upload ID document to verification-docs bucket
  const ext = file.name.split('.').pop();
  const filePath = `${user.id}/${Date.now()}-id.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('verification-docs')
    .upload(filePath, file);

  if (uploadError) return { error: uploadError.message };

  // Get the file URL (it's a private bucket, so we use the path)
  const id_document_url = filePath;

  // Parse certification URLs if provided
  const certURLs = certificationUrls
    ? certificationUrls.split('\n').map(url => url.trim()).filter(Boolean)
    : [];

  // Create verification request
  const { error: verificationError } = await supabase
    .from('verification_requests')
    .insert({
      coach_id: user.id,
      id_document_url,
      certification_urls: certURLs,
      notes: notes || null,
      status: 'pending',
    });

  if (verificationError) return { error: verificationError.message };

  // Update coach profile verification status
  const { error: updateError } = await supabase
    .from('coach_profiles')
    .update({ verification_status: 'pending' })
    .eq('id', user.id);

  if (updateError) return { error: updateError.message };

  revalidatePath('/coach/dashboard');
  return { success: true };
}

export async function reviewVerification(
  requestId: string,
  decision: 'approved' | 'rejected',
  rejectionReason?: string
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  // Check if user is admin
  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('id')
    .eq('id', user.id)
    .single();

  if (!adminUser) return { error: 'Not authorized' };

  // Get the verification request to find the coach
  const { data: verification } = await supabase
    .from('verification_requests')
    .select('coach_id')
    .eq('id', requestId)
    .single();

  if (!verification) return { error: 'Verification request not found' };

  // Update verification request
  const { error: updateError } = await supabase
    .from('verification_requests')
    .update({
      status: decision,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      rejection_reason: decision === 'rejected' ? (rejectionReason || null) : null,
    })
    .eq('id', requestId);

  if (updateError) return { error: updateError.message };

  // Update coach profile verification status
  const { error: coachUpdateError } = await supabase
    .from('coach_profiles')
    .update({ verification_status: decision === 'approved' ? 'verified' : 'rejected' })
    .eq('id', verification.coach_id);

  if (coachUpdateError) return { error: coachUpdateError.message };

  // Send verification status email
  const { data: coachProfile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', verification.coach_id)
    .single();

  const { data: coachAuth } = await supabase.auth.admin.getUserById(verification.coach_id);

  if (coachProfile && coachAuth?.user?.email) {
    const html = verificationStatusEmail({
      coachName: coachProfile.full_name,
      status: decision,
      reason: rejectionReason,
    });

    await sendEmail({
      to: coachAuth.user.email,
      subject: `Verification ${decision === 'approved' ? 'Approved' : 'Rejected'}`,
      html,
    });
  }

  revalidatePath('/admin/verifications');
  return { success: true };
}
