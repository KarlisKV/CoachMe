'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { sendEmail } from '@/lib/email/resend';
import { bookingConfirmationEmail, bookingStatusChangeEmail } from '@/lib/email/templates';
import { generateGoogleCalendarUrl } from '@/lib/utils/calendar';

export async function createBooking(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const coachId = formData.get('coach_id') as string;
  const slotDate = formData.get('slot_date') as string;
  const startTime = formData.get('start_time') as string;
  const endTime = formData.get('end_time') as string;

  const { data, error } = await supabase.rpc('create_booking', {
    p_client_id: user.id,
    p_coach_id: coachId,
    p_slot_date: slotDate,
    p_start_time: startTime,
    p_end_time: endTime,
  });

  if (error) return { error: error.message };

  // Fetch client and coach info for email
  const { data: clientProfile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single();

  const { data: coachProfile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', coachId)
    .single();

  const { data: coachDetails } = await supabase
    .from('coach_profiles')
    .select('sport, location')
    .eq('id', coachId)
    .single();

  const { data: coachAuth } = await supabase.auth.admin.getUserById(coachId);

  // Send confirmation emails to both parties
  if (clientProfile && coachProfile) {
    const time = `${startTime.slice(0, 5)} - ${endTime.slice(0, 5)}`;
    const sport = coachDetails?.sport || 'Coaching';

    // Calendar URL for client
    const clientCalendarUrl = generateGoogleCalendarUrl({
      title: `${sport} Session with ${coachProfile.full_name}`,
      date: slotDate,
      startTime,
      endTime,
      description: `Coaching session with ${coachProfile.full_name} via CoachMe.`,
      location: coachDetails?.location || undefined,
    });

    // Calendar URL for coach
    const coachCalendarUrl = generateGoogleCalendarUrl({
      title: `${sport} Session with ${clientProfile.full_name}`,
      date: slotDate,
      startTime,
      endTime,
      description: `Client session with ${clientProfile.full_name} via CoachMe.`,
      location: coachDetails?.location || undefined,
    });

    // Email to client
    const clientHtml = bookingConfirmationEmail({
      clientName: clientProfile.full_name,
      coachName: coachProfile.full_name,
      date: slotDate,
      time,
      calendarUrl: clientCalendarUrl,
    });
    await sendEmail({
      to: user.email!,
      subject: 'Booking Request Submitted',
      html: clientHtml,
    });

    // Email to coach
    if (coachAuth?.user?.email) {
      const coachHtml = bookingConfirmationEmail({
        clientName: clientProfile.full_name,
        coachName: coachProfile.full_name,
        date: slotDate,
        time,
        calendarUrl: coachCalendarUrl,
      });
      await sendEmail({
        to: coachAuth.user.email,
        subject: `New Booking Request from ${clientProfile.full_name}`,
        html: coachHtml,
      });
    }
  }

  revalidatePath('/dashboard');
  revalidatePath(`/coaches/${coachId}`);
  return { success: true, bookingId: data };
}

export async function updateBookingStatus(bookingId: string, status: 'confirmed' | 'cancelled') {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  // If cancelling, check cancellation policy
  if (status === 'cancelled') {
    const { data: booking } = await supabase
      .from('bookings')
      .select('coach_id, slot_date')
      .eq('id', bookingId)
      .single();

    if (booking) {
      const { data: coach } = await supabase
        .from('coach_profiles')
        .select('cancellation_hours')
        .eq('id', booking.coach_id)
        .single();

      if (coach) {
        const bookingDate = new Date(booking.slot_date);
        const now = new Date();
        const hoursUntilSession = (bookingDate.getTime() - now.getTime()) / (1000 * 60 * 60);

        if (hoursUntilSession < coach.cancellation_hours) {
          return {
            error: `Cannot cancel within ${coach.cancellation_hours} hours of the session`,
          };
        }
      }
    }
  }

  const updateData: any = { status };
  if (status === 'cancelled') {
    updateData.cancelled_at = new Date().toISOString();
  }

  // Fetch booking details before updating
  const { data: booking } = await supabase
    .from('bookings')
    .select('client_id, coach_id, slot_date, start_time, end_time')
    .eq('id', bookingId)
    .single();

  const { error } = await supabase
    .from('bookings')
    .update(updateData)
    .eq('id', bookingId);

  if (error) return { error: error.message };

  // Send status change emails
  if (booking) {
    const { data: clientProfile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', booking.client_id)
      .single();

    const { data: coachProfile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', booking.coach_id)
      .single();

    const { data: clientAuth } = await supabase.auth.admin.getUserById(booking.client_id);
    const { data: coachAuth } = await supabase.auth.admin.getUserById(booking.coach_id);

    if (clientProfile && coachProfile) {
      const time = `${booking.start_time.slice(0, 5)} - ${booking.end_time.slice(0, 5)}`;

      // Fetch coach details for calendar
      const { data: coachDetails } = await supabase
        .from('coach_profiles')
        .select('sport, location')
        .eq('id', booking.coach_id)
        .single();

      const sport = coachDetails?.sport || 'Coaching';

      // Generate calendar URLs for confirmed bookings
      const clientCalendarUrl = status === 'confirmed' ? generateGoogleCalendarUrl({
        title: `${sport} Session with ${coachProfile.full_name}`,
        date: booking.slot_date,
        startTime: booking.start_time,
        endTime: booking.end_time,
        description: `Coaching session with ${coachProfile.full_name} via CoachMe.`,
        location: coachDetails?.location || undefined,
      }) : undefined;

      const coachCalendarUrl = status === 'confirmed' ? generateGoogleCalendarUrl({
        title: `${sport} Session with ${clientProfile.full_name}`,
        date: booking.slot_date,
        startTime: booking.start_time,
        endTime: booking.end_time,
        description: `Client session with ${clientProfile.full_name} via CoachMe.`,
        location: coachDetails?.location || undefined,
      }) : undefined;

      // Email to client
      if (clientAuth?.user?.email) {
        const html = bookingStatusChangeEmail({
          recipientName: clientProfile.full_name,
          status,
          date: booking.slot_date,
          time,
          otherPartyName: coachProfile.full_name,
          calendarUrl: clientCalendarUrl,
        });

        await sendEmail({
          to: clientAuth.user.email,
          subject: `Booking ${status === 'confirmed' ? 'Confirmed' : 'Cancelled'}`,
          html,
        });
      }

      // Email to coach (only for confirmed status)
      if (status === 'confirmed' && coachAuth?.user?.email) {
        const html = bookingStatusChangeEmail({
          recipientName: coachProfile.full_name,
          status,
          date: booking.slot_date,
          time,
          otherPartyName: clientProfile.full_name,
          calendarUrl: coachCalendarUrl,
        });

        await sendEmail({
          to: coachAuth.user.email,
          subject: `Booking Confirmed with ${clientProfile.full_name}`,
          html,
        });
      }
    }
  }

  revalidatePath('/dashboard');
  revalidatePath('/coach/dashboard');
  return { success: true };
}
