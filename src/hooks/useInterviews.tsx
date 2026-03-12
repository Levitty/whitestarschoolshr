
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTenant } from '@/contexts/TenantContext';

export interface Interview {
  id: string;
  application_id: string;
  interview_date: string;
  interviewer_name: string;
  interview_type: 'Phone' | 'Physical' | 'Online';
  status: 'Scheduled' | 'Completed';
  feedback?: string;
  created_at: string;
  updated_at: string;
  tenant_id?: string;
  job_applications?: {
    candidate_name: string;
    candidate_email: string;
    job_listings?: {
      title: string;
      department: string;
    };
  };
}

export const useInterviews = () => {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { tenant } = useTenant();

  const fetchInterviews = async () => {
    try {
      // Only fetch if tenant is available
      if (!tenant?.id) {
        console.log('Skipping interviews fetch - no tenant');
        setInterviews([]);
        setLoading(false);
        return;
      }
      
      console.log('Fetching interviews for tenant:', tenant.id);
      const { data, error } = await supabase
        .from('interviews')
        .select(`
          *,
          job_applications (
            candidate_name,
            candidate_email,
            job_listings (
              title,
              department
            )
          )
        `)
        .eq('tenant_id', tenant.id)
        .order('interview_date', { ascending: true });

      if (error) throw error;
      setInterviews((data || []) as Interview[]);
    } catch (error) {
      console.error('Error fetching interviews:', error);
      toast({
        title: "Error",
        description: "Failed to load interviews",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createInterview = async (interviewData: {
    application_id: string;
    interview_date: string;
    interviewer_name: string;
    interview_type: 'Phone' | 'Physical' | 'Online';
    location?: string;
    notes?: string;
  }) => {
    // Safari blocks window.open after async calls — open a blank window NOW
    // while we're still in the user's click context, then set its URL later.
    const emailWindow = window.open('', '_blank');

    try {
      const { data, error } = await supabase
        .from('interviews')
        .insert([{
          application_id: interviewData.application_id,
          interview_date: interviewData.interview_date,
          interviewer_name: interviewData.interviewer_name,
          interview_type: interviewData.interview_type,
          tenant_id: tenant?.id
        }])
        .select()
        .single();

      if (error) throw error;

      // Send interview notification email
      let emailSentViaEdgeFunction = false;
      let candidateEmail = '';
      let candidateName = '';
      let position = '';
      let department = '';

      try {
        const { data: application, error: appErr } = await supabase
          .from('job_applications')
          .select(`
            candidate_name,
            candidate_email,
            job_listings (
              title,
              department
            )
          `)
          .eq('id', interviewData.application_id)
          .maybeSingle();

        if (appErr) {
          console.error('Error fetching application for email:', appErr);
        }

        candidateEmail = application?.candidate_email || '';
        candidateName = application?.candidate_name || '';
        position = application?.job_listings?.title || '';
        department = application?.job_listings?.department || '';

        // Try Edge Function first
        console.log('Sending interview schedule notification...');
        const { error: emailError } = await supabase.functions.invoke('send-interview-schedule', {
          body: {
            candidateName,
            candidateEmail,
            position,
            department,
            interviewDate: interviewData.interview_date,
            interviewType: interviewData.interview_type,
            interviewerName: interviewData.interviewer_name,
            location: interviewData.location,
            notes: interviewData.notes,
            tenantName: tenant?.name
          }
        });

        if (emailError) {
          console.error('Edge function email failed, using Gmail compose fallback:', emailError);
        } else {
          emailSentViaEdgeFunction = true;
          console.log('Interview schedule notification sent successfully');
        }
      } catch (emailError) {
        console.error('Edge function unavailable, using Gmail compose fallback:', emailError);
      }

      // Fallback: open Gmail compose with pre-filled email
      if (!emailSentViaEdgeFunction && candidateEmail) {
        const orgName = tenant?.name || 'Our Organization';

        // Format the interview date nicely
        const dateObj = new Date(interviewData.interview_date);
        const formattedDate = dateObj.toLocaleString('en-US', {
          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
          hour: 'numeric', minute: '2-digit', hour12: true
        });

        const locationLine = interviewData.location ? `Location/Meeting Link: ${interviewData.location}` : '';
        const notesLine = interviewData.notes ? `\nAdditional Information:\n${interviewData.notes}` : '';

        const subject = `Interview Scheduled - ${position} Position`;
        const body = `Dear ${candidateName},

Your interview has been scheduled for the ${position} position at ${orgName} in the ${department} department.

Interview Details:
- Date & Time: ${formattedDate}
- Interview Type: ${interviewData.interview_type}
- Interviewer: ${interviewData.interviewer_name}
${locationLine ? `- ${locationLine}` : ''}${notesLine}

Please make sure to:
${interviewData.interview_type === 'Physical' ? '- Arrive at the location 15 minutes before the scheduled time' : '- Join the interview 5 minutes before the scheduled time'}
- Have your CV and relevant documents ready
- Prepare questions you'd like to ask about the role
${interviewData.interview_type === 'Online' ? '- Test your internet connection and audio/video settings' : ''}
${interviewData.interview_type === 'Physical' ? '- Bring a valid ID and original certificates' : ''}

We look forward to meeting you!

Best regards,
${orgName} HR Department`;

        const gmailUrl = `https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(candidateEmail)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        // Use the pre-opened window (Safari-safe)
        if (emailWindow && !emailWindow.closed) {
          emailWindow.location.href = gmailUrl;
        } else {
          // Last resort: navigate in same tab via mailto
          window.location.href = `mailto:${candidateEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        }
      } else if (emailWindow && !emailWindow.closed) {
        // Edge function succeeded — close the blank window we opened
        emailWindow.close();
      }

      await fetchInterviews(); // Refresh the list
      toast({
        title: "Interview Scheduled",
        description: emailSentViaEdgeFunction
          ? `Interview scheduled and email sent to ${candidateName}`
          : candidateEmail
            ? `Interview scheduled — Gmail compose opened to send notification to ${candidateName}`
            : "Interview scheduled successfully"
      });
      
      return data;
    } catch (error) {
      // Close the blank window if interview creation itself failed
      if (emailWindow && !emailWindow.closed) {
        emailWindow.close();
      }
      console.error('Error creating interview:', error);
      toast({
        title: "Error",
        description: "Failed to schedule interview",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateInterview = async (id: string, updates: Partial<Interview>) => {
    try {
      const { data, error } = await supabase
        .from('interviews')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setInterviews(prev => prev.map(interview => 
        interview.id === id ? { ...interview, ...data } as Interview : interview
      ));
      
      toast({
        title: "Success",
        description: "Interview updated successfully"
      });
      
      return data;
    } catch (error) {
      console.error('Error updating interview:', error);
      toast({
        title: "Error",
        description: "Failed to update interview",
        variant: "destructive"
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, [tenant?.id]);

  return {
    interviews,
    loading,
    createInterview,
    updateInterview,
    refetch: fetchInterviews
  };
};
