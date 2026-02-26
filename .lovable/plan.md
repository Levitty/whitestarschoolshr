

## Fix: Google SSO Users Missing from Approval Page

### Root Cause

When users sign up via Google SSO, the `AuthCallback.tsx` simply redirects to the dashboard without assigning a `tenant_id` to their profile. The Account Approval Manager (`AccountApprovalManager.tsx`) queries for pending users filtered by `tenant_id = tenant.id`, so users without a `tenant_id` never appear.

### The Fix (2 parts)

**Part 1: Fix existing users (immediate data fix)**

There are 18+ pending users with `tenant_id = null`. We need to assign them to the correct tenant (White Star Schools: `d469abc7-cf00-46b6-a5b0-540855405a50`). This will be done via a SQL update on the `profiles` table.

**Part 2: Fix future Google SSO signups**

Update `AuthCallback.tsx` to automatically assign the correct `tenant_id` to the user's profile after Google SSO login. The logic will:

1. After a successful Google sign-in, check if the user's profile has a `tenant_id`
2. If not, resolve the tenant from the domain (hr.whitestarschools.com) or fall back to a default tenant lookup
3. Update the profile with the resolved `tenant_id`

This mirrors what the Staff Signup Form already does for manual signups.

### Files Changed

- `src/pages/AuthCallback.tsx` -- Add tenant assignment logic after Google SSO callback
- Database update -- Set `tenant_id` for all existing pending users with null `tenant_id`

### Technical Details

In `AuthCallback.tsx`, after the `SIGNED_IN` event:

```text
1. Get the user's profile
2. If profile.tenant_id is null:
   a. Check if current domain is hr.whitestarschools.com -> use White Star tenant ID
   b. Otherwise, look up tenant from URL or fallback
3. Update profiles table with the resolved tenant_id
4. Then redirect to /dashboard
```

The existing `ProtectedRoute` will still block the user with the "Pending Approval" screen, so there's no security risk -- this just makes the user visible in the approval queue.

