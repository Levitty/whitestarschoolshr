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
      document_signatures: {
        Row: {
          document_id: string
          id: string
          ip_address: unknown | null
          signature_data: string | null
          signed_at: string | null
          signer_id: string
        }
        Insert: {
          document_id: string
          id?: string
          ip_address?: unknown | null
          signature_data?: string | null
          signed_at?: string | null
          signer_id: string
        }
        Update: {
          document_id?: string
          id?: string
          ip_address?: unknown | null
          signature_data?: string | null
          signed_at?: string | null
          signer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_signatures_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_signatures_signer_id_fkey"
            columns: ["signer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          category: Database["public"]["Enums"]["document_category"]
          created_at: string | null
          description: string | null
          employee_id: string | null
          file_name: string | null
          file_path: string | null
          file_size: number | null
          file_type: string | null
          id: string
          is_shared: boolean | null
          requires_signature: boolean | null
          signed_at: string | null
          signed_by: string | null
          status: Database["public"]["Enums"]["document_status"] | null
          title: string
          updated_at: string | null
          uploaded_by: string
        }
        Insert: {
          category: Database["public"]["Enums"]["document_category"]
          created_at?: string | null
          description?: string | null
          employee_id?: string | null
          file_name?: string | null
          file_path?: string | null
          file_size?: number | null
          file_type?: string | null
          id?: string
          is_shared?: boolean | null
          requires_signature?: boolean | null
          signed_at?: string | null
          signed_by?: string | null
          status?: Database["public"]["Enums"]["document_status"] | null
          title: string
          updated_at?: string | null
          uploaded_by: string
        }
        Update: {
          category?: Database["public"]["Enums"]["document_category"]
          created_at?: string | null
          description?: string | null
          employee_id?: string | null
          file_name?: string | null
          file_path?: string | null
          file_size?: number | null
          file_type?: string | null
          id?: string
          is_shared?: boolean | null
          requires_signature?: boolean | null
          signed_at?: string | null
          signed_by?: string | null
          status?: Database["public"]["Enums"]["document_status"] | null
          title?: string
          updated_at?: string | null
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_signed_by_fkey"
            columns: ["signed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          address: string | null
          certifications: Json | null
          contract_type: string | null
          created_at: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          emergency_contact_relationship: string | null
          employee_number: string
          id: string
          position: string
          profile_id: string
          qualifications: Json | null
          salary_grade: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          certifications?: Json | null
          contract_type?: string | null
          created_at?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          employee_number: string
          id?: string
          position: string
          profile_id: string
          qualifications?: Json | null
          salary_grade?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          certifications?: Json | null
          contract_type?: string | null
          created_at?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          employee_number?: string
          id?: string
          position?: string
          profile_id?: string
          qualifications?: Json | null
          salary_grade?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employees_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      interview_records: {
        Row: {
          candidate_email: string | null
          candidate_name: string
          created_at: string | null
          id: string
          interview_date: string
          interview_type: string | null
          interviewer_id: string
          notes: string | null
          position: string
          rating: number | null
          recommendation: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          candidate_email?: string | null
          candidate_name: string
          created_at?: string | null
          id?: string
          interview_date: string
          interview_type?: string | null
          interviewer_id: string
          notes?: string | null
          position: string
          rating?: number | null
          recommendation?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          candidate_email?: string | null
          candidate_name?: string
          created_at?: string | null
          id?: string
          interview_date?: string
          interview_type?: string | null
          interviewer_id?: string
          notes?: string | null
          position?: string
          rating?: number | null
          recommendation?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "interview_records_interviewer_id_fkey"
            columns: ["interviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      leave_requests: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          comments: string | null
          created_at: string | null
          days_requested: number
          employee_id: string
          end_date: string
          id: string
          leave_type: string
          reason: string | null
          start_date: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          comments?: string | null
          created_at?: string | null
          days_requested: number
          employee_id: string
          end_date: string
          id?: string
          leave_type: string
          reason?: string | null
          start_date: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          comments?: string | null
          created_at?: string | null
          days_requested?: number
          employee_id?: string
          end_date?: string
          id?: string
          leave_type?: string
          reason?: string | null
          start_date?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leave_requests_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_requests_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          department: string | null
          email: string
          employee_id: string | null
          first_name: string | null
          hire_date: string | null
          id: string
          is_active: boolean | null
          last_name: string | null
          phone: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          department?: string | null
          email: string
          employee_id?: string | null
          first_name?: string | null
          hire_date?: string | null
          id: string
          is_active?: boolean | null
          last_name?: string | null
          phone?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          department?: string | null
          email?: string
          employee_id?: string | null
          first_name?: string | null
          hire_date?: string | null
          id?: string
          is_active?: boolean | null
          last_name?: string | null
          phone?: string | null
          role?: string | null
          updated_at?: string | null
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
      document_category:
        | "employment_records"
        | "disciplinary_records"
        | "performance_records"
        | "leave_requests"
        | "interview_records"
        | "shared_documents"
      document_status:
        | "draft"
        | "pending_review"
        | "approved"
        | "rejected"
        | "signed"
        | "archived"
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
      document_category: [
        "employment_records",
        "disciplinary_records",
        "performance_records",
        "leave_requests",
        "interview_records",
        "shared_documents",
      ],
      document_status: [
        "draft",
        "pending_review",
        "approved",
        "rejected",
        "signed",
        "archived",
      ],
    },
  },
} as const
