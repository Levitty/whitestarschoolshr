
import { UserRole } from '@/types/auth';

// Map legacy roles to current roles
export const normalizeRole = (role: string | null): UserRole | null => {
  if (!role) return null;
  
  // Map 'admin' to 'superadmin' for backward compatibility
  if (role === 'admin') return 'superadmin';
  
  // Validate role is one of the expected values
  const validRoles: UserRole[] = ['superadmin', 'admin', 'head', 'deputy_head', 'teacher', 'staff', 'secretary', 'driver', 'support_staff'];
  return validRoles.includes(role as UserRole) ? (role as UserRole) : null;
};

// Check if tenant is corporate based on slug or tenant_type
export const isCorporateTenant = (tenantSlugOrType: string | null | undefined, tenantType?: string | null): boolean => {
  // If tenant_type is explicitly provided, use it
  if (tenantType === 'corporate') return true;
  if (tenantType === 'school') return false;
  // Also check if the first argument is a tenant_type value
  if (tenantSlugOrType === 'corporate') return true;
  if (tenantSlugOrType === 'school') return false;
  // Fallback to slug check
  if (!tenantSlugOrType) return false;
  const corporateSlugs = ['enda-sportswear', 'enda', 'corporate'];
  return corporateSlugs.some(slug => tenantSlugOrType.toLowerCase().includes(slug)) ||
         !tenantSlugOrType.toLowerCase().includes('school');
};

export const getRoleDisplayName = (role: UserRole | null, tenantSlugOrType?: string | null, tenantType?: string | null): string => {
  const isCorporate = isCorporateTenant(tenantSlugOrType, tenantType);
  
  if (isCorporate) {
    switch (role) {
      case 'superadmin':
      case 'admin':
        return 'Administrator';
      case 'head':
        return 'Department Head';
      case 'deputy_head':
        return 'Assistant Manager';
      case 'teacher':
        return 'Employee';
      case 'secretary':
        return 'Administrative Assistant';
      case 'driver':
        return 'Driver';
      case 'support_staff':
        return 'Support Staff';
      case 'staff':
        return 'Staff Member';
      default:
        return 'User';
    }
  }
  
  // School mode
  switch (role) {
    case 'superadmin':
    case 'admin':
      return 'Super Administrator';
    case 'head':
      return 'Head Teacher';
    case 'deputy_head':
      return 'Deputy Head Teacher';
    case 'teacher':
      return 'Teacher';
    case 'secretary':
      return 'Secretary';
    case 'driver':
      return 'Driver';
    case 'support_staff':
      return 'Support Staff';
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
    case 'deputy_head':
    case 'teacher':
    case 'secretary':
    case 'driver':
    case 'support_staff':
    case 'staff':
    default:
      return 'bg-sky-600 border-sky-500';
  }
};

export const getAvailableRoles = (tenantSlugOrType?: string | null, tenantType?: string | null): { value: UserRole; label: string }[] => {
  const isCorporate = isCorporateTenant(tenantSlugOrType, tenantType);
  
  if (isCorporate) {
    return [
      { value: 'head', label: 'Department Head' },
      { value: 'deputy_head', label: 'Assistant Manager' },
      { value: 'teacher', label: 'Employee' },
      { value: 'secretary', label: 'Administrative Assistant' },
      { value: 'driver', label: 'Driver' },
      { value: 'support_staff', label: 'Support Staff' },
      { value: 'staff', label: 'General Staff' }
    ];
  }
  
  return [
    { value: 'head', label: 'Head Teacher' },
    { value: 'deputy_head', label: 'Deputy Head Teacher' },
    { value: 'teacher', label: 'Teacher' },
    { value: 'secretary', label: 'Secretary' },
    { value: 'driver', label: 'Driver' },
    { value: 'support_staff', label: 'Support Staff' },
    { value: 'staff', label: 'General Staff' }
  ];
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
