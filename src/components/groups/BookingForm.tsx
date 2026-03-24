'use client';

import { joinGroupSession } from '@/lib/actions/groups';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface BookingFormProps {
  sessionId: string;
  maxParticipants: number;
}

export function Booking({ sessionId, maxParticipants }: BookingFormProps) {
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result = await joinGroupSession(sessionId, paymentMethod);

    if (result.success) {
      router.refresh();
    } else {
      alert(result.error || 'Failed to join session');
    }

    setLoading(false);
  };

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
