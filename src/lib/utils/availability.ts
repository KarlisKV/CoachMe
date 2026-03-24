import type { AvailabilitySlot, Booking } from '@/types/database.types';

export interface TimeSlot {
  start_time: string;
  end_time: string;
}

export function getAvailableSlots(
  recurringSlots: AvailabilitySlot[],
  existingBookings: Booking[],
  targetDate: Date
): TimeSlot[] {
  const dayOfWeek = targetDate.getDay();
  const daySlots = recurringSlots.filter(s => s.day_of_week === dayOfWeek);

  // Generate 1-hour slots from each availability window
  const hourlySlots: TimeSlot[] = [];
  for (const slot of daySlots) {
    const [startH, startM] = slot.start_time.split(':').map(Number);
    const [endH, endM] = slot.end_time.split(':').map(Number);
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    for (let m = startMinutes; m + 60 <= endMinutes; m += 60) {
      const sh = Math.floor(m / 60).toString().padStart(2, '0');
      const sm = (m % 60).toString().padStart(2, '0');
      const eh = Math.floor((m + 60) / 60).toString().padStart(2, '0');
      const em = ((m + 60) % 60).toString().padStart(2, '0');
      hourlySlots.push({
        start_time: `${sh}:${sm}`,
        end_time: `${eh}:${em}`,
      });
    }
  }

  // Filter out already booked slots
  const dateStr = targetDate.toISOString().split('T')[0];
  const bookedOnDate = existingBookings.filter(
    b => b.slot_date === dateStr && b.status !== 'cancelled'
  );

  return hourlySlots.filter(slot => {
    return !bookedOnDate.some(booking => {
      const bookStart = booking.start_time.slice(0, 5);
      const bookEnd = booking.end_time.slice(0, 5);
      return slot.start_time < bookEnd && slot.end_time > bookStart;
    });
  });
}
