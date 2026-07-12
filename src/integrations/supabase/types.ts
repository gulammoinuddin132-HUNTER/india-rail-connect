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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      booking_passengers: {
        Row: {
          age: number
          berth_preference: string | null
          booking_id: string
          coach: string | null
          created_at: string
          gender: string
          id: string
          name: string
          seat_no: string | null
          status: string
        }
        Insert: {
          age: number
          berth_preference?: string | null
          booking_id: string
          coach?: string | null
          created_at?: string
          gender: string
          id?: string
          name: string
          seat_no?: string | null
          status?: string
        }
        Update: {
          age?: number
          berth_preference?: string | null
          booking_id?: string
          coach?: string | null
          created_at?: string
          gender?: string
          id?: string
          name?: string
          seat_no?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_passengers_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          arrival_time: string
          booking_status: string
          class_code: string
          class_name: string
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          departure_time: string
          from_code: string
          from_station: string
          id: string
          journey_date: string
          payment_status: string
          pnr: string
          quota: string
          to_code: string
          to_station: string
          total_fare: number
          train_id: string
          train_name: string
          train_number: string
          updated_at: string
          user_id: string
        }
        Insert: {
          arrival_time: string
          booking_status?: string
          class_code: string
          class_name: string
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          departure_time: string
          from_code: string
          from_station: string
          id?: string
          journey_date: string
          payment_status?: string
          pnr: string
          quota?: string
          to_code: string
          to_station: string
          total_fare: number
          train_id: string
          train_name: string
          train_number: string
          updated_at?: string
          user_id: string
        }
        Update: {
          arrival_time?: string
          booking_status?: string
          class_code?: string
          class_name?: string
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          departure_time?: string
          from_code?: string
          from_station?: string
          id?: string
          journey_date?: string
          payment_status?: string
          pnr?: string
          quota?: string
          to_code?: string
          to_station?: string
          total_fare?: number
          train_id?: string
          train_name?: string
          train_number?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_train_id_fkey"
            columns: ["train_id"]
            isOneToOne: false
            referencedRelation: "trains"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      saved_passengers: {
        Row: {
          age: number
          created_at: string
          gender: string
          id: string
          name: string
          user_id: string
        }
        Insert: {
          age: number
          created_at?: string
          gender: string
          id?: string
          name: string
          user_id: string
        }
        Update: {
          age?: number
          created_at?: string
          gender?: string
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      trains: {
        Row: {
          arrival_time: string
          classes: Json
          created_at: string
          departure_time: string
          distance_km: number
          duration_minutes: number
          from_code: string
          from_station: string
          id: string
          name: string
          number: string
          runs_on: string[]
          to_code: string
          to_station: string
          train_type: string
        }
        Insert: {
          arrival_time: string
          classes: Json
          created_at?: string
          departure_time: string
          distance_km: number
          duration_minutes: number
          from_code: string
          from_station: string
          id?: string
          name: string
          number: string
          runs_on?: string[]
          to_code: string
          to_station: string
          train_type: string
        }
        Update: {
          arrival_time?: string
          classes?: Json
          created_at?: string
          departure_time?: string
          distance_km?: number
          duration_minutes?: number
          from_code?: string
          from_station?: string
          id?: string
          name?: string
          number?: string
          runs_on?: string[]
          to_code?: string
          to_station?: string
          train_type?: string
        }
        Relationships: []
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
