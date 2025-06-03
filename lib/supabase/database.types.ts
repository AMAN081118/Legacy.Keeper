export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string
          email: string
          phone: string | null
          dob: string | null
          gender: string | null
          government_id_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          email: string
          phone?: string | null
          dob?: string | null
          gender?: string | null
          government_id_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone?: string | null
          dob?: string | null
          gender?: string | null
          government_id_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      requests: {
        Row: {
          id: string
          title: string
          user_id: string
          recipient_id: string | null
          amount: number
          comment: string | null
          status: "pending" | "approved" | "rejected"
          transaction_type: "Debt" | "Investment" | "Loan" | null
          details: string | null
          attachment_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          user_id: string
          recipient_id?: string | null
          amount: number
          comment?: string | null
          status?: "pending" | "approved" | "rejected"
          transaction_type?: "Debt" | "Investment" | "Loan" | null
          details?: string | null
          attachment_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          user_id?: string
          recipient_id?: string | null
          amount?: number
          comment?: string | null
          status?: "pending" | "approved" | "rejected"
          transaction_type?: "Debt" | "Investment" | "Loan" | null
          details?: string | null
          attachment_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          name: string
          user_id: string
          amount: number
          transaction_type: "Paid" | "Received"
          payment_mode: string | null
          date: string
          description: string | null
          attachment_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          user_id: string
          amount: number
          transaction_type: "Paid" | "Received"
          payment_mode?: string | null
          date?: string
          description?: string | null
          attachment_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          user_id?: string
          amount?: number
          transaction_type?: "Paid" | "Received"
          payment_mode?: string | null
          date?: string
          description?: string | null
          attachment_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      debts_loans: {
        Row: {
          id: string
          user_id: string
          person: string
          amount: number
          interest: number | null
          amount_due: number | null
          start_date: string
          due_date: string | null
          payment_mode: string | null
          security: string | null
          purpose: string | null
          attachment_url: string | null
          transaction_type: "Given" | "Received"
          status: "Active" | "Completed" | "Defaulted"
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          person: string
          amount: number
          interest?: number | null
          amount_due?: number | null
          start_date: string
          due_date?: string | null
          payment_mode?: string | null
          security?: string | null
          purpose?: string | null
          attachment_url?: string | null
          transaction_type: "Given" | "Received"
          status?: "Active" | "Completed" | "Defaulted"
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          person?: string
          amount?: number
          interest?: number | null
          amount_due?: number | null
          start_date?: string
          due_date?: string | null
          payment_mode?: string | null
          security?: string | null
          purpose?: string | null
          attachment_url?: string | null
          transaction_type?: "Given" | "Received"
          status?: "Active" | "Completed" | "Defaulted"
          created_at?: string
          updated_at?: string
        }
      }
      deposits_investments: {
        Row: {
          id: string
          user_id: string
          name: string
          amount: number
          investment_type: "Bank" | "Gold" | "Silver" | "Shares" | "Bond" | "Property" | "DigitalAsset" | "Other"
          description: string | null
          paid_to: string | null
          date: string
          maturity_date: string | null
          interest_rate: number | null
          expected_returns: number | null
          attachment_url: string | null
          status: "Active" | "Matured" | "Withdrawn"
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          amount: number
          investment_type: "Bank" | "Gold" | "Silver" | "Shares" | "Bond" | "Property" | "DigitalAsset" | "Other"
          description?: string | null
          paid_to?: string | null
          date: string
          maturity_date?: string | null
          interest_rate?: number | null
          expected_returns?: number | null
          attachment_url?: string | null
          status?: "Active" | "Matured" | "Withdrawn"
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          amount?: number
          investment_type?: "Bank" | "Gold" | "Silver" | "Shares" | "Bond" | "Property" | "DigitalAsset" | "Other"
          description?: string | null
          paid_to?: string | null
          date?: string
          maturity_date?: string | null
          interest_rate?: number | null
          expected_returns?: number | null
          attachment_url?: string | null
          status?: "Active" | "Matured" | "Withdrawn"
          created_at?: string
          updated_at?: string
        }
      }
      insurance: {
        Row: {
          id: string
          user_id: string
          name: string
          amount: number
          insurance_type: "Life" | "Health" | "Term" | "Auto" | "Property" | "Content" | "Other"
          description: string | null
          date: string
          coverage_period: string | null
          attachment_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          amount: number
          insurance_type: "Life" | "Health" | "Term" | "Auto" | "Property" | "Content" | "Other"
          description?: string | null
          date: string
          coverage_period?: string | null
          attachment_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          amount?: number
          insurance_type?: "Life" | "Health" | "Term" | "Auto" | "Property" | "Content" | "Other"
          description?: string | null
          date?: string
          coverage_period?: string | null
          attachment_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      business_plans: {
        Row: {
          id: string
          user_id: string
          business_name: string
          business_type: string
          ownership_percentage: string | null
          investment_amount: number
          succession_plans: string | null
          attachment_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          business_name: string
          business_type: string
          ownership_percentage?: string | null
          investment_amount: number
          succession_plans?: string | null
          attachment_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          business_name?: string
          business_type?: string
          ownership_percentage?: string | null
          investment_amount?: number
          succession_plans?: string | null
          attachment_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      health_records: {
        Row: {
          id: string
          user_id: string
          member_name: string
          dob: string | null
          gender: string | null
          blood_group: string | null
          contact_number: string | null
          medical_conditions: string | null
          allergies: string | null
          medications: string | null
          emergency_contact: string | null
          attachment_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          member_name: string
          dob?: string | null
          gender?: string | null
          blood_group?: string | null
          contact_number?: string | null
          medical_conditions?: string | null
          allergies?: string | null
          medications?: string | null
          emergency_contact?: string | null
          attachment_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          member_name?: string
          dob?: string | null
          gender?: string | null
          blood_group?: string | null
          contact_number?: string | null
          medical_conditions?: string | null
          allergies?: string | null
          medications?: string | null
          emergency_contact?: string | null
          attachment_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      health_conditions: {
        Row: {
          id: string
          health_record_id: string
          condition_name: string
          doctor_name: string | null
          visit_date: string | null
          description: string | null
          attachment_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          health_record_id: string
          condition_name: string
          doctor_name?: string | null
          visit_date?: string | null
          description?: string | null
          attachment_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          health_record_id?: string
          condition_name?: string
          doctor_name?: string | null
          visit_date?: string | null
          description?: string | null
          attachment_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      family_members: {
        Row: {
          id: string
          user_id: string
          member_name: string
          contact_number: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          member_name: string
          contact_number?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          member_name?: string
          contact_number?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      family_documents: {
        Row: {
          id: string
          family_member_id: string
          document_title: string
          document_category: string | null
          document_date: string | null
          description: string | null
          attachment_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          family_member_id: string
          document_title: string
          document_category?: string | null
          document_date?: string | null
          description?: string | null
          attachment_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          family_member_id?: string
          document_title?: string
          document_category?: string | null
          document_date?: string | null
          description?: string | null
          attachment_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      reminders: {
        Row: {
          id: string
          user_id: string
          reminder_name: string
          category: string | null
          start_date: string
          frequency: number | null
          notes: string | null
          attachment_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          reminder_name: string
          category?: string | null
          start_date: string
          frequency?: number | null
          notes?: string | null
          attachment_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          reminder_name?: string
          category?: string | null
          start_date?: string
          frequency?: number | null
          notes?: string | null
          attachment_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      digital_accounts: {
        Row: {
          id: string
          user_id: string
          account_name: string
          account_id_no: string | null
          password_phone: string | null
          login_contact: string | null
          description: string | null
          government_id_url: string | null
          date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          account_name: string
          account_id_no?: string | null
          password_phone?: string | null
          login_contact?: string | null
          description?: string | null
          government_id_url?: string | null
          date?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          account_name?: string
          account_id_no?: string | null
          password_phone?: string | null
          login_contact?: string | null
          description?: string | null
          government_id_url?: string | null
          date?: string
          created_at?: string
          updated_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          subscription_name: string
          provider: string | null
          subscription_id: string | null
          amount: number | null
          billing_cycle: string | null
          start_date: string | null
          next_payment_date: string | null
          payment_method: string | null
          auto_renewal: boolean | null
          notes: string | null
          attachment_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          subscription_name: string
          provider?: string | null
          subscription_id?: string | null
          amount?: number | null
          billing_cycle?: string | null
          start_date?: string | null
          next_payment_date?: string | null
          payment_method?: string | null
          auto_renewal?: boolean | null
          notes?: string | null
          attachment_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          subscription_name?: string
          provider?: string | null
          subscription_id?: string | null
          amount?: number | null
          billing_cycle?: string | null
          start_date?: string | null
          next_payment_date?: string | null
          payment_method?: string | null
          auto_renewal?: boolean | null
          notes?: string | null
          attachment_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      documents: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          document_type: string
          attachment_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          document_type: string
          attachment_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          document_type?: string
          attachment_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      special_messages: {
        Row: {
          id: string
          sender_id: string
          recipient_ids: string[]
          message: string
          attachment_url: string | null
          is_for_all: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          sender_id: string
          recipient_ids: string[]
          message: string
          attachment_url?: string | null
          is_for_all?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          sender_id?: string
          recipient_ids?: string[]
          message?: string
          attachment_url?: string | null
          is_for_all?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      trustees: {
        Row: {
          id: string
          user_id: string
          name: string
          email: string
          relationship: string | null
          phone: string | null
          profile_photo_url: string | null
          government_id_url: string | null
          approval_type: string
          status: string
          invitation_token: string | null
          invitation_sent_at: string | null
          invitation_responded_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          email: string
          relationship?: string | null
          phone?: string | null
          profile_photo_url?: string | null
          government_id_url?: string | null
          approval_type: string
          status?: string
          invitation_token?: string | null
          invitation_sent_at?: string | null
          invitation_responded_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          email?: string
          relationship?: string | null
          phone?: string | null
          profile_photo_url?: string | null
          government_id_url?: string | null
          approval_type?: string
          status?: string
          invitation_token?: string | null
          invitation_sent_at?: string | null
          invitation_responded_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      nominees: {
        Row: {
          id: string
          user_id: string
          name: string
          email: string
          relationship: string | null
          phone: string | null
          access_categories: string[]
          profile_photo_url: string | null
          government_id_url: string | null
          created_at: string
          updated_at: string
          status: string
          invitation_token: string | null
          invitation_sent_at: string | null
          invitation_responded_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          email: string
          relationship?: string | null
          phone?: string | null
          access_categories?: string[]
          profile_photo_url?: string | null
          government_id_url?: string | null
          created_at?: string
          updated_at?: string
          status?: string
          invitation_token?: string | null
          invitation_sent_at?: string | null
          invitation_responded_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          email?: string
          relationship?: string | null
          phone?: string | null
          access_categories?: string[]
          profile_photo_url?: string | null
          government_id_url?: string | null
          created_at?: string
          updated_at?: string
          status?: string
          invitation_token?: string | null
          invitation_sent_at?: string | null
          invitation_responded_at?: string | null
        }
      }
      roles: {
        Row: {
          id: string
          name: string // e.g. 'user', 'nominee'
          description: string | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
        }
      }
      user_roles: {
        Row: {
          id: string
          user_id: string
          role_id: string
          related_user_id: string | null // e.g. inviter for nominee
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          role_id: string
          related_user_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          role_id?: string
          related_user_id?: string | null
          created_at?: string
        }
      }
      role_section_access: {
        Row: {
          id: string
          role_id: string
          section: string // e.g. 'dashboard', 'documents', etc.
        }
        Insert: {
          id?: string
          role_id: string
          section: string
        }
        Update: {
          id?: string
          role_id?: string
          section?: string
        }
      }
    }
  }
}

export type Tables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"]
export type InsertTables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Insert"]
export type UpdateTables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Update"]

export type User = Tables<"users">
export type DebtLoan = Tables<"debts_loans">
export type DepositInvestment = Tables<"deposits_investments">
export type Insurance = Tables<"insurance">
export type BusinessPlan = Tables<"business_plans">
export type HealthRecord = Tables<"health_records">
export type HealthCondition = Tables<"health_conditions">
export type FamilyMember = Tables<"family_members">
export type FamilyDocument = Tables<"family_documents">
export type Reminder = Tables<"reminders">
export type DigitalAccount = Tables<"digital_accounts">
export type Subscription = Tables<"subscriptions">
export type Document = Tables<"documents">
export type SpecialMessage = Tables<"special_messages">
export type Trustee = Tables<"trustees">
export type Nominee = Tables<"nominees">
export type Role = Tables<"roles">
export type UserRole = Tables<"user_roles">
export type RoleSectionAccess = Tables<"role_section_access">
