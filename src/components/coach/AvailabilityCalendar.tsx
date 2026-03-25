'use client';

import { useState } from 'react';
import { addAvailabilitySlot, deleteAvailabilitySlot } from '@/lib/actions/availability';
import type { AvailabilitySlot } from '@/types/database.types';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

interface Props {
  slots: AvailabilitySlot[];
}

export default function AvailabilityCalendar({ slots }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedDay, setSelectedDay] = useState(1); // Monday
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');

  async function handleAdd() {
    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append('day_of_week', selectedDay.toString());
    formData.append('start_time', startTime);
    formData.append('end_time', endTime);
    const result = await addAvailabilitySlot(formData);
    if (result.error) setError(result.error);
    setLoading(false);
  }

  async function handleDelete(slotId: string) {
    await deleteAvailabilitySlot(slotId);
  }

  // Generate time options (6:00 - 22:00)
  const timeOptions: string[] = [];
  for (let h = 6; h <= 22; h++) {
    timeOptions.push(`${h.toString().padStart(2, '0')}:00`);
  }

  return (
    <div className="space-y-6">
      {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}

      {/* Add Slot Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold mb-4">Add Availability</h2>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Day</label>
            <select value={selectedDay} onChange={e => setSelectedDay(Number(e.target.value))}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900">
              {DAYS.map((day, i) => (
                <option key={i} value={i}>{day}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
            <select value={startTime} onChange={e => setStartTime(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900">
              {timeOptions.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
            <select value={endTime} onChange={e => setEndTime(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900">
              {timeOptions.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <button onClick={handleAdd} disabled={loading}
            className="bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50">
            {loading ? 'Adding...' : 'Add Slot'}
          </button>
        </div>
      </div>

      {/* Current Slots */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold mb-4">Your Schedule</h2>
        {slots.length === 0 ? (
          <p className="text-gray-500 text-sm">No availability set yet. Add your available time slots above.</p>
        ) : (
          <div className="space-y-3">
            {DAYS.map((day, index) => {
              const daySlots = slots.filter(s => s.day_of_week === index);
              if (daySlots.length === 0) return null;
              return (
                <div key={day} className="flex items-start gap-3">
                  <span className="text-sm font-medium text-gray-700 w-24 pt-1">{day}</span>
                  <div className="flex gap-2 flex-wrap">
                    {daySlots.map(slot => (
                      <div key={slot.id}
                        className="flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1.5 rounded-lg text-sm">
                        <span>{slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}</span>
                        <button onClick={() => handleDelete(slot.id)}
                          className="text-green-500 hover:text-red-500 ml-1" title="Remove">
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
