// ============================================
// KENYAN PAYROLL STATUTORY DEDUCTIONS CALCULATOR
// Updated for 2025/2026 tax year
// ============================================

export interface PayrollDeductions {
  grossSalary: number;
  // PAYE
  taxableIncome: number;
  paye: number;
  personalRelief: number;
  insuranceRelief: number;
  netPaye: number;
  // NHIF / SHA (Social Health Insurance Fund)
  shif: number;
  // NSSF
  nssfTierI: number;
  nssfTierII: number;
  nssfTotal: number;
  // Housing Levy
  housingLevy: number;
  // Totals
  totalDeductions: number;
  netSalary: number;
  // Employer costs
  employerNssf: number;
  employerHousingLevy: number;
  totalEmployerCost: number;
}

export interface PayrollAllowances {
  houseAllowance?: number;
  transportAllowance?: number;
  overtimeAllowance?: number;
  otherAllowances?: number;
}

export interface PayrollOtherDeductions {
  loanRepayment?: number;
  saccoContribution?: number;
  unionDues?: number;
  otherDeductions?: number;
}

// ============================================
// PAYE Tax Bands (Monthly) - Kenya 2025/2026
// ============================================
const PAYE_BANDS = [
  { min: 0, max: 24000, rate: 0.10 },
  { min: 24001, max: 32333, rate: 0.25 },
  { min: 32334, max: 500000, rate: 0.30 },
  { min: 500001, max: 800000, rate: 0.325 },
  { min: 800001, max: Infinity, rate: 0.35 },
];

const PERSONAL_RELIEF = 2400; // KES per month
const INSURANCE_RELIEF_RATE = 0.15; // 15% of SHIF contribution
const MAX_INSURANCE_RELIEF = 5000 / 12; // KES 5,000/year ≈ 416.67/month

// ============================================
// SHIF (Social Health Insurance Fund) - Replaced NHIF
// ============================================
const SHIF_RATE = 0.0275; // 2.75% of gross salary

// ============================================
// NSSF (National Social Security Fund) - Tier System
// ============================================
const NSSF_TIER_I_LIMIT = 7000; // KES
const NSSF_TIER_II_UPPER = 36000; // KES
const NSSF_RATE = 0.06; // 6%

// ============================================
// Affordable Housing Levy
// ============================================
const HOUSING_LEVY_RATE = 0.015; // 1.5%

/**
 * Calculate PAYE (Pay As You Earn) tax
 */
export function calculatePAYE(taxableIncome: number): number {
  if (taxableIncome <= 0) return 0;

  let tax = 0;
  let remaining = taxableIncome;

  for (const band of PAYE_BANDS) {
    if (remaining <= 0) break;
    const bandWidth = band.max === Infinity ? remaining : Math.min(remaining, band.max - band.min + 1);
    tax += bandWidth * band.rate;
    remaining -= bandWidth;
  }

  return Math.round(tax * 100) / 100;
}

/**
 * Calculate SHIF (Social Health Insurance Fund) contribution
 */
export function calculateSHIF(grossSalary: number): number {
  if (grossSalary <= 0) return 0;
  return Math.round(grossSalary * SHIF_RATE * 100) / 100;
}

/**
 * Calculate NSSF contributions (employee portion)
 */
export function calculateNSSF(grossSalary: number): { tierI: number; tierII: number; total: number } {
  if (grossSalary <= 0) return { tierI: 0, tierII: 0, total: 0 };

  // Tier I: 6% of first KES 7,000
  const tierI = Math.min(grossSalary, NSSF_TIER_I_LIMIT) * NSSF_RATE;

  // Tier II: 6% of amount between 7,001 and 36,000
  let tierII = 0;
  if (grossSalary > NSSF_TIER_I_LIMIT) {
    const tierIIAmount = Math.min(grossSalary, NSSF_TIER_II_UPPER) - NSSF_TIER_I_LIMIT;
    tierII = tierIIAmount * NSSF_RATE;
  }

  return {
    tierI: Math.round(tierI * 100) / 100,
    tierII: Math.round(tierII * 100) / 100,
    total: Math.round((tierI + tierII) * 100) / 100,
  };
}

/**
 * Calculate Affordable Housing Levy
 */
export function calculateHousingLevy(grossSalary: number): number {
  if (grossSalary <= 0) return 0;
  return Math.round(grossSalary * HOUSING_LEVY_RATE * 100) / 100;
}

/**
 * Calculate full payroll deductions for an employee
 */
export function calculatePayroll(
  basicSalary: number,
  allowances?: PayrollAllowances,
  otherDeductions?: PayrollOtherDeductions
): PayrollDeductions & { otherDeductionsTotal: number; allowancesTotal: number } {
  // Calculate gross salary
  const allowancesTotal =
    (allowances?.houseAllowance || 0) +
    (allowances?.transportAllowance || 0) +
    (allowances?.overtimeAllowance || 0) +
    (allowances?.otherAllowances || 0);

  const grossSalary = basicSalary + allowancesTotal;

  // NSSF (deducted before PAYE)
  const nssf = calculateNSSF(grossSalary);

  // SHIF
  const shif = calculateSHIF(grossSalary);

  // Housing Levy
  const housingLevy = calculateHousingLevy(grossSalary);

  // Taxable income = Gross - NSSF employee contribution - Housing Levy
  const taxableIncome = Math.max(0, grossSalary - nssf.total - housingLevy);

  // PAYE
  const paye = calculatePAYE(taxableIncome);

  // Reliefs
  const personalRelief = PERSONAL_RELIEF;
  const insuranceRelief = Math.min(shif * INSURANCE_RELIEF_RATE, MAX_INSURANCE_RELIEF);

  // Net PAYE (after reliefs)
  const netPaye = Math.max(0, paye - personalRelief - insuranceRelief);

  // Other deductions
  const otherDeductionsTotal =
    (otherDeductions?.loanRepayment || 0) +
    (otherDeductions?.saccoContribution || 0) +
    (otherDeductions?.unionDues || 0) +
    (otherDeductions?.otherDeductions || 0);

  // Total statutory deductions
  const totalDeductions = netPaye + shif + nssf.total + housingLevy + otherDeductionsTotal;

  // Net salary
  const netSalary = grossSalary - totalDeductions;

  // Employer costs
  const employerNssf = nssf.total; // Employer matches employee NSSF
  const employerHousingLevy = housingLevy; // Employer matches housing levy
  const totalEmployerCost = grossSalary + employerNssf + employerHousingLevy;

  return {
    grossSalary,
    taxableIncome,
    paye,
    personalRelief,
    insuranceRelief,
    netPaye,
    shif,
    nssfTierI: nssf.tierI,
    nssfTierII: nssf.tierII,
    nssfTotal: nssf.total,
    housingLevy,
    totalDeductions,
    netSalary,
    employerNssf,
    employerHousingLevy,
    totalEmployerCost,
    otherDeductionsTotal,
    allowancesTotal,
  };
}

/**
 * Format currency as KES
 */
export function formatKES(amount: number): string {
  return `KES ${amount.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Get month name from month number (1-12)
 */
export function getMonthName(month: number): string {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[month - 1] || 'Unknown';
}

/**
 * Get current payroll period (month/year)
 */
export function getCurrentPayrollPeriod(): { month: number; year: number } {
  const now = new Date();
  return { month: now.getMonth() + 1, year: now.getFullYear() };
}
