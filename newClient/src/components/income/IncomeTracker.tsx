
import { Card, CardContent } from "@/components/ui/card";
import { MonthlyFilter } from "@/components/common/MonthlyFilter";
import { TransactionDialog } from "@/components/forms/TransactionDialog";
import { useState, useMemo } from "react";
import { Transaction, TransactionType, TransactionFormData } from "@/types/transaction";
import { transactionService } from "@/services/transactionService";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useIncomeTransactions } from "@/hooks/useTransactions";
import { TransactionFilters } from "@/components/common/TransactionFilters";
import { TransactionPagination } from "@/components/common/TransactionPagination";
import { DeleteConfirmationDialog } from "@/components/common/DeleteConfirmationDialog";
import { usePaginatedTransactions } from "@/hooks/usePaginatedTransactions";
import { IncomePageHeader } from "./IncomePageHeader";
import { IncomeList } from "./IncomeList";
import { IncomeSourceChart } from "./IncomeSourceChart";
import { startOfMonth, endOfMonth } from "date-fns";

export const IncomeTracker = () => {
  // Initialize with current month by default
  const now = new Date();
  const [startDate, setStartDate] = useState<Date | undefined>(startOfMonth(now));
  const [endDate, setEndDate] = useState<Date | undefined>(endOfMonth(now));
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>(undefined);
  const [deletingTransactionId, setDeletingTransactionId] = useState<string | undefined>(undefined);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: incomeTransactions = [], isLoading } = useIncomeTransactions(startDate, endDate);
  
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
    paginatedTransactions,
    processedTransactions,
    totalPages,
    availableCategories,
  } = usePaginatedTransactions(incomeTransactions);

  const incomeBySource = useMemo(() => {
    if (isLoading || incomeTransactions.length === 0) {
      return [];
    }
    const incomeByName: { [key: string]: number } = {};
    incomeTransactions.forEach(transaction => {
      const source = transaction.name || "Unknown";
      if (incomeByName[source]) {
        incomeByName[source] += Number(transaction.amount);
      } else {
        incomeByName[source] = Number(transaction.amount);
      }
    });
    return Object.entries(incomeByName).map(([name, total]) => ({
      name,
      total,
    })).sort((a, b) => b.total - a.total);
  }, [incomeTransactions, isLoading]);

  const invalidateQueries = () => {
    queryClient.invalidateQueries({ queryKey: ["transactions"] });
    queryClient.invalidateQueries({ queryKey: ["transaction-summary"] });
  };

  const addIncomeMutation = useMutation({
    mutationFn: transactionService.createTransaction,
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Income added successfully!",
      });
      setShowAddDialog(false);
      invalidateQueries();
    },
    onError: (error) => {
      console.error("Error adding income:", error);
      toast({
        title: "Error",
        description: "Failed to add income. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateIncomeMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TransactionFormData> }) =>
      transactionService.updateTransaction(id, data),
    onSuccess: () => {
      toast({ title: "Success", description: "Income updated successfully!" });
      setEditingTransaction(undefined);
      invalidateQueries();
    },
    onError: (error) => {
      console.error("Error updating income:", error);
      toast({ title: "Error", description: "Failed to update income.", variant: "destructive" });
    },
  });

  const deleteIncomeMutation = useMutation({
    mutationFn: transactionService.deleteTransaction,
    onSuccess: () => {
      toast({ title: "Success", description: "Income deleted successfully!" });
      setDeletingTransactionId(undefined);
      invalidateQueries();
    },
    onError: (error) => {
      console.error("Error deleting income:", error);
      toast({ title: "Error", description: "Failed to delete income.", variant: "destructive" });
    },
  });

  const handleDateRangeChange = (start: Date | undefined, end: Date | undefined) => {
    setStartDate(start);
    setEndDate(end);
  };

  const handleAddIncome = (data: TransactionFormData) => {
    addIncomeMutation.mutate(data);
  };
  
  const handleUpdateIncome = (data: TransactionFormData) => {
    if (!editingTransaction) return;
    updateIncomeMutation.mutate({ id: editingTransaction.id, data });
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
  };

  const handleDelete = (transactionId: string) => {
    setDeletingTransactionId(transactionId);
  };
  
  const handleConfirmDelete = () => {
    if (!deletingTransactionId) return;
    deleteIncomeMutation.mutate(deletingTransactionId);
  };
  
  return (
    <div className="space-y-6 p-6 bg-background min-h-screen">
      <IncomePageHeader onAddIncome={() => setShowAddDialog(true)} />

      <Card className="bg-card border border-border shadow-sm">
        <CardContent className="p-6">
          <MonthlyFilter onDateRangeChange={handleDateRangeChange} />
        </CardContent>
      </Card>

      <IncomeSourceChart data={incomeBySource} />

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
        itemType="income"
      />
      
      <IncomeList
        transactions={paginatedTransactions}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <TransactionPagination
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        totalItems={processedTransactions.length}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
      />

      <TransactionDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        type={TransactionType.INCOME}
        onSubmit={handleAddIncome}
        isLoading={addIncomeMutation.isPending}
      />

      <TransactionDialog
        open={!!editingTransaction}
        onOpenChange={(isOpen) => !isOpen && setEditingTransaction(undefined)}
        type={TransactionType.INCOME}
        onSubmit={handleUpdateIncome}
        isLoading={updateIncomeMutation.isPending}
        initialData={editingTransaction}
      />
      
      <DeleteConfirmationDialog
        open={!!deletingTransactionId}
        onOpenChange={(isOpen) => !isOpen && setDeletingTransactionId(undefined)}
        onConfirm={handleConfirmDelete}
        isLoading={deleteIncomeMutation.isPending}
      />
    </div>
  );
};
