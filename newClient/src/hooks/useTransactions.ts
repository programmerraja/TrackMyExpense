
import { useQuery } from "@tanstack/react-query";
import { transactionService } from "@/services/transactionService";
import { TransactionType } from "@/types/transaction";

export const useTransactions = (
  type?: TransactionType,
  startDate?: Date,
  endDate?: Date
) => {
  return useQuery({
    queryKey: ["transactions", type, startDate, endDate],
    queryFn: () => transactionService.getTransactions(type, startDate, endDate),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useTransactionSummary = (startDate?: Date, endDate?: Date) => {
  return useQuery({
    queryKey: ["transaction-summary", startDate, endDate],
    queryFn: () => transactionService.getTransactionSummary(startDate, endDate),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useIncomeTransactions = (startDate?: Date, endDate?: Date) => {
  return useTransactions(TransactionType.INCOME, startDate, endDate);
};

export const useExpenseTransactions = (startDate?: Date, endDate?: Date) => {
  return useTransactions(TransactionType.EXPENSE, startDate, endDate);
};

export const useDebtTransactions = (startDate?: Date, endDate?: Date) => {
  return useQuery({
    queryKey: ["debt-transactions", startDate, endDate],
    queryFn: async () => {
      const [debtGiven, debtBought] = await Promise.all([
        transactionService.getTransactions(TransactionType.DEBT_GIVEN, startDate, endDate),
        transactionService.getTransactions(TransactionType.DEBT_BOUGHT, startDate, endDate),
      ]);
      return { debtGiven, debtBought, all: [...debtGiven, ...debtBought] };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
