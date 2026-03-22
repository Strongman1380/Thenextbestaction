import Anthropic from '@anthropic-ai/sdk';

export const MODEL = 'claude-3-5-sonnet-20241022';

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});
