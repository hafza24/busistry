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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      learning_articles: {
        Row: {
          category: string
          content: string | null
          created_at: string
          id: string
          is_published: boolean
          title: string
          video_url: string | null
        }
        Insert: {
          category: string
          content?: string | null
          created_at?: string
          id?: string
          is_published?: boolean
          title: string
          video_url?: string | null
        }
        Update: {
          category?: string
          content?: string | null
          created_at?: string
          id?: string
          is_published?: boolean
          title?: string
          video_url?: string | null
        }
        Relationships: []
      }
      plans: {
        Row: {
          created_at: string
          duration_days: number | null
          features: Json | null
          id: string
          is_active: boolean
          max_categories: number
          max_products: number
          name: string
          price_pkr: number
          type: Database["public"]["Enums"]["plan_type"]
        }
        Insert: {
          created_at?: string
          duration_days?: number | null
          features?: Json | null
          id?: string
          is_active?: boolean
          max_categories?: number
          max_products?: number
          name: string
          price_pkr?: number
          type: Database["public"]["Enums"]["plan_type"]
        }
        Update: {
          created_at?: string
          duration_days?: number | null
          features?: Json | null
          id?: string
          is_active?: boolean
          max_categories?: number
          max_products?: number
          name?: string
          price_pkr?: number
          type?: Database["public"]["Enums"]["plan_type"]
        }
        Relationships: []
      }
      product_packs: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          niche: string
          price_pkr: number
          product_count: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          niche: string
          price_pkr?: number
          product_count?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          niche?: string
          price_pkr?: number
          product_count?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      store_requests: {
        Row: {
          admin_notes: string | null
          amount: number | null
          created_at: string
          id: string
          payment_method: Database["public"]["Enums"]["payment_method"] | null
          plan_id: string
          screenshot_url: string | null
          status: Database["public"]["Enums"]["store_status"]
          store_name: string
          template_id: string
          transaction_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          amount?: number | null
          created_at?: string
          id?: string
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          plan_id: string
          screenshot_url?: string | null
          status?: Database["public"]["Enums"]["store_status"]
          store_name: string
          template_id: string
          transaction_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          amount?: number | null
          created_at?: string
          id?: string
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          plan_id?: string
          screenshot_url?: string | null
          status?: Database["public"]["Enums"]["store_status"]
          store_name?: string
          template_id?: string
          transaction_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "store_requests_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "store_requests_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "templates"
            referencedColumns: ["id"]
          },
        ]
      }
      stores: {
        Row: {
          activated_at: string | null
          category_count: number
          created_at: string
          expires_at: string | null
          id: string
          name: string
          plan_id: string
          product_count: number
          status: Database["public"]["Enums"]["store_status"]
          subdomain_slug: string
          template_id: string
          user_id: string
        }
        Insert: {
          activated_at?: string | null
          category_count?: number
          created_at?: string
          expires_at?: string | null
          id?: string
          name: string
          plan_id: string
          product_count?: number
          status?: Database["public"]["Enums"]["store_status"]
          subdomain_slug: string
          template_id: string
          user_id: string
        }
        Update: {
          activated_at?: string | null
          category_count?: number
          created_at?: string
          expires_at?: string | null
          id?: string
          name?: string
          plan_id?: string
          product_count?: number
          status?: Database["public"]["Enums"]["store_status"]
          subdomain_slug?: string
          template_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stores_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stores_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "templates"
            referencedColumns: ["id"]
          },
        ]
      }
      templates: {
        Row: {
          available_plans: Json | null
          created_at: string
          demo_url: string | null
          description: string | null
          features: Json | null
          id: string
          is_active: boolean
          name: string
          niche: string
          preview_image_url: string | null
        }
        Insert: {
          available_plans?: Json | null
          created_at?: string
          demo_url?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean
          name: string
          niche: string
          preview_image_url?: string | null
        }
        Update: {
          available_plans?: Json | null
          created_at?: string
          demo_url?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean
          name?: string
          niche?: string
          preview_image_url?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      payment_method:
        | "easypaisa"
        | "jazzcash"
        | "nayapay"
        | "raast"
        | "bank_transfer"
      plan_type: "free" | "rent" | "buy"
      store_status:
        | "pending"
        | "under_review"
        | "approved"
        | "rejected"
        | "activated"
        | "suspended"
        | "expired"
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
    Enums: {
      app_role: ["admin", "user"],
      payment_method: [
        "easypaisa",
        "jazzcash",
        "nayapay",
        "raast",
        "bank_transfer",
      ],
      plan_type: ["free", "rent", "buy"],
      store_status: [
        "pending",
        "under_review",
        "approved",
        "rejected",
        "activated",
        "suspended",
        "expired",
      ],
    },
  },
} as const
