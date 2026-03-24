'use client';

import { createGroupSession } from '@/lib/actions/groups';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const SPORTS = [
  'Basketball',
  'Football',
  'Tennis',
  'Swimming',
  'Running',
  'Yoga',
  'Boxing',
  'CrossFit',
  'Golf',
  'Cycling',
  'Other',
];

export default function CreateGroupSessionForm() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await createGroupSession(formData);

    if (result.success) {
      router.refresh();
      (e.target as HTMLFormElement).reset();
      alert('Group session created successfully!');
    } else {
      alert(result.error || 'Failed to create session');
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Session Title *
        </label>
        <input
          type="text"
          name="title"
          id="title"
          placeholder="e.g., Beginner Basketball Training"
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          name="description"
          id="description"
          placeholder="Tell participants what to expect..."
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Sport */}
      <div>
        <label htmlFor="sport" className="block text-sm font-medium text-gray-700 mb-1">
          Sport *
        </label>
        <select
          name="sport"
          id="sport"
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select a sport</option>
          {SPORTS.map((sport) => (
            <option key={sport} value={sport}>
              {sport}
            </option>
          ))}
        </select>
      </div>

      {/* Max Participants */}
      <div>
        <label htmlFor="max_participants" className="block text-sm font-medium text-gray-700 mb-1">
          Max Participants *
        </label>
        <input
          type="number"
          name="max_participants"
          id="max_participants"
          min="2"
          max="100"
          placeholder="10"
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Price Per Person */}
      <div>
        <label htmlFor="price_per_person" className="block text-sm font-medium text-gray-700 mb-1">
          Price Per Person (in cents) *
        </label>
        <input
          type="number"
          name="price_per_person"
          id="price_per_person"
          min="0"
          placeholder="2000 (€20)"
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-sm text-gray-500 mt-1">Enter price in cents (e.g., 2000 for €20)</p>
      </div>

      {/* Location */}
      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
          Location *
        </label>
        <input
          type="text"
          name="location"
          id="location"
          placeholder="e.g., Central Park, Downtown Court"
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Session Date */}
      <div>
        <label htmlFor="session_date" className="block text-sm font-medium text-gray-700 mb-1">
          Session Date *
        </label>
        <input
          type="date"
          name="session_date"
          id="session_date"
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Start Time */}
      <div>
        <label htmlFor="start_time" className="block text-sm font-medium text-gray-700 mb-1">
          Start Time *
        </label>
        <input
          type="time"
          name="start_time"
          id="start_time"
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* End Time */}
      <div>
        <label htmlFor="end_time" className="block text-sm font-medium text-gray-700 mb-1">
          End Time *
        </label>
        <input
          type="time"
          name="end_time"
          id="end_time"
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
      >
        {loading ? 'Creating...' : 'Create Session'}
      </button>
    </form>
  );
}
