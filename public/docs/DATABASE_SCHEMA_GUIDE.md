# Whitestar Schools HR — Supabase Database Schema Guide

**Generated:** March 4, 2026  
**Project ID:** rogwhlgqsyasbemnovgf

---

## 1. TABLES OVERVIEW

### Existing Tables

| Category | Tables |
|----------|--------|
| **Identity** | `profiles`, `employee_profiles`, `employees` |
| **Leave** | `leave_requests`, `leave_balances` |
| **Documents** | `documents`, `document_templates`, `document_shares`, `document_signatures` |
| **Performance** | `evaluations`, `corporate_evaluations` |
| **Recruitment** | `job_listings`, `job_applications`, `interviews`, `interview_records` |
| **Assets** | `company_assets`, `asset_assignments` |
| **Offboarding** | `offboarding_clearance`, `clearance_items`, `clearance_approvals`, `clearance_deductions` |
| **Sales** | `employee_sales_targets` |
| **Organization** | `departments`, `branches`, `tenants`, `tenant_users` |
| **Roles & Permissions** | `user_roles`, `roles`, `permissions`, `role_permissions` |
| **System** | `audits`, `contract_reminders`, `saas_admins` |

### Tables That DO NOT Exist Yet

- ❌ No `attendance` table
- ❌ No `hours_worked` / `timesheets` table
- ❌ No `projects` table
- ❌ No `tasks` table

---

## 2. EMPLOYEE TABLE STRUCTURE

There are **3 identity tables** with different purposes:

### 2.1 `profiles` (Auth-linked user account)

| Column | Type | Nullable | Purpose |
|--------|------|----------|---------|
| `id` | uuid | No | Primary key, equals `auth.users.id` |
| `email` | text | No | Login email |
| `first_name` | text | Yes | First name |
| `last_name` | text | Yes | Last name |
| `full_name` | text | Yes | Full display name |
| `role` | text | Yes | `superadmin/admin/head/deputy_head/teacher/staff/secretary/driver/support_staff` |
| `department` | text | Yes | Department name |
| `branch` | text | Yes | Branch name |
| `tenant_id` | uuid | Yes | Multi-tenant isolation |
| `status` | text | Yes | `pending/active/inactive/suspended` |
| `is_active` | boolean | Yes | Active flag |
| `employee_id` | text | Yes | Employee number string |
| `phone` | text | Yes | Phone number |
| `avatar_url` | text | Yes | Profile photo URL |
| `hire_date` | text | Yes | Date of hire |
| `id_number` | text | Yes | National ID number |
| `kra_pin` | text | Yes | KRA PIN |
| `birth_date` | text | Yes | Date of birth |
| `gender` | text | Yes | Gender |
| `sha_number` | text | Yes | SHA number |
| `nssf_number` | text | Yes | NSSF number |
| `tsc_number` | text | Yes | TSC number |
| `next_of_kin_name` | text | Yes | Next of kin name |
| `next_of_kin_phone` | text | Yes | Next of kin phone |
| `next_of_kin_relationship` | text | Yes | Next of kin relationship |
| `physical_address` | text | Yes | Physical address |
| `onboarding_completed` | boolean | Yes | Onboarding status |
| `created_at` | timestamptz | Yes | Record creation date |
| `updated_at` | timestamptz | Yes | Last update date |

### 2.2 `employee_profiles` (HR employee record)

| Column | Type | Nullable | Purpose |
|--------|------|----------|---------|
| `id` | uuid | No | Primary key (employee profile ID) |
| `profile_id` | uuid | Yes | **FK → `profiles.id`** |
| `employee_number` | text | No | e.g. "EMP0001" (auto-generated) |
| `first_name` | text | No | First name |
| `last_name` | text | No | Last name |
| `email` | text | No | Email address |
| `phone` | text | Yes | Phone number |
| `address` | text | Yes | Physical address |
| `position` | text | No | Job position/title |
| `department` | text | No | Department |
| `branch` | text | Yes | Branch |
| `salary` | numeric | Yes | Salary amount |
| `contract_type` | text | Yes | Default: 'full-time' |
| `contract_start_date` | date | Yes | Contract start |
| `contract_end_date` | date | Yes | Contract end |
| `contract_duration_months` | integer | Yes | Default: 12 |
| `contract_reminder_sent` | boolean | Yes | Default: false |
| `emergency_contact_name` | text | Yes | Emergency contact |
| `emergency_contact_phone` | text | Yes | Emergency phone |
| `emergency_contact_relationship` | text | Yes | Emergency relationship |
| `status` | text | Yes | Default: 'active' |
| `avatar_url` | text | Yes | Photo URL |
| `tenant_id` | uuid | Yes | Tenant isolation |
| `hire_date` | date | No | Hire date |
| `created_at` | timestamptz | Yes | Created timestamp |
| `updated_at` | timestamptz | Yes | Updated timestamp |

### 2.3 `employees` (Legacy table)

| Column | Type | Nullable | Purpose |
|--------|------|----------|---------|
| `id` | uuid | No | Primary key |
| `profile_id` | uuid | No | **FK → `profiles.id`** |
| `employee_number` | text | No | Employee number |
| `position` | text | No | Job position |
| `contract_type` | text | Yes | Default: 'full-time' |
| `salary_grade` | text | Yes | Salary grade |
| `address` | text | Yes | Address |
| `qualifications` | jsonb | Yes | Qualifications array |
| `certifications` | jsonb | Yes | Certifications array |
| `emergency_contact_name` | text | Yes | Emergency contact |
| `emergency_contact_phone` | text | Yes | Emergency phone |
| `emergency_contact_relationship` | text | Yes | Relationship |
| `status` | text | Yes | Default: 'active' |
| `created_at` | timestamptz | Yes | Created |
| `updated_at` | timestamptz | Yes | Updated |

### How Employees Are Identified

- **Auth user ID**: `profiles.id` (= `auth.uid()`)
- **HR record ID**: `employee_profiles.id` (linked via `employee_profiles.profile_id`)
- **Employee number**: `employee_profiles.employee_number` (e.g. "EMP0001")
- **Email**: `profiles.email` or `employee_profiles.email`

---

## 3. LEAVE MANAGEMENT

### `leave_balances` table

| Column | Type | Default |
|--------|------|---------|
| `id` | uuid | auto |
| `employee_id` | uuid | FK → `employee_profiles.id` |
| `year` | integer | required |
| `annual_leave_total` | integer | 21 |
| `annual_leave_used` | integer | 0 |
| `sick_leave_total` | integer | 10 |
| `sick_leave_used` | integer | 0 |
| `maternity_leave_total` | integer | 90 |
| `maternity_leave_used` | integer | 0 |
| `study_leave_total` | integer | 10 |
| `study_leave_used` | integer | 0 |
| `unpaid_leave_total` | integer | 30 |
| `unpaid_leave_used` | integer | 0 |
| `tenant_id` | uuid | nullable |

### `leave_requests` table

| Column | Type | Purpose |
|--------|------|---------|
| `id` | uuid | Primary key |
| `employee_id` | uuid | FK → `profiles.id` |
| `leave_type` | text | Type of leave |
| `start_date` | date | Start date |
| `end_date` | date | End date |
| `days_requested` | integer | Number of days |
| `reason` | text | Reason for leave |
| `status` | text | `pending/approved/rejected` |
| `workflow_stage` | text | Approval workflow stage |
| `approved_by` | uuid | FK → `profiles.id` |
| `approved_at` | timestamptz | Approval timestamp |
| `head_reviewed_by` | uuid | Head reviewer |
| `head_reviewed_at` | timestamptz | Head review time |
| `head_recommendation` | text | Head's recommendation |
| `head_internal_notes` | text | Internal notes |
| `proof_url` | text | Supporting document URL |
| `proof_file_name` | text | Supporting document name |
| `comments` | text | Comments |
| `tenant_id` | uuid | Tenant isolation |

---

## 4. DATA AVAILABILITY FOR AN EMPLOYEE (e.g. "Ruth Joy")

| Data Point | Available? | Source Table | Key Column |
|-----------|-----------|-------------|------------|
| Profile info | ✅ Yes | `profiles` + `employee_profiles` | `profiles.id` |
| Leave balance | ✅ Yes | `leave_balances` | `employee_profiles.id` |
| Leave requests | ✅ Yes | `leave_requests` | `profiles.id` |
| Documents | ✅ Yes | `documents` | `profiles.id` |
| Evaluations | ✅ Yes | `evaluations` | `employee_profiles.id` |
| Corporate evaluations | ✅ Yes | `corporate_evaluations` | `employee_profiles.id` |
| Assigned assets | ✅ Yes | `company_assets` | `profiles.id` |
| Sales targets | ✅ Yes | `employee_sales_targets` | `employee_profiles.id` |
| Hours worked | ❌ No | — | No table exists |
| Projects | ❌ No | — | No table exists |
| Tasks | ❌ No | — | No table exists |
| Attendance | ❌ No | — | No table exists |

---

## 5. RELATIONSHIPS DIAGRAM

```
auth.users.id
  └── profiles.id (1:1, created by handle_new_user trigger)
        │
        ├── employee_profiles.profile_id (1:1)
        │     ├── leave_balances.employee_id → employee_profiles.id
        │     ├── evaluations.employee_id → employee_profiles.id
        │     ├── corporate_evaluations.employee_id → employee_profiles.id
        │     ├── employee_sales_targets.employee_id → employee_profiles.id
        │     └── contract_reminders.employee_id → employee_profiles.id
        │
        ├── leave_requests.employee_id → profiles.id
        ├── documents.employee_id → profiles.id (nullable)
        ├── documents.uploaded_by → profiles.id
        ├── company_assets.assigned_to → profiles.id
        ├── asset_assignments.employee_id → profiles.id
        ├── user_roles.user_id → auth.users.id
        └── tenant_users.user_id → auth.users.id

tenants.id
  ├── tenant_users.tenant_id
  ├── profiles.tenant_id
  ├── employee_profiles.tenant_id
  ├── departments.tenant_id
  ├── branches.tenant_id
  ├── leave_balances.tenant_id
  ├── leave_requests.tenant_id
  ├── documents.tenant_id
  ├── evaluations.tenant_id
  ├── job_listings.tenant_id
  ├── job_applications.tenant_id
  ├── interviews.tenant_id
  ├── company_assets.tenant_id
  └── ... (all tenant-scoped tables)
```

**⚠️ Key distinction:** `leave_requests.employee_id` references `profiles.id`, but `leave_balances.employee_id` references `employee_profiles.id`. You must resolve the link via `employee_profiles.profile_id`.

---

## 6. SAMPLE QUERIES (JavaScript / Supabase SDK)

### 6.1 Get Employee Profile by Email

```typescript
import { supabase } from "@/integrations/supabase/client";

const { data: profile, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('email', 'ruthjoy@example.com')
  .single();
```

### 6.2 Get Employee's HR Profile (employee_profiles)

```typescript
const { data: empProfile } = await supabase
  .from('employee_profiles')
  .select('*')
  .eq('profile_id', profile.id)
  .single();
```

### 6.3 Get Employee's Leave Balance

```typescript
const { data: leaveBalance } = await supabase
  .from('leave_balances')
  .select('*')
  .eq('employee_id', empProfile.id) // uses employee_profiles.id
  .eq('year', new Date().getFullYear())
  .single();

// Calculate remaining days:
const annualRemaining = (leaveBalance.annual_leave_total || 0) - (leaveBalance.annual_leave_used || 0);
const sickRemaining = (leaveBalance.sick_leave_total || 0) - (leaveBalance.sick_leave_used || 0);
```

### 6.4 Get Employee's Leave Requests

```typescript
const { data: leaveRequests } = await supabase
  .from('leave_requests')
  .select('*')
  .eq('employee_id', profile.id) // uses profiles.id
  .order('created_at', { ascending: false });
```

### 6.5 Get Employee's Documents

```typescript
const { data: documents } = await supabase
  .from('documents')
  .select('*')
  .eq('employee_id', profile.id)
  .order('created_at', { ascending: false });
```

### 6.6 Get Employee's Evaluations

```typescript
const { data: evaluations } = await supabase
  .from('evaluations')
  .select('*')
  .eq('employee_id', empProfile.id) // uses employee_profiles.id
  .order('created_at', { ascending: false });
```

### 6.7 Get Employee's Corporate Evaluations

```typescript
const { data: corpEvals } = await supabase
  .from('corporate_evaluations')
  .select('*')
  .eq('employee_id', empProfile.id)
  .order('created_at', { ascending: false });
```

### 6.8 Get Employee's Assigned Assets

```typescript
const { data: assets } = await supabase
  .from('company_assets')
  .select('*')
  .eq('assigned_to', profile.id); // uses profiles.id
```

### 6.9 Get Employee's Asset Assignment History

```typescript
const { data: assignments } = await supabase
  .from('asset_assignments')
  .select('*, company_assets(*)')
  .eq('employee_id', profile.id)
  .order('assigned_date', { ascending: false });
```

### 6.10 Get Employee's Sales Targets

```typescript
const { data: salesTargets } = await supabase
  .from('employee_sales_targets')
  .select('*')
  .eq('employee_id', empProfile.id);
```

### 6.11 Full Employee Dashboard Query

```typescript
// Step 1: Get profile
const { data: profile } = await supabase
  .from('profiles')
  .select('*')
  .eq('email', 'ruthjoy@example.com')
  .single();

// Step 2: Get employee profile
const { data: empProfile } = await supabase
  .from('employee_profiles')
  .select('*')
  .eq('profile_id', profile.id)
  .single();

// Step 3: Fetch all data in parallel
const [leaveBalance, leaveRequests, documents, evaluations, assets] = await Promise.all([
  supabase
    .from('leave_balances')
    .select('*')
    .eq('employee_id', empProfile.id)
    .eq('year', new Date().getFullYear())
    .single(),

  supabase
    .from('leave_requests')
    .select('*')
    .eq('employee_id', profile.id)
    .order('created_at', { ascending: false })
    .limit(10),

  supabase
    .from('documents')
    .select('*')
    .eq('employee_id', profile.id)
    .order('created_at', { ascending: false })
    .limit(10),

  supabase
    .from('evaluations')
    .select('*')
    .eq('employee_id', empProfile.id)
    .order('created_at', { ascending: false })
    .limit(5),

  supabase
    .from('company_assets')
    .select('*')
    .eq('assigned_to', profile.id),
]);
```

---

## 7. ROLE-BASED ACCESS

### User Roles (stored in `user_roles` table)

| Role | Level | Description |
|------|-------|-------------|
| `superadmin` | 1 | System administrator |
| `admin` | 2 | Tenant administrator |
| `head` | 3 | Department head |
| `teacher` | 4 | Teacher |
| `secretary` | 5 | Secretary |
| `driver` | 6 | Driver |
| `support_staff` | 7 | Support staff |
| `staff` | 8 | General staff |

### Key Database Functions

| Function | Purpose |
|----------|---------|
| `get_current_user_role()` | Returns the current user's highest role |
| `get_user_tenant_id()` | Returns the current user's tenant ID |
| `has_role(user_id, role)` | Checks if user has a specific role |
| `is_saas_admin()` | Checks if user is a SaaS admin |
| `is_superadmin(user_id)` | Checks if user is superadmin |

---

## 8. STORAGE BUCKETS

| Bucket | Public | Purpose |
|--------|--------|---------|
| `employee-documents` | No | Employee documents (private) |
| `leave-proofs` | No | Leave supporting documents (private) |
| `letterhead-images` | Yes | Company letterhead images |
| `cv-uploads` | Yes | Job application CVs |
| `tenant-assets` | Yes | Tenant branding/logos |
| `media` | Yes | General media files |
| `email-assets` | Yes | Email template assets |

---

## 9. MULTI-TENANT ARCHITECTURE

- Every data table includes a `tenant_id` column for isolation
- RLS policies enforce tenant boundaries using `get_user_tenant_id()`
- Users are linked to tenants via `tenant_users` table or `profiles.tenant_id`
- Employee numbers are auto-generated per tenant via `generate_tenant_employee_number()`

---

## 10. MISSING TABLES (Needed for Full HR)

To support hours tracking, attendance, projects, and tasks, the following tables would need to be created:

1. **`attendance`** — Clock in/out, attendance percentage
2. **`timesheets`** — Hours worked per day/week/month
3. **`projects`** — Project tracking with assignments
4. **`tasks`** — Task management with status tracking

---

*This document is auto-generated from the Supabase schema and codebase analysis.*
