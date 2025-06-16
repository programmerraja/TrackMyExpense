
import { InvestmentWithSummary, Purchase } from "@/types/investment";
import { InvestmentList } from "./InvestmentList";

interface InvestmentSectionProps {
  title: string;
  investments: InvestmentWithSummary[];
  onAddPurchase: (investmentId: string, purchase: Omit<Purchase, 'total_amount'>) => void;
  isLoadingPurchase: boolean;
  onAddInvestment: () => void;
  hasFilters: boolean;
  hasInvestments: boolean;
  onEdit: (investmentId: string) => void;
  onDelete: (investmentId: string) => void;
  getMarketData: (investmentId: string) => any;
  isLoadingMarketData: boolean;
  showTitle?: boolean;
}

export const InvestmentSection = ({
  title,
  investments,
  onAddPurchase,
  isLoadingPurchase,
  onAddInvestment,
  hasFilters,
  hasInvestments,
  onEdit,
  onDelete,
  getMarketData,
  isLoadingMarketData,
  showTitle = true,
}: InvestmentSectionProps) => {
  if (investments.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {showTitle && (
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <span>{title}</span>
          <span className="text-sm text-muted-foreground font-normal">
            ({investments.length} investments)
          </span>
        </h3>
      )}
      <InvestmentList 
        investments={investments}
        onAddPurchase={onAddPurchase}
        isLoadingPurchase={isLoadingPurchase}
        onAddInvestment={onAddInvestment}
        hasFilters={hasFilters}
        hasInvestments={hasInvestments}
        isPortfolio={true}
        onEdit={onEdit}
        onDelete={onDelete}
        getMarketData={getMarketData}
        isLoadingMarketData={isLoadingMarketData}
      />
    </div>
  );
};
