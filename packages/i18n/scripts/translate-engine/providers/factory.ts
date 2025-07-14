// Provider Factory

import type { AIProvider, TranslationConfig } from '../types';
import { AnthropicProvider } from './anthropic';
import { GeminiProvider } from './gemini';
import { OpenAIProvider } from './openai';

// biome-ignore lint/complexity/noStaticOnlyClass:
export class AIProviderFactory {
  static createProvider(config: TranslationConfig): AIProvider {
    switch (config.provider.toLowerCase()) {
      case 'gemini':
        return new GeminiProvider(
          config.apiKey,
          config.modelName,
          config.temperature
        );
      case 'openai':
        return new OpenAIProvider(config.apiKey, config.modelName);
      case 'anthropic':
        return new AnthropicProvider(config.apiKey, config.modelName);
      default:
        throw new Error(`Unsupported AI provider: ${config.provider}`);
    }
  }
}
