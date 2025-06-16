
import { useQueries } from "@tanstack/react-query";
import { fetchMarketData, type MarketDataItem } from "@/services/marketService";
import { type MarketData } from "@/types/market";

type MarketAsset = 'gold' | 'silver' | 'usd';

const processMarketData = (item?: MarketDataItem): MarketData | undefined => {
  if (!item || !item.data || item.data.length < 2) {
    return undefined;
  }

  const history = item.data
    .map(([timestamp, price]) => ({
      date: new Date(timestamp).toISOString(),
      price: price,
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (history.length < 2) {
    return undefined;
  }
  
  const lastPrice = history[history.length - 1].price;
  const firstPrice = history[0].price;
  
  const change = lastPrice - firstPrice;
  const changePercentage = firstPrice !== 0 ? (change / firstPrice) * 100 : 0;

  return {
    name: item.name,
    price: lastPrice,
    change: change,
    changePercentage: changePercentage,
    history: history,
  };
}


export const useMarketData = () => {
  const results = useQueries({
    queries: (['gold', 'silver', 'usd'] as MarketAsset[]).map((asset) => ({
      queryKey: ['marketData', asset],
      queryFn: () => fetchMarketData(asset),
      staleTime: 1000 * 60 * 5, // 5 minutes
    })),
  });

  const [goldResult, silverResult, usdResult] = results;

  const data = {
    gold: processMarketData(goldResult.data?.[0]),
    silver: processMarketData(silverResult.data?.[0]),
    usd: processMarketData(usdResult.data?.[0]),
  };

  const isLoading = results.some((result) => result.isLoading);
  const isError = results.some((result) => result.isError);
  const error = results.find(r => r.isError)?.error;


  return {
    data,
    isLoading,
    isError,
    error,
  };
};
