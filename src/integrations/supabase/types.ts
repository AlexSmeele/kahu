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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      activity_goals: {
        Row: {
          activity_level: string
          created_at: string
          dog_id: string
          id: string
          is_active: boolean | null
          target_distance_km: number | null
          target_minutes: number
          updated_at: string
        }
        Insert: {
          activity_level?: string
          created_at?: string
          dog_id: string
          id?: string
          is_active?: boolean | null
          target_distance_km?: number | null
          target_minutes?: number
          updated_at?: string
        }
        Update: {
          activity_level?: string
          created_at?: string
          dog_id?: string
          id?: string
          is_active?: boolean | null
          target_distance_km?: number | null
          target_minutes?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_goals_dog_id_fkey"
            columns: ["dog_id"]
            isOneToOne: false
            referencedRelation: "dogs"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_records: {
        Row: {
          activity_type: string
          calories_burned: number | null
          created_at: string
          distance_km: number | null
          dog_id: string
          duration_minutes: number | null
          end_time: string | null
          gps_data: Json | null
          id: string
          notes: string | null
          start_time: string
          tracking_method: string | null
          updated_at: string
        }
        Insert: {
          activity_type: string
          calories_burned?: number | null
          created_at?: string
          distance_km?: number | null
          dog_id: string
          duration_minutes?: number | null
          end_time?: string | null
          gps_data?: Json | null
          id?: string
          notes?: string | null
          start_time: string
          tracking_method?: string | null
          updated_at?: string
        }
        Update: {
          activity_type?: string
          calories_burned?: number | null
          created_at?: string
          distance_km?: number | null
          dog_id?: string
          duration_minutes?: number | null
          end_time?: string | null
          gps_data?: Json | null
          id?: string
          notes?: string | null
          start_time?: string
          tracking_method?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_records_dog_id_fkey"
            columns: ["dog_id"]
            isOneToOne: false
            referencedRelation: "dogs"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          ip_address: unknown | null
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          table_name: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      dog_breeds: {
        Row: {
          breed: string
          coat: string | null
          common_health_issues: Json | null
          created_at: string
          exercise_needs: string | null
          grooming: string | null
          id: string
          life_span_years: string | null
          origin: string | null
          registries: Json | null
          temperament: Json | null
          trainability: string | null
          updated_at: string
          weight_kg: Json | null
        }
        Insert: {
          breed: string
          coat?: string | null
          common_health_issues?: Json | null
          created_at?: string
          exercise_needs?: string | null
          grooming?: string | null
          id?: string
          life_span_years?: string | null
          origin?: string | null
          registries?: Json | null
          temperament?: Json | null
          trainability?: string | null
          updated_at?: string
          weight_kg?: Json | null
        }
        Update: {
          breed?: string
          coat?: string | null
          common_health_issues?: Json | null
          created_at?: string
          exercise_needs?: string | null
          grooming?: string | null
          id?: string
          life_span_years?: string | null
          origin?: string | null
          registries?: Json | null
          temperament?: Json | null
          trainability?: string | null
          updated_at?: string
          weight_kg?: Json | null
        }
        Relationships: []
      }
      dog_tricks: {
        Row: {
          created_at: string
          dog_id: string
          id: string
          mastered_at: string | null
          started_at: string | null
          status: string
          total_sessions: number | null
          trick_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          dog_id: string
          id?: string
          mastered_at?: string | null
          started_at?: string | null
          status?: string
          total_sessions?: number | null
          trick_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          dog_id?: string
          id?: string
          mastered_at?: string | null
          started_at?: string | null
          status?: string
          total_sessions?: number | null
          trick_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "dog_tricks_dog_id_fkey"
            columns: ["dog_id"]
            isOneToOne: false
            referencedRelation: "dogs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dog_tricks_trick_id_fkey"
            columns: ["trick_id"]
            isOneToOne: false
            referencedRelation: "tricks"
            referencedColumns: ["id"]
          },
        ]
      }
      dog_vet_clinics: {
        Row: {
          created_at: string
          dog_id: string
          id: string
          is_primary: boolean | null
          relationship_notes: string | null
          updated_at: string
          vet_clinic_id: string
        }
        Insert: {
          created_at?: string
          dog_id: string
          id?: string
          is_primary?: boolean | null
          relationship_notes?: string | null
          updated_at?: string
          vet_clinic_id: string
        }
        Update: {
          created_at?: string
          dog_id?: string
          id?: string
          is_primary?: boolean | null
          relationship_notes?: string | null
          updated_at?: string
          vet_clinic_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dog_vet_clinics_dog_id_fkey"
            columns: ["dog_id"]
            isOneToOne: false
            referencedRelation: "dogs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dog_vet_clinics_vet_clinic_id_fkey"
            columns: ["vet_clinic_id"]
            isOneToOne: false
            referencedRelation: "vet_clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      dogs: {
        Row: {
          avatar_url: string | null
          birthday: string | null
          breed_id: string
          created_at: string
          family_id: string | null
          gender: string | null
          id: string
          name: string
          sort_order: number | null
          updated_at: string
          user_id: string
          weight: number | null
        }
        Insert: {
          avatar_url?: string | null
          birthday?: string | null
          breed_id: string
          created_at?: string
          family_id?: string | null
          gender?: string | null
          id?: string
          name: string
          sort_order?: number | null
          updated_at?: string
          user_id: string
          weight?: number | null
        }
        Update: {
          avatar_url?: string | null
          birthday?: string | null
          breed_id?: string
          created_at?: string
          family_id?: string | null
          gender?: string | null
          id?: string
          name?: string
          sort_order?: number | null
          updated_at?: string
          user_id?: string
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "dogs_breed_id_fkey"
            columns: ["breed_id"]
            isOneToOne: false
            referencedRelation: "dog_breeds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dogs_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dogs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      families: {
        Row: {
          created_at: string
          created_by: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "families_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      family_invitations: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          expires_at: string
          family_id: string
          id: string
          invited_by: string
          role: string
          token: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          expires_at?: string
          family_id: string
          id?: string
          invited_by: string
          role?: string
          token: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          family_id?: string
          id?: string
          invited_by?: string
          role?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "family_invitations_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      family_members: {
        Row: {
          created_at: string
          family_id: string
          id: string
          joined_at: string
          role: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          family_id: string
          id?: string
          joined_at?: string
          role?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          family_id?: string
          id?: string
          joined_at?: string
          role?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "family_members_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "family_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      health_records: {
        Row: {
          created_at: string
          date: string
          description: string | null
          dog_id: string
          id: string
          notes: string | null
          record_type: string
          title: string
          updated_at: string
          vet_clinic_id: string | null
          veterinarian: string | null
        }
        Insert: {
          created_at?: string
          date: string
          description?: string | null
          dog_id: string
          id?: string
          notes?: string | null
          record_type: string
          title: string
          updated_at?: string
          vet_clinic_id?: string | null
          veterinarian?: string | null
        }
        Update: {
          created_at?: string
          date?: string
          description?: string | null
          dog_id?: string
          id?: string
          notes?: string | null
          record_type?: string
          title?: string
          updated_at?: string
          vet_clinic_id?: string | null
          veterinarian?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "health_records_dog_id_fkey"
            columns: ["dog_id"]
            isOneToOne: false
            referencedRelation: "dogs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "health_records_vet_clinic_id_fkey"
            columns: ["vet_clinic_id"]
            isOneToOne: false
            referencedRelation: "vet_clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_records: {
        Row: {
          amount_given: number | null
          completed_at: string | null
          created_at: string
          dog_id: string
          id: string
          meal_name: string
          meal_time: string
          notes: string | null
          nutrition_plan_id: string
          scheduled_date: string
          updated_at: string
        }
        Insert: {
          amount_given?: number | null
          completed_at?: string | null
          created_at?: string
          dog_id: string
          id?: string
          meal_name: string
          meal_time: string
          notes?: string | null
          nutrition_plan_id: string
          scheduled_date: string
          updated_at?: string
        }
        Update: {
          amount_given?: number | null
          completed_at?: string | null
          created_at?: string
          dog_id?: string
          id?: string
          meal_name?: string
          meal_time?: string
          notes?: string | null
          nutrition_plan_id?: string
          scheduled_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "meal_records_dog_id_fkey"
            columns: ["dog_id"]
            isOneToOne: false
            referencedRelation: "dogs"
            referencedColumns: ["id"]
          },
        ]
      }
      message_reports: {
        Row: {
          admin_notes: string | null
          conversation_context: Json | null
          created_at: string
          dog_id: string | null
          id: string
          message_content: string
          report_details: string | null
          report_reason: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          conversation_context?: Json | null
          created_at?: string
          dog_id?: string | null
          id?: string
          message_content: string
          report_details?: string | null
          report_reason: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          conversation_context?: Json | null
          created_at?: string
          dog_id?: string | null
          id?: string
          message_content?: string
          report_details?: string | null
          report_reason?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_reports_dog_id_fkey"
            columns: ["dog_id"]
            isOneToOne: false
            referencedRelation: "dogs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_reports_user_id_fkey1"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string
          dog_id: string | null
          id: string
          is_read: boolean | null
          message: string
          metadata: Json | null
          priority: string | null
          scheduled_for: string | null
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string
          dog_id?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          metadata?: Json | null
          priority?: string | null
          scheduled_for?: string | null
          title: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string
          dog_id?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          metadata?: Json | null
          priority?: string | null
          scheduled_for?: string | null
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_dog_id_fkey"
            columns: ["dog_id"]
            isOneToOne: false
            referencedRelation: "dogs"
            referencedColumns: ["id"]
          },
        ]
      }
      nutrition_plans: {
        Row: {
          brand: string | null
          created_at: string
          daily_amount: number | null
          dog_id: string
          feeding_times: number | null
          food_type: string
          id: string
          is_active: boolean | null
          meal_schedule: Json | null
          special_instructions: string | null
          updated_at: string
        }
        Insert: {
          brand?: string | null
          created_at?: string
          daily_amount?: number | null
          dog_id: string
          feeding_times?: number | null
          food_type: string
          id?: string
          is_active?: boolean | null
          meal_schedule?: Json | null
          special_instructions?: string | null
          updated_at?: string
        }
        Update: {
          brand?: string | null
          created_at?: string
          daily_amount?: number | null
          dog_id?: string
          feeding_times?: number | null
          food_type?: string
          id?: string
          is_active?: boolean | null
          meal_schedule?: Json | null
          special_instructions?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "nutrition_plans_dog_id_fkey"
            columns: ["dog_id"]
            isOneToOne: false
            referencedRelation: "dogs"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          city: string | null
          country: string | null
          created_at: string
          display_name: string | null
          id: string
          phone: string | null
          role: string | null
          state: string | null
          timezone: string | null
          updated_at: string
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          phone?: string | null
          role?: string | null
          state?: string | null
          timezone?: string | null
          updated_at?: string
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          phone?: string | null
          role?: string | null
          state?: string | null
          timezone?: string | null
          updated_at?: string
          zip_code?: string | null
        }
        Relationships: []
      }
      saved_messages: {
        Row: {
          conversation_context: Json | null
          created_at: string
          dog_id: string | null
          id: string
          message_content: string
          notes: string | null
          tags: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          conversation_context?: Json | null
          created_at?: string
          dog_id?: string | null
          id?: string
          message_content: string
          notes?: string | null
          tags?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          conversation_context?: Json | null
          created_at?: string
          dog_id?: string | null
          id?: string
          message_content?: string
          notes?: string | null
          tags?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_messages_dog_id_fkey"
            columns: ["dog_id"]
            isOneToOne: false
            referencedRelation: "dogs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_messages_user_id_fkey1"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      training_sessions: {
        Row: {
          created_at: string
          dog_id: string
          duration_minutes: number | null
          id: string
          notes: string | null
          progress_status: string | null
          session_date: string
          success_rating: number | null
          trick_id: string
        }
        Insert: {
          created_at?: string
          dog_id: string
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          progress_status?: string | null
          session_date?: string
          success_rating?: number | null
          trick_id: string
        }
        Update: {
          created_at?: string
          dog_id?: string
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          progress_status?: string | null
          session_date?: string
          success_rating?: number | null
          trick_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_sessions_dog_id_fkey"
            columns: ["dog_id"]
            isOneToOne: false
            referencedRelation: "dogs"
            referencedColumns: ["id"]
          },
        ]
      }
      tricks: {
        Row: {
          category: string
          created_at: string
          description: string
          difficulty_level: number
          estimated_time_weeks: number | null
          id: string
          instructions: string
          name: string
          prerequisites: string[] | null
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          difficulty_level: number
          estimated_time_weeks?: number | null
          id?: string
          instructions: string
          name: string
          prerequisites?: string[] | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          difficulty_level?: number
          estimated_time_weeks?: number | null
          id?: string
          instructions?: string
          name?: string
          prerequisites?: string[] | null
        }
        Relationships: []
      }
      vaccination_records: {
        Row: {
          administered_date: string
          batch_number: string | null
          created_at: string
          dog_id: string
          due_date: string | null
          id: string
          notes: string | null
          updated_at: string
          vaccine_id: string
          vet_clinic_id: string | null
          veterinarian: string | null
        }
        Insert: {
          administered_date: string
          batch_number?: string | null
          created_at?: string
          dog_id: string
          due_date?: string | null
          id?: string
          notes?: string | null
          updated_at?: string
          vaccine_id: string
          vet_clinic_id?: string | null
          veterinarian?: string | null
        }
        Update: {
          administered_date?: string
          batch_number?: string | null
          created_at?: string
          dog_id?: string
          due_date?: string | null
          id?: string
          notes?: string | null
          updated_at?: string
          vaccine_id?: string
          vet_clinic_id?: string | null
          veterinarian?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vaccination_records_dog_id_fkey"
            columns: ["dog_id"]
            isOneToOne: false
            referencedRelation: "dogs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vaccination_records_vaccine_id_fkey"
            columns: ["vaccine_id"]
            isOneToOne: false
            referencedRelation: "vaccines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vaccination_records_vet_clinic_id_fkey"
            columns: ["vet_clinic_id"]
            isOneToOne: false
            referencedRelation: "vet_clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      vaccines: {
        Row: {
          booster_required: boolean | null
          created_at: string
          frequency_months: number | null
          id: string
          lifestyle_factors: string[] | null
          name: string
          notes: string | null
          protects_against: string
          puppy_start_weeks: number | null
          schedule_info: string
          updated_at: string
          vaccine_type: string
        }
        Insert: {
          booster_required?: boolean | null
          created_at?: string
          frequency_months?: number | null
          id?: string
          lifestyle_factors?: string[] | null
          name: string
          notes?: string | null
          protects_against: string
          puppy_start_weeks?: number | null
          schedule_info: string
          updated_at?: string
          vaccine_type: string
        }
        Update: {
          booster_required?: boolean | null
          created_at?: string
          frequency_months?: number | null
          id?: string
          lifestyle_factors?: string[] | null
          name?: string
          notes?: string | null
          protects_against?: string
          puppy_start_weeks?: number | null
          schedule_info?: string
          updated_at?: string
          vaccine_type?: string
        }
        Relationships: []
      }
      vet_clinics: {
        Row: {
          address: string
          created_at: string
          email: string | null
          hours: Json | null
          id: string
          latitude: number | null
          longitude: number | null
          name: string
          osm_place_id: string | null
          osm_type: string | null
          phone: string | null
          services: string[] | null
          updated_at: string
          verified: boolean | null
          website: string | null
        }
        Insert: {
          address: string
          created_at?: string
          email?: string | null
          hours?: Json | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          name: string
          osm_place_id?: string | null
          osm_type?: string | null
          phone?: string | null
          services?: string[] | null
          updated_at?: string
          verified?: boolean | null
          website?: string | null
        }
        Update: {
          address?: string
          created_at?: string
          email?: string | null
          hours?: Json | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          name?: string
          osm_place_id?: string | null
          osm_type?: string | null
          phone?: string | null
          services?: string[] | null
          updated_at?: string
          verified?: boolean | null
          website?: string | null
        }
        Relationships: []
      }
      vet_search_analytics: {
        Row: {
          created_at: string
          database_results_count: number | null
          error_message: string | null
          id: string
          osm_results_count: number | null
          response_time_ms: number | null
          search_query: string
          selected_clinic_id: string | null
          total_results_count: number | null
          user_id: string | null
          user_location_provided: boolean | null
        }
        Insert: {
          created_at?: string
          database_results_count?: number | null
          error_message?: string | null
          id?: string
          osm_results_count?: number | null
          response_time_ms?: number | null
          search_query: string
          selected_clinic_id?: string | null
          total_results_count?: number | null
          user_id?: string | null
          user_location_provided?: boolean | null
        }
        Update: {
          created_at?: string
          database_results_count?: number | null
          error_message?: string | null
          id?: string
          osm_results_count?: number | null
          response_time_ms?: number | null
          search_query?: string
          selected_clinic_id?: string | null
          total_results_count?: number | null
          user_id?: string | null
          user_location_provided?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "vet_search_analytics_selected_clinic_id_fkey"
            columns: ["selected_clinic_id"]
            isOneToOne: false
            referencedRelation: "vet_clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      weight_records: {
        Row: {
          created_at: string
          date: string
          dog_id: string
          id: string
          notes: string | null
          updated_at: string
          weight: number
        }
        Insert: {
          created_at?: string
          date?: string
          dog_id: string
          id?: string
          notes?: string | null
          updated_at?: string
          weight: number
        }
        Update: {
          created_at?: string
          date?: string
          dog_id?: string
          id?: string
          notes?: string | null
          updated_at?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "weight_records_dog_id_fkey"
            columns: ["dog_id"]
            isOneToOne: false
            referencedRelation: "dogs"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_rate_limit: {
        Args: {
          max_attempts?: number
          operation_name: string
          time_window_minutes?: number
        }
        Returns: boolean
      }
      decrypt_sensitive_data: {
        Args: { encrypted_data: string; key_name?: string }
        Returns: string
      }
      encrypt_sensitive_data: {
        Args: { data: string; key_name?: string }
        Returns: string
      }
      generate_invitation_token: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_accessible_vet_clinics: {
        Args: { include_contact_info?: boolean; search_query?: string }
        Returns: {
          address: string
          created_at: string
          email: string
          has_contact_access: boolean
          hours: Json
          id: string
          latitude: number
          longitude: number
          name: string
          osm_place_id: string
          osm_type: string
          phone: string
          services: string[]
          updated_at: string
          verified: boolean
          website: string
        }[]
      }
      get_user_invitations: {
        Args: Record<PropertyKey, never>
        Returns: {
          accepted_at: string
          created_at: string
          email: string
          expires_at: string
          family_id: string
          id: string
          invited_by: string
          role: string
        }[]
      }
      get_user_profile_secure: {
        Args: Record<PropertyKey, never>
        Returns: {
          avatar_url: string
          created_at: string
          display_name: string
          id: string
        }[]
      }
      gtrgm_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_options: {
        Args: { "": unknown }
        Returns: undefined
      }
      gtrgm_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      is_family_admin: {
        Args: { p_family_id: string; p_user_id: string }
        Returns: boolean
      }
      is_family_member: {
        Args: { p_family_id: string; p_user_id: string }
        Returns: boolean
      }
      mask_email: {
        Args: { email: string }
        Returns: string
      }
      secure_vet_search: {
        Args: { search_term: string }
        Returns: {
          address: string
          created_at: string
          email: string | null
          hours: Json | null
          id: string
          latitude: number | null
          longitude: number | null
          name: string
          osm_place_id: string | null
          osm_type: string | null
          phone: string | null
          services: string[] | null
          updated_at: string
          verified: boolean | null
          website: string | null
        }[]
      }
      set_limit: {
        Args: { "": number }
        Returns: number
      }
      show_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      show_trgm: {
        Args: { "": string }
        Returns: string[]
      }
      validate_invitation_token: {
        Args: { _token: string }
        Returns: {
          accepted_at: string
          email: string
          expires_at: string
          family_id: string
          invitation_id: string
          role: string
        }[]
      }
      validate_password_strength: {
        Args: { password: string }
        Returns: boolean
      }
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
