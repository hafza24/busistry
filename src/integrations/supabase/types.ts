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
      audit_logs: {
        Row: {
          action: string
          actor_email: string | null
          created_at: string
          entity_id: string | null
          entity_type: string | null
          id: string
          ip_address: string | null
          metadata: Json
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          actor_email?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          actor_email?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json
          user_agent?: string | null
          user_id?: string | null
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
      chat_messages: {
        Row: {
          author_id: string | null
          content: string
          created_at: string
          id: string
          role: string
          thread_id: string
        }
        Insert: {
          author_id?: string | null
          content: string
          created_at?: string
          id?: string
          role: string
          thread_id: string
        }
        Update: {
          author_id?: string | null
          content?: string
          created_at?: string
          id?: string
          role?: string
          thread_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "chat_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_threads: {
        Row: {
          created_at: string
          id: string
          last_message_at: string
          mode: string
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_message_at?: string
          mode?: string
          status?: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_message_at?: string
          mode?: string
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          admin_notes: string | null
          created_at: string
          email: string
          id: string
          message: string
          name: string
          status: string
          subject: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          status?: string
          subject: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          status?: string
          subject?: string
          updated_at?: string
        }
        Relationships: []
      }
      feedback_submissions: {
        Row: {
          admin_notes: string | null
          allow_contact: boolean
          approved: boolean
          approved_at: string | null
          approved_by: string | null
          category: string | null
          created_at: string
          email: string | null
          featured: boolean
          id: string
          message: string
          order_id: string | null
          phone: string | null
          rating: number | null
          status: string
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          allow_contact?: boolean
          approved?: boolean
          approved_at?: string | null
          approved_by?: string | null
          category?: string | null
          created_at?: string
          email?: string | null
          featured?: boolean
          id?: string
          message: string
          order_id?: string | null
          phone?: string | null
          rating?: number | null
          status?: string
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          allow_contact?: boolean
          approved?: boolean
          approved_at?: string | null
          approved_by?: string | null
          category?: string | null
          created_at?: string
          email?: string | null
          featured?: boolean
          id?: string
          message?: string
          order_id?: string | null
          phone?: string | null
          rating?: number | null
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      help_articles: {
        Row: {
          category_id: string | null
          content: string
          created_at: string
          excerpt: string | null
          id: string
          is_featured: boolean
          is_published: boolean
          slug: string
          sort_order: number
          tags: string[]
          title: string
          updated_at: string
          views: number
        }
        Insert: {
          category_id?: string | null
          content?: string
          created_at?: string
          excerpt?: string | null
          id?: string
          is_featured?: boolean
          is_published?: boolean
          slug: string
          sort_order?: number
          tags?: string[]
          title: string
          updated_at?: string
          views?: number
        }
        Update: {
          category_id?: string | null
          content?: string
          created_at?: string
          excerpt?: string | null
          id?: string
          is_featured?: boolean
          is_published?: boolean
          slug?: string
          sort_order?: number
          tags?: string[]
          title?: string
          updated_at?: string
          views?: number
        }
        Relationships: [
          {
            foreignKeyName: "help_articles_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "help_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      help_categories: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          is_active: boolean
          name: string
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          name: string
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
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
      newsletter_subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          source: string
          status: Database["public"]["Enums"]["newsletter_status"]
          subscribed_at: string
          unsubscribed_at: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          source?: string
          status?: Database["public"]["Enums"]["newsletter_status"]
          subscribed_at?: string
          unsubscribed_at?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          source?: string
          status?: Database["public"]["Enums"]["newsletter_status"]
          subscribed_at?: string
          unsubscribed_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          audience: string
          body: string | null
          created_at: string
          id: string
          link: string | null
          metadata: Json
          read_at: string | null
          subscription_id: string | null
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          audience?: string
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          metadata?: Json
          read_at?: string | null
          subscription_id?: string | null
          title: string
          type: string
          user_id?: string | null
        }
        Update: {
          audience?: string
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          metadata?: Json
          read_at?: string | null
          subscription_id?: string | null
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
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
          integrations_total_pkr: number
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
          selected_integration_ids: string[]
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
          integrations_total_pkr?: number
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
          selected_integration_ids?: string[]
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
          integrations_total_pkr?: number
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
          selected_integration_ids?: string[]
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
          domain_type: string
          duration_days: number | null
          email_accounts: number
          features: Json | null
          id: string
          is_active: boolean
          max_categories: number
          max_pages: number
          max_products: number
          name: string
          platform_type: string
          price_pkr: number
          team_users: number
          type: Database["public"]["Enums"]["plan_type"]
        }
        Insert: {
          created_at?: string
          domain_type?: string
          duration_days?: number | null
          email_accounts?: number
          features?: Json | null
          id?: string
          is_active?: boolean
          max_categories?: number
          max_pages?: number
          max_products?: number
          name: string
          platform_type?: string
          price_pkr?: number
          team_users?: number
          type: Database["public"]["Enums"]["plan_type"]
        }
        Update: {
          created_at?: string
          domain_type?: string
          duration_days?: number | null
          email_accounts?: number
          features?: Json | null
          id?: string
          is_active?: boolean
          max_categories?: number
          max_pages?: number
          max_products?: number
          name?: string
          platform_type?: string
          price_pkr?: number
          team_users?: number
          type?: Database["public"]["Enums"]["plan_type"]
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
          address_line: string | null
          avatar_url: string | null
          bio: string | null
          business_name: string | null
          city: string | null
          country: string | null
          created_at: string
          date_of_birth: string | null
          facebook_url: string | null
          full_name: string | null
          gender: string | null
          id: string
          instagram_url: string | null
          linkedin_url: string | null
          newsletter_subscribed: boolean
          newsletter_subscribed_at: string | null
          phone: string | null
          postal_code: string | null
          province: string | null
          twitter_url: string | null
          updated_at: string
          website_url: string | null
          whatsapp: string | null
        }
        Insert: {
          address_line?: string | null
          avatar_url?: string | null
          bio?: string | null
          business_name?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          date_of_birth?: string | null
          facebook_url?: string | null
          full_name?: string | null
          gender?: string | null
          id: string
          instagram_url?: string | null
          linkedin_url?: string | null
          newsletter_subscribed?: boolean
          newsletter_subscribed_at?: string | null
          phone?: string | null
          postal_code?: string | null
          province?: string | null
          twitter_url?: string | null
          updated_at?: string
          website_url?: string | null
          whatsapp?: string | null
        }
        Update: {
          address_line?: string | null
          avatar_url?: string | null
          bio?: string | null
          business_name?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          date_of_birth?: string | null
          facebook_url?: string | null
          full_name?: string | null
          gender?: string | null
          id?: string
          instagram_url?: string | null
          linkedin_url?: string | null
          newsletter_subscribed?: boolean
          newsletter_subscribed_at?: string | null
          phone?: string | null
          postal_code?: string | null
          province?: string | null
          twitter_url?: string | null
          updated_at?: string
          website_url?: string | null
          whatsapp?: string | null
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
          accent_color: string | null
          address: string | null
          banner_url: string | null
          brand_name: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          custom_domain: string | null
          description: string | null
          favicon_url: string | null
          id: string
          logo_url: string | null
          primary_color: string | null
          secondary_color: string | null
          store_id: string
          updated_at: string
        }
        Insert: {
          accent_color?: string | null
          address?: string | null
          banner_url?: string | null
          brand_name?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          custom_domain?: string | null
          description?: string | null
          favicon_url?: string | null
          id?: string
          logo_url?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          store_id: string
          updated_at?: string
        }
        Update: {
          accent_color?: string | null
          address?: string | null
          banner_url?: string | null
          brand_name?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          custom_domain?: string | null
          description?: string | null
          favicon_url?: string | null
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
      store_team_members: {
        Row: {
          created_at: string
          id: string
          invited_email: string | null
          role: string
          store_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          invited_email?: string | null
          role?: string
          store_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          invited_email?: string | null
          role?: string
          store_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
      subscriptions: {
        Row: {
          amount_pkr: number
          auto_renew: boolean
          created_at: string
          current_period_end: string
          current_period_start: string
          cycle_days: number
          id: string
          label: string
          last_reminder_at: string | null
          last_reminder_day: number | null
          source_id: string
          source_type: string
          status: string
          store_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_pkr?: number
          auto_renew?: boolean
          created_at?: string
          current_period_end: string
          current_period_start?: string
          cycle_days?: number
          id?: string
          label: string
          last_reminder_at?: string | null
          last_reminder_day?: number | null
          source_id: string
          source_type: string
          status?: string
          store_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_pkr?: number
          auto_renew?: boolean
          created_at?: string
          current_period_end?: string
          current_period_start?: string
          cycle_days?: number
          id?: string
          label?: string
          last_reminder_at?: string | null
          last_reminder_day?: number | null
          source_id?: string
          source_type?: string
          status?: string
          store_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          admin_response: string | null
          category: string
          created_at: string
          id: string
          message: string
          priority: string
          responded_at: string | null
          responded_by: string | null
          status: string
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_response?: string | null
          category?: string
          created_at?: string
          id?: string
          message: string
          priority?: string
          responded_at?: string | null
          responded_by?: string | null
          status?: string
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_response?: string | null
          category?: string
          created_at?: string
          id?: string
          message?: string
          priority?: string
          responded_at?: string | null
          responded_by?: string | null
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      templates: {
        Row: {
          available_plans: Json | null
          category: string | null
          created_at: string
          demo_url: string | null
          description: string | null
          features: Json | null
          id: string
          is_active: boolean
          name: string
          niche: string
          original_price_pkr: number | null
          preset_conditional_fields: Json
          preset_modules: Json
          preset_pages: Json
          preview_image_url: string | null
          price_pkr: number
          slug: string | null
          sort_order: number
          status: string
          subcategory: string | null
          tech_stack: string[]
        }
        Insert: {
          available_plans?: Json | null
          category?: string | null
          created_at?: string
          demo_url?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean
          name: string
          niche: string
          original_price_pkr?: number | null
          preset_conditional_fields?: Json
          preset_modules?: Json
          preset_pages?: Json
          preview_image_url?: string | null
          price_pkr?: number
          slug?: string | null
          sort_order?: number
          status?: string
          subcategory?: string | null
          tech_stack?: string[]
        }
        Update: {
          available_plans?: Json | null
          category?: string | null
          created_at?: string
          demo_url?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean
          name?: string
          niche?: string
          original_price_pkr?: number | null
          preset_conditional_fields?: Json
          preset_modules?: Json
          preset_pages?: Json
          preview_image_url?: string | null
          price_pkr?: number
          slug?: string | null
          sort_order?: number
          status?: string
          subcategory?: string | null
          tech_stack?: string[]
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
          onboarding_submission_id: string | null
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
          onboarding_submission_id?: string | null
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
          onboarding_submission_id?: string | null
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
        Relationships: [
          {
            foreignKeyName: "website_orders_onboarding_submission_id_fkey"
            columns: ["onboarding_submission_id"]
            isOneToOne: false
            referencedRelation: "onboarding_submissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "website_orders_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "website_orders_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "templates"
            referencedColumns: ["id"]
          },
        ]
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
      public_feedback_reviews: {
        Row: {
          created_at: string | null
          featured: boolean | null
          id: string | null
          message: string | null
          rating: number | null
          subject: string | null
        }
        Insert: {
          created_at?: string | null
          featured?: boolean | null
          id?: string | null
          message?: string | null
          rating?: number | null
          subject?: string | null
        }
        Update: {
          created_at?: string | null
          featured?: boolean | null
          id?: string | null
          message?: string | null
          rating?: number | null
          subject?: string | null
        }
        Relationships: []
      }
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
      admin_active_returning_users: {
        Args: { days?: number }
        Returns: {
          active_users: number
          returning_users: number
        }[]
      }
      admin_dashboard_stats: {
        Args: never
        Returns: {
          active_popups: number
          total_orders: number
          total_plans: number
          total_revenue: number
          total_templates: number
          total_users: number
        }[]
      }
      admin_new_users_month: {
        Args: never
        Returns: {
          count: number
        }[]
      }
      admin_new_users_today: {
        Args: never
        Returns: {
          count: number
        }[]
      }
      admin_period_metrics: {
        Args: { days?: number }
        Returns: {
          current_orders: number
          current_revenue: number
          current_users: number
          order_growth: number
          previous_orders: number
          previous_revenue: number
          previous_users: number
          revenue_growth: number
          user_growth: number
        }[]
      }
      admin_recent_activity: {
        Args: { limit_count?: number }
        Returns: {
          action: string
          created_at: string
          details: Json
          id: string
          type: string
          user_email: string
          user_id: string
        }[]
      }
      admin_revenue_summary: {
        Args: never
        Returns: {
          month: number
          today: number
          week: number
          year: number
        }[]
      }
      admin_total_users: {
        Args: never
        Returns: {
          count: number
        }[]
      }
      create_order_with_items: {
        Args: {
          p_customer_address: string
          p_customer_email: string
          p_customer_name: string
          p_customer_phone: string
          p_items: Json
          p_order_number: string
          p_store_id: string
          p_subtotal: number
          p_total: number
        }
        Returns: {
          order_id: string
        }[]
      }
      get_feedback_rating_distribution: {
        Args: never
        Returns: {
          avg_rating: number
          rating_1: number
          rating_2: number
          rating_3: number
          rating_4: number
          rating_5: number
          total_reviews: number
        }[]
      }
      get_feedback_rating_stats: {
        Args: never
        Returns: {
          avg_rating: number
          total_reviews: number
        }[]
      }
      get_website_order_credentials: {
        Args: { p_order_id: string }
        Returns: {
          wordpress_password: string
          wordpress_url: string
          wordpress_username: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      set_website_order_credentials: {
        Args: {
          p_order_id: string
          p_wordpress_password: string
          p_wordpress_url: string
          p_wordpress_username: string
        }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "user" | "owner" | "manager" | "staff"
      newsletter_status: "subscribed" | "unsubscribed"
      payment_method:
        | "easypaisa"
        | "jazzcash"
        | "nayapay"
        | "raast"
        | "bank_transfer"
      plan_type: "free" | "rent" | "buy"
      popup_animation_type:
        | "fade"
        | "scale"
        | "slide-up"
        | "slide-down"
        | "slide-left"
        | "slide-right"
        | "bounce"
        | "flip"
        | "rotate"
      popup_color_scheme:
        | "primary"
        | "success"
        | "error"
        | "warning"
        | "info"
        | "dark"
        | "light"
        | "gradient"
      popup_position_type:
        | "center"
        | "top-left"
        | "top-right"
        | "bottom-left"
        | "bottom-right"
      popup_trigger_type: "time" | "scroll" | "exit" | "click" | "hover"
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
      app_role: ["admin", "user", "owner", "manager", "staff"],
      newsletter_status: ["subscribed", "unsubscribed"],
      payment_method: [
        "easypaisa",
        "jazzcash",
        "nayapay",
        "raast",
        "bank_transfer",
      ],
      plan_type: ["free", "rent", "buy"],
      popup_animation_type: [
        "fade",
        "scale",
        "slide-up",
        "slide-down",
        "slide-left",
        "slide-right",
        "bounce",
        "flip",
        "rotate",
      ],
      popup_color_scheme: [
        "primary",
        "success",
        "error",
        "warning",
        "info",
        "dark",
        "light",
        "gradient",
      ],
      popup_position_type: [
        "center",
        "top-left",
        "top-right",
        "bottom-left",
        "bottom-right",
      ],
      popup_trigger_type: ["time", "scroll", "exit", "click", "hover"],
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
