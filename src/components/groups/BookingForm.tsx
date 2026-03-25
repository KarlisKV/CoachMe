'use client';

import { joinGroupSession } from '@/lib/actions/groups';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { generateGroupSessionCalendarUrl } from '@/lib/utils/calendar';
import AddToCalendarButton from '@/components/booking/AddToCalendarButton';

interface BookingFormProps {
  sessionId: string;
  maxParticipants: number;
  sessionTitle: string;
  sessionDate: string;
  startTime: string;
  endTime: string;
  location: string;
  coachName: string;
}

export function Booking({ sessionId, maxParticipants, sessionTitle, sessionDate, startTime, endTime, location, coachName }: BookingFormProps) {
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result = await joinGroupSession(sessionId, paymentMethod);

    if (result.success) {
      setSuccess(true);
      router.refresh();
    } else {
      alert(result.error || 'Failed to join session');
    }

    setLoading(false);
  };

  if (success) {
    const calendarUrl = generateGroupSessionCalendarUrl({
      title: sessionTitle,
      date: sessionDate,
      startTime,
      endTime,
      location,
      coachName,
    });

    return (
      <div className="text-center py-4">
        <div className="text-green-600 font-medium mb-2">You've joined the session!</div>
        <div className="mt-3">
          <AddToCalendarButton calendarUrl={calendarUrl} />
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          How would you like to pay?
        </label>
        <div className="space-y-2">
          <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              name="payment"
              value="card"
              checked={paymentMethod === 'card'}
              onChange={(e) => setPaymentMethod(e.target.value as 'card')}
              className="w-4 h-4"
            />
            <span className="text-gray-700">Card</span>
          </label>
          <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              name="payment"
              value="cash"
              checked={paymentMethod === 'cash'}
              onChange={(e) => setPaymentMethod(e.target.value as 'cash')}
              className="w-4 h-4"
            />
            <span className="text-gray-700">Cash (with coach)</span>
          </label>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || !paymentMethod}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
      >
        {loading ? 'Joining...' : 'Join Session'}
      </button>
    </form>
  );
}
