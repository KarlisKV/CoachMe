import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import PackageCard from '@/components/packages/PackageCard';
import CreatePackageForm from '@/components/packages/CreatePackageForm';

export default async function CoachPackagesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: packages } = await supabase
    .from('packages')
    .select('*')
    .eq('coach_id', user.id)
    .order('created_at', { ascending: false });

  const activePackages = (packages || []).filter((p) => p.is_active);
  const inactivePackages = (packages || []).filter((p) => !p.is_active);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Packages</h1>
            <p className="text-gray-600 mt-1">Create and manage coaching packages</p>
          </div>
        </div>

        {/* Create Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">Create New Package</h2>
          <CreatePackageForm />
        </div>

        {/* Active Packages */}
        {activePackages.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Active Packages</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activePackages.map((pkg) => (
                <PackageCard key={pkg.id} package={pkg} isOwner={true} />
              ))}
            </div>
          </div>
        )}

        {/* Inactive Packages */}
        {inactivePackages.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 text-gray-600">Inactive Packages</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-60">
              {inactivePackages.map((pkg) => (
                <PackageCard key={pkg.id} package={pkg} isOwner={true} />
              ))}
            </div>
          </div>
        )}

        {packages && packages.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <p className="text-gray-500 text-lg">No packages yet</p>
            <p className="text-gray-400 text-sm mt-2">Create your first package above</p>
          </div>
        )}
      </div>
    </div>
  );
}
