
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CompactInvestmentCard } from "@/components/investment/CompactInvestmentCard";
import { InvestmentWithSummary, Purchase } from "@/types/investment";

interface InvestmentListProps {
    investments: InvestmentWithSummary[];
    onAddPurchase: (investmentId: string, purchase: Omit<Purchase, 'total_amount'>) => void;
    isLoadingPurchase: boolean;
    onAddInvestment: () => void;
    hasFilters: boolean;
    hasInvestments: boolean;
    isPortfolio: boolean;
    onEdit: (investmentId: string) => void;
    onDelete: (investmentId: string) => void;
    getMarketData?: (investmentId: string) => any;
    isLoadingMarketData?: boolean;
}

export const InvestmentList = ({
    investments,
    onAddPurchase,
    isLoadingPurchase,
    onAddInvestment,
    hasFilters,
    hasInvestments,
    isPortfolio,
    onEdit,
    onDelete,
    getMarketData,
    isLoadingMarketData,
}: InvestmentListProps) => {
    if (investments.length === 0) {
        return (
            <div className="text-center py-12 bg-card rounded-lg border border-border">
                <p className="text-muted-foreground mb-4">
                  {hasFilters
                    ? "No investments match your filters." 
                    : hasInvestments 
                      ? isPortfolio ? "No investments in your portfolio for the selected filters." : "No investments on your watchlist for the selected filters."
                      : isPortfolio ? "No investments in your portfolio yet." : "No investments on your watchlist yet."
                  }
                </p>
                {!hasFilters && !hasInvestments && (
                  <Button onClick={onAddInvestment} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    <Plus className="h-4 w-4 mr-2" />
                    {isPortfolio ? "Add Your First Investment" : "Add to Watchlist"}
                  </Button>
                )}
              </div>
        );
    }

    return (
        <div className="space-y-4">
            {investments.map((investment) => {
                const marketData = getMarketData ? getMarketData(investment.id) : undefined;
                return (
                    <CompactInvestmentCard
                        key={investment.id}
                        investment={investment}
                        onAddPurchase={isPortfolio ? onAddPurchase : undefined}
                        isLoadingPurchase={isLoadingPurchase}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        marketData={marketData}
                        isLoadingMarketData={isLoadingMarketData}
                    />
                );
            })}
        </div>
    );
};
