export interface Database {
  public: {
    Tables: {
      documents: {
        Row: {
          id: string;
          user_id: string;
          filename: string;
          file_type: string;
          file_size: number;
          storage_path: string;
          document_type: 'submittal' | 'specification';
          uploaded_at: string;
          processed_at: string | null;
          status: 'uploaded' | 'processing' | 'processed' | 'error';
        };
        Insert: {
          id?: string;
          user_id: string;
          filename: string;
          file_type: string;
          file_size: number;
          storage_path: string;
          document_type: 'submittal' | 'specification';
          uploaded_at?: string;
          processed_at?: string | null;
          status?: 'uploaded' | 'processing' | 'processed' | 'error';
        };
        Update: {
          id?: string;
          user_id?: string;
          filename?: string;
          file_type?: string;
          file_size?: number;
          storage_path?: string;
          document_type?: 'submittal' | 'specification';
          uploaded_at?: string;
          processed_at?: string | null;
          status?: 'uploaded' | 'processing' | 'processed' | 'error';
        };
      };
      reviews: {
        Row: {
          id: string;
          user_id: string;
          submittal_id: string;
          specification_id: string;
          ai_analysis: Record<string, unknown>; // JSON
          compliance_score: number;
          status: 'pending' | 'completed' | 'error';
          created_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          submittal_id: string;
          specification_id: string;
          ai_analysis?: Record<string, unknown>; // JSON
          compliance_score?: number;
          status?: 'pending' | 'completed' | 'error';
          created_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          submittal_id?: string;
          specification_id?: string;
          ai_analysis?: Record<string, unknown>; // JSON
          compliance_score?: number;
          status?: 'pending' | 'completed' | 'error';
          created_at?: string;
          completed_at?: string | null;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          plan_type: 'free' | 'professional' | 'enterprise';
          status: 'active' | 'inactive' | 'cancelled' | 'past_due';
          current_period_start: string | null;
          current_period_end: string | null;
          reviews_used: number;
          reviews_limit: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          plan_type?: 'free' | 'professional' | 'enterprise';
          status?: 'active' | 'inactive' | 'cancelled' | 'past_due';
          current_period_start?: string | null;
          current_period_end?: string | null;
          reviews_used?: number;
          reviews_limit?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          plan_type?: 'free' | 'professional' | 'enterprise';
          status?: 'active' | 'inactive' | 'cancelled' | 'past_due';
          current_period_start?: string | null;
          current_period_end?: string | null;
          reviews_used?: number;
          reviews_limit?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}
