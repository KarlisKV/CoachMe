import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import SlotPicker from '@/components/booking/SlotPicker';
import ReviewList from '@/components/reviews/ReviewList';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from('coach_profiles')
    .select('*, profiles!inner(full_name)')
    .eq('id', id)
    .single();

  if (!data) return { title: 'Coach Not Found' };
  return { title: `${data.profiles.full_name} — CoachMe` };
}

export default async function CoachDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: coach } = await supabase
    .from('coach_profiles')
    .select('*, profiles!inner(*)')
    .eq('id', id)
    .single();

  if (!coach) notFound();

  const { data: slots } = await supabase
    .from('availability_slots')
    .select('*')
    .eq('coach_id', id)
    .order('day_of_week')
    .order('start_time');

  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link href="/coaches" className="text-blue-600 hover:underline text-sm mb-6 block">
          &larr; Back to coaches
        </Link>

        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-6">
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden shrink-0">
              {coach.profiles.avatar_url ? (
                <img src={coach.profiles.avatar_url} alt={coach.profiles.full_name}
                  className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-3xl font-medium">
                  {coach.profiles.full_name.charAt(0)}
                </div>
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold">{coach.profiles.full_name}</h1>
              <div className="flex items-center gap-3 mt-2">
                <span className="inline-block bg-blue-100 text-blue-700 text-sm font-medium px-3 py-1 rounded-full">
                  {coach.sport}
                </span>
                {coach.specialty && (
                  <span className="text-gray-500">{coach.specialty}</span>
                )}
              </div>
              {coach.location && (
                <p className="text-gray-500 mt-2">{coach.location}</p>
              )}
              <div className="flex items-center gap-6 mt-4">
                {coach.hourly_rate && (
                  <div>
                    <span className="text-2xl font-bold">${coach.hourly_rate}</span>
                    <span className="text-gray-500">/hour</span>
                  </div>
                )}
                {coach.experience_years && (
                  <div className="text-gray-600">
                    <span className="font-semibold">{coach.experience_years}</span> years experience
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column: Description & Contact */}
          <div className="lg:col-span-2 space-y-6">
            {coach.description && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold mb-3">About</h2>
                <p className="text-gray-600 whitespace-pre-wrap">{coach.description}</p>
              </div>
            )}

            {(coach.contact_email || coach.contact_phone) && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold mb-3">Contact</h2>
                <div className="space-y-2 text-gray-600">
                  {coach.contact_email && <p>Email: {coach.contact_email}</p>}
                  {coach.contact_phone && <p>Phone: {coach.contact_phone}</p>}
                </div>
              </div>
            )}

            {/* Weekly Availability */}
            {slots && slots.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold mb-3">Weekly Availability</h2>
                <div className="space-y-2">
                  {DAYS.map((day, index) => {
                    const daySlots = slots.filter(s => s.day_of_week === index);
                    if (daySlots.length === 0) return null;
                    return (
                      <div key={day} className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-700 w-24">{day}</span>
                        <div className="flex gap-2 flex-wrap">
                          {daySlots.map(slot => (
                            <span key={slot.id} className="text-sm bg-green-50 text-green-700 px-2 py-1 rounded">
                              {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div>
              <h2 className="text-lg font-semibold mb-3">Reviews</h2>
              <ReviewList coachId={id} />
            </div>
          </div>

          {/* Right column: Book a Session */}
          <div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-8">
              <h2 className="text-lg font-semibold mb-4">Book a Session</h2>
              {user ? (
                <SlotPicker
                  coachId={id}
                  coachName={coach.profiles.full_name}
                  coachSport={coach.sport}
                  coachLocation={coach.location || undefined}
                  slots={slots || []}
                />
              ) : (
                <div className="text-center">
                  <p className="text-gray-500 text-sm mb-4">Sign in to book a session</p>
                  <Link href="/login"
                    className="block w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors text-center">
                    Sign In
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
