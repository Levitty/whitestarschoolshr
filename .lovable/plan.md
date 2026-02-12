

## Make Profile Onboarding Optional

Currently, the system forces users to complete their profile (onboarding) before accessing the dashboard. This change will temporarily bypass that requirement so users can log in freely.

### Changes Required

**1. `src/components/ProtectedRoute.tsx`**
- Remove or comment out the onboarding redirect logic (lines 36-40) that checks `onboarding_completed` and redirects to `/onboarding`

**2. `src/components/EmployeeOnboarding.tsx`**
- Remove the `required` attribute from all form fields
- Remove the required-fields validation check that blocks submission when fields are empty
- Allow the form to submit even if fields are left blank

**3. `src/pages/Onboarding.tsx`**
- Add a "Skip" button so users can go directly to the dashboard without filling anything out

These changes mean:
- Users will no longer be blocked from accessing the dashboard
- The onboarding page will still be accessible if someone wants to fill in their details
- All fields become optional, and users can submit partial information or skip entirely

