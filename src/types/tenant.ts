export interface Tenant {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  favicon_url: string | null;
  primary_color: string;
  settings: Record<string, any>;
  subscription_tier: 'trial' | 'basic' | 'professional' | 'enterprise';
  subscription_status: 'active' | 'past_due' | 'canceled' | 'suspended';
  subscription_ends_at: string | null;
  max_employees: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  tenant_type?: 'school' | 'corporate';
  features?: Record<string, boolean>;
}

export interface SaasAdmin {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  access_level: 'full' | 'readonly' | 'support';
  created_at: string;
}

export interface TenantUser {
  id: string;
  tenant_id: string;
  user_id: string;
  is_tenant_admin: boolean;
  created_at: string;
}

export interface TenantWithStats extends Tenant {
  employee_count?: number;
  user_count?: number;
}

export const SUBSCRIPTION_TIERS = {
  trial: {
    name: 'Trial',
    maxEmployees: 10,
    price: 0,
    features: ['Basic HR features', '14-day trial']
  },
  basic: {
    name: 'Basic',
    maxEmployees: 25,
    price: 29,
    features: ['Core HR features', 'Email support', 'Leave management']
  },
  professional: {
    name: 'Professional',
    maxEmployees: 100,
    price: 79,
    features: ['Full features', 'Priority support', 'Performance evaluations', 'Recruitment']
  },
  enterprise: {
    name: 'Enterprise',
    maxEmployees: -1, // Unlimited
    price: -1, // Custom
    features: ['Unlimited employees', 'Custom features', 'Dedicated support', 'SLA']
  }
} as const;
