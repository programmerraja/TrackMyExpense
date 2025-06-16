export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: {
          created_at: string | null
          id: string
          name: string
          type: Database["public"]["Enums"]["category_type"]
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          type: Database["public"]["Enums"]["category_type"]
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          type?: Database["public"]["Enums"]["category_type"]
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      interest_rate_history: {
        Row: {
          created_at: string
          effective_date: string
          id: string
          investment_id: string | null
          rate: number
        }
        Insert: {
          created_at?: string
          effective_date: string
          id?: string
          investment_id?: string | null
          rate: number
        }
        Update: {
          created_at?: string
          effective_date?: string
          id?: string
          investment_id?: string | null
          rate?: number
        }
        Relationships: [
          {
            foreignKeyName: "interest_rate_history_investment_id_fkey"
            columns: ["investment_id"]
            isOneToOne: false
            referencedRelation: "investments"
            referencedColumns: ["id"]
          },
        ]
      }
      investments: {
        Row: {
          annual_limit: number | null
          category_id: string | null
          contribution_history: Json | null
          created_at: string | null
          current_balance: number | null
          debt_ratio: number | null
          equity_ratio: number | null
          id: string
          interest_rate: number | null
          interest_rate_type:
            | Database["public"]["Enums"]["interest_rate_type"]
            | null
          is_paused: boolean | null
          is_recurring: boolean | null
          last_calculated_at: string | null
          maturity_date: string | null
          name: string
          notes: string | null
          paused_since: string | null
          purchases: Json | null
          purpose: Database["public"]["Enums"]["investment_purpose"]
          recurring_amount: number | null
          recurring_frequency:
            | Database["public"]["Enums"]["recurring_frequency"]
            | null
          scheme_config: Json | null
          skipped_months: string[] | null
          start_date: string | null
          symbol: string
          target_price: number | null
          type: Database["public"]["Enums"]["investment_type"]
          user_id: string
        }
        Insert: {
          annual_limit?: number | null
          category_id?: string | null
          contribution_history?: Json | null
          created_at?: string | null
          current_balance?: number | null
          debt_ratio?: number | null
          equity_ratio?: number | null
          id?: string
          interest_rate?: number | null
          interest_rate_type?:
            | Database["public"]["Enums"]["interest_rate_type"]
            | null
          is_paused?: boolean | null
          is_recurring?: boolean | null
          last_calculated_at?: string | null
          maturity_date?: string | null
          name: string
          notes?: string | null
          paused_since?: string | null
          purchases?: Json | null
          purpose: Database["public"]["Enums"]["investment_purpose"]
          recurring_amount?: number | null
          recurring_frequency?:
            | Database["public"]["Enums"]["recurring_frequency"]
            | null
          scheme_config?: Json | null
          skipped_months?: string[] | null
          start_date?: string | null
          symbol: string
          target_price?: number | null
          type: Database["public"]["Enums"]["investment_type"]
          user_id: string
        }
        Update: {
          annual_limit?: number | null
          category_id?: string | null
          contribution_history?: Json | null
          created_at?: string | null
          current_balance?: number | null
          debt_ratio?: number | null
          equity_ratio?: number | null
          id?: string
          interest_rate?: number | null
          interest_rate_type?:
            | Database["public"]["Enums"]["interest_rate_type"]
            | null
          is_paused?: boolean | null
          is_recurring?: boolean | null
          last_calculated_at?: string | null
          maturity_date?: string | null
          name?: string
          notes?: string | null
          paused_since?: string | null
          purchases?: Json | null
          purpose?: Database["public"]["Enums"]["investment_purpose"]
          recurring_amount?: number | null
          recurring_frequency?:
            | Database["public"]["Enums"]["recurring_frequency"]
            | null
          scheme_config?: Json | null
          skipped_months?: string[] | null
          start_date?: string | null
          symbol?: string
          target_price?: number | null
          type?: Database["public"]["Enums"]["investment_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "investments_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          id: string
          name: string
          role: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          name: string
          role?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          role?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          category_id: string
          counterparty: string | null
          created_at: string | null
          event_date: string
          id: string
          name: string | null
          note: string | null
          type: Database["public"]["Enums"]["transaction_type"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          category_id: string
          counterparty?: string | null
          created_at?: string | null
          event_date?: string
          id?: string
          name?: string | null
          note?: string | null
          type: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          category_id?: string
          counterparty?: string | null
          created_at?: string | null
          event_date?: string
          id?: string
          name?: string | null
          note?: string | null
          type?: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_transaction_summary: {
        Args: { user_uuid: string; start_date?: string; end_date?: string }
        Returns: {
          total_income: number
          total_expenses: number
          total_taxes: number
          total_debt_given: number
          total_debt_bought: number
          monthly_savings: number
        }[]
      }
    }
    Enums: {
      category_type: "INCOME" | "EXPENSE" | "DEBT" | "TAX" | "INVESTMENT"
      interest_rate_type: "FIXED" | "VARIABLE"
      investment_purpose: "OWNED" | "MONITORING"
      investment_type:
        | "STOCK"
        | "MUTUAL_FUND"
        | "GOLD"
        | "SILVER"
        | "PPF"
        | "EPF"
        | "NPS"
      recurring_frequency: "MONTHLY" | "QUARTERLY" | "YEARLY"
      transaction_type:
        | "INCOME"
        | "EXPENSE"
        | "INCOME_TAX"
        | "DEBT_GIVEN"
        | "DEBT_BOUGHT"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      category_type: ["INCOME", "EXPENSE", "DEBT", "TAX", "INVESTMENT"],
      interest_rate_type: ["FIXED", "VARIABLE"],
      investment_purpose: ["OWNED", "MONITORING"],
      investment_type: [
        "STOCK",
        "MUTUAL_FUND",
        "GOLD",
        "SILVER",
        "PPF",
        "EPF",
        "NPS",
      ],
      recurring_frequency: ["MONTHLY", "QUARTERLY", "YEARLY"],
      transaction_type: [
        "INCOME",
        "EXPENSE",
        "INCOME_TAX",
        "DEBT_GIVEN",
        "DEBT_BOUGHT",
      ],
    },
  },
} as const
