import { useTenant } from '@/contexts/TenantContext';

interface TenantLabels {
  employee: string;
  employees: string;
  school: string;
  headTeacher: string;
  department: string;
  teacher: string;
  teachers: string;
  student: string;
  students: string;
  class: string;
  classes: string;
}

interface HiddenFeatures {
  tscNumber: boolean;
  studentsClasses: boolean;
  studentFeedback: boolean;
  classPerformance: boolean;
}

interface CorporateFeatures {
  probationTracker: boolean;
  compensationStructure: boolean;
  salesCommission: boolean;
  workforceDistribution: boolean;
  departmentClearance: boolean;
}

interface TenantLabelsResult {
  isCorporate: boolean;
  labels: TenantLabels;
  hiddenFeatures: HiddenFeatures;
  corporateFeatures: CorporateFeatures;
  tenantName: string;
}

export const useTenantLabels = (): TenantLabelsResult => {
  const { tenant } = useTenant();
  
  const isCorporate = tenant?.slug === 'enda-sportswear';
  
  console.log('useTenantLabels: tenant slug:', tenant?.slug, 'isCorporate:', isCorporate);
  
  const labels: TenantLabels = isCorporate ? {
    employee: 'Employee',
    employees: 'Employees',
    school: 'HQ / Branch',
    headTeacher: 'Department Lead',
    department: 'Department',
    teacher: 'Employee',
    teachers: 'Employees',
    student: 'Client',
    students: 'Clients',
    class: 'Project',
    classes: 'Projects',
  } : {
    employee: 'Teacher',
    employees: 'Teachers',
    school: 'School',
    headTeacher: 'Head Teacher',
    department: 'Department',
    teacher: 'Teacher',
    teachers: 'Teachers',
    student: 'Student',
    students: 'Students',
    class: 'Class',
    classes: 'Classes',
  };

  const hiddenFeatures: HiddenFeatures = {
    tscNumber: isCorporate,
    studentsClasses: isCorporate,
    studentFeedback: isCorporate,
    classPerformance: isCorporate,
  };

  const corporateFeatures: CorporateFeatures = {
    probationTracker: isCorporate,
    compensationStructure: isCorporate,
    salesCommission: isCorporate,
    workforceDistribution: isCorporate,
    departmentClearance: isCorporate,
  };

  return {
    isCorporate,
    labels,
    hiddenFeatures,
    corporateFeatures,
    tenantName: tenant?.name || 'Organization',
  };
};

// Helper function to check if an employee is on probation (hired < 6 months ago)
export const isOnProbation = (hireDate: string | null | undefined): boolean => {
  if (!hireDate) return false;
  
  const hired = new Date(hireDate);
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  
  return hired > sixMonthsAgo;
};

// Helper to calculate days remaining in probation
export const getProbationDaysRemaining = (hireDate: string | null | undefined): number => {
  if (!hireDate) return 0;
  
  const hired = new Date(hireDate);
  const probationEnd = new Date(hired);
  probationEnd.setMonth(probationEnd.getMonth() + 6);
  
  const today = new Date();
  const diffTime = probationEnd.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return Math.max(0, diffDays);
};

// Helper to check if evaluation is sales/commission based
export const isSalesCommissionEvaluation = (evaluationType: string | null | undefined): boolean => {
  if (!evaluationType) return false;
  const lowerType = evaluationType.toLowerCase();
  return lowerType.includes('sales') || lowerType.includes('commission');
};

// Helper to check if task is clearance/offboarding related
export const isClearanceTask = (title: string | null | undefined): boolean => {
  if (!title) return false;
  const lowerTitle = title.toLowerCase();
  return lowerTitle.includes('clearance') || lowerTitle.includes('offboarding');
};
