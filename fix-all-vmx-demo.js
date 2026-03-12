// ============================================
// VMX FITNESS DEMO - COMPREHENSIVE FIX SCRIPT
// Paste this entire script in your browser console
// ============================================

(async () => {
  // Load Supabase if not already loaded
  if (typeof window.supabase === 'undefined' && typeof window.createClient === 'undefined') {
    await new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
      script.onload = resolve;
      document.head.appendChild(script);
    });
    console.log('✅ Supabase CDN loaded');
  }

  const SUPABASE_URL = 'https://rogwhlgqsyasbemnovgf.supabase.co';
  const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvZ3dobGdxc3lhc2JlbW5vdmdmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDE2MTg3NCwiZXhwIjoyMDY1NzM3ODc0fQ.6gmb9Fek2TKj9SXkqt-fRAuBOc1VJzFqt3nuYR2ZAK0';
  const VMX_TENANT_ID = '4a946052-0915-4f88-8d10-ee069d194511';

  const sb = window.supabase
    ? window.supabase.createClient(SUPABASE_URL, SERVICE_ROLE_KEY)
    : createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  // ============================================
  // STEP 1: CREATE / FIX BRIGHTON'S AUTH ACCOUNT
  // ============================================
  console.log('\n📌 STEP 1: Setting up Brighton Otieno auth account...');

  let brightonAuthId = null;

  // Check if auth user already exists
  const { data: allUsers } = await sb.auth.admin.listUsers();
  const existingBrighton = allUsers?.users?.find(u => u.email === 'brighton.otieno@tutagora.com');

  if (existingBrighton) {
    brightonAuthId = existingBrighton.id;
    console.log('  Auth user already exists:', brightonAuthId);
  } else {
    // Create new auth user
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
      console.error('  ❌ Failed to create auth user:', authError);
      return;
    }
    brightonAuthId = authData.user.id;
    console.log('  ✅ Auth user created:', brightonAuthId);
  }

  // ============================================
  // STEP 2: FIX BRIGHTON'S PROFILE (role = staff)
  // ============================================
  console.log('\n📌 STEP 2: Fixing Brighton profile (role → staff)...');

  const { data: existingProfile } = await sb
    .from('profiles')
    .select('id, role')
    .eq('id', brightonAuthId)
    .maybeSingle();

  if (existingProfile) {
    const { error: updateErr } = await sb.from('profiles').update({
      role: 'staff',
      first_name: 'Brighton',
      last_name: 'Otieno',
      department: 'Personal Training',
      branch: 'Village Market',
      is_active: true,
      status: 'active',
      tenant_id: VMX_TENANT_ID,
      onboarding_completed: true,
    }).eq('id', brightonAuthId);
    if (updateErr) console.error('  ❌ Profile update error:', updateErr);
    else console.log('  ✅ Profile updated (was role=' + existingProfile.role + ', now role=staff)');
  } else {
    const { error: insertErr } = await sb.from('profiles').insert({
      id: brightonAuthId,
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
    if (insertErr) console.error('  ❌ Profile insert error:', insertErr);
    else console.log('  ✅ Profile created with role=staff');
  }

  // Also update user_roles table
  const { error: roleErr } = await sb.from('user_roles').upsert({
    user_id: brightonAuthId,
    role: 'staff',
  }, { onConflict: 'user_id,role' });
  if (roleErr) console.log('  ℹ️ user_roles upsert:', roleErr.message);
  else console.log('  ✅ user_roles set to staff');

  // ============================================
  // STEP 3: TENANT_USERS LINK
  // ============================================
  console.log('\n📌 STEP 3: Linking Brighton to VMX tenant...');

  const { error: tuError } = await sb.from('tenant_users').upsert({
    tenant_id: VMX_TENANT_ID,
    user_id: brightonAuthId,
    role: 'staff',
  }, { onConflict: 'tenant_id,user_id' });
  if (tuError) console.error('  ❌ tenant_users error:', tuError);
  else console.log('  ✅ Added to tenant_users');

  // ============================================
  // STEP 4: LINK EMPLOYEE_PROFILES → AUTH USER
  // ============================================
  console.log('\n📌 STEP 4: Linking employee_profiles to auth user...');

  const { data: brightonEmp } = await sb
    .from('employee_profiles')
    .select('id, profile_id, first_name, last_name')
    .eq('tenant_id', VMX_TENANT_ID)
    .eq('first_name', 'Brighton')
    .eq('last_name', 'Otieno')
    .maybeSingle();

  let brightonEmpId = null;
  if (brightonEmp) {
    brightonEmpId = brightonEmp.id;
    if (brightonEmp.profile_id !== brightonAuthId) {
      const { error: linkErr } = await sb
        .from('employee_profiles')
        .update({ profile_id: brightonAuthId })
        .eq('id', brightonEmp.id);
      if (linkErr) console.error('  ❌ Link error:', linkErr);
      else console.log('  ✅ Linked employee_profiles.profile_id → auth user (was ' + brightonEmp.profile_id + ')');
    } else {
      console.log('  ✅ Already linked correctly');
    }
  } else {
    console.log('  ⚠️ Brighton employee_profile not found - will be kept from reduced set');
  }

  // ============================================
  // STEP 5: FIX ASSETS ASSIGNED TO BRIGHTON
  // ============================================
  console.log('\n📌 STEP 5: Fixing assets assigned to Brighton...');

  if (brightonEmpId) {
    // Check if any assets are assigned using the employee_profiles.id
    const { data: assetsWithEmpId } = await sb
      .from('company_assets')
      .select('id, asset_name, assigned_to')
      .eq('assigned_to', brightonEmpId)
      .eq('tenant_id', VMX_TENANT_ID);

    if (assetsWithEmpId && assetsWithEmpId.length > 0) {
      console.log('  Found', assetsWithEmpId.length, 'assets assigned via employee_profiles.id — fixing to profiles.id...');
      for (const asset of assetsWithEmpId) {
        const { error } = await sb.from('company_assets')
          .update({ assigned_to: brightonAuthId })
          .eq('id', asset.id);
        if (error) console.error('    ❌ Failed to fix asset:', asset.asset_name, error);
        else console.log('    ✅ Fixed:', asset.asset_name);
      }
    }

    // Also check asset_assignments table
    const { data: assetAssignments } = await sb
      .from('asset_assignments')
      .select('id, employee_id, asset_id')
      .eq('employee_id', brightonEmpId);

    if (assetAssignments && assetAssignments.length > 0) {
      for (const aa of assetAssignments) {
        await sb.from('asset_assignments')
          .update({ employee_id: brightonAuthId })
          .eq('id', aa.id);
      }
      console.log('  ✅ Fixed', assetAssignments.length, 'asset_assignment records');
    }
  }

  // Also check if assets assigned via profiles.id already
  const { data: assetsViaProfile } = await sb
    .from('company_assets')
    .select('id, asset_name')
    .eq('assigned_to', brightonAuthId)
    .eq('status', 'assigned');
  console.log('  Assets now assigned to Brighton (via profiles.id):', assetsViaProfile?.length || 0);

  // ============================================
  // STEP 6: FIX DOCUMENTS FOR BRIGHTON
  // ============================================
  console.log('\n📌 STEP 6: Fixing documents for Brighton...');

  if (brightonEmpId) {
    // Check documents stored with employee_profiles.id
    const { data: docsWithEmpId } = await sb
      .from('documents')
      .select('id, title, employee_id')
      .eq('employee_id', brightonEmpId);

    if (docsWithEmpId && docsWithEmpId.length > 0) {
      console.log('  Found', docsWithEmpId.length, 'documents stored with employee_profiles.id (correct for display)');
      // These should already work since DocumentsList checks employee_profiles.id
      // But let's also ensure enrichment works
    }

    // Also check if any docs are stored with auth id
    const { data: docsWithAuthId } = await sb
      .from('documents')
      .select('id, title, employee_id')
      .eq('employee_id', brightonAuthId);

    console.log('  Documents with employee_profiles.id:', docsWithEmpId?.length || 0);
    console.log('  Documents with auth/profiles.id:', docsWithAuthId?.length || 0);

    // If no docs at all, the user may need to re-upload
    if ((!docsWithEmpId || docsWithEmpId.length === 0) && (!docsWithAuthId || docsWithAuthId.length === 0)) {
      console.log('  ⚠️ No documents found for Brighton. Try uploading again after this fix.');
    }
  }

  // ============================================
  // STEP 7: REDUCE EMPLOYEES TO ~10
  // ============================================
  console.log('\n📌 STEP 7: Reducing VMX employees to ~10 key people...');

  // Keep these employees (good mix of departments + Brighton)
  const keepNames = [
    'James Mwangi',       // General Manager - Management
    'Peter Kimani',       // Operations Manager - Management
    'Sarah Njeri',        // HR Manager - Management
    'Brighton Otieno',    // Personal Trainer - Personal Training
    'Nicholus Khayumbi',  // Head Trainer & S&C - Personal Training
    'Grace Achieng',      // Group Fitness Instructor - Group Fitness
    'Faith Muthoni',      // Front Desk Supervisor - Front Desk
    'Kevin Odhiambo',     // Sales Manager - Sales & Membership
    'Joseph Kamau',       // Maintenance Supervisor - Maintenance
    'Diana Atieno',       // Nutritionist - Nutrition & Wellness
  ];

  const { data: allVmxEmployees } = await sb
    .from('employee_profiles')
    .select('id, first_name, last_name, profile_id')
    .eq('tenant_id', VMX_TENANT_ID);

  if (allVmxEmployees) {
    const toDelete = allVmxEmployees.filter(emp => {
      const fullName = `${emp.first_name} ${emp.last_name}`;
      return !keepNames.includes(fullName);
    });

    if (toDelete.length > 0) {
      const deleteIds = toDelete.map(e => e.id);

      // Delete related data first
      // Leave balances
      const { error: lbErr } = await sb.from('leave_balances').delete().in('employee_id', deleteIds);
      if (lbErr) console.log('  ℹ️ leave_balances:', lbErr.message);

      // Leave requests
      const { error: lrErr } = await sb.from('leave_requests').delete().in('employee_id', deleteIds);
      if (lrErr) console.log('  ℹ️ leave_requests:', lrErr.message);

      // Delete the employee profiles
      const { error: delErr } = await sb
        .from('employee_profiles')
        .delete()
        .in('id', deleteIds);

      if (delErr) console.error('  ❌ Delete error:', delErr);
      else console.log('  ✅ Deleted', toDelete.length, 'extra employees. Kept', keepNames.length);
    } else {
      console.log('  ✅ Already at target count');
    }
  }

  // ============================================
  // SUMMARY
  // ============================================
  console.log('\n========================================');
  console.log('🎉 ALL FIXES COMPLETE!');
  console.log('========================================');
  console.log('');
  console.log('Brighton Otieno Login:');
  console.log('  Email: brighton.otieno@tutagora.com');
  console.log('  Password: vmxdemo2026');
  console.log('  Role: Staff (Employee)');
  console.log('');
  console.log('VMX Admin Login:');
  console.log('  Email: vmxadmin@tutagora.com');
  console.log('  Password: vmxdemo2026');
  console.log('  Role: Superadmin');
  console.log('');
  console.log('Next steps:');
  console.log('  1. Log in as VMX Admin to assign assets to Brighton');
  console.log('  2. Upload documents from Brighton\'s employee profile');
  console.log('  3. Assets & documents should now display correctly');
  console.log('========================================');
})();
