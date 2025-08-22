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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      coupon_redemptions: {
        Row: {
          amount: number | null
          coupon_id: string
          id: string
          redeemed_at: string | null
          savings: number | null
          status: string
          user_id: string
        }
        Insert: {
          amount?: number | null
          coupon_id: string
          id?: string
          redeemed_at?: string | null
          savings?: number | null
          status?: string
          user_id: string
        }
        Update: {
          amount?: number | null
          coupon_id?: string
          id?: string
          redeemed_at?: string | null
          savings?: number | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coupon_redemptions_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coupon_redemptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          code: string
          created_at: string | null
          current_uses: number | null
          description: string | null
          discount_percentage: number | null
          discount_value: number | null
          end_date: string
          fuel_type: string
          id: string
          is_active: boolean | null
          max_uses: number | null
          start_date: string
          station_id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          current_uses?: number | null
          description?: string | null
          discount_percentage?: number | null
          discount_value?: number | null
          end_date: string
          fuel_type?: string
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          start_date: string
          station_id: string
          title: string
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          current_uses?: number | null
          description?: string | null
          discount_percentage?: number | null
          discount_value?: number | null
          end_date?: string
          fuel_type?: string
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          start_date?: string
          station_id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coupons_station_id_fkey"
            columns: ["station_id"]
            isOneToOne: false
            referencedRelation: "stations"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          created_at: string | null
          id: string
          station_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          station_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          station_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_station_id_fkey"
            columns: ["station_id"]
            isOneToOne: false
            referencedRelation: "stations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_backup"
            referencedColumns: ["id"]
          },
        ]
      }
      fuel_prices: {
        Row: {
          created_at: string | null
          fuel_type: string
          id: string
          is_active: boolean | null
          price: number
          station_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          fuel_type: string
          id?: string
          is_active?: boolean | null
          price: number
          station_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          fuel_type?: string
          id?: string
          is_active?: boolean | null
          price?: number
          station_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fuel_prices_station_id_fkey"
            columns: ["station_id"]
            isOneToOne: false
            referencedRelation: "stations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          city: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          latitude: number | null
          longitude: number | null
          phone: string | null
          state: string | null
          tipo_usuario: Database["public"]["Enums"]["tipo_usuario_enum"] | null
          total_savings: number | null
          updated_at: string | null
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          city?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          latitude?: number | null
          longitude?: number | null
          phone?: string | null
          state?: string | null
          tipo_usuario?: Database["public"]["Enums"]["tipo_usuario_enum"] | null
          total_savings?: number | null
          updated_at?: string | null
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          city?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          phone?: string | null
          state?: string | null
          tipo_usuario?: Database["public"]["Enums"]["tipo_usuario_enum"] | null
          total_savings?: number | null
          updated_at?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
      profiles_backup: {
        Row: {
          address: string | null
          avatar_url: string | null
          city: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          phone: string | null
          preferred_fuel_type: string | null
          state: string | null
          total_savings: number | null
          updated_at: string | null
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          city?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          phone?: string | null
          preferred_fuel_type?: string | null
          state?: string | null
          total_savings?: number | null
          updated_at?: string | null
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          city?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          preferred_fuel_type?: string | null
          state?: string | null
          total_savings?: number | null
          updated_at?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
      "Profilles-Logo": {
        Row: {
          "E-mail": string
          id: string
          tipo_usuario: string | null
        }
        Insert: {
          "E-mail": string
          id?: string
          tipo_usuario?: string | null
        }
        Update: {
          "E-mail"?: string
          id?: string
          tipo_usuario?: string | null
        }
        Relationships: []
      }
      station_ratings: {
        Row: {
          comment: string | null
          created_at: string | null
          id: string
          rating: number
          station_id: string
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          id?: string
          rating: number
          station_id: string
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          id?: string
          rating?: number
          station_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "station_ratings_station_id_fkey"
            columns: ["station_id"]
            isOneToOne: false
            referencedRelation: "stations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "station_ratings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_backup"
            referencedColumns: ["id"]
          },
        ]
      }
      stations: {
        Row: {
          address: string | null
          business_hours: string | null
          city: string | null
          cnpj: string | null
          created_at: string | null
          email: string
          id: string
          is_verified: boolean | null
          latitude: number | null
          logo_url: string | null
          longitude: number | null
          phone: string | null
          rating: number | null
          state: string | null
          station_name: string
          total_ratings: number | null
          updated_at: string | null
          website: string | null
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          business_hours?: string | null
          city?: string | null
          cnpj?: string | null
          created_at?: string | null
          email: string
          id: string
          is_verified?: boolean | null
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          phone?: string | null
          rating?: number | null
          state?: string | null
          station_name: string
          total_ratings?: number | null
          updated_at?: string | null
          website?: string | null
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          business_hours?: string | null
          city?: string | null
          cnpj?: string | null
          created_at?: string | null
          email?: string
          id?: string
          is_verified?: boolean | null
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          phone?: string | null
          rating?: number | null
          state?: string | null
          station_name?: string
          total_ratings?: number | null
          updated_at?: string | null
          website?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      ratings: {
        Row: {
          comment: string | null
          created_at: string | null
          id: string | null
          rating: number | null
          station_id: string | null
          user_id: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          id?: string | null
          rating?: number | null
          station_id?: string | null
          user_id?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          id?: string | null
          rating?: number | null
          station_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "station_ratings_station_id_fkey"
            columns: ["station_id"]
            isOneToOne: false
            referencedRelation: "stations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "station_ratings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_backup"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      create_profile: {
        Args: { user_email: string; user_id: string; user_name: string }
        Returns: undefined
      }
      create_station: {
        Args: { station_name: string; user_email: string; user_id: string }
        Returns: undefined
      }
      get_station_unique_clients: {
        Args: { station_id: string }
        Returns: number
      }
      update_station_rating: {
        Args: { station_id: string }
        Returns: undefined
      }
    }
    Enums: {
      tipo_usuario_enum: "motorista" | "posto"
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
      tipo_usuario_enum: ["motorista", "posto"],
    },
  },
} as const
