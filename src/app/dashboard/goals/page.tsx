import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import GoalCard from '@/components/goals/GoalCard';
import CreateGoalForm from '@/components/goals/CreateGoalForm';
import Link from 'next/link';

export default async function ClientGoalsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: goals } = await supabase
    .from('goals')
    .select('*, coach_profiles!inner(*, profiles!inner(full_name))')
    .eq('client_id', user.id)
    .order('created_at', { ascending: false });

  // Fetch coaches for assignment
  const { data: coaches } = await supabase
    .from('coach_profiles')
    .select('id, profiles!inner(full_name)')
    .limit(50);

  const coachOptions = coaches?.map((c) => ({
    id: c.id,
    name: (c.profiles as any).full_name,
  })) || [];

  const inProgressGoals = goals?.filter((g) => g.status === 'in_progress') || [];
  const achievedGoals = goals?.filter((g) => g.status === 'achieved') || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">My Goals</h1>
            <p className="text-gray-500 mt-1">Track and manage your fitness goals</p>
          </div>
          <Link
            href="/dashboard"
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            ← Back to Dashboard
          </Link>
        </div>

        <div className="mb-6">
          <CreateGoalForm coaches={coachOptions} />
        </div>

        {/* In Progress Goals */}
        {inProgressGoals.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              In Progress ({inProgressGoals.length})
            </h2>
            <div className="space-y-3">
              {inProgressGoals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  coachName={
                    goal.coach_profiles?.[0]?.profiles?.full_name
                  }
                />
              ))}
            </div>
          </div>
        )}

        {/* Achieved Goals */}
        {achievedGoals.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Achieved ({achievedGoals.length})
            </h2>
            <div className="space-y-3">
              {achievedGoals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  coachName={
                    goal.coach_profiles?.[0]?.profiles?.full_name
                  }
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {goals?.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-500">
            <p className="text-lg">No goals yet</p>
            <p className="text-sm mt-2">Create your first goal to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}
