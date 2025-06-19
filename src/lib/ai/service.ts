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
}

// Export singleton instance
export const aiService = new AIService();
