import { Category } from "@/types/category"; // I will create this file next

export enum TransactionType {
  INCOME = "INCOME",
  EXPENSE = "EXPENSE",
  DEBT_BOUGHT = "DEBT_BOUGHT",
  DEBT_GIVEN = "DEBT_GIVEN",
  INCOME_TAX = "INCOME_TAX",
}

// I'm moving Category to its own file to be reusable.

export interface TransactionFormData {
  name: string;
  note?: string;
  amount: number;
  category_id: string;
  type: TransactionType;
  counterparty?: string;
  event_date?: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  name: string | null;
  note: string | null;
  amount: number;
  category_id: string;
  category: Category;
  type: string;
  counterparty: string | null;
  event_date: string;
  created_at: string | null;
  updated_at: string | null;
}
