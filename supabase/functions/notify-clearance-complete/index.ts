import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ClearanceCompletePayload {
  clearanceId: string;
  tenantId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { clearanceId, tenantId }: ClearanceCompletePayload = await req.json();

    console.log(`Processing clearance complete notification for clearance: ${clearanceId}`);

    // Verify all departments are approved
    const { data: isFullyApproved } = await supabase.rpc("check_clearance_fully_approved", {
      p_clearance_id: clearanceId,
    });

    if (!isFullyApproved) {
      console.log("Clearance not fully approved yet");
      return new Response(
        JSON.stringify({ success: false, message: "Clearance not fully approved" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get clearance and employee details
    const { data: clearance, error: clearError } = await supabase
      .from("offboarding_clearance")
      .select(`
        id,
        employee:employee_profiles(id, first_name, last_name, email)
      `)
      .eq("id", clearanceId)
      .single();

    if (clearError || !clearance) {
      console.error("Error fetching clearance:", clearError);
      throw new Error("Clearance not found");
    }

    const employee = clearance.employee as any;
    const employeeName = `${employee.first_name} ${employee.last_name}`;

    // Get HR admins to notify
    const { data: hrAdmins, error: adminsError } = await supabase
      .from("profiles")
      .select("id, email, first_name")
      .eq("tenant_id", tenantId)
      .in("role", ["admin", "superadmin"])
      .eq("is_active", true);

    if (adminsError) {
      console.error("Error fetching admins:", adminsError);
      throw adminsError;
    }

    console.log(`Found ${hrAdmins?.length || 0} admins to notify`);

    // Create notifications for HR admins
    const adminNotifications = (hrAdmins || []).map((admin) => ({
      user_id: admin.id,
      tenant_id: tenantId,
      title: "Clearance Complete",
      message: `All departments have approved clearance for ${employeeName}. Ready for final settlement.`,
      type: "clearance",
      related_id: clearanceId,
    }));

    if (adminNotifications.length > 0) {
      const { error: notifError } = await supabase
        .from("notifications")
        .insert(adminNotifications);

      if (notifError) {
        console.error("Error creating admin notifications:", notifError);
      } else {
        console.log(`Created ${adminNotifications.length} admin notifications`);
      }
    }

    // TODO: Send email to departing employee when email provider is configured
    // if (employee.email) {
    //   const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
    //   await resend.emails.send({
    //     from: "HR System <noreply@yourdomain.com>",
    //     to: employee.email,
    //     subject: "Your Clearance Has Been Processed",
    //     html: `
    //       <p>Dear ${employee.first_name},</p>
    //       <p>Your clearance has been processed by all departments. Please contact HR for final settlement.</p>
    //       <p>Best regards,<br>HR Team</p>
    //     `,
    //   });
    //   console.log(`Sent notification email to ${employee.email}`);
    // }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Clearance complete notifications sent",
        adminNotifications: adminNotifications.length 
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in notify-clearance-complete:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
