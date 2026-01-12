-- Create tasks table for employee task management
CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  assigned_to UUID REFERENCES public.profiles(id),
  assigned_by UUID REFERENCES public.profiles(id),
  category TEXT,
  tenant_id UUID REFERENCES public.tenants(id),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Admins and superadmins can manage all tasks
CREATE POLICY "Admins and superadmins manage all tasks"
ON public.tasks
FOR ALL
USING (get_current_user_role() IN ('admin', 'superadmin'))
WITH CHECK (get_current_user_role() IN ('admin', 'superadmin'));

-- Users can view tasks assigned to them
CREATE POLICY "Users can view assigned tasks"
ON public.tasks
FOR SELECT
USING (assigned_to = auth.uid());

-- Users can update their own assigned tasks (mark complete, etc)
CREATE POLICY "Users can update assigned tasks"
ON public.tasks
FOR UPDATE
USING (assigned_to = auth.uid());

-- Heads can manage tasks for their department
CREATE POLICY "Heads can manage department tasks"
ON public.tasks
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles p1
    JOIN profiles p2 ON p2.id = tasks.assigned_to
    WHERE p1.id = auth.uid() 
    AND p1.role = 'head' 
    AND p1.department = p2.department
  )
);

-- Create trigger for updated_at
CREATE TRIGGER update_tasks_updated_at
BEFORE UPDATE ON public.tasks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add index for performance
CREATE INDEX idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_tasks_due_date ON public.tasks(due_date);