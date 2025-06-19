// OpenRouter AI Configuration for SubmittalAI Pro

import { OpenAI } from 'openai';
import {
  OpenRouterConfig,
  AIModel,
  AIProcessingError,
  ModelUnavailableError,
} from '@/lib/types/ai';

// OpenRouter Configuration
const OPENROUTER_CONFIG: OpenRouterConfig = {
  apiKey: process.env.OPENROUTER_API_KEY || '',
  baseURL: 'https://openrouter.ai/api/v1',
  defaultModel: 'anthropic/claude-3.5-sonnet:beta',
  fallbackModels: [
    'openai/gpt-4o',
    'openai/gpt-4o-mini',
    'anthropic/claude-3-haiku:beta',
  ],
  maxRetries: 3,
  retryDelay: 1000, // ms
};

// Model Pricing (per 1K tokens)
export const MODEL_PRICING = {
  'anthropic/claude-3.5-sonnet:beta': { input: 0.003, output: 0.015 },
  'openai/gpt-4o': { input: 0.005, output: 0.015 },
  'openai/gpt-4o-mini': { input: 0.00015, output: 0.0006 },
  'anthropic/claude-3-haiku:beta': { input: 0.00025, output: 0.00125 },
} as const;

// Model Context Limits (tokens)
export const MODEL_CONTEXT_LIMITS = {
  'anthropic/claude-3.5-sonnet:beta': 200000,
  'openai/gpt-4o': 128000,
  'openai/gpt-4o-mini': 128000,
  'anthropic/claude-3-haiku:beta': 200000,
} as const;

// Create OpenRouter Client
export function createOpenRouterClient(): OpenAI {
  if (!OPENROUTER_CONFIG.apiKey) {
    throw new AIProcessingError(
      'OpenRouter API key is not configured',
      'MISSING_API_KEY'
    );
  }

  return new OpenAI({
    baseURL: OPENROUTER_CONFIG.baseURL,
    apiKey: OPENROUTER_CONFIG.apiKey,
    defaultHeaders: {
      'HTTP-Referer':
        process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      'X-Title': 'SubmittalAI Pro',
    },
  });
}

// Get Available Models with Fallback
export function getAvailableModels(): AIModel[] {
  return [
    OPENROUTER_CONFIG.defaultModel as AIModel,
    ...(OPENROUTER_CONFIG.fallbackModels as AIModel[]),
  ];
}

// Get Model Context Limit
export function getModelContextLimit(model: AIModel): number {
  return MODEL_CONTEXT_LIMITS[model] || 128000;
}

// Calculate Token Cost
export function calculateTokenCost(
  model: AIModel,
  inputTokens: number,
  outputTokens: number
): number {
  const pricing = MODEL_PRICING[model];
  if (!pricing) return 0;

  const inputCost = (inputTokens / 1000) * pricing.input;
  const outputCost = (outputTokens / 1000) * pricing.output;

  return inputCost + outputCost;
}

// Validate Model Availability
export function validateModel(model: AIModel): boolean {
  return getAvailableModels().includes(model);
}

// Get Best Available Model
export function getBestAvailableModel(preferredModel?: AIModel): AIModel {
  const availableModels = getAvailableModels();

  if (preferredModel && validateModel(preferredModel)) {
    return preferredModel;
  }

  return availableModels[0];
}

// Sleep Utility for Retries
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Retry Configuration
export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  exponentialBackoff: boolean;
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: OPENROUTER_CONFIG.maxRetries,
  baseDelay: OPENROUTER_CONFIG.retryDelay,
  maxDelay: 30000,
  exponentialBackoff: true,
};

// Retry with Exponential Backoff
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      // Don't retry on certain errors
      if (error instanceof ModelUnavailableError) {
        throw error;
      }

      if (attempt === config.maxRetries) {
        break;
      }

      // Calculate delay
      let delay = config.baseDelay;
      if (config.exponentialBackoff) {
        delay = Math.min(
          config.baseDelay * Math.pow(2, attempt),
          config.maxDelay
        );
      }

      console.log(`Retry attempt ${attempt + 1} after ${delay}ms`);
      await sleep(delay);
    }
  }

  throw lastError;
}

// Health Check for OpenRouter
export async function checkOpenRouterHealth(): Promise<boolean> {
  try {
    const client = createOpenRouterClient();

    // Simple test request
    await client.chat.completions.create({
      model: 'openai/gpt-4o-mini',
      messages: [{ role: 'user', content: 'Hello' }],
      max_tokens: 5,
    });

    return true;
  } catch (error) {
    console.error('OpenRouter health check failed:', error);
    return false;
  }
}

export { OPENROUTER_CONFIG };
