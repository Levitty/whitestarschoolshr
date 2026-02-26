

## Fix: Date of Birth Calendar Not Working on Mobile

### Problem
The date-of-birth calendar picker does not respond to touch/tap on mobile devices. This is a known issue where calendar components inside Popover wrappers lose pointer events on mobile browsers.

### Solution
Add `pointer-events-auto` to the Calendar component's className in all three locations where date-of-birth pickers are used:

1. **`src/pages/MyProfile.tsx`** (line ~335) -- Profile editing page
2. **`src/components/StatutoryOnboardingModal.tsx`** (line ~193) -- Onboarding modal
3. **`src/components/EmployeeOnboarding.tsx`** (line ~125) -- Uses a native `<input type="date">` which should work fine, no change needed

### Technical Details

For both `MyProfile.tsx` and `StatutoryOnboardingModal.tsx`, add `className="pointer-events-auto"` to the `<Calendar>` component:

```text
Before:  <Calendar mode="single" ... />
After:   <Calendar mode="single" ... className="pointer-events-auto" />
```

This ensures touch events pass through to the calendar when it renders inside a Popover/Portal overlay. No other logic or styling changes are needed.

