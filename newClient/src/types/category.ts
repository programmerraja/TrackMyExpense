
export interface Category {
  id: string;
  name: string;
  type: 'INCOME' | 'EXPENSE' | 'DEBT' | 'TAX' | 'INVESTMENT';
  user_id: string | null;
}
