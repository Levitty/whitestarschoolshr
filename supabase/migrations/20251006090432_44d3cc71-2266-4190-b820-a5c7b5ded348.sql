-- Backfill missing user_roles based on existing profiles.role values
-- Ensures get_current_user_role() returns a role for legacy users
INSERT INTO public.user_roles (user_id, role)
SELECT p.id,
  CASE p.role
    WHEN 'superadmin' THEN 'superadmin'::app_role
    WHEN 'admin' THEN 'admin'::app_role
    WHEN 'head' THEN 'head'::app_role
    WHEN 'teacher' THEN 'teacher'::app_role
    WHEN 'secretary' THEN 'secretary'::app_role
    WHEN 'driver' THEN 'driver'::app_role
    WHEN 'support_staff' THEN 'support_staff'::app_role
    WHEN 'staff' THEN 'staff'::app_role
    ELSE 'staff'::app_role
  END AS role
FROM public.profiles p
LEFT JOIN public.user_roles ur ON ur.user_id = p.id
WHERE ur.user_id IS NULL;