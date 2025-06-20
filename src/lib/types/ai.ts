// AI Integration Types for SubmittalAI Pro

// OpenRouter Configuration
export interface OpenRouterConfig {
  apiKey: string;
  baseURL: string;
  defaultModel: string;
  fallbackModels: string[];
  maxRetries: number;
  retryDelay: number;
}

// Supported AI Models
export type AIModel =
  | 'anthropic/claude-3.5-sonnet:beta'
  | 'openai/gpt-4o'
  | 'openai/gpt-4o-mini'
  | 'anthropic/claude-3-haiku:beta';

// Document Analysis Request
export interface DocumentAnalysisRequest {
  documentId: string;
  documentType: 'submittal' | 'specification';
  extractedText: string;
  fileName: string;
  comparisonDocumentId?: string; // For submittal vs spec comparison
  analysisType: 'compliance' | 'review' | 'comparison';
  customPrompt?: string;
}

// AI Analysis Response
export interface AIAnalysisResponse {
  success: boolean;
  analysisId: string;
  model: AIModel;
  tokensUsed: number;
  cost: number;
  processingTime: number;
  result?: DocumentAnalysisResult;
  error?: string;
}

// Document Analysis Result
export interface DocumentAnalysisResult {
  complianceScore: number; // 0-100
  overallAssessment:
    | 'compliant'
    | 'non-compliant'
    | 'partially-compliant'
    | 'requires-review';
  summary: string;
  findings: Finding[];
  recommendations: Recommendation[];
  categories: CategoryAnalysis[];
  confidence: number; // 0-1
}

// Individual Finding
export interface Finding {
  id: string;
  category: FindingCategory;
  severity: 'critical' | 'major' | 'minor' | 'informational';
  title: string;
  description: string;
  location: DocumentLocation;
  compliance: 'compliant' | 'non-compliant' | 'unclear';
  requiredAction?: string;
  deadline?: string;
  confidence: number;
}

// Finding Categories
export type FindingCategory =
  | 'material-specifications'
  | 'dimensional-requirements'
  | 'performance-standards'
  | 'testing-requirements'
  | 'installation-procedures'
  | 'quality-control'
  | 'documentation'
  | 'regulatory-compliance'
  | 'safety-requirements'
  | 'environmental-considerations';

// Document Location Reference
export interface DocumentLocation {
  page?: number;
  section?: string;
  paragraph?: number;
  lineNumber?: number;
  excerpt: string;
}

// Recommendation
export interface Recommendation {
  id: string;
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  actionItems: string[];
  estimatedEffort: 'low' | 'medium' | 'high';
  category: FindingCategory;
}

// Category Analysis
export interface CategoryAnalysis {
  category: FindingCategory;
  score: number; // 0-100
  status: 'pass' | 'fail' | 'partial' | 'not-applicable';
  findingCount: number;
  summary: string;
}

// AI Processing Status
export interface AIProcessingStatus {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number; // 0-100
  startedAt: Date;
  completedAt?: Date;
  error?: string;
  estimatedTimeRemaining?: number;
}

// AI Prompt Template
export interface AIPromptTemplate {
  name: string;
  template: string;
  variables: string[];
  model: AIModel;
  maxTokens: number;
  temperature: number;
}

// AI Request Options
export interface AIRequestOptions {
  model?: AIModel;
  maxTokens?: number;
  temperature?: number;
  presencePenalty?: number;
  frequencyPenalty?: number;
  timeout?: number;
  retries?: number;
}

// AI Cost Tracking
export interface AICostUsage {
  requestId: string;
  userId: string;
  model: AIModel;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  cost: number;
  timestamp: Date;
  documentId: string;
}

// Text Extraction Types
export interface ExtractedText {
  content: string;
  metadata: {
    pageCount?: number;
    wordCount: number;
    characterCount: number;
    extractionMethod: 'pdf-parse' | 'ocr' | 'docx-parse';
    confidence?: number;
  };
  sections?: TextSection[];
}

export interface TextSection {
  title: string;
  content: string;
  page?: number;
  level: number; // heading level
}

// Error Types
export class AIProcessingError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AIProcessingError';
  }
}

export class ModelUnavailableError extends AIProcessingError {
  constructor(model: AIModel) {
    super(`AI model ${model} is currently unavailable`, 'MODEL_UNAVAILABLE', {
      model,
    });
  }
}

export class TokenLimitExceededError extends AIProcessingError {
  constructor(tokenCount: number, limit: number) {
    super(
      `Token limit exceeded: ${tokenCount} > ${limit}`,
      'TOKEN_LIMIT_EXCEEDED',
      { tokenCount, limit }
    );
  }
}

export class RateLimitError extends AIProcessingError {
  constructor(retryAfter?: number) {
    super('Rate limit exceeded', 'RATE_LIMIT_EXCEEDED', { retryAfter });
  }
}

// Enhanced Analysis Types for Prompt 9
export type AnalysisType =
  | 'compliance'
  | 'review'
  | 'comparison'
  | 'material-analysis'
  | 'safety-assessment'
  | 'code-compliance'
  | 'quality-control'
  | 'performance-evaluation'
  | 'specification-review';

export type AnalysisPriority = 'low' | 'normal' | 'high' | 'critical';

export type AnalysisComplexity =
  | 'basic'
  | 'standard'
  | 'comprehensive'
  | 'detailed';

// Enhanced Document Analysis Request (separate from base to avoid type conflicts)
export interface EnhancedAnalysisRequest {
  documentId: string;
  fileName: string;
  documentType: string;
  extractedText: string;
  analysisType: AnalysisType;
  priority: AnalysisPriority;
  complexity: AnalysisComplexity;
  focusAreas?: string[];
  excludeAreas?: string[];
  customCriteria?: AnalysisCriteria[];
  comparisonDocuments?: ComparisonDocument[];
  projectContext?: ProjectContext;
  analysisScope?: AnalysisScope;
}

// Analysis Criteria for Custom Analysis
export interface AnalysisCriteria {
  id: string;
  name: string;
  description: string;
  weight: number; // 0-1
  required: boolean;
  category: string;
  evaluationMethod: 'binary' | 'scale' | 'percentage' | 'text';
  acceptanceCriteria?: string;
}

// Comparison Documents
export interface ComparisonDocument {
  id: string;
  type:
    | 'specification'
    | 'standard'
    | 'code'
    | 'previous-submittal'
    | 'reference';
  name: string;
  content: string;
  version?: string;
  priority: number; // 1-10
}

// Project Context
export interface ProjectContext {
  projectType:
    | 'commercial'
    | 'residential'
    | 'industrial'
    | 'institutional'
    | 'mixed-use';
  buildingCodes: string[];
  jurisdiction: string;
  climateZone?: string;
  seismicZone?: string;
  specialRequirements?: string[];
  projectPhase: 'design' | 'construction' | 'closeout';
  contractorInfo?: {
    name: string;
    license: string;
    specialties: string[];
  };
}

// Analysis Scope
export interface AnalysisScope {
  sections?: string[]; // Specific sections to analyze
  keywords?: string[]; // Focus on specific keywords
  depthLevel: 'surface' | 'moderate' | 'deep' | 'exhaustive';
  includeRecommendations: boolean;
  includeAlternatives: boolean;
  includeCostImpact: boolean;
  includeScheduleImpact: boolean;
}

// Enhanced Analysis Result
export interface EnhancedDocumentAnalysisResult extends DocumentAnalysisResult {
  analysisMetadata: AnalysisMetadata;
  detailedFindings: DetailedFinding[];
  complianceMatrix: ComplianceMatrix;
  riskAssessment: RiskAssessment;
  qualityMetrics: QualityMetrics;
  actionItems: ActionItem[];
  alternativeOptions?: AlternativeOption[];
  costImpactAnalysis?: CostImpactAnalysis;
  scheduleImpactAnalysis?: ScheduleImpactAnalysis;
}

// Analysis Metadata
export interface AnalysisMetadata {
  analysisId: string;
  timestamp: string;
  modelUsed: AIModel;
  analysisType: AnalysisType;
  complexity: AnalysisComplexity;
  processingTime: number;
  confidenceScore: number;
  completenessScore: number;
  reviewerNotes?: string;
}

// Detailed Finding
export interface DetailedFinding extends Finding {
  id: string;
  section: string;
  subsection?: string;
  pageNumber?: number;
  lineNumber?: number;
  context: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  urgency: 'low' | 'medium' | 'high' | 'immediate';
  effort: 'minimal' | 'moderate' | 'significant' | 'major';
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  complianceStatus:
    | 'compliant'
    | 'non-compliant'
    | 'partially-compliant'
    | 'unclear';
  corrective_action: string;
  timeline: string;
  responsible_party: string;
  verification_method: string;
  relatedFindings?: string[]; // IDs of related findings
  attachments?: string[];
}

// Compliance Matrix
export interface ComplianceMatrix {
  overall_score: number;
  categories: ComplianceCategory[];
  summary: string;
  critical_issues: number;
  major_issues: number;
  minor_issues: number;
  compliant_items: number;
}

export interface ComplianceCategory {
  name: string;
  score: number;
  weight: number;
  status: 'pass' | 'fail' | 'conditional' | 'review-required';
  items_checked: number;
  items_passed: number;
  critical_failures: string[];
  recommendations: string[];
}

// Risk Assessment
export interface RiskAssessment {
  overall_risk: 'low' | 'medium' | 'high' | 'critical';
  risk_factors: RiskFactor[];
  mitigation_strategies: MitigationStrategy[];
  residual_risk: 'low' | 'medium' | 'high' | 'critical';
}

export interface RiskFactor {
  category: string;
  description: string;
  probability: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high' | 'critical';
  risk_score: number;
  mitigation_required: boolean;
}

export interface MitigationStrategy {
  risk_id: string;
  strategy: string;
  implementation_effort: 'low' | 'medium' | 'high';
  effectiveness: 'low' | 'medium' | 'high';
  timeline: string;
  responsible_party: string;
}

// Quality Metrics
export interface QualityMetrics {
  documentation_quality: number; // 0-100
  technical_accuracy: number; // 0-100
  completeness: number; // 0-100
  clarity: number; // 0-100
  consistency: number; // 0-100
  compliance_readiness: number; // 0-100
  overall_quality: number; // 0-100
  improvement_areas: string[];
}

// Action Items
export interface ActionItem {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  assigned_to: string;
  due_date?: string;
  estimated_hours?: number;
  dependencies?: string[];
  status: 'pending' | 'in-progress' | 'completed' | 'blocked';
  related_findings: string[];
}

// Alternative Options
export interface AlternativeOption {
  id: string;
  title: string;
  description: string;
  pros: string[];
  cons: string[];
  cost_impact: 'decrease' | 'neutral' | 'increase';
  schedule_impact: 'decrease' | 'neutral' | 'increase';
  quality_impact: 'decrease' | 'neutral' | 'increase';
  compliance_impact: 'negative' | 'neutral' | 'positive';
  recommendation:
    | 'not-recommended'
    | 'consider'
    | 'recommended'
    | 'highly-recommended';
}

// Cost Impact Analysis
export interface CostImpactAnalysis {
  total_impact: number;
  currency: string;
  impact_breakdown: CostImpactItem[];
  confidence_level: 'low' | 'medium' | 'high';
  assumptions: string[];
}

export interface CostImpactItem {
  category: string;
  description: string;
  amount: number;
  type: 'increase' | 'decrease' | 'neutral';
  certainty: 'low' | 'medium' | 'high';
}

// Schedule Impact Analysis
export interface ScheduleImpactAnalysis {
  total_impact_days: number;
  impact_breakdown: ScheduleImpactItem[];
  critical_path_affected: boolean;
  confidence_level: 'low' | 'medium' | 'high';
  assumptions: string[];
}

export interface ScheduleImpactItem {
  activity: string;
  impact_days: number;
  type: 'delay' | 'acceleration' | 'neutral';
  certainty: 'low' | 'medium' | 'high';
  dependencies: string[];
}
