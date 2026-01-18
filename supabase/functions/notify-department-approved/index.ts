import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DepartmentApprovedPayload {
  approvalId: string;
  clearanceId: string;
  department: string;
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

    const { approvalId, clearanceId, department, tenantId }: DepartmentApprovedPayload = await req.json();

    console.log(`Processing department approved notification for ${department}`);

    // Get clearance and employee details
    const { data: clearance, error: clearError } = await supabase
      .from("offboarding_clearance")
      .select(`
        id,
        employee:employee_profiles(first_name, last_name)
      `)
      .eq("id", clearanceId)
      .single();

    if (clearError || !clearance) {
      console.error("Error fetching clearance:", clearError);
      throw new Error("Clearance not found");
    }

    const employeeName = `${(clearance.employee as any).first_name} ${(clearance.employee as any).last_name}`;

    // Count approvals
    const { data: approvals, error: appError } = await supabase
      .from("clearance_approvals")
      .select("status")
      .eq("clearance_id", clearanceId);

    if (appError) throw appError;

    const approvedCount = approvals?.filter((a) => a.status === "approved").length || 0;
    const totalCount = approvals?.length || 4;

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

    // Create in-app notifications
    const notifications = (hrAdmins || []).map((admin) => ({
      user_id: admin.id,
      tenant_id: tenantId,
      title: "Department Approved",
      message: `${department} has approved clearance for ${employeeName}. ${approvedCount} of ${totalCount} departments complete.`,
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

    // TODO: Send emails via Resend when configured
    // const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
    // ...

    return new Response(
      JSON.stringify({ 
        success: true, 
        notified: notifications.length,
        approvedCount,
        totalCount 
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in notify-department-approved:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
