import type {
  AIProvider,
  TranslationRequest,
  TranslationResponse,
} from '../types';

export class AnthropicProvider implements AIProvider {
  name = 'anthropic';
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  private client: any;
  private model: string;

  constructor(apiKey: string, model = 'claude-3-haiku-20240307') {
    const { Anthropic } = require('@anthropic-ai/sdk');
    this.client = new Anthropic({ apiKey });
    this.model = model;
  }

  async translate(request: TranslationRequest): Promise<TranslationResponse> {
    const prompt = this.buildPrompt(request);

    try {
      const message = await this.client.messages.create({
        model: this.model,
        max_tokens: 8192,
        temperature: 0.3,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const responseText = message.content[0]?.text?.trim() || '';

      // Validate JSON if expected
      if (request.format === 'json') {
        JSON.parse(responseText);
      }

      return {
        translatedContent: responseText,
        success: true,
        tokensUsed: message.usage?.output_tokens || 0,
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
    
    Important rules:
    - Preserve ALL ICU placeholders ({{var}}) and HTML tags exactly
    - Maintain structure and professional quality
    - If content is a placeholder/tag, return unchanged
        `;

    switch (format) {
      case 'json':
        return `${baseInstructions}
    - Return valid JSON with identical structure
    - Translate only string values
    
    ${context ? `Context: ${context}\n` : ''}
    
    Source JSON: ${content}`;

      case 'array':
        return `${baseInstructions}
    - Return JSON array with same element count
    
    ${context ? `Context: ${context}\n` : ''}
    
    Input: ${content}`;

      default:
        return `${baseInstructions}
    ${context ? `Context: ${context}\n` : ''}
    
    Text: ${content}`;
    }
  }
}
