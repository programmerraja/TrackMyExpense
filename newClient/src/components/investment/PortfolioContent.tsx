
import { InvestmentWithSummary, Purchase, InvestmentType } from "@/types/investment";
import { InvestmentDashboard } from "./InvestmentDashboard";
import { InvestmentFilters } from "./InvestmentFilters";
import { GovernmentSchemesSection } from "./GovernmentSchemesSection";
import { InvestmentSection } from "./InvestmentSection";
import { InvestmentList } from "./InvestmentList";
import { InvestmentPagination } from "./InvestmentPagination";

interface PortfolioContentProps {
  filteredAndSortedInvestments: InvestmentWithSummary[];
  paginatedInvestments: InvestmentWithSummary[];
  realTimeCurrentValue?: number;
  realTimeTotalProfitLoss?: number;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedTypes: InvestmentType[];
  onTypeToggle: (type: InvestmentType) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  sortOrder: 'asc' | 'desc';
  onSortOrderChange: (order: 'asc' | 'desc') => void;
  onClearFilters: () => void;
  onAddPurchase: (investmentId: string, purchase: Omit<Purchase, 'total_amount'>) => void;
  isLoadingPurchase: boolean;
  onAddInvestment: () => void;
  onEdit: (investmentId: string) => void;
  onDelete: (investmentId: string) => void;
  getMarketData: (investmentId: string) => any;
  isLoadingMarketData: boolean;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  totalPortfolioInvestments: number;
}

export const PortfolioContent = ({
  filteredAndSortedInvestments,
  paginatedInvestments,
  realTimeCurrentValue,
  realTimeTotalProfitLoss,
  searchTerm,
  onSearchChange,
  selectedTypes,
  onTypeToggle,
  sortBy,
  onSortChange,
  sortOrder,
  onSortOrderChange,
  onClearFilters,
  onAddPurchase,
  isLoadingPurchase,
  onAddInvestment,
  onEdit,
  onDelete,
  getMarketData,
  isLoadingMarketData,
  currentPage,
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange,
  totalPortfolioInvestments,
}: PortfolioContentProps) => {
  const hasFilters = searchTerm.length > 0 || selectedTypes.length > 0;

  // Separate investments by type for better organization
  const governmentSchemes = paginatedInvestments.filter(inv => 
    [InvestmentType.PPF, InvestmentType.EPF, InvestmentType.NPS].includes(inv.type)
  );
  const stocksAndMutualFunds = paginatedInvestments.filter(inv => 
    [InvestmentType.STOCK, InvestmentType.MUTUAL_FUND].includes(inv.type)
  );
  const commodities = paginatedInvestments.filter(inv => 
    [InvestmentType.GOLD, InvestmentType.SILVER].includes(inv.type)
  );

  const hasMultipleSections = [governmentSchemes, stocksAndMutualFunds, commodities]
    .filter(section => section.length > 0).length > 1;

  return (
    <div className="space-y-6">
      <InvestmentDashboard 
        investments={filteredAndSortedInvestments}
        realTimeCurrentValue={realTimeCurrentValue}
        realTimeTotalProfitLoss={realTimeTotalProfitLoss}
      />
      
      <InvestmentFilters
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
        selectedTypes={selectedTypes}
        onTypeToggle={onTypeToggle}
        sortBy={sortBy}
        onSortChange={onSortChange}
        sortOrder={sortOrder}
        onSortOrderChange={onSortOrderChange}
        onClearFilters={onClearFilters}
      />

      <GovernmentSchemesSection
        investments={governmentSchemes}
        onAddPurchase={onAddPurchase}
        isLoadingPurchase={isLoadingPurchase}
        onEdit={onEdit}
        onDelete={onDelete}
        getMarketData={getMarketData}
        isLoadingMarketData={isLoadingMarketData}
      />

      <InvestmentSection
        title="Stocks & Mutual Funds"
        investments={stocksAndMutualFunds}
        onAddPurchase={onAddPurchase}
        isLoadingPurchase={isLoadingPurchase}
        onAddInvestment={onAddInvestment}
        hasFilters={hasFilters}
        hasInvestments={totalPortfolioInvestments > 0}
        onEdit={onEdit}
        onDelete={onDelete}
        getMarketData={getMarketData}
        isLoadingMarketData={isLoadingMarketData}
        showTitle={hasMultipleSections}
      />

      <InvestmentSection
        title="Commodities"
        investments={commodities}
        onAddPurchase={onAddPurchase}
        isLoadingPurchase={isLoadingPurchase}
        onAddInvestment={onAddInvestment}
        hasFilters={hasFilters}
        hasInvestments={totalPortfolioInvestments > 0}
        onEdit={onEdit}
        onDelete={onDelete}
        getMarketData={getMarketData}
        isLoadingMarketData={isLoadingMarketData}
        showTitle={hasMultipleSections}
      />

      {paginatedInvestments.length === 0 && (
        <InvestmentList 
          investments={[]}
          onAddPurchase={onAddPurchase}
          isLoadingPurchase={isLoadingPurchase}
          onAddInvestment={onAddInvestment}
          hasFilters={hasFilters}
          hasInvestments={totalPortfolioInvestments > 0}
          isPortfolio={true}
          onEdit={onEdit}
          onDelete={onDelete}
          getMarketData={getMarketData}
          isLoadingMarketData={isLoadingMarketData}
        />
      )}

      {filteredAndSortedInvestments.length > pageSize && (
        <InvestmentPagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={filteredAndSortedInvestments.length}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      )}
    </div>
  );
};
