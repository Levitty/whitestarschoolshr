export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      contract_reminders: {
        Row: {
          created_at: string | null
          employee_id: string | null
          id: string
          reminder_date: string
          reminder_type: string
          sent_at: string | null
        }
        Insert: {
          created_at?: string | null
          employee_id?: string | null
          id?: string
          reminder_date: string
          reminder_type: string
          sent_at?: string | null
        }
        Update: {
          created_at?: string | null
          employee_id?: string | null
          id?: string
          reminder_date?: string
          reminder_type?: string
          sent_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contract_reminders_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employee_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      document_shares: {
        Row: {
          created_at: string | null
          document_id: string | null
          expires_at: string | null
          id: string
          permission_type: string | null
          shared_by: string | null
          shared_with: string | null
        }
        Insert: {
          created_at?: string | null
          document_id?: string | null
          expires_at?: string | null
          id?: string
          permission_type?: string | null
          shared_by?: string | null
          shared_with?: string | null
        }
        Update: {
          created_at?: string | null
          document_id?: string | null
          expires_at?: string | null
          id?: string
          permission_type?: string | null
          shared_by?: string | null
          shared_with?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_shares_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_shares_shared_by_fkey"
            columns: ["shared_by"]
            isOneToOne: false
            referencedRelation: "employee_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_shares_shared_with_fkey"
            columns: ["shared_with"]
            isOneToOne: false
            referencedRelation: "employee_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
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
      document_templates: {
        Row: {
          content: string
          created_at: string | null
          created_by: string
          id: string
          is_active: boolean | null
          name: string
          template_type: string
          updated_at: string | null
          variables: Json | null
        }
        Insert: {
          content: string
          created_at?: string | null
          created_by: string
          id?: string
          is_active?: boolean | null
          name: string
          template_type: string
          updated_at?: string | null
          variables?: Json | null
        }
        Update: {
          content?: string
          created_at?: string | null
          created_by?: string
          id?: string
          is_active?: boolean | null
          name?: string
          template_type?: string
          updated_at?: string | null
          variables?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "document_templates_created_by_fkey"
            columns: ["created_by"]
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
          is_system_generated: boolean | null
          letter_content: string | null
          letter_type: string | null
          recipient_id: string | null
          requires_signature: boolean | null
          signed_at: string | null
          signed_by: string | null
          source: string | null
          status: Database["public"]["Enums"]["document_status"] | null
          template_id: string | null
          template_type: string | null
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
          is_system_generated?: boolean | null
          letter_content?: string | null
          letter_type?: string | null
          recipient_id?: string | null
          requires_signature?: boolean | null
          signed_at?: string | null
          signed_by?: string | null
          source?: string | null
          status?: Database["public"]["Enums"]["document_status"] | null
          template_id?: string | null
          template_type?: string | null
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
          is_system_generated?: boolean | null
          letter_content?: string | null
          letter_type?: string | null
          recipient_id?: string | null
          requires_signature?: boolean | null
          signed_at?: string | null
          signed_by?: string | null
          source?: string | null
          status?: Database["public"]["Enums"]["document_status"] | null
          template_id?: string | null
          template_type?: string | null
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
            foreignKeyName: "documents_recipient_id_fkey"
            columns: ["recipient_id"]
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
            foreignKeyName: "documents_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "letter_templates"
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
      employee_profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          contract_duration_months: number | null
          contract_end_date: string | null
          contract_reminder_sent: boolean | null
          contract_start_date: string | null
          contract_type: string | null
          created_at: string | null
          department: string
          email: string
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          emergency_contact_relationship: string | null
          employee_number: string
          first_name: string
          hire_date: string
          id: string
          last_name: string
          phone: string | null
          position: string
          profile_id: string | null
          salary: number | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          contract_duration_months?: number | null
          contract_end_date?: string | null
          contract_reminder_sent?: boolean | null
          contract_start_date?: string | null
          contract_type?: string | null
          created_at?: string | null
          department: string
          email: string
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          employee_number: string
          first_name: string
          hire_date: string
          id?: string
          last_name: string
          phone?: string | null
          position: string
          profile_id?: string | null
          salary?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          contract_duration_months?: number | null
          contract_end_date?: string | null
          contract_reminder_sent?: boolean | null
          contract_start_date?: string | null
          contract_type?: string | null
          created_at?: string | null
          department?: string
          email?: string
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          employee_number?: string
          first_name?: string
          hire_date?: string
          id?: string
          last_name?: string
          phone?: string | null
          position?: string
          profile_id?: string | null
          salary?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_profiles_profile_id_fkey"
            columns: ["profile_id"]
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
      interviews: {
        Row: {
          application_id: string | null
          created_at: string | null
          feedback: string | null
          id: string
          interview_date: string
          interview_type: string
          interviewer_name: string
          status: string
          updated_at: string | null
        }
        Insert: {
          application_id?: string | null
          created_at?: string | null
          feedback?: string | null
          id?: string
          interview_date: string
          interview_type: string
          interviewer_name: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          application_id?: string | null
          created_at?: string | null
          feedback?: string | null
          id?: string
          interview_date?: string
          interview_type?: string
          interviewer_name?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "interviews_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "job_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      job_applications: {
        Row: {
          applied_at: string | null
          candidate_email: string
          candidate_name: string
          cv_url: string | null
          id: string
          job_id: string | null
          note: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          applied_at?: string | null
          candidate_email: string
          candidate_name: string
          cv_url?: string | null
          id?: string
          job_id?: string | null
          note?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          applied_at?: string | null
          candidate_email?: string
          candidate_name?: string
          cv_url?: string | null
          id?: string
          job_id?: string | null
          note?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      job_listings: {
        Row: {
          created_at: string | null
          department: string
          description: string
          employment_type: string
          id: string
          location: string
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          department: string
          description: string
          employment_type: string
          id?: string
          location: string
          status?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          department?: string
          description?: string
          employment_type?: string
          id?: string
          location?: string
          status?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      leave_balances: {
        Row: {
          annual_leave_total: number | null
          annual_leave_used: number | null
          created_at: string | null
          employee_id: string | null
          id: string
          personal_leave_total: number | null
          personal_leave_used: number | null
          sick_leave_total: number | null
          sick_leave_used: number | null
          updated_at: string | null
          year: number
        }
        Insert: {
          annual_leave_total?: number | null
          annual_leave_used?: number | null
          created_at?: string | null
          employee_id?: string | null
          id?: string
          personal_leave_total?: number | null
          personal_leave_used?: number | null
          sick_leave_total?: number | null
          sick_leave_used?: number | null
          updated_at?: string | null
          year: number
        }
        Update: {
          annual_leave_total?: number | null
          annual_leave_used?: number | null
          created_at?: string | null
          employee_id?: string | null
          id?: string
          personal_leave_total?: number | null
          personal_leave_used?: number | null
          sick_leave_total?: number | null
          sick_leave_used?: number | null
          updated_at?: string | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "leave_balances_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employee_profiles"
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
          decision_at: string | null
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
          decision_at?: string | null
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
          decision_at?: string | null
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
      letter_templates: {
        Row: {
          body: string
          category: string
          created_at: string | null
          created_by: string
          id: string
          is_active: boolean | null
          placeholders: Json | null
          title: string
          updated_at: string | null
        }
        Insert: {
          body: string
          category: string
          created_at?: string | null
          created_by: string
          id?: string
          is_active?: boolean | null
          placeholders?: Json | null
          title: string
          updated_at?: string | null
        }
        Update: {
          body?: string
          category?: string
          created_at?: string | null
          created_by?: string
          id?: string
          is_active?: boolean | null
          placeholders?: Json | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      letterhead_settings: {
        Row: {
          address: string | null
          company_name: string | null
          created_at: string | null
          created_by: string
          email: string | null
          header_image_url: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          phone: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          company_name?: string | null
          created_at?: string | null
          created_by: string
          email?: string | null
          header_image_url?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          phone?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          company_name?: string | null
          created_at?: string | null
          created_by?: string
          email?: string | null
          header_image_url?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          phone?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          related_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          related_id?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          related_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
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
          status: string | null
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
          status?: string | null
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
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      recruitment_assessments: {
        Row: {
          answers: Json | null
          assessment_type: string
          candidate_email: string
          candidate_name: string
          completed_at: string | null
          created_at: string | null
          created_by: string
          evaluated_by: string | null
          id: string
          max_score: number | null
          position: string
          questions: Json | null
          score: number | null
          started_at: string | null
          status: string | null
          time_limit: number | null
          updated_at: string | null
        }
        Insert: {
          answers?: Json | null
          assessment_type: string
          candidate_email: string
          candidate_name: string
          completed_at?: string | null
          created_at?: string | null
          created_by: string
          evaluated_by?: string | null
          id?: string
          max_score?: number | null
          position: string
          questions?: Json | null
          score?: number | null
          started_at?: string | null
          status?: string | null
          time_limit?: number | null
          updated_at?: string | null
        }
        Update: {
          answers?: Json | null
          assessment_type?: string
          candidate_email?: string
          candidate_name?: string
          completed_at?: string | null
          created_at?: string | null
          created_by?: string
          evaluated_by?: string | null
          id?: string
          max_score?: number | null
          position?: string
          questions?: Json | null
          score?: number | null
          started_at?: string | null
          status?: string | null
          time_limit?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recruitment_assessments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recruitment_assessments_evaluated_by_fkey"
            columns: ["evaluated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tickets: {
        Row: {
          assigned_to: string | null
          category: string
          created_at: string | null
          description: string
          employee_id: string | null
          id: string
          priority: string | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          category: string
          created_at?: string | null
          description: string
          employee_id?: string | null
          id?: string
          priority?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          category?: string
          created_at?: string | null
          description?: string
          employee_id?: string | null
          id?: string
          priority?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tickets_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "employee_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employee_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      weekly_reports: {
        Row: {
          accomplishments: string
          challenges: string | null
          created_at: string | null
          employee_id: string | null
          hours_worked: number | null
          id: string
          next_week_goals: string | null
          status: string | null
          submitted_at: string | null
          updated_at: string | null
          week_end_date: string
          week_start_date: string
        }
        Insert: {
          accomplishments: string
          challenges?: string | null
          created_at?: string | null
          employee_id?: string | null
          hours_worked?: number | null
          id?: string
          next_week_goals?: string | null
          status?: string | null
          submitted_at?: string | null
          updated_at?: string | null
          week_end_date: string
          week_start_date: string
        }
        Update: {
          accomplishments?: string
          challenges?: string | null
          created_at?: string | null
          employee_id?: string | null
          hours_worked?: number | null
          id?: string
          next_week_goals?: string | null
          status?: string | null
          submitted_at?: string | null
          updated_at?: string | null
          week_end_date?: string
          week_start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "weekly_reports_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employee_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_expiring_contracts: {
        Args: Record<PropertyKey, never>
        Returns: {
          employee_id: string
          employee_name: string
          contract_end_date: string
          days_until_expiry: number
        }[]
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
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
