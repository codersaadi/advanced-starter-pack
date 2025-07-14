// Token limit checker
// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class TokenLimitChecker {
  private static readonly TOKEN_LIMITS = {
    gemini: 1000000,
    openai: 128000,
    anthropic: 200000,
  };

  static estimateTokens(text: string): number {
    // Rough estimation: 1 token ≈ 4 characters for English
    return Math.ceil(text.length / 4);
  }

  static checkTokenLimit(text: string, provider: string): boolean {
    // biome-ignore lint/complexity/noThisInStatic: <explanation>
    const estimatedTokens = this.estimateTokens(text);
    const limit =
      TokenLimitChecker.TOKEN_LIMITS[
        provider.toLowerCase() as keyof typeof this.TOKEN_LIMITS
      ] || 100000;
    return estimatedTokens <= limit * 0.8; // Use 80% of limit for safety
  }

  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: <explanation>
  static splitContent(
    content: string,
    provider: string,
    maxChunks = 10
  ): string[] {
    const limit =
      // biome-ignore lint/complexity/noThisInStatic: <explanation>
      this.TOKEN_LIMITS[
        provider.toLowerCase() as keyof typeof this.TOKEN_LIMITS
      ] || 100000;
    const maxCharsPerChunk = Math.floor(limit * 0.6 * 4); // 60% of limit, 4 chars per token

    if (content.length <= maxCharsPerChunk) {
      return [content];
    }

    const chunks: string[] = [];
    let currentChunk = '';
    const lines = content.split('\n');

    for (const line of lines) {
      if (currentChunk.length + line.length + 1 > maxCharsPerChunk) {
        if (currentChunk) {
          chunks.push(currentChunk);
          currentChunk = '';
        }

        if (line.length > maxCharsPerChunk) {
          // Split very long lines
          const subChunks =
            line.match(new RegExp(`.{1,${maxCharsPerChunk}}`, 'g')) || [];
          chunks.push(...subChunks);
        } else {
          currentChunk = line;
        }
      } else {
        currentChunk += (currentChunk ? '\n' : '') + line;
      }
    }

    if (currentChunk) {
      chunks.push(currentChunk);
    }

    return chunks.slice(0, maxChunks);
  }
}
