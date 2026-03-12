import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const RAW_FROM = (Deno.env.get("RESEND_FROM_EMAIL") || "").trim();
// Use Resend's testing domain by default - users should update RESEND_FROM_EMAIL secret with their verified domain
const DEFAULT_FROM = "HR Department <onboarding@resend.dev>";
const getFromAddress = (orgName?: string) => {
  const label = orgName ? `${orgName} HR Department` : 'HR Department';
  const emailOnly = /^[^<>\s@]+@[^<>\s@]+\.[^<>\s@]+$/;
  const nameAndEmail = /^.+<[^<>\s@]+@[^<>\s@]+\.[^<>\s@]+>$/;
  if (RAW_FROM && emailOnly.test(RAW_FROM)) return `${label} <${RAW_FROM}>`;
  if (RAW_FROM && nameAndEmail.test(RAW_FROM)) return RAW_FROM;
  if (!RAW_FROM) return `${label} <onboarding@resend.dev>`;
  throw new Error('RESEND_FROM_EMAIL is invalid. Use "hr@yourdomain.com" or "Name <hr@yourdomain.com>".');
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InterviewScheduleRequest {
  candidateName: string;
  candidateEmail: string;
  position: string;
  department: string;
  interviewDate: string;
  interviewType: string;
  interviewerName: string;
  location?: string;
  notes?: string;
  tenantName?: string;
  contactPhone?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      candidateName,
      candidateEmail,
      position,
      department,
      interviewDate,
      interviewType,
      interviewerName,
      location,
      notes,
      tenantName,
      contactPhone
    }: InterviewScheduleRequest = await req.json();

    const orgName = tenantName || 'Our Organization';
    const phone = contactPhone || '0788182510';

    console.log('Sending interview schedule to:', candidateEmail);
    console.log('Raw interview date received:', interviewDate);

    // Display exactly what the admin selected. If the payload has a timezone (Z or +hh:mm),
    // format it in Africa/Nairobi. Otherwise, treat the string as a literal local time.
    const TZ = 'Africa/Nairobi';
    const hasTZ = /Z$|[+-]\d{2}:?\d{2}$/.test(interviewDate);

    let formattedDate = '';

    if (hasTZ) {
      const date = new Date(interviewDate);
      const weekday = date.toLocaleString('en-US', { weekday: 'long', timeZone: TZ });
      const month = date.toLocaleString('en-US', { month: 'long', timeZone: TZ });
      const day = new Intl.DateTimeFormat('en-US', { day: 'numeric', timeZone: TZ }).format(date);
      const year = new Intl.DateTimeFormat('en-US', { year: 'numeric', timeZone: TZ }).format(date);

      const timeParts = new Intl.DateTimeFormat('en-US', {
        hour: 'numeric', minute: '2-digit', hour12: true, timeZone: TZ,
      }).formatToParts(date);
      const displayHours = timeParts.find(p => p.type === 'hour')?.value ?? '12';
      const displayMinutes = timeParts.find(p => p.type === 'minute')?.value ?? '00';
      const period = (timeParts.find(p => p.type === 'dayPeriod')?.value ?? 'AM').toUpperCase();

      formattedDate = `${weekday}, ${month} ${day}, ${year} at ${displayHours}:${displayMinutes} ${period}`;
      console.log('Formatted date for email (TZ-aware):', formattedDate);
    } else {
      // Parse without shifting timezones: use the literal local date/time the user selected
      // Accept both 'YYYY-MM-DDTHH:mm' and 'YYYY-MM-DDTHH:mm:ss'
      const m = interviewDate.match(/^(\d{4})-(\d{2})-(\d{2})[T\s](\d{2}):(\d{2})(?::(\d{2}))?/);
      if (!m) {
        throw new Error(`Invalid interviewDate format: ${interviewDate}`);
      }
      const [_, y, mo, d, hh, mm] = m;
      const year = parseInt(y, 10);
      const monthIndex = parseInt(mo, 10) - 1;
      const dayNum = parseInt(d, 10);
      const hourNum = parseInt(hh, 10);
      const minutesNum = parseInt(mm, 10);

      // Build weekday and month name in a timezone-agnostic way
      const dateOnly = new Date(Date.UTC(year, monthIndex, dayNum));
      const month = dateOnly.toLocaleString('en-US', { month: 'long', timeZone: 'UTC' });
      const weekday = dateOnly.toLocaleString('en-US', { weekday: 'long', timeZone: 'UTC' });

      const period = hourNum >= 12 ? 'PM' : 'AM';
      const displayHours = String((hourNum % 12) || 12);
      const displayMinutes = minutesNum.toString().padStart(2, '0');

      formattedDate = `${weekday}, ${month} ${dayNum}, ${year} at ${displayHours}:${displayMinutes} ${period}`;
      console.log('Formatted date for email (literal time):', formattedDate);
    }

    const emailResponse = await resend.emails.send({
      from: getFromAddress(orgName),
      to: [candidateEmail],
      subject: `Interview Scheduled - ${position} Position`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">Interview Scheduled</h1>
          
          <p>Dear ${candidateName},</p>
          
          <p>Your interview has been scheduled for the <strong>${position}</strong> position at ${orgName} in the ${department} department.</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1f2937;">Interview Details:</h3>
            <p style="margin: 10px 0;"><strong>Date & Time:</strong> ${formattedDate}</p>
            <p style="margin: 10px 0;"><strong>Interview Type:</strong> ${interviewType}</p>
            <p style="margin: 10px 0;"><strong>Interviewer:</strong> ${interviewerName}</p>
            ${location ? `<p style="margin: 10px 0;"><strong>Location/Meeting Link:</strong> ${location}</p>` : ''}
            ${notes ? `
              <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #d1d5db;">
                <p style="margin: 0;"><strong>Additional Information:</strong></p>
                <p style="margin: 10px 0; white-space: pre-wrap;">${notes}</p>
              </div>
            ` : ''}
          </div>
          
          <p><strong>Please make sure to:</strong></p>
          <ul>
            <li>${interviewType === 'Physical' ? 'Arrive at the location 15 minutes before the scheduled time' : 'Join the interview 5 minutes before the scheduled time'}</li>
            <li>Have your CV and relevant documents ready</li>
            <li>Prepare questions you'd like to ask about the role</li>
            ${interviewType === 'Online' ? '<li>Test your internet connection and audio/video settings</li>' : ''}
            ${interviewType === 'Physical' ? '<li>Bring a valid ID and original certificates</li>' : ''}
          </ul>
          
          <p>If you have any questions, please contact us as soon as possible on ${phone}.</p>
          
          <p>We look forward to meeting you!</p>
          
          <p style="margin-top: 30px;">
            Best regards,<br>
            <strong>${orgName} HR Department</strong>
          </p>
        </div>
      `,
    });

    if ((emailResponse as any)?.error) {
      console.error("Resend error (schedule):", (emailResponse as any).error);
      throw new Error((emailResponse as any).error?.message || "Failed to send interview schedule email");
    }

    console.log("Interview schedule email sent:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending interview schedule notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
