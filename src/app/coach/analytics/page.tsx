import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import StatCard from '@/components/analytics/StatCard';
import AnalyticsChart from '@/components/analytics/AnalyticsChart';

export default async function CoachAnalyticsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Fetch coach profile
  const { data: coachProfile } = await supabase
    .from('coach_profiles')
    .select('hourly_rate')
    .eq('id', user.id)
    .single();

  // Total bookings (all time)
  const { data: allBookings, count: totalBookings } = await supabase
    .from('bookings')
    .select('*', { count: 'exact' })
    .eq('coach_id', user.id);

  // Completed sessions
  const completedSessions = allBookings?.filter(
    (b) => b.status === 'completed'
  ).length || 0;

  // Profile views (from coach_analytics table)
  const { data: analyticsData } = await supabase
    .from('coach_analytics')
    .select('profile_views')
    .eq('coach_id', user.id);

  const totalProfileViews = analyticsData?.reduce(
    (sum, a) => sum + (a.profile_views || 0),
    0
  ) || 0;

  // Average rating from reviews
  const { data: reviews } = await supabase
    .from('reviews')
    .select('rating')
    .eq('coach_id', user.id);

  const avgRating =
    reviews && reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : 'N/A';

  // Bookings over last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

  const { data: recentBookings } = await supabase
    .from('bookings')
    .select('slot_date')
    .eq('coach_id', user.id)
    .gte('slot_date', thirtyDaysAgoStr);

  // Group bookings by date
  const bookingsByDate: { [key: string]: number } = {};
  recentBookings?.forEach((b) => {
    bookingsByDate[b.slot_date] =
      (bookingsByDate[b.slot_date] || 0) + 1;
  });

  const chartData = Object.entries(bookingsByDate)
    .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
    .slice(-14) // Last 14 days
    .map(([date, count]) => ({
      label: new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      value: count,
    }));

  // Recent reviews
  const { data: recentReviews } = await supabase
    .from('reviews')
    .select('*, client_profiles!inner(*, profiles!inner(full_name))')
    .eq('coach_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5);

  // Revenue estimate
  const hourlyRate = coachProfile?.hourly_rate || 0;
  const estimatedRevenue = completedSessions * hourlyRate;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Analytics</h1>
            <p className="text-gray-500 mt-1">Your coaching performance insights</p>
          </div>
          <Link
            href="/coach/dashboard"
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            ← Back to Dashboard
          </Link>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Total Bookings"
            value={totalBookings || 0}
            icon="📅"
          />
          <StatCard
            label="Completed Sessions"
            value={completedSessions}
            icon="✅"
          />
          <StatCard
            label="Profile Views"
            value={totalProfileViews}
            icon="👁️"
          />
          <StatCard
            label="Average Rating"
            value={avgRating}
            icon="⭐"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Bookings Chart */}
          <AnalyticsChart
            data={chartData}
            title="Bookings Over Last 30 Days"
          />

          {/* Revenue Estimate */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Revenue Estimate</h3>
            <div className="space-y-4">
              <div>
                <p className="text-gray-600 text-sm">Completed Sessions</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {completedSessions}
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Hourly Rate</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  €{hourlyRate.toFixed(2)}
                </p>
              </div>
              <div className="pt-4 border-t border-gray-200">
                <p className="text-gray-600 text-sm">Estimated Total Revenue</p>
                <p className="text-3xl font-bold text-green-600 mt-1">
                  €{estimatedRevenue.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Recent Reviews</h3>
          {recentReviews && recentReviews.length > 0 ? (
            <div className="space-y-4">
              {recentReviews.map((review) => (
                <div
                  key={review.id}
                  className="pb-4 border-b border-gray-200 last:border-b-0"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-gray-900">
                        {(review.client_profiles as any).profiles.full_name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(review.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="text-lg">
                      {'⭐'.repeat(review.rating)}
                    </span>
                  </div>
                  {review.comment && (
                    <p className="text-gray-600 text-sm">{review.comment}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No reviews yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
