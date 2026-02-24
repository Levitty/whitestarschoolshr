

## Bulk Leave Grant for Midterm / School Breaks

### What This Does

Adds a new "Bulk Leave Grant" section to the Leave Balance tab (visible only to HR/Admin). The admin can:

1. Select a leave type (e.g. Annual Leave)
2. Set start and end dates (e.g. midterm break dates)
3. Enter a reason (e.g. "Midterm Break Term 1")
4. Use a "Select All" checkbox to select all employees, or individually pick employees
5. Click "Grant Leave" to create pre-approved leave records for all selected employees in one action

The leave records will be inserted directly as `approved` with `workflow_stage = 'completed'`, skipping the normal approval workflow since this is an admin action.

### How It Works

- No database changes needed -- the existing `leave_requests` table already supports all necessary fields
- Leave balance deductions will happen automatically since the records are marked as approved (the existing sync logic handles this)
- The feature lives in a new component `BulkLeaveGrant.tsx` rendered inside the "Leave Balance" tab alongside the existing `LeaveBalanceManager`

### Technical Details

**New file: `src/components/BulkLeaveGrant.tsx`**

A card component with:
- Leave type dropdown (Annual, Sick, Maternity, Study, Unpaid)
- Start date and end date pickers
- Reason text field
- Employee list with checkboxes and a "Select All" toggle
- Filter/search by name
- "Grant Leave" button that bulk-inserts leave_requests rows:
  - `status: 'approved'`
  - `workflow_stage: 'completed'`
  - `approved_by: current user id`
  - `approved_at: now`
  - `days_requested`: calculated from date range
  - `tenant_id`: from current user's profile
- After insert, calls the existing balance deduction logic to update `leave_balances`

**Modified file: `src/pages/Leave.tsx`**

- Import and render `BulkLeaveGrant` inside the "balances" tab content (only for HR users), above the existing `LeaveBalanceManager`
- Update tab count from 5 to 6 by adding a dedicated "Bulk Grant" tab for HR, keeping things organized

**Approach for tab layout:**

Add a new tab called "Bulk Grant" visible only to HR/Admin, so the Leave Balance tab stays clean. The tab count for HR increases from 5 to 6.

