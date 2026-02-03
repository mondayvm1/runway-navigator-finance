export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      category_settings: {
        Row: {
          created_at: string
          hidden_categories: string[] | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          hidden_categories?: string[] | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          hidden_categories?: string[] | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      credit_scores: {
        Row: {
          actual_score: number | null
          created_at: string
          id: string
          snapshot_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          actual_score?: number | null
          created_at?: string
          id?: string
          snapshot_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          actual_score?: number | null
          created_at?: string
          id?: string
          snapshot_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_scores_snapshot_id_fkey"
            columns: ["snapshot_id"]
            isOneToOne: false
            referencedRelation: "financial_snapshots"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_snapshots: {
        Row: {
          accounts_data: Json | null
          created_at: string
          id: string
          monthly_expenses: number | null
          monthly_income: number | null
          name: string | null
          net_worth: number
          notes: string | null
          savings_rate: number | null
          snapshot_date: string
          total_assets: number
          total_liabilities: number
          user_id: string
        }
        Insert: {
          accounts_data?: Json | null
          created_at?: string
          id?: string
          monthly_expenses?: number | null
          monthly_income?: number | null
          name?: string | null
          net_worth?: number
          notes?: string | null
          savings_rate?: number | null
          snapshot_date?: string
          total_assets?: number
          total_liabilities?: number
          user_id: string
        }
        Update: {
          accounts_data?: Json | null
          created_at?: string
          id?: string
          monthly_expenses?: number | null
          monthly_income?: number | null
          name?: string | null
          net_worth?: number
          notes?: string | null
          savings_rate?: number | null
          snapshot_date?: string
          total_assets?: number
          total_liabilities?: number
          user_id?: string
        }
        Relationships: []
      }
      income_events: {
        Row: {
          amount: number
          category: string | null
          created_at: string
          date: string | null
          end_date: string | null
          frequency: string
          id: string
          is_active: boolean
          name: string
          next_date: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number
          category?: string | null
          created_at?: string
          date?: string | null
          end_date?: string | null
          frequency?: string
          id?: string
          is_active?: boolean
          name: string
          next_date?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: string | null
          created_at?: string
          date?: string | null
          end_date?: string | null
          frequency?: string
          id?: string
          is_active?: boolean
          name?: string
          next_date?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      income_settings: {
        Row: {
          created_at: string
          id: string
          income_enabled: boolean | null
          settings: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          income_enabled?: boolean | null
          settings?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          income_enabled?: boolean | null
          settings?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      monthly_expenses: {
        Row: {
          amount: number
          category: string
          created_at: string
          due_date: number | null
          id: string
          is_active: boolean
          is_essential: boolean
          name: string
          snapshot_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number
          category?: string
          created_at?: string
          due_date?: number | null
          id?: string
          is_active?: boolean
          is_essential?: boolean
          name: string
          snapshot_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          due_date?: number | null
          id?: string
          is_active?: boolean
          is_essential?: boolean
          name?: string
          snapshot_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "monthly_expenses_snapshot_id_fkey"
            columns: ["snapshot_id"]
            isOneToOne: false
            referencedRelation: "financial_snapshots"
            referencedColumns: ["id"]
          },
        ]
      }
      user_accounts: {
        Row: {
          account_id: string | null
          autopay_amount_type: string | null
          autopay_custom_amount: number | null
          autopay_enabled: boolean | null
          balance: number
          category: string | null
          created_at: string
          credit_limit: number | null
          due_date: number | null
          id: string
          interest_rate: number | null
          is_hidden: boolean | null
          is_paid_off: boolean | null
          min_payment: number | null
          name: string
          reporting_day: number | null
          reports_to_equifax: boolean | null
          reports_to_experian: boolean | null
          reports_to_transunion: boolean | null
          snapshot_id: string | null
          statement_date: number | null
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_id?: string | null
          autopay_amount_type?: string | null
          autopay_custom_amount?: number | null
          autopay_enabled?: boolean | null
          balance?: number
          category?: string | null
          created_at?: string
          credit_limit?: number | null
          due_date?: number | null
          id?: string
          interest_rate?: number | null
          is_hidden?: boolean | null
          is_paid_off?: boolean | null
          min_payment?: number | null
          name: string
          reporting_day?: number | null
          reports_to_equifax?: boolean | null
          reports_to_experian?: boolean | null
          reports_to_transunion?: boolean | null
          snapshot_id?: string | null
          statement_date?: number | null
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_id?: string | null
          autopay_amount_type?: string | null
          autopay_custom_amount?: number | null
          autopay_enabled?: boolean | null
          balance?: number
          category?: string | null
          created_at?: string
          credit_limit?: number | null
          due_date?: number | null
          id?: string
          interest_rate?: number | null
          is_hidden?: boolean | null
          is_paid_off?: boolean | null
          min_payment?: number | null
          name?: string
          reporting_day?: number | null
          reports_to_equifax?: boolean | null
          reports_to_experian?: boolean | null
          reports_to_transunion?: boolean | null
          snapshot_id?: string | null
          statement_date?: number | null
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_accounts_snapshot_id_fkey"
            columns: ["snapshot_id"]
            isOneToOne: false
            referencedRelation: "financial_snapshots"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
