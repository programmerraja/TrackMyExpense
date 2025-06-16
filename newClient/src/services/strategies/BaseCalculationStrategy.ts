
import { Investment } from "@/types/investment";
import { CalculationResult, MonthlyContribution } from "@/types/schemes";

export interface InvestmentCalculationStrategy {
  calculateCurrentValue(investment: Investment): CalculationResult | null;
  calculateMonthlyBreakdown(investment: Investment): MonthlyContribution[];
  validateConfiguration(config: any): boolean;
  getSchemeSpecificMetrics(investment: Investment): any;
  canEditPastContributions(): boolean;
}

export abstract class BaseCalculationStrategy implements InvestmentCalculationStrategy {
  abstract calculateCurrentValue(investment: Investment): CalculationResult | null;
  abstract calculateMonthlyBreakdown(investment: Investment): MonthlyContribution[];
  abstract validateConfiguration(config: any): boolean;
  abstract getSchemeSpecificMetrics(investment: Investment): any;
  
  canEditPastContributions(): boolean {
    return false; // Default to false, PPF will override
  }

  protected getMonthsDifference(startDate: Date, endDate: Date): number {
    return (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
           (endDate.getMonth() - startDate.getMonth());
  }

  protected formatMonth(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }

  protected parseMonth(monthStr: string): Date {
    const [year, month] = monthStr.split('-').map(Number);
    return new Date(year, month - 1, 1);
  }
}
