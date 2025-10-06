import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const RAW_FROM = (Deno.env.get("RESEND_FROM_EMAIL") || "").trim();
const DEFAULT_FROM = "HR Department <noreply@hr.whitestarschools.com>";
const getFromAddress = () => {
  const emailOnly = /^[^<>\s@]+@[^<>\s@]+\.[^<>\s@]+$/;
  const nameAndEmail = /^.+<[^<>\s@]+@[^<>\s@]+\.[^<>\s@]+>$/;
  if (RAW_FROM && emailOnly.test(RAW_FROM)) return `HR Department <${RAW_FROM}>`;
  if (RAW_FROM && nameAndEmail.test(RAW_FROM)) return RAW_FROM;
  if (!RAW_FROM) return DEFAULT_FROM;
  throw new Error('RESEND_FROM_EMAIL is invalid. Use "hr@yourdomain.com" or "Name <hr@yourdomain.com>".');
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InterviewNotificationRequest {
  candidateName: string;
  candidateEmail: string;
  position: string;
  department: string;
  note?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { candidateName, candidateEmail, position, department, note }: InterviewNotificationRequest = await req.json();

    console.log('Sending interview notification to:', candidateEmail);

    const emailResponse = await resend.emails.send({
      from: getFromAddress(),
      to: [candidateEmail],
      subject: `Interview Invitation - ${position} Position`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">Interview Invitation</h1>
          
          <p>Dear ${candidateName},</p>
          
          <p>Congratulations! We are pleased to invite you for an interview for the <strong>${position}</strong> position in the ${department} department.</p>
          
          ${note ? `
            <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #1f2937;">Interview Details:</h3>
              <p style="margin-bottom: 0; white-space: pre-wrap;">${note}</p>
            </div>
          ` : `
            <p>Our team will reach out to you shortly with the interview details including date, time, and location.</p>
          `}
          
          <p>Please confirm your availability at your earliest convenience.</p>
          
          <p>We look forward to meeting you!</p>
          
          <p style="margin-top: 30px;">
            Best regards,<br>
            <strong>HR Department</strong>
          </p>
        </div>
      `,
    });

    if ((emailResponse as any)?.error) {
      console.error("Resend error (notification):", (emailResponse as any).error);
      throw new Error((emailResponse as any).error?.message || "Failed to send interview notification email");
    }

    console.log("Interview notification email sent:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending interview notification:", error);
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
