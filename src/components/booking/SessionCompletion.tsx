'use client';

import { useState } from 'react';
import { markSessionCompleted } from '@/lib/actions/sessions';
import type { Booking } from '@/types/database.types';

interface Props {
  booking: Booking;
  role: 'coach' | 'client';
}

export default function SessionCompletion({ booking, role }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleMarkCompleted() {
    setLoading(true);
    setError(null);
    const result = await markSessionCompleted(booking.id, role);
    if (result.error) {
      setError(result.error);
    }
    setLoading(false);
  }

  const isCompleted = booking.status === 'completed';
  const coachCompleted = booking.completed_by_coach;
  const clientCompleted = booking.completed_by_client;
  const otherPartyCompleted = role === 'coach' ? clientCompleted : coachCompleted;

  if (isCompleted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
        <p className="text-sm font-medium text-green-800">
          Session completed by both parties
        </p>
        <p className="text-xs text-green-600 mt-1">
          {new Date(booking.completed_at!).toLocaleDateString()}
        </p>
      </div>
    );
  }

  const currentPartyCompleted = role === 'coach' ? coachCompleted : clientCompleted;

  if (currentPartyCompleted && otherPartyCompleted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
        <p className="text-sm font-medium text-green-800">
          Session completed by both parties
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      {!currentPartyCompleted ? (
        <>
          <button
            onClick={handleMarkCompleted}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 text-sm"
          >
            {loading ? 'Marking Complete...' : 'Mark Session Complete'}
          </button>
          {error && (
            <p className="text-sm text-red-600 mt-2">{error}</p>
          )}
        </>
      ) : (
        <>
          <p className="text-sm font-medium text-green-700 mb-2">
            You marked this complete
          </p>
          <p className="text-sm text-gray-500">
            Waiting for {role === 'coach' ? 'client' : 'coach'} to confirm
          </p>
        </>
      )}

      {otherPartyCompleted && currentPartyCompleted && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-3">
          <p className="text-sm font-medium text-green-800">
            Both parties have confirmed. Session is complete!
          </p>
        </div>
      )}
    </div>
  );
}
