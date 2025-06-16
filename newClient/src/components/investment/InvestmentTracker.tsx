
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InvestmentFilters } from "@/components/investment/InvestmentFilters";
import { InvestmentPagination } from "@/components/investment/InvestmentPagination";
import { InvestmentDialog } from "@/components/investment/InvestmentDialog";
import { useInvestments, useCreateInvestment, useUpdateInvestment, useAddPurchase, useDeleteInvestment } from "@/hooks/useInvestments";
import { useInvestmentData } from "@/hooks/useInvestmentData";
import { useStockMarketData } from "@/hooks/useStockMarketData";
import { useRealTimePortfolio } from "@/hooks/useRealTimePortfolio";
import { InvestmentPurpose, InvestmentFormData, Purchase, InvestmentWithSummary } from "@/types/investment";
import { InvestmentPageHeader } from "./InvestmentPageHeader";
import { PortfolioContent } from "./PortfolioContent";
import { WatchlistSummary } from "./WatchlistSummary";
import { InvestmentList } from "./InvestmentList";
import { Skeleton } from "@/components/ui/skeleton";
import { DeleteConfirmationDialog } from "@/components/common/DeleteConfirmationDialog";
import { useIsMobile } from "@/hooks/use-mobile";

export const InvestmentTracker = () => {
  const [activeTab, setActiveTab] = useState<InvestmentPurpose>(InvestmentPurpose.OWNED);
  const [showDialog, setShowDialog] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState<InvestmentWithSummary | undefined>(undefined);
  const [deletingInvestmentId, setDeletingInvestmentId] = useState<string | undefined>(undefined);
  const isMobile = useIsMobile();
  
  const { data: investments, isLoading: isLoadingInvestments } = useInvestments();
  const createInvestmentMutation = useCreateInvestment();
  const updateInvestmentMutation = useUpdateInvestment();
  const addPurchaseMutation = useAddPurchase();
  const deleteInvestmentMutation = useDeleteInvestment();

  const { ownedStocks, monitoringStocks, isLoading: isLoadingMarketData } = useStockMarketData(investments || []);

  const {
    searchTerm,
    selectedTypes,
    sortBy,
    sortOrder,
    currentPage,
    pageSize,
    setSearchTerm,
    handleTypeToggle,
    setSortBy,
    setSortOrder,
    setCurrentPage,
    setPageSize,
    handleClearFilters,
    handlePageSizeChange,
    paginatedInvestments,
    filteredAndSortedInvestments,
    totalPages,
    portfolioSummary,
    watchlistSummary,
  } = useInvestmentData(investments, activeTab);

  const realTimePortfolioData = useRealTimePortfolio(filteredAndSortedInvestments, ownedStocks, portfolioSummary);

  const handleSubmitInvestment = async (data: InvestmentFormData) => {
    try {
      if (editingInvestment) {
        const { name, symbol, type, target_price, notes } = data;
        const updateData: Partial<InvestmentFormData> = { 
          name, 
          symbol, 
          type, 
          notes,
          is_recurring: data.is_recurring,
          recurring_frequency: data.recurring_frequency,
          recurring_amount: data.recurring_amount,
          interest_rate: data.interest_rate,
          interest_rate_type: data.interest_rate_type,
          maturity_date: data.maturity_date,
          annual_limit: data.annual_limit,
          start_date: data.start_date,
          equity_ratio: data.equity_ratio,
          debt_ratio: data.debt_ratio,
        };
        
        if (editingInvestment.purpose === InvestmentPurpose.MONITORING) {
          updateData.target_price = target_price;
        }
        
        await updateInvestmentMutation.mutateAsync({ id: editingInvestment.id, data: updateData });
      } else {
        await createInvestmentMutation.mutateAsync(data);
      }
      setShowDialog(false);
      setEditingInvestment(undefined);
    } catch (error) {
      console.error("Error saving investment:", error);
    }
  };

  const handleAddPurchase = async (investmentId: string, purchase: Omit<Purchase, 'total_amount'>) => {
    try {
      await addPurchaseMutation.mutateAsync({ investmentId, purchase });
    } catch (error) {
      console.error("Error adding purchase:", error);
    }
  };

  const handleEditInvestment = (investmentId: string) => {
    const investmentToEdit = filteredAndSortedInvestments.find(inv => inv.id === investmentId);
    if (investmentToEdit) {
      setEditingInvestment(investmentToEdit);
      setShowDialog(true);
    }
  };

  const handleDelete = (investmentId: string) => {
    setDeletingInvestmentId(investmentId);
  };

  const handleConfirmDelete = () => {
    if (!deletingInvestmentId) return;
    deleteInvestmentMutation.mutate(deletingInvestmentId, {
      onSuccess: () => {
        setDeletingInvestmentId(undefined);
      },
    });
  };

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      setEditingInvestment(undefined);
    }
    setShowDialog(open);
  }

  const getMarketDataForInvestment = (investmentId: string) => {
    const allMarketData = [...ownedStocks, ...monitoringStocks];
    return allMarketData.find(item => item.investment.id === investmentId);
  };

  if (isLoadingInvestments) {
    return (
      <div className="space-y-6 p-3 sm:p-6 bg-background">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <Skeleton className="h-8 sm:h-10 w-full sm:w-1/3" />
          <Skeleton className="h-8 sm:h-10 w-full sm:w-44" />
        </div>
        <Skeleton className="h-10 w-full" />
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const hasFilters = searchTerm.length > 0 || selectedTypes.length > 0;
  const totalPortfolioInvestments = portfolioSummary.totalInvestments;
  const totalWatchlistInvestments = watchlistSummary.totalInvestments;

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-6 bg-background min-h-screen">
      <InvestmentPageHeader onAddInvestment={() => setShowDialog(true)} activeTab={activeTab} />

      <Tabs value={activeTab} onValueChange={(value) => {
        setActiveTab(value as InvestmentPurpose);
        handleClearFilters();
      }}>
        <div className="overflow-x-auto">
          <TabsList className={`grid w-full grid-cols-2 ${isMobile ? 'w-full' : 'md:w-fit'} bg-card border border-border`}>
            <TabsTrigger 
              value={InvestmentPurpose.OWNED} 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground hover:text-foreground transition-colors text-sm sm:text-base"
            >
              Portfolio ({totalPortfolioInvestments})
            </TabsTrigger>
            <TabsTrigger 
              value={InvestmentPurpose.MONITORING} 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground hover:text-foreground transition-colors text-sm sm:text-base"
            >
              Watchlist ({totalWatchlistInvestments})
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value={InvestmentPurpose.OWNED} className="space-y-4 sm:space-y-6">
          <PortfolioContent
            filteredAndSortedInvestments={filteredAndSortedInvestments}
            paginatedInvestments={paginatedInvestments}
            realTimeCurrentValue={realTimePortfolioData?.realTimeCurrentValue}
            realTimeTotalProfitLoss={realTimePortfolioData?.realTimeTotalProfitLoss}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedTypes={selectedTypes}
            onTypeToggle={handleTypeToggle}
            sortBy={sortBy}
            onSortChange={setSortBy}
            sortOrder={sortOrder}
            onSortOrderChange={setSortOrder}
            onClearFilters={handleClearFilters}
            onAddPurchase={handleAddPurchase}
            isLoadingPurchase={addPurchaseMutation.isPending}
            onAddInvestment={() => setShowDialog(true)}
            onEdit={handleEditInvestment}
            onDelete={handleDelete}
            getMarketData={getMarketDataForInvestment}
            isLoadingMarketData={isLoadingMarketData}
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={handlePageSizeChange}
            totalPortfolioInvestments={totalPortfolioInvestments}
          />
        </TabsContent>

        <TabsContent value={InvestmentPurpose.MONITORING} className="space-y-4 sm:space-y-6">
          <WatchlistSummary {...watchlistSummary} />

          <InvestmentFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedTypes={selectedTypes}
            onTypeToggle={handleTypeToggle}
            sortBy={sortBy}
            onSortChange={setSortBy}
            sortOrder={sortOrder}
            onSortOrderChange={setSortOrder}
            onClearFilters={handleClearFilters}
          />
          
          <InvestmentList 
            investments={paginatedInvestments}
            onAddPurchase={handleAddPurchase}
            isLoadingPurchase={addPurchaseMutation.isPending}
            onAddInvestment={() => setShowDialog(true)}
            hasFilters={hasFilters}
            hasInvestments={totalWatchlistInvestments > 0}
            isPortfolio={false}
            onEdit={handleEditInvestment}
            onDelete={handleDelete}
            getMarketData={getMarketDataForInvestment}
            isLoadingMarketData={isLoadingMarketData}
          />

          {filteredAndSortedInvestments.length > pageSize && (
            <InvestmentPagination
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              totalItems={filteredAndSortedInvestments.length}
              onPageChange={setCurrentPage}
              onPageSizeChange={handlePageSizeChange}
            />
          )}
        </TabsContent>
      </Tabs>

      <InvestmentDialog
        open={showDialog}
        onOpenChange={handleDialogClose}
        purpose={activeTab}
        onSubmit={handleSubmitInvestment}
        isLoading={createInvestmentMutation.isPending || updateInvestmentMutation.isPending}
        investmentToEdit={editingInvestment}
      />
      <DeleteConfirmationDialog
        open={!!deletingInvestmentId}
        onOpenChange={(isOpen) => !isOpen && setDeletingInvestmentId(undefined)}
        onConfirm={handleConfirmDelete}
        isLoading={deleteInvestmentMutation.isPending}
      />
    </div>
  );
};
