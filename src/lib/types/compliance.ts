// Core types for compliance management system

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  procore_id?: string;
  name: string;
  start_date: string;
  end_date: string;
  compliance_profile_id: string;
  compliance_percentage: number;
  party_count: number;
  created_at: string;
  updated_at: string;
}

export interface Party {
  id: string;
  procore_id?: string;
  name: string;
  contact_email: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectParty {
  id: string;
  project_id: string;
  party_id: string;
  compliance_status: 'compliant' | 'non-compliant' | 'pending';
  override_reason?: string;
  last_updated: string;
  project?: Project;
  party?: Party;
}

export interface ComplianceProfile {
  id: string;
  name: string;
  requirements: ComplianceRequirements;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface ComplianceRequirements {
  COI?: {
    min_general_liability?: number;
    min_auto_liability?: number;
    min_workers_comp?: number;
    require_additional_insured?: boolean;
    require_waiver_of_subrogation?: boolean;
  };
  W9?: {
    require_tax_id?: boolean;
    require_signature?: boolean;
  };
  [key: string]: any;
}

export interface DocumentType {
  id: string;
  name: string;
  description?: string;
  required_fields: string[];
}

export interface Document {
  id: string;
  project_party_id: string;
  document_type_id: string;
  file_path: string;
  file_name: string;
  file_size: number;
  data: DocumentData;
  status: 'pending' | 'compliant' | 'non-compliant' | 'expired';
  uploaded_by: string;
  upload_date: string;
  expiration_date?: string;
  verified_date?: string;
  notes?: string;
}

export interface DocumentData {
  policy_number?: string;
  coverage_amount?: number;
  expiration_date?: string;
  tax_id?: string;
  [key: string]: any;
}

export interface DashboardStats {
  total_projects: number;
  total_parties: number;
  compliant_parties: number;
  non_compliant_parties: number;
  expiring_documents: number;
}

export interface ExpiringDocument {
  id: string;
  document_type: string;
  party_name: string;
  project_name: string;
  expiration_date: string;
  days_until_expiration: number;
}

export interface ProcoreIntegration {
  id: string;
  api_key?: string;
  client_id?: string;
  client_secret?: string;
  access_token?: string;
  refresh_token?: string;
  last_sync: string;
  sync_status: 'success' | 'error' | 'pending';
  sync_errors?: string[];
}

export interface DocumentUploadRequest {
  project_party_id: string;
  document_type_id: string;
  file: File;
  data: DocumentData;
}

export interface DocumentRequestEmail {
  id: string;
  project_party_id: string;
  email: string;
  token: string;
  expires_at: string;
  sent_at: string;
  completed_at?: string;
}

// Form types
export interface LoginFormData {
  email: string;
  password: string;
  remember_me?: boolean;
}

export interface UserFormData {
  name: string;
  email: string;
  password?: string;
  role: 'admin' | 'user';
}

export interface ComplianceProfileFormData {
  name: string;
  requirements: ComplianceRequirements;
  is_default: boolean;
}

export interface DocumentUploadFormData {
  document_type_id: string;
  file: File;
  data: DocumentData;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}

// Filter and search types
export interface ProjectFilter {
  search?: string;
  compliance_status?: 'compliant' | 'non-compliant' | 'pending';
  date_range?: {
    start: string;
    end: string;
  };
}

export interface PartyFilter {
  search?: string;
  compliance_status?: 'compliant' | 'non-compliant' | 'pending';
  project_id?: string;
}

// Subscription and billing types
export interface Subscription {
  id: string;
  user_id: string;
  plan_type: 'free' | 'professional' | 'enterprise';
  status: 'active' | 'cancelled' | 'expired' | 'past_due';
  current_period_start?: string;
  current_period_end?: string;
  projects_limit: number;
  projects_used: number;
  created_at: string;
  updated_at: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  projects_limit: number;
  popular?: boolean;
}

// Constants
export const DOCUMENT_TYPES = {
  COI: 'Certificate of Insurance',
  W9: 'W-9 Tax Form',
  LICENSE: 'Business License',
  BOND: 'Performance Bond',
  SAFETY: 'Safety Certificate',
} as const;

export const COMPLIANCE_STATUSES = {
  COMPLIANT: 'compliant',
  NON_COMPLIANT: 'non-compliant',
  PENDING: 'pending',
} as const;

export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
} as const;

export const SUBSCRIPTION_PLANS = {
  FREE: 'free',
  PROFESSIONAL: 'professional',
  ENTERPRISE: 'enterprise',
} as const;