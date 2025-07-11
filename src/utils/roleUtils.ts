
import { UserRole } from '@/types/auth';

// Map legacy roles to current roles
export const normalizeRole = (role: string | null): UserRole | null => {
  if (!role) return null;
  
  // Map 'admin' to 'superadmin' for backward compatibility
  if (role === 'admin') return 'superadmin';
  
  // Validate role is one of the expected values
  const validRoles: UserRole[] = ['superadmin', 'admin', 'head', 'teacher', 'staff'];
  return validRoles.includes(role as UserRole) ? (role as UserRole) : null;
};

export const getRoleDisplayName = (role: UserRole | null): string => {
  switch (role) {
    case 'superadmin':
    case 'admin':
      return 'Super Administrator';
    case 'head':
      return 'Department Head';
    case 'teacher':
      return 'Teacher';
    case 'staff':
      return 'Staff Member';
    default:
      return 'User';
  }
};

export const getRoleColor = (role: UserRole | null): string => {
  switch (role) {
    case 'superadmin':
    case 'admin':
      return 'bg-red-900 border-red-800';
    case 'head':
      return 'bg-purple-900 border-purple-800';
    case 'teacher':
      return 'bg-green-900 border-green-800';
    case 'staff':
      return 'bg-blue-900 border-blue-800';
    default:
      return 'bg-blue-900 border-blue-800';
  }
};

export const hasRoleAccess = (userRole: UserRole | null, requiredRoles: UserRole[]): boolean => {
  if (!userRole) return false;
  
  // Normalize the user role
  const normalizedRole = normalizeRole(userRole);
  if (!normalizedRole) return false;
  
  // Check if user has any of the required roles (including admin -> superadmin mapping)
  return requiredRoles.some(role => {
    const normalizedRequired = normalizeRole(role);
    return normalizedRole === normalizedRequired;
  });
};
