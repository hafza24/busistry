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
      addons: {
        Row: {
          applicable_plans: Json
          created_at: string
          dependencies: Json
          description: string | null
          icon: string | null
          id: string
          is_enabled: boolean
          is_popular: boolean
          is_recommended: boolean
          name: string
          per_unit_label: string | null
          price_pkr: number
          pricing_type: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          applicable_plans?: Json
          created_at?: string
          dependencies?: Json
          description?: string | null
          icon?: string | null
          id?: string
          is_enabled?: boolean
          is_popular?: boolean
          is_recommended?: boolean
          name: string
          per_unit_label?: string | null
          price_pkr?: number
          pricing_type?: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          applicable_plans?: Json
          created_at?: string
          dependencies?: Json
          description?: string | null
          icon?: string | null
          id?: string
          is_enabled?: boolean
          is_popular?: boolean
          is_recommended?: boolean
          name?: string
          per_unit_label?: string | null
          price_pkr?: number
          pricing_type?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          slug: string
          sort_order: number
          store_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          slug: string
          sort_order?: number
          store_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          slug?: string
          sort_order?: number
          store_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      integrations: {
        Row: {
          category: string | null
          created_at: string
          credential_schema: Json
          description: string | null
          icon: string | null
          id: string
          is_enabled: boolean
          is_popular: boolean
          name: string
          price_pkr: number
          pricing_type: string
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          credential_schema?: Json
          description?: string | null
          icon?: string | null
          id?: string
          is_enabled?: boolean
          is_popular?: boolean
          name: string
          price_pkr?: number
          pricing_type?: string
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          credential_schema?: Json
          description?: string | null
          icon?: string | null
          id?: string
          is_enabled?: boolean
          is_popular?: boolean
          name?: string
          price_pkr?: number
          pricing_type?: string
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
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
      onboarding_addons: {
        Row: {
          addon_id: string
          created_at: string
          id: string
          price_snapshot_pkr: number
          pricing_type_snapshot: string
          quantity: number
          submission_id: string
        }
        Insert: {
          addon_id: string
          created_at?: string
          id?: string
          price_snapshot_pkr?: number
          pricing_type_snapshot?: string
          quantity?: number
          submission_id: string
        }
        Update: {
          addon_id?: string
          created_at?: string
          id?: string
          price_snapshot_pkr?: number
          pricing_type_snapshot?: string
          quantity?: number
          submission_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_addons_addon_id_fkey"
            columns: ["addon_id"]
            isOneToOne: false
            referencedRelation: "addons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "onboarding_addons_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "onboarding_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_submissions: {
        Row: {
          admin_notes: string | null
          amount: number | null
          billing_cycle: string | null
          business_address: string | null
          business_description: string | null
          business_name: string | null
          business_type: string | null
          color_palette: string | null
          country: string | null
          created_at: string
          current_step: number
          email: string | null
          font_style: string | null
          full_name: string | null
          id: string
          logo_url: string | null
          needs_logo_design: boolean
          payment_gateway: string | null
          payment_method: string | null
          phone: string | null
          plan_id: string | null
          product_count_estimate: number | null
          project_details: Json
          project_type: string | null
          reference_websites: string | null
          screenshot_url: string | null
          shipping_requirements: string | null
          special_features: string | null
          status: string
          store_type: string | null
          submitted_at: string | null
          team_members: Json | null
          team_roles: Json | null
          team_size: number | null
          template_id: string | null
          terms_accepted: boolean
          transaction_id: string | null
          updated_at: string
          user_id: string
          whatsapp: string | null
        }
        Insert: {
          admin_notes?: string | null
          amount?: number | null
          billing_cycle?: string | null
          business_address?: string | null
          business_description?: string | null
          business_name?: string | null
          business_type?: string | null
          color_palette?: string | null
          country?: string | null
          created_at?: string
          current_step?: number
          email?: string | null
          font_style?: string | null
          full_name?: string | null
          id?: string
          logo_url?: string | null
          needs_logo_design?: boolean
          payment_gateway?: string | null
          payment_method?: string | null
          phone?: string | null
          plan_id?: string | null
          product_count_estimate?: number | null
          project_details?: Json
          project_type?: string | null
          reference_websites?: string | null
          screenshot_url?: string | null
          shipping_requirements?: string | null
          special_features?: string | null
          status?: string
          store_type?: string | null
          submitted_at?: string | null
          team_members?: Json | null
          team_roles?: Json | null
          team_size?: number | null
          template_id?: string | null
          terms_accepted?: boolean
          transaction_id?: string | null
          updated_at?: string
          user_id: string
          whatsapp?: string | null
        }
        Update: {
          admin_notes?: string | null
          amount?: number | null
          billing_cycle?: string | null
          business_address?: string | null
          business_description?: string | null
          business_name?: string | null
          business_type?: string | null
          color_palette?: string | null
          country?: string | null
          created_at?: string
          current_step?: number
          email?: string | null
          font_style?: string | null
          full_name?: string | null
          id?: string
          logo_url?: string | null
          needs_logo_design?: boolean
          payment_gateway?: string | null
          payment_method?: string | null
          phone?: string | null
          plan_id?: string | null
          product_count_estimate?: number | null
          project_details?: Json
          project_type?: string | null
          reference_websites?: string | null
          screenshot_url?: string | null
          shipping_requirements?: string | null
          special_features?: string | null
          status?: string
          store_type?: string | null
          submitted_at?: string | null
          team_members?: Json | null
          team_roles?: Json | null
          team_size?: number | null
          template_id?: string | null
          terms_accepted?: boolean
          transaction_id?: string | null
          updated_at?: string
          user_id?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          price: number
          product_id: string | null
          product_name: string
          quantity: number
          total: number
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          price?: number
          product_id?: string | null
          product_name: string
          quantity?: number
          total?: number
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          price?: number
          product_id?: string | null
          product_name?: string
          quantity?: number
          total?: number
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
          created_at: string
          customer_address: string
          customer_email: string | null
          customer_name: string
          customer_phone: string
          id: string
          notes: string | null
          order_number: string
          shipping_fee: number
          status: string
          store_id: string
          subtotal: number
          total: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_address: string
          customer_email?: string | null
          customer_name: string
          customer_phone: string
          id?: string
          notes?: string | null
          order_number: string
          shipping_fee?: number
          status?: string
          store_id: string
          subtotal?: number
          total?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_address?: string
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string
          id?: string
          notes?: string | null
          order_number?: string
          shipping_fee?: number
          status?: string
          store_id?: string
          subtotal?: number
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
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
      products: {
        Row: {
          category_id: string | null
          compare_at_price: number | null
          created_at: string
          description: string | null
          id: string
          images: Json | null
          is_active: boolean
          name: string
          price: number
          slug: string
          sort_order: number
          stock: number
          store_id: string
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          compare_at_price?: number | null
          created_at?: string
          description?: string | null
          id?: string
          images?: Json | null
          is_active?: boolean
          name: string
          price?: number
          slug: string
          sort_order?: number
          stock?: number
          store_id: string
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          compare_at_price?: number | null
          created_at?: string
          description?: string | null
          id?: string
          images?: Json | null
          is_active?: boolean
          name?: string
          price?: number
          slug?: string
          sort_order?: number
          stock?: number
          store_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
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
      store_addons: {
        Row: {
          admin_notes: string | null
          config: Json
          created_at: string
          id: string
          item_id: string
          item_type: string
          payment_method: string | null
          price_snapshot_pkr: number
          pricing_type_snapshot: string
          screenshot_url: string | null
          status: string
          store_id: string
          transaction_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          config?: Json
          created_at?: string
          id?: string
          item_id: string
          item_type: string
          payment_method?: string | null
          price_snapshot_pkr?: number
          pricing_type_snapshot?: string
          screenshot_url?: string | null
          status?: string
          store_id: string
          transaction_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          config?: Json
          created_at?: string
          id?: string
          item_id?: string
          item_type?: string
          payment_method?: string | null
          price_snapshot_pkr?: number
          pricing_type_snapshot?: string
          screenshot_url?: string | null
          status?: string
          store_id?: string
          transaction_id?: string | null
          updated_at?: string
          user_id?: string
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
      store_settings: {
        Row: {
          address: string | null
          banner_url: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          description: string | null
          id: string
          logo_url: string | null
          primary_color: string | null
          secondary_color: string | null
          store_id: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          banner_url?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          id?: string
          logo_url?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          store_id: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          banner_url?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          id?: string
          logo_url?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          store_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "store_settings_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: true
            referencedRelation: "stores"
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
      upgrade_options: {
        Row: {
          created_at: string
          id: string
          is_enabled: boolean
          label: string
          price_pkr: number
          quantity: number
          sort_order: number
          upgrade_type: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_enabled?: boolean
          label: string
          price_pkr?: number
          quantity?: number
          sort_order?: number
          upgrade_type: string
        }
        Update: {
          created_at?: string
          id?: string
          is_enabled?: boolean
          label?: string
          price_pkr?: number
          quantity?: number
          sort_order?: number
          upgrade_type?: string
        }
        Relationships: []
      }
      upgrade_orders: {
        Row: {
          admin_notes: string | null
          amount: number
          created_at: string
          details: Json
          id: string
          payment_method: string | null
          screenshot_url: string | null
          status: string
          store_id: string
          transaction_id: string | null
          updated_at: string
          upgrade_type: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          amount?: number
          created_at?: string
          details?: Json
          id?: string
          payment_method?: string | null
          screenshot_url?: string | null
          status?: string
          store_id: string
          transaction_id?: string | null
          updated_at?: string
          upgrade_type: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          amount?: number
          created_at?: string
          details?: Json
          id?: string
          payment_method?: string | null
          screenshot_url?: string | null
          status?: string
          store_id?: string
          transaction_id?: string | null
          updated_at?: string
          upgrade_type?: string
          user_id?: string
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
      website_orders: {
        Row: {
          additional_notes: string | null
          address: string
          admin_notes: string | null
          amount: number | null
          business_description: string | null
          color_preferences: string | null
          contact_email: string | null
          contact_phone: string
          created_at: string
          domain_preference: string | null
          id: string
          logo_url: string | null
          payment_method: string | null
          plan_id: string
          screenshot_url: string | null
          social_media_links: Json | null
          status: string
          store_name: string
          template_id: string
          transaction_id: string | null
          updated_at: string
          user_id: string
          wordpress_password: string | null
          wordpress_url: string | null
          wordpress_username: string | null
        }
        Insert: {
          additional_notes?: string | null
          address: string
          admin_notes?: string | null
          amount?: number | null
          business_description?: string | null
          color_preferences?: string | null
          contact_email?: string | null
          contact_phone: string
          created_at?: string
          domain_preference?: string | null
          id?: string
          logo_url?: string | null
          payment_method?: string | null
          plan_id: string
          screenshot_url?: string | null
          social_media_links?: Json | null
          status?: string
          store_name: string
          template_id: string
          transaction_id?: string | null
          updated_at?: string
          user_id: string
          wordpress_password?: string | null
          wordpress_url?: string | null
          wordpress_username?: string | null
        }
        Update: {
          additional_notes?: string | null
          address?: string
          admin_notes?: string | null
          amount?: number | null
          business_description?: string | null
          color_preferences?: string | null
          contact_email?: string | null
          contact_phone?: string
          created_at?: string
          domain_preference?: string | null
          id?: string
          logo_url?: string | null
          payment_method?: string | null
          plan_id?: string
          screenshot_url?: string | null
          social_media_links?: Json | null
          status?: string
          store_name?: string
          template_id?: string
          transaction_id?: string | null
          updated_at?: string
          user_id?: string
          wordpress_password?: string | null
          wordpress_url?: string | null
          wordpress_username?: string | null
        }
        Relationships: []
      }
      website_products: {
        Row: {
          applicable_templates: Json
          category: string | null
          created_at: string
          demo_url: string | null
          description: string | null
          id: string
          is_enabled: boolean
          is_popular: boolean
          name: string
          preview_image_url: string | null
          price_pkr: number
          slug: string
          sort_order: number
          type: string
          updated_at: string
        }
        Insert: {
          applicable_templates?: Json
          category?: string | null
          created_at?: string
          demo_url?: string | null
          description?: string | null
          id?: string
          is_enabled?: boolean
          is_popular?: boolean
          name: string
          preview_image_url?: string | null
          price_pkr?: number
          slug: string
          sort_order?: number
          type: string
          updated_at?: string
        }
        Update: {
          applicable_templates?: Json
          category?: string | null
          created_at?: string
          demo_url?: string | null
          description?: string | null
          id?: string
          is_enabled?: boolean
          is_popular?: boolean
          name?: string
          preview_image_url?: string | null
          price_pkr?: number
          slug?: string
          sort_order?: number
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      public_store_settings: {
        Row: {
          banner_url: string | null
          contact_phone: string | null
          description: string | null
          id: string | null
          logo_url: string | null
          primary_color: string | null
          secondary_color: string | null
          store_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "store_settings_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: true
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
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
