import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DeleteUserRequest {
  userId: string;
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Delete user request received");

    // Get the authorization header to verify the requester
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create a Supabase client with the user's token to verify permissions
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // First verify the requester is an admin
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user: requester }, error: authError } = await userClient.auth.getUser();
    if (authError || !requester) {
      console.error("Auth error:", authError);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if requester is admin
    const { data: requesterProfile, error: profileError } = await userClient
      .from("profiles")
      .select("role, tenant_id")
      .eq("id", requester.id)
      .single();

    if (profileError || !requesterProfile) {
      console.error("Profile error:", profileError);
      return new Response(
        JSON.stringify({ error: "Could not verify admin status" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const isAdmin = ["superadmin", "admin"].includes(requesterProfile.role);
    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: "Only admins can delete users" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const { userId }: DeleteUserRequest = await req.json();
    if (!userId) {
      return new Response(
        JSON.stringify({ error: "userId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Deleting user:", userId, "requested by admin:", requester.id);

    // Use service role client for admin operations
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // First, verify the target user is in the same tenant (for non-superadmins)
    const { data: targetProfile, error: targetError } = await adminClient
      .from("profiles")
      .select("tenant_id, email")
      .eq("id", userId)
      .single();

    if (targetError) {
      console.error("Target user error:", targetError);
      return new Response(
        JSON.stringify({ error: "User not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Tenant isolation check (skip for superadmins)
    if (requesterProfile.role !== "superadmin" && targetProfile.tenant_id !== requesterProfile.tenant_id) {
      return new Response(
        JSON.stringify({ error: "Cannot delete users from other tenants" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Deleting all data for user:", targetProfile.email);

    // Delete in order (respecting foreign key constraints)
    // 1. Delete from employee_profiles (has foreign key to profiles)
    const { error: empError } = await adminClient
      .from("employee_profiles")
      .delete()
      .eq("profile_id", userId);
    
    if (empError) {
      console.log("Employee profiles deletion (may not exist):", empError.message);
    }

    // 2. Delete from tenant_users
    const { error: tenantUserError } = await adminClient
      .from("tenant_users")
      .delete()
      .eq("user_id", userId);
    
    if (tenantUserError) {
      console.log("Tenant users deletion (may not exist):", tenantUserError.message);
    }

    // 3. Delete from user_roles
    const { error: rolesError } = await adminClient
      .from("user_roles")
      .delete()
      .eq("user_id", userId);
    
    if (rolesError) {
      console.log("User roles deletion (may not exist):", rolesError.message);
    }

    // 4. Delete from profiles
    const { error: profileDelError } = await adminClient
      .from("profiles")
      .delete()
      .eq("id", userId);
    
    if (profileDelError) {
      console.error("Profile deletion error:", profileDelError);
      return new Response(
        JSON.stringify({ error: "Failed to delete profile: " + profileDelError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 5. Finally delete from auth.users (this completely removes the user)
    const { error: authDelError } = await adminClient.auth.admin.deleteUser(userId);
    
    if (authDelError) {
      console.error("Auth user deletion error:", authDelError);
      return new Response(
        JSON.stringify({ error: "Failed to delete auth user: " + authDelError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("User completely deleted:", userId);

    return new Response(
      JSON.stringify({ success: true, message: "User and all associated data deleted successfully" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});