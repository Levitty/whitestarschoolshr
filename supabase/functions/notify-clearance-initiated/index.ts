import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ClearanceInitiatedPayload {
  clearanceId: string;
  employeeId: string;
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

    const { clearanceId, employeeId, tenantId }: ClearanceInitiatedPayload = await req.json();

    console.log(`Processing clearance initiated notification for clearance: ${clearanceId}`);

    // Get employee details
    const { data: employee, error: empError } = await supabase
      .from("employee_profiles")
      .select("first_name, last_name")
      .eq("id", employeeId)
      .single();

    if (empError || !employee) {
      console.error("Error fetching employee:", empError);
      throw new Error("Employee not found");
    }

    const employeeName = `${employee.first_name} ${employee.last_name}`;

    // Get users who should be notified (department heads and admins in IT, Finance, Operations, HR)
    const { data: usersToNotify, error: usersError } = await supabase
      .from("profiles")
      .select("id, email, first_name, department")
      .eq("tenant_id", tenantId)
      .in("department", ["IT", "Finance", "Operations", "HR"])
      .in("role", ["head", "admin", "superadmin"])
      .eq("is_active", true);

    if (usersError) {
      console.error("Error fetching users:", usersError);
      throw usersError;
    }

    console.log(`Found ${usersToNotify?.length || 0} users to notify`);

    // TODO: Integrate with email provider (Resend/SendGrid)
    // For now, create in-app notifications
    const notifications = (usersToNotify || []).map((user) => ({
      user_id: user.id,
      tenant_id: tenantId,
      title: "Clearance Initiated",
      message: `Clearance initiated for ${employeeName}. Please review and approve your department's section.`,
      type: "clearance",
      related_id: clearanceId,
    }));

    if (notifications.length > 0) {
      const { error: notifError } = await supabase
        .from("notifications")
        .insert(notifications);

      if (notifError) {
        console.error("Error creating notifications:", notifError);
      } else {
        console.log(`Created ${notifications.length} notifications`);
      }
    }

    // TODO: Send actual emails when email provider is configured
    // Example with Resend:
    // const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
    // for (const user of usersToNotify || []) {
    //   await resend.emails.send({
    //     from: "HR System <noreply@yourdomain.com>",
    //     to: user.email,
    //     subject: `Clearance Initiated for ${employeeName}`,
    //     html: `<p>Dear ${user.first_name},</p><p>Clearance has been initiated for ${employeeName}. Please review and approve your department's section.</p>`,
    //   });
    // }

    return new Response(
      JSON.stringify({ success: true, notified: notifications.length }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in notify-clearance-initiated:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
