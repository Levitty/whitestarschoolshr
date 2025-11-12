import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const RAW_FROM = (Deno.env.get("RESEND_FROM_EMAIL") || "").trim();
// Use Resend's testing domain by default - users should update RESEND_FROM_EMAIL secret with their verified domain
const DEFAULT_FROM = "Whitestar Schools HR Department <onboarding@resend.dev>";
const getFromAddress = () => {
  const emailOnly = /^[^<>\s@]+@[^<>\s@]+\.[^<>\s@]+$/;
  const nameAndEmail = /^.+<[^<>\s@]+@[^<>\s@]+\.[^<>\s@]+>$/;
  if (RAW_FROM && emailOnly.test(RAW_FROM)) return `Whitestar Schools HR Department <${RAW_FROM}>`;
  if (RAW_FROM && nameAndEmail.test(RAW_FROM)) return RAW_FROM;
  if (!RAW_FROM) return DEFAULT_FROM;
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
      notes
    }: InterviewScheduleRequest = await req.json();

    console.log('Sending interview schedule to:', candidateEmail);

    // Parse the date without timezone conversion to preserve the scheduled time
    const date = new Date(interviewDate);
    const year = date.getFullYear();
    const month = date.toLocaleString('en-US', { month: 'long', timeZone: 'UTC' });
    const day = date.getUTCDate();
    const weekday = date.toLocaleString('en-US', { weekday: 'long', timeZone: 'UTC' });
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, '0');
    
    const formattedDate = `${weekday}, ${month} ${day}, ${year} at ${displayHours}:${displayMinutes} ${period}`;

    const emailResponse = await resend.emails.send({
      from: getFromAddress(),
      to: [candidateEmail],
      subject: `Interview Scheduled - ${position} Position`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">Interview Scheduled</h1>
          
          <p>Dear ${candidateName},</p>
          
          <p>Your interview has been scheduled for the <strong>${position}</strong> position at Whitestar Schools in the ${department} department.</p>
          
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
          
          <p>If you need to reschedule or have any questions, please contact us as soon as possible.</p>
          
          <p>We look forward to meeting you!</p>
          
          <p style="margin-top: 30px;">
            Best regards,<br>
            <strong>Whitestar Schools HR Department</strong>
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
