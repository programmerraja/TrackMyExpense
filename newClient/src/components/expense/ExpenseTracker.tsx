import { Card, CardContent } from "@/components/ui/card";
import { MonthlyFilter } from "@/components/common/MonthlyFilter";
import { TransactionDialog } from "@/components/forms/TransactionDialog";
import { useMemo, useState } from "react";
import { Transaction, TransactionType, TransactionFormData } from "@/types/transaction";
import { transactionService } from "@/services/transactionService";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useExpenseTransactions, useTransactions } from "@/hooks/useTransactions";
import { TransactionFilters } from "@/components/common/TransactionFilters";
import { TransactionPagination } from "@/components/common/TransactionPagination";
import { DeleteConfirmationDialog } from "@/components/common/DeleteConfirmationDialog";
import { usePaginatedTransactions } from "@/hooks/usePaginatedTransactions";
import { ExpensePageHeader } from "./ExpensePageHeader";
import { ExpenseSummary } from "./ExpenseSummary";
import { ExpenseList } from "./ExpenseList";
import { ExpenseCategoryChart } from "./ExpenseCategoryChart";
import { startOfMonth, endOfMonth } from "date-fns";

export const ExpenseTracker = () => {
  // Initialize with current month by default
  const now = new Date();
  const [startDate, setStartDate] = useState<Date | undefined>(startOfMonth(now));
  const [endDate, setEndDate] = useState<Date | undefined>(endOfMonth(now));
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>(undefined);
  const [deletingTransactionId, setDeletingTransactionId] = useState<string | undefined>(undefined);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: expenseTransactions = [], isLoading: expensesLoading } = useExpenseTransactions(startDate, endDate);
  const { data: taxTransactions = [], isLoading: taxLoading } = useTransactions(TransactionType.INCOME_TAX, startDate, endDate);

  const isLoading = expensesLoading || taxLoading;
  const allTransactions = [...expenseTransactions, ...taxTransactions].sort((a, b) => 
    new Date(b.event_date).getTime() - new Date(a.event_date).getTime()
  );
  
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
  } = usePaginatedTransactions(allTransactions);

  const categorySpending = useMemo(() => {
    if (isLoading || allTransactions.length === 0) {
      return [];
    }
    const spendingByCategory: { [key: string]: number } = {};
    allTransactions.forEach(transaction => {
      const categoryName = transaction.category.name;
      if (spendingByCategory[categoryName]) {
        spendingByCategory[categoryName] += Number(transaction.amount);
      } else {
        spendingByCategory[categoryName] = Number(transaction.amount);
      }
    });
    return Object.entries(spendingByCategory).map(([category, total]) => ({
      category,
      total,
    }));
  }, [allTransactions, isLoading]);

  const invalidateQueries = () => {
    queryClient.invalidateQueries({ queryKey: ["transactions"] });
    queryClient.invalidateQueries({ queryKey: ["transaction-summary"] });
  };

  const addExpenseMutation = useMutation({
    mutationFn: transactionService.createTransaction,
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Expense added successfully!",
      });
      setShowAddDialog(false);
      invalidateQueries();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add expense. Please try again.",
        variant: "destructive",
      });
      console.error("Error adding expense:", error);
    },
  });

  const updateExpenseMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TransactionFormData> }) =>
      transactionService.updateTransaction(id, data),
    onSuccess: () => {
      toast({ title: "Success", description: "Expense updated successfully!" });
      setEditingTransaction(undefined);
      invalidateQueries();
    },
    onError: (error) => {
      console.error("Error updating expense:", error);
      toast({ title: "Error", description: "Failed to update expense.", variant: "destructive" });
    },
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: transactionService.deleteTransaction,
    onSuccess: () => {
      toast({ title: "Success", description: "Expense deleted successfully!" });
      setDeletingTransactionId(undefined);
      invalidateQueries();
    },
    onError: (error) => {
      console.error("Error deleting expense:", error);
      toast({ title: "Error", description: "Failed to delete expense.", variant: "destructive" });
    },
  });

  const handleDateRangeChange = (start: Date | undefined, end: Date | undefined) => {
    setStartDate(start);
    setEndDate(end);
    setCurrentPage(1);
  };

  const handleAddExpense = (data: TransactionFormData) => {
    addExpenseMutation.mutate(data);
  };

  const handleUpdateExpense = (data: TransactionFormData) => {
    if (!editingTransaction) return;
    updateExpenseMutation.mutate({ id: editingTransaction.id, data });
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
  };

  const handleDelete = (transactionId: string) => {
    setDeletingTransactionId(transactionId);
  };
  
  const handleConfirmDelete = () => {
    if (!deletingTransactionId) return;
    deleteExpenseMutation.mutate(deletingTransactionId);
  };

  const totalExpenses = allTransactions.reduce((sum, transaction) => sum + Number(transaction.amount), 0);
  const averageExpense = allTransactions.length > 0 ? totalExpenses / allTransactions.length : 0;

  return (
    <div className="space-y-6 p-6 bg-background min-h-screen">
      <ExpensePageHeader onAddExpense={() => setShowAddDialog(true)} />

      <Card className="bg-card border-border shadow-sm">
        <CardContent className="p-6">
          <MonthlyFilter onDateRangeChange={handleDateRangeChange} />
        </CardContent>
      </Card>

      <ExpenseSummary 
        totalExpenses={totalExpenses}
        averageExpense={averageExpense}
      />

      <ExpenseCategoryChart data={categorySpending} />

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
        itemType="expenses"
      />

      <ExpenseList
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
        type={TransactionType.EXPENSE}
        onSubmit={handleAddExpense}
        isLoading={addExpenseMutation.isPending}
      />

      <TransactionDialog
        open={!!editingTransaction}
        onOpenChange={(isOpen) => !isOpen && setEditingTransaction(undefined)}
        type={editingTransaction?.type as TransactionType || TransactionType.EXPENSE}
        onSubmit={handleUpdateExpense}
        isLoading={updateExpenseMutation.isPending}
        initialData={editingTransaction}
      />
      
      <DeleteConfirmationDialog
        open={!!deletingTransactionId}
        onOpenChange={(isOpen) => !isOpen && setDeletingTransactionId(undefined)}
        onConfirm={handleConfirmDelete}
        isLoading={deleteExpenseMutation.isPending}
      />
    </div>
  );
};
