
-- Create roles table
CREATE TABLE public.roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create permissions table  
CREATE TABLE public.permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  module text, -- To group permissions by module (e.g., 'employees', 'performance')
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create role_permissions junction table
CREATE TABLE public.role_permissions (
  role_id uuid REFERENCES public.roles(id) ON DELETE CASCADE,
  permission_id uuid REFERENCES public.permissions(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (role_id, permission_id)
);

-- Create audits table for logging changes
CREATE TABLE public.audits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  action text NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
  table_name text NOT NULL,
  record_id uuid,
  old_values jsonb,
  new_values jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- Insert default roles
INSERT INTO public.roles (name, description) VALUES
  ('superadmin', 'Full system access with all permissions'),
  ('head', 'Department management and team oversight'),
  ('teacher', 'Teaching-focused access with self-service capabilities'),
  ('staff', 'Basic self-service access for personal information');

-- Insert default permissions
INSERT INTO public.permissions (name, description, module) VALUES
  ('view_employees', 'View employee profiles and information', 'employees'),
  ('edit_employees', 'Create and edit employee records', 'employees'),
  ('delete_employees', 'Delete employee records', 'employees'),
  ('view_performance', 'View performance evaluations', 'performance'),
  ('edit_performance', 'Create and edit performance evaluations', 'performance'),
  ('approve_performance', 'Approve performance evaluations', 'performance'),
  ('view_recruitment', 'View recruitment data and applications', 'recruitment'),
  ('edit_recruitment', 'Manage job postings and applications', 'recruitment'),
  ('approve_leaves', 'Approve or reject leave requests', 'leave'),
  ('view_leaves', 'View leave requests and balances', 'leave'),
  ('edit_leaves', 'Create and edit leave requests', 'leave'),
  ('view_documents', 'View documents and files', 'documents'),
  ('edit_documents', 'Upload and manage documents', 'documents'),
  ('view_reports', 'View system reports and analytics', 'reports'),
  ('manage_settings', 'Access system settings and configuration', 'settings'),
  ('manage_roles', 'Manage roles and permissions', 'settings');

-- Get role IDs for permission assignment
DO $$
DECLARE
  superadmin_role_id uuid;
  head_role_id uuid;
  teacher_role_id uuid;
  staff_role_id uuid;
  perm_id uuid;
BEGIN
  -- Get role IDs
  SELECT id INTO superadmin_role_id FROM public.roles WHERE name = 'superadmin';
  SELECT id INTO head_role_id FROM public.roles WHERE name = 'head';
  SELECT id INTO teacher_role_id FROM public.roles WHERE name = 'teacher';
  SELECT id INTO staff_role_id FROM public.roles WHERE name = 'staff';

  -- Assign ALL permissions to superadmin
  FOR perm_id IN SELECT id FROM public.permissions LOOP
    INSERT INTO public.role_permissions (role_id, permission_id) VALUES (superadmin_role_id, perm_id);
  END LOOP;

  -- Assign permissions to head role
  INSERT INTO public.role_permissions (role_id, permission_id)
  SELECT head_role_id, p.id FROM public.permissions p 
  WHERE p.name IN ('view_employees', 'edit_employees', 'view_performance', 'edit_performance', 'approve_performance', 'approve_leaves', 'view_leaves', 'view_documents', 'edit_documents', 'view_reports');

  -- Assign permissions to teacher role
  INSERT INTO public.role_permissions (role_id, permission_id)
  SELECT teacher_role_id, p.id FROM public.permissions p 
  WHERE p.name IN ('view_performance', 'edit_leaves', 'view_leaves', 'view_documents', 'edit_documents');

  -- Assign permissions to staff role
  INSERT INTO public.role_permissions (role_id, permission_id)
  SELECT staff_role_id, p.id FROM public.permissions p 
  WHERE p.name IN ('edit_leaves', 'view_leaves', 'view_documents');
END $$;

-- Add role_id column to profiles table and update existing records
ALTER TABLE public.profiles ADD COLUMN role_id uuid REFERENCES public.roles(id);

-- Update existing profiles to use role_id instead of role text
UPDATE public.profiles SET role_id = (
  SELECT r.id FROM public.roles r WHERE r.name = 
    CASE 
      WHEN profiles.role = 'superadmin' THEN 'superadmin'
      WHEN profiles.role = 'admin' THEN 'superadmin' -- Map old admin to superadmin
      WHEN profiles.role = 'head' THEN 'head'
      WHEN profiles.role = 'teacher' THEN 'teacher'
      WHEN profiles.role = 'staff' THEN 'staff'
      ELSE 'staff' -- Default fallback
    END
);

-- Enable RLS on new tables
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audits ENABLE ROW LEVEL SECURITY;

-- RLS policies for roles table
CREATE POLICY "Anyone can view roles" ON public.roles
FOR SELECT USING (true);

CREATE POLICY "Superadmins can manage roles" ON public.roles
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    JOIN public.roles r ON p.role_id = r.id
    WHERE p.id = auth.uid() AND r.name = 'superadmin'
  )
);

-- RLS policies for permissions table
CREATE POLICY "Anyone can view permissions" ON public.permissions
FOR SELECT USING (true);

CREATE POLICY "Superadmins can manage permissions" ON public.permissions
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    JOIN public.roles r ON p.role_id = r.id
    WHERE p.id = auth.uid() AND r.name = 'superadmin'
  )
);

-- RLS policies for role_permissions table
CREATE POLICY "Anyone can view role permissions" ON public.role_permissions
FOR SELECT USING (true);

CREATE POLICY "Superadmins can manage role permissions" ON public.role_permissions
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    JOIN public.roles r ON p.role_id = r.id
    WHERE p.id = auth.uid() AND r.name = 'superadmin'
  )
);

-- RLS policies for audits table
CREATE POLICY "Superadmins can view audits" ON public.audits
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    JOIN public.roles r ON p.role_id = r.id
    WHERE p.id = auth.uid() AND r.name = 'superadmin'
  )
);

CREATE POLICY "System can insert audits" ON public.audits
FOR INSERT WITH CHECK (true);

-- Function to check if user has specific permission
CREATE OR REPLACE FUNCTION public.user_has_permission(user_id uuid, permission_name text)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.profiles p
    JOIN public.roles r ON p.role_id = r.id
    JOIN public.role_permissions rp ON r.id = rp.role_id
    JOIN public.permissions perm ON rp.permission_id = perm.id
    WHERE p.id = user_id AND perm.name = permission_name
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Function to get user permissions
CREATE OR REPLACE FUNCTION public.get_user_permissions(user_id uuid)
RETURNS TABLE(permission_name text, permission_description text, module text) AS $$
BEGIN
  RETURN QUERY
  SELECT perm.name, perm.description, perm.module
  FROM public.profiles p
  JOIN public.roles r ON p.role_id = r.id
  JOIN public.role_permissions rp ON r.id = rp.role_id
  JOIN public.permissions perm ON rp.permission_id = perm.id
  WHERE p.id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Trigger function for audit logging
CREATE OR REPLACE FUNCTION public.log_role_permission_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.audits (user_id, action, table_name, record_id, new_values)
    VALUES (auth.uid(), 'INSERT', TG_TABLE_NAME, NEW.role_id, row_to_json(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.audits (user_id, action, table_name, record_id, old_values, new_values)
    VALUES (auth.uid(), 'UPDATE', TG_TABLE_NAME, NEW.role_id, row_to_json(OLD), row_to_json(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.audits (user_id, action, table_name, record_id, old_values)
    VALUES (auth.uid(), 'DELETE', TG_TABLE_NAME, OLD.role_id, row_to_json(OLD));
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for audit logging
CREATE TRIGGER role_permissions_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.role_permissions
  FOR EACH ROW EXECUTE FUNCTION public.log_role_permission_changes();

-- Update updated_at trigger for roles and permissions
CREATE TRIGGER update_roles_updated_at
  BEFORE UPDATE ON public.roles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_permissions_updated_at
  BEFORE UPDATE ON public.permissions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
