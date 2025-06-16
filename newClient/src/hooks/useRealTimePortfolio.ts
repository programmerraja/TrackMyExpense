
import { useMemo } from "react";
import { InvestmentWithSummary, InvestmentPurpose, InvestmentType } from "@/types/investment";

interface MarketDataItem {
  investment: { id: string };
  marketData?: { price: number };
  isError?: boolean;
}

export const useRealTimePortfolio = (
  filteredInvestments: InvestmentWithSummary[],
  ownedStocks: MarketDataItem[],
  portfolioSummary: { totalInvested: number }
) => {
  return useMemo(() => {
    const portfolioInvestments = filteredInvestments.filter(
      (investment) => investment.purpose === InvestmentPurpose.OWNED
    );

    let realTimeCurrentValue = 0;
    let hasRealTimeData = false;

    portfolioInvestments.forEach((investment) => {
      if (investment.type === InvestmentType.STOCK) {
        const marketData = ownedStocks.find(item => item.investment.id === investment.id);
        if (marketData?.marketData && !marketData.isError) {
          const summary = investment.summary;
          if (summary.totalQuantity > 0) {
            realTimeCurrentValue += summary.totalQuantity * marketData.marketData.price;
            hasRealTimeData = true;
          }
        } else {
          realTimeCurrentValue += investment.summary.currentValue;
        }
      } else {
        realTimeCurrentValue += investment.summary.currentValue;
      }
    });

    const realTimeTotalProfitLoss = realTimeCurrentValue - portfolioSummary.totalInvested;

    return hasRealTimeData ? {
      realTimeCurrentValue,
      realTimeTotalProfitLoss
    } : null;
  }, [filteredInvestments, ownedStocks, portfolioSummary.totalInvested]);
};
