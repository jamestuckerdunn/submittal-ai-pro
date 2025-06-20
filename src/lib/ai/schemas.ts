// JSON Schema Definitions for AI Analysis Output Validation
// Ensures structured analysis results conform to expected formats

import { z } from 'zod';

// Base schemas for common types
export const SeveritySchema = z.enum([
  'critical',
  'major',
  'minor',
  'informational',
]);
export const RiskLevelSchema = z.enum(['low', 'medium', 'high', 'critical']);
export const ComplianceStatusSchema = z.enum([
  'compliant',
  'non-compliant',
  'partially-compliant',
  'unclear',
]);
export const OverallAssessmentSchema = z.enum([
  'compliant',
  'non-compliant',
  'partially-compliant',
  'requires-review',
]);

// Finding Category Schema
export const FindingCategorySchema = z.enum([
  'material-specifications',
  'dimensional-requirements',
  'performance-standards',
  'testing-requirements',
  'installation-procedures',
  'quality-control',
  'documentation',
  'regulatory-compliance',
  'safety-requirements',
  'environmental-considerations',
]);

// Document Location Schema
export const DocumentLocationSchema = z.object({
  page: z.number().optional(),
  section: z.string().optional(),
  paragraph: z.number().optional(),
  lineNumber: z.number().optional(),
  excerpt: z.string(),
});

// Finding Schema
export const FindingSchema = z.object({
  id: z.string(),
  category: FindingCategorySchema,
  severity: SeveritySchema,
  title: z.string(),
  description: z.string(),
  location: DocumentLocationSchema,
  compliance: ComplianceStatusSchema,
  requiredAction: z.string().optional(),
  deadline: z.string().optional(),
  confidence: z.number().min(0).max(1),
});

// Detailed Finding Schema (extends Finding)
export const DetailedFindingSchema = FindingSchema.extend({
  section: z.string(),
  subsection: z.string().optional(),
  pageNumber: z.number().optional(),
  lineNumber: z.number().optional(),
  context: z.string(),
  impact: z.enum(['low', 'medium', 'high', 'critical']),
  urgency: z.enum(['low', 'medium', 'high', 'immediate']),
  effort: z.enum(['minimal', 'moderate', 'significant', 'major']),
  riskLevel: RiskLevelSchema,
  complianceStatus: z.enum([
    'compliant',
    'non-compliant',
    'partially-compliant',
    'unclear',
  ]),
  corrective_action: z.string(),
  timeline: z.string(),
  responsible_party: z.string(),
  verification_method: z.string(),
  relatedFindings: z.array(z.string()).default([]),
  attachments: z.array(z.string()).default([]),
});

// Recommendation Schema
export const RecommendationSchema = z.object({
  id: z.string(),
  priority: z.enum(['high', 'medium', 'low']),
  title: z.string(),
  description: z.string(),
  actionItems: z.array(z.string()),
  estimatedEffort: z.enum(['low', 'medium', 'high']),
  category: FindingCategorySchema,
});

// Category Analysis Schema
export const CategoryAnalysisSchema = z.object({
  category: FindingCategorySchema,
  score: z.number().min(0).max(100),
  status: z.enum(['pass', 'fail', 'partial', 'not-applicable']),
  findingCount: z.number().min(0),
  summary: z.string(),
});

// Compliance Category Schema
export const ComplianceCategorySchema = z.object({
  name: z.string(),
  score: z.number().min(0).max(100),
  weight: z.number().min(0).max(1),
  status: z.enum(['pass', 'fail', 'conditional', 'review-required']),
  items_checked: z.number().min(0),
  items_passed: z.number().min(0),
  critical_failures: z.array(z.string()),
  recommendations: z.array(z.string()),
});

// Compliance Matrix Schema
export const ComplianceMatrixSchema = z.object({
  overall_score: z.number().min(0).max(100),
  categories: z.array(ComplianceCategorySchema),
  summary: z.string(),
  critical_issues: z.number().min(0),
  major_issues: z.number().min(0),
  minor_issues: z.number().min(0),
  compliant_items: z.number().min(0),
});

// Risk Factor Schema
export const RiskFactorSchema = z.object({
  category: z.string(),
  description: z.string(),
  probability: z.enum(['low', 'medium', 'high']),
  impact: z.enum(['low', 'medium', 'high', 'critical']),
  risk_score: z.number().min(0).max(10),
  mitigation_required: z.boolean(),
});

// Mitigation Strategy Schema
export const MitigationStrategySchema = z.object({
  risk_id: z.string(),
  strategy: z.string(),
  implementation_effort: z.enum(['low', 'medium', 'high']),
  effectiveness: z.enum(['low', 'medium', 'high']),
  timeline: z.string(),
  responsible_party: z.string(),
});

// Risk Assessment Schema
export const RiskAssessmentSchema = z.object({
  overall_risk: RiskLevelSchema,
  risk_factors: z.array(RiskFactorSchema),
  mitigation_strategies: z.array(MitigationStrategySchema),
  residual_risk: RiskLevelSchema,
});

// Quality Metrics Schema
export const QualityMetricsSchema = z.object({
  documentation_quality: z.number().min(0).max(100),
  technical_accuracy: z.number().min(0).max(100),
  completeness: z.number().min(0).max(100),
  clarity: z.number().min(0).max(100),
  consistency: z.number().min(0).max(100),
  compliance_readiness: z.number().min(0).max(100),
  overall_quality: z.number().min(0).max(100),
  improvement_areas: z.array(z.string()),
});

// Action Item Schema
export const ActionItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  category: z.string(),
  assigned_to: z.string(),
  due_date: z.string().optional(),
  estimated_hours: z.number().optional(),
  dependencies: z.array(z.string()).default([]),
  status: z.enum(['pending', 'in-progress', 'completed', 'blocked']),
  related_findings: z.array(z.string()),
});

// Alternative Option Schema
export const AlternativeOptionSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  pros: z.array(z.string()),
  cons: z.array(z.string()),
  cost_impact: z.enum(['decrease', 'neutral', 'increase']),
  schedule_impact: z.enum(['decrease', 'neutral', 'increase']),
  quality_impact: z.enum(['decrease', 'neutral', 'increase']),
  compliance_impact: z.enum(['negative', 'neutral', 'positive']),
  recommendation: z.enum([
    'not-recommended',
    'consider',
    'recommended',
    'highly-recommended',
  ]),
});

// Cost Impact Analysis Schema
export const CostImpactItemSchema = z.object({
  category: z.string(),
  description: z.string(),
  amount: z.number(),
  type: z.enum(['increase', 'decrease', 'neutral']),
  certainty: z.enum(['low', 'medium', 'high']),
});

export const CostImpactAnalysisSchema = z.object({
  total_impact: z.number(),
  currency: z.string(),
  impact_breakdown: z.array(CostImpactItemSchema),
  confidence_level: z.enum(['low', 'medium', 'high']),
  assumptions: z.array(z.string()),
});

// Schedule Impact Analysis Schema
export const ScheduleImpactItemSchema = z.object({
  activity: z.string(),
  impact_days: z.number(),
  type: z.enum(['delay', 'acceleration', 'neutral']),
  certainty: z.enum(['low', 'medium', 'high']),
  dependencies: z.array(z.string()),
});

export const ScheduleImpactAnalysisSchema = z.object({
  total_impact_days: z.number(),
  impact_breakdown: z.array(ScheduleImpactItemSchema),
  critical_path_affected: z.boolean(),
  confidence_level: z.enum(['low', 'medium', 'high']),
  assumptions: z.array(z.string()),
});

// Analysis Metadata Schema
export const AnalysisMetadataSchema = z.object({
  analysisId: z.string(),
  timestamp: z.string(),
  modelUsed: z.enum([
    'anthropic/claude-3.5-sonnet:beta',
    'openai/gpt-4o',
    'openai/gpt-4o-mini',
    'anthropic/claude-3-haiku:beta',
  ]),
  analysisType: z.enum(['compliance', 'review', 'comparison']),
  complexity: z.enum(['basic', 'standard', 'comprehensive', 'detailed']),
  processingTime: z.number(),
  confidenceScore: z.number().min(0).max(1),
  completenessScore: z.number().min(0).max(1),
  reviewerNotes: z.string().nullable().optional(),
});

// Base Document Analysis Result Schema
export const DocumentAnalysisResultSchema = z.object({
  complianceScore: z.number().min(0).max(100),
  overallAssessment: OverallAssessmentSchema,
  summary: z.string(),
  findings: z.array(FindingSchema),
  recommendations: z.array(RecommendationSchema),
  categories: z.array(CategoryAnalysisSchema),
  confidence: z.number().min(0).max(1),
});

// Enhanced Document Analysis Result Schema
export const EnhancedDocumentAnalysisResultSchema =
  DocumentAnalysisResultSchema.extend({
    analysisMetadata: AnalysisMetadataSchema,
    detailedFindings: z.array(DetailedFindingSchema),
    complianceMatrix: ComplianceMatrixSchema,
    riskAssessment: RiskAssessmentSchema,
    qualityMetrics: QualityMetricsSchema,
    actionItems: z.array(ActionItemSchema),
    alternativeOptions: z.array(AlternativeOptionSchema).optional(),
    costImpactAnalysis: CostImpactAnalysisSchema.optional(),
    scheduleImpactAnalysis: ScheduleImpactAnalysisSchema.optional(),
  });

// AI Analysis Response Schema
export const AIAnalysisResponseSchema = z.object({
  success: z.boolean(),
  analysisId: z.string(),
  model: z.string(),
  tokensUsed: z.number(),
  cost: z.number(),
  processingTime: z.number(),
  result: DocumentAnalysisResultSchema.optional(),
  enhancedResult: EnhancedDocumentAnalysisResultSchema.optional(),
  error: z.string().optional(),
});

// Discrepancy Schemas
export const DiscrepancyTypeSchema = z.enum([
  'missing-requirement',
  'non-compliant-specification',
  'incorrect-value',
  'incomplete-information',
  'contradictory-information',
  'format-deviation',
  'calculation-error',
  'reference-missing',
  'outdated-standard',
  'inconsistent-data',
]);

export const DiscrepancyImpactSchema = z.enum([
  'safety-critical',
  'code-compliance',
  'performance-affecting',
  'cost-impacting',
  'schedule-affecting',
  'quality-reducing',
  'documentation-only',
]);

export const SpecificationReferenceSchema = z.object({
  section: z.string(),
  subsection: z.string().optional(),
  paragraph: z.string().optional(),
  page: z.number().optional(),
  requirement: z.string(),
  standard: z.string().optional(),
  version: z.string().optional(),
});

export const SubmittalReferenceSchema = z.object({
  section: z.string(),
  subsection: z.string().optional(),
  page: z.number().optional(),
  content: z.string(),
  context: z.string(),
});

export const DiscrepancySchema = z.object({
  id: z.string(),
  type: DiscrepancyTypeSchema,
  severity: SeveritySchema,
  impact: DiscrepancyImpactSchema,
  category: FindingCategorySchema,
  title: z.string(),
  description: z.string(),
  specificationReference: SpecificationReferenceSchema,
  submittalReference: SubmittalReferenceSchema,
  expectedValue: z.string(),
  actualValue: z.string(),
  deviation: z.string(),
  riskLevel: RiskLevelSchema,
  confidenceLevel: z.number().min(0).max(1),
  detectionMethod: z.enum([
    'rule-based',
    'ai-analysis',
    'calculation',
    'cross-reference',
  ]),
  correctionRequired: z.boolean(),
  suggestedResolution: z.string(),
  estimatedEffort: z.enum(['minimal', 'moderate', 'significant', 'major']),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  detectedAt: z.string(),
  reviewedBy: z.string().optional(),
  status: z.enum(['new', 'acknowledged', 'in-progress', 'resolved', 'waived']),
});

// Comparison Algorithm Schemas
export const ComparisonMatchSchema = z.object({
  submittalSection: z.string(),
  specificationSection: z.string(),
  matchScore: z.number().min(0).max(1),
  matchType: z.enum(['exact', 'partial', 'semantic']),
  confidence: z.number().min(0).max(1),
});

export const ComparisonDifferenceSchema = z.object({
  id: z.string(),
  submittalContent: z.string(),
  specificationRequirement: z.string(),
  severity: SeveritySchema,
  category: FindingCategorySchema,
  impact: z.string(),
  correctionRequired: z.boolean(),
});

export const MissingElementSchema = z.object({
  id: z.string(),
  specificationRequirement: z.string(),
  category: FindingCategorySchema,
  criticality: z.enum(['critical', 'major', 'minor']),
  suggestedAction: z.string(),
});

export const ExcessElementSchema = z.object({
  id: z.string(),
  submittalContent: z.string(),
  category: FindingCategorySchema,
  relevance: z.enum(['relevant', 'irrelevant', 'unclear']),
  action: z.enum(['accept', 'clarify', 'remove']),
});

export const ComparisonResultSchema = z.object({
  similarities: z.array(ComparisonMatchSchema),
  differences: z.array(ComparisonDifferenceSchema),
  missingElements: z.array(MissingElementSchema),
  excessElements: z.array(ExcessElementSchema),
  confidenceScore: z.number().min(0).max(1),
});

// Section Analysis Schema
export const SectionAnalysisSchema = z.object({
  sectionName: z.string(),
  complianceScore: z.number().min(0).max(100),
  status: z.enum([
    'compliant',
    'non-compliant',
    'partially-compliant',
    'not-found',
  ]),
  findings: z.array(DetailedFindingSchema),
  recommendations: z.array(z.string()),
  criticalIssues: z.number().min(0),
  majorIssues: z.number().min(0),
  minorIssues: z.number().min(0),
});

// Validation Functions
export class SchemaValidator {
  // Validate base document analysis result
  static validateDocumentAnalysisResult(
    data: unknown
  ): z.infer<typeof DocumentAnalysisResultSchema> {
    try {
      return DocumentAnalysisResultSchema.parse(data);
    } catch (error) {
      console.error('Document Analysis Result validation failed:', error);
      throw new Error(`Invalid document analysis result format: ${error}`);
    }
  }

  // Validate enhanced document analysis result
  static validateEnhancedDocumentAnalysisResult(
    data: unknown
  ): z.infer<typeof EnhancedDocumentAnalysisResultSchema> {
    try {
      return EnhancedDocumentAnalysisResultSchema.parse(data);
    } catch (error) {
      console.error(
        'Enhanced Document Analysis Result validation failed:',
        error
      );
      throw new Error(
        `Invalid enhanced document analysis result format: ${error}`
      );
    }
  }

  // Validate AI analysis response
  static validateAIAnalysisResponse(
    data: unknown
  ): z.infer<typeof AIAnalysisResponseSchema> {
    try {
      return AIAnalysisResponseSchema.parse(data);
    } catch (error) {
      console.error('AI Analysis Response validation failed:', error);
      throw new Error(`Invalid AI analysis response format: ${error}`);
    }
  }

  // Validate comparison result
  static validateComparisonResult(
    data: unknown
  ): z.infer<typeof ComparisonResultSchema> {
    try {
      return ComparisonResultSchema.parse(data);
    } catch (error) {
      console.error('Comparison Result validation failed:', error);
      throw new Error(`Invalid comparison result format: ${error}`);
    }
  }

  // Validate discrepancy
  static validateDiscrepancy(data: unknown): z.infer<typeof DiscrepancySchema> {
    try {
      return DiscrepancySchema.parse(data);
    } catch (error) {
      console.error('Discrepancy validation failed:', error);
      throw new Error(`Invalid discrepancy format: ${error}`);
    }
  }

  // Validate compliance matrix
  static validateComplianceMatrix(
    data: unknown
  ): z.infer<typeof ComplianceMatrixSchema> {
    try {
      return ComplianceMatrixSchema.parse(data);
    } catch (error) {
      console.error('Compliance Matrix validation failed:', error);
      throw new Error(`Invalid compliance matrix format: ${error}`);
    }
  }

  // Validate risk assessment
  static validateRiskAssessment(
    data: unknown
  ): z.infer<typeof RiskAssessmentSchema> {
    try {
      return RiskAssessmentSchema.parse(data);
    } catch (error) {
      console.error('Risk Assessment validation failed:', error);
      throw new Error(`Invalid risk assessment format: ${error}`);
    }
  }

  // Validate quality metrics
  static validateQualityMetrics(
    data: unknown
  ): z.infer<typeof QualityMetricsSchema> {
    try {
      return QualityMetricsSchema.parse(data);
    } catch (error) {
      console.error('Quality Metrics validation failed:', error);
      throw new Error(`Invalid quality metrics format: ${error}`);
    }
  }

  // Validate section analysis
  static validateSectionAnalysis(
    data: unknown
  ): z.infer<typeof SectionAnalysisSchema> {
    try {
      return SectionAnalysisSchema.parse(data);
    } catch (error) {
      console.error('Section Analysis validation failed:', error);
      throw new Error(`Invalid section analysis format: ${error}`);
    }
  }

  // Validate detailed finding
  static validateDetailedFinding(
    data: unknown
  ): z.infer<typeof DetailedFindingSchema> {
    try {
      return DetailedFindingSchema.parse(data);
    } catch (error) {
      console.error('Detailed Finding validation failed:', error);
      throw new Error(`Invalid detailed finding format: ${error}`);
    }
  }

  // Validate action item
  static validateActionItem(data: unknown): z.infer<typeof ActionItemSchema> {
    try {
      return ActionItemSchema.parse(data);
    } catch (error) {
      console.error('Action Item validation failed:', error);
      throw new Error(`Invalid action item format: ${error}`);
    }
  }

  // Sanitize and validate data with fallbacks
  static sanitizeAndValidateAnalysisResult(
    data: unknown
  ): z.infer<typeof EnhancedDocumentAnalysisResultSchema> {
    try {
      // First try direct validation
      return this.validateEnhancedDocumentAnalysisResult(data);
    } catch (error) {
      console.warn('Direct validation failed, attempting sanitization...');

      // Attempt to sanitize and provide defaults
      const sanitized = this.sanitizeAnalysisData(data);
      return this.validateEnhancedDocumentAnalysisResult(sanitized);
    }
  }

  // Sanitize analysis data by providing defaults for missing or invalid fields
  private static sanitizeAnalysisData(data: any): any {
    if (!data || typeof data !== 'object') {
      return this.getDefaultAnalysisResult();
    }

    return {
      // Base properties with defaults
      complianceScore: this.sanitizeNumber(data.complianceScore, 0, 100) ?? 0,
      overallAssessment:
        this.sanitizeEnum(data.overallAssessment, [
          'compliant',
          'non-compliant',
          'partially-compliant',
          'requires-review',
        ]) ?? 'requires-review',
      summary: this.sanitizeString(data.summary) ?? 'Analysis completed',
      findings: Array.isArray(data.findings) ? data.findings : [],
      recommendations: Array.isArray(data.recommendations)
        ? data.recommendations
        : [],
      categories: Array.isArray(data.categories) ? data.categories : [],
      confidence: this.sanitizeNumber(data.confidence, 0, 1) ?? 0.5,

      // Enhanced properties with defaults
      analysisMetadata: this.sanitizeAnalysisMetadata(data.analysisMetadata),
      detailedFindings: Array.isArray(data.detailedFindings)
        ? data.detailedFindings
        : [],
      complianceMatrix: this.sanitizeComplianceMatrix(data.complianceMatrix),
      riskAssessment: this.sanitizeRiskAssessment(data.riskAssessment),
      qualityMetrics: this.sanitizeQualityMetrics(data.qualityMetrics),
      actionItems: Array.isArray(data.actionItems) ? data.actionItems : [],
      alternativeOptions: Array.isArray(data.alternativeOptions)
        ? data.alternativeOptions
        : undefined,
      costImpactAnalysis: data.costImpactAnalysis || undefined,
      scheduleImpactAnalysis: data.scheduleImpactAnalysis || undefined,
    };
  }

  // Helper sanitization methods
  private static sanitizeNumber(
    value: any,
    min?: number,
    max?: number
  ): number | null {
    const num = Number(value);
    if (isNaN(num)) return null;
    if (min !== undefined && num < min) return min;
    if (max !== undefined && num > max) return max;
    return num;
  }

  private static sanitizeString(value: any): string | null {
    return typeof value === 'string' ? value : null;
  }

  private static sanitizeEnum(
    value: any,
    validValues: string[]
  ): string | null {
    return validValues.includes(value) ? value : null;
  }

  private static sanitizeAnalysisMetadata(data: any): any {
    return {
      analysisId:
        this.sanitizeString(data?.analysisId) ?? `analysis-${Date.now()}`,
      timestamp:
        this.sanitizeString(data?.timestamp) ?? new Date().toISOString(),
      modelUsed: this.sanitizeString(data?.modelUsed) ?? 'unknown',
      analysisType: this.sanitizeString(data?.analysisType) ?? 'review',
      complexity:
        this.sanitizeEnum(data?.complexity, [
          'basic',
          'standard',
          'comprehensive',
          'detailed',
        ]) ?? 'standard',
      processingTime: this.sanitizeNumber(data?.processingTime) ?? 0,
      confidenceScore: this.sanitizeNumber(data?.confidenceScore, 0, 1) ?? 0.5,
      completenessScore:
        this.sanitizeNumber(data?.completenessScore, 0, 1) ?? 0.5,
      reviewerNotes: this.sanitizeString(data?.reviewerNotes) || null,
    };
  }

  private static sanitizeComplianceMatrix(data: any): any {
    return {
      overall_score: this.sanitizeNumber(data?.overall_score, 0, 100) ?? 0,
      categories: Array.isArray(data?.categories) ? data.categories : [],
      summary: this.sanitizeString(data?.summary) ?? 'Analysis completed',
      critical_issues: this.sanitizeNumber(data?.critical_issues) ?? 0,
      major_issues: this.sanitizeNumber(data?.major_issues) ?? 0,
      minor_issues: this.sanitizeNumber(data?.minor_issues) ?? 0,
      compliant_items: this.sanitizeNumber(data?.compliant_items) ?? 0,
    };
  }

  private static sanitizeRiskAssessment(data: any): any {
    return {
      overall_risk:
        this.sanitizeEnum(data?.overall_risk, [
          'low',
          'medium',
          'high',
          'critical',
        ]) ?? 'medium',
      risk_factors: Array.isArray(data?.risk_factors) ? data.risk_factors : [],
      mitigation_strategies: Array.isArray(data?.mitigation_strategies)
        ? data.mitigation_strategies
        : [],
      residual_risk:
        this.sanitizeEnum(data?.residual_risk, [
          'low',
          'medium',
          'high',
          'critical',
        ]) ?? 'medium',
    };
  }

  private static sanitizeQualityMetrics(data: any): any {
    return {
      documentation_quality:
        this.sanitizeNumber(data?.documentation_quality, 0, 100) ?? 70,
      technical_accuracy:
        this.sanitizeNumber(data?.technical_accuracy, 0, 100) ?? 70,
      completeness: this.sanitizeNumber(data?.completeness, 0, 100) ?? 70,
      clarity: this.sanitizeNumber(data?.clarity, 0, 100) ?? 70,
      consistency: this.sanitizeNumber(data?.consistency, 0, 100) ?? 70,
      compliance_readiness:
        this.sanitizeNumber(data?.compliance_readiness, 0, 100) ?? 70,
      overall_quality: this.sanitizeNumber(data?.overall_quality, 0, 100) ?? 70,
      improvement_areas: Array.isArray(data?.improvement_areas)
        ? data.improvement_areas
        : [],
    };
  }

  private static getDefaultAnalysisResult(): any {
    return {
      complianceScore: 0,
      overallAssessment: 'requires-review',
      summary: 'Analysis failed - default result provided',
      findings: [],
      recommendations: [],
      categories: [],
      confidence: 0,
      analysisMetadata: {
        analysisId: `fallback-${Date.now()}`,
        timestamp: new Date().toISOString(),
        modelUsed: 'fallback',
        analysisType: 'review',
        complexity: 'basic',
        processingTime: 0,
        confidenceScore: 0,
        completenessScore: 0,
      },
      detailedFindings: [],
      complianceMatrix: {
        overall_score: 0,
        categories: [],
        summary: 'Default compliance matrix',
        critical_issues: 0,
        major_issues: 0,
        minor_issues: 0,
        compliant_items: 0,
      },
      riskAssessment: {
        overall_risk: 'high',
        risk_factors: [],
        mitigation_strategies: [],
        residual_risk: 'high',
      },
      qualityMetrics: {
        documentation_quality: 0,
        technical_accuracy: 0,
        completeness: 0,
        clarity: 0,
        consistency: 0,
        compliance_readiness: 0,
        overall_quality: 0,
        improvement_areas: ['Analysis failed'],
      },
      actionItems: [],
    };
  }
}

// All schemas are already exported above

// Type exports
export type ValidatedDocumentAnalysisResult = z.infer<
  typeof DocumentAnalysisResultSchema
>;
export type ValidatedEnhancedDocumentAnalysisResult = z.infer<
  typeof EnhancedDocumentAnalysisResultSchema
>;
export type ValidatedAIAnalysisResponse = z.infer<
  typeof AIAnalysisResponseSchema
>;
export type ValidatedComparisonResult = z.infer<typeof ComparisonResultSchema>;
export type ValidatedDiscrepancy = z.infer<typeof DiscrepancySchema>;
export type ValidatedComplianceMatrix = z.infer<typeof ComplianceMatrixSchema>;
export type ValidatedRiskAssessment = z.infer<typeof RiskAssessmentSchema>;
export type ValidatedQualityMetrics = z.infer<typeof QualityMetricsSchema>;
export type ValidatedSectionAnalysis = z.infer<typeof SectionAnalysisSchema>;
export type ValidatedDetailedFinding = z.infer<typeof DetailedFindingSchema>;
export type ValidatedActionItem = z.infer<typeof ActionItemSchema>;
