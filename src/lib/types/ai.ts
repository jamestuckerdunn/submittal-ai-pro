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
