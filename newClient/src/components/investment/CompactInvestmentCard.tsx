
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Plus, MoreVertical, Edit, Trash2, Calendar, Landmark, X } from "lucide-react";
import { InvestmentWithSummary, InvestmentPurpose, InvestmentType, Purchase } from "@/types/investment";
import { formatCurrency, formatPercentage } from "@/lib/formatters";
import { PurchaseDialog } from "./PurchaseDialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { PPFDepositManager } from "./schemes/PPFDepositManager";
import { usePPFDeposits } from "@/hooks/usePPFDeposits";
import { investmentService } from "@/services/investmentService";

interface CompactInvestmentCardProps {
  investment: InvestmentWithSummary;
  onAddPurchase?: (investmentId: string, purchase: Omit<Purchase, 'total_amount'>) => void;
  isLoadingPurchase?: boolean;
  onEdit: (investmentId: string) => void;
  onDelete: (investmentId: string) => void;
  marketData?: any;
  isLoadingMarketData?: boolean;
}

export const CompactInvestmentCard = ({ 
  investment, 
  onAddPurchase, 
  isLoadingPurchase, 
  onEdit, 
  onDelete,
  marketData,
  isLoadingMarketData 
}: CompactInvestmentCardProps) => {
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);
  const [showPPFManager, setShowPPFManager] = useState(false);
  const { 
    updateDeposit, 
    removeDeposit, 
    enableRecurring,
    updateRecurringAmount,
    disableRecurring,
    isUpdating,
    isEnabling,
    isUpdatingAmount,
    isDisabling
  } = usePPFDeposits();

  const purchases = (investment.purchases as unknown as Purchase[]) || [];
  const summary = investment.summary;
  const isProfitable = summary.profitLoss >= 0;
  const isWatchlist = investment.purpose === InvestmentPurpose.MONITORING;

  const handleAddPurchase = (purchase: Omit<Purchase, 'total_amount'>) => {
    if (onAddPurchase) {
      onAddPurchase(investment.id, purchase);
      setShowPurchaseDialog(false);
    }
  };

  const handlePPFDepositUpdate = (month: string, amount: number, date: string) => {
    updateDeposit.mutate({ investmentId: investment.id, month, amount, date });
  };

  const handlePPFDepositAdd = (month: string, amount: number, date: string) => {
    updateDeposit.mutate({ investmentId: investment.id, month, amount, date });
  };

  const handlePPFDepositRemove = (month: string) => {
    removeDeposit.mutate({ investmentId: investment.id, month });
  };

  const handleEnableRecurring = (amount: number, startMonth: string) => {
    enableRecurring.mutate({ investmentId: investment.id, amount, startMonth });
  };

  const handleUpdateRecurringAmount = (newAmount: number, effectiveFromMonth: string) => {
    updateRecurringAmount.mutate({ investmentId: investment.id, newAmount, effectiveFromMonth });
  };

  const handleDisableRecurring = () => {
    disableRecurring.mutate({ investmentId: investment.id });
  };

  const isPPF = investment.type === InvestmentType.PPF;
  const canEditPastContributions = investmentService.canEditPastContributions(investment.type);
  
  // Handle PPF scheme config - updated to use correct path
  const ppfConfig = isPPF && investment.scheme_config ? investment.scheme_config : null;
  const deposits = ppfConfig?.deposit_schedule || [];
  const recurringConfig = ppfConfig?.recurring_config || null;

  // For empty PPF configs, provide default values
  const defaultPPFConfig = isPPF && !ppfConfig ? {
    annual_limit: 150000,
    deposit_schedule: []
  } : null;

  const effectivePPFConfig = ppfConfig || defaultPPFConfig;
  const annualLimit = effectivePPFConfig?.annual_limit || 150000;

  const isRecurringLoading = isEnabling || isUpdatingAmount || isDisabling;

  return (
    <>
      <Card className="hover:shadow-md transition-shadow bg-card border-border">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div className="space-y-2 flex-1">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-foreground flex items-center gap-2">
                  {isPPF && <Landmark className="h-4 w-4 text-green-600" />}
                  {investment.name}
                </CardTitle>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-card border-border">
                    <DropdownMenuItem onClick={() => onEdit(investment.id)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Investment
                    </DropdownMenuItem>
                    {isPPF && canEditPastContributions && (
                      <DropdownMenuItem onClick={() => setShowPPFManager(true)}>
                        <Calendar className="mr-2 h-4 w-4" />
                        Manage Deposits
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem 
                      onClick={() => onDelete(investment.id)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="text-xs">
                  {investment.symbol}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {investment.type}
                </Badge>
                {isPPF && summary.annualLimitUsed !== undefined && (
                  <Badge variant="outline" className="text-xs text-green-600 dark:text-green-400">
                    {formatCurrency(summary.annualLimitUsed)} / {formatCurrency(annualLimit)}
                  </Badge>
                )}
                {isPPF && recurringConfig?.enabled && (
                  <Badge variant="outline" className="text-xs text-blue-600 dark:text-blue-400">
                    Auto: {formatCurrency(recurringConfig.amount)}/month
                  </Badge>
                )}
                {isWatchlist && investment.target_price && (
                  <Badge variant="outline" className="text-xs text-blue-600 dark:text-blue-400">
                    Target: {formatCurrency(investment.target_price)}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardHeader>

        {!isWatchlist && summary.totalInvested > 0 && (
          <CardContent className="space-y-4">
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div className="space-y-1">
                <p className="text-muted-foreground">Total Invested</p>
                <p className="font-semibold text-foreground">{formatCurrency(summary.totalInvested)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground">Current Value</p>
                <p className="font-semibold text-foreground">{formatCurrency(summary.currentValue)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground">Returns</p>
                <p className={`font-semibold ${isProfitable ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {formatCurrency(summary.profitLoss)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground">Return %</p>
                <p className={`font-semibold ${isProfitable ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {formatPercentage(summary.profitLossPercentage)}
                </p>
              </div>
            </div>

            
            <div className="flex gap-2">
              {!isWatchlist && onAddPurchase && !isPPF && (
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
              {isPPF && canEditPastContributions && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowPPFManager(true)}
                  disabled={isUpdating}
                  className="flex items-center gap-1"
                >
                  <Calendar className="h-3 w-3" />
                  Manage Deposits
                </Button>
              )}
            </div>
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

      {showPPFManager && isPPF && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto m-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">PPF Deposit Manager - {investment.name}</h2>
              <Button variant="ghost" onClick={() => setShowPPFManager(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <PPFDepositManager
              deposits={deposits}
              annualLimit={annualLimit}
              annualLimitUsed={summary.annualLimitUsed || 0}
              recurringConfig={recurringConfig}
              onUpdateDeposit={handlePPFDepositUpdate}
              onAddDeposit={handlePPFDepositAdd}
              onRemoveDeposit={handlePPFDepositRemove}
              onEnableRecurring={handleEnableRecurring}
              onUpdateRecurringAmount={handleUpdateRecurringAmount}
              onDisableRecurring={handleDisableRecurring}
              isRecurringLoading={isRecurringLoading}
            />
          </div>
        </div>
      )}
    </>
  );
};
