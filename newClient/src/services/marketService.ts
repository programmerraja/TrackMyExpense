
export type MarketDataItem = {
  name: string;
  data: [number, number][]; // [timestamp, price]
};

const API_BASE_URL = "https://programmerraja--50968046498511f087c676b3cceeab13.web.val.run/api/investments/price-tracking";

export const fetchMarketData = async (type: 'gold' | 'silver' | 'usd' | string): Promise<MarketDataItem[]> => {
  // For predefined commodities, use the existing endpoint with type parameter
  if (['gold', 'silver', 'usd'].includes(type)) {
    const response = await fetch(`${API_BASE_URL}?type=${type}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${type} data`);
    }
    return response.json();
  }
  
  // For stock symbols, use the stock endpoint with symbol ID
  console.log(`Fetching stock data for symbol: ${type}`);
  const response = await fetch(`${API_BASE_URL}?type=stock&id=${type.toUpperCase()}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${type} stock data`);
  }
  return response.json();
};
