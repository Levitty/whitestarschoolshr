

## Fix "Unknown Employee" in Leave Records

### Root Cause
Two users (`elizaqueen028@gmail.com`, `jonathanmuragizi2@gmail.com`) have no `employee_profiles` record linked to them, and their `profiles` entries have `null` for `first_name` and `last_name`. The enrichment hook falls back to the `profiles` table correctly, but the display components don't handle null names gracefully.

The fix was applied to `LeaveApprovalList.tsx` but **not** to `ApprovedLeavesList.tsx` (line 306), which still uses the old `${employee.first_name} ${employee.last_name}` pattern -- resulting in "null null" or "Unknown Employee".

### Changes

**1. `src/components/ApprovedLeavesList.tsx` (line 306)**
- Apply the same name-with-email-fallback pattern already used in `LeaveApprovalList.tsx`
- If names are null, show the email address instead

**2. `src/components/LeaveBalanceManager.tsx` (line 355)**
- Apply the same fix there too for consistency

Both changes follow this pattern:
```
employee.first_name || employee.last_name
  ? trim the names together
  : show employee.email || 'Unknown Employee'
```

