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

// Type aliases for convenience
export type Document = Database['public']['Tables']['documents']['Row'];
export type DocumentInsert =
  Database['public']['Tables']['documents']['Insert'];
export type DocumentUpdate =
  Database['public']['Tables']['documents']['Update'];

export type Review = Database['public']['Tables']['reviews']['Row'];
export type ReviewInsert = Database['public']['Tables']['reviews']['Insert'];
export type ReviewUpdate = Database['public']['Tables']['reviews']['Update'];

export type Subscription = Database['public']['Tables']['subscriptions']['Row'];
export type SubscriptionInsert =
  Database['public']['Tables']['subscriptions']['Insert'];
export type SubscriptionUpdate =
  Database['public']['Tables']['subscriptions']['Update'];

// Document Processing Types
export interface DocumentMetadata {
  fileType: string;
  fileName: string;
  fileSize: number;
  processingTime: number;
  wordCount: number;
  characterCount: number;
  pageCount?: number;
  extractionMethod: string;
  processingVersion?: string;
  lastProcessed?: string;
}

export interface ProcessedDocument {
  id: string;
  user_id: string;
  filename: string;
  file_type: string;
  file_size: number;
  storage_path: string;
  document_type: 'submittal' | 'specification';
  uploaded_at: string;
  processed_at?: string | null | undefined;
  status: 'uploaded' | 'processing' | 'processed' | 'error';
  extracted_text?: string | undefined;
  metadata?: DocumentMetadata | undefined;
  processing_status?:
    | 'pending'
    | 'processing'
    | 'completed'
    | 'failed'
    | undefined;
  processing_error?: string | undefined;
}

// Document Processing Queue Types
export interface DocumentProcessingJob {
  id: string;
  documentId: string;
  userId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  message: string;
  startedAt: Date;
  completedAt?: Date;
  estimatedDuration?: number;
  priority: 'low' | 'normal' | 'high';
  retryCount: number;
  maxRetries: number;
}

// Batch Processing Types
export interface BatchProcessingJob {
  id: string;
  userId: string;
  documentIds: string[];
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'partial';
  totalDocuments: number;
  processedDocuments: number;
  failedDocuments: number;
  startedAt: Date;
  completedAt?: Date;
  results: Record<string, 'success' | 'failed'>;
}
