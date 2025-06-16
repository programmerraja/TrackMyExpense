import { supabase } from "@/integrations/supabase/client";
import { TransactionFormData, Transaction, TransactionType } from "@/types/transaction";
import { Category } from "@/types/category";
import { TransactionSummary } from "@/types/summary";

export const transactionService = {
  async createTransaction(data: TransactionFormData): Promise<Transaction> {
    const { data: transaction, error } = await supabase
      .from("transactions")
      .insert([
        {
          name: data.name,
          note: data.note || null,
          amount: data.amount,
          category_id: data.category_id,
          type: data.type,
          counterparty: data.counterparty || null,
          event_date: data.event_date || new Date().toISOString().split('T')[0],
          user_id: (await supabase.auth.getUser()).data.user?.id,
        },
      ])
      .select(`*, category:categories(id, name, type)`)
      .single();

    if (error) throw error;
    
    return transaction as any;
  },

  async getTransactions(
    type?: TransactionType, 
    startDate?: Date, 
    endDate?: Date
  ): Promise<Transaction[]> {
    let query = supabase
      .from("transactions")
      .select("*, category:categories(id, name, type)")
      .order("event_date", { ascending: false });

    if (type) {
      query = query.eq("type", type);
    }

    if (startDate) {
      query = query.gte("event_date", startDate.toISOString().split('T')[0]);
    }

    if (endDate) {
      query = query.lte("event_date", endDate.toISOString().split('T')[0]);
    }

    const { data, error } = await query;
    if (error) throw error;

    return (data as any) || [];
  },

  async getTransactionSummary(startDate?: Date, endDate?: Date): Promise<TransactionSummary> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user?.id) throw new Error("User not authenticated");

    const { data, error } = await supabase.rpc("get_transaction_summary", {
      user_uuid: user.user.id,
      start_date: startDate ? startDate.toISOString().split('T')[0] : null,
      end_date: endDate ? endDate.toISOString().split('T')[0] : null,
    });

    if (error) throw error;
    return data[0] || {
      total_income: 0,
      total_expenses: 0,
      total_taxes: 0,
      total_debt_given: 0,
      total_debt_bought: 0,
      monthly_savings: 0,
    };
  },

  async updateTransaction(id: string, data: Partial<TransactionFormData>): Promise<Transaction> {
    const { data: transaction, error } = await supabase
      .from("transactions")
      .update(data)
      .eq("id", id)
      .select(`*, category:categories(id, name, type)`)
      .single();

    if (error) throw error;
    return transaction as any;
  },

  async deleteTransaction(id: string): Promise<void> {
    const { error } = await supabase
      .from("transactions")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },
};
