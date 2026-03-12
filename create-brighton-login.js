// Create Brighton Otieno demo login
// Run this in browser console on any page that has the Supabase CDN loaded
// OR paste into console after loading: https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2

(async () => {
  // Load Supabase if not already loaded
  if (typeof window.supabase === 'undefined' && typeof window.createClient === 'undefined') {
    await new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
      script.onload = resolve;
      document.head.appendChild(script);
    });
    console.log('Supabase CDN loaded');
  }

  const SUPABASE_URL = 'https://rogwhlgqsyasbemnovgf.supabase.co';
  const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvZ3dobGdxc3lhc2JlbW5vdmdmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDE2MTg3NCwiZXhwIjoyMDY1NzM3ODc0fQ.6gmb9Fek2TKj9SXkqt-fRAuBOc1VJzFqt3nuYR2ZAK0';

  const VMX_TENANT_ID = '4a946052-0915-4f88-8d10-ee069d194511';

  const sb = window.supabase
    ? window.supabase.createClient(SUPABASE_URL, SERVICE_ROLE_KEY)
    : createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  // Step 1: Create auth user for Brighton
  console.log('Creating auth user for Brighton Otieno...');
  const { data: authData, error: authError } = await sb.auth.admin.createUser({
    email: 'brighton.otieno@tutagora.com',
    password: 'vmxdemo2026',
    email_confirm: true,
    user_metadata: {
      full_name: 'Brighton Otieno',
      first_name: 'Brighton',
      last_name: 'Otieno',
      department: 'Personal Training',
      role: 'staff',
      tenant_id: VMX_TENANT_ID,
    }
  });

  if (authError) {
    console.error('Auth error:', authError);
    // Try to find existing user
    const { data: existing } = await sb.auth.admin.listUsers();
    const found = existing?.users?.find(u => u.email === 'brighton.otieno@tutagora.com');
    if (found) {
      console.log('User already exists:', found.id);
      // Continue with existing user
      await setupProfile(sb, found.id);
      return;
    }
    return;
  }

  const userId = authData.user.id;
  console.log('Auth user created:', userId);

  await setupProfile(sb, userId);

  async function setupProfile(client, uid) {
    // Step 2: Ensure profile exists (trigger may have created it)
    const { data: existingProfile } = await client
      .from('profiles')
      .select('id')
      .eq('id', uid)
      .maybeSingle();

    if (!existingProfile) {
      console.log('Creating profile...');
      const { error: profileError } = await client
        .from('profiles')
        .insert({
          id: uid,
          email: 'brighton.otieno@tutagora.com',
          first_name: 'Brighton',
          last_name: 'Otieno',
          department: 'Personal Training',
          role: 'staff',
          branch: 'Village Market',
          is_active: true,
          status: 'active',
          tenant_id: VMX_TENANT_ID,
          onboarding_completed: true,
        });
      if (profileError) console.error('Profile error:', profileError);
      else console.log('Profile created');
    } else {
      // Update existing profile to be active
      await client.from('profiles').update({
        is_active: true,
        status: 'active',
        tenant_id: VMX_TENANT_ID,
        onboarding_completed: true,
      }).eq('id', uid);
      console.log('Profile updated');
    }

    // Step 3: Add to tenant_users
    const { error: tuError } = await client
      .from('tenant_users')
      .upsert({
        tenant_id: VMX_TENANT_ID,
        user_id: uid,
        role: 'staff',
      }, { onConflict: 'tenant_id,user_id' });
    if (tuError) console.error('Tenant user error:', tuError);
    else console.log('Added to tenant_users');

    // Step 4: Link employee_profiles record
    const { data: empProfile, error: empLookupError } = await client
      .from('employee_profiles')
      .select('id, profile_id')
      .eq('tenant_id', VMX_TENANT_ID)
      .eq('first_name', 'Brighton')
      .eq('last_name', 'Otieno')
      .maybeSingle();

    if (empProfile && !empProfile.profile_id) {
      const { error: linkError } = await client
        .from('employee_profiles')
        .update({ profile_id: uid })
        .eq('id', empProfile.id);
      if (linkError) console.error('Link error:', linkError);
      else console.log('Linked employee_profile to auth user');
    } else if (empProfile?.profile_id) {
      console.log('Employee profile already linked to:', empProfile.profile_id);
    } else {
      console.log('Employee profile not found — creating one');
      await client.from('employee_profiles').insert({
        profile_id: uid,
        first_name: 'Brighton',
        last_name: 'Otieno',
        email: 'brighton.otieno@tutagora.com',
        phone: '0712345005',
        department: 'Personal Training',
        position: 'Personal Trainer',
        employee_number: 'VMX-005',
        salary: 100000,
        contract_type: 'permanent',
        hire_date: '2022-04-15',
        status: 'active',
        tenant_id: VMX_TENANT_ID,
      });
      console.log('Employee profile created');
    }

    console.log('\n✅ DONE! Brighton Otieno can now log in:');
    console.log('   Email: brighton.otieno@tutagora.com');
    console.log('   Password: vmxdemo2026');
    console.log('   Role: Staff (Employee)');
  }
})();
