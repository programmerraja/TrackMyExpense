
import { useQueries } from "@tanstack/react-query";
import { fetchMarketData, type MarketDataItem } from "@/services/marketService";
import { type MarketData } from "@/types/market";
import { Investment, InvestmentType, InvestmentPurpose } from "@/types/investment";

const processStockMarketData = (item?: MarketDataItem, investment?: Investment): MarketData | undefined => {
  if (!item || !item.data || item.data.length === 0 || !investment) {
    return undefined;
  }

  // Sort data by timestamp (ascending order - oldest first)
  const sortedData = [...item.data].sort((a, b) => a[0] - b[0]);
  
  // Get current price (latest data point)
  const currentPrice = sortedData[sortedData.length - 1][1];
  
  // Convert timestamp data to history format for chart
  const history = sortedData.map(([timestamp, price]) => ({
    date: new Date(timestamp).toISOString(),
    price: price,
  }));

  // Calculate change based on investment data for owned stocks
  let change = 0;
  let changePercentage = 0;
  
  if (investment.purpose === InvestmentPurpose.OWNED && investment.purchases && investment.purchases.length > 0) {
    const avgPurchasePrice = (investment.purchases as any[]).reduce((sum, p) => sum + p.total_amount, 0) / 
      (investment.purchases as any[]).reduce((sum, p) => sum + p.quantity, 0);
    
    change = currentPrice - avgPurchasePrice;
    changePercentage = avgPurchasePrice > 0 ? (change / avgPurchasePrice) * 100 : 0;
  } else {
    // For monitoring stocks, calculate change from first to last price in the data
    const firstPrice = sortedData[0][1];
    change = currentPrice - firstPrice;
    changePercentage = firstPrice > 0 ? (change / firstPrice) * 100 : 0;
  }

  return {
    name: investment.name,
    price: currentPrice,
    change: change,
    changePercentage: changePercentage,
    history: history,
  };
};

export const useStockMarketData = (investments: Investment[]) => {
  const stockInvestments = investments.filter(inv => inv.type === InvestmentType.STOCK);

  const results = useQueries({
    queries: stockInvestments.map((investment) => ({
      queryKey: ['stockMarketData', investment.symbol],
      queryFn: () => fetchMarketData(investment.symbol.toLowerCase() as any),
      staleTime: 1000 * 60 * 2, // 2 minutes for stocks
      enabled: !!investment.symbol,
    })),
  });

  const data = results.map((result, index) => {
    const investment = stockInvestments[index];
    return {
      investment,
      marketData: processStockMarketData(result.data?.[0], investment),
      isLoading: result.isLoading,
      isError: result.isError,
      error: result.error,
    };
  });

  const ownedStocks = data.filter(item => 
    item.investment.purpose === InvestmentPurpose.OWNED
  );
  
  const monitoringStocks = data.filter(item => 
    item.investment.purpose === InvestmentPurpose.MONITORING
  );

  const isLoading = results.some((result) => result.isLoading);
  const isError = results.some((result) => result.isError);

  return {
    ownedStocks,
    monitoringStocks,
    isLoading,
    isError,
  };
};
