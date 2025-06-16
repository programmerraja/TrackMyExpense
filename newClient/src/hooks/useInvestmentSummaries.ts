
import { useMemo } from "react";
import { Investment, InvestmentPurpose, InvestmentWithSummary } from "@/types/investment";
import { investmentService } from "@/services/investmentService";

export const useInvestmentSummaries = (investments: Investment[] = []) => {
  const investmentsWithSummary = useMemo((): InvestmentWithSummary[] => {
    if (!investments) return [];
    
    return investments.map(inv => {
      console.log('Processing investment:', inv.name, 'is_recurring:', inv.is_recurring);
      
      let summary;
      if (inv.is_recurring) {
        const recurringResult = investmentService.calculateRecurringInvestmentSummary(inv);
        if (recurringResult) {
          summary = {
            totalInvested: recurringResult.totalInvested,
            totalQuantity: recurringResult.totalQuantity,
            averagePrice: recurringResult.averagePrice,
            currentValue: recurringResult.currentValue,
            profitLoss: recurringResult.profitLoss,
            profitLossPercentage: recurringResult.profitLossPercentage,
            totalRecurringContributions: recurringResult.totalRecurringContributions,
            projectedMaturityValue: recurringResult.projectedMaturityValue,
            yearsToMaturity: recurringResult.yearsToMaturity,
            monthsSkipped: recurringResult.monthsSkipped,
            monthsPaused: recurringResult.monthsPaused
          };
          console.log('Recurring calculation result for', inv.name, ':', summary);
        } else {
          console.log('No recurring calculation result for', inv.name);
          summary = investmentService.calculateInvestmentSummary(inv.purchases as any);
        }
      } else {
        summary = investmentService.calculateInvestmentSummary(inv.purchases as any);
        console.log('Regular calculation result for', inv.name, ':', summary);
      }
      
      return {
        ...inv,
        summary
      };
    });
  }, [investments]);

  const portfolioSummary = useMemo(() => {
    const portfolioInvestments = investmentsWithSummary.filter(
      (investment) => investment.purpose === InvestmentPurpose.OWNED
    );
    return portfolioInvestments.reduce(
      (acc, investment) => {
        return {
          totalInvested: acc.totalInvested + investment.summary.totalInvested,
          currentValue: acc.currentValue + investment.summary.currentValue,
          totalProfitLoss: acc.totalProfitLoss + investment.summary.profitLoss,
          totalInvestments: acc.totalInvestments + 1,
        };
      },
      {
        totalInvested: 0,
        currentValue: 0,
        totalProfitLoss: 0,
        totalInvestments: 0,
      }
    );
  }, [investmentsWithSummary]);

  const watchlistSummary = useMemo(() => {
    const watchlistInvestments = investmentsWithSummary.filter(
      (investment) => investment.purpose === InvestmentPurpose.MONITORING
    );
    return watchlistInvestments.reduce(
      (acc, investment) => {
        const withTargetPrice = investment.target_price ? acc.withTargetPrice + 1 : acc.withTargetPrice;
        return {
          totalInvestments: acc.totalInvestments + 1,
          withTargetPrice: withTargetPrice,
        };
      },
      {
        totalInvestments: 0,
        withTargetPrice: 0,
      }
    );
  }, [investmentsWithSummary]);

  return {
    investmentsWithSummary,
    portfolioSummary,
    watchlistSummary,
  };
};
