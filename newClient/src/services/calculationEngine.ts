import { Investment, InvestmentType, RecurringFrequency, InterestRateType } from "@/types/investment";

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
}

export interface MonthlyContribution {
  month: string;
  contribution: number;
  interestRate: number;
  balance: number;
  status: 'contributed' | 'skipped' | 'paused';
}

export class InvestmentCalculationEngine {
  static calculateRecurringInvestment(investment: Investment): CalculationResult | null {
    console.log('🔍 Starting calculation for:', investment.name);
    
    if (!investment.is_recurring) {
      console.log('❌ Investment is not recurring');
      return null;
    }

    const {
      recurring_amount = 0,
      interest_rate = 0,
      start_date,
      maturity_date,
      skipped_months = [],
      is_paused = false,
      paused_since,
      recurring_frequency = RecurringFrequency.MONTHLY,
      contribution_history = []
    } = investment;

    console.log('📊 Investment parameters:', {
      name: investment.name,
      recurring_amount,
      interest_rate,
      start_date,
      maturity_date,
      is_recurring: investment.is_recurring,
      recurring_frequency,
      contribution_history_length: contribution_history.length,
      contribution_history
    });

    // Validate required fields
    if (!start_date) {
      console.log('❌ No start date found, using created_at:', investment.created_at);
    }

    if (recurring_amount <= 0) {
      console.log('❌ Invalid recurring amount:', recurring_amount);
      return {
        totalInvested: 0,
        totalQuantity: 0,
        averagePrice: 0,
        currentValue: 0,
        profitLoss: 0,
        profitLossPercentage: 0,
        totalRecurringContributions: 0,
        projectedMaturityValue: 0,
        yearsToMaturity: 0,
        monthsSkipped: 0,
        monthsPaused: 0,
        monthlyBreakdown: []
      };
    }

    const startDate = new Date(start_date || investment.created_at);
    const currentDate = new Date();
    const endDate = maturity_date ? new Date(maturity_date) : currentDate;

    console.log('📅 Date range:', {
      startDate: startDate.toISOString().split('T')[0],
      currentDate: currentDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    });

    // Calculate frequency multiplier
    const frequencyMonths = this.getFrequencyInMonths(recurring_frequency);
    
    // Ensure skipped_months is an array (handle null case)
    const safeSkippedMonths = skipped_months || [];
    
    // Generate month-by-month breakdown using contribution history
    const monthlyBreakdown = this.generateMonthlyBreakdown(
      startDate,
      currentDate,
      endDate,
      recurring_amount,
      interest_rate,
      safeSkippedMonths,
      is_paused,
      paused_since,
      frequencyMonths,
      investment.type,
      contribution_history
    );

    console.log('📈 Monthly breakdown generated:', monthlyBreakdown.length, 'months');

    const totalContributions = monthlyBreakdown
      .filter(m => m.status === 'contributed')
      .reduce((sum, m) => sum + m.contribution, 0);

    console.log('💰 Total contributions calculated:', totalContributions);

    const currentValue = monthlyBreakdown.length > 0 
      ? monthlyBreakdown[monthlyBreakdown.length - 1].balance 
      : 0;

    const monthsSkipped = safeSkippedMonths.length;
    const monthsPaused = this.calculatePausedMonths(is_paused, paused_since, currentDate);
    
    const profitLoss = currentValue - totalContributions;
    const profitLossPercentage = totalContributions > 0 ? (profitLoss / totalContributions) * 100 : 0;

    // Project future value if maturity date exists
    let projectedMaturityValue = currentValue;
    if (maturity_date) {
      const remainingMonths = this.getMonthsDifference(currentDate, new Date(maturity_date));
      projectedMaturityValue = this.projectFutureValue(
        currentValue,
        recurring_amount,
        interest_rate,
        remainingMonths,
        frequencyMonths,
        investment.type
      );
    }

    const yearsToMaturity = maturity_date ? 
      (new Date(maturity_date).getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24 * 365) : 0;

    const result = {
      totalInvested: totalContributions,
      totalQuantity: monthlyBreakdown.filter(m => m.status === 'contributed').length,
      averagePrice: recurring_amount,
      currentValue,
      profitLoss,
      profitLossPercentage,
      totalRecurringContributions: totalContributions,
      projectedMaturityValue,
      yearsToMaturity: Math.max(0, yearsToMaturity),
      monthsSkipped,
      monthsPaused,
      monthlyBreakdown
    };

    console.log('✅ Final calculation result:', {
      totalInvested: result.totalInvested,
      currentValue: result.currentValue,
      profitLoss: result.profitLoss,
      totalRecurringContributions: result.totalRecurringContributions
    });
    
    return result;
  }

  private static getFrequencyInMonths(frequency: RecurringFrequency): number {
    switch (frequency) {
      case RecurringFrequency.MONTHLY: return 1;
      case RecurringFrequency.QUARTERLY: return 3;
      case RecurringFrequency.YEARLY: return 12;
      default: return 1;
    }
  }

  private static normalizeDate(dateString: string): string {
    console.log('🔧 Normalizing date:', dateString);
    
    // Handle different date formats and convert to YYYY-MM-DD
    if (dateString.includes('/')) {
      // Handle DD/MM/YYYY or MM/DD/YYYY format
      const parts = dateString.split('/');
      if (parts.length === 3) {
        const day = parts[0].padStart(2, '0');
        const month = parts[1].padStart(2, '0');
        const year = parts[2];
        // Assume DD/MM/YYYY format based on the user's data
        const normalized = `${year}-${month}-${day}`;
        console.log('🔧 Normalized DD/MM/YYYY format:', dateString, '->', normalized);
        return normalized;
      }
    }
    
    // If already in YYYY-MM-DD format, return as is
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      console.log('🔧 Already normalized:', dateString);
      return dateString;
    }
    
    // Try to parse and format
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      const normalized = date.toISOString().split('T')[0];
      console.log('🔧 Parsed and normalized:', dateString, '->', normalized);
      return normalized;
    }
    
    console.log('🔧 Could not normalize, returning original:', dateString);
    return dateString; // Return original if can't parse
  }

  private static getContributionForMonth(
    monthYear: string, // Format: "2025-01"
    defaultAmount: number,
    contributionHistory: any[],
    frequencyMonths: number,
    startDate: Date,
    monthDate: Date
  ): number {
    console.log(`🔍 Looking for contribution for month ${monthYear}`);
    console.log('📋 Available contribution history:', contributionHistory);
    
    // Sort contribution history by date to find the most recent applicable amount
    const sortedHistory = contributionHistory
      .map(ch => ({
        ...ch,
        normalizedDate: this.normalizeDate(ch.date),
        effectiveDate: new Date(this.normalizeDate(ch.date))
      }))
      .sort((a, b) => a.effectiveDate.getTime() - b.effectiveDate.getTime());
    
    console.log('📅 Sorted contribution history:', sortedHistory);
    
    // Find the most recent contribution history entry that is effective for this month
    let effectiveAmount = defaultAmount;
    
    for (const entry of sortedHistory) {
      // Check if this entry's effective date is before or equal to the current month
      const entryYearMonth = entry.normalizedDate.substring(0, 7); // "2025-01"
      console.log(`🔍 Checking entry ${entry.normalizedDate} (${entryYearMonth}) vs month ${monthYear}`);
      
      if (entryYearMonth <= monthYear) {
        effectiveAmount = entry.amount;
        console.log(`✅ Using amount ${effectiveAmount} from entry effective ${entry.normalizedDate}`);
      } else {
        console.log(`⏭️ Entry ${entryYearMonth} is after ${monthYear}, skipping`);
        break; // Since sorted, no need to check further
      }
    }
    
    // Check if this month should have a contribution based on frequency
    const monthsSinceStart = this.getMonthsDifference(startDate, monthDate);
    const shouldContribute = monthsSinceStart % frequencyMonths === 0;
    
    const amount = shouldContribute ? effectiveAmount : 0;
    console.log(`📅 Final contribution for ${monthYear}: ${amount} (shouldContribute: ${shouldContribute}, effectiveAmount: ${effectiveAmount})`);
    
    return amount;
  }

  private static generateMonthlyBreakdown(
    startDate: Date,
    currentDate: Date,
    endDate: Date,
    defaultAmount: number,
    interestRate: number,
    skippedMonths: string[],
    isPaused: boolean,
    pausedSince: string | undefined,
    frequencyMonths: number,
    investmentType: InvestmentType,
    contributionHistory: any[] = []
  ): MonthlyContribution[] {
    const breakdown: MonthlyContribution[] = [];
    let balance = 0;
    const monthlyRate = interestRate / 100 / 12;
    
    const pauseDate = pausedSince ? new Date(pausedSince) : null;
    
    console.log('Generating breakdown from', startDate, 'to', currentDate);
    console.log('📋 Using contribution history:', contributionHistory);
    
    for (let date = new Date(startDate); date <= currentDate; date.setMonth(date.getMonth() + 1)) {
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      let contribution = 0;
      let status: 'contributed' | 'skipped' | 'paused' = 'contributed';
      
      // Get contribution amount (either custom or default) for this month
      const potentialAmount = this.getContributionForMonth(
        monthKey, 
        defaultAmount, 
        contributionHistory, 
        frequencyMonths, 
        startDate,
        date
      );
      
      console.log(`Month ${monthKey}: potentialAmount=${potentialAmount}`);
      
      if (potentialAmount > 0) {
        if (isPaused && pauseDate && date >= pauseDate) {
          status = 'paused';
        } else if (skippedMonths.includes(monthKey)) {
          status = 'skipped';
        } else {
          contribution = potentialAmount;
          status = 'contributed';
        }
      } else {
        // No contribution expected for this month based on frequency
        status = 'contributed';
        contribution = 0;
      }
      
      // Add contribution
      balance += contribution;
      
      // Apply interest
      if (this.shouldEarnInterest(status, investmentType)) {
        balance += balance * monthlyRate;
      }
      
      breakdown.push({
        month: monthKey,
        contribution,
        interestRate: interestRate,
        balance,
        status
      });
      
      console.log(`Added month ${monthKey}: contribution=${contribution}, balance=${balance}, status=${status}`);
    }
    
    return breakdown;
  }

  private static shouldEarnInterest(status: 'contributed' | 'skipped' | 'paused', type: InvestmentType): boolean {
    // For most government schemes, interest is earned even during skipped months
    // but may not be earned during paused periods depending on the scheme
    if (status === 'paused') {
      // EPF and NPS might not earn interest during pause, PPF typically does
      return type === InvestmentType.PPF;
    }
    return true; // Earn interest for contributed and skipped months
  }

  private static projectFutureValue(
    currentValue: number,
    recurringAmount: number,
    interestRate: number,
    remainingMonths: number,
    frequencyMonths: number,
    investmentType: InvestmentType
  ): number {
    const monthlyRate = interestRate / 100 / 12;
    let futureValue = currentValue;
    
    for (let i = 0; i < remainingMonths; i++) {
      // Add contribution based on frequency
      if (i % frequencyMonths === 0) {
        futureValue += recurringAmount;
      }
      
      // Apply compound interest
      futureValue += futureValue * monthlyRate;
    }
    
    return futureValue;
  }

  private static getMonthsDifference(startDate: Date, endDate: Date): number {
    return (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
           (endDate.getMonth() - startDate.getMonth());
  }

  private static calculatePausedMonths(
    isPaused: boolean,
    pausedSince: string | undefined,
    currentDate: Date
  ): number {
    if (!isPaused || !pausedSince) return 0;
    
    const pauseDate = new Date(pausedSince);
    return this.getMonthsDifference(pauseDate, currentDate);
  }
}
