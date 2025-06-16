import { supabase } from "@/integrations/supabase/client";
import { Investment, InvestmentFormData, InvestmentType, InvestmentPurpose, Purchase, InterestRateHistory, ContributionHistory } from "@/types/investment";
import { InvestmentCalculationEngine } from "./calculationEngine";
import { StrategyFactory } from "./strategies/StrategyFactory";

export const investmentService = {
  async createInvestment(data: InvestmentFormData): Promise<Investment> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user?.id) throw new Error("User not authenticated");

    const purchases: Purchase[] = [];
    
    // Only add purchases for non-recurring investments or when explicitly provided
    if (!data.is_recurring && data.quantity && data.price_per_unit) {
      const totalAmount = data.quantity * data.price_per_unit;
      purchases.push({
        date: data.purchase_date || new Date().toISOString().split('T')[0],
        quantity: data.quantity,
        price_per_unit: data.price_per_unit,
        total_amount: totalAmount,
        fees: data.fees || 0,
      });
    }

    const investmentData = {
      name: data.name,
      symbol: data.symbol.toUpperCase(),
      type: data.type,
      purpose: data.purpose,
      target_price: data.target_price || null,
      notes: data.notes || null,
      purchases: purchases as any,
      user_id: user.user.id,
      
      // New recurring investment fields
      is_recurring: data.is_recurring || false,
      recurring_frequency: data.recurring_frequency || null,
      recurring_amount: data.recurring_amount || null,
      interest_rate: data.interest_rate || null,
      interest_rate_type: data.interest_rate_type || null,
      maturity_date: data.maturity_date || null,
      annual_limit: data.annual_limit || null,
      start_date: data.start_date || null,
      
      // NPS specific fields
      equity_ratio: data.equity_ratio || null,
      debt_ratio: data.debt_ratio || null,
    };

    const { data: investment, error } = await supabase
      .from("investments")
      .insert(investmentData)
      .select()
      .single();

    if (error) throw error;

    // If interest rate is provided, create initial interest rate history entry
    if (investment && data.interest_rate) {
      await this.addInterestRateHistory(investment.id, data.interest_rate, data.start_date || new Date().toISOString().split('T')[0]);
    }

    return investment as unknown as Investment;
  },

  async getInvestments(purpose?: InvestmentPurpose): Promise<Investment[]> {
    let query = supabase
      .from("investments")
      .select("*")
      .order("created_at", { ascending: false });

    if (purpose) {
      query = query.eq("purpose", purpose);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as unknown as Investment[];
  },

  async addPurchase(investmentId: string, purchase: Omit<Purchase, 'total_amount'>): Promise<Investment> {
    const { data: investment, error: fetchError } = await supabase
      .from("investments")
      .select("purchases")
      .eq("id", investmentId)
      .single();

    if (fetchError) throw fetchError;

    const currentPurchases = (investment.purchases as unknown as Purchase[]) || [];
    const newPurchase: Purchase = {
      ...purchase,
      total_amount: purchase.quantity * purchase.price_per_unit,
    };
    
    const updatedPurchases = [...currentPurchases, newPurchase];

    const { data: updatedInvestment, error } = await supabase
      .from("investments")
      .update({ purchases: updatedPurchases as any })
      .eq("id", investmentId)
      .select()
      .single();

    if (error) throw error;
    return updatedInvestment as unknown as Investment;
  },

  async updateInvestment(id: string, data: Partial<InvestmentFormData>): Promise<Investment> {
    const updateData = {
      name: data.name,
      symbol: data.symbol?.toUpperCase(),
      type: data.type,
      target_price: data.target_price || null,
      notes: data.notes || null,
      
      // New recurring investment fields
      is_recurring: data.is_recurring,
      recurring_frequency: data.recurring_frequency || null,
      recurring_amount: data.recurring_amount || null,
      interest_rate: data.interest_rate || null,
      interest_rate_type: data.interest_rate_type || null,
      maturity_date: data.maturity_date || null,
      annual_limit: data.annual_limit || null,
      start_date: data.start_date || null,
      
      // NPS specific fields
      equity_ratio: data.equity_ratio || null,
      debt_ratio: data.debt_ratio || null,
    };

    const { data: investment, error } = await supabase
      .from("investments")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return investment as unknown as Investment;
  },

  async updateContributionHistory(id: string, contributionHistory: ContributionHistory[]): Promise<Investment> {
    const { data: investment, error } = await supabase
      .from("investments")
      .update({ contribution_history: contributionHistory as any })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return investment as unknown as Investment;
  },

  async deleteInvestment(id: string): Promise<void> {
    const { error } = await supabase
      .from("investments")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },

  async pauseInvestment(id: string): Promise<Investment> {
    const { data: investment, error } = await supabase
      .from("investments")
      .update({ 
        is_paused: true,
        paused_since: new Date().toISOString().split('T')[0]
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return investment as unknown as Investment;
  },

  async resumeInvestment(id: string): Promise<Investment> {
    const { data: investment, error } = await supabase
      .from("investments")
      .update({ 
        is_paused: false,
        paused_since: null
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return investment as unknown as Investment;
  },

  async addSkippedMonth(id: string, month: string): Promise<Investment> {
    const { data: investment, error: fetchError } = await supabase
      .from("investments")
      .select("skipped_months")
      .eq("id", id)
      .single();

    if (fetchError) throw fetchError;

    const currentSkipped = (investment.skipped_months as string[]) || [];
    const updatedSkipped = [...currentSkipped, month];

    const { data: updatedInvestment, error } = await supabase
      .from("investments")
      .update({ skipped_months: updatedSkipped })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return updatedInvestment as unknown as Investment;
  },

  async removeSkippedMonth(id: string, month: string): Promise<Investment> {
    const { data: investment, error: fetchError } = await supabase
      .from("investments")
      .select("skipped_months")
      .eq("id", id)
      .single();

    if (fetchError) throw fetchError;

    const currentSkipped = (investment.skipped_months as string[]) || [];
    const updatedSkipped = currentSkipped.filter(m => m !== month);

    const { data: updatedInvestment, error } = await supabase
      .from("investments")
      .update({ skipped_months: updatedSkipped })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return updatedInvestment as unknown as Investment;
  },

  async addInterestRateHistory(investmentId: string, rate: number, effectiveDate: string): Promise<InterestRateHistory> {
    const { data: rateHistory, error } = await supabase
      .from("interest_rate_history")
      .insert({
        investment_id: investmentId,
        rate: rate,
        effective_date: effectiveDate,
      })
      .select()
      .single();

    if (error) throw error;
    return rateHistory as unknown as InterestRateHistory;
  },

  async getInterestRateHistory(investmentId: string): Promise<InterestRateHistory[]> {
    const { data, error } = await supabase
      .from("interest_rate_history")
      .select("*")
      .eq("investment_id", investmentId)
      .order("effective_date", { ascending: false });

    if (error) throw error;
    return (data || []) as unknown as InterestRateHistory[];
  },

  async updateRecurringAmount(id: string, newAmount: number, effectiveDate: string, reason?: string): Promise<Investment> {
    // For now, just update the current recurring amount
    // In the future, we can add proper history tracking when the database table is created
    const { data: investment, error } = await supabase
      .from("investments")
      .update({ recurring_amount: newAmount })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return investment as unknown as Investment;
  },

  calculateInvestmentSummary(purchases: Purchase[], currentPrice?: number) {
    if (!purchases || purchases.length === 0) {
      return {
        totalInvested: 0,
        totalQuantity: 0,
        averagePrice: 0,
        currentValue: 0,
        profitLoss: 0,
        profitLossPercentage: 0,
      };
    }

    const totalInvested = purchases.reduce((sum, purchase) => 
      sum + purchase.total_amount + (purchase.fees || 0), 0);
    
    const totalQuantity = purchases.reduce((sum, purchase) => 
      sum + purchase.quantity, 0);
    
    const averagePrice = totalQuantity > 0 ? totalInvested / totalQuantity : 0;
    
    const marketPrice = currentPrice || (purchases[purchases.length - 1]?.price_per_unit || 0);
    const currentValue = totalQuantity * marketPrice;
    
    const profitLoss = currentValue - totalInvested;
    const profitLossPercentage = totalInvested > 0 ? (profitLoss / totalInvested) * 100 : 0;

    return {
      totalInvested,
      totalQuantity,
      averagePrice,
      currentValue,
      profitLoss,
      profitLossPercentage,
    };
  },

  calculateRecurringInvestmentSummary(investment: Investment) {
    console.log('calculateRecurringInvestmentSummary called for:', investment.name, {
      is_recurring: investment.is_recurring,
      type: investment.type,
      has_scheme_config: !!investment.scheme_config
    });
    
    // Try new strategy-based calculation first
    const strategy = StrategyFactory.getStrategy(investment.type);
    if (strategy && investment.scheme_config) {
      console.log('🎯 Using strategy-based calculation for', investment.type);
      const result = strategy.calculateCurrentValue(investment);
      if (result) {
        console.log('✅ Strategy calculation successful:', result);
        return result;
      }
    }
    
    // Fallback to legacy calculation
    console.log('🔄 Falling back to legacy calculation');
    const result = InvestmentCalculationEngine.calculateRecurringInvestment(investment);
    console.log('Calculation result:', result);
    
    return result;
  },

  async updatePPFDeposit(investmentId: string, month: string, amount: number, date: string): Promise<Investment> {
    const { data: investment, error: fetchError } = await supabase
      .from("investments")
      .select("scheme_config, start_date, maturity_date, annual_limit, interest_rate")
      .eq("id", investmentId)
      .single();

    if (fetchError) throw fetchError;

    // Initialize or ensure proper PPF scheme config structure
    let schemeConfig = investment.scheme_config as any;
    
    if (!schemeConfig || Object.keys(schemeConfig).length === 0) {
      console.log('Initializing empty PPF scheme config');
      const startDate = investment.start_date || new Date().toISOString().split('T')[0];
      const maturityDate = investment.maturity_date || this.calculatePPFMaturityDate(startDate);
      
      schemeConfig = {
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

    // Ensure deposit_schedule exists
    if (!schemeConfig.deposit_schedule) {
      schemeConfig.deposit_schedule = [];
    }

    // Update or add deposit
    const depositSchedule = schemeConfig.deposit_schedule || [];
    const existingIndex = depositSchedule.findIndex((d: any) => d.month === month);
    
    const depositEntry = {
      date,
      amount,
      month,
      is_eligible_for_interest: new Date(date).getDate() <= 5,
      is_manual_override: true // Mark as manually entered
    };

    if (existingIndex >= 0) {
      depositSchedule[existingIndex] = depositEntry;
    } else {
      depositSchedule.push(depositEntry);
    }

    schemeConfig.deposit_schedule = depositSchedule;

    const { data: updatedInvestment, error } = await supabase
      .from("investments")
      .update({ scheme_config: schemeConfig })
      .eq("id", investmentId)
      .select()
      .single();

    if (error) throw error;
    return updatedInvestment as unknown as Investment;
  },

  async removePPFDeposit(investmentId: string, month: string): Promise<Investment> {
    const { data: investment, error: fetchError } = await supabase
      .from("investments")
      .select("scheme_config")
      .eq("id", investmentId)
      .single();

    if (fetchError) throw fetchError;

    const schemeConfig = investment.scheme_config as any || {};
    
    if (!schemeConfig.deposit_schedule) {
      schemeConfig.deposit_schedule = [];
    }
    
    const depositSchedule = schemeConfig.deposit_schedule || [];
    schemeConfig.deposit_schedule = depositSchedule.filter(
      (d: any) => d.month !== month
    );

    const { data: updatedInvestment, error } = await supabase
      .from("investments")
      .update({ scheme_config: schemeConfig })
      .eq("id", investmentId)
      .select()
      .single();

    if (error) throw error;
    return updatedInvestment as unknown as Investment;
  },

  async enablePPFRecurringDeposits(investmentId: string, amount: number, startMonth: string): Promise<Investment> {
    const { data: investment, error: fetchError } = await supabase
      .from("investments")
      .select("scheme_config, start_date, annual_limit, interest_rate")
      .eq("id", investmentId)
      .single();

    if (fetchError) throw fetchError;

    let schemeConfig = investment.scheme_config as any || {};
    
    if (!schemeConfig.deposit_schedule) {
      schemeConfig.deposit_schedule = [];
    }
    
    if (!schemeConfig.recurring_config) {
      schemeConfig.recurring_config = {};
    }

    // Enable recurring and set amount
    schemeConfig.recurring_config = {
      enabled: true,
      amount: amount,
      start_month: startMonth
    };

    // Generate future deposits for the next 12 months
    this.generateRecurringDeposits(schemeConfig, amount, startMonth);

    const { data: updatedInvestment, error } = await supabase
      .from("investments")
      .update({ scheme_config: schemeConfig })
      .eq("id", investmentId)
      .select()
      .single();

    if (error) throw error;
    return updatedInvestment as unknown as Investment;
  },

  async updatePPFRecurringAmount(investmentId: string, newAmount: number, effectiveFromMonth: string): Promise<Investment> {
    const { data: investment, error: fetchError } = await supabase
      .from("investments")
      .select("scheme_config")
      .eq("id", investmentId)
      .single();

    if (fetchError) throw fetchError;

    const schemeConfig = investment.scheme_config as any || {};
    
    if (!schemeConfig.recurring_config || !schemeConfig.recurring_config.enabled) {
      throw new Error("Recurring deposits not enabled");
    }

    // Update recurring amount
    schemeConfig.recurring_config.amount = newAmount;

    // Update future auto-generated deposits (not manual overrides)
    if (schemeConfig.deposit_schedule) {
      schemeConfig.deposit_schedule = schemeConfig.deposit_schedule.map((deposit: any) => {
        // Only update auto-generated deposits from the effective month onwards
        if (!deposit.is_manual_override && deposit.month >= effectiveFromMonth) {
          return {
            ...deposit,
            amount: newAmount
          };
        }
        return deposit;
      });
    }

    // Generate any missing future deposits
    this.generateRecurringDeposits(schemeConfig, newAmount, effectiveFromMonth);

    const { data: updatedInvestment, error } = await supabase
      .from("investments")
      .update({ scheme_config: schemeConfig })
      .eq("id", investmentId)
      .select()
      .single();

    if (error) throw error;
    return updatedInvestment as unknown as Investment;
  },

  async disablePPFRecurringDeposits(investmentId: string): Promise<Investment> {
    const { data: investment, error: fetchError } = await supabase
      .from("investments")
      .select("scheme_config")
      .eq("id", investmentId)
      .single();

    if (fetchError) throw fetchError;

    const schemeConfig = investment.scheme_config as any || {};
    
    // Disable recurring
    if (schemeConfig.recurring_config) {
      schemeConfig.recurring_config.enabled = false;
    }

    // Remove auto-generated future deposits (keep manual overrides)
    if (schemeConfig.deposit_schedule) {
      const currentMonth = new Date().toISOString().substring(0, 7); // YYYY-MM
      schemeConfig.deposit_schedule = schemeConfig.deposit_schedule.filter((deposit: any) => {
        // Keep all past deposits and manual overrides
        return deposit.month <= currentMonth || deposit.is_manual_override;
      });
    }

    const { data: updatedInvestment, error } = await supabase
      .from("investments")
      .update({ scheme_config: schemeConfig })
      .eq("id", investmentId)
      .select()
      .single();

    if (error) throw error;
    return updatedInvestment as unknown as Investment;
  },

  generateRecurringDeposits(schemeConfig: any, amount: number, startMonth: string): void {
    const currentDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 12); // Generate for next 12 months

    const existingMonths = new Set(
      schemeConfig.deposit_schedule.map((d: any) => d.month)
    );

    for (let date = new Date(startMonth + "-01"); date <= endDate; date.setMonth(date.getMonth() + 1)) {
      const monthKey = date.toISOString().substring(0, 7); // YYYY-MM
      
      // Skip if deposit already exists
      if (existingMonths.has(monthKey)) continue;
      
      // Skip past months (except current month)
      if (date < new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)) continue;

      const depositDate = `${monthKey}-05`; // Default to 5th for interest eligibility
      
      schemeConfig.deposit_schedule.push({
        date: depositDate,
        amount: amount,
        month: monthKey,
        is_eligible_for_interest: true,
        is_auto_generated: true,
        is_manual_override: false
      });
    }

    // Sort deposits by month
    schemeConfig.deposit_schedule.sort((a: any, b: any) => a.month.localeCompare(b.month));
  },

  canEditPastContributions(investmentType: InvestmentType): boolean {
    return StrategyFactory.canEditPastContributions(investmentType);
  },

  calculatePPFMaturityDate(startDate: string): string {
    const start = new Date(startDate);
    start.setFullYear(start.getFullYear() + 15);
    return start.toISOString().split('T')[0];
  }
};
