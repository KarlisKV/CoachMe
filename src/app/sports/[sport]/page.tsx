import { createClient } from '@/lib/supabase/server';
import CoachCard from '@/components/coach/CoachCard';
import Link from 'next/link';
import { Metadata } from 'next';

interface PageProps {
  params: {
    sport: string;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const sport = decodeURIComponent(params.sport);
  return {
    title: `${sport} Coaches | CoachMe`,
    description: `Find and book ${sport} coaches online. Browse verified sports coaches and start training today.`,
  };
}

export function generateStaticParams() {
  return [];
}

const FAQ = [
  {
    question: 'How do I find the right coach for me?',
    answer:
      'Look for coaches with verified credentials, positive reviews, and experience in your skill level. You can filter by location, hourly rate, and specialties to find the perfect match.',
  },
  {
    question: 'What should I expect in my first session?',
    answer:
      'Your first session is typically an assessment and introduction. The coach will understand your goals, current fitness level, and create a personalized training plan.',
  },
  {
    question: 'How are prices determined?',
    answer:
      'Each coach sets their own hourly rates based on their experience, qualifications, and location. You can compare different coaches and choose one that fits your budget.',
  },
  {
    question: 'Can I take sessions online or in-person?',
    answer:
      'Many coaches offer both options. Check the coach profile to see their session location preferences and availability.',
  },
  {
    question: 'What if I need to cancel a session?',
    answer:
      'Each coach has their own cancellation policy. Make sure to check the policy before booking. Most require 24-48 hours notice for a full refund.',
  },
];

export default async function SportPage({ params }: PageProps) {
  const supabase = await createClient();
  const sport = decodeURIComponent(params.sport);

  // Fetch all coaches for this sport
  const { data: coachProfiles } = await supabase
    .from('coach_profiles')
    .select('*, profiles!inner(*, id, full_name, avatar_url)')
    .eq('verification_status', 'verified');

  // Filter by sport
  const coaches = coachProfiles?.filter((coach) => {
    if (coach.sports && Array.isArray(coach.sports)) {
      return coach.sports.some(
        (s: string) => s.toLowerCase() === sport.toLowerCase()
      );
    }
    return false;
  }) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <Link
            href="/sports"
            className="text-blue-600 hover:text-blue-700 text-sm font-medium mb-4 inline-block"
          >
            ← Back to Sports
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{sport} Coaches</h1>
          <p className="text-gray-600 text-lg">
            Find verified {sport} coaches and start your training journey
          </p>
        </div>

        {/* Coaches Grid */}
        {coaches.length > 0 ? (
          <>
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Available Coaches ({coaches.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {coaches.map((coach) => (
                  <CoachCard
                    key={coach.id}
                    coach={coach as any}
                  />
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-500 mb-12">
            <p>No coaches found for {sport}</p>
          </div>
        )}

        {/* FAQ Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {FAQ.map((item, idx) => (
              <div key={idx} className="pb-6 border-b border-gray-200 last:border-b-0">
                <h3 className="font-semibold text-gray-900 mb-2">
                  {item.question}
                </h3>
                <p className="text-gray-600">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
