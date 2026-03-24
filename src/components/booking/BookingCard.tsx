'use client';

import { useState } from 'react';
import { updateBookingStatus } from '@/lib/actions/booking';
import SessionCompletion from './SessionCompletion';
import SessionNoteForm from './SessionNoteForm';
import Link from 'next/link';
import type { Booking, SessionNote } from '@/types/database.types';

interface Props {
  booking: Booking & { session_notes?: SessionNote[] };
  otherPartyName: string;
  role: 'coach' | 'client';
  cancellationHours?: number;
}

export default function BookingCard({ booking, otherPartyName, role, cancellationHours = 24 }: Props) {
  const [loading, setLoading] = useState(false);
  const [cancellationWarning, setCancellationWarning] = useState<string | null>(null);

  async function handleAction(status: 'confirmed' | 'cancelled') {
    if (status === 'cancelled') {
      const bookingDate = new Date(booking.slot_date);
      const now = new Date();
      const hoursUntilSession = (bookingDate.getTime() - now.getTime()) / (1000 * 60 * 60);

      if (hoursUntilSession < cancellationHours) {
        setCancellationWarning(
          `Cannot cancel within ${cancellationHours} hours of session. ` +
          `Your session is in ${Math.ceil(hoursUntilSession)} hours.`
        );
        return;
      }
    }

    setLoading(true);
    setCancellationWarning(null);
    await updateBookingStatus(booking.id, status);
    setLoading(false);
  }

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
    completed: 'bg-blue-100 text-blue-700',
  };

  const today = new Date().toISOString().split('T')[0];
  const sessionPassed = booking.slot_date < today;
  const existingNote = booking.session_notes?.[0];

  return (
    <div className="space-y-3">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">{otherPartyName}</p>
            <p className="text-sm text-gray-500 mt-1">
              {booking.slot_date} &middot; {booking.start_time.slice(0, 5)} - {booking.end_time.slice(0, 5)}
            </p>
          </div>
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[booking.status]}`}>
            {booking.status}
          </span>
        </div>

        {cancellationWarning && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-3 text-sm text-yellow-800">
            {cancellationWarning}
          </div>
        )}

        {booking.status === 'pending' && (
          <div className="flex gap-2 mt-3">
            {role === 'coach' && (
              <button onClick={() => handleAction('confirmed')} disabled={loading}
                className="text-sm bg-green-600 text-white px-4 py-1.5 rounded-lg hover:bg-green-700 disabled:opacity-50">
                Confirm
              </button>
            )}
            <button onClick={() => handleAction('cancelled')} disabled={loading}
              className="text-sm bg-red-50 text-red-600 px-4 py-1.5 rounded-lg hover:bg-red-100 disabled:opacity-50">
              Cancel
            </button>
          </div>
        )}

        {booking.status === 'confirmed' && !sessionPassed && (
          <div className="mt-3">
            <button onClick={() => handleAction('cancelled')} disabled={loading}
              className="text-sm text-red-600 hover:underline disabled:opacity-50">
              Cancel booking
            </button>
          </div>
        )}
      </div>

      {booking.status === 'confirmed' && sessionPassed && (
        <SessionCompletion booking={booking} role={role} />
      )}

      {booking.status === 'completed' && role === 'coach' && (
        <SessionNoteForm bookingId={booking.id} existingNote={existingNote || null} />
      )}
    </div>
  );
}
