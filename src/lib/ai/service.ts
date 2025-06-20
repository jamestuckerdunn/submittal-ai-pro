// AI Service Layer for SubmittalAI Pro

import {
  createOpenRouterClient,
  getBestAvailableModel,
  calculateTokenCost,
  retryWithBackoff,
  getModelContextLimit,
  logAIUsage,
} from './config';
import {
  DocumentAnalysisRequest,
  AIAnalysisResponse,
  DocumentAnalysisResult,
  AIModel,
  AIRequestOptions,
  TokenLimitExceededError,
  EnhancedAnalysisRequest,
  EnhancedDocumentAnalysisResult,
  AnalysisType,
  AnalysisComplexity,
  AnalysisPriority,
  ProjectContext,
  ComparisonDocument,
} from '@/lib/types/ai';
import { PROMPT_TEMPLATES } from './prompts';

// AI Service Class
export class AIService {
  private client: ReturnType<typeof createOpenRouterClient> | null = null;
  private readonly maxRetries = 3;

  // Lazy initialization of OpenRouter client
  private getClient() {
    if (!this.client) {
      this.client = createOpenRouterClient();
    }
    return this.client;
  }

  // Main Analysis Method
  async analyzeDocument(
    request: DocumentAnalysisRequest,
    options: AIRequestOptions = {}
  ): Promise<AIAnalysisResponse> {
    const startTime = Date.now();
    const analysisId = this.generateAnalysisId();

    try {
      // TODO: Implement actual rate limiting checks with database/cache
      // For now, we'll log the attempt but not enforce limits
      console.log('AI Request:', {
        analysisId,
        userId: request.documentId,
        timestamp: new Date().toISOString(),
      });

      // Select best available model
      const model = getBestAvailableModel(options.model);

      // Prepare prompt
      const prompt = this.buildPrompt(request);

      // Check token limits
      const estimatedTokens = this.estimateTokenCount(prompt);
      const contextLimit = getModelContextLimit(model);

      if (estimatedTokens > contextLimit * 0.8) {
        // 80% of limit
        throw new TokenLimitExceededError(estimatedTokens, contextLimit);
      }

      // Make AI request with retry logic
      const completion = await retryWithBackoff(async () => {
        return await this.getClient().chat.completions.create({
          model: model,
          messages: [
            {
              role: 'system',
              content: PROMPT_TEMPLATES.SYSTEM_PROMPT,
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          max_tokens: options.maxTokens || 4000,
          temperature: options.temperature || 0.1,
          presence_penalty: options.presencePenalty || 0,
          frequency_penalty: options.frequencyPenalty || 0,
        });
      });

      const processingTime = Date.now() - startTime;
      const tokensUsed = completion.usage?.total_tokens || 0;
      const cost = calculateTokenCost(
        model,
        completion.usage?.prompt_tokens || 0,
        completion.usage?.completion_tokens || 0
      );

      // Parse AI response
      const result = this.parseAIResponse(
        completion.choices[0]?.message?.content || ''
      );

      // Log usage for analytics
      logAIUsage(model, tokensUsed, cost, processingTime, true);

      return {
        success: true,
        analysisId,
        model,
        tokensUsed,
        cost,
        processingTime,
        result,
      };
    } catch (error) {
      console.error('AI analysis failed:', error);

      const processingTime = Date.now() - startTime;
      const model = options.model || getBestAvailableModel();

      // Log failed usage for analytics
      logAIUsage(
        model,
        0,
        0,
        processingTime,
        false,
        error instanceof Error ? error.constructor.name : 'UnknownError'
      );

      return {
        success: false,
        analysisId,
        model,
        tokensUsed: 0,
        cost: 0,
        processingTime,
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  // Build Analysis Prompt
  private buildPrompt(request: DocumentAnalysisRequest): string {
    const template = this.selectPromptTemplate(request.analysisType);

    let prompt = template
      .replace('{DOCUMENT_TYPE}', request.documentType)
      .replace('{FILE_NAME}', request.fileName)
      .replace('{DOCUMENT_TEXT}', request.extractedText);

    // Add comparison document if provided
    if (request.comparisonDocumentId && request.analysisType === 'comparison') {
      // In a real implementation, you'd fetch the comparison document text
      prompt += '\n\nCOMPARISON_DOCUMENT: [Document text would be loaded here]';
    }

    // Add custom prompt if provided
    if (request.customPrompt) {
      prompt += `\n\nADDITIONAL_INSTRUCTIONS: ${request.customPrompt}`;
    }

    return prompt;
  }

  // Select Appropriate Prompt Template
  private selectPromptTemplate(analysisType: string): string {
    switch (analysisType) {
      case 'compliance':
        return PROMPT_TEMPLATES.COMPLIANCE_ANALYSIS;
      case 'review':
        return PROMPT_TEMPLATES.GENERAL_REVIEW;
      case 'comparison':
        return PROMPT_TEMPLATES.COMPARISON_ANALYSIS;
      default:
        return PROMPT_TEMPLATES.GENERAL_REVIEW;
    }
  }

  // Parse AI Response JSON
  private parseAIResponse(content: string): DocumentAnalysisResult {
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) ||
        content.match(/```\n([\s\S]*?)\n```/) || [null, content];

      const jsonString = jsonMatch[1] || content;
      const parsed = JSON.parse(jsonString);

      // Validate and structure the response
      return {
        complianceScore: parsed.complianceScore || 0,
        overallAssessment: parsed.overallAssessment || 'requires-review',
        summary: parsed.summary || 'Analysis completed',
        findings: parsed.findings || [],
        recommendations: parsed.recommendations || [],
        categories: parsed.categories || [],
        confidence: parsed.confidence || 0.5,
      };
    } catch (_error) {
      console.error('Failed to parse AI response:', _error);

      // Return fallback structured response
      return {
        complianceScore: 0,
        overallAssessment: 'requires-review',
        summary: 'Failed to parse AI analysis. Please review manually.',
        findings: [],
        recommendations: [
          {
            id: 'manual-review',
            priority: 'high',
            title: 'Manual Review Required',
            description:
              'AI analysis could not be completed. Manual review is recommended.',
            actionItems: [
              'Review document manually',
              'Contact support if issues persist',
            ],
            estimatedEffort: 'medium',
            category: 'documentation',
          },
        ],
        categories: [],
        confidence: 0,
      };
    }
  }

  // Estimate Token Count (rough approximation)
  private estimateTokenCount(text: string): number {
    // Rough approximation: ~4 characters per token
    return Math.ceil(text.length / 4);
  }

  // Generate Unique Analysis ID
  private generateAnalysisId(): string {
    return `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Test AI Connection
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.getClient().chat.completions.create({
        model: 'openai/gpt-4o-mini',
        messages: [
          { role: 'user', content: 'Test connection. Respond with "OK".' },
        ],
        max_tokens: 5,
      });

      return response.choices[0]?.message?.content?.includes('OK') || false;
    } catch (error) {
      console.error('AI connection test failed:', error);
      return false;
    }
  }

  // Get Model Information
  async getModelInfo(
    model: AIModel
  ): Promise<{ available: boolean; contextLimit: number }> {
    try {
      const contextLimit = getModelContextLimit(model);

      // Test model availability with a simple request
      await this.getClient().chat.completions.create({
        model: model,
        messages: [{ role: 'user', content: 'ping' }],
        max_tokens: 1,
      });

      return { available: true, contextLimit };
    } catch {
      return { available: false, contextLimit: getModelContextLimit(model) };
    }
  }

  // Enhanced Analysis Method for Prompt 9
  async analyzeDocumentEnhanced(
    request: EnhancedAnalysisRequest,
    options: AIRequestOptions = {}
  ): Promise<
    AIAnalysisResponse & { enhancedResult?: EnhancedDocumentAnalysisResult }
  > {
    const startTime = Date.now();
    const analysisId = this.generateAnalysisId();

    try {
      console.log('Enhanced AI Request:', {
        analysisId,
        analysisType: request.analysisType,
        complexity: request.complexity,
        priority: request.priority,
        timestamp: new Date().toISOString(),
      });

      // Select model based on complexity and priority
      const model = this.selectModelForComplexity(
        request.complexity,
        request.priority,
        options.model
      );

      // Build enhanced prompt
      const prompt = this.buildEnhancedPrompt(request);

      // Check token limits with enhanced content
      const estimatedTokens = this.estimateTokenCount(prompt);
      const contextLimit = getModelContextLimit(model);

      if (estimatedTokens > contextLimit * 0.8) {
        throw new TokenLimitExceededError(estimatedTokens, contextLimit);
      }

      // Determine max tokens based on complexity
      const maxTokens = this.getMaxTokensForComplexity(
        request.complexity,
        options.maxTokens
      );

      // Make AI request with enhanced parameters
      const completion = await retryWithBackoff(async () => {
        return await this.getClient().chat.completions.create({
          model: model,
          messages: [
            {
              role: 'system',
              content: this.getEnhancedSystemPrompt(request),
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          max_tokens: maxTokens,
          temperature: this.getTemperatureForAnalysis(request.analysisType),
          presence_penalty: options.presencePenalty || 0,
          frequency_penalty: options.frequencyPenalty || 0,
        });
      });

      const processingTime = Date.now() - startTime;
      const tokensUsed = completion.usage?.total_tokens || 0;
      const cost = calculateTokenCost(
        model,
        completion.usage?.prompt_tokens || 0,
        completion.usage?.completion_tokens || 0
      );

      // Parse enhanced AI response
      const enhancedResult = this.parseEnhancedAIResponse(
        completion.choices[0]?.message?.content || '',
        request,
        analysisId,
        model,
        processingTime
      );

      // Log enhanced usage for analytics
      logAIUsage(model, tokensUsed, cost, processingTime, true, undefined);

      return {
        success: true,
        analysisId,
        model,
        tokensUsed,
        cost,
        processingTime,
        result: enhancedResult,
        enhancedResult,
      };
    } catch (error) {
      console.error('Enhanced AI analysis failed:', error);

      const processingTime = Date.now() - startTime;
      const model = options.model || getBestAvailableModel();

      logAIUsage(
        model,
        0,
        0,
        processingTime,
        false,
        error instanceof Error ? error.constructor.name : 'UnknownError'
      );

      return {
        success: false,
        analysisId,
        model,
        tokensUsed: 0,
        cost: 0,
        processingTime,
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  // Multi-Document Analysis
  async analyzeMultipleDocuments(
    primaryRequest: EnhancedAnalysisRequest,
    comparisonDocuments: ComparisonDocument[],
    options: AIRequestOptions = {}
  ): Promise<
    AIAnalysisResponse & { enhancedResult?: EnhancedDocumentAnalysisResult }
  > {
    const enhancedRequest: EnhancedAnalysisRequest = {
      ...primaryRequest,
      comparisonDocuments,
      analysisType: 'comparison',
    };

    return this.analyzeDocumentEnhanced(enhancedRequest, options);
  }

  // Batch Analysis for Multiple Documents
  async analyzeBatchDocuments(
    requests: EnhancedAnalysisRequest[],
    options: AIRequestOptions = {}
  ): Promise<
    Array<
      AIAnalysisResponse & { enhancedResult?: EnhancedDocumentAnalysisResult }
    >
  > {
    const results = [];

    for (const request of requests) {
      try {
        const result = await this.analyzeDocumentEnhanced(request, options);
        results.push(result);

        // Add delay between requests to respect rate limits
        if (requests.length > 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.error(
          `Batch analysis failed for document ${request.documentId}:`,
          error
        );
        results.push({
          success: false,
          analysisId: this.generateAnalysisId(),
          model: options.model || getBestAvailableModel(),
          tokensUsed: 0,
          cost: 0,
          processingTime: 0,
          error:
            error instanceof Error ? error.message : 'Batch analysis failed',
        });
      }
    }

    return results;
  }

  // Select Model Based on Complexity and Priority
  private selectModelForComplexity(
    complexity: AnalysisComplexity,
    priority: AnalysisPriority,
    preferredModel?: AIModel
  ): AIModel {
    if (preferredModel) {
      return preferredModel;
    }

    // High priority or detailed complexity gets the best model
    if (priority === 'critical' || complexity === 'detailed') {
      return 'anthropic/claude-3.5-sonnet:beta';
    }

    // Comprehensive analysis gets GPT-4o
    if (complexity === 'comprehensive') {
      return 'openai/gpt-4o';
    }

    // Standard analysis gets GPT-4o-mini
    if (complexity === 'standard') {
      return 'openai/gpt-4o-mini';
    }

    // Basic analysis gets Claude Haiku
    return 'anthropic/claude-3-haiku:beta';
  }

  // Get Max Tokens Based on Complexity
  private getMaxTokensForComplexity(
    complexity: AnalysisComplexity,
    defaultMaxTokens?: number
  ): number {
    if (defaultMaxTokens) {
      return defaultMaxTokens;
    }

    switch (complexity) {
      case 'detailed':
        return 8000;
      case 'comprehensive':
        return 6000;
      case 'standard':
        return 4000;
      case 'basic':
        return 2000;
      default:
        return 4000;
    }
  }

  // Get Temperature Based on Analysis Type
  private getTemperatureForAnalysis(analysisType: AnalysisType): number {
    switch (analysisType) {
      case 'compliance':
      case 'code-compliance':
        return 0.1; // Very deterministic for compliance
      case 'safety-assessment':
        return 0.2; // Low creativity for safety
      case 'quality-control':
        return 0.3; // Moderate for quality assessment
      case 'performance-evaluation':
        return 0.4; // Slightly more creative for performance
      case 'material-analysis':
        return 0.3; // Moderate for material analysis
      default:
        return 0.2; // Conservative default
    }
  }

  // Build Enhanced Prompt
  private buildEnhancedPrompt(request: EnhancedAnalysisRequest): string {
    let template = this.selectEnhancedPromptTemplate(request.analysisType);

    // Replace basic variables
    template = template
      .replace(/{DOCUMENT_TYPE}/g, request.documentType)
      .replace(/{FILE_NAME}/g, request.fileName)
      .replace(/{DOCUMENT_TEXT}/g, request.extractedText);

    // Add project context if provided
    if (request.projectContext) {
      template = template.replace(
        /{PROJECT_CONTEXT}/g,
        this.formatProjectContext(request.projectContext)
      );
    }

    // Add comparison documents if provided
    if (request.comparisonDocuments && request.comparisonDocuments.length > 0) {
      template = template.replace(
        /{COMPARISON_DOCUMENTS}/g,
        this.formatComparisonDocuments(request.comparisonDocuments)
      );
    }

    // Add focus areas if specified
    if (request.focusAreas && request.focusAreas.length > 0) {
      template += `\n\nFOCUS AREAS: ${request.focusAreas.join(', ')}`;
    }

    // Add custom criteria if provided
    if (request.customCriteria && request.customCriteria.length > 0) {
      template += `\n\nCUSTOM CRITERIA:\n${request.customCriteria
        .map(criteria => `- ${criteria.name}: ${criteria.description}`)
        .join('\n')}`;
    }

    // Add complexity-specific instructions
    template += this.getComplexityInstructions(request.complexity);

    return template;
  }

  // Select Enhanced Prompt Template
  private selectEnhancedPromptTemplate(analysisType: AnalysisType): string {
    switch (analysisType) {
      case 'safety-assessment':
        return PROMPT_TEMPLATES.SAFETY_ASSESSMENT;
      case 'code-compliance':
        return PROMPT_TEMPLATES.CODE_COMPLIANCE_DEEP;
      case 'quality-control':
        return PROMPT_TEMPLATES.QUALITY_CONTROL;
      case 'performance-evaluation':
        return PROMPT_TEMPLATES.PERFORMANCE_EVALUATION;
      case 'material-analysis':
        return PROMPT_TEMPLATES.MATERIAL_ANALYSIS;
      case 'comparison':
        return PROMPT_TEMPLATES.MULTI_DOCUMENT_COMPARISON;
      case 'compliance':
        return PROMPT_TEMPLATES.COMPLIANCE_ANALYSIS;
      case 'specification-review':
        return PROMPT_TEMPLATES.GENERAL_REVIEW;
      default:
        return PROMPT_TEMPLATES.GENERAL_REVIEW;
    }
  }

  // Get Enhanced System Prompt
  private getEnhancedSystemPrompt(request: EnhancedAnalysisRequest): string {
    let systemPrompt = PROMPT_TEMPLATES.SYSTEM_PROMPT;

    // Add complexity-specific instructions
    systemPrompt += this.getComplexitySystemInstructions(request.complexity);

    // Add analysis type specific instructions
    systemPrompt += this.getAnalysisTypeSystemInstructions(
      request.analysisType
    );

    return systemPrompt;
  }

  // Format Project Context
  private formatProjectContext(context: ProjectContext): string {
    return `
Project Type: ${context.projectType}
Building Codes: ${context.buildingCodes.join(', ')}
Jurisdiction: ${context.jurisdiction}
${context.climateZone ? `Climate Zone: ${context.climateZone}` : ''}
${context.seismicZone ? `Seismic Zone: ${context.seismicZone}` : ''}
Project Phase: ${context.projectPhase}
${context.specialRequirements ? `Special Requirements: ${context.specialRequirements.join(', ')}` : ''}
${context.contractorInfo ? `Contractor: ${context.contractorInfo.name} (License: ${context.contractorInfo.license})` : ''}
    `.trim();
  }

  // Format Comparison Documents
  private formatComparisonDocuments(documents: ComparisonDocument[]): string {
    return documents
      .map(
        doc => `
${doc.type.toUpperCase()}: ${doc.name}
${doc.version ? `Version: ${doc.version}` : ''}
Priority: ${doc.priority}/10
Content:
${doc.content}
      `
      )
      .join('\n---\n');
  }

  // Get Complexity Instructions
  private getComplexityInstructions(complexity: AnalysisComplexity): string {
    switch (complexity) {
      case 'detailed':
        return `\n\nANALYSIS DEPTH: DETAILED
- Provide exhaustive analysis with maximum detail
- Include all possible findings and recommendations
- Reference specific code sections and standards
- Provide detailed corrective action plans
- Include cost and schedule impact analysis
- Generate comprehensive action items`;

      case 'comprehensive':
        return `\n\nANALYSIS DEPTH: COMPREHENSIVE
- Provide thorough analysis covering all major areas
- Include detailed findings and recommendations
- Reference relevant codes and standards
- Provide actionable corrective actions
- Include risk assessment and mitigation strategies`;

      case 'standard':
        return `\n\nANALYSIS DEPTH: STANDARD
- Provide standard analysis covering key areas
- Include important findings and recommendations
- Reference major codes and standards
- Provide clear corrective actions`;

      case 'basic':
        return `\n\nANALYSIS DEPTH: BASIC
- Provide high-level analysis of critical issues
- Include major findings and recommendations
- Focus on compliance and safety issues`;

      default:
        return '';
    }
  }

  // Get Complexity System Instructions
  private getComplexitySystemInstructions(
    complexity: AnalysisComplexity
  ): string {
    switch (complexity) {
      case 'detailed':
        return `\n\nDetailed Analysis Mode: Provide exhaustive analysis with maximum thoroughness. Include all possible findings, detailed explanations, specific code references, and comprehensive recommendations.`;
      case 'comprehensive':
        return `\n\nComprehensive Analysis Mode: Provide thorough analysis covering all major aspects. Include detailed findings and actionable recommendations.`;
      case 'standard':
        return `\n\nStandard Analysis Mode: Provide standard depth analysis focusing on key compliance and quality issues.`;
      case 'basic':
        return `\n\nBasic Analysis Mode: Provide high-level analysis focusing on critical issues and major compliance concerns.`;
      default:
        return '';
    }
  }

  // Get Analysis Type System Instructions
  private getAnalysisTypeSystemInstructions(
    analysisType: AnalysisType
  ): string {
    switch (analysisType) {
      case 'safety-assessment':
        return `\n\nSafety Focus: Prioritize safety hazards, risk assessment, and mitigation strategies. Apply OSHA standards and industry safety best practices.`;
      case 'code-compliance':
        return `\n\nCode Compliance Focus: Strictly evaluate against building codes, regulations, and standards. Provide specific code citations and compliance gaps.`;
      case 'quality-control':
        return `\n\nQuality Control Focus: Evaluate quality control measures, testing protocols, and quality assurance procedures.`;
      case 'performance-evaluation':
        return `\n\nPerformance Focus: Analyze performance characteristics, specifications compliance, and optimization opportunities.`;
      default:
        return '';
    }
  }

  // Parse Enhanced AI Response
  private parseEnhancedAIResponse(
    content: string,
    request: EnhancedAnalysisRequest,
    analysisId: string,
    model: AIModel,
    processingTime: number
  ): EnhancedDocumentAnalysisResult {
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) ||
        content.match(/```\n([\s\S]*?)\n```/) || [null, content];

      const jsonString = jsonMatch[1] || content;
      const parsed = JSON.parse(jsonString);

      // Create enhanced result with all required properties
      return {
        // Base properties
        complianceScore: parsed.complianceScore || 0,
        overallAssessment: parsed.overallAssessment || 'requires-review',
        summary: parsed.summary || 'Analysis completed',
        findings: parsed.findings || [],
        recommendations: parsed.recommendations || [],
        categories: parsed.categories || [],
        confidence: parsed.confidence || 0.5,

        // Enhanced properties
        analysisMetadata: {
          analysisId,
          timestamp: new Date().toISOString(),
          modelUsed: model,
          analysisType: request.analysisType,
          complexity: request.complexity,
          processingTime,
          confidenceScore: parsed.confidence || 0.5,
          completenessScore: parsed.completenessScore || 0.8,
          reviewerNotes: parsed.reviewerNotes,
        },
        detailedFindings: parsed.detailedFindings || [],
        complianceMatrix: parsed.complianceMatrix || {
          overall_score: parsed.complianceScore || 0,
          categories: [],
          summary: parsed.summary || 'Analysis completed',
          critical_issues: 0,
          major_issues: 0,
          minor_issues: 0,
          compliant_items: 0,
        },
        riskAssessment: parsed.riskAssessment || {
          overall_risk: 'medium',
          risk_factors: [],
          mitigation_strategies: [],
          residual_risk: 'medium',
        },
        qualityMetrics: parsed.qualityMetrics || {
          documentation_quality: 70,
          technical_accuracy: 70,
          completeness: 70,
          clarity: 70,
          consistency: 70,
          compliance_readiness: 70,
          overall_quality: 70,
          improvement_areas: [],
        },
        actionItems: parsed.actionItems || [],
        alternativeOptions: parsed.alternativeOptions,
        costImpactAnalysis: parsed.costImpactAnalysis,
        scheduleImpactAnalysis: parsed.scheduleImpactAnalysis,
      };
    } catch (_error) {
      console.error('Failed to parse AI response:', _error);

      // Return fallback structured response with all required properties
      return {
        // Base properties
        complianceScore: 0,
        overallAssessment: 'requires-review',
        summary: 'Failed to parse AI analysis. Please review manually.',
        findings: [],
        recommendations: [
          {
            id: 'manual-review',
            priority: 'high',
            title: 'Manual Review Required',
            description:
              'AI analysis could not be completed. Manual review is recommended.',
            actionItems: [
              'Review document manually',
              'Contact support if issues persist',
            ],
            estimatedEffort: 'medium',
            category: 'documentation',
          },
        ],
        categories: [],
        confidence: 0,

        // Enhanced properties with defaults
        analysisMetadata: {
          analysisId,
          timestamp: new Date().toISOString(),
          modelUsed: model,
          analysisType: request.analysisType,
          complexity: request.complexity,
          processingTime,
          confidenceScore: 0,
          completenessScore: 0,
        },
        detailedFindings: [],
        complianceMatrix: {
          overall_score: 0,
          categories: [],
          summary: 'Analysis failed - manual review required',
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
          improvement_areas: ['Manual review required'],
        },
        actionItems: [
          {
            id: 'manual-review-action',
            title: 'Manual Review Required',
            description: 'AI analysis failed - manual review needed',
            priority: 'critical',
            category: 'review',
            assigned_to: 'reviewer',
            status: 'pending',
            related_findings: [],
          },
        ],
      };
    }
  }
}

// Export singleton instance
export const aiService = new AIService();
