'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getAvailableSlots, type TimeSlot } from '@/lib/utils/availability';
import { createBooking } from '@/lib/actions/booking';
import type { AvailabilitySlot } from '@/types/database.types';

interface Props {
  coachId: string;
  slots: AvailabilitySlot[];
}

export default function SlotPicker({ coachId, slots }: Props) {
  const [selectedDate, setSelectedDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Get today's date as min for the date picker
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (!selectedDate) {
      setAvailableSlots([]);
      return;
    }

    async function fetchBookings() {
      setLoadingSlots(true);
      const supabase = createClient();
      const { data: bookings } = await supabase
        .from('bookings')
        .select('*')
        .eq('coach_id', coachId)
        .eq('slot_date', selectedDate)
        .in('status', ['pending', 'confirmed']);

      const date = new Date(selectedDate + 'T00:00:00');
      const available = getAvailableSlots(slots, bookings || [], date);
      setAvailableSlots(available);
      setSelectedSlot(null);
      setLoadingSlots(false);
    }

    fetchBookings();
  }, [selectedDate, coachId, slots]);

  async function handleBook() {
    if (!selectedSlot || !selectedDate) return;
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('coach_id', coachId);
    formData.append('slot_date', selectedDate);
    formData.append('start_time', selectedSlot.start_time);
    formData.append('end_time', selectedSlot.end_time);

    const result = await createBooking(formData);
    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(true);
    }
    setLoading(false);
  }

  if (success) {
    return (
      <div className="text-center py-4">
        <div className="text-green-600 font-medium mb-2">Booking confirmed!</div>
        <p className="text-sm text-gray-500">{selectedDate} at {selectedSlot?.start_time}</p>
        <button onClick={() => { setSuccess(false); setSelectedDate(''); setSelectedSlot(null); }}
          className="text-blue-600 hover:underline text-sm mt-3">
          Book another session
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Select Date</label>
        <input
          type="date"
          min={today}
          value={selectedDate}
          onChange={e => setSelectedDate(e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      {selectedDate && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Available Slots</label>
          {loadingSlots ? (
            <p className="text-sm text-gray-500">Loading...</p>
          ) : availableSlots.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {availableSlots.map(slot => (
                <button
                  key={slot.start_time}
                  onClick={() => setSelectedSlot(slot)}
                  className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors border ${
                    selectedSlot?.start_time === slot.start_time
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300'
                  }`}
                >
                  {slot.start_time} - {slot.end_time}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No available slots on this date</p>
          )}
        </div>
      )}

      {selectedSlot && (
        <button onClick={handleBook} disabled={loading}
          className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50">
          {loading ? 'Booking...' : `Book ${selectedSlot.start_time} - ${selectedSlot.end_time}`}
        </button>
      )}
    </div>
  );
}
