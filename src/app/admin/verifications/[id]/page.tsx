import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import VerificationReviewCard from '@/components/admin/VerificationReviewCard';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function VerificationDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Check if user is admin
  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('id')
    .eq('id', user.id)
    .single();

  if (!adminUser) redirect('/');

  // Fetch verification request with coach profile
  const { data: verification } = await supabase
    .from('verification_requests')
    .select(
      `
      id,
      coach_id,
      id_document_url,
      certification_urls,
      notes,
      status,
      rejection_reason,
      created_at,
      coach_profiles!inner(
        sport,
        profiles!inner(full_name)
      )
      `
    )
    .eq('id', id)
    .single();

  if (!verification || verification.status !== 'pending') {
    redirect('/admin/verifications');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-8">
          <a
            href="/admin/verifications"
            className="text-blue-600 hover:underline text-sm font-medium mb-4 inline-block"
          >
            ← Back to verifications
          </a>
          <h1 className="text-3xl font-bold text-gray-900">Review Verification Request</h1>
        </div>

        <VerificationReviewCard
          request={verification as any}
          onReviewed={() => redirect('/admin/verifications')}
        />
      </div>
    </div>
  );
}
