/**
 * VMX Fitness Demo Seed Script
 *
 * This script creates:
 * 1. A "VMX Fitness" tenant (corporate type)
 * 2. Departments typical for a fitness center
 * 3. Dummy employee profiles with realistic fitness industry data
 * 4. Leave balances for demo purposes
 *
 * Run: node seed-vmx-demo.mjs
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://rogwhlgqsyasbemnovgf.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvZ3dobGdxc3lhc2JlbW5vdmdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxNjE4NzQsImV4cCI6MjA2NTczNzg3NH0.jKAg3ennqyY6B57nh_r6q-9QguC0RZXGgbkhA3MZzC4";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ============ CONFIGURATION ============
const TENANT_CONFIG = {
  name: 'VMX Fitness',
  slug: 'vmx-fitness',
  tenant_type: 'corporate',
  subscription_tier: 'professional',
  subscription_status: 'active',
  max_employees: 100,
  is_active: true,
  primary_color: '#E85D04', // Bold orange - fitness energy
  features: {
    leave_management: true,
    performance_evaluations: true,
    recruitment: true,
    asset_management: true,
    document_management: true,
    clearance_management: true,
    ticket_system: true,
    training: true,
    sales_tracking: true,
    commission_calculator: true,
    weekly_reports: true
  }
};

const DEPARTMENTS = [
  'Management',
  'Personal Training',
  'Group Fitness',
  'Front Desk & Reception',
  'Sales & Membership',
  'Maintenance & Facilities',
  'Nutrition & Wellness',
  'Aquatics'
];

// Realistic VMX Fitness employees (based on real trainer names from their website + fictional supporting staff)
const EMPLOYEES = [
  // Management
  { first_name: 'James', last_name: 'Mwangi', email: 'james.mwangi@vmxfitness.demo', department: 'Management', position: 'General Manager', gender: 'Male', phone: '0712345001', employee_number: 'VMX-001', salary: 250000, contract_type: 'permanent', hire_date: '2022-01-15' },
  { first_name: 'Sarah', last_name: 'Ochieng', email: 'sarah.ochieng@vmxfitness.demo', department: 'Management', position: 'Operations Manager', gender: 'Female', phone: '0712345002', employee_number: 'VMX-002', salary: 200000, contract_type: 'permanent', hire_date: '2022-03-01' },
  { first_name: 'David', last_name: 'Kimani', email: 'david.kimani@vmxfitness.demo', department: 'Management', position: 'HR & Admin Officer', gender: 'Male', phone: '0712345003', employee_number: 'VMX-003', salary: 150000, contract_type: 'permanent', hire_date: '2022-06-15' },

  // Personal Training
  { first_name: 'Sheila', last_name: 'Wanjiku', email: 'sheila.w@vmxfitness.demo', department: 'Personal Training', position: 'Senior Personal Trainer', gender: 'Female', phone: '0712345004', employee_number: 'VMX-004', salary: 120000, contract_type: 'permanent', hire_date: '2022-02-01' },
  { first_name: 'Brighton', last_name: 'Otieno', email: 'brighton.o@vmxfitness.demo', department: 'Personal Training', position: 'Personal Trainer', gender: 'Male', phone: '0712345005', employee_number: 'VMX-005', salary: 100000, contract_type: 'permanent', hire_date: '2022-04-15' },
  { first_name: 'Nicholus', last_name: 'Khayumbi', email: 'nicholus.k@vmxfitness.demo', department: 'Personal Training', position: 'Head Trainer & S&C Specialist', gender: 'Male', phone: '0712345006', employee_number: 'VMX-006', salary: 140000, contract_type: 'permanent', hire_date: '2022-01-20' },
  { first_name: 'Nick', last_name: 'Mbatha', email: 'nick.m@vmxfitness.demo', department: 'Personal Training', position: 'Personal Trainer', gender: 'Male', phone: '0712345007', employee_number: 'VMX-007', salary: 95000, contract_type: 'contract', hire_date: '2023-03-01' },
  { first_name: 'Shayan', last_name: 'Adah', email: 'shayan.a@vmxfitness.demo', department: 'Personal Training', position: 'Personal Trainer', gender: 'Male', phone: '0712345008', employee_number: 'VMX-008', salary: 95000, contract_type: 'contract', hire_date: '2023-06-15' },

  // Group Fitness
  { first_name: 'Connie', last_name: 'Akinyi', email: 'connie.a@vmxfitness.demo', department: 'Group Fitness', position: 'Group Fitness Manager', gender: 'Female', phone: '0712345009', employee_number: 'VMX-009', salary: 130000, contract_type: 'permanent', hire_date: '2022-01-10' },
  { first_name: 'Mary', last_name: 'Kagi', email: 'mary.k@vmxfitness.demo', department: 'Group Fitness', position: 'Les Mills Instructor', gender: 'Female', phone: '0712345010', employee_number: 'VMX-010', salary: 90000, contract_type: 'permanent', hire_date: '2022-07-01' },
  { first_name: 'Collins', last_name: 'Madali', email: 'collins.m@vmxfitness.demo', department: 'Group Fitness', position: 'CrossFit Coach', gender: 'Male', phone: '0712345011', employee_number: 'VMX-011', salary: 100000, contract_type: 'permanent', hire_date: '2022-09-01' },
  { first_name: 'Nick', last_name: 'Olenyo', email: 'nick.o@vmxfitness.demo', department: 'Group Fitness', position: 'HYROX & Spin Instructor', gender: 'Male', phone: '0712345012', employee_number: 'VMX-012', salary: 95000, contract_type: 'contract', hire_date: '2023-01-15' },

  // Front Desk & Reception
  { first_name: 'Grace', last_name: 'Njeri', email: 'grace.n@vmxfitness.demo', department: 'Front Desk & Reception', position: 'Front Desk Supervisor', gender: 'Female', phone: '0712345013', employee_number: 'VMX-013', salary: 65000, contract_type: 'permanent', hire_date: '2022-05-01' },
  { first_name: 'Peter', last_name: 'Wafula', email: 'peter.w@vmxfitness.demo', department: 'Front Desk & Reception', position: 'Front Desk Associate', gender: 'Male', phone: '0712345014', employee_number: 'VMX-014', salary: 45000, contract_type: 'permanent', hire_date: '2023-02-01' },
  { first_name: 'Lucy', last_name: 'Muthoni', email: 'lucy.m@vmxfitness.demo', department: 'Front Desk & Reception', position: 'Front Desk Associate', gender: 'Female', phone: '0712345015', employee_number: 'VMX-015', salary: 45000, contract_type: 'contract', hire_date: '2023-08-01' },

  // Sales & Membership
  { first_name: 'Brian', last_name: 'Kiprop', email: 'brian.k@vmxfitness.demo', department: 'Sales & Membership', position: 'Sales Manager', gender: 'Male', phone: '0712345016', employee_number: 'VMX-016', salary: 130000, contract_type: 'permanent', hire_date: '2022-02-15' },
  { first_name: 'Faith', last_name: 'Chelangat', email: 'faith.c@vmxfitness.demo', department: 'Sales & Membership', position: 'Membership Advisor', gender: 'Female', phone: '0712345017', employee_number: 'VMX-017', salary: 70000, contract_type: 'permanent', hire_date: '2022-10-01' },
  { first_name: 'Dennis', last_name: 'Oduor', email: 'dennis.o@vmxfitness.demo', department: 'Sales & Membership', position: 'Membership Advisor', gender: 'Male', phone: '0712345018', employee_number: 'VMX-018', salary: 70000, contract_type: 'contract', hire_date: '2023-04-01' },

  // Maintenance & Facilities
  { first_name: 'Joseph', last_name: 'Kamau', email: 'joseph.k@vmxfitness.demo', department: 'Maintenance & Facilities', position: 'Facilities Manager', gender: 'Male', phone: '0712345019', employee_number: 'VMX-019', salary: 90000, contract_type: 'permanent', hire_date: '2022-01-25' },
  { first_name: 'Samuel', last_name: 'Njoroge', email: 'samuel.n@vmxfitness.demo', department: 'Maintenance & Facilities', position: 'Maintenance Technician', gender: 'Male', phone: '0712345020', employee_number: 'VMX-020', salary: 50000, contract_type: 'permanent', hire_date: '2022-08-01' },
  { first_name: 'Agnes', last_name: 'Wambui', email: 'agnes.w@vmxfitness.demo', department: 'Maintenance & Facilities', position: 'Housekeeping Supervisor', gender: 'Female', phone: '0712345021', employee_number: 'VMX-021', salary: 45000, contract_type: 'permanent', hire_date: '2022-03-15' },

  // Nutrition & Wellness
  { first_name: 'Diana', last_name: 'Mutua', email: 'diana.m@vmxfitness.demo', department: 'Nutrition & Wellness', position: 'Nutritionist', gender: 'Female', phone: '0712345022', employee_number: 'VMX-022', salary: 110000, contract_type: 'permanent', hire_date: '2022-11-01' },
  { first_name: 'Ann', last_name: 'Atieno', email: 'ann.a@vmxfitness.demo', department: 'Nutrition & Wellness', position: 'Wellness Coordinator', gender: 'Female', phone: '0712345023', employee_number: 'VMX-023', salary: 85000, contract_type: 'contract', hire_date: '2023-05-01' },

  // Aquatics
  { first_name: 'Kevin', last_name: 'Okoth', email: 'kevin.o@vmxfitness.demo', department: 'Aquatics', position: 'Head Lifeguard & Swim Coach', gender: 'Male', phone: '0712345024', employee_number: 'VMX-024', salary: 80000, contract_type: 'permanent', hire_date: '2022-06-01' },
  { first_name: 'Mercy', last_name: 'Karanja', email: 'mercy.k@vmxfitness.demo', department: 'Aquatics', position: 'Lifeguard', gender: 'Female', phone: '0712345025', employee_number: 'VMX-025', salary: 50000, contract_type: 'contract', hire_date: '2023-07-01' },
];

// ============ SEED FUNCTIONS ============

async function createTenant() {
  console.log('🏢 Creating VMX Fitness tenant...');

  // Check if tenant already exists
  const { data: existing } = await supabase
    .from('tenants')
    .select('id')
    .eq('slug', TENANT_CONFIG.slug)
    .maybeSingle();

  if (existing) {
    console.log('✅ Tenant already exists, using existing:', existing.id);
    return existing.id;
  }

  const { data, error } = await supabase
    .from('tenants')
    .insert(TENANT_CONFIG)
    .select('id')
    .single();

  if (error) {
    console.error('❌ Error creating tenant:', error.message);
    throw error;
  }

  console.log('✅ Tenant created:', data.id);
  return data.id;
}

async function createDepartments(tenantId) {
  console.log('🏗️  Creating departments...');

  for (const deptName of DEPARTMENTS) {
    const { error } = await supabase
      .from('departments')
      .insert({
        name: deptName,
        tenant_id: tenantId
      });

    if (error) {
      if (error.message.includes('duplicate') || error.code === '23505') {
        console.log(`  ⏭️  Department "${deptName}" already exists, skipping`);
      } else {
        console.error(`  ❌ Error creating department "${deptName}":`, error.message);
      }
    } else {
      console.log(`  ✅ Created department: ${deptName}`);
    }
  }
}

async function createEmployeeProfiles(tenantId) {
  console.log('👥 Creating employee profiles...');

  let created = 0;
  let skipped = 0;

  for (const emp of EMPLOYEES) {
    const contractStartDate = emp.hire_date;
    const contractEndDate = emp.contract_type === 'contract'
      ? new Date(new Date(emp.hire_date).getTime() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      : null;

    const { error } = await supabase
      .from('employee_profiles')
      .insert({
        first_name: emp.first_name,
        last_name: emp.last_name,
        email: emp.email,
        department: emp.department,
        position: emp.position,
        phone: emp.phone,
        employee_number: emp.employee_number,
        salary: emp.salary,
        contract_type: emp.contract_type,
        hire_date: emp.hire_date,
        contract_start_date: contractStartDate,
        contract_end_date: contractEndDate,
        contract_duration_months: emp.contract_type === 'contract' ? 12 : null,
        status: 'active',
        tenant_id: tenantId
      });

    if (error) {
      if (error.message.includes('duplicate') || error.code === '23505') {
        skipped++;
      } else {
        console.error(`  ❌ Error creating ${emp.first_name} ${emp.last_name}:`, error.message);
      }
    } else {
      created++;
    }
  }

  console.log(`✅ Created ${created} employees, skipped ${skipped} (already exist)`);
}

async function createBranch(tenantId) {
  console.log('📍 Creating branch...');

  const { error } = await supabase
    .from('branches')
    .insert({
      name: 'Village Market - Main',
      location: '3rd Floor, Village Market, Limuru Road, Gigiri, Nairobi',
      tenant_id: tenantId
    });

  if (error) {
    if (error.message.includes('duplicate') || error.code === '23505') {
      console.log('  ⏭️  Branch already exists, skipping');
    } else {
      console.error('  ❌ Error creating branch:', error.message);
    }
  } else {
    console.log('  ✅ Created branch: Village Market - Main');
  }
}

async function createAssets(tenantId) {
  console.log('🏋️ Creating company assets...');

  const assets = [
    { name: 'Technogym Treadmill #1', category: 'Cardio Equipment', serial_number: 'TG-TR-001', purchase_date: '2022-01-10', purchase_value: 850000, current_value: 680000, condition: 'good', location: 'Cardio Floor' },
    { name: 'Technogym Treadmill #2', category: 'Cardio Equipment', serial_number: 'TG-TR-002', purchase_date: '2022-01-10', purchase_value: 850000, current_value: 680000, condition: 'good', location: 'Cardio Floor' },
    { name: 'Concept2 Rower', category: 'Cardio Equipment', serial_number: 'C2-RW-001', purchase_date: '2022-03-15', purchase_value: 250000, current_value: 200000, condition: 'good', location: 'CrossFit Zone' },
    { name: 'Rogue Power Rack', category: 'Strength Equipment', serial_number: 'RG-PR-001', purchase_date: '2022-01-15', purchase_value: 180000, current_value: 150000, condition: 'good', location: 'Strength Zone' },
    { name: 'Rogue Power Rack', category: 'Strength Equipment', serial_number: 'RG-PR-002', purchase_date: '2022-01-15', purchase_value: 180000, current_value: 150000, condition: 'fair', location: 'Strength Zone' },
    { name: 'Assault Bike', category: 'CrossFit Equipment', serial_number: 'AB-001', purchase_date: '2022-06-01', purchase_value: 150000, current_value: 110000, condition: 'good', location: 'CrossFit Zone' },
    { name: 'Spin Bike - Keiser M3i', category: 'Spin Studio', serial_number: 'KS-SP-001', purchase_date: '2022-02-20', purchase_value: 320000, current_value: 260000, condition: 'good', location: 'Velocity Studio' },
    { name: 'Styku 3D Body Scanner', category: 'Technology', serial_number: 'STK-001', purchase_date: '2023-01-15', purchase_value: 1200000, current_value: 1050000, condition: 'good', location: 'Wellness Area' },
    { name: 'MacBook Pro - Front Desk', category: 'IT Equipment', serial_number: 'APL-MB-001', purchase_date: '2022-05-01', purchase_value: 250000, current_value: 180000, condition: 'good', location: 'Front Desk' },
    { name: 'iPad - Check-in Kiosk', category: 'IT Equipment', serial_number: 'APL-IP-001', purchase_date: '2022-05-01', purchase_value: 85000, current_value: 55000, condition: 'good', location: 'Entrance' },
    { name: 'Pool Maintenance Kit', category: 'Aquatics', serial_number: 'PMK-001', purchase_date: '2022-06-15', purchase_value: 45000, current_value: 30000, condition: 'good', location: 'Rooftop Pool' },
    { name: 'Defibrillator (AED)', category: 'Safety Equipment', serial_number: 'AED-001', purchase_date: '2022-01-05', purchase_value: 180000, current_value: 160000, condition: 'good', location: 'Main Floor' },
  ];

  let created = 0;
  for (const asset of assets) {
    const { error } = await supabase
      .from('company_assets')
      .insert({
        ...asset,
        tenant_id: tenantId,
        status: 'active'
      });

    if (error) {
      if (error.message.includes('duplicate') || error.code === '23505') {
        // skip
      } else {
        console.error(`  ❌ Error creating asset "${asset.name}":`, error.message);
      }
    } else {
      created++;
    }
  }

  console.log(`✅ Created ${created} company assets`);
}

// ============ MAIN ============
async function main() {
  console.log('');
  console.log('🎯 ====================================');
  console.log('   VMX FITNESS - Demo Data Seeder');
  console.log('====================================');
  console.log('');

  try {
    // Step 1: Create tenant
    const tenantId = await createTenant();

    // Step 2: Create branch
    await createBranch(tenantId);

    // Step 3: Create departments
    await createDepartments(tenantId);

    // Step 4: Create employee profiles
    await createEmployeeProfiles(tenantId);

    // Step 5: Create company assets
    await createAssets(tenantId);

    console.log('');
    console.log('🎉 ====================================');
    console.log('   DEMO DATA SEEDED SUCCESSFULLY!');
    console.log('====================================');
    console.log('');
    console.log('📋 Summary:');
    console.log(`   Tenant ID: ${tenantId}`);
    console.log(`   Tenant: VMX Fitness (vmx-fitness)`);
    console.log(`   Type: Corporate`);
    console.log(`   Departments: ${DEPARTMENTS.length}`);
    console.log(`   Employees: ${EMPLOYEES.length}`);
    console.log(`   Brand Color: ${TENANT_CONFIG.primary_color} (Orange)`);
    console.log('');
    console.log('📌 NEXT STEPS:');
    console.log('   1. Run the app: npm run dev');
    console.log('   2. Go to: http://localhost:8080/register');
    console.log('   3. Register as VMX Fitness admin:');
    console.log('      - Institution Name: VMX Fitness');
    console.log('      - Slug: vmx-fitness');
    console.log('      - Use your email + set a password');
    console.log('   4. Confirm your email');
    console.log('   5. Log in and explore the demo!');
    console.log('');

  } catch (error) {
    console.error('💥 Fatal error:', error.message);
    process.exit(1);
  }
}

main();
