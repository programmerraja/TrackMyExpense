
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Coins, DollarSign, Eye, BarChart3, TrendingUp } from "lucide-react";
import { useMarketData } from "@/hooks/useMarketData";
import { useInvestments } from "@/hooks/useInvestments";
import { useStockMarketData } from "@/hooks/useStockMarketData";
import { MarketChartCard } from "./MarketChartCard";
import { StockMarketCard } from "./StockMarketCard";
import { formatCurrency } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";

export const LiveMarket = () => {
  const { data: marketData, isLoading: marketLoading } = useMarketData();
  const { data: investments = [], isLoading: investmentsLoading } = useInvestments();
  const { ownedStocks, monitoringStocks, isLoading: stockDataLoading } = useStockMarketData(investments);
  const isMobile = useIsMobile();

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-6 bg-background min-h-screen">
      <div className="space-y-1">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
          Market Data
        </h2>
        <p className="text-muted-foreground flex items-center gap-2 text-sm sm:text-base">
          <TrendingUp className="h-4 w-4 text-primary" />
          Track the performance of your investments in the market
        </p>
      </div>

      <Tabs defaultValue="commodities" className="w-full">
        <div className="overflow-x-auto">
          <TabsList className={`grid w-full grid-cols-2 ${isMobile ? 'w-full' : 'md:w-fit'}`}>
            <TabsTrigger value="commodities" className="text-sm sm:text-base">Commodities</TabsTrigger>
            <TabsTrigger value="stocks" className="text-sm sm:text-base">Stocks</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="commodities" className="pt-4">
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            <MarketChartCard
              icon={
                <div className="p-2 bg-yellow-500/10 rounded-lg">
                  <Coins className="h-5 w-5 text-yellow-500" />
                </div>
              }
              data={marketData.gold}
              isLoading={marketLoading}
              formatter={(value) => formatCurrency(value, { maximumFractionDigits: 0 })}
            />
            <MarketChartCard
              icon={
                <div className="p-2 bg-slate-400/10 rounded-lg">
                  <Coins className="h-5 w-5 text-slate-400" />
                </div>
              }
              data={marketData.silver}
              isLoading={marketLoading}
              formatter={(value) => formatCurrency(value, { maximumFractionDigits: 0 })}
            />
            <MarketChartCard
              icon={
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <DollarSign className="h-5 w-5 text-green-500" />
                </div>
              }
              data={marketData.usd}
              isLoading={marketLoading}
              formatter={(value) => formatCurrency(value, { maximumFractionDigits: 2 })}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="stocks" className="pt-4 space-y-4 sm:space-y-6">
          {/* Owned Stocks Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <BarChart3 className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Owned Stocks</h3>
                <p className="text-sm text-muted-foreground">
                  Stocks in your portfolio
                </p>
              </div>
            </div>
            
            {investmentsLoading || stockDataLoading ? (
              <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <StockMarketCard
                    key={i}
                    investment={{} as any}
                    isLoading={true}
                    isError={false}
                  />
                ))}
              </div>
            ) : ownedStocks.length > 0 ? (
              <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {ownedStocks.map(({ investment, marketData, isLoading, isError }) => (
                  <StockMarketCard
                    key={investment.id}
                    investment={investment}
                    marketData={marketData}
                    isLoading={isLoading}
                    isError={isError}
                  />
                ))}
              </div>
            ) : (
              <Card className="bg-card border-border shadow-sm">
                <CardContent className="p-4 sm:p-8">
                  <div className="text-center py-4 sm:py-8">
                    <div className="bg-muted w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-border">
                      <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
                    </div>
                    <h4 className="text-lg font-semibold text-foreground mb-2">No owned stocks</h4>
                    <p className="text-muted-foreground mb-4 text-sm sm:text-base">
                      Add stocks to your portfolio to see live prices here!
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Monitoring Stocks Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Eye className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Monitoring Stocks</h3>
                <p className="text-sm text-muted-foreground">
                  Stocks on your watchlist
                </p>
              </div>
            </div>
            
            {investmentsLoading || stockDataLoading ? (
              <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 2 }).map((_, i) => (
                  <StockMarketCard
                    key={i}
                    investment={{} as any}
                    isLoading={true}
                    isError={false}
                  />
                ))}
              </div>
            ) : monitoringStocks.length > 0 ? (
              <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {monitoringStocks.map(({ investment, marketData, isLoading, isError }) => (
                  <StockMarketCard
                    key={investment.id}
                    investment={investment}
                    marketData={marketData}
                    isLoading={isLoading}
                    isError={isError}
                  />
                ))}
              </div>
            ) : (
              <Card className="bg-card border-border shadow-sm">
                <CardContent className="p-4 sm:p-8">
                  <div className="text-center py-4 sm:py-8">
                    <div className="bg-muted w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-border">
                      <Eye className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
                    </div>
                    <h4 className="text-lg font-semibold text-foreground mb-2">No monitoring stocks</h4>
                    <p className="text-muted-foreground mb-4 text-sm sm:text-base">
                      Add stocks to your watchlist to see live prices here!
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
