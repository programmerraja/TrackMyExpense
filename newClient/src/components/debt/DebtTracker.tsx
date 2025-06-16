import { Card, CardContent } from "@/components/ui/card";
import { MonthlyFilter } from "@/components/common/MonthlyFilter";
import { TransactionDialog } from "@/components/forms/TransactionDialog";
import { useMemo, useState } from "react";
import { Transaction, TransactionType, TransactionFormData } from "@/types/transaction";
import { transactionService } from "@/services/transactionService";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { TransactionFilters } from "@/components/common/TransactionFilters";
import { TransactionPagination } from "@/components/common/TransactionPagination";
import { DeleteConfirmationDialog } from "@/components/common/DeleteConfirmationDialog";
import { useDebtData } from "@/hooks/useDebtData";
import { DebtSummary } from "./DebtSummary";
import { DebtList } from "./DebtList";
import { DebtPageHeader } from "./DebtPageHeader";
import { DebtCounterpartyChart } from "./DebtCounterpartyChart";
import { startOfMonth, endOfMonth } from "date-fns";

export const DebtTracker = () => {
  // Initialize with current month by default
  const now = new Date();
  const [startDate, setStartDate] = useState<Date | undefined>(startOfMonth(now));
  const [endDate, setEndDate] = useState<Date | undefined>(endOfMonth(now));
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>(undefined);
  const [deletingTransactionId, setDeletingTransactionId] = useState<string | undefined>(undefined);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    searchTerm,
    selectedCategories,
    sortBy,
    sortOrder,
    currentPage,
    pageSize,
    setSearchTerm,
    handleCategoryToggle,
    setSortBy,
    setSortOrder,
    setCurrentPage,
    setPageSize,
    handleClearFilters,
    isLoading,
    totalPages,
    totalOutstanding,
    totalBorrowed,
    netDebtPosition,
    availableCategories,
    debtGiven,
    paginatedGroupedData,
    groupedDataCount,
  } = useDebtData(startDate, endDate);

  const debtByCounterpartyForChart = useMemo(() => {
    if (isLoading || !debtGiven || debtGiven.length === 0) {
      return [];
    }
    const spendingByCounterparty: { [key: string]: number } = {};
    debtGiven.forEach(transaction => {
        const counterparty = transaction.counterparty || "Unknown";
        if (spendingByCounterparty[counterparty]) {
            spendingByCounterparty[counterparty] += Number(transaction.amount);
        } else {
            spendingByCounterparty[counterparty] = Number(transaction.amount);
        }
    });
    return Object.entries(spendingByCounterparty).map(([name, total]) => ({
        name,
        total,
    })).sort((a, b) => b.total - a.total);
  }, [debtGiven, isLoading]);

  const invalidateQueries = () => {
    queryClient.invalidateQueries({ queryKey: ["transactions"] });
    queryClient.invalidateQueries({ queryKey: ["debt-transactions"] });
    queryClient.invalidateQueries({ queryKey: ["transaction-summary"] });
  };

  const addDebtMutation = useMutation({
    mutationFn: transactionService.createTransaction,
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Debt entry added successfully!",
      });
      setShowAddDialog(false);
      invalidateQueries();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add debt entry. Please try again.",
        variant: "destructive",
      });
      console.error("Error adding debt:", error);
    },
  });

  const updateDebtMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TransactionFormData> }) =>
      transactionService.updateTransaction(id, data),
    onSuccess: () => {
      toast({ title: "Success", description: "Debt entry updated successfully!" });
      setEditingTransaction(undefined);
      invalidateQueries();
    },
    onError: (error) => {
      console.error("Error updating debt entry:", error);
      toast({ title: "Error", description: "Failed to update debt entry.", variant: "destructive" });
    },
  });

  const deleteDebtMutation = useMutation({
    mutationFn: transactionService.deleteTransaction,
    onSuccess: () => {
      toast({ title: "Success", description: "Debt entry deleted successfully!" });
      setDeletingTransactionId(undefined);
      invalidateQueries();
    },
    onError: (error) => {
      console.error("Error deleting debt entry:", error);
      toast({ title: "Error", description: "Failed to delete debt entry.", variant: "destructive" });
    },
  });

  const handleDateRangeChange = (start: Date | undefined, end: Date | undefined) => {
    setStartDate(start);
    setEndDate(end);
  };

  const handleAddDebt = (data: TransactionFormData) => {
    addDebtMutation.mutate(data);
  };

  const handleUpdateDebt = (data: TransactionFormData) => {
    if (!editingTransaction) return;
    updateDebtMutation.mutate({ id: editingTransaction.id, data });
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
  };

  const handleDelete = (transactionId: string) => {
    setDeletingTransactionId(transactionId);
  };
  
  const handleConfirmDelete = () => {
    if (!deletingTransactionId) return;
    deleteDebtMutation.mutate(deletingTransactionId);
  };

  return (
    <div className="space-y-6 p-6 bg-background min-h-screen">
      <DebtPageHeader onAddDebt={() => setShowAddDialog(true)} />

      <Card className="bg-card border-border shadow-sm">
        <CardContent className="p-6">
          <MonthlyFilter onDateRangeChange={handleDateRangeChange} />
        </CardContent>
      </Card>

      <DebtSummary 
        totalLent={totalOutstanding}
        totalBorrowed={totalBorrowed}
        netPosition={netDebtPosition}
      />
      
      <DebtCounterpartyChart data={debtByCounterpartyForChart} />

      <TransactionFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedCategories={selectedCategories}
        onCategoryToggle={handleCategoryToggle}
        sortBy={sortBy}
        onSortChange={setSortBy}
        sortOrder={sortOrder}
        onSortOrderChange={setSortOrder}
        onClearFilters={handleClearFilters}
        availableCategories={availableCategories}
        itemType="debt entries"
      />

      <DebtList
        groupedData={paginatedGroupedData}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      
      <TransactionPagination
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        totalItems={groupedDataCount}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
      />
      
      <TransactionDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        type={TransactionType.DEBT_GIVEN}
        onSubmit={handleAddDebt}
        isLoading={addDebtMutation.isPending}
      />

      <TransactionDialog
        open={!!editingTransaction}
        onOpenChange={(isOpen) => !isOpen && setEditingTransaction(undefined)}
        type={editingTransaction?.type as TransactionType || TransactionType.DEBT_GIVEN}
        onSubmit={handleUpdateDebt}
        isLoading={updateDebtMutation.isPending}
        initialData={editingTransaction}
      />
      
      <DeleteConfirmationDialog
        open={!!deletingTransactionId}
        onOpenChange={(isOpen) => !isOpen && setDeletingTransactionId(undefined)}
        onConfirm={handleConfirmDelete}
        isLoading={deleteDebtMutation.isPending}
      />
    </div>
  );
};
