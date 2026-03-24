import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import AvailabilityCalendar from '@/components/coach/AvailabilityCalendar';

export default async function AvailabilityPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: slots } = await supabase
    .from('availability_slots')
    .select('*')
    .eq('coach_id', user.id)
    .order('day_of_week')
    .order('start_time');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Manage Availability</h1>
        <AvailabilityCalendar slots={slots || []} />
      </div>
    </div>
  );
}
