import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import CoachCard from '@/components/coach/CoachCard';

export default async function HomePage() {
  const supabase = await createClient();

  const { data: featuredCoaches } = await supabase
    .from('coach_profiles')
    .select('*, profiles!inner(full_name, avatar_url, bio)')
    .limit(4);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <div className="max-w-6xl mx-auto px-4 py-24 text-center">
          <h1 className="text-5xl font-bold mb-4">Find Your Perfect Sports Coach</h1>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Connect with experienced coaches in your area. Book sessions, improve your skills, and reach your goals.
          </p>
          <form action="/coaches" className="max-w-lg mx-auto flex gap-2">
            <input
              name="sport"
              placeholder="What sport? (e.g., Tennis, Swimming)"
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 placeholder-gray-400 outline-none"
            />
            <button type="submit"
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
              Search
            </button>
          </form>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                &#128269;
              </div>
              <h3 className="text-lg font-semibold mb-2">1. Search</h3>
              <p className="text-gray-500">Browse coaches by sport, location, or specialty to find your perfect match.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                &#128197;
              </div>
              <h3 className="text-lg font-semibold mb-2">2. Book</h3>
              <p className="text-gray-500">Pick a time that works for you from the coach&apos;s available slots.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                &#127941;
              </div>
              <h3 className="text-lg font-semibold mb-2">3. Train</h3>
              <p className="text-gray-500">Show up, train hard, and level up your game with expert guidance.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Coaches */}
      {featuredCoaches && featuredCoaches.length > 0 && (
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold">Featured Coaches</h2>
              <Link href="/coaches" className="text-blue-600 hover:underline">View all</Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {featuredCoaches.map((coach) => (
                <CoachCard key={coach.id} coach={coach} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-gray-500 mb-8">Whether you&apos;re looking for a coach or want to offer your services.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
              Find a Coach
            </Link>
            <Link href="/signup"
              className="border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
              Become a Coach
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
