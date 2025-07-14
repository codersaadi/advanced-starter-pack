// Enhanced error handling
export class TranslationError extends Error {
  constructor(
    message: string,
    public readonly provider: string,
    public readonly locale: string,
    public readonly namespace: string,
    public readonly retryable: boolean = true
  ) {
    super(message);
    this.name = 'TranslationError';
  }
}
