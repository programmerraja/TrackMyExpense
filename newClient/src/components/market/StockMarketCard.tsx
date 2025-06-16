

import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { formatCurrency } from "@/lib/utils"
import { MarketData } from "@/types/market"
import { Investment, InvestmentPurpose } from "@/types/investment"
import { TrendingUp, TrendingDown, Target, Eye, BarChart3 } from "lucide-react"

interface StockMarketCardProps {
  investment: Investment
  marketData?: MarketData
  isLoading: boolean
  isError: boolean
}

export const StockMarketCard = ({ investment, marketData, isLoading, isError }: StockMarketCardProps) => {
  if (isLoading) {
    return (
      <Card className="bg-card border-border hover:shadow-md transition-shadow">
        <CardContent className="p-3 sm:p-5">
          <div className="flex items-start justify-between mb-3 sm:mb-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <Skeleton className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg" />
              <div className="space-y-1 sm:space-y-2">
                <Skeleton className="h-4 w-20 sm:h-5 sm:w-24" />
                <Skeleton className="h-3 w-16 sm:h-4 sm:w-20" />
              </div>
            </div>
            <div className="text-right space-y-1">
              <Skeleton className="h-5 w-16 sm:h-6 sm:w-20" />
              <Skeleton className="h-3 w-12 sm:h-4 sm:w-16" />
            </div>
          </div>
          <Skeleton className="h-48 sm:h-64 md:h-80 w-full mb-3 sm:mb-4" />
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <Skeleton className="h-14 sm:h-16 w-full rounded-lg" />
            <Skeleton className="h-14 sm:h-16 w-full rounded-lg" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isError || !marketData) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-3 sm:p-5">
          <div className="flex items-center gap-2 sm:gap-3 mb-3">
            <div className="p-2 sm:p-2.5 bg-muted rounded-lg">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm sm:text-base font-bold text-card-foreground">{investment.name}</p>
              <p className="text-xs sm:text-sm text-muted-foreground">{investment.symbol}</p>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">Unable to fetch market data</p>
        </CardContent>
      </Card>
    )
  }

  const { name, price, change, changePercentage, history } = marketData;
  const isPositive = change >= 0;
  const isOwned = investment.purpose === InvestmentPurpose.OWNED;

  // Calculate min and max for better Y-axis scaling with minimal padding for more granular view
  const prices = history.map(d => d.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceRange = maxPrice - minPrice;
  
  // Use much smaller padding (2% instead of 10%) for better granularity
  const padding = priceRange * 0.02;
  const yAxisMin = Math.max(0, minPrice - padding);
  const yAxisMax = maxPrice + padding;

  const chartConfig = {
    price: {
      label: "Price",
      color: isPositive ? "hsl(var(--chart-1))" : "hsl(var(--destructive))",
    },
  };

  // Calculate metrics for owned stocks
  let avgCost = 0;
  let totalQuantity = 0;
  if (isOwned && investment.purchases && investment.purchases.length > 0) {
    const totalAmount = (investment.purchases as any[]).reduce((sum, p) => sum + p.total_amount, 0);
    totalQuantity = (investment.purchases as any[]).reduce((sum, p) => sum + p.quantity, 0);
    avgCost = totalAmount / totalQuantity;
  }

  return (
    <Card className="bg-card border-border shadow-sm hover:shadow-lg transition-all duration-200 hover:border-primary/20">
      <CardContent className="p-3 sm:p-5">
        {/* Header with stock info and status */}
        <div className="flex items-start justify-between mb-3 sm:mb-4">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <div className={`p-2 sm:p-2.5 rounded-lg ${isPositive ? 'bg-emerald-500/15' : 'bg-red-500/15'}`}>
              {isPositive ? (
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" />
              ) : (
                <TrendingDown className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
              )}
            </div>
            <div className="space-y-1 min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm sm:text-base font-bold text-card-foreground leading-tight truncate">{name}</h3>
                <Badge 
                  variant={isOwned ? "default" : "secondary"} 
                  className={`text-xs px-1.5 py-0.5 sm:px-2 ${
                    isOwned 
                      ? 'bg-blue-500/15 text-blue-700 border-blue-200 hover:bg-blue-500/20' 
                      : 'bg-purple-500/15 text-purple-700 border-purple-200 hover:bg-purple-500/20'
                  }`}
                >
                  {isOwned ? (
                    <><BarChart3 className="h-3 w-3 mr-1" />Owned</>
                  ) : (
                    <><Eye className="h-3 w-3 mr-1" />Watching</>
                  )}
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium">{investment.symbol}</p>
            </div>
          </div>
          
          {/* Current price and change */}
          <div className="text-right ml-2">
            <p className="text-lg sm:text-2xl font-bold text-card-foreground leading-tight">
              ₹{price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <div className={`flex items-center justify-end gap-1 ${isPositive ? "text-emerald-600" : "text-red-600"}`}>
              <span className="text-xs sm:text-sm font-semibold">
                {isPositive ? "+" : ""}₹{Math.abs(change).toFixed(2)}
              </span>
              <span className="text-xs font-medium">
                ({isPositive ? "+" : ""}{changePercentage.toFixed(2)}%)
              </span>
            </div>
          </div>
        </div>

        {/* Chart with responsive height */}
        <div className="h-48 sm:h-64 md:h-80 w-full mb-3 sm:mb-4 bg-muted/30 rounded-lg p-1">
          <ChartContainer config={chartConfig} className="h-full w-full">
            <LineChart
              accessibilityLayer
              data={history}
              margin={{ left: 2, right: 2, top: 6, bottom: 6 }}
            >
              <CartesianGrid 
                vertical={false} 
                horizontal={true}
                stroke="hsl(var(--border))" 
                strokeDasharray="2 2"
                strokeOpacity={0.3}
              />
              
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={6}
                tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }}
                interval="preserveStartEnd"
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                  });
                }}
              />
              
              <YAxis 
                tickLine={false} 
                axisLine={false} 
                tickMargin={6}
                tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }}
                domain={[yAxisMin, yAxisMax]}
                width={35}
                tickFormatter={(value) => {
                  if (value >= 1000) {
                    return `₹${(value / 1000).toFixed(1)}K`;
                  }
                  return `₹${value.toFixed(0)}`;
                }}
              />
              
              <ChartTooltip
                cursor={{
                  stroke: isPositive ? "hsl(var(--chart-1))" : "hsl(var(--destructive))",
                  strokeWidth: 2,
                  strokeDasharray: "4 4",
                  strokeOpacity: 0.8
                }}
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  
                  const data = payload[0];
                  const date = new Date(label);
                  const formattedDate = date.toLocaleDateString('en-US', { 
                    weekday: 'short',
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  });
                  const formattedPrice = `₹${(data.value as number).toLocaleString('en-IN', { 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: 2 
                  })}`;
                  
                  return (
                    <div className="bg-background border border-border/50 rounded-lg shadow-xl p-2 sm:p-3 min-w-[140px] sm:min-w-[160px]">
                      <p className="text-xs sm:text-sm font-semibold text-foreground mb-1">{name}</p>
                      <p className="text-xs text-muted-foreground mb-1 sm:mb-2">{formattedDate}</p>
                      <p className="text-sm sm:text-lg font-bold text-foreground">{formattedPrice}</p>
                    </div>
                  );
                }}
              />
              
              <Line
                dataKey="price"
                type="monotone"
                stroke={isPositive ? "hsl(var(--chart-1))" : "hsl(var(--destructive))"}
                strokeWidth={2}
                dot={{
                  fill: isPositive ? "hsl(var(--chart-1))" : "hsl(var(--destructive))",
                  stroke: "hsl(var(--background))",
                  strokeWidth: 1.5,
                  r: 4
                }}
                activeDot={{
                  r: 6,
                  fill: isPositive ? "hsl(var(--chart-1))" : "hsl(var(--destructive))",
                  stroke: "hsl(var(--background))",
                  strokeWidth: 2
                }}
              />
            </LineChart>
          </ChartContainer>
        </div>

        {/* Metrics cards */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          {/* Left metric card */}
          {investment.purpose === InvestmentPurpose.MONITORING && investment.target_price ? (
            <div className="bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-lg p-2 sm:p-3">
              <div className="flex items-center gap-1 sm:gap-2 mb-1">
                <Target className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600" />
                <span className="text-xs font-semibold text-purple-700 dark:text-purple-300 uppercase tracking-wide">Target</span>
              </div>
              <p className="text-sm sm:text-lg font-bold text-purple-900 dark:text-purple-100">
                ₹{investment.target_price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                {((price - investment.target_price) / investment.target_price * 100).toFixed(1)}% to target
              </p>
            </div>
          ) : isOwned && avgCost > 0 ? (
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-2 sm:p-3">
              <div className="flex items-center gap-1 sm:gap-2 mb-1">
                <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                <span className="text-xs font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wide">Avg Cost</span>
              </div>
              <p className="text-sm sm:text-lg font-bold text-blue-900 dark:text-blue-100">
                ₹{avgCost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                P&L: {((price - avgCost) / avgCost * 100).toFixed(1)}%
              </p>
            </div>
          ) : (
            <div className="bg-muted/50 border border-border rounded-lg p-2 sm:p-3">
              <div className="flex items-center gap-1 sm:gap-2 mb-1">
                <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Performance</span>
              </div>
              <p className="text-sm sm:text-lg font-bold text-foreground">
                {changePercentage > 0 ? '+' : ''}{changePercentage.toFixed(1)}%
              </p>
              <p className="text-xs text-muted-foreground mt-1">30 days</p>
            </div>
          )}

          {/* Right metric card */}
          {isOwned && totalQuantity > 0 ? (
            <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg p-2 sm:p-3">
              <div className="flex items-center gap-1 sm:gap-2 mb-1">
                <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-600" />
                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 uppercase tracking-wide">Holdings</span>
              </div>
              <p className="text-sm sm:text-lg font-bold text-emerald-900 dark:text-emerald-100">
                {totalQuantity} units
              </p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                Value: ₹{(price * totalQuantity).toLocaleString('en-IN')}
              </p>
            </div>
          ) : (
            <div className="bg-slate-50 dark:bg-slate-950/30 border border-slate-200 dark:border-slate-800 rounded-lg p-2 sm:p-3">
              <div className="flex items-center gap-1 sm:gap-2 mb-1">
                <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-slate-600" />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Change</span>
              </div>
              <p className="text-sm sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                ₹{Math.abs(change).toFixed(2)}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                {isPositive ? 'Gain' : 'Loss'} today
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

