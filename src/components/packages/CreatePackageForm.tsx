'use client';

import { createPackage } from '@/lib/actions/packages';
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

export default function CreatePackageForm() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await createPackage(formData);

    if (result.success) {
      router.refresh();
      (e.target as HTMLFormElement).reset();
      alert('Package created successfully!');
    } else {
      alert(result.error || 'Failed to create package');
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Package Title *
        </label>
        <input
          type="text"
          name="title"
          id="title"
          placeholder="e.g., 10 Sessions Bundle"
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-500"
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
          placeholder="Describe what's included in this package..."
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-500"
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
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
        >
          <option value="">Select a sport</option>
          {SPORTS.map((sport) => (
            <option key={sport} value={sport}>
              {sport}
            </option>
          ))}
        </select>
      </div>

      {/* Session Count */}
      <div>
        <label htmlFor="session_count" className="block text-sm font-medium text-gray-700 mb-1">
          Number of Sessions *
        </label>
        <input
          type="number"
          name="session_count"
          id="session_count"
          min="1"
          placeholder="10"
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-500"
        />
      </div>

      {/* Price */}
      <div>
        <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
          Total Price (in cents) *
        </label>
        <input
          type="number"
          name="price"
          id="price"
          min="0"
          placeholder="20000 (€200)"
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-500"
        />
        <p className="text-sm text-gray-500 mt-1">Enter price in cents (e.g., 20000 for €200)</p>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
      >
        {loading ? 'Creating...' : 'Create Package'}
      </button>
    </form>
  );
}
