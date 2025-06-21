-- Compliance Manager Pro Database Schema
-- Drop existing tables if they exist
DROP TABLE IF EXISTS document_requests CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS project_parties CASCADE;
DROP TABLE IF EXISTS parties CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS compliance_profiles CASCADE;
DROP TABLE IF EXISTS document_types CASCADE;
DROP TABLE IF EXISTS procore_integrations CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create document_types table
CREATE TABLE document_types (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    required_fields JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create compliance_profiles table
CREATE TABLE compliance_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    requirements JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create projects table
CREATE TABLE projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    procore_id TEXT UNIQUE,
    name TEXT NOT NULL,
    start_date DATE,
    end_date DATE,
    compliance_profile_id UUID REFERENCES compliance_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create parties table
CREATE TABLE parties (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    procore_id TEXT UNIQUE,
    name TEXT NOT NULL,
    contact_email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create project_parties table (junction table)
CREATE TABLE project_parties (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
    party_id UUID REFERENCES parties(id) ON DELETE CASCADE NOT NULL,
    compliance_status TEXT DEFAULT 'pending' CHECK (compliance_status IN ('compliant', 'non-compliant', 'pending')),
    override_reason TEXT,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(project_id, party_id)
);

-- Create documents table
CREATE TABLE documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_party_id UUID REFERENCES project_parties(id) ON DELETE CASCADE NOT NULL,
    document_type_id UUID REFERENCES document_types(id) ON DELETE CASCADE NOT NULL,
    file_path TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    data JSONB DEFAULT '{}'::jsonb,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'compliant', 'non-compliant', 'expired')),
    uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    expiration_date DATE,
    verified_date TIMESTAMP WITH TIME ZONE,
    notes TEXT
);

-- Create document_requests table
CREATE TABLE document_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_party_id UUID REFERENCES project_parties(id) ON DELETE CASCADE NOT NULL,
    email TEXT NOT NULL,
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Create procore_integrations table
CREATE TABLE procore_integrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    client_id TEXT,
    client_secret TEXT,
    access_token TEXT,
    refresh_token TEXT,
    last_sync TIMESTAMP WITH TIME ZONE,
    sync_status TEXT DEFAULT 'pending' CHECK (sync_status IN ('success', 'error', 'pending')),
    sync_errors JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Update subscriptions table for compliance management
DROP TABLE IF EXISTS subscriptions;
CREATE TABLE subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    plan_type TEXT DEFAULT 'free' CHECK (plan_type IN ('free', 'professional', 'enterprise')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'past_due')),
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    projects_used INTEGER DEFAULT 0,
    projects_limit INTEGER DEFAULT 3, -- 3 for free tier
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Insert default document types
INSERT INTO document_types (name, description, required_fields) VALUES
('COI', 'Certificate of Insurance', '["policy_number", "coverage_amount", "expiration_date"]'),
('W9', 'W-9 Tax Form', '["tax_id", "business_name"]'),
('LICENSE', 'Business License', '["license_number", "expiration_date"]'),
('BOND', 'Performance Bond', '["bond_amount", "expiration_date"]'),
('SAFETY', 'Safety Certificate', '["certificate_number", "expiration_date"]');

-- Insert default compliance profile
INSERT INTO compliance_profiles (name, requirements, is_default) VALUES
('Default Profile', '{
  "COI": {
    "min_general_liability": 1000000,
    "min_auto_liability": 500000,
    "require_additional_insured": true
  },
  "W9": {
    "require_tax_id": true
  }
}', true);

-- Enable Row Level Security (RLS)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE parties ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_parties ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE procore_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for projects
CREATE POLICY "Users can view all projects" ON projects FOR SELECT USING (true);
CREATE POLICY "Admins can manage projects" ON projects FOR ALL USING (
    EXISTS (
        SELECT 1 FROM auth.users 
        WHERE auth.users.id = auth.uid() 
        AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
);

-- Create RLS policies for parties
CREATE POLICY "Users can view all parties" ON parties FOR SELECT USING (true);
CREATE POLICY "Admins can manage parties" ON parties FOR ALL USING (
    EXISTS (
        SELECT 1 FROM auth.users 
        WHERE auth.users.id = auth.uid() 
        AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
);

-- Create RLS policies for project_parties
CREATE POLICY "Users can view all project parties" ON project_parties FOR SELECT USING (true);
CREATE POLICY "Users can update project parties" ON project_parties FOR UPDATE USING (true);
CREATE POLICY "Admins can manage project parties" ON project_parties FOR ALL USING (
    EXISTS (
        SELECT 1 FROM auth.users 
        WHERE auth.users.id = auth.uid() 
        AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
);

-- Create RLS policies for documents
CREATE POLICY "Users can view all documents" ON documents FOR SELECT USING (true);
CREATE POLICY "Users can upload documents" ON documents FOR INSERT WITH CHECK (auth.uid() = uploaded_by);
CREATE POLICY "Users can update own documents" ON documents FOR UPDATE USING (auth.uid() = uploaded_by);
CREATE POLICY "Admins can manage all documents" ON documents FOR ALL USING (
    EXISTS (
        SELECT 1 FROM auth.users 
        WHERE auth.users.id = auth.uid() 
        AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
);

-- Create RLS policies for document_requests
CREATE POLICY "Users can view all document requests" ON document_requests FOR SELECT USING (true);
CREATE POLICY "Users can create document requests" ON document_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update document requests" ON document_requests FOR UPDATE USING (true);

-- Create RLS policies for compliance_profiles
CREATE POLICY "Users can view compliance profiles" ON compliance_profiles FOR SELECT USING (true);
CREATE POLICY "Admins can manage compliance profiles" ON compliance_profiles FOR ALL USING (
    EXISTS (
        SELECT 1 FROM auth.users 
        WHERE auth.users.id = auth.uid() 
        AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
);

-- Create RLS policies for procore_integrations
CREATE POLICY "Admins can manage procore integrations" ON procore_integrations FOR ALL USING (
    EXISTS (
        SELECT 1 FROM auth.users 
        WHERE auth.users.id = auth.uid() 
        AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
);

-- Create RLS policies for subscriptions
CREATE POLICY "Users can view own subscription" ON subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own subscription" ON subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own subscription" ON subscriptions FOR UPDATE USING (auth.uid() = user_id);

-- Create storage bucket for documents
INSERT INTO storage.buckets (id, name, public) VALUES ('compliance-documents', 'compliance-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for storage
CREATE POLICY "Users can view compliance documents" ON storage.objects
    FOR SELECT USING (bucket_id = 'compliance-documents');

CREATE POLICY "Users can upload compliance documents" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'compliance-documents');

CREATE POLICY "Users can update compliance documents" ON storage.objects
    FOR UPDATE USING (bucket_id = 'compliance-documents');

CREATE POLICY "Users can delete compliance documents" ON storage.objects
    FOR DELETE USING (bucket_id = 'compliance-documents');

-- Create indexes for better performance
CREATE INDEX idx_projects_procore_id ON projects(procore_id);
CREATE INDEX idx_parties_procore_id ON parties(procore_id);
CREATE INDEX idx_project_parties_project_id ON project_parties(project_id);
CREATE INDEX idx_project_parties_party_id ON project_parties(party_id);
CREATE INDEX idx_project_parties_compliance_status ON project_parties(compliance_status);
CREATE INDEX idx_documents_project_party_id ON documents(project_party_id);
CREATE INDEX idx_documents_document_type_id ON documents(document_type_id);
CREATE INDEX idx_documents_status ON documents(status);
CREATE INDEX idx_documents_expiration_date ON documents(expiration_date);
CREATE INDEX idx_document_requests_token ON document_requests(token);
CREATE INDEX idx_document_requests_expires_at ON document_requests(expires_at);

-- Create function to auto-create subscription for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.subscriptions (user_id, plan_type, status, projects_limit)
    VALUES (new.id, 'free', 'active', 3);
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-create subscription for new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Update updated_at timestamp functions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_projects_updated_at 
  BEFORE UPDATE ON projects 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_parties_updated_at 
  BEFORE UPDATE ON parties 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_compliance_profiles_updated_at 
  BEFORE UPDATE ON compliance_profiles 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at 
  BEFORE UPDATE ON subscriptions 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_procore_integrations_updated_at 
  BEFORE UPDATE ON procore_integrations 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate project compliance percentage
CREATE OR REPLACE FUNCTION calculate_project_compliance(project_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  total_parties INTEGER;
  compliant_parties INTEGER;
  percentage INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_parties
  FROM project_parties
  WHERE project_id = project_uuid;
  
  IF total_parties = 0 THEN
    RETURN 100;
  END IF;
  
  SELECT COUNT(*) INTO compliant_parties
  FROM project_parties
  WHERE project_id = project_uuid AND compliance_status = 'compliant';
  
  percentage := ROUND((compliant_parties::DECIMAL / total_parties::DECIMAL) * 100);
  
  RETURN percentage;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get dashboard statistics
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS TABLE(
  total_projects INTEGER,
  total_parties INTEGER,
  compliant_parties INTEGER,
  non_compliant_parties INTEGER,
  expiring_documents INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*)::INTEGER FROM projects) as total_projects,
    (SELECT COUNT(*)::INTEGER FROM project_parties) as total_parties,
    (SELECT COUNT(*)::INTEGER FROM project_parties WHERE compliance_status = 'compliant') as compliant_parties,
    (SELECT COUNT(*)::INTEGER FROM project_parties WHERE compliance_status = 'non-compliant') as non_compliant_parties,
    (SELECT COUNT(*)::INTEGER FROM documents WHERE expiration_date <= CURRENT_DATE + INTERVAL '30 days' AND expiration_date > CURRENT_DATE) as expiring_documents;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get expiring documents
CREATE OR REPLACE FUNCTION get_expiring_documents(days_ahead INTEGER DEFAULT 30)
RETURNS TABLE(
  document_id UUID,
  document_type TEXT,
  party_name TEXT,
  project_name TEXT,
  expiration_date DATE,
  days_until_expiration INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.id as document_id,
    dt.name as document_type,
    p.name as party_name,
    pr.name as project_name,
    d.expiration_date,
    (d.expiration_date - CURRENT_DATE)::INTEGER as days_until_expiration
  FROM documents d
  JOIN document_types dt ON d.document_type_id = dt.id
  JOIN project_parties pp ON d.project_party_id = pp.id
  JOIN parties p ON pp.party_id = p.id
  JOIN projects pr ON pp.project_id = pr.id
  WHERE d.expiration_date <= CURRENT_DATE + INTERVAL '1 day' * days_ahead
    AND d.expiration_date > CURRENT_DATE
  ORDER BY d.expiration_date ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Views for easier querying
CREATE OR REPLACE VIEW project_summary AS
SELECT 
  p.id,
  p.name,
  p.start_date,
  p.end_date,
  p.procore_id,
  calculate_project_compliance(p.id) as compliance_percentage,
  COUNT(pp.id) as party_count,
  p.created_at,
  p.updated_at
FROM projects p
LEFT JOIN project_parties pp ON p.id = pp.project_id
GROUP BY p.id, p.name, p.start_date, p.end_date, p.procore_id, p.created_at, p.updated_at;

CREATE OR REPLACE VIEW party_compliance_summary AS
SELECT 
  pp.id,
  pp.project_id,
  pp.party_id,
  pp.compliance_status,
  pp.override_reason,
  pp.last_updated,
  p.name as party_name,
  p.contact_email,
  pr.name as project_name,
  COUNT(d.id) as document_count,
  COUNT(CASE WHEN d.status = 'compliant' THEN 1 END) as compliant_documents,
  COUNT(CASE WHEN d.status = 'non-compliant' THEN 1 END) as non_compliant_documents,
  COUNT(CASE WHEN d.status = 'pending' THEN 1 END) as pending_documents
FROM project_parties pp
JOIN parties p ON pp.party_id = p.id
JOIN projects pr ON pp.project_id = pr.id
LEFT JOIN documents d ON pp.id = d.project_party_id
GROUP BY pp.id, pp.project_id, pp.party_id, pp.compliance_status, pp.override_reason, pp.last_updated, p.name, p.contact_email, pr.name;