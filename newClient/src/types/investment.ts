
export enum InvestmentType {
  STOCK = "STOCK",
  MUTUAL_FUND = "MUTUAL_FUND",
  GOLD = "GOLD",
  SILVER = "SILVER",
  PPF = "PPF",
  EPF = "EPF",
  NPS = "NPS",
}

export enum InvestmentPurpose {
  OWNED = "OWNED",
  MONITORING = "MONITORING",
}

export enum RecurringFrequency {
  MONTHLY = "MONTHLY",
  QUARTERLY = "QUARTERLY",
  YEARLY = "YEARLY",
}

export enum InterestRateType {
  FIXED = "FIXED",
  VARIABLE = "VARIABLE",
}

export interface Purchase {
  date: string;
  quantity: number;
  price_per_unit: number;
  total_amount: number;
  fees?: number;
}

export interface InterestRateHistory {
  id: string;
  investment_id: string;
  rate: number;
  effective_date: string;
  created_at: string;
}

export interface ContributionHistory {
  date: string; // Format: "2024-01-15"
  amount: number;
  reason?: string;
}

export interface Investment {
  id: string;
  user_id: string;
  name: string;
  symbol: string;
  type: InvestmentType;
  purpose: InvestmentPurpose;
  target_price?: number;
  purchases: Purchase[];
  created_at: string;
  category_id?: string;
  category?: string;
  notes?: string;
  
  // New recurring investment fields
  is_recurring?: boolean;
  recurring_frequency?: RecurringFrequency;
  recurring_amount?: number;
  interest_rate?: number;
  interest_rate_type?: InterestRateType;
  maturity_date?: string;
  annual_limit?: number;
  start_date?: string;
  
  // Pause/Skip tracking fields
  is_paused?: boolean;
  paused_since?: string;
  skipped_months?: string[];
  
  // New contribution history field
  contribution_history?: ContributionHistory[];
  
  // NPS specific fields
  equity_ratio?: number;
  debt_ratio?: number;
  
  // Scheme configuration for PPF, EPF, NPS
  scheme_config?: any;
}

export interface InvestmentFormData {
  name: string;
  symbol: string;
  type: InvestmentType;
  purpose: InvestmentPurpose;
  target_price?: number;
  category_id?: string;
  notes?: string;
  
  // New recurring investment fields
  is_recurring?: boolean;
  recurring_frequency?: RecurringFrequency;
  recurring_amount?: number;
  interest_rate?: number;
  interest_rate_type?: InterestRateType;
  maturity_date?: string;
  annual_limit?: number;
  start_date?: string;
  
  // NPS specific fields
  equity_ratio?: number;
  debt_ratio?: number;
  
  // For new purchase (existing fields)
  quantity?: number;
  price_per_unit?: number;
  fees?: number;
  purchase_date?: string;
}

export interface InvestmentSummary {
  totalInvested: number;
  totalQuantity: number;
  averagePrice: number;
  currentValue: number;
  profitLoss: number;
  profitLossPercentage: number;
  
  // New fields for recurring investments
  totalRecurringContributions?: number;
  projectedMaturityValue?: number;
  yearsToMaturity?: number;
  monthsSkipped?: number;
  monthsPaused?: number;
  
  // PPF specific fields
  annualLimitUsed?: number;
  annualLimitRemaining?: number;
}

export interface InvestmentWithSummary extends Investment {
  summary: InvestmentSummary;
}
