import { Investment } from "@/types/investment";
import { BaseCalculationStrategy } from "./BaseCalculationStrategy";
import { CalculationResult, MonthlyContribution, PPFInvestmentConfig, PPFDepositEntry } from "@/types/schemes";

export class PPFCalculationStrategy extends BaseCalculationStrategy {
  canEditPastContributions(): boolean {
    return true; // PPF allows editing past month amounts
  }

  calculateCurrentValue(investment: Investment): CalculationResult | null {
    console.log('🏦 PPF Strategy: Starting calculation for', investment.name);
    
    // Handle empty or missing scheme_config for PPF investments
    if (investment.type === 'PPF' && (!investment.scheme_config || Object.keys(investment.scheme_config).length === 0)) {
      console.log('📝 Initializing empty PPF scheme config');
      const defaultConfig = this.createDefaultPPFConfig(investment);
      // Return basic calculation with zero values for now
      return {
        totalInvested: 0,
        totalQuantity: 0,
        averagePrice: 0,
        currentValue: 0,
        profitLoss: 0,
        profitLossPercentage: 0,
        totalRecurringContributions: 0,
        projectedMaturityValue: 0,
        yearsToMaturity: 15,
        monthsSkipped: 0,
        monthsPaused: 0,
        monthlyBreakdown: [],
        annualLimitUsed: 0,
        annualLimitRemaining: 150000
      };
    }

    const config = investment.scheme_config as any;
    if (!config || (config.type && config.type !== 'PPF')) {
      console.log('❌ Not a PPF investment or invalid config');
      return null;
    }

    // Initialize missing PPF config structure
    const ppfConfig = this.ensurePPFConfig(config, investment);
    const monthlyBreakdown = this.calculateMonthlyBreakdown(investment);
    
    const totalDeposits = ppfConfig.deposit_schedule
      .reduce((sum, deposit) => sum + deposit.amount, 0);
    
    const currentValue = monthlyBreakdown.length > 0 
      ? monthlyBreakdown[monthlyBreakdown.length - 1].balance 
      : 0;

    const totalInterestEarned = currentValue - totalDeposits;
    const profitLossPercentage = totalDeposits > 0 ? (totalInterestEarned / totalDeposits) * 100 : 0;

    // Calculate annual limit usage for current year
    const currentYear = new Date().getFullYear();
    const currentYearDeposits = ppfConfig.deposit_schedule
      .filter(deposit => deposit.date.startsWith(currentYear.toString()))
      .reduce((sum, deposit) => sum + deposit.amount, 0);

    const annualLimit = ppfConfig.annual_limit || 150000;
    
    const maturityDate = new Date(ppfConfig.maturity_date);
    const yearsToMaturity = Math.max(0, 
      (maturityDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 365)
    );

    // Count skipped months (months where no deposit was made by 5th)
    const monthsSkipped = this.calculateSkippedMonths(ppfConfig, investment);

    return {
      totalInvested: totalDeposits,
      totalQuantity: ppfConfig.deposit_schedule.length,
      averagePrice: totalDeposits / Math.max(1, ppfConfig.deposit_schedule.length),
      currentValue,
      profitLoss: totalInterestEarned,
      profitLossPercentage,
      totalRecurringContributions: totalDeposits,
      projectedMaturityValue: this.projectMaturityValue(ppfConfig, currentValue),
      yearsToMaturity,
      monthsSkipped,
      monthsPaused: 0,
      monthlyBreakdown,
      annualLimitUsed: currentYearDeposits,
      annualLimitRemaining: annualLimit - currentYearDeposits
    };
  }

  calculateMonthlyBreakdown(investment: Investment): MonthlyContribution[] {
    const config = this.ensurePPFConfig(investment.scheme_config as any, investment);
    if (!config) return [];

    const startDate = new Date(config.start_date);
    const currentDate = new Date();
    const depositSchedule = config.deposit_schedule || [];
    const interestRateHistory = config.interest_rate_history || [];

    const breakdown: MonthlyContribution[] = [];
    let principalBalance = 0;
    let totalCreditedInterest = 0;
    let accumulatedInterest = 0; // Interest earned but not yet credited

    // Create deposit lookup map
    const depositMap = new Map<string, PPFDepositEntry>();
    depositSchedule.forEach(deposit => {
      depositMap.set(deposit.month, deposit);
    });

    // Process each month from start to current
    for (let date = new Date(startDate); date <= currentDate; date.setMonth(date.getMonth() + 1)) {
      const monthKey = this.formatMonth(date);
      const currentRate = this.getCurrentInterestRate(date, interestRateHistory);
      
      let contribution = 0;
      let status: 'contributed' | 'skipped' | 'paused' = 'skipped';
      let isEligibleForInterest = false;
      
      if (depositMap.has(monthKey)) {
        const deposit = depositMap.get(monthKey)!;
        contribution = deposit.amount;
        status = 'contributed';
        
        // Check if deposit was made by 5th of the month (eligible for interest)
        const depositDate = new Date(deposit.date);
        isEligibleForInterest = depositDate.getDate() <= 5;
        
        if (isEligibleForInterest) {
          principalBalance += contribution;
        } else {
          // Add to principal but it won't earn interest this month
          principalBalance += contribution;
        }
      }

      // Calculate monthly interest on eligible balance (as of 5th of month)
      const eligibleBalance = isEligibleForInterest ? principalBalance : principalBalance - contribution;
      const monthlyInterestRate = currentRate / 100 / 12;
      const interestEarned = eligibleBalance * monthlyInterestRate;
      
      // Accumulate interest but don't credit it yet
      accumulatedInterest += interestEarned;
      
      // Check if this is March 31st - credit accumulated interest
      let creditedThisMonth = 0;
      if (date.getMonth() === 2) { // March (0-based)
        totalCreditedInterest += accumulatedInterest;
        creditedThisMonth = accumulatedInterest;
        accumulatedInterest = 0; // Reset accumulated interest
      }

      // Current balance = principal + credited interest
      const currentBalance = principalBalance + totalCreditedInterest;

      breakdown.push({
        month: monthKey,
        contribution,
        interestRate: currentRate,
        balance: currentBalance,
        status,
        interestEarned,
        cumulativeInterest: totalCreditedInterest,
        isEligibleForInterest,
        accumulatedInterest,
        creditedThisMonth
      } as any);
    }

    return breakdown;
  }

  private calculateSkippedMonths(config: any, investment: Investment): number {
    const startDate = new Date(config.start_date);
    const currentDate = new Date();
    const depositSchedule = config.deposit_schedule || [];
    
    let skippedCount = 0;
    const depositMap = new Map(depositSchedule.map(d => [d.month, d]));
    
    // Count months where no deposit was made by 5th
    for (let date = new Date(startDate); date <= currentDate; date.setMonth(date.getMonth() + 1)) {
      const monthKey = this.formatMonth(date);
      
      if (!depositMap.has(monthKey)) {
        skippedCount++;
      } else {
        const deposit = depositMap.get(monthKey)!;
        const depositDate = new Date(deposit.date);
        // If deposit was made after 5th, consider it skipped for interest purposes
        if (depositDate.getDate() > 5) {
          skippedCount++;
        }
      }
    }
    
    return skippedCount;
  }

  validateConfiguration(config: any): boolean {
    if (!config) return false;
    
    // For PPF type investments without config, allow initialization
    if (!config.type) return true;
    if (config.type !== 'PPF') return false;
    
    // Check required fields
    if (!config.start_date || !config.maturity_date) {
      return false;
    }

    // Validate 15-year lock-in period
    const startDate = new Date(config.start_date);
    const maturityDate = new Date(config.maturity_date);
    const yearsDifference = (maturityDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
    
    if (yearsDifference < 15) {
      console.warn('PPF: Maturity date should be at least 15 years from start date');
      return false;
    }

    return true;
  }

  getSchemeSpecificMetrics(investment: Investment): any {
    const config = this.ensurePPFConfig(investment.scheme_config as any, investment);
    if (!config) return {};

    const currentYear = new Date().getFullYear();
    const currentYearDeposits = config.deposit_schedule
      .filter(deposit => deposit.date.startsWith(currentYear.toString()))
      .reduce((sum, deposit) => sum + deposit.amount, 0);

    const annualLimit = config.annual_limit || 150000;

    return {
      annualLimit,
      annualLimitUsed: currentYearDeposits,
      annualLimitRemaining: annualLimit - currentYearDeposits,
      lockInPeriod: 15,
      maturityDate: config.maturity_date,
      interestCalculationDate: 5,
      totalDeposits: config.deposit_schedule.length
    };
  }

  private createDefaultPPFConfig(investment: Investment): any {
    const startDate = investment.start_date || new Date().toISOString().split('T')[0];
    const maturityDate = investment.maturity_date || this.calculateMaturityDate(startDate);
    
    return {
      type: 'PPF',
      start_date: startDate,
      maturity_date: maturityDate,
      annual_limit: investment.annual_limit || 150000,
      deposit_schedule: [],
      interest_rate_history: [
        {
          date: startDate,
          rate: investment.interest_rate || 7.1
        }
      ],
      recurring_config: {
        enabled: false,
        amount: 0,
        start_month: null
      }
    };
  }

  private ensurePPFConfig(config: any, investment: Investment): any {
    if (!config || Object.keys(config).length === 0) {
      return this.createDefaultPPFConfig(investment);
    }

    // Ensure required structure exists
    if (!config.type) config.type = 'PPF';
    if (!config.start_date) {
      config.start_date = investment.start_date || new Date().toISOString().split('T')[0];
    }
    if (!config.maturity_date) {
      config.maturity_date = investment.maturity_date || this.calculateMaturityDate(config.start_date);
    }
    if (!config.annual_limit) {
      config.annual_limit = investment.annual_limit || 150000;
    }
    if (!config.deposit_schedule) {
      config.deposit_schedule = [];
    }
    if (!config.interest_rate_history) {
      config.interest_rate_history = [
        {
          date: config.start_date,
          rate: investment.interest_rate || 7.1
        }
      ];
    }
    if (!config.recurring_config) {
      config.recurring_config = {
        enabled: false,
        amount: 0,
        start_month: null
      };
    }

    return config;
  }

  private calculateMaturityDate(startDate: string | undefined): string {
    const start = new Date(startDate || new Date());
    start.setFullYear(start.getFullYear() + 15);
    return start.toISOString().split('T')[0];
  }

  private getCurrentInterestRate(date: Date, rateHistory: any[]): number {
    if (!rateHistory || rateHistory.length === 0) return 7.1; // Default PPF rate

    // Find the most recent rate effective for the given date
    const applicableRates = rateHistory
      .filter(rate => new Date(rate.date) <= date)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return applicableRates.length > 0 ? applicableRates[0].rate : 7.1;
  }

  private projectMaturityValue(config: any, currentValue: number): number {
    const maturityDate = new Date(config.maturity_date);
    const currentDate = new Date();
    
    if (maturityDate <= currentDate) return currentValue;

    const remainingMonths = this.getMonthsDifference(currentDate, maturityDate);
    const currentRate = config.interest_rate_history?.[0]?.rate || 7.1;
    const monthlyRate = currentRate / 100 / 12;

    // Simple projection assuming no additional deposits
    let projectedValue = currentValue;
    for (let i = 0; i < remainingMonths; i++) {
      projectedValue += projectedValue * monthlyRate;
    }

    return projectedValue;
  }
}
