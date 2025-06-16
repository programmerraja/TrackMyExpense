
import { supabase } from "@/integrations/supabase/client";
import { Category } from "@/types/category";

export const categoryService = {
  async getCategories(type: 'INCOME' | 'EXPENSE' | 'DEBT' | 'TAX' | 'INVESTMENT'): Promise<Category[]> {
    const { data, error } = await supabase
      .from("categories")
      .select("id, name, type, user_id")
      .eq("type", type)
      .order('created_at', { ascending: true });

    if (error) {
      console.error("Error fetching categories:", error);
      throw error;
    }
    return data || [];
  },

  async addCategory({ name, type }: { name: string, type: Category['type'] }): Promise<Category> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from('categories')
      .insert({ name, type, user_id: user.id })
      .select('*')
      .single();
    
    if (error) {
      console.error("Error adding category", error);
      throw error;
    }
    return data;
  }
};
