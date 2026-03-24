'use client';

import { useState } from 'react';
import { updateBookingStatus } from '@/lib/actions/booking';

interface Props {
  booking: {
    id: string;
    slot_date: string;
    start_time: string;
    end_time: string;
    status: string;
  };
  otherPartyName: string;
  role: 'coach' | 'client';
}

export default function BookingCard({ booking, otherPartyName, role }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleAction(status: 'confirmed' | 'cancelled') {
    setLoading(true);
    await updateBookingStatus(booking.id, status);
    setLoading(false);
  }

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  };

  return (
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

      {booking.status === 'confirmed' && (
        <div className="mt-3">
          <button onClick={() => handleAction('cancelled')} disabled={loading}
            className="text-sm text-red-600 hover:underline disabled:opacity-50">
            Cancel booking
          </button>
        </div>
      )}
    </div>
  );
}
