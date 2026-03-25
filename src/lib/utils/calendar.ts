/**
 * Generate a Google Calendar "Add Event" URL.
 * No API keys or OAuth required — opens Google Calendar with pre-filled details.
 */

interface CalendarEventParams {
  title: string;
  date: string;       // YYYY-MM-DD
  startTime: string;  // HH:MM or HH:MM:SS
  endTime: string;    // HH:MM or HH:MM:SS
  description?: string;
  location?: string;
}

/**
 * Converts a date string (YYYY-MM-DD) and time string (HH:MM) to
 * Google Calendar's required format: YYYYMMDDTHHMMSS
 */
function toGoogleCalendarDateTime(date: string, time: string): string {
  const cleanDate = date.replace(/-/g, '');
  const cleanTime = time.slice(0, 5).replace(/:/g, '') + '00';
  return `${cleanDate}T${cleanTime}`;
}

export function generateGoogleCalendarUrl(params: CalendarEventParams): string {
  const { title, date, startTime, endTime, description, location } = params;

  const start = toGoogleCalendarDateTime(date, startTime);
  const end = toGoogleCalendarDateTime(date, endTime);

  const url = new URL('https://www.google.com/calendar/render');
  url.searchParams.set('action', 'TEMPLATE');
  url.searchParams.set('text', title);
  url.searchParams.set('dates', `${start}/${end}`);

  if (description) {
    url.searchParams.set('details', description);
  }
  if (location) {
    url.searchParams.set('location', location);
  }

  return url.toString();
}

/**
 * Generate calendar URL for a coaching session (from the client's perspective)
 */
export function generateClientCalendarUrl(params: {
  coachName: string;
  sport: string;
  date: string;
  startTime: string;
  endTime: string;
  location?: string;
}): string {
  return generateGoogleCalendarUrl({
    title: `${params.sport} Session with ${params.coachName}`,
    date: params.date,
    startTime: params.startTime,
    endTime: params.endTime,
    description: `Coaching session with ${params.coachName} via CoachMe.\n\nRemember to bring your gear!`,
    location: params.location,
  });
}

/**
 * Generate calendar URL for a coaching session (from the coach's perspective)
 */
export function generateCoachCalendarUrl(params: {
  clientName: string;
  sport: string;
  date: string;
  startTime: string;
  endTime: string;
  location?: string;
}): string {
  return generateGoogleCalendarUrl({
    title: `${params.sport} Session with ${params.clientName}`,
    date: params.date,
    startTime: params.startTime,
    endTime: params.endTime,
    description: `Coaching session with ${params.clientName} via CoachMe.`,
    location: params.location,
  });
}

/**
 * Generate calendar URL for a group session
 */
export function generateGroupSessionCalendarUrl(params: {
  title: string;
  coachName: string;
  date: string;
  startTime: string;
  endTime: string;
  location?: string;
}): string {
  return generateGoogleCalendarUrl({
    title: params.title,
    date: params.date,
    startTime: params.startTime,
    endTime: params.endTime,
    description: `Group session led by ${params.coachName} via CoachMe.`,
    location: params.location,
  });
}
