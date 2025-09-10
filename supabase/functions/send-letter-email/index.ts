import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SendLetterEmailRequest {
  recipientEmail: string;
  recipientName: string;
  letterTitle: string;
  letterContent: string;
  senderName: string;
  companyName: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      recipientEmail, 
      recipientName, 
      letterTitle, 
      letterContent, 
      senderName, 
      companyName 
    }: SendLetterEmailRequest = await req.json();

    console.log('Sending letter email to:', recipientEmail);

    if (!recipientEmail || !letterTitle || !letterContent) {
      throw new Error('Missing required fields: recipientEmail, letterTitle, or letterContent');
    }

    // Format the letter content with proper HTML formatting
    const formattedContent = letterContent
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>')
      .replace(/^/, '<p>')
      .replace(/$/, '</p>');

    const emailResponse = await resend.emails.send({
      from: `${companyName || 'HR Department'} <noreply@hr.whitestarschools.com>`,
      to: [recipientEmail],
      subject: letterTitle,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333; border-bottom: 2px solid #e0e0e0; padding-bottom: 10px;">
            ${letterTitle}
          </h2>
          <div style="line-height: 1.6; color: #555; margin: 20px 0;">
            ${formattedContent}
          </div>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #888; font-size: 12px;">
            <p>This letter was sent from ${companyName || 'HR Department'} via the HR Portal system.</p>
            <p>If you have any questions, please contact your HR representative.</p>
          </div>
        </div>
      `,
      text: letterContent
    });

    console.log('Email sent successfully:', emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      messageId: emailResponse.data?.id 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error sending letter email:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to send email',
      details: error.toString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});