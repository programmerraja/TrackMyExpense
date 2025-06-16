
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Landmark, Shield, TrendingUp } from "lucide-react";
import { InvestmentWithSummary, InvestmentType } from "@/types/investment";
import { CompactInvestmentCard } from "./CompactInvestmentCard";
import { formatCurrency, formatPercentage } from "@/lib/formatters";

interface GovernmentSchemesSectionProps {
  investments: InvestmentWithSummary[];
  onAddPurchase?: (investmentId: string, purchase: any) => void;
  isLoadingPurchase: boolean;
  onEdit: (investmentId: string) => void;
  onDelete: (investmentId: string) => void;
  getMarketData?: (investmentId: string) => any;
  isLoadingMarketData?: boolean;
}

export const GovernmentSchemesSection = ({
  investments,
  onAddPurchase,
  isLoadingPurchase,
  onEdit,
  onDelete,
  getMarketData,
  isLoadingMarketData,
}: GovernmentSchemesSectionProps) => {
  const governmentSchemes = investments.filter(inv => 
    [InvestmentType.PPF, InvestmentType.EPF, InvestmentType.NPS].includes(inv.type)
  );

  if (governmentSchemes.length === 0) {
    return null;
  }

  const totalInvested = governmentSchemes.reduce((sum, inv) => sum + inv.summary.totalInvested, 0);
  const totalCurrentValue = governmentSchemes.reduce((sum, inv) => sum + inv.summary.currentValue, 0);
  const totalProfitLoss = totalCurrentValue - totalInvested;
  const totalProfitLossPercentage = totalInvested > 0 ? (totalProfitLoss / totalInvested) * 100 : 0;

  // Categorize schemes
  const ppfSchemes = governmentSchemes.filter(inv => inv.type === InvestmentType.PPF);
  const epfSchemes = governmentSchemes.filter(inv => inv.type === InvestmentType.EPF);
  const npsSchemes = governmentSchemes.filter(inv => inv.type === InvestmentType.NPS);

  return (
    <div className="space-y-6">
      <Card className="border-green-200 dark:border-green-800 bg-green-50/30 dark:bg-green-950/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <Landmark className="h-5 w-5 text-green-700 dark:text-green-400" />
              </div>
              <div>
                <CardTitle className="text-xl text-green-800 dark:text-green-300">Government Investment Schemes</CardTitle>
                <p className="text-sm text-green-600 dark:text-green-400 mt-1">Tax-saving and retirement planning investments</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700">
                <Shield className="h-3 w-3 mr-1" />
                Tax Saving
              </Badge>
              <Badge variant="outline" className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700">
                <TrendingUp className="h-3 w-3 mr-1" />
                Long Term
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="bg-card p-3 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-muted-foreground">Total Invested</p>
              <p className="font-semibold text-lg text-foreground">{formatCurrency(totalInvested)}</p>
            </div>
            <div className="bg-card p-3 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-muted-foreground">Current Value</p>
              <p className="font-semibold text-lg text-foreground">{formatCurrency(totalCurrentValue)}</p>
            </div>
            <div className="bg-card p-3 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-muted-foreground">Total Returns</p>
              <p className={`font-semibold text-lg ${totalProfitLoss >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {formatCurrency(totalProfitLoss)}
              </p>
            </div>
            <div className="bg-card p-3 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-muted-foreground">Overall Return</p>
              <p className={`font-semibold text-lg ${totalProfitLoss >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {formatPercentage(totalProfitLossPercentage)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {/* PPF Section */}
        {ppfSchemes.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200">
                Public Provident Fund (PPF)
              </Badge>
              <span className="text-sm text-muted-foreground">
                {ppfSchemes.length} account{ppfSchemes.length > 1 ? 's' : ''}
              </span>
            </div>
            {ppfSchemes.map((investment) => {
              const marketData = getMarketData ? getMarketData(investment.id) : undefined;
              return (
                <CompactInvestmentCard
                  key={investment.id}
                  investment={investment}
                  onAddPurchase={onAddPurchase}
                  isLoadingPurchase={isLoadingPurchase}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  marketData={marketData}
                  isLoadingMarketData={isLoadingMarketData}
                />
              );
            })}
          </div>
        )}

        {/* EPF Section */}
        {epfSchemes.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                Employee Provident Fund (EPF)
              </Badge>
              <span className="text-sm text-muted-foreground">
                {epfSchemes.length} account{epfSchemes.length > 1 ? 's' : ''}
              </span>
            </div>
            {epfSchemes.map((investment) => {
              const marketData = getMarketData ? getMarketData(investment.id) : undefined;
              return (
                <CompactInvestmentCard
                  key={investment.id}
                  investment={investment}
                  onAddPurchase={onAddPurchase}
                  isLoadingPurchase={isLoadingPurchase}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  marketData={marketData}
                  isLoadingMarketData={isLoadingMarketData}
                />
              );
            })}
          </div>
        )}

        {/* NPS Section */}
        {npsSchemes.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                National Pension System (NPS)
              </Badge>
              <span className="text-sm text-muted-foreground">
                {npsSchemes.length} account{npsSchemes.length > 1 ? 's' : ''}
              </span>
            </div>
            {npsSchemes.map((investment) => {
              const marketData = getMarketData ? getMarketData(investment.id) : undefined;
              return (
                <CompactInvestmentCard
                  key={investment.id}
                  investment={investment}
                  onAddPurchase={onAddPurchase}
                  isLoadingPurchase={isLoadingPurchase}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  marketData={marketData}
                  isLoadingMarketData={isLoadingMarketData}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
