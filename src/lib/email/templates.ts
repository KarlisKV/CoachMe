// Email templates for CoachMe

const baseStyles = `
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  color: #1f2937;
  line-height: 1.6;
`;

const headerStyles = `
  background-color: #2563eb;
  color: white;
  padding: 24px;
  text-align: center;
`;

const containerStyles = `
  max-width: 600px;
  margin: 0 auto;
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
`;

const contentStyles = `
  padding: 24px;
  background-color: #ffffff;
`;

const buttonStyles = `
  display: inline-block;
  background-color: #2563eb;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  margin-top: 16px;
`;

const footerStyles = `
  padding: 16px 24px;
  background-color: #f9fafb;
  border-top: 1px solid #e5e7eb;
  font-size: 12px;
  color: #6b7280;
  text-align: center;
`;

export function bookingConfirmationEmail({
  clientName,
  coachName,
  date,
  time,
  calendarUrl,
}: {
  clientName: string;
  coachName: string;
  date: string;
  time: string;
  calendarUrl?: string;
}): string {
  return `
    <html style="${baseStyles}">
      <body style="margin: 0; padding: 20px; background-color: #f3f4f6;">
        <div style="${containerStyles}">
          <div style="${headerStyles}">
            <h1 style="margin: 0; font-size: 28px;">CoachMe</h1>
            <p style="margin: 8px 0 0 0; font-size: 14px; opacity: 0.9;">Booking Confirmation</p>
          </div>

          <div style="${contentStyles}">
            <p>Hi ${clientName},</p>

            <p>Your coaching session with <strong>${coachName}</strong> has been confirmed!</p>

            <div style="background-color: #f0f9ff; border-left: 4px solid #2563eb; padding: 16px; border-radius: 4px; margin: 20px 0;">
              <p style="margin: 0; font-weight: 600;">Session Details</p>
              <p style="margin: 8px 0 0 0;"><strong>Date:</strong> ${date}</p>
              <p style="margin: 8px 0 0 0;"><strong>Time:</strong> ${time}</p>
              <p style="margin: 8px 0 0 0;"><strong>Coach:</strong> ${coachName}</p>
            </div>

            ${calendarUrl ? `<a href="${calendarUrl}" style="${buttonStyles}" target="_blank">Add to Google Calendar</a>` : ''}

            <p style="margin-top: 16px;">We're looking forward to seeing you! If you need to reschedule or have any questions, please log in to your account or reach out to your coach.</p>

            <p>Best regards,<br>The CoachMe Team</p>
          </div>

          <div style="${footerStyles}">
            <p style="margin: 0;">This is an automated email. Please don't reply to this message.</p>
            <p style="margin: 8px 0 0 0;">© 2024 CoachMe. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

export function bookingStatusChangeEmail({
  recipientName,
  status,
  date,
  time,
  otherPartyName,
  calendarUrl,
}: {
  recipientName: string;
  status: 'confirmed' | 'cancelled';
  date: string;
  time: string;
  otherPartyName: string;
  calendarUrl?: string;
}): string {
  const isConfirmed = status === 'confirmed';
  const statusText = isConfirmed ? 'Confirmed' : 'Cancelled';
  const statusColor = isConfirmed ? '#10b981' : '#ef4444';
  const message = isConfirmed
    ? 'Your coaching session has been confirmed!'
    : 'Your coaching session has been cancelled.';

  return `
    <html style="${baseStyles}">
      <body style="margin: 0; padding: 20px; background-color: #f3f4f6;">
        <div style="${containerStyles}">
          <div style="${headerStyles}">
            <h1 style="margin: 0; font-size: 28px;">CoachMe</h1>
            <p style="margin: 8px 0 0 0; font-size: 14px; opacity: 0.9;">Booking Status Update</p>
          </div>

          <div style="${contentStyles}">
            <p>Hi ${recipientName},</p>

            <p>${message}</p>

            <div style="background-color: #f0f9ff; border-left: 4px solid ${statusColor}; padding: 16px; border-radius: 4px; margin: 20px 0;">
              <p style="margin: 0; font-weight: 600; color: ${statusColor};">${statusText}</p>
              <p style="margin: 8px 0 0 0;"><strong>Date:</strong> ${date}</p>
              <p style="margin: 8px 0 0 0;"><strong>Time:</strong> ${time}</p>
              <p style="margin: 8px 0 0 0;"><strong>${isConfirmed ? 'Coach' : 'Other Party'}:</strong> ${otherPartyName}</p>
            </div>

            ${isConfirmed && calendarUrl ? `<a href="${calendarUrl}" style="${buttonStyles}" target="_blank">Add to Google Calendar</a>` : ''}

            ${isConfirmed
              ? '<p style="margin-top: 16px;">We look forward to a great session!</p>'
              : '<p>If you need to discuss this cancellation, please reach out to the other party.</p>'}

            <p>Best regards,<br>The CoachMe Team</p>
          </div>

          <div style="${footerStyles}">
            <p style="margin: 0;">This is an automated email. Please don't reply to this message.</p>
            <p style="margin: 8px 0 0 0;">© 2024 CoachMe. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

export function verificationStatusEmail({
  coachName,
  status,
  reason,
}: {
  coachName: string;
  status: 'approved' | 'rejected';
  reason?: string;
}): string {
  const isApproved = status === 'approved';
  const statusColor = isApproved ? '#10b981' : '#ef4444';
  const statusText = isApproved ? 'Approved' : 'Rejected';

  return `
    <html style="${baseStyles}">
      <body style="margin: 0; padding: 20px; background-color: #f3f4f6;">
        <div style="${containerStyles}">
          <div style="${headerStyles}">
            <h1 style="margin: 0; font-size: 28px;">CoachMe</h1>
            <p style="margin: 8px 0 0 0; font-size: 14px; opacity: 0.9;">Verification Status</p>
          </div>

          <div style="${contentStyles}">
            <p>Hi ${coachName},</p>

            <p>Your verification request has been <strong style="color: ${statusColor};">${statusText}</strong>.</p>

            <div style="background-color: #f0f9ff; border-left: 4px solid ${statusColor}; padding: 16px; border-radius: 4px; margin: 20px 0;">
              <p style="margin: 0; font-weight: 600; color: ${statusColor};">${statusText}</p>
              ${reason ? `<p style="margin: 8px 0 0 0;"><strong>Reason:</strong> ${reason}</p>` : ''}
            </div>

            ${isApproved
              ? '<p>Congratulations! You are now a verified coach and can start accepting bookings. Your profile will be highlighted to attract more clients.</p>'
              : '<p>Please review the feedback above and consider resubmitting your verification request with the necessary corrections.</p>'}

            <p>Best regards,<br>The CoachMe Team</p>
          </div>

          <div style="${footerStyles}">
            <p style="margin: 0;">This is an automated email. Please don't reply to this message.</p>
            <p style="margin: 8px 0 0 0;">© 2024 CoachMe. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

export function sessionReminderEmail({
  recipientName,
  otherPartyName,
  date,
  time,
}: {
  recipientName: string;
  otherPartyName: string;
  date: string;
  time: string;
}): string {
  return `
    <html style="${baseStyles}">
      <body style="margin: 0; padding: 20px; background-color: #f3f4f6;">
        <div style="${containerStyles}">
          <div style="${headerStyles}">
            <h1 style="margin: 0; font-size: 28px;">CoachMe</h1>
            <p style="margin: 8px 0 0 0; font-size: 14px; opacity: 0.9;">Session Reminder</p>
          </div>

          <div style="${contentStyles}">
            <p>Hi ${recipientName},</p>

            <p>Just a reminder that you have a coaching session coming up!</p>

            <div style="background-color: #f0f9ff; border-left: 4px solid #2563eb; padding: 16px; border-radius: 4px; margin: 20px 0;">
              <p style="margin: 0; font-weight: 600;">Session Details</p>
              <p style="margin: 8px 0 0 0;"><strong>Date:</strong> ${date}</p>
              <p style="margin: 8px 0 0 0;"><strong>Time:</strong> ${time}</p>
              <p style="margin: 8px 0 0 0;"><strong>With:</strong> ${otherPartyName}</p>
            </div>

            <p>If you need to reschedule or cancel, please do so as soon as possible to notify the other party.</p>

            <p>Best regards,<br>The CoachMe Team</p>
          </div>

          <div style="${footerStyles}">
            <p style="margin: 0;">This is an automated email. Please don't reply to this message.</p>
            <p style="margin: 8px 0 0 0;">© 2024 CoachMe. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

export function welcomeEmail({
  name,
  role,
}: {
  name: string;
  role: 'coach' | 'client';
}): string {
  const roleText = role === 'coach' ? 'Coach' : 'Client';
  const roleMessage =
    role === 'coach'
      ? 'Set up your profile, add your availability, and start receiving bookings from clients.'
      : 'Browse coaches, book sessions, and improve your skills with our platform.';

  return `
    <html style="${baseStyles}">
      <body style="margin: 0; padding: 20px; background-color: #f3f4f6;">
        <div style="${containerStyles}">
          <div style="${headerStyles}">
            <h1 style="margin: 0; font-size: 28px;">Welcome to CoachMe</h1>
          </div>

          <div style="${contentStyles}">
            <p>Hi ${name},</p>

            <p>Welcome to CoachMe! We're excited to have you on board as a ${roleText}.</p>

            <p>${roleMessage}</p>

            <div style="background-color: #f0f9ff; border-left: 4px solid #2563eb; padding: 16px; border-radius: 4px; margin: 20px 0;">
              <p style="margin: 0; font-weight: 600;">Getting Started</p>
              <ul style="margin: 8px 0 0 0; padding-left: 20px;">
                ${role === 'coach'
                  ? `
                  <li style="margin: 4px 0;">Complete your profile with your expertise</li>
                  <li style="margin: 4px 0;">Set your hourly rate and availability</li>
                  <li style="margin: 4px 0;">Upload your certifications for verification</li>
                  <li style="margin: 4px 0;">Start receiving bookings!</li>
                  `
                  : `
                  <li style="margin: 4px 0;">Complete your profile</li>
                  <li style="margin: 4px 0;">Browse and discover coaches</li>
                  <li style="margin: 4px 0;">Book your first session</li>
                  <li style="margin: 4px 0;">Start your coaching journey!</li>
                  `}
              </ul>
            </div>

            <p>If you have any questions, don't hesitate to reach out to our support team.</p>

            <p>Best regards,<br>The CoachMe Team</p>
          </div>

          <div style="${footerStyles}">
            <p style="margin: 0;">This is an automated email. Please don't reply to this message.</p>
            <p style="margin: 8px 0 0 0;">© 2024 CoachMe. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}
