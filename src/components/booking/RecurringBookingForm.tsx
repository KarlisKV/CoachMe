'use client';

import { createRecurringBooking } from '@/lib/actions/recurring';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AvailabilitySlot } from '@/types/database.types';

interface RecurringBookingFormProps {
  coachId: string;
  slots: AvailabilitySlot[];
}

const DAYS_OF_WEEK = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export default function RecurringBookingForm({
  coachId,
  slots,
}: RecurringBookingFormProps) {
  const [loading, setLoading] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState<string>('');
  const [weeks, setWeeks] = useState<number>(4);
  const router = useRouter();

  const selectedSlot = slots.find((s) => s.id === selectedSlotId);
  const previewDates = selectedSlot ? generatePreviewDates(selectedSlot.day_of_week, weeks) : [];

  function generatePreviewDates(dayOfWeek: number, numWeeks: number): string[] {
    const dates: string[] = [];
    const today = new Date();

    for (let i = 0; i < numWeeks; i++) {
      const nextDate = new Date(today);
      const daysUntilTarget = (dayOfWeek - nextDate.getDay() + 7) % 7 || 7;
      nextDate.setDate(today.getDate() + daysUntilTarget + i * 7);
      dates.push(nextDate.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      }));
    }

    return dates;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) {
      alert('Please select a slot');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('coach_id', coachId);
    formData.append('day_of_week', selectedSlot.day_of_week.toString());
    formData.append('start_time', selectedSlot.start_time);
    formData.append('end_time', selectedSlot.end_time);
    formData.append('weeks', weeks.toString());

    const result = await createRecurringBooking(formData);

    if (result.success) {
      alert(`Successfully booked ${result.createdCount} sessions!`);
      router.refresh();
    } else {
      alert(result.error || 'Failed to create recurring booking');
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Slot Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Select a Time Slot *
        </label>
        <div className="space-y-2">
          {slots.map((slot) => (
            <label
              key={slot.id}
              className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
            >
              <input
                type="radio"
                name="slot"
                value={slot.id}
                checked={selectedSlotId === slot.id}
                onChange={(e) => setSelectedSlotId(e.target.value)}
                className="w-4 h-4"
              />
              <span className="ml-3 text-gray-700">
                {DAYS_OF_WEEK[slot.day_of_week]} • {slot.start_time} -{' '}
                {slot.end_time}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Weeks Selection */}
      <div>
        <label htmlFor="weeks" className="block text-sm font-medium text-gray-700 mb-1">
          How many weeks would you like to book? *
        </label>
        <select
          id="weeks"
          value={weeks}
          onChange={(e) => setWeeks(parseInt(e.target.value))}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
        >
          <option value={4}>4 weeks</option>
          <option value={8}>8 weeks</option>
          <option value={12}>12 weeks</option>
        </select>
      </div>

      {/* Preview */}
      {selectedSlot && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-3">Preview of Bookings</h3>
          <div className="grid grid-cols-2 gap-2">
            {previewDates.map((date, idx) => (
              <div key={idx} className="text-sm text-blue-800">
                {date}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading || !selectedSlot}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
      >
        {loading ? 'Booking...' : `Book ${weeks} Weeks`}
      </button>
    </form>
  );
}
