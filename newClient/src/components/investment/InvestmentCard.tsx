
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Plus } from "lucide-react";
import { Investment, Purchase } from "@/types/investment";
import { formatCurrency } from "@/lib/utils";
import { investmentService } from "@/services/investmentService";
import { PurchaseDialog } from "./PurchaseDialog";

interface InvestmentCardProps {
  investment: Investment;
  onAddPurchase?: (investmentId: string, purchase: Omit<Purchase, 'total_amount'>) => void;
  isLoadingPurchase?: boolean;
}

export const InvestmentCard = ({ investment, onAddPurchase, isLoadingPurchase }: InvestmentCardProps) => {
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);
  
  const purchases = (investment.purchases as unknown as Purchase[]) || [];
  const summary = investmentService.calculateInvestmentSummary(purchases);

  const handleAddPurchase = (purchase: Omit<Purchase, 'total_amount'>) => {
    if (onAddPurchase) {
      onAddPurchase(investment.id, purchase);
      setShowPurchaseDialog(false);
    }
  };

  const isProfitable = summary.profitLoss >= 0;
  const isWatchlist = investment.purpose === 'MONITORING';

  return (
    <>
      <Card className="hover:shadow-md transition-shadow bg-card border-border">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <CardTitle className="text-lg text-foreground">{investment.name}</CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {investment.symbol}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {investment.type}
                </Badge>
                {isWatchlist && investment.target_price && (
                  <Badge variant="outline" className="text-xs text-blue-600 dark:text-blue-400">
                    Target: {formatCurrency(investment.target_price)}
                  </Badge>
                )}
              </div>
            </div>
            {!isWatchlist && onAddPurchase && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowPurchaseDialog(true)}
                disabled={isLoadingPurchase}
                className="flex items-center gap-1"
              >
                <Plus className="h-3 w-3" />
                Add Purchase
              </Button>
            )}
          </div>
        </CardHeader>

        {!isWatchlist && summary.totalQuantity > 0 && (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Invested</p>
                <p className="font-semibold text-foreground">{formatCurrency(summary.totalInvested)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Value</p>
                <p className="font-semibold text-foreground">{formatCurrency(summary.currentValue)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Quantity</p>
                <p className="font-semibold text-foreground">{summary.totalQuantity}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Price</p>
                <p className="font-semibold text-foreground">{formatCurrency(summary.averagePrice)}</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
              <div className="flex items-center gap-2">
                {isProfitable ? (
                  <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
                )}
                <span className={`font-semibold ${isProfitable ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {isProfitable ? '+' : ''}{formatCurrency(summary.profitLoss)}
                </span>
              </div>
              <div className={`text-sm ${isProfitable ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                ({isProfitable ? '+' : ''}{summary.profitLossPercentage.toFixed(2)}%)
              </div>
            </div>

            {purchases.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Recent Purchases</p>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {purchases.slice(-3).reverse().map((purchase, index) => (
                    <div key={index} className="flex justify-between text-sm bg-muted p-2 rounded border border-border">
                      <span className="text-muted-foreground">{purchase.date}</span>
                      <span className="text-foreground">{purchase.quantity} @ {formatCurrency(purchase.price_per_unit)}</span>
                      <span className="font-medium text-foreground">{formatCurrency(purchase.total_amount)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        )}

        {isWatchlist && (
          <CardContent>
            <div className="text-center py-4">
              <p className="text-muted-foreground text-sm">Monitoring for opportunities</p>
              {investment.target_price && (
                <p className="text-blue-600 dark:text-blue-400 font-medium mt-1">
                  Target: {formatCurrency(investment.target_price)}
                </p>
              )}
            </div>
          </CardContent>
        )}
      </Card>

      {showPurchaseDialog && (
        <PurchaseDialog
          open={showPurchaseDialog}
          onOpenChange={setShowPurchaseDialog}
          investmentName={investment.name}
          onSubmit={handleAddPurchase}
          isLoading={isLoadingPurchase}
        />
      )}
    </>
  );
};
