
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { formatCurrency } from "@/lib/utils"
import { MarketData } from "@/types/market"

interface MarketChartCardProps {
  icon: React.ReactNode
  data?: MarketData
  isLoading: boolean
  formatter: (value: number) => string
}

export const MarketChartCard = ({ icon, data, isLoading, formatter }: MarketChartCardProps) => {
  if (isLoading || !data) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="grid gap-1">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
            <div className="text-right">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-5 w-24 mt-1" />
            </div>
          </div>
          <Skeleton className="h-80 w-full" />
        </CardContent>
      </Card>
    )
  }
  
  const { name, price, change, changePercentage, history } = data;
  const isPositive = change >= 0;

  // Calculate min and max for better Y-axis scaling with minimal padding for more granular view
  const prices = history.map(d => d.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceRange = maxPrice - minPrice;
  
  // Use much smaller padding (2% instead of 15%) for better granularity
  const padding = priceRange * 0.02;
  const yAxisMin = Math.max(0, minPrice - padding);
  const yAxisMax = maxPrice + padding;

  const chartConfig = {
    price: {
      label: "Price",
      color: isPositive ? "hsl(var(--chart-1))" : "hsl(var(--destructive))",
    },
  };

  return (
    <Card className="bg-card border-border shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            {icon}
            <div className="grid gap-1">
              <p className="text-sm font-semibold text-card-foreground">{name}</p>
              <p className="text-xs text-muted-foreground">Commodity Performance</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold text-card-foreground">{formatter(price)}</p>
            <p className={`text-sm font-semibold ${isPositive ? "text-green-600" : "text-red-600"}`}>
              {isPositive ? "+" : ""}
              {formatCurrency(change, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              <span className="ml-1">
                ({isPositive ? "+" : ""}
                {changePercentage.toFixed(2)}%)
              </span>
            </p>
          </div>
        </div>
        
        <div className="h-80 w-full">
          <ChartContainer config={chartConfig} className="h-full w-full">
            <LineChart
              accessibilityLayer
              data={history}
              margin={{ left: 12, right: 12, top: 10, bottom: 10 }}
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
                tickMargin={10}
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
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
                tickMargin={10}
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                domain={[yAxisMin, yAxisMax]}
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
                  const formattedPrice = formatter(data.value as number);
                  
                  return (
                    <div className="bg-background border border-border/50 rounded-lg shadow-xl p-3 min-w-[140px]">
                      <p className="text-sm font-medium text-foreground mb-1">{name}</p>
                      <p className="text-xs text-muted-foreground mb-2">{formattedDate}</p>
                      <p className="text-lg font-semibold text-foreground">{formattedPrice}</p>
                    </div>
                  );
                }}
              />
              
              <Line
                dataKey="price"
                type="monotone"
                stroke={isPositive ? "hsl(var(--chart-1))" : "hsl(var(--destructive))"}
                strokeWidth={2.5}
                dot={{
                  r: 5,
                  fill: isPositive ? "hsl(var(--chart-1))" : "hsl(var(--destructive))",
                  stroke: "hsl(var(--background))",
                  strokeWidth: 2
                }}
                activeDot={{
                  r: 7,
                  fill: isPositive ? "hsl(var(--chart-1))" : "hsl(var(--destructive))",
                  stroke: "hsl(var(--background))",
                  strokeWidth: 2
                }}
              />
            </LineChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  )
}
