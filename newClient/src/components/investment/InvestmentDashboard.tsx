
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Building2, Landmark, Eye } from "lucide-react";
import { InvestmentWithSummary, InvestmentType, InvestmentPurpose } from "@/types/investment";
import { formatCurrency, formatPercentage } from "@/lib/formatters";

interface InvestmentDashboardProps {
  investments: InvestmentWithSummary[];
  realTimeCurrentValue?: number;
  realTimeTotalProfitLoss?: number;
}

export const InvestmentDashboard = ({ 
  investments, 
  realTimeCurrentValue, 
  realTimeTotalProfitLoss 
}: InvestmentDashboardProps) => {
  // Filter investments by category
  const portfolioInvestments = investments.filter(inv => inv.purpose === InvestmentPurpose.OWNED);
  const watchlistInvestments = investments.filter(inv => inv.purpose === InvestmentPurpose.MONITORING);
  
  const stockInvestments = portfolioInvestments.filter(inv => 
    [InvestmentType.STOCK, InvestmentType.MUTUAL_FUND].includes(inv.type)
  );
  
  const governmentInvestments = portfolioInvestments.filter(inv => 
    [InvestmentType.PPF, InvestmentType.EPF, InvestmentType.NPS].includes(inv.type)
  );
  
  const commodityInvestments = portfolioInvestments.filter(inv => 
    [InvestmentType.GOLD, InvestmentType.SILVER].includes(inv.type)
  );

  // Calculate totals
  const totalInvested = portfolioInvestments.reduce((sum, inv) => sum + inv.summary.totalInvested, 0);
  const totalCurrentValue = realTimeCurrentValue ?? portfolioInvestments.reduce((sum, inv) => sum + inv.summary.currentValue, 0);
  const totalProfitLoss = realTimeTotalProfitLoss ?? (totalCurrentValue - totalInvested);
  const totalProfitLossPercentage = totalInvested > 0 ? (totalProfitLoss / totalInvested) * 100 : 0;

  // Calculate category-wise totals
  const stocksTotal = stockInvestments.reduce((sum, inv) => sum + inv.summary.totalInvested, 0);
  const governmentTotal = governmentInvestments.reduce((sum, inv) => sum + inv.summary.totalInvested, 0);
  const commodityTotal = commodityInvestments.reduce((sum, inv) => sum + inv.summary.totalInvested, 0);

  const stocksCurrentValue = stockInvestments.reduce((sum, inv) => sum + inv.summary.currentValue, 0);
  const governmentCurrentValue = governmentInvestments.reduce((sum, inv) => sum + inv.summary.currentValue, 0);
  const commodityCurrentValue = commodityInvestments.reduce((sum, inv) => sum + inv.summary.currentValue, 0);

  const stocksProfitLoss = stocksCurrentValue - stocksTotal;
  const governmentProfitLoss = governmentCurrentValue - governmentTotal;
  const commodityProfitLoss = commodityCurrentValue - commodityTotal;

  if (portfolioInvestments.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Overall Portfolio Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Portfolio Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-sm font-medium text-blue-600">Total Invested</p>
              <p className="text-2xl font-bold text-blue-900">
                {formatCurrency(totalInvested)}
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="text-sm font-medium text-green-600">Current Value</p>
              <p className="text-2xl font-bold text-green-900">
                {formatCurrency(totalCurrentValue)}
              </p>
              {realTimeCurrentValue && (
                <p className="text-xs text-green-600 mt-1">Live</p>
              )}
            </div>
            <div className={`p-4 rounded-lg border ${
              totalProfitLoss >= 0 
                ? 'bg-emerald-50 border-emerald-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <p className={`text-sm font-medium ${
                totalProfitLoss >= 0 ? 'text-emerald-600' : 'text-red-600'
              }`}>
                Total {totalProfitLoss >= 0 ? 'Profit' : 'Loss'}
              </p>
              <div className="flex items-center gap-2">
                {totalProfitLoss >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
                <p className={`text-2xl font-bold ${
                  totalProfitLoss >= 0 ? 'text-emerald-900' : 'text-red-900'
                }`}>
                  {formatCurrency(Math.abs(totalProfitLoss))}
                </p>
              </div>
              <p className={`text-xs mt-1 ${
                totalProfitLoss >= 0 ? 'text-emerald-600' : 'text-red-600'
              }`}>
                ({totalProfitLoss >= 0 ? '+' : ''}{formatPercentage(totalProfitLossPercentage)})
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p className="text-sm font-medium text-gray-600">Total Items</p>
              <p className="text-2xl font-bold text-gray-900">
                {portfolioInvestments.length}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                + {watchlistInvestments.length} watchlist
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Stocks & Mutual Funds */}
        {stockInvestments.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 className="h-4 w-4 text-blue-600" />
                Stocks & Mutual Funds
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Invested</p>
                <p className="font-semibold">{formatCurrency(stocksTotal)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Value</p>
                <p className="font-semibold">{formatCurrency(stocksCurrentValue)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">P&L</p>
                <p className={`font-semibold ${stocksProfitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stocksProfitLoss >= 0 ? '+' : ''}{formatCurrency(stocksProfitLoss)}
                </p>
              </div>
              <div className="text-xs text-muted-foreground">
                {stockInvestments.length} investments
              </div>
            </CardContent>
          </Card>
        )}

        {/* Government Schemes */}
        {governmentInvestments.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Landmark className="h-4 w-4 text-green-600" />
                Government Schemes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Invested</p>
                <p className="font-semibold">{formatCurrency(governmentTotal)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Value</p>
                <p className="font-semibold">{formatCurrency(governmentCurrentValue)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">P&L</p>
                <p className={`font-semibold ${governmentProfitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {governmentProfitLoss >= 0 ? '+' : ''}{formatCurrency(governmentProfitLoss)}
                </p>
              </div>
              <div className="text-xs text-muted-foreground">
                {governmentInvestments.length} schemes
              </div>
            </CardContent>
          </Card>
        )}

        {/* Commodities */}
        {commodityInvestments.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-yellow-600" />
                Commodities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Invested</p>
                <p className="font-semibold">{formatCurrency(commodityTotal)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Value</p>
                <p className="font-semibold">{formatCurrency(commodityCurrentValue)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">P&L</p>
                <p className={`font-semibold ${commodityProfitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {commodityProfitLoss >= 0 ? '+' : ''}{formatCurrency(commodityProfitLoss)}
                </p>
              </div>
              <div className="text-xs text-muted-foreground">
                {commodityInvestments.length} investments
              </div>
            </CardContent>
          </Card>
        )}

        {/* Watchlist Summary */}
        {watchlistInvestments.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Eye className="h-4 w-4 text-orange-600" />
                Watchlist
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Total Items</p>
                <p className="font-semibold">{watchlistInvestments.length}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">With Target Price</p>
                <p className="font-semibold">
                  {watchlistInvestments.filter(inv => inv.target_price).length}
                </p>
              </div>
              <div className="text-xs text-muted-foreground">
                Monitoring opportunities
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
