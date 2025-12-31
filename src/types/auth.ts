
export type UserRole = 'superadmin' | 'admin' | 'head' | 'deputy_head' | 'teacher' | 'staff' | 'secretary' | 'driver' | 'support_staff';

export type UserStatus = 'pending' | 'active' | 'inactive' | 'suspended';

export interface Profile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  department: string | null;
  role: UserRole | null;
  branch: string | null;
  avatar_url: string | null;
  phone: string | null;
  employee_id: string | null;
  hire_date: string | null;
  is_active: boolean | null;
  status: UserStatus | null;
  created_at: string | null;
  updated_at: string | null;
  // Onboarding fields
  id_number: string | null;
  kra_pin: string | null;
  birth_date: string | null;
  gender: string | null;
  sha_number: string | null;
  nssf_number: string | null;
  tsc_number: string | null;
  next_of_kin_name: string | null;
  next_of_kin_phone: string | null;
  next_of_kin_relationship: string | null;
  physical_address: string | null;
  onboarding_completed: boolean | null;
}

export interface AuthContextType {
  user: any | null;
  session: any | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, department: string, role: UserRole, branch?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  refreshSession: () => Promise<void>;
  hasRole: (role: UserRole) => boolean;
  isSuperAdmin: () => boolean;
}
