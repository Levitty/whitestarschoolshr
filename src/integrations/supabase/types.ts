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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      asset_assignments: {
        Row: {
          asset_id: string
          assigned_date: string
          condition_on_assign: string | null
          condition_on_return: string | null
          created_at: string | null
          created_by: string | null
          employee_id: string
          id: string
          notes: string | null
          returned_date: string | null
          tenant_id: string
        }
        Insert: {
          asset_id: string
          assigned_date: string
          condition_on_assign?: string | null
          condition_on_return?: string | null
          created_at?: string | null
          created_by?: string | null
          employee_id: string
          id?: string
          notes?: string | null
          returned_date?: string | null
          tenant_id: string
        }
        Update: {
          asset_id?: string
          assigned_date?: string
          condition_on_assign?: string | null
          condition_on_return?: string | null
          created_at?: string | null
          created_by?: string | null
          employee_id?: string
          id?: string
          notes?: string | null
          returned_date?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "asset_assignments_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "company_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asset_assignments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asset_assignments_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asset_assignments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      athlete_intents: {
        Row: {
          age: number
          created_at: string
          disciplines: string[]
          email: string
          first_name: string
          gender: string
          goals: string
          id: string
          last_name: string
          phone: string
          updated_at: string
        }
        Insert: {
          age: number
          created_at?: string
          disciplines?: string[]
          email: string
          first_name: string
          gender: string
          goals: string
          id?: string
          last_name: string
          phone: string
          updated_at?: string
        }
        Update: {
          age?: number
          created_at?: string
          disciplines?: string[]
          email?: string
          first_name?: string
          gender?: string
          goals?: string
          id?: string
          last_name?: string
          phone?: string
          updated_at?: string
        }
        Relationships: []
      }
      audits: {
        Row: {
          action: string
          created_at: string | null
          id: string
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          table_name: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      branches: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "branches_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      clearance_approvals: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          clearance_id: string
          created_at: string | null
          department: string
          id: string
          notes: string | null
          rejection_reason: string | null
          status: string
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          clearance_id: string
          created_at?: string | null
          department: string
          id?: string
          notes?: string | null
          rejection_reason?: string | null
          status?: string
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          clearance_id?: string
          created_at?: string | null
          department?: string
          id?: string
          notes?: string | null
          rejection_reason?: string | null
          status?: string
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clearance_approvals_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clearance_approvals_clearance_id_fkey"
            columns: ["clearance_id"]
            isOneToOne: false
            referencedRelation: "offboarding_clearance"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clearance_approvals_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      clearance_deductions: {
        Row: {
          amount: number
          asset_id: string | null
          clearance_id: string
          created_at: string | null
          created_by: string | null
          deduction_type: string
          description: string
          id: string
          tenant_id: string
        }
        Insert: {
          amount: number
          asset_id?: string | null
          clearance_id: string
          created_at?: string | null
          created_by?: string | null
          deduction_type: string
          description: string
          id?: string
          tenant_id: string
        }
        Update: {
          amount?: number
          asset_id?: string | null
          clearance_id?: string
          created_at?: string | null
          created_by?: string | null
          deduction_type?: string
          description?: string
          id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clearance_deductions_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "company_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clearance_deductions_clearance_id_fkey"
            columns: ["clearance_id"]
            isOneToOne: false
            referencedRelation: "offboarding_clearance"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clearance_deductions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clearance_deductions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      clearance_items: {
        Row: {
          clearance_id: string
          completed_at: string | null
          completed_by: string | null
          created_at: string
          department: string
          id: string
          is_completed: boolean
          item_name: string
        }
        Insert: {
          clearance_id: string
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          department: string
          id?: string
          is_completed?: boolean
          item_name: string
        }
        Update: {
          clearance_id?: string
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          department?: string
          id?: string
          is_completed?: boolean
          item_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "clearance_items_clearance_id_fkey"
            columns: ["clearance_id"]
            isOneToOne: false
            referencedRelation: "offboarding_clearance"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clearance_items_completed_by_fkey"
            columns: ["completed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      company_assets: {
        Row: {
          asset_name: string
          asset_tag: string
          asset_type: string
          assigned_date: string | null
          assigned_to: string | null
          created_at: string | null
          current_value: number
          id: string
          notes: string | null
          photo_url: string | null
          purchase_date: string | null
          purchase_value: number
          serial_number: string | null
          status: string | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          asset_name: string
          asset_tag: string
          asset_type: string
          assigned_date?: string | null
          assigned_to?: string | null
          created_at?: string | null
          current_value: number
          id?: string
          notes?: string | null
          photo_url?: string | null
          purchase_date?: string | null
          purchase_value: number
          serial_number?: string | null
          status?: string | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          asset_name?: string
          asset_tag?: string
          asset_type?: string
          assigned_date?: string | null
          assigned_to?: string | null
          created_at?: string | null
          current_value?: number
          id?: string
          notes?: string | null
          photo_url?: string | null
          purchase_date?: string | null
          purchase_value?: number
          serial_number?: string | null
          status?: string | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_assets_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_assets_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
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
      corporate_evaluations: {
        Row: {
          communication: number | null
          communication_comments: string | null
          created_at: string
          employee_id: string
          evaluation_type: string
          evaluator_id: string
          goals: string | null
          id: string
          improvement_areas: string | null
          overall_rating: number | null
          period: string
          productivity: number | null
          productivity_comments: string | null
          quality_of_work: number | null
          quality_of_work_comments: string | null
          status: string
          strengths: string | null
          teamwork: number | null
          teamwork_comments: string | null
          technical_skills: number | null
          technical_skills_comments: string | null
          tenant_id: string | null
          updated_at: string
        }
        Insert: {
          communication?: number | null
          communication_comments?: string | null
          created_at?: string
          employee_id: string
          evaluation_type: string
          evaluator_id: string
          goals?: string | null
          id?: string
          improvement_areas?: string | null
          overall_rating?: number | null
          period: string
          productivity?: number | null
          productivity_comments?: string | null
          quality_of_work?: number | null
          quality_of_work_comments?: string | null
          status?: string
          strengths?: string | null
          teamwork?: number | null
          teamwork_comments?: string | null
          technical_skills?: number | null
          technical_skills_comments?: string | null
          tenant_id?: string | null
          updated_at?: string
        }
        Update: {
          communication?: number | null
          communication_comments?: string | null
          created_at?: string
          employee_id?: string
          evaluation_type?: string
          evaluator_id?: string
          goals?: string | null
          id?: string
          improvement_areas?: string | null
          overall_rating?: number | null
          period?: string
          productivity?: number | null
          productivity_comments?: string | null
          quality_of_work?: number | null
          quality_of_work_comments?: string | null
          status?: string
          strengths?: string | null
          teamwork?: number | null
          teamwork_comments?: string | null
          technical_skills?: number | null
          technical_skills_comments?: string | null
          tenant_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "corporate_evaluations_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employee_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "corporate_evaluations_evaluator_id_fkey"
            columns: ["evaluator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "corporate_evaluations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          tenant_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          tenant_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          tenant_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "departments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
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
          ip_address: unknown
          signature_data: string | null
          signed_at: string | null
          signer_id: string
        }
        Insert: {
          document_id: string
          id?: string
          ip_address?: unknown
          signature_data?: string | null
          signed_at?: string | null
          signer_id: string
        }
        Update: {
          document_id?: string
          id?: string
          ip_address?: unknown
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
          tenant_id: string | null
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
          tenant_id?: string | null
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
          tenant_id?: string | null
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
          {
            foreignKeyName: "document_templates_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
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
          employee_number: string | null
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
          tenant_id: string | null
          title: string
          updated_at: string | null
          uploaded_by: string
        }
        Insert: {
          category: Database["public"]["Enums"]["document_category"]
          created_at?: string | null
          description?: string | null
          employee_id?: string | null
          employee_number?: string | null
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
          tenant_id?: string | null
          title: string
          updated_at?: string | null
          uploaded_by: string
        }
        Update: {
          category?: Database["public"]["Enums"]["document_category"]
          created_at?: string | null
          description?: string | null
          employee_id?: string | null
          employee_number?: string | null
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
          tenant_id?: string | null
          title?: string
          updated_at?: string | null
          uploaded_by?: string
        }
        Relationships: [
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
            foreignKeyName: "documents_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
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
          branch: string | null
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
          tenant_id: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          branch?: string | null
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
          tenant_id?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          branch?: string | null
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
          tenant_id?: string | null
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
          {
            foreignKeyName: "employee_profiles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_sales_targets: {
        Row: {
          commission_rate: number
          created_at: string
          current_mtd_sales: number | null
          employee_id: string
          id: string
          monthly_target: number
          tenant_id: string | null
          updated_at: string
        }
        Insert: {
          commission_rate?: number
          created_at?: string
          current_mtd_sales?: number | null
          employee_id: string
          id?: string
          monthly_target?: number
          tenant_id?: string | null
          updated_at?: string
        }
        Update: {
          commission_rate?: number
          created_at?: string
          current_mtd_sales?: number | null
          employee_id?: string
          id?: string
          monthly_target?: number
          tenant_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_sales_targets_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: true
            referencedRelation: "employee_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_sales_targets_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
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
      evaluations: {
        Row: {
          academic_comments: string | null
          academic_initiatives: number | null
          academic_slow_learners: number | null
          academic_student_performance: number | null
          academic_teaching_strategies: number | null
          academic_total: number | null
          branch: string
          created_at: string | null
          culture_collaboration: number | null
          culture_comments: string | null
          culture_diversity: number | null
          culture_extracurricular: number | null
          culture_mission_support: number | null
          culture_total: number | null
          customer_comments: string | null
          customer_communication: number | null
          customer_conflict_resolution: number | null
          customer_feedback: number | null
          customer_responsiveness: number | null
          customer_total: number | null
          development_comments: string | null
          development_education: number | null
          development_mentoring: number | null
          development_methodologies: number | null
          development_total: number | null
          development_workshops: number | null
          employee_id: string
          evaluator_id: string
          id: string
          overall_rating: number | null
          period: string
          status: string | null
          tenant_id: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          academic_comments?: string | null
          academic_initiatives?: number | null
          academic_slow_learners?: number | null
          academic_student_performance?: number | null
          academic_teaching_strategies?: number | null
          academic_total?: number | null
          branch: string
          created_at?: string | null
          culture_collaboration?: number | null
          culture_comments?: string | null
          culture_diversity?: number | null
          culture_extracurricular?: number | null
          culture_mission_support?: number | null
          culture_total?: number | null
          customer_comments?: string | null
          customer_communication?: number | null
          customer_conflict_resolution?: number | null
          customer_feedback?: number | null
          customer_responsiveness?: number | null
          customer_total?: number | null
          development_comments?: string | null
          development_education?: number | null
          development_mentoring?: number | null
          development_methodologies?: number | null
          development_total?: number | null
          development_workshops?: number | null
          employee_id: string
          evaluator_id: string
          id?: string
          overall_rating?: number | null
          period: string
          status?: string | null
          tenant_id?: string | null
          type?: string
          updated_at?: string | null
        }
        Update: {
          academic_comments?: string | null
          academic_initiatives?: number | null
          academic_slow_learners?: number | null
          academic_student_performance?: number | null
          academic_teaching_strategies?: number | null
          academic_total?: number | null
          branch?: string
          created_at?: string | null
          culture_collaboration?: number | null
          culture_comments?: string | null
          culture_diversity?: number | null
          culture_extracurricular?: number | null
          culture_mission_support?: number | null
          culture_total?: number | null
          customer_comments?: string | null
          customer_communication?: number | null
          customer_conflict_resolution?: number | null
          customer_feedback?: number | null
          customer_responsiveness?: number | null
          customer_total?: number | null
          development_comments?: string | null
          development_education?: number | null
          development_mentoring?: number | null
          development_methodologies?: number | null
          development_total?: number | null
          development_workshops?: number | null
          employee_id?: string
          evaluator_id?: string
          id?: string
          overall_rating?: number | null
          period?: string
          status?: string | null
          tenant_id?: string | null
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "evaluations_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employee_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluations_evaluator_id_fkey"
            columns: ["evaluator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string
          description: string | null
          event_date: string
          event_type: string
          id: string
          location: string
          max_participants: number | null
          name: string
          price: number
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          event_date: string
          event_type?: string
          id?: string
          location: string
          max_participants?: number | null
          name: string
          price?: number
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          event_date?: string
          event_type?: string
          id?: string
          location?: string
          max_participants?: number | null
          name?: string
          price?: number
          status?: string
          updated_at?: string
        }
        Relationships: []
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
          tenant_id: string | null
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
          tenant_id?: string | null
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
          tenant_id?: string | null
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
          {
            foreignKeyName: "interview_records_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
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
          tenant_id: string | null
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
          tenant_id?: string | null
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
          tenant_id?: string | null
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
          {
            foreignKeyName: "interviews_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
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
          phone_number: string | null
          status: string
          tenant_id: string | null
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
          phone_number?: string | null
          status?: string
          tenant_id?: string | null
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
          phone_number?: string | null
          status?: string
          tenant_id?: string | null
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
          {
            foreignKeyName: "job_applications_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
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
          requirements: string | null
          status: string
          tenant_id: string | null
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
          requirements?: string | null
          status?: string
          tenant_id?: string | null
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
          requirements?: string | null
          status?: string
          tenant_id?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_listings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      leave_balances: {
        Row: {
          annual_leave_total: number | null
          annual_leave_used: number | null
          created_at: string | null
          employee_id: string | null
          id: string
          maternity_leave_total: number | null
          maternity_leave_used: number | null
          sick_leave_total: number | null
          sick_leave_used: number | null
          study_leave_total: number | null
          study_leave_used: number | null
          tenant_id: string | null
          unpaid_leave_total: number | null
          unpaid_leave_used: number | null
          updated_at: string | null
          year: number
        }
        Insert: {
          annual_leave_total?: number | null
          annual_leave_used?: number | null
          created_at?: string | null
          employee_id?: string | null
          id?: string
          maternity_leave_total?: number | null
          maternity_leave_used?: number | null
          sick_leave_total?: number | null
          sick_leave_used?: number | null
          study_leave_total?: number | null
          study_leave_used?: number | null
          tenant_id?: string | null
          unpaid_leave_total?: number | null
          unpaid_leave_used?: number | null
          updated_at?: string | null
          year: number
        }
        Update: {
          annual_leave_total?: number | null
          annual_leave_used?: number | null
          created_at?: string | null
          employee_id?: string | null
          id?: string
          maternity_leave_total?: number | null
          maternity_leave_used?: number | null
          sick_leave_total?: number | null
          sick_leave_used?: number | null
          study_leave_total?: number | null
          study_leave_used?: number | null
          tenant_id?: string | null
          unpaid_leave_total?: number | null
          unpaid_leave_used?: number | null
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
          {
            foreignKeyName: "leave_balances_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
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
          head_internal_notes: string | null
          head_recommendation: string | null
          head_reviewed_at: string | null
          head_reviewed_by: string | null
          id: string
          leave_type: string
          proof_file_name: string | null
          proof_url: string | null
          reason: string | null
          start_date: string
          status: string | null
          tenant_id: string | null
          updated_at: string | null
          workflow_stage: string | null
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
          head_internal_notes?: string | null
          head_recommendation?: string | null
          head_reviewed_at?: string | null
          head_reviewed_by?: string | null
          id?: string
          leave_type: string
          proof_file_name?: string | null
          proof_url?: string | null
          reason?: string | null
          start_date: string
          status?: string | null
          tenant_id?: string | null
          updated_at?: string | null
          workflow_stage?: string | null
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
          head_internal_notes?: string | null
          head_recommendation?: string | null
          head_reviewed_at?: string | null
          head_reviewed_by?: string | null
          id?: string
          leave_type?: string
          proof_file_name?: string | null
          proof_url?: string | null
          reason?: string | null
          start_date?: string
          status?: string | null
          tenant_id?: string | null
          updated_at?: string | null
          workflow_stage?: string | null
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
          {
            foreignKeyName: "leave_requests_head_reviewed_by_fkey"
            columns: ["head_reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_requests_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      leave_settings: {
        Row: {
          annual_leave_total: number | null
          created_at: string | null
          id: string
          maternity_leave_total: number | null
          sick_leave_total: number | null
          study_leave_total: number | null
          unpaid_leave_total: number | null
          updated_at: string | null
          year: number
        }
        Insert: {
          annual_leave_total?: number | null
          created_at?: string | null
          id?: string
          maternity_leave_total?: number | null
          sick_leave_total?: number | null
          study_leave_total?: number | null
          unpaid_leave_total?: number | null
          updated_at?: string | null
          year: number
        }
        Update: {
          annual_leave_total?: number | null
          created_at?: string | null
          id?: string
          maternity_leave_total?: number | null
          sick_leave_total?: number | null
          study_leave_total?: number | null
          unpaid_leave_total?: number | null
          updated_at?: string | null
          year?: number
        }
        Relationships: []
      }
      letter_categories: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          tenant_id: string | null
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          tenant_id?: string | null
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          tenant_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "letter_categories_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
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
          tenant_id: string | null
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
          tenant_id?: string | null
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
          tenant_id?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "letter_templates_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
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
          tenant_id: string | null
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
          tenant_id?: string | null
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
          tenant_id?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "letterhead_settings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      login_attempts: {
        Row: {
          created_at: string | null
          email: string
          error_message: string | null
          error_type: string | null
          id: string
          success: boolean
          tenant_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          error_message?: string | null
          error_type?: string | null
          id?: string
          success?: boolean
          tenant_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          error_message?: string | null
          error_type?: string | null
          id?: string
          success?: boolean
          tenant_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "login_attempts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      media: {
        Row: {
          created_at: string
          description: string | null
          file_size: number | null
          id: string
          media_type: string
          media_url: string
          title: string
          updated_at: string
          uploaded_by: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          file_size?: number | null
          id?: string
          media_type: string
          media_url: string
          title: string
          updated_at?: string
          uploaded_by: string
        }
        Update: {
          created_at?: string
          description?: string | null
          file_size?: number | null
          id?: string
          media_type?: string
          media_url?: string
          title?: string
          updated_at?: string
          uploaded_by?: string
        }
        Relationships: []
      }
      merch_designs: {
        Row: {
          created_at: string
          description: string | null
          fabric: string | null
          id: string
          image_url: string
          image_urls: string[] | null
          is_active: boolean
          name: string
          price_modifier: number
          sort_order: number
          style: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          fabric?: string | null
          id?: string
          image_url: string
          image_urls?: string[] | null
          is_active?: boolean
          name: string
          price_modifier?: number
          sort_order?: number
          style?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          fabric?: string | null
          id?: string
          image_url?: string
          image_urls?: string[] | null
          is_active?: boolean
          name?: string
          price_modifier?: number
          sort_order?: number
          style?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      merch_garments: {
        Row: {
          available_colors: Json
          available_sizes: Json
          base_price: number
          created_at: string
          description: string | null
          fabric: string | null
          id: string
          is_active: boolean
          name: string
          preview_image_url: string | null
          sort_order: number
          style: string | null
          updated_at: string
        }
        Insert: {
          available_colors?: Json
          available_sizes?: Json
          base_price?: number
          created_at?: string
          description?: string | null
          fabric?: string | null
          id?: string
          is_active?: boolean
          name: string
          preview_image_url?: string | null
          sort_order?: number
          style?: string | null
          updated_at?: string
        }
        Update: {
          available_colors?: Json
          available_sizes?: Json
          base_price?: number
          created_at?: string
          description?: string | null
          fabric?: string | null
          id?: string
          is_active?: boolean
          name?: string
          preview_image_url?: string | null
          sort_order?: number
          style?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      merch_order_items: {
        Row: {
          color: string
          created_at: string
          design_id: string
          garment_id: string
          id: string
          order_id: string
          quantity: number
          size: string
          unit_price: number
        }
        Insert: {
          color: string
          created_at?: string
          design_id: string
          garment_id: string
          id?: string
          order_id: string
          quantity?: number
          size: string
          unit_price: number
        }
        Update: {
          color?: string
          created_at?: string
          design_id?: string
          garment_id?: string
          id?: string
          order_id?: string
          quantity?: number
          size?: string
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "merch_order_items_design_id_fkey"
            columns: ["design_id"]
            isOneToOne: false
            referencedRelation: "merch_designs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "merch_order_items_garment_id_fkey"
            columns: ["garment_id"]
            isOneToOne: false
            referencedRelation: "merch_garments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "merch_order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "merch_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      merch_orders: {
        Row: {
          created_at: string
          customer_email: string
          customer_name: string
          customer_phone: string
          id: string
          order_status: string
          payment_reference: string | null
          payment_status: string
          total_amount: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_email: string
          customer_name: string
          customer_phone: string
          id?: string
          order_status?: string
          payment_reference?: string | null
          payment_status?: string
          total_amount?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_email?: string
          customer_name?: string
          customer_phone?: string
          id?: string
          order_status?: string
          payment_reference?: string | null
          payment_status?: string
          total_amount?: number
          updated_at?: string
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
          tenant_id: string | null
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
          tenant_id?: string | null
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
          tenant_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      offboarding_clearance: {
        Row: {
          completed_at: string | null
          created_at: string
          employee_id: string
          final_settlement_amount: number | null
          id: string
          initiated_at: string
          leave_balance_payout: number | null
          outstanding_salary: number | null
          settlement_approved_at: string | null
          settlement_approved_by: string | null
          settlement_status: string | null
          status: string
          tenant_id: string | null
          total_deductions: number | null
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          employee_id: string
          final_settlement_amount?: number | null
          id?: string
          initiated_at?: string
          leave_balance_payout?: number | null
          outstanding_salary?: number | null
          settlement_approved_at?: string | null
          settlement_approved_by?: string | null
          settlement_status?: string | null
          status?: string
          tenant_id?: string | null
          total_deductions?: number | null
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          employee_id?: string
          final_settlement_amount?: number | null
          id?: string
          initiated_at?: string
          leave_balance_payout?: number | null
          outstanding_salary?: number | null
          settlement_approved_at?: string | null
          settlement_approved_by?: string | null
          settlement_status?: string | null
          status?: string
          tenant_id?: string | null
          total_deductions?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "offboarding_clearance_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: true
            referencedRelation: "employee_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offboarding_clearance_settlement_approved_by_fkey"
            columns: ["settlement_approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offboarding_clearance_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      performance_improvement_plans: {
        Row: {
          area_of_deficiency: string
          check_in_date: string
          created_at: string
          created_by: string | null
          employee_id: string
          expected_outcome: string
          id: string
          notes: string | null
          review_date: string
          start_date: string
          status: string
          supporting_data: Json | null
          tenant_id: string | null
          updated_at: string
        }
        Insert: {
          area_of_deficiency: string
          check_in_date: string
          created_at?: string
          created_by?: string | null
          employee_id: string
          expected_outcome: string
          id?: string
          notes?: string | null
          review_date: string
          start_date?: string
          status?: string
          supporting_data?: Json | null
          tenant_id?: string | null
          updated_at?: string
        }
        Update: {
          area_of_deficiency?: string
          check_in_date?: string
          created_at?: string
          created_by?: string | null
          employee_id?: string
          expected_outcome?: string
          id?: string
          notes?: string | null
          review_date?: string
          start_date?: string
          status?: string
          supporting_data?: Json | null
          tenant_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "performance_improvement_plans_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "performance_improvement_plans_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employee_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "performance_improvement_plans_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      permissions: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          module: string | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          module?: string | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          module?: string | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          birth_date: string | null
          branch: string | null
          created_at: string | null
          department: string | null
          email: string
          employee_id: string | null
          first_name: string | null
          gender: string | null
          hire_date: string | null
          id: string
          id_number: string | null
          is_active: boolean | null
          kra_pin: string | null
          last_name: string | null
          next_of_kin_name: string | null
          next_of_kin_phone: string | null
          next_of_kin_relationship: string | null
          nssf_number: string | null
          onboarding_completed: boolean | null
          phone: string | null
          physical_address: string | null
          role: string | null
          role_id: string | null
          sha_number: string | null
          status: string | null
          tenant_id: string | null
          tsc_number: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          birth_date?: string | null
          branch?: string | null
          created_at?: string | null
          department?: string | null
          email: string
          employee_id?: string | null
          first_name?: string | null
          gender?: string | null
          hire_date?: string | null
          id: string
          id_number?: string | null
          is_active?: boolean | null
          kra_pin?: string | null
          last_name?: string | null
          next_of_kin_name?: string | null
          next_of_kin_phone?: string | null
          next_of_kin_relationship?: string | null
          nssf_number?: string | null
          onboarding_completed?: boolean | null
          phone?: string | null
          physical_address?: string | null
          role?: string | null
          role_id?: string | null
          sha_number?: string | null
          status?: string | null
          tenant_id?: string | null
          tsc_number?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          birth_date?: string | null
          branch?: string | null
          created_at?: string | null
          department?: string | null
          email?: string
          employee_id?: string | null
          first_name?: string | null
          gender?: string | null
          hire_date?: string | null
          id?: string
          id_number?: string | null
          is_active?: boolean | null
          kra_pin?: string | null
          last_name?: string | null
          next_of_kin_name?: string | null
          next_of_kin_phone?: string | null
          next_of_kin_relationship?: string | null
          nssf_number?: string | null
          onboarding_completed?: boolean | null
          phone?: string | null
          physical_address?: string | null
          role?: string | null
          role_id?: string | null
          sha_number?: string | null
          status?: string | null
          tenant_id?: string | null
          tsc_number?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
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
          tenant_id: string | null
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
          tenant_id?: string | null
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
          tenant_id?: string | null
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
          {
            foreignKeyName: "recruitment_assessments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      registrations: {
        Row: {
          age: number
          checked_in: boolean | null
          checked_in_at: string | null
          created_at: string
          email: string
          emergency_contact_name: string
          emergency_contact_phone: string
          event_id: string | null
          first_name: string
          gender: string
          id: string
          last_name: string
          medical_conditions: string | null
          payment_reference: string | null
          payment_status: string | null
          phone: string
          previous_ultra_experience: boolean | null
          registration_fee: number | null
          shirt_size: string | null
          updated_at: string
        }
        Insert: {
          age: number
          checked_in?: boolean | null
          checked_in_at?: string | null
          created_at?: string
          email: string
          emergency_contact_name: string
          emergency_contact_phone: string
          event_id?: string | null
          first_name: string
          gender: string
          id?: string
          last_name: string
          medical_conditions?: string | null
          payment_reference?: string | null
          payment_status?: string | null
          phone: string
          previous_ultra_experience?: boolean | null
          registration_fee?: number | null
          shirt_size?: string | null
          updated_at?: string
        }
        Update: {
          age?: number
          checked_in?: boolean | null
          checked_in_at?: string | null
          created_at?: string
          email?: string
          emergency_contact_name?: string
          emergency_contact_phone?: string
          event_id?: string | null
          first_name?: string
          gender?: string
          id?: string
          last_name?: string
          medical_conditions?: string | null
          payment_reference?: string | null
          payment_status?: string | null
          phone?: string
          previous_ultra_experience?: boolean | null
          registration_fee?: number | null
          shirt_size?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      role_permissions: {
        Row: {
          created_at: string | null
          permission_id: string
          role_id: string
        }
        Insert: {
          created_at?: string | null
          permission_id: string
          role_id: string
        }
        Update: {
          created_at?: string | null
          permission_id?: string
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      saas_admins: {
        Row: {
          access_level: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          user_id: string
        }
        Insert: {
          access_level?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id?: string
          user_id: string
        }
        Update: {
          access_level?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      sales_performance: {
        Row: {
          actual_sales: number | null
          commission_rate: number | null
          created_at: string | null
          employee_id: string
          id: string
          month: number
          notes: string | null
          status: string | null
          supporting_data: Json | null
          target_amount: number
          tenant_id: string
          updated_at: string | null
          year: number
        }
        Insert: {
          actual_sales?: number | null
          commission_rate?: number | null
          created_at?: string | null
          employee_id: string
          id?: string
          month: number
          notes?: string | null
          status?: string | null
          supporting_data?: Json | null
          target_amount: number
          tenant_id: string
          updated_at?: string | null
          year: number
        }
        Update: {
          actual_sales?: number | null
          commission_rate?: number | null
          created_at?: string | null
          employee_id?: string
          id?: string
          month?: number
          notes?: string | null
          status?: string | null
          supporting_data?: Json | null
          target_amount?: number
          tenant_id?: string
          updated_at?: string | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "sales_performance_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employee_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_performance_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          assigned_by: string | null
          assigned_to: string | null
          category: string | null
          completed_at: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          priority: string | null
          status: string | null
          tenant_id: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          assigned_by?: string | null
          assigned_to?: string | null
          category?: string | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          status?: string | null
          tenant_id?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          assigned_by?: string | null
          assigned_to?: string | null
          category?: string | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          status?: string | null
          tenant_id?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_users: {
        Row: {
          created_at: string | null
          id: string
          is_tenant_admin: boolean | null
          tenant_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_tenant_admin?: boolean | null
          tenant_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_tenant_admin?: boolean | null
          tenant_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_users_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          created_at: string | null
          favicon_url: string | null
          features: Json | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          max_employees: number | null
          name: string
          primary_color: string | null
          settings: Json | null
          slug: string
          subscription_ends_at: string | null
          subscription_status: string | null
          subscription_tier: string | null
          tenant_type: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          favicon_url?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          max_employees?: number | null
          name: string
          primary_color?: string | null
          settings?: Json | null
          slug: string
          subscription_ends_at?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          tenant_type?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          favicon_url?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          max_employees?: number | null
          name?: string
          primary_color?: string | null
          settings?: Json | null
          slug?: string
          subscription_ends_at?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          tenant_type?: string | null
          updated_at?: string | null
        }
        Relationships: []
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
          tenant_id: string | null
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
          tenant_id?: string | null
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
          tenant_id?: string | null
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
          {
            foreignKeyName: "tickets_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      weekly_management_reports: {
        Row: {
          active_clearances: number | null
          active_pips: number | null
          created_at: string
          email_recipients: string[] | null
          email_sent: boolean | null
          email_sent_at: string | null
          evaluations_completed: number | null
          evaluations_pending: number | null
          generated_by: string | null
          id: string
          interviews_scheduled: number | null
          leave_requests_approved: number | null
          leave_requests_pending: number | null
          leave_requests_rejected: number | null
          leave_requests_submitted: number | null
          new_applications: number | null
          new_hires: number | null
          open_positions: number | null
          pending_approvals: number | null
          report_data: Json | null
          report_period_end: string
          report_period_start: string
          report_summary: string | null
          status: string | null
          tenant_id: string
          terminations: number | null
          tickets_opened: number | null
          tickets_pending: number | null
          tickets_resolved: number | null
          total_headcount: number | null
          total_leave_days_taken: number | null
          updated_at: string
        }
        Insert: {
          active_clearances?: number | null
          active_pips?: number | null
          created_at?: string
          email_recipients?: string[] | null
          email_sent?: boolean | null
          email_sent_at?: string | null
          evaluations_completed?: number | null
          evaluations_pending?: number | null
          generated_by?: string | null
          id?: string
          interviews_scheduled?: number | null
          leave_requests_approved?: number | null
          leave_requests_pending?: number | null
          leave_requests_rejected?: number | null
          leave_requests_submitted?: number | null
          new_applications?: number | null
          new_hires?: number | null
          open_positions?: number | null
          pending_approvals?: number | null
          report_data?: Json | null
          report_period_end: string
          report_period_start: string
          report_summary?: string | null
          status?: string | null
          tenant_id: string
          terminations?: number | null
          tickets_opened?: number | null
          tickets_pending?: number | null
          tickets_resolved?: number | null
          total_headcount?: number | null
          total_leave_days_taken?: number | null
          updated_at?: string
        }
        Update: {
          active_clearances?: number | null
          active_pips?: number | null
          created_at?: string
          email_recipients?: string[] | null
          email_sent?: boolean | null
          email_sent_at?: string | null
          evaluations_completed?: number | null
          evaluations_pending?: number | null
          generated_by?: string | null
          id?: string
          interviews_scheduled?: number | null
          leave_requests_approved?: number | null
          leave_requests_pending?: number | null
          leave_requests_rejected?: number | null
          leave_requests_submitted?: number | null
          new_applications?: number | null
          new_hires?: number | null
          open_positions?: number | null
          pending_approvals?: number | null
          report_data?: Json | null
          report_period_end?: string
          report_period_start?: string
          report_summary?: string | null
          status?: string | null
          tenant_id?: string
          terminations?: number | null
          tickets_opened?: number | null
          tickets_pending?: number | null
          tickets_resolved?: number | null
          total_headcount?: number | null
          total_leave_days_taken?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "weekly_management_reports_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
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
          tenant_id: string | null
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
          tenant_id?: string | null
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
          tenant_id?: string | null
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
          {
            foreignKeyName: "weekly_reports_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_clearance_fully_approved: {
        Args: { p_clearance_id: string }
        Returns: boolean
      }
      check_expiring_contracts: {
        Args: never
        Returns: {
          contract_end_date: string
          days_until_expiry: number
          employee_id: string
          employee_name: string
        }[]
      }
      check_tenant_admin_for_tenant: {
        Args: { check_tenant_id: string; check_user_id: string }
        Returns: boolean
      }
      check_tenant_admin_status: {
        Args: { check_tenant_id: string; check_user_id: string }
        Returns: boolean
      }
      create_default_departments_for_tenant: {
        Args: { p_tenant_id: string }
        Returns: undefined
      }
      generate_tenant_employee_number: {
        Args: { p_tenant_id: string }
        Returns: string
      }
      get_current_user_role: { Args: never; Returns: string }
      get_event_price: { Args: { event_name: string }; Returns: number }
      get_leave_requests_for_role: {
        Args: never
        Returns: {
          approved_at: string | null
          approved_by: string | null
          comments: string | null
          created_at: string | null
          days_requested: number
          decision_at: string | null
          employee_id: string
          end_date: string
          head_internal_notes: string | null
          head_recommendation: string | null
          head_reviewed_at: string | null
          head_reviewed_by: string | null
          id: string
          leave_type: string
          proof_file_name: string | null
          proof_url: string | null
          reason: string | null
          start_date: string
          status: string | null
          tenant_id: string | null
          updated_at: string | null
          workflow_stage: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "leave_requests"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_next_employee_number: { Args: never; Returns: string }
      get_user_permissions: {
        Args: { user_id: string }
        Returns: {
          module: string
          permission_description: string
          permission_name: string
        }[]
      }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      get_user_tenant_id: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_saas_admin: { Args: never; Returns: boolean }
      is_superadmin: { Args: { user_id: string }; Returns: boolean }
      is_tenant_admin: { Args: { _user_id: string }; Returns: boolean }
      is_tenant_member: { Args: { _tenant_id: string }; Returns: boolean }
      send_registration_confirmation: {
        Args: { registration_id_param: string }
        Returns: Json
      }
      user_has_permission: {
        Args: { permission_name: string; user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "superadmin"
        | "admin"
        | "head"
        | "teacher"
        | "staff"
        | "secretary"
        | "driver"
        | "support_staff"
        | "deputy_head"
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
      app_role: [
        "superadmin",
        "admin",
        "head",
        "teacher",
        "staff",
        "secretary",
        "driver",
        "support_staff",
        "deputy_head",
      ],
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
