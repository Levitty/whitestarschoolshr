
export type UserRole = 'superadmin' | 'admin' | 'head' | 'teacher' | 'staff';

export interface Profile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  department: string | null;
  role: UserRole | null;
  avatar_url: string | null;
  phone: string | null;
  employee_id: string | null;
  hire_date: string | null;
  is_active: boolean | null;
  status: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface AuthContextType {
  user: any | null;
  session: any | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, department: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  refreshSession: () => Promise<void>;
  hasRole: (role: UserRole) => boolean;
  isSuperAdmin: () => boolean;
}
