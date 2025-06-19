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
      affiliates: {
        Row: {
          business_name: string
          commission_rate: number | null
          created_at: string
          description: string | null
          id: string
          status: string | null
          updated_at: string
          user_id: string
          whatsapp_number: string | null
        }
        Insert: {
          business_name: string
          commission_rate?: number | null
          created_at?: string
          description?: string | null
          id?: string
          status?: string | null
          updated_at?: string
          user_id: string
          whatsapp_number?: string | null
        }
        Update: {
          business_name?: string
          commission_rate?: number | null
          created_at?: string
          description?: string | null
          id?: string
          status?: string | null
          updated_at?: string
          user_id?: string
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      broadcast_list_contacts: {
        Row: {
          broadcast_list_id: string
          contact_id: string
          created_at: string
        }
        Insert: {
          broadcast_list_id: string
          contact_id: string
          created_at?: string
        }
        Update: {
          broadcast_list_id?: string
          contact_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "broadcast_list_contacts_broadcast_list_id_fkey"
            columns: ["broadcast_list_id"]
            isOneToOne: false
            referencedRelation: "broadcast_lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "broadcast_list_contacts_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      broadcast_lists: {
        Row: {
          affiliate_id: string | null
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          affiliate_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          affiliate_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "broadcast_lists_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
        ]
      }
      commissions: {
        Row: {
          affiliate_id: string
          amount: number
          created_at: string
          id: string
          order_id: string
          paid_at: string | null
          status: string | null
        }
        Insert: {
          affiliate_id: string
          amount: number
          created_at?: string
          id?: string
          order_id: string
          paid_at?: string | null
          status?: string | null
        }
        Update: {
          affiliate_id?: string
          amount?: number
          created_at?: string
          id?: string
          order_id?: string
          paid_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "commissions_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commissions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_snapshots: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      monthly_expenses: {
        Row: {
          amount: number
          created_at: string
          id: string
          snapshot_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          id?: string
          snapshot_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
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
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          price_type: string
          product_id: string
          quantity: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          price_type: string
          product_id: string
          quantity: number
          unit_price: number
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          price_type?: string
          product_id?: string
          quantity?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          affiliate_id: string | null
          created_at: string
          customer_email: string
          customer_name: string | null
          customer_phone: string | null
          id: string
          order_type: string | null
          status: string | null
          total_amount: number
          updated_at: string
        }
        Insert: {
          affiliate_id?: string | null
          created_at?: string
          customer_email: string
          customer_name?: string | null
          customer_phone?: string | null
          id?: string
          order_type?: string | null
          status?: string | null
          total_amount: number
          updated_at?: string
        }
        Update: {
          affiliate_id?: string | null
          created_at?: string
          customer_email?: string
          customer_name?: string | null
          customer_phone?: string | null
          id?: string
          order_type?: string | null
          status?: string | null
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          affiliate_id: string | null
          category: string
          created_at: string
          description: string | null
          featured: boolean | null
          id: string
          image_url: string | null
          name: string
          retail_price: number
          status: string | null
          stock: number | null
          updated_at: string
          wholesale_price: number
        }
        Insert: {
          affiliate_id?: string | null
          category: string
          created_at?: string
          description?: string | null
          featured?: boolean | null
          id?: string
          image_url?: string | null
          name: string
          retail_price: number
          status?: string | null
          stock?: number | null
          updated_at?: string
          wholesale_price: number
        }
        Update: {
          affiliate_id?: string | null
          category?: string
          created_at?: string
          description?: string | null
          featured?: boolean | null
          id?: string
          image_url?: string | null
          name?: string
          retail_price?: number
          status?: string | null
          stock?: number | null
          updated_at?: string
          wholesale_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "products_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
        ]
      }
      user_accounts: {
        Row: {
          account_id: string
          balance: number
          category: string
          created_at: string
          credit_limit: number | null
          due_date: string | null
          id: string
          interest_rate: number | null
          is_hidden: boolean
          minimum_payment: number | null
          name: string
          snapshot_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          account_id: string
          balance?: number
          category: string
          created_at?: string
          credit_limit?: number | null
          due_date?: string | null
          id?: string
          interest_rate?: number | null
          is_hidden?: boolean
          minimum_payment?: number | null
          name: string
          snapshot_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          account_id?: string
          balance?: number
          category?: string
          created_at?: string
          credit_limit?: number | null
          due_date?: string | null
          id?: string
          interest_rate?: number | null
          is_hidden?: boolean
          minimum_payment?: number | null
          name?: string
          snapshot_id?: string | null
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
      users: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          image: string | null
          name: string | null
          token_identifier: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          image?: string | null
          name?: string | null
          token_identifier: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          image?: string | null
          name?: string | null
          token_identifier?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      whatsapp_contacts: {
        Row: {
          affiliate_id: string | null
          created_at: string
          id: string
          name: string | null
          phone_number: string
        }
        Insert: {
          affiliate_id?: string | null
          created_at?: string
          id?: string
          name?: string | null
          phone_number: string
        }
        Update: {
          affiliate_id?: string | null
          created_at?: string
          id?: string
          name?: string | null
          phone_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_contacts_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
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
    Enums: {},
  },
} as const
