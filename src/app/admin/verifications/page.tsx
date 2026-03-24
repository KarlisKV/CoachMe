import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function AdminVerificationsPage() {
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

  // Fetch pending verification requests
  const { data: verifications } = await supabase
    .from('verification_requests')
    .select(
      `
      id,
      created_at,
      coach_id,
      coach_profiles!inner(
        sport,
        profiles!inner(full_name)
      )
      `
    )
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Verification Requests</h1>
          <p className="text-gray-600 mt-1">Review pending coach verification requests</p>
        </div>

        {verifications && verifications.length > 0 ? (
          <div className="space-y-4">
            {verifications.map((verification) => (
              <Link
                key={verification.id}
                href={`/admin/verifications/${verification.id}`}
                className="block"
              >
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">
                        {(verification.coach_profiles as any).profiles.full_name}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Sport: {(verification.coach_profiles as any).sport}
                      </p>
                      <p className="text-sm text-gray-500">
                        Submitted: {new Date(verification.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="inline-block bg-yellow-100 text-yellow-700 text-xs font-medium px-3 py-1 rounded-full">
                        Pending Review
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <p className="text-gray-500 font-medium">No pending verification requests</p>
            <p className="text-sm text-gray-400 mt-2">All coaches have been reviewed</p>
          </div>
        )}
      </div>
    </div>
  );
}
