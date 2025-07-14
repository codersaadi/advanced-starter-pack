import { TokenLimitChecker } from '../token-limiter';
import type {
  AIProvider,
  TranslationRequest,
  TranslationResponse,
} from '../types';

// AI Provider implementations
export class GeminiProvider implements AIProvider {
  name = 'gemini';
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  private client: any;
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  private model: any;

  constructor(apiKey: string, modelName: string, temperature: number) {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    this.client = new GoogleGenerativeAI(apiKey);
    this.model = this.client.getGenerativeModel({ model: modelName });
  }

  async translate(request: TranslationRequest): Promise<TranslationResponse> {
    const prompt = this.buildPrompt(request);

    try {
      const result = await this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          topK: 1,
          topP: 0.95,
          maxOutputTokens: 8192,
          responseMimeType:
            request.format === 'json' ? 'application/json' : 'text/plain',
        },
        safetySettings: [],
      });

      const responseText = result.response.text().trim();

      // Validate JSON if expected
      if (request.format === 'json') {
        JSON.parse(responseText);
      }

      return {
        translatedContent: responseText,
        success: true,
        tokensUsed: TokenLimitChecker.estimateTokens(responseText),
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
  Translate the following content from ${sourceLocale} to ${targetLocale}.
  
  CRITICAL RULES:
  1. Preserve ALL ICU placeholders (e.g., {{var}}) and HTML-like tags (e.g., <bold>) EXACTLY.
  2. Maintain professional, accurate translations.
  3. If content appears to be a placeholder or simple tag, return it UNCHANGED.
      `;

    switch (format) {
      case 'json':
        return `${baseInstructions}
  4. Return ONLY a valid JSON object with IDENTICAL structure (keys, nesting).
  5. Translate ONLY string values. Preserve keys, numbers, booleans, nulls.
  6. Do NOT include markdown code blocks.
  
  ${context ? `Context: ${context}\n` : ''}
  
  Source JSON (${sourceLocale}):
  \`\`\`json
  ${content}
  \`\`\`
  
  Translated JSON (${targetLocale}):`;

      case 'array':
        return `${baseInstructions}
  4. Return a valid JSON array of strings with exactly the same number of elements.
  5. Each element should be the translation of the corresponding input element.
  
  ${context ? `Context: ${context}\n` : ''}
  
  Input: ${content}
  Output (JSON Array):`;

      default:
        return `${baseInstructions}
  ${context ? `Context: ${context}\n` : ''}
  
  Text to translate: ${content}
  Translation:`;
    }
  }
}
