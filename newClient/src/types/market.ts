
export interface MarketDataPoint {
  date: string;
  price: number;
}

export interface MarketData {
  name: string;
  price: number;
  change: number;
  changePercentage: number;
  history: MarketDataPoint[];
}
