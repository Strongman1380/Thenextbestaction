/**
 * Perplexity AI Client Configuration
 * Uses Perplexity's Sonar models for AI-powered case plan generation
 */

export interface PerplexityMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface PerplexityCompletionOptions {
  model: string;
  messages: PerplexityMessage[];
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  return_citations?: boolean;
  return_images?: boolean;
  return_related_questions?: boolean;
  search_domain_filter?: string[];
  search_recency_filter?: string;
  top_k?: number;
  stream?: boolean;
  presence_penalty?: number;
  frequency_penalty?: number;
}

export interface PerplexityChoice {
  index: number;
  finish_reason: string;
  message: {
    role: string;
    content: string;
  };
  delta?: {
    role?: string;
    content?: string;
  };
}

export interface PerplexityResponse {
  id: string;
  model: string;
  created: number;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  choices: PerplexityChoice[];
  citations?: string[];
  images?: string[];
  related_questions?: string[];
}

/**
 * Perplexity AI Client
 * OpenAI-compatible client for Perplexity's API
 */
export class PerplexityClient {
  private apiKey: string;
  private baseURL: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.PERPLEXITY_API_KEY || '';
    this.baseURL = 'https://api.perplexity.ai';

    if (!this.apiKey) {
      throw new Error('Perplexity API key is required. Set PERPLEXITY_API_KEY environment variable.');
    }
  }

  /**
   * Create a chat completion using Perplexity AI
   */
  async createChatCompletion(options: PerplexityCompletionOptions): Promise<PerplexityResponse> {
    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Perplexity API error (${response.status}): ${errorText}`);
    }

    return response.json();
  }

  /**
   * OpenAI-compatible chat completions interface
   * Allows drop-in replacement of OpenAI client
   */
  get chat() {
    return {
      completions: {
        create: async (options: PerplexityCompletionOptions) => {
          return this.createChatCompletion(options);
        }
      }
    };
  }
}

/**
 * Create a Perplexity client instance
 */
export function createPerplexityClient(apiKey?: string): PerplexityClient {
  return new PerplexityClient(apiKey);
}

/**
 * Available Perplexity models
 */
export const PERPLEXITY_MODELS = {
  // Sonar models - optimized for online search and up-to-date information
  SONAR_SMALL: 'sonar', // 8B parameters
  SONAR_MEDIUM: 'sonar-pro', // More capable version

  // Reasoning models - optimized for complex reasoning
  SONAR_REASONING: 'sonar-reasoning',

  // Legacy/alternative names
  SONAR_SMALL_ONLINE: 'sonar',
  SONAR_MEDIUM_ONLINE: 'sonar-pro',
} as const;

/**
 * Default model for case plan generation
 * Using sonar (8B) for cost-effectiveness and speed
 */
export const DEFAULT_MODEL = PERPLEXITY_MODELS.SONAR_SMALL;
