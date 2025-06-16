
export interface BaseSchemeConfig {
  start_date: string;
  maturity_date: string;
  principal_amount: number;
  frequency: 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'IRREGULAR';
}

export interface PPFDepositEntry {
  date: string; // YYYY-MM-DD format
  amount: number;
  month: string; // YYYY-MM format for easier lookup
  is_eligible_for_interest: boolean; // deposited before 5th
}

export interface PPFInterestRateEntry {
  date: string; // YYYY-MM-DD format
  rate: number;
}

export interface PPFSchemeConfig {
  annual_limit: number;
  deposit_schedule: PPFDepositEntry[];
  interest_rate_history: PPFInterestRateEntry[];
  interest_calculation_date: number; // 5th of month
  skipped_months: string[]; // YYYY-MM format
}

export interface PPFInvestmentConfig {
  type: 'PPF';
  base_config: BaseSchemeConfig;
  scheme_specific_config: PPFSchemeConfig;
}

export interface CalculationResult {
  totalInvested: number;
  totalQuantity: number;
  averagePrice: number;
  currentValue: number;
  profitLoss: number;
  profitLossPercentage: number;
  totalRecurringContributions?: number;
  projectedMaturityValue?: number;
  yearsToMaturity?: number;
  monthsSkipped?: number;
  monthsPaused?: number;
  monthlyBreakdown?: MonthlyContribution[];
  annualLimitUsed?: number;
  annualLimitRemaining?: number;
}

export interface MonthlyContribution {
  month: string;
  contribution: number;
  interestRate: number;
  balance: number;
  status: 'contributed' | 'skipped' | 'paused';
  interestEarned?: number;
  cumulativeInterest?: number;
  // PPF specific fields
  isEligibleForInterest?: boolean;
  accumulatedInterest?: number;
  creditedThisMonth?: number;
}
