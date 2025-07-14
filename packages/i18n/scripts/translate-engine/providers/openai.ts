import type {
  AIProvider,
  TranslationRequest,
  TranslationResponse,
} from '../types';

export class OpenAIProvider implements AIProvider {
  name = 'openai';
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  private client: any;
  private model: string;

  constructor(apiKey: string, model = 'gpt-4o-mini') {
    const { OpenAI } = require('openai');
    this.client = new OpenAI({ apiKey });
    this.model = model;
  }

  async translate(request: TranslationRequest): Promise<TranslationResponse> {
    const prompt = this.buildPrompt(request);

    try {
      const completion = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content:
              'You are a professional translator. Follow the instructions precisely.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 8192,
        response_format:
          request.format === 'json' ? { type: 'json_object' } : undefined,
      });

      const responseText =
        completion.choices[0]?.message?.content?.trim() || '';

      // Validate JSON if expected
      if (request.format === 'json') {
        JSON.parse(responseText);
      }

      return {
        translatedContent: responseText,
        success: true,
        tokensUsed: completion.usage?.total_tokens || 0,
      };
    } catch (error) {
      return {
        translatedContent: '',
        success: false,
        error: (error as Error).message,
      };
    }
  }

  private buildPrompt(request: TranslationRequest): string {
    const { content, sourceLocale, targetLocale, context, format } = request;

    const baseInstructions = `
      Translate from ${sourceLocale} to ${targetLocale}.
      
      RULES:
      1. Preserve ALL ICU placeholders ({{var}}) and HTML tags exactly
      2. Maintain structure and formatting
      3. Return professional, accurate translations
          `;

    switch (format) {
      case 'json':
        return `${baseInstructions}
      4. Return valid JSON with identical structure
      5. Translate only string values, preserve keys/numbers/booleans
      
      ${context ? `Context: ${context}\n` : ''}
      
      Source: ${content}`;

      case 'array':
        return `${baseInstructions}
      4. Return JSON array with same number of elements
      
      ${context ? `Context: ${context}\n` : ''}
      
      Input: ${content}`;

      default:
        return `${baseInstructions}
      ${context ? `Context: ${context}\n` : ''}
      
      Text: ${content}`;
    }
  }
}
